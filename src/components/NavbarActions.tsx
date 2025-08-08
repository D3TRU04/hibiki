'use client';

import { User, List, Wallet, LogOut, UserCheck } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { getWalletDisplayName } from '@/lib/identity';
import Link from 'next/link';

interface NavbarActionsProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
}

export default function NavbarActions({
  onAddStory,
  onAuthClick,
  onToggleFeed,
  onToggleUserPanel,
  isAuthenticated = false
}: NavbarActionsProps) {
  const { wallet, disconnect } = useDynamicWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && wallet ? (
        <>
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
              {getWalletDisplayName(wallet)}
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