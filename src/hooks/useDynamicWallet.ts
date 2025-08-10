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

  // Network switching effect - ensure wallet is on XRPL EVM Sidechain Testnet
  useEffect(() => {
    if (!isLoggedIn || !primaryWallet) return;

    const switchToCorrectNetwork = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;

        const expectedChainId = process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '1449000';
        const expectedChainHex = expectedChainId.startsWith('0x') 
          ? expectedChainId.toLowerCase() 
          : `0x${parseInt(expectedChainId, 10).toString(16)}`;

        // Check current network
        const currentChainId = await eth.request({ method: 'eth_chainId' });
        
        if (currentChainId !== expectedChainHex) {
          console.log('🔄 Switching to XRPL EVM Sidechain Testnet...');
          
          try {
            // Try to switch to the correct network
            await eth.request({ 
              method: 'wallet_switchEthereumChain', 
              params: [{ chainId: expectedChainHex }] 
            });
            console.log('✅ Successfully switched to XRPL EVM Sidechain Testnet');
          } catch (switchError: any) {
            // If network is unknown, add it first
            if (switchError.code === 4902) {
              const chainName = process.env.NEXT_PUBLIC_EVM_CHAIN_NAME || 'XRPL EVM Sidechain Testnet';
              const rpcUrl = process.env.NEXT_PUBLIC_EVM_RPC_URL || 'https://rpc.testnet.xrplevm.org/';
              const currency = process.env.NEXT_PUBLIC_EVM_CURRENCY || 'XRP';
              const blockExplorer = process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_URL || 'https://explorer.testnet.xrplevm.org/';
              
              await eth.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: expectedChainHex,
                  chainName: chainName,
                  rpcUrls: [rpcUrl],
                  nativeCurrency: { 
                    name: currency, 
                    symbol: currency, 
                    decimals: 18 
                  },
                  blockExplorerUrls: [blockExplorer],
                }],
              });
              
              // Now switch to the added network
              await eth.request({ 
                method: 'wallet_switchEthereumChain', 
                params: [{ chainId: expectedChainHex }] 
              });
              console.log('✅ Successfully added and switched to XRPL EVM Sidechain Testnet');
            } else {
              console.warn('⚠️ Failed to switch network:', switchError);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error switching network:', error);
      }
    };

    // Add a small delay to ensure wallet is fully connected
    const timer = setTimeout(switchToCorrectNetwork, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, primaryWallet]);

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