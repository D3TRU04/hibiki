'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GlassyNavbarProps {
  onAddStory?: () => void;
}

export default function GlassyNavbar({ onAddStory }: GlassyNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg" />
      
      {/* Navbar content */}
      <div className="relative flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="text-white font-semibold text-lg">Kleo</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
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

        {/* CTA Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onAddStory}
            className="hidden md:block px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          >
            Share Story
          </button>
          
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="px-4 py-4 space-y-4">
            <Link 
              href="/" 
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
            <button
              onClick={() => {
                onAddStory?.();
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200"
            >
              Share Story
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 