'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { useState, useEffect, useMemo } from 'react';
import { dynamicAuthService } from '@/lib/dynamic-auth';
import { Wallet } from '@/lib/types';

export function useDynamicWallet() {
  const ctx = useDynamicContext() as unknown as {
    user?: { id: string; email?: string; verifiedCredentials?: Array<{ type?: string; value?: string }> };
    primaryWallet?: { address: string; chain?: string };
    handleLogOut?: () => void;
  };
  const user = ctx.user;
  const primaryWallet = ctx.primaryWallet;
  const handleLogOut = useMemo(() => (ctx.handleLogOut || (() => {})), [ctx]);
  const isLoggedIn = !!user && !!primaryWallet;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic-authenticated wallet path
  useEffect(() => {
    let done = false;
    const applyDynamic = () => {
      if (isLoggedIn && user && primaryWallet) {
        const walletData = {
          address: primaryWallet.address,
          chain: primaryWallet.chain,
          ensName: user.verifiedCredentials?.find((cred) => cred.type === 'ens')?.value,
          email: user.email,
          userId: user.id
        };
        const { wallet } = dynamicAuthService.handleWalletConnection(walletData);
        const compatibleWallet: Wallet = {
          address: wallet.address,
          type: wallet.type,
          ensName: wallet.ensName,
          isConnected: true,
          connect: async () => true,
          disconnect: () => {
            handleLogOut();
            dynamicAuthService.handleWalletDisconnection();
            setWallet(null);
          }
        };
        setWallet(compatibleWallet);
        done = true;
      } else if (!isLoggedIn) {
        dynamicAuthService.handleWalletDisconnection();
        setWallet(null);
      }
    };

    applyDynamic();
    setIsLoading(false);

    return () => {
      if (!done) return;
    };
  }, [isLoggedIn, user, primaryWallet, handleLogOut]);

  // Fallback: local EVM (XRPL EVM) connection set by MetaMask path
  useEffect(() => {
    if (isLoggedIn) return; // Dynamic path already handled

    const readLocal = () => {
      try {
        const w = (window as any).local_xrpl_wallet as { address?: string; type?: string; isConnected?: boolean } | undefined;
        if (w && w.address && w.isConnected) {
          setWallet({
            address: w.address,
            type: (w.type as Wallet['type']) || 'EVM',
            isConnected: true,
            connect: async () => true,
            disconnect: () => {
              try { (window as any).local_xrpl_wallet = undefined; } catch {}
              setWallet(null);
            },
          });
          return;
        }
        // If no fallback present, don't overwrite an existing wallet
        if (!w && wallet && wallet.isConnected) return;
        if (!w) setWallet(null);
      } catch {}
    };

    readLocal();
    // Re-check on focus and on interval briefly to catch MetaMask state changes
    const onFocus = () => readLocal();
    const iv = window.setInterval(readLocal, 1000);
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [isLoggedIn, wallet]);

  const connect = async () => {
    return true;
  };

  const disconnect = () => {
    handleLogOut();
    dynamicAuthService.handleWalletDisconnection();
    try { (window as any).local_xrpl_wallet = undefined; } catch {}
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