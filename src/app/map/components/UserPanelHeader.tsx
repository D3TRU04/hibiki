'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, AlertTriangle } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';

interface UserPanelHeaderProps {
  onDisconnect: () => void;
}

function getWalletDisplayName(wallet: any): string {
  if (wallet.ensName) {
    return wallet.ensName;
  }
  return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
}

function getWalletTypeDisplay(wallet: any): string {
  return wallet.type || 'Unknown';
}

export default function UserPanelHeader({ onDisconnect }: UserPanelHeaderProps) {
  const { wallet } = useDynamicWallet();
  const [currentNetwork, setCurrentNetwork] = useState<string>('Unknown');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  // Check current network
  useEffect(() => {
    if (!wallet) return;

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
          setCurrentNetwork('XRPL EVM Sidechain Testnet');
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
  }, [wallet]);

  if (!wallet) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {getWalletDisplayName(wallet)}
          </h3>
          <p className="text-sm text-gray-500">
            {getWalletTypeDisplay(wallet)} • {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </p>
        </div>
        <button
          onClick={onDisconnect}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      
      {/* Network Status Indicator */}
      <div className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
        isCorrectNetwork 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
      }`}>
        {isCorrectNetwork ? (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
        )}
        <span className="font-medium">
          {isCorrectNetwork ? 'Connected to:' : 'Wrong network:'}
        </span>
        <span className="font-mono text-xs">
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
          >
            Switch
          </button>
        )}
      </div>
    </div>
  );
} 