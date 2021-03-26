import { useReducer, useEffect, useCallback, useRef } from 'react'
import { ConnectorUpdate, ConnectorEvent } from '@web3-react-multichain/types'
import { AbstractConnector } from '@web3-react-multichain/abstract-connector'
import warning from 'tiny-warning'

import { Web3ReactManagerReturn } from './types'
import { normalizeAccount, normalizeChainId } from './normalizers'

class StaleConnectorError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
  }
}

export class UnsupportedChainIdError extends Error {
  public constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]) {
    super()
    this.name = this.constructor.name
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`
  }
}

interface Web3ReactManagerState {
  connector?: AbstractConnector
  account?: null | string

  onError?: (error: Error) => void

  error?: Error
}

enum ActionType {
  ACTIVATE_CONNECTOR,
  UPDATE,
  UPDATE_FROM_ERROR,
  ERROR,
  ERROR_FROM_ACTIVATION,
  DEACTIVATE_CONNECTOR
}

interface Action {
  type: ActionType
  payload?: any
}

function reducer(state: Web3ReactManagerState, { type, payload }: Action): Web3ReactManagerState {
  switch (type) {
    case ActionType.ACTIVATE_CONNECTOR: {
      const { connector, account, onError } = payload
      return { connector, account, onError }
    }
    case ActionType.UPDATE: {
      const { account } = payload
      return {
        ...state,
        ...(account === undefined ? {} : { account })
      }
    }
    case ActionType.UPDATE_FROM_ERROR: {
      const { account } = payload
      return {
        ...state,
        ...(account === undefined ? {} : { account }),
        error: undefined
      }
    }
    case ActionType.ERROR: {
      const { error } = payload
      const { connector, onError } = state
      return {
        connector,
        error,
        onError
      }
    }
    case ActionType.ERROR_FROM_ACTIVATION: {
      const { connector, error } = payload
      return {
        connector,
        error
      }
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return {}
    }
  }
}

async function augmentConnectorUpdate(
  connector: AbstractConnector,
  update: ConnectorUpdate
): Promise<ConnectorUpdate<number>> {
  const _account = (
    update.account === undefined ? await connector.getAccount() : update.account
  ) as Required<ConnectorUpdate>['account']

  const account = _account === null ? _account : normalizeAccount(_account)

  return { account }
}

export function useWeb3ReactManager(): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, {})
  const { connector, account, onError, error } = state

  const updateBusterRef = useRef(-1)
  updateBusterRef.current += 1

  const activate = useCallback(
    async (
      connector: AbstractConnector,
      onError?: (error: Error) => void,
      throwErrors: boolean = false
    ): Promise<string | undefined> => {
      const updateBusterInitial = updateBusterRef.current

      let activated = false
      try {
        const update = await connector.activate().then(
          (update): ConnectorUpdate => {
            activated = true
            return update
          }
        )

        const augmentedUpdate = await augmentConnectorUpdate(connector, update)

        if (updateBusterRef.current > updateBusterInitial) {
          throw new StaleConnectorError()
        }
        dispatch({ type: ActionType.ACTIVATE_CONNECTOR, payload: { connector, ...augmentedUpdate, onError } })

        return update.authToken
      } catch (error) {
        if (error instanceof StaleConnectorError) {
          activated && connector.deactivate()
          warning(false, `Suppressed stale connector activation ${connector}`)
        } else if (throwErrors) {
          activated && connector.deactivate()
          throw error
        } else if (onError) {
          activated && connector.deactivate()
          onError(error)
        } else {
          // we don't call activated && connector.deactivate() here because it'll be handled in the useEffect
          dispatch({ type: ActionType.ERROR_FROM_ACTIVATION, payload: { connector, error } })
        }

        return
      }
    },
    []
  )

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } })
  }, [])

  const deactivate = useCallback(async (): Promise<void> => {
    if (!connector) {
      throw Error("web3-react must be active to deactivate");
    }

    await connector.deactivate();
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [])

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      if (!connector) {
        throw Error("This should never happen, it's just so Typescript stops complaining")
      }

      const updateBusterInitial = updateBusterRef.current

      // updates are handled differently depending on whether the connector is active vs in an error state
      if (!error) {
        const chainId = update.chainId === undefined ? undefined : normalizeChainId(update.chainId)
        if (chainId !== undefined && !!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
          const error = new UnsupportedChainIdError(chainId, connector.supportedChainIds)
          onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
        } else {
          const account = typeof update.account === 'string' ? normalizeAccount(update.account) : update.account
          dispatch({ type: ActionType.UPDATE, payload: { chainId, account } })
        }
      } else {
        try {
          const augmentedUpdate = await augmentConnectorUpdate(connector, update)

          if (updateBusterRef.current > updateBusterInitial) {
            throw new StaleConnectorError()
          }
          dispatch({ type: ActionType.UPDATE_FROM_ERROR, payload: augmentedUpdate })
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            warning(false, `Suppressed stale connector update from error state ${connector} ${update}`)
          } else {
            // though we don't have to, we're re-circulating the new error
            onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
          }
        }
      }
    },
    [connector, error, onError]
  )
  const handleError = useCallback(
    (error: Error): void => {
      onError ? onError(error) : dispatch({ type: ActionType.ERROR, payload: { error } })
    },
    [onError]
  )
  const handleDeactivate = useCallback(async (): Promise<void> => {
    if (connector) {
      await connector.deactivate()
    }
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR })
  }, [connector])

  // ensure that connectors which were set are deactivated
  useEffect((): (() => void) => {
    return () => {
      if (connector) {
        connector.deactivate()
      }
    }
  }, [connector])

  // ensure that events emitted from the set connector are handled appropriately
  useEffect((): (() => void) => {
    if (connector) {
      connector
        .on(ConnectorEvent.Update, handleUpdate)
        .on(ConnectorEvent.Error, handleError)
        .on(ConnectorEvent.Deactivate, handleDeactivate)
    }

    return () => {
      if (connector) {
        connector
          .off(ConnectorEvent.Update, handleUpdate)
          .off(ConnectorEvent.Error, handleError)
          .off(ConnectorEvent.Deactivate, handleDeactivate)
      }
    }
  }, [connector, handleUpdate, handleError, handleDeactivate])

  return { connector, account, activate, setError, deactivate, error }
}
