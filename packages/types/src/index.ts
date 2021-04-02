import { Web3Provider } from "@ethersproject/providers";

export interface AbstractConnectorArguments {
  supportedChainIds?: number[];
}

export interface ConnectorUpdate<T = number | string> {
  chainId?: T;
  account?: null | string;
  provider?: Web3Provider;
}

export enum ConnectorEvent {
  Update = "Web3ReactUpdate",
  Error = "Web3ReactError",
  Deactivate = "Web3ReactDeactivate"
}

export interface Network {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
}
