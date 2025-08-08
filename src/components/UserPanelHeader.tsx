'use client';

import { User, LogOut } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { getWalletDisplayName, getWalletTypeDisplay } from '@/lib/identity';

interface UserPanelHeaderProps {
  onDisconnect: () => void;
}

export default function UserPanelHeader({ onDisconnect }: UserPanelHeaderProps) {
  const { wallet } = useDynamicWallet();

  if (!wallet) return null;

  return (
    <div className="flex items-center space-x-3 mb-4">
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
  );
} 