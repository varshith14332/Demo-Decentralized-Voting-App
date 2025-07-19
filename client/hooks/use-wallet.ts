import { useState, useEffect } from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (accounts: string[]) => void) => void;
      removeListener: (
        eventName: string,
        handler: (accounts: string[]) => void,
      ) => void;
      isMetaMask?: boolean;
    };
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            address: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
          }));
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      };
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) {
      setState((prev) => ({ ...prev, error: "MetaMask is not installed" }));
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
          error: null,
        }));
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error:
          "MetaMask is not installed. Please install MetaMask to continue.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
          isConnecting: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "No accounts found. Please check your MetaMask.",
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }));
    }
  };

  const disconnectWallet = () => {
    setState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    });
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    checkConnection,
  };
}
