import React from 'react'
import { useWeb3React } from '@web3-react-multichain/core'

function ChainId() {
  const { currentChainId } = useWeb3React()

  return (
    <>
      <span>Chain Id</span>
      <span role="img" aria-label="chain">
        ⛓
      </span>
      <span>{currentChainId ?? ''}</span>
    </>
  )
}

export default ChainId
