'use client';

import { useEffect, useState } from 'react';

export default function LoadingPage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md mx-4">
        {/* Animated Globe */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-600 via-gold to-yellow-600 animate-spin-slow"></div>
          </div>
          {/* Floating Story Points */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-8 w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-8 right-6 w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-6 left-12 w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-8 right-8 w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        {/* Kleo Logo & Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">K</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gold to-yellow-400 bg-clip-text text-transparent">
              Kleo
            </h1>
          </div>
          <p className="text-xl text-white font-light">
            Share Your Stories
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Connect with the world through stories, memories, and experiences. 
            Every place has a story waiting to be told.
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Connecting Lines Animation */}
        <div className="relative h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-300 text-sm">
          <span className="animate-pulse">Loading your world{dots}</span>
        </div>
      </div>
    </div>
  );
} 