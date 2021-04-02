import React from 'react'
import { useWeb3React } from '@web3-react-multichain/core'
import { formatEther } from '@ethersproject/units'

function Balance({ chainId }): JSX.Element {
  const { account, getProvider } = useWeb3React()

  const [balance, setBalance] = React.useState()
  React.useEffect(() => {
    if (account) {
      let stale = false
      ;(async () => {
        const provider = await getProvider(chainId)

        try {
          const balance = await provider.getBalance(account)
          if (!stale) {
            setBalance(balance)
          }
        } catch (e) {
          if (!stale) {
            setBalance(null)
          }
        }
      })()

      return (): void => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, getProvider, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Balance</span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>{balance === null ? 'Error' : balance ? `Ξ${formatEther(balance)}` : ''}</span>
    </>
  )
}

export default Balance
