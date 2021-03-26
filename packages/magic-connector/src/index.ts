import { ConnectorUpdate, Network } from '@web3-react-multichain/types'
import { AbstractConnector } from '@web3-react-multichain/abstract-connector'
import invariant from 'tiny-invariant'
import { Web3Provider } from '@ethersproject/providers'

type NetworkName = 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'goerli' | 'matic' | 'mumbai'

const chainIdToNetwork: { [network: number]: NetworkName } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
  137: 'matic',
  80001: 'mumbai'
}

interface MagicConnectorArguments {
  apiKey: string
  networks: Network[]
  email: string
  endpoint: string
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class FailedVerificationError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The email verification failed.'
  }
}

export class MagicLinkRateLimitError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The Magic rate limit has been reached.'
  }
}

export class MagicLinkExpiredError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The Magic link has expired.'
  }
}

export class MagicConnector extends AbstractConnector {
  private readonly apiKey: string
  private readonly email: string
  private readonly networks: Network[]
  private readonly endpoint: string

  public magicInstances: Record<number, any>

  constructor({ apiKey, email, networks, endpoint }: MagicConnectorArguments) {
    networks.map(({ chainId }) =>
      invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)
    )
    invariant(email && email.includes('@'), `Invalid email: ${email}`)
    super({ supportedChainIds: networks.map(({ chainId }) => chainId) })

    this.networks = networks
    this.endpoint = endpoint
    this.apiKey = apiKey
    this.email = email
    this.magicInstances = {}
  }

  public getInitialInstance(): any {
    const instance = this.magicInstances[this.networks[0].chainId]
    invariant(!!instance, 'Unable to get magic instance before calling `activate`')
    return instance
  }

  public async activate(): Promise<ConnectorUpdate> {
    const MagicSDK = await import('magic-sdk').then(m => m?.default ?? m)
    const { Magic, RPCError, RPCErrorCode } = MagicSDK

    this.networks.forEach(network => {
      const instance = this.magicInstances[network.chainId]
      if (!instance) {
        this.magicInstances[network.chainId] = new Magic(this.apiKey, {
          network,
          endpoint: this.endpoint
        })
      }
    })

    const magic = this.getInitialInstance()

    const isLoggedIn = await magic.user.isLoggedIn()
    const loggedInEmail = isLoggedIn ? (await magic.user.getMetadata()).email : null

    if (isLoggedIn && loggedInEmail !== this.email) {
      await magic.user.logout()
    }

    let authToken
    if (!isLoggedIn) {
      try {
        authToken = await magic.auth.loginWithMagicLink({ email: this.email, showUI: false })
      } catch (err) {
        if (!(err instanceof RPCError)) {
          throw err
        }
        if (err.code === RPCErrorCode.MagicLinkFailedVerification) {
          throw new FailedVerificationError()
        }
        if (err.code === RPCErrorCode.MagicLinkExpired) {
          throw new MagicLinkExpiredError()
        }
        if (err.code === RPCErrorCode.MagicLinkRateLimited) {
          throw new MagicLinkRateLimitError()
        }
        // This error gets thrown when users close the login window.
        // -32603 = JSON-RPC InternalError
        if (err.code === -32603) {
          throw new UserRejectedRequestError()
        }
      }
    }

    const account = await magic.rpcProvider.enable().then((accounts: string[]): string => accounts[0])

    return { account, authToken }
  }

  public async getProvider(chainId: number): Promise<Web3Provider> {
    invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)

    const instance = this.magicInstances[chainId]
    invariant(!!instance, 'Unable to get provider before calling `activate`')

    return new Web3Provider(instance.rpcProvider as any)
  }

  public async getAccount(): Promise<null | string> {
    return this.getInitialInstance()
      .send('eth_accounts')
      .then((accounts: string[]): string => accounts[0])
  }

  public async deactivate() {
    await Promise.all(this.networks.map(network => this.magicInstances[network.chainId]?.user.logout()))
    this.emitDeactivate()
  }
}
