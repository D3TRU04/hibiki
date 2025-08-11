'use client';

import { User, List, Wallet, LogOut, UserCheck, Sparkles } from 'lucide-react';
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
  showStoryFeed?: boolean;
  showUserPanel?: boolean;
  postCount?: number;
}

export default function NavbarActions({
  onAddStory,
  onAuthClick,
  onToggleFeed,
  onToggleUserPanel,
  isAuthenticated = false,
  wallet = null,
  onDisconnect,
  showStoryFeed = false,
  showUserPanel = false,
  postCount = 0
}: NavbarActionsProps) {
  const handleDisconnect = () => {
    onDisconnect?.();
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && wallet ? (
        <>
          {/* My Profile Link */}
          <Link
            href={`/profile/${wallet.address}`}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-colors"
          >
            <UserCheck size={16} />
            <span>My Profile</span>
          </Link>
          
          <button
            onClick={onToggleUserPanel}
            title={showUserPanel ? "Hide user panel" : "Show user profile panel"}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 border rounded-lg text-white font-medium transition-colors ${
              showUserPanel 
                ? 'bg-white/40 border-white/50' 
                : 'bg-white/20 hover:bg-white/30 border-white/30'
            }`}
          >
            <Wallet size={16} />
            <span>Profile</span>
          </button>
          
          <button
            onClick={onToggleFeed}
            title={showStoryFeed ? "Hide feed" : "Show global story feed"}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 border rounded-lg text-white font-medium transition-colors ${
              showStoryFeed 
                ? 'bg-white/40 border-white/50' 
                : 'bg-white/20 hover:bg-white/30 border-white/30'
            }`}
          >
            <List size={16} />
            <span>Feed</span>
            {postCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                {postCount}
              </span>
            )}
          </button>
          
          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white font-medium">
            <User size={16} />
            <span className="max-w-[120px] truncate">
              {wallet.ensName || wallet.address}
            </span>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 rounded-lg text-red-200 font-medium transition-colors"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onToggleFeed}
            title={showStoryFeed ? "Hide feed" : "Show global story feed"}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 border rounded-lg text-white font-medium transition-colors ${
              showStoryFeed 
                ? 'bg-white/40 border-white/50' 
                : 'bg-white/20 hover:bg-white/30 border-white/30'
            }`}
          >
            <List size={16} />
            <span>Feed</span>
            {postCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                {postCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onAuthClick}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-colors"
          >
            <User size={16} />
            <span>Connect Wallet</span>
          </button>
        </>
      )}
      
      <button
        onClick={onAddStory}
        aria-label="Share a story"
        className="hidden md:flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-300 rounded-lg text-gray-900 font-medium transition-colors"
      >
        <Sparkles size={16} />
        <span>Share Story</span>
      </button>
    </div>
  );
} 