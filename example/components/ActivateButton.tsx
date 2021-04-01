import React from 'react'
import { Spinner } from './Spinner'

function ActivateButton({ activating, connected, disabled, name, onClick }): JSX.Element {
  const handleClick = () => {
    onClick()
  }
  return (
    <button
      style={{
        height: '3rem',
        borderRadius: '1rem',
        borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
        cursor: disabled ? 'unset' : 'pointer',
        position: 'relative'
      }}
      disabled={disabled}
      key={name}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          color: 'black',
          margin: '0 0 0 1rem',
          minWidth: '100%'
        }}
      >
        {activating && <Spinner color="black" style={{ height: '25%', marginLeft: '-1rem' }} />}
        {connected && (
          <span role="img" aria-label="check">
            ✅
          </span>
        )}
      </div>
      {name}
    </button>
  )
}

export default ActivateButton
