import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3Provider } from '@ethersproject/providers'

export interface Web3ReactManagerFunctions {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<string | undefined>
  setError: (error: Error) => void
  deactivate: () => void
}

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnector
  chainId?: number
  account?: null | string

  error?: Error
}

export interface Web3ReactContextInterface<T = any> extends Web3ReactManagerFunctions {
  getProvider: (chainId: number) => Promise<Web3Provider>;
  connector?: AbstractConnector
  chainId?: number
  account?: null | string

  active: boolean
  error?: Error
}
