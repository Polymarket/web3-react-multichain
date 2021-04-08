# `web3-react-multichain` Documentation - Injected

- [Install](#install)
- [Arguments](#arguments)
- [Example](#example)
- [Errors](#errors)
  - [AddDefaultChainError](#adddefaultchainerror)
  - [NoEthereumProviderError](#noethereumprovidererror)
    - [Example](#example-1)
  - [UserRejectedRequestError](#userrejectedrequesterror)
    - [Example](#example-2)

## Install
`yarn add @web3-react-multichain/injected-connector`

## Arguments
```typescript
networks: NetworkWithInfo[];

// which is defined below
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
```

## Example
```javascript
import { InjectedConnector } from '@web3-react-multichain/injected-connector'

const networks = [
  {
    rpcUrls: [`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`],
    chainId: 1,
    blockExplorerUrls: ['https://etherscan.io'],
    chainName: 'Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    rpcUrls: [`https://rpc-mainnet.maticvigil.com/v1/${process.env.NEXT_PUBLIC_MATIC_VIGIL_API_KEY}`],
    chainId: 137,
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com'],
    chainName: 'Matic',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    }
  }
]

const injected = new InjectedConnector({ networks })
```

## Errors

### AddDefaultChainError
MetaMask throws an error when you call `wallet_addEthereumChain` with one of it's default chains as a parameter. `@web3-react-multichain/injected-connector` is using that rpc method under the hood for `getProvider` so you'll need to prompt users to change their network to a default chain manually.

### NoEthereumProviderError

#### Example
```javascript
import { NoEthereumProviderError } from '@web3-react-multichain/injected-connector'

function Component () {
  const { error } = useWeb3React()
  const isNoEthereumProviderError = error instanceof NoEthereumProviderError
  // ...
}
```

### UserRejectedRequestError

#### Example
```javascript
import { UserRejectedRequestError } from '@web3-react-multichain/injected-connector'

function Component () {
  const { error } = useWeb3React()
  const isUserRejectedRequestError = error instanceof UserRejectedRequestError
  // ...
}
```
