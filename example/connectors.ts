import { MagicConnector } from '@web3-react-multichain/magic-connector'
import { InjectedConnector } from '@web3-react-multichain/injected-connector'

const mainnets = [
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

const testnets = [
  {
    rpcUrls: [`https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`],
    chainId: 5,
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    chainName: 'Goerli',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  {
    rpcUrls: [`https://rpc-mumbai.maticvigil.com/v1/${process.env.NEXT_PUBLIC_MATIC_VIGIL_API_KEY}`],
    chainId: 80001,
    blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com'],
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    }
  }
]

export const networks = mainnets // process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? mainnets : testnets

export const magic = new MagicConnector({
  apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
  networks
})

export const injected = new InjectedConnector({ networks })

/*
const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  1: process.env.RPC_URL_1 as string,
  4: process.env.RPC_URL_4 as string
}

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  defaultChainId: 1
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'web3-react example'
})

export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234'
})

export const lattice = new LatticeConnector({
  chainId: 4,
  appName: 'web3-react',
  url: RPC_URLS[4],
})

export const frame = new FrameConnector({ supportedChainIds: [1] })

export const authereum = new AuthereumConnector({ chainId: 42 })

export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string, chainId: 4 })
*/

/*
export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string, networks: [1, 100] })

export const torus = new TorusConnector({ chainId: 1 })
*/
