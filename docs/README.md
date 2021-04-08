# `web3-react-multichain` Documentation

- [Overview](#overview)
- [Install](#install)
- [web3-react@core API Reference](#web3-reactcore-api-reference)
  - [Web3ReactProvider](#web3reactprovider)
    - [Props](#props)
    - [Example](#example)
  - [useWeb3React](#useweb3react)
    - [Arguments](#arguments)
    - [Example](#example-1)
  - [UnsupportedChainIdError](#unsupportedchainiderror)
    - [Example](#example-4)
- [Understanding Error Bubbling](#understanding-error-bubbling)

## Overview
At a high level, `web3-react-multichain` is a state machine which ensures that certain key pieces of data (the user's current account, for example) relevant to your dApp are kept up-to-date. To this end, `web3-react-multichain` uses [Context](https://reactjs.org/docs/context.html) to efficiently store this data, and inject it wherever you need it in your application.

The data conforms to the following interface where Web3Provider is an [ethers-js Web3Provider](https://docs.ethers.io/v5/api/providers/other/#Web3Provider):

```typescript
interface Web3ReactContextInterface<T = any> {
  activate: (
    connector: AbstractConnectorInterface,
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => Promise<void>

  currentChainId: number
  currentProvider?: Web3Provider
  getProvider: (chainId: number) => Promise<Web3Provider | undefined>
  connector?: AbstractConnectorInterface
  account?: null | string

  active: boolean
  error?: Error
}
```

The documentation that follows is for `@web3-react-multichain/core`, the package responsible for managing this context. To understand where the data itself comes from, head over to the [connectors/ folder](./connectors/).

## Install
- Grab a fresh copy of `react@>=16.8`...\
  `yarn add react`

- ...and then install `web3-react-multichain`\
  `yarn add @web3-react-multichain/core`

## `web3-react-multichain@core` API Reference

### Web3ReactProvider
`web3-react-multichain` relies on the existence of a `Web3ReactProvider` at the root of your application (or more accurately, at the root of the subtree which you'd like to have web3 functionality).

#### Example
```javascript
import { Web3ReactProvider } from '@web3-react-multichain/core'

function App () {
  return (
    <Web3ReactProvider>
      {/* <...> */}
    </Web3ReactProvider>
  )
}
```

### useWeb3React
If you're using Hooks (😇), useWeb3React will be your best friend. Call it from within any function component to access context variables, just like that.

#### Example
```javascript
import { useWeb3React } from '@web3-react-multichain/core'

function Component () {
  const web3React = useWeb3React()
  // ...
}
```

### UnsupportedChainIdError
This is an error which can be used to inform users that they're connected to an unsupported network.

#### Example
```javascript
import { UnsupportedChainIdError } from '@web3-react-multichain/core'
// ...

function Component () {
  const { error } = useWeb3React()
  const isUnsupportedChainIdError = error instanceof UnsupportedChainIdError
  // ...
}
```

## Understanding Error Bubbling
Errors that occur during the initial activation of a connector (i.e. inside activate), are are handled in 1 of 4 ways:

1) In the case where there's been 1 or more other updates to the `web3-react-multichain` context between when activate was called and when it resolved with the data required to complete the activation, errors are silently suppressed (in development mode, a warning will be logged to the console). This should really only happen in cases where activation takes a very long time and the user does something in the intervening time, such as activating another connector, deactivating the current connector, etc.
2) If `throwErrors` (the third argument to activate) is passed, errors will be thrown and should be handled in a .catch. No updates to the `web3-react-multichain` context will occur.
3) If `onError` (the second argument to activate) is passed, that function is called with the error. No updates to the `web3-react-multichain` context will occur.
4) Otherwise, the error will be set in the `web3-react-multichain` context (along with the connector).

Errors that occur while a connector is set are handled in 1 of 2 ways:

1) If an `onError` function was passed, this function is called with the error. No updates to the `web3-react-multichain` context will occur.
2) Otherwise, the error will be set in the `web3-react-multichain` context.

In all of these scenarios, note that calling setError will update the `web3-react-multichain` context. This can be called any time a connector is set, and it can be useful for e.g. manually triggering your app's handling of the `web3-react-multichain` error property.

Note: if an error is ever set in the `web3-react-multichain` context, and a connector triggers an update, the manager will attempt to revalidate all properties as if activate was called again, to recover from the error state.
