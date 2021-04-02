import React from 'react'
import { useWeb3React } from '@web3-react-multichain/core'
import { formatEther } from '@ethersproject/units'

function Balance({ chainId }): JSX.Element {
  const { account, getProvider, active } = useWeb3React()

  const [balance, setBalance] = React.useState()

  const fetchBalance = React.useCallback(async () => {
    const provider = await getProvider(chainId)

    const balance = await provider.getBalance(account)
    setBalance(balance)
  }, [setBalance, getProvider, chainId, account])

  return (
    <div style={{ display: 'flex' }}>
      <span>Balance</span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>{balance === null ? 'Error' : balance ? `Ξ${formatEther(balance)}` : ''}</span>
      {active && (
        <button style={{ border: '1px solid black' }} onClick={fetchBalance}>
          Refresh
        </button>
      )}
    </div>
  )
}

export default Balance
