'use client';

import Link from 'next/link';
// icons intentionally omitted

interface NavbarDesktopProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
}

export default function NavbarDesktop({
  onAddStory: _onAddStory,
  onAuthClick: _onAuthClick,
  onToggleFeed: _onToggleFeed,
  onToggleUserPanel: _onToggleUserPanel,
  isAuthenticated: _isAuthenticated
}: NavbarDesktopProps) {

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