export interface AbstractConnectorArguments {
  supportedChainIds?: number[];
}

export interface ConnectorUpdate<T = number | string> {
  chainId?: T;
  account?: null | string;
  provider?: any;
}

export enum ConnectorEvent {
  Update = "Web3ReactUpdate",
  Error = "Web3ReactError",
  Deactivate = "Web3ReactDeactivate"
}

export interface Network {
  rpcUrls: string[];
  chainId: number;
  blockExplorerUrls: string[];
}

export interface NetworkWithInfo extends Network {
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  iconUrls?: string[]; // Currently ignored.
}
