'use client';

import NavbarDesktop from '@/components/NavbarDesktop';
import NavbarActions from '@/components/NavbarActions';
import type { Wallet as KleoWallet } from '@/lib/types';

interface GlassyNavbarProps {
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

export default function GlassyNavbar({ 
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
}: GlassyNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      {/* Simple backdrop */}
      <div className="absolute inset-0 bg-white/10 border-b border-white/20 shadow-lg" />
      
      {/* Navbar content */}
      <div className="relative flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-normal text-sm">K</span>
          </div>
          <span className="text-white font-normal text-lg">Kleo</span>
        </div>

        {/* Desktop Navigation */}
        <NavbarDesktop />

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <NavbarActions
            onAddStory={onAddStory}
            onAuthClick={onAuthClick}
            onToggleFeed={onToggleFeed}
            onToggleUserPanel={onToggleUserPanel}
            isAuthenticated={isAuthenticated}
            wallet={wallet}
            onDisconnect={onDisconnect}
            showStoryFeed={showStoryFeed}
            showUserPanel={showUserPanel}
            postCount={postCount}
          />
          <a href="/leaderboard" className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white text-sm font-normal transition-colors">Leaderboard</a>
        </div>
      </div>
    </nav>
  );
} 