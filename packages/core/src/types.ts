import { AbstractConnector } from "@web3-react-multichain/abstract-connector";
import { Web3Provider } from "@ethersproject/providers";

export interface Web3ReactManagerFunctions {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>;
  setError: (error: Error) => void;
  deactivate: () => Promise<void>;
  getProvider: (chainId: number) => Promise<Web3Provider>;
}

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnector;
  account?: null | string;

  error?: Error;
  currentProvider?: Web3Provider;
  currentChainId?: number;
}

export interface Web3ReactContextInterface extends Web3ReactManagerFunctions {
  connector?: AbstractConnector;
  account?: null | string;

  active: boolean;
  error?: Error;

  currentProvider?: Web3Provider;
  currentChainId?: number;
}
