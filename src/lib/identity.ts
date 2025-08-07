'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet } from './types';

// Simple wallet connection state management
const WALLET_STORAGE_KEY = 'kleo_wallet_connection';

interface StoredWallet {
  address: string;
  type: "EVM" | "XRPL";
  ensName?: string;
}

export function useWallet(): Wallet {
  const [address, setAddress] = useState<string>('');
  const [type, setType] = useState<"EVM" | "XRPL">("EVM");
  const [ensName, setEnsName] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Load wallet state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        try {
          const wallet: StoredWallet = JSON.parse(stored);
          setAddress(wallet.address);
          setType(wallet.type);
          setEnsName(wallet.ensName || '');
          setIsConnected(true);
        } catch (error) {
          console.error('Error loading wallet state:', error);
        }
      }
    }
  }, []);

  // Save wallet state to localStorage
  const saveWalletState = useCallback((wallet: StoredWallet) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    }
  }, []);

  // Clear wallet state from localStorage
  const clearWalletState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum) {
        const ethereum = (window as unknown as { ethereum: {
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        } }).ethereum;
        
        // Request account access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          setAddress(walletAddress);
          setType("EVM");
          setIsConnected(true);

          // Try to resolve ENS name
          let ensName: string | undefined;
          try {
            const ensResult = await ethereum.request({
              method: 'eth_call',
              params: [{
                to: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41', // ENS resolver
                data: `0x691f3431${walletAddress.slice(2).padStart(64, '0')}`
              }]
            }) as string;
            if (ensResult && ensResult !== '0x') {
              ensName = ensResult;
            }
          } catch {
            console.log('ENS resolution failed, using address only');
          }

          // Save to localStorage
          saveWalletState({
            address: walletAddress,
            type: "EVM",
            ensName
          });

          return true;
        } else {
          throw new Error('No accounts found');
        }
      } else {
        throw new Error('MetaMask not found. Please install MetaMask to connect your wallet.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Show user-friendly error message
      alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [saveWalletState]);

  const disconnect = useCallback(() => {
    setAddress('');
    setType("EVM");
    setEnsName('');
    setIsConnected(false);
    clearWalletState();
  }, [clearWalletState]);

  return {
    address,
    type,
    ensName,
    isConnected,
    connect,
    disconnect
  };
}

// Utility function to get wallet display name
export function getWalletDisplayName(wallet: Wallet): string {
  if (wallet.ensName) {
    return wallet.ensName;
  }
  if (wallet.address) {
    return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  }
  return 'Anonymous';
}

// Utility function to get wallet type display
export function getWalletTypeDisplay(wallet: Wallet): string {
  switch (wallet.type) {
    case "EVM":
      return "Ethereum";
    case "XRPL":
      return "XRPL";
    default:
      return "Unknown";
  }
} 