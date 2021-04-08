import { ConnectorUpdate, NetworkWithInfo } from "@web3-react-multichain/types";
import { AbstractConnector } from "@web3-react-multichain/abstract-connector";
import warning from "tiny-warning";
import { BigNumber } from "@ethersproject/bignumber";

import { SendReturnResult, SendReturn, SendOld, Request } from "./types";
import { normalizeChainId } from "./normalizers";

interface Ethereum {
  send: unknown;
  enable: () => Promise<string[]>;
  on?: (method: string, listener: (...args: any[]) => void) => void;
  removeListener?: (method: string, listener: (...args: any[]) => void) => void;
  request: unknown;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

declare const __DEV__: boolean;

interface InjectedConnectorArguments {
  networks: NetworkWithInfo[];
}

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty("result") ? sendReturn.result : sendReturn;  // eslint-disable-line
}

export class NoEthereumProviderError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "No Ethereum provider was found on window.ethereum.";
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "The user rejected the request.";
  }
}

export class AddDefaultChainError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "MetaMask does not switching to a default Chain. Tell the user to manually switch instead.";
  }
}

export class InjectedConnector extends AbstractConnector {
  private readonly networks: NetworkWithInfo[];

  constructor({ networks }: InjectedConnectorArguments) {
    super({ supportedChainIds: networks.map(({ chainId }) => chainId) });

    this.networks = networks;
    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }
    this.emitUpdate({ chainId, provider: window.ethereum as any });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason);
    }
    this.emitDeactivate();
  }

  private handleNetworkChanged(networkId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }
    this.emitUpdate({ chainId: networkId, provider: window.ethereum });
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError();
    }

    if (window.ethereum.on) {
      window.ethereum.on("chainChanged", this.handleChainChanged);
      window.ethereum.on("accountsChanged", this.handleAccountsChanged);
      window.ethereum.on("close", this.handleClose);
      window.ethereum.on("networkChanged", this.handleNetworkChanged);
    }

    if ((window.ethereum as any).isMetaMask) {
      (window.ethereum as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await (window.ethereum.request as Request)({ method: "eth_requestAccounts" }).then(
        sendReturn => parseSendReturn(sendReturn)[0]
      );
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
      warning(false, "eth_requestAccounts was unsuccessful, falling back to enable");
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await window.ethereum.enable().then(sendReturn => sendReturn && parseSendReturn(sendReturn)[0]);
    }

    return { provider: window.ethereum, ...(account ? { account } : {}) };
  }

  public async getProvider(chainId: number): Promise<any> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError();
    }

    const currentChainId = normalizeChainId(await this.getChainId());
    if (currentChainId === chainId) {
      return window.ethereum;
    }

    const network = this.networks.find(n => n.chainId === chainId);

    if (!network) {
      throw new Error(
        `Network with chainId ${chainId} not found. Pass in the network to the constructor of InjectedConnector.`
      );
    }

    // MetaMask doesn't support calling `wallet_addEthereumChain` with a default chain
    if ([1, 3, 4, 5, 42].includes(network.chainId)) {
      throw new AddDefaultChainError();
    }

    const chainIdHex = BigNumber.from(network.chainId).toHexString();

    try {
      await (window.ethereum.request as Request)({
        method: "wallet_addEthereumChain",
        params: [{ ...network, chainId: chainIdHex }]
      });
    } catch (e) {
      if (/Chain ID returned by RPC URL/.test((e as any).message)) {
        throw new Error(
          "RPC endpoint returns a different chain ID when eth_chainId is called. Please check your network configs."
        );
      } else if (/Request for method/.test((e as any).message)) {
        throw new Error(
          "Request for method `eth_chainId failed`. Please check your rpcUrls field in your network configs."
        );
      } else if ((e as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
    }

    return window.ethereum;
  }

  public async getChainId(): Promise<number | string> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError();
    }

    let chainId;
    try {
      chainId = await (window.ethereum.request as Request)({ method: "eth_chainId" }).then(parseSendReturn);
    } catch {
      warning(false, "eth_chainId was unsuccessful, falling back to net_version");
    }

    if (!chainId) {
      try {
        chainId = await (window.ethereum.request as Request)({ method: "net_version" }).then(parseSendReturn);
      } catch {
        warning(false, "net_version was unsuccessful, falling back to net version v2");
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn((window.ethereum.send as SendOld)({ method: "net_version" }));
      } catch {
        warning(false, "net_version v2 was unsuccessful, falling back to manual matches and static properties");
      }
    }

    if (!chainId) {
      if ((window.ethereum as any).isDapper) {
        chainId = parseSendReturn((window.ethereum as any).cachedResults.net_version);
      } else {
        chainId =
          (window.ethereum as any).chainId ||
          (window.ethereum as any).netVersion ||
          (window.ethereum as any).networkVersion ||
          (window.ethereum as any)._chainId;
      }
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError();
    }

    let account;
    try {
      account = await (window.ethereum.request as Request)({ method: "eth_accounts" }).then(
        sendReturn => parseSendReturn(sendReturn)[0]
      );
    } catch {
      warning(false, "eth_accounts was unsuccessful, falling back to enable");
    }

    if (!account) {
      try {
        account = await window.ethereum.enable().then(sendReturn => parseSendReturn(sendReturn)[0]);
      } catch {
        warning(false, "enable was unsuccessful, falling back to eth_accounts v2");
      }
    }

    if (!account) {
      account = parseSendReturn((window.ethereum.send as SendOld)({ method: "eth_accounts" }))[0];
    }

    return account;
  }

  public async deactivate() {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener("chainChanged", this.handleChainChanged);
      window.ethereum.removeListener("accountsChanged", this.handleAccountsChanged);
      window.ethereum.removeListener("close", this.handleClose);
      window.ethereum.removeListener("networkChanged", this.handleNetworkChanged);
    }
  }

  static async isAuthorized(): Promise<boolean> {
    if (!window.ethereum) {
      return false;
    }

    try {
      return await (window.ethereum.request as Request)({ method: "eth_accounts" }).then(sendReturn => {
        if (parseSendReturn(sendReturn).length > 0) {
          return true;
        }
        return false;
      });
    } catch {
      return false;
    }
  }
}
