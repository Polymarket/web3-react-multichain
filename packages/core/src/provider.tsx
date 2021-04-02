import React, { createContext, useContext, useCallback, useMemo } from "react";
import invariant from "tiny-invariant";
import { Web3Provider } from "@ethersproject/providers";

import { Web3ReactContextInterface } from "./types";
import { useWeb3ReactManager } from "./manager";

const Web3ReactContext = createContext<Web3ReactContextInterface>({
  activate: async () => {
    invariant(false, "No <Web3ReactProvider ... /> found.");
  },
  setError: () => {
    invariant(false, "No <Web3ReactProvider ... /> found.");
  },
  deactivate: async () => {
    invariant(false, "No <Web3ReactProvider ... /> found.");
  },
  getProvider: async () => {
    invariant(false, "No <Web3ReactProvider ... /> found.");
  },
  active: false
});

export const Web3ReactProvider: React.FC = ({ children }) => {
  const {
    connector,
    account,

    activate,
    setError,
    deactivate,
    getUnderlyingProvider,
    underlyingProvider,
    currentChainId,

    error
  } = useWeb3ReactManager();

  const active = connector !== undefined && account !== undefined && !error;

  const getProvider = useCallback(async (chainId: number) => new Web3Provider(await getUnderlyingProvider(chainId)), [
    getUnderlyingProvider
  ]);

  const currentProvider = useMemo(
    () =>
      active && currentChainId !== undefined && Number.isInteger(currentChainId) && !!connector
        ? new Web3Provider(underlyingProvider)
        : undefined,
    [active, connector, currentChainId, underlyingProvider]
  );

  const web3ReactContext: Web3ReactContextInterface = {
    connector,

    account,
    currentProvider,
    currentChainId,

    getProvider,

    activate,
    setError,
    deactivate,

    active,
    error
  };

  return <Web3ReactContext.Provider value={web3ReactContext}>{children}</Web3ReactContext.Provider>;
};

export function useWeb3React(): Web3ReactContextInterface {
  return useContext(Web3ReactContext);
}
