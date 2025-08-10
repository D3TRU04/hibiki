"use client";

import Leaderboard from '@/app/map/components/Leaderboard';
import Link from 'next/link';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <Link href="/map" className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 text-gray-900 rounded-lg font-medium">Back to Map</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Leaderboard />
      </div>
    </div>
  );
} 