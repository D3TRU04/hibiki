'use client';

import Link from 'next/link';
import { User, List, Wallet, LogOut, UserCheck } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { getWalletDisplayName } from '@/lib/identity';

interface NavbarDesktopProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
}

export default function NavbarDesktop({
  onAddStory,
  onAuthClick,
  onToggleFeed,
  onToggleUserPanel,
  isAuthenticated = false
}: NavbarDesktopProps) {
  const { wallet, disconnect } = useDynamicWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link 
        href="/map" 
        className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
      >
        Map
      </Link>
      <Link 
        href="/stories" 
        className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
      >
        Stories
      </Link>
      <Link 
        href="/about" 
        className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
      >
        About
      </Link>
    </div>
  );
} 