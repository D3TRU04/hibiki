'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, List, Wallet, LogOut, UserCheck } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { getWalletDisplayName } from '@/lib/identity';

interface NavbarMobileProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
}

export default function NavbarMobile({
  onAddStory,
  onAuthClick,
  onToggleFeed,
  onToggleUserPanel,
  isAuthenticated = false
}: NavbarMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { wallet, disconnect } = useDynamicWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="px-4 py-4 space-y-4">
            <Link 
              href="/map" 
              className="block text-white/80 hover:text-white transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Map
            </Link>
            <Link 
              href="/stories" 
              className="block text-white/80 hover:text-white transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Stories
            </Link>
            <Link 
              href="/about" 
              className="block text-white/80 hover:text-white transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {isAuthenticated && wallet ? (
              <>
                {/* My Profile Link - Mobile */}
                <Link
                  href={`/profile/${wallet.address}`}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCheck size={16} />
                  <span>My Profile</span>
                </Link>
                
                <button
                  onClick={() => {
                    onToggleUserPanel?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Wallet size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    onToggleFeed?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <List size={16} />
                  <span>Feed</span>
                </button>
                <div className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium flex items-center justify-center space-x-2">
                  <User size={16} />
                  <span className="max-w-[120px] truncate">
                    {getWalletDisplayName(wallet)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-300/30 rounded-lg text-red-200 font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onToggleFeed?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <List size={16} />
                  <span>Feed</span>
                </button>
                <button
                  onClick={() => {
                    onAuthClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <User size={16} />
                  <span>Connect Wallet</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => {
                onAddStory?.();
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-medium rounded-lg transition-all duration-200"
            >
              Share Story
            </button>
          </div>
        </div>
      )}
    </>
  );
} 