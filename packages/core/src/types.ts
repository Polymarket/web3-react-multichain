import { AbstractConnector } from "@web3-react-multichain/abstract-connector";
import { Web3Provider } from "@ethersproject/providers";

type CommonFunctions = {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>;
  setError: (error: Error) => void;
  deactivate: () => Promise<void>;
};

export type Web3ReactManagerFunctions = CommonFunctions & {
  getUnderlyingProvider: (chainId: number) => Promise<any>;
};

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnector;
  account?: null | string;

  error?: Error;
  underlyingProvider?: any;
  currentChainId?: number;
}

export type Web3ReactContextInterface = CommonFunctions & {
  connector?: AbstractConnector;
  account?: null | string;

  active: boolean;
  error?: Error;

  currentProvider?: Web3Provider;
  currentChainId?: number;
  getProvider: (chainId: number) => Promise<Web3Provider | undefined>;
};
