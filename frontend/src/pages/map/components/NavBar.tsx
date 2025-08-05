'use client';

import { useState } from 'react';
import { MapPin, Mic, Users, Settings, Menu, X } from 'lucide-react';

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kleo</h1>
              <p className="text-xs text-gray-500">Local Stories</p>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <MapPin size={18} />
              <span className="text-sm font-medium">Map</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
              <Mic size={18} />
              <span className="text-sm font-medium">Record</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
              <Users size={18} />
              <span className="text-sm font-medium">Community</span>
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Stats */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>1,234 stories</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>567 users</span>
              </div>
            </div>

            {/* Settings Button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Settings size={18} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Items */}
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                <MapPin size={18} />
                <span className="text-sm font-medium">Map</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                <Mic size={18} />
                <span className="text-sm font-medium">Record</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                <Users size={18} />
                <span className="text-sm font-medium">Community</span>
              </button>

              {/* Mobile Stats */}
              <div className="px-3 py-2 border-t border-gray-100 mt-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>1,234 stories</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>567 users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 