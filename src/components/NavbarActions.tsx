'use client';

import { useState, useEffect } from 'react';
import { User, List, Wallet, LogOut, UserCheck, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Wallet as KleoWallet } from '@/lib/types';

interface NavbarActionsProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
  wallet?: KleoWallet | null;
  onDisconnect?: () => void;
}

export default function NavbarActions({
  onAddStory,
  onAuthClick,
  onToggleFeed,
  onToggleUserPanel,
  isAuthenticated = false,
  wallet = null,
  onDisconnect
}: NavbarActionsProps) {
  const [currentNetwork, setCurrentNetwork] = useState<string>('Unknown');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  // Check current network
  useEffect(() => {
    if (!wallet || !isAuthenticated) return;

    const checkNetwork = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;

        const currentChainId = await eth.request({ method: 'eth_chainId' });
        const expectedChainId = process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '1449000';
        const expectedChainHex = expectedChainId.startsWith('0x') 
          ? expectedChainId.toLowerCase() 
          : `0x${parseInt(expectedChainId, 10).toString(16)}`;

        if (currentChainId === expectedChainHex) {
          setCurrentNetwork('XRPL EVM Testnet');
          setIsCorrectNetwork(true);
        } else if (currentChainId === '0x1') {
          setCurrentNetwork('Ethereum Mainnet');
          setIsCorrectNetwork(false);
        } else {
          setCurrentNetwork(`Chain ID: ${parseInt(currentChainId, 16)}`);
          setIsCorrectNetwork(false);
        }
      } catch (error) {
        console.error('Error checking network:', error);
        setCurrentNetwork('Unknown');
        setIsCorrectNetwork(false);
      }
    };

    checkNetwork();
    
    // Listen for network changes
    const handleChainChanged = () => {
      checkNetwork();
    };

    if ((window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      return () => {
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [wallet, isAuthenticated]);

  const handleDisconnect = () => {
    onDisconnect?.();
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && wallet ? (
        <>
          {/* Network Status Indicator */}
          <div className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
            isCorrectNetwork 
              ? 'bg-green-500/20 border border-green-400/30 text-green-200' 
              : 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-200'
          }`}>
            {isCorrectNetwork ? (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            <span className="max-w-[140px] truncate">
              {currentNetwork}
            </span>
            {!isCorrectNetwork && (
              <button
                onClick={async () => {
                  try {
                    const eth = (window as any).ethereum;
                    if (!eth) return;
                    
                    const expectedChainId = process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '1449000';
                    const expectedChainHex = expectedChainId.startsWith('0x') 
                      ? expectedChainId.toLowerCase() 
                      : `0x${parseInt(expectedChainId, 10).toString(16)}`;
                    
                    await eth.request({ 
                      method: 'wallet_switchEthereumChain', 
                      params: [{ chainId: expectedChainHex }] 
                    });
                  } catch (error: any) {
                    if (error.code === 4902) {
                      // Network not added, add it first
                      const eth = (window as any).ethereum;
                      if (!eth) return;
                      
                      const expectedChainId = process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '1449000';
                      const expectedChainHex = expectedChainId.startsWith('0x') 
                        ? expectedChainId.toLowerCase() 
                        : `0x${parseInt(expectedChainId, 10).toString(16)}`;
                      
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
                    }
                  }
                }}
                className="ml-2 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                title="Switch to XRPL EVM Testnet"
              >
                Switch
              </button>
            )}
          </div>

          {/* My Profile Link */}
          <Link
            href={`/profile/${wallet.address}`}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <UserCheck size={16} />
            <span>My Profile</span>
          </Link>
          
          <button
            onClick={onToggleUserPanel}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <Wallet size={16} />
            <span>Profile</span>
          </button>
          
          <button
            onClick={onToggleFeed}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <List size={16} />
            <span>Feed</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium">
            <User size={16} />
            <span className="max-w-[120px] truncate">
              {wallet.ensName || wallet.address}
            </span>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-300/30 rounded-lg text-red-200 font-medium transition-all duration-200 hover:scale-105"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onToggleFeed}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <List size={16} />
            <span>Feed</span>
          </button>
          
          <button
            onClick={onAuthClick}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <User size={16} />
            <span>Connect Wallet</span>
          </button>
        </>
      )}
      
      <button
        onClick={onAddStory}
        className="hidden md:block px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-medium rounded-lg transition-all duration-200 hover:scale-105"
      >
        Share Story
      </button>
    </div>
  );
} 