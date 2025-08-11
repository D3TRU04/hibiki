'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { dynamicAuthService } from '@/lib/dynamic-auth';
import { Wallet } from '@/lib/types';

export function useDynamicWallet() {
  const ctx = useDynamicContext() as unknown as {
    user?: { id: string; email?: string; verifiedCredentials?: Array<{ type?: string; value?: string }> };
    primaryWallet?: { address: string; chain?: string };
    handleLogOut?: () => void;
    isInitialized?: boolean;
    isConnecting?: boolean;
    setShowDynamicUserProfile?: () => void;
  };
  
  // All hooks must be called unconditionally
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  
  // Handle context availability
  const handleLogOut = useMemo(() => {
    if (!ctx) return () => {};
    return ctx.handleLogOut || (() => {});
  }, [ctx]);
  
  const user = ctx?.user;
  const primaryWallet = ctx?.primaryWallet;
  const isLoggedIn = !!user && !!primaryWallet;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Dynamic-authenticated wallet path
  useEffect(() => {
    if (!ctx) return; // No context available

    let done = false;
    let cancelled = false;
    const applyDynamic = () => {
      if (!isMountedRef.current || cancelled) return;

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
            if (isMountedRef.current) {
              setWallet(null);
            }
          }
        };

        if (isMountedRef.current) {
          setWallet(compatibleWallet);
        }
        done = true;
      } else if (!isLoggedIn) {
        dynamicAuthService.handleWalletDisconnection();
        if (isMountedRef.current) {
          setWallet(null);
        }
      }
    };

    const timer = setTimeout(() => {
      applyDynamic();
      if (isMountedRef.current && !cancelled) {
        setIsLoading(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isLoggedIn, user, primaryWallet, handleLogOut, ctx]);

  // Fallback: local EVM (XRPL EVM) connection set by MetaMask path
  useEffect(() => {
    if (isLoggedIn || !ctx) return; // Dynamic path already handled or no context

    const readLocal = () => {
      if (!isMountedRef.current) return;
      try {
        const w = (window as any).local_xrpl_wallet as { address?: string; type?: string; isConnected?: boolean } | undefined;
        const ls = typeof window !== 'undefined' ? localStorage.getItem('kleo_dynamic_wallet') : null;
        const parsed = ls ? JSON.parse(ls) as { address?: string; type?: string } : undefined;
        const addr = w?.address || parsed?.address;
        const typ = (w?.type as Wallet['type']) || (parsed?.type as Wallet['type']) || 'EVM';
        const isConn = !!w?.isConnected || !!addr;
        if (addr && isConn) {
          if (isMountedRef.current) {
            setWallet({
              address: addr,
              type: typ,
              isConnected: true,
              connect: async () => true,
              disconnect: () => {
                try { (window as any).local_xrpl_wallet = undefined; } catch {}
                try { localStorage.removeItem('kleo_dynamic_wallet'); } catch {}
                if (isMountedRef.current) {
                  setWallet(null);
                }
              },
            });
          }
          return;
        }
        if (!addr && isMountedRef.current) {
          setWallet(null);
        }
      } catch {}
    };

    readLocal();
    const onFocus = () => readLocal();
    const onCustom = () => readLocal();
    const onStorage = (e: StorageEvent) => { if (e.key === 'kleo_dynamic_wallet') readLocal(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('kleo_wallet_update', onCustom as EventListener);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('kleo_wallet_update', onCustom as EventListener); window.removeEventListener('storage', onStorage); };
  }, [isLoggedIn, ctx]);

  const connect = async () => {
    if (!ctx) return false; // No context available
    
    // Try to connect to MetaMask directly as a test
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const testWallet: Wallet = {
            address: accounts[0],
            type: 'EVM',
            isConnected: true,
            connect: async () => true,
            disconnect: () => {
              if (isMountedRef.current) {
                setWallet(null);
              }
            }
          };
          
          if (isMountedRef.current) {
            setWallet(testWallet);
          }
          return true;
        }
      } catch {
        // MetaMask connection error handled silently
      }
    }
    
    return false;
  };

  const disconnect = () => {
    handleLogOut();
    dynamicAuthService.handleWalletDisconnection();
    try { (window as any).local_xrpl_wallet = undefined; } catch {}
    if (isMountedRef.current) {
      setWallet(null);
    }
  };

  // Return early if no context
  if (!ctx) {
    return {
      wallet: null,
      isLoading: false,
      isConnected: false,
      connect: async () => false,
      disconnect: () => {},
      user: null
    };
  }

  return {
    wallet,
    isLoading,
    isConnected: !!wallet?.isConnected,
    connect,
    disconnect,
    user: dynamicAuthService.getCurrentUser()
  };
} 