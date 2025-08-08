'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { useState, useEffect } from 'react';
import { dynamicAuthService } from '@/lib/dynamic-auth';
import { Wallet } from '@/lib/types';

export function useDynamicWallet() {
  const { user, isLoggedIn, handleLogOut, primaryWallet } = useDynamicContext();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user && primaryWallet) {
      // Handle wallet connection through Dynamic
      const walletData = {
        address: primaryWallet.address,
        chain: primaryWallet.chain,
        ensName: user.verifiedCredentials?.find((cred: any) => cred.type === 'ens')?.value,
        email: user.email,
        userId: user.id
      };

      const { wallet } = dynamicAuthService.handleWalletConnection(walletData);
      
      // Convert to Wallet interface for compatibility
      const compatibleWallet: Wallet = {
        address: wallet.address,
        type: wallet.type,
        ensName: wallet.ensName,
        isConnected: true,
        connect: async () => true, // No-op for Dynamic
        disconnect: () => {
          handleLogOut();
          dynamicAuthService.handleWalletDisconnection();
          setWallet(null);
        }
      };

      setWallet(compatibleWallet);
    } else if (!isLoggedIn) {
      // Handle logout
      dynamicAuthService.handleWalletDisconnection();
      setWallet(null);
    }
    
    setIsLoading(false);
  }, [isLoggedIn, user, primaryWallet, handleLogOut]);

  const connect = async () => {
    // Dynamic handles the connection automatically
    // This is just for API compatibility
    return true;
  };

  const disconnect = () => {
    handleLogOut();
    dynamicAuthService.handleWalletDisconnection();
    setWallet(null);
  };

  return {
    wallet,
    isLoading,
    isConnected: !!wallet?.isConnected,
    connect,
    disconnect,
    user: dynamicAuthService.getCurrentUser()
  };
} 