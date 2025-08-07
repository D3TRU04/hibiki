'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Users } from 'lucide-react';
import { getLeaderboard, getLevelTitle } from '@/lib/rewards';

interface LeaderboardEntry {
  address: string;
  totalXP: number;
  level: number;
  posts: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = () => {
      const data = getLeaderboard();
      setLeaderboard(data);
      setIsLoading(false);
    };

    loadLeaderboard();
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 1:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 2:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-300" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 2:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contributors Yet</h3>
          <p className="text-sm text-gray-600">
            Be the first to share a story and earn Cookie Points!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.address}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${getRankColor(index)}`}
          >
            {/* Rank */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                {getRankIcon(index)}
                <span className="text-sm font-medium">
                  #{index + 1}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {entry.address ? `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}` : 'Anonymous'}
                </p>
                <div className="flex items-center space-x-2 text-xs opacity-75">
                  <span>Level {entry.level} {getLevelTitle(entry.level)}</span>
                  <span>•</span>
                  <span>{entry.posts} posts</span>
                </div>
              </div>
            </div>

            {/* XP */}
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span className="text-sm font-bold">
                  {entry.totalXP}
                </span>
              </div>
              <p className="text-xs opacity-75">XP</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Leaderboard updates every 30 seconds
        </p>
      </div>
    </div>
  );
} 