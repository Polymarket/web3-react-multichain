import React, { createContext, useContext } from "react";
import invariant from "tiny-invariant";

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
    getProvider,

    error
  } = useWeb3ReactManager();

  const active = connector !== undefined && account !== undefined && !error;

  const web3ReactContext: Web3ReactContextInterface = {
    connector,

    account,

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
