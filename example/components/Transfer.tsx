import React from 'react'
import { useWeb3React } from '@web3-react-multichain/core'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { isAddress } from '@ethersproject/address'

import Balance from './Balance'
import { Spinner } from './Spinner'

const DECIMALS = 18

const Transfer = ({ chainId }): JSX.Element => {
  const { getProvider } = useWeb3React()

  const [recipient, setRecipient] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)
  const [amount, setAmount] = React.useState<string>('')
  const sendAmount: BigNumber = parseUnits(amount || '0', DECIMALS)

  const onChangeAmount = (newValue: string) => {
    if (newValue === '') setAmount(newValue)
    try {
      // Throws if user has input an invalid amount
      parseUnits(newValue, DECIMALS)
      setAmount(newValue)
    } catch {
      // remove any decimals after the 6th
      const trimmedString = newValue.slice(0, newValue.indexOf('.') + DECIMALS + 1)
      setAmount(trimmedString)
    }
  }

  const submitTransfer = async () => {
    if (!isAddress(recipient)) {
      alert('recipient is not a valid address')
      return
    }
    if (sendAmount.isZero()) {
      alert('sendAmount cannot be 0')
      return
    }

    setLoading(true)

    const provider = await getProvider(chainId)
    const signer = provider.getSigner()

    const receipt = await signer.sendTransaction({
      to: recipient,
      value: sendAmount
    })

    setLoading(false)

    alert('Success! ', receipt.hash)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>Transfer on network {chainId}</h1>
      <Balance chainId={chainId} />
      <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="recipient" />
      <input value={amount} onChange={e => onChangeAmount(e.target.value)} placeholder="amount" />
      <button style={{ width: '100%', height: '2em' }} onClick={submitTransfer} label="submitTransfer">
        {loading && <Spinner color="black" style={{ height: '25%', marginLeft: '-1rem' }} />}
        Submit
      </button>
    </div>
  )
}

export default Transfer
