'use client';

import NavbarDesktop from '@/components/NavbarDesktop';
import NavbarActions from '@/components/NavbarActions';
import NavbarMobile from '@/components/NavbarMobile';

interface GlassyNavbarProps {
  onAddStory?: () => void;
  onAuthClick?: () => void;
  onToggleFeed?: () => void;
  onToggleUserPanel?: () => void;
  isAuthenticated?: boolean;
}

export default function GlassyNavbar({ 
  onAddStory, 
  onAuthClick, 
  onToggleFeed, 
  onToggleUserPanel,
  isAuthenticated = false
}: GlassyNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg" />
      
      {/* Navbar content */}
      <div className="relative flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">K</span>
          </div>
          <span className="text-white font-semibold text-lg">Kleo</span>
        </div>

        {/* Desktop Navigation */}
        <NavbarDesktop
          onAddStory={onAddStory}
          onAuthClick={onAuthClick}
          onToggleFeed={onToggleFeed}
          onToggleUserPanel={onToggleUserPanel}
          isAuthenticated={isAuthenticated}
        />

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <NavbarActions
            onAddStory={onAddStory}
            onAuthClick={onAuthClick}
            onToggleFeed={onToggleFeed}
            onToggleUserPanel={onToggleUserPanel}
            isAuthenticated={isAuthenticated}
          />
          
          <NavbarMobile
            onAddStory={onAddStory}
            onAuthClick={onAuthClick}
            onToggleFeed={onToggleFeed}
            onToggleUserPanel={onToggleUserPanel}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </nav>
  );
} 