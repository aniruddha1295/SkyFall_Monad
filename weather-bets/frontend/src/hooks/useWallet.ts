import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { MONAD_CHAIN_ID, MONAD_NETWORK_CONFIG } from "../config/contract";
import type { WalletState } from "../types";

const initialState: WalletState = {
  address: null,
  balance: null,
  signer: null,
  provider: null,
  chainId: null,
  isConnected: false,
  isCorrectNetwork: false,
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const [isConnecting, setIsConnecting] = useState(false);

  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  const updateWalletState = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isCorrectNetwork = chainId === MONAD_CHAIN_ID;

      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        setWallet(initialState);
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balanceWei = await provider.getBalance(address);
      const balance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

      setWallet({
        address,
        balance,
        signer,
        provider,
        chainId,
        isConnected: true,
        isCorrectNetwork,
      });
    } catch {
      setWallet(initialState);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) return;
    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== MONAD_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_NETWORK_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MONAD_NETWORK_CONFIG],
            });
          }
        }
      }
      await updateWalletState();
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletState]);

  const disconnect = useCallback(() => {
    setWallet(initialState);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    updateWalletState();
    const handleAccountsChanged = () => updateWalletState();
    const handleChainChanged = () => updateWalletState();
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [updateWalletState]);

  return { wallet, connect, disconnect, isConnecting, hasMetaMask };
}
