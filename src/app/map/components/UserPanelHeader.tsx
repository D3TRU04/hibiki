'use client';

import { User, Wallet, LogOut } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import type { Wallet as KleoWallet } from '@/lib/types';

interface UserPanelHeaderProps {
  wallet: KleoWallet | null;
  onDisconnect: () => void;
  onToggleUserPanel: () => void;
}

export default function UserPanelHeader({ wallet, onDisconnect, onToggleUserPanel }: UserPanelHeaderProps) {
  const { primaryWallet, user } = useDynamicContext();
  const isLoggedIn = !!(primaryWallet && user);

  // Helper functions moved into this file
  const getWalletDisplayName = (wallet: KleoWallet) => {
    return wallet.ensName || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  };

  const getWalletTypeDisplay = (wallet: KleoWallet) => {
    switch (wallet.type) {
      case 'EVM':
        return 'Ethereum Wallet';
      case 'XRPL':
        return 'XRPL Wallet';
      default:
        return 'Wallet';
    }
  };

  if (!wallet || !isLoggedIn) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="text-center text-gray-500">
          <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No wallet connected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getWalletDisplayName(wallet)}</h3>
            <p className="text-sm text-gray-500">{getWalletTypeDisplay(wallet)}</p>
          </div>
        </div>
        
        <button
          onClick={onToggleUserPanel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Wallet className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Wallet Address */}
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-mono">
            {wallet.address}
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={onDisconnect}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Wallet</span>
        </button>
      </div>
    </div>
  );
} 