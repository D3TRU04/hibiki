'use client';

import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Award, Star, Crown, Zap } from 'lucide-react';

// Hardcoded demo data for presentation - simplified and realistic
const DEMO_USERS = [
  {
    id: '1',
    wallet: '0x7F3C...8A2B',
    username: 'CryptoExplorer',
    total_xp: 2847,
    total_posts: 47,
    total_nfts: 12,
    rank: 1,
    badge: 'crown'
  },
  {
    id: '2',
    wallet: '0x9A1B...3C4D',
    username: 'StoryWeaver',
    total_xp: 2156,
    total_posts: 38,
    total_nfts: 8,
    rank: 2,
    badge: 'star'
  },
  {
    id: '3',
    wallet: '0x2E5F...7G8H',
    username: 'DigitalNomad',
    total_xp: 1893,
    total_posts: 31,
    total_nfts: 6,
    rank: 3,
    badge: 'zap'
  }
];

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case 'crown':
      return <Crown className="w-4 h-4 text-yellow-400" />;
    case 'star':
      return <Star className="w-4 h-4 text-blue-400" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-purple-400" />;
    default:
      return <Star className="w-4 h-4 text-gray-400" />;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'from-yellow-400 to-yellow-600 text-gray-900';
    case 2:
      return 'from-gray-300 to-gray-500 text-gray-900';
    case 3:
      return 'from-amber-600 to-amber-800 text-white';
    default:
      return 'from-gray-600 to-gray-800 text-white';
  }
};

export default function Leaderboard() {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      {/* Header with stats toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-gold" />
          <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
          <TrendingUp className="w-5 h-5 text-gold" />
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gold">{DEMO_USERS.length}</div>
            <div className="text-xs text-gray-300">Top Users</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gold">2847</div>
            <div className="text-xs text-gray-300">Max XP</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gold">47</div>
            <div className="text-xs text-gray-300">Max Posts</div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {DEMO_USERS.map((user) => (
          <div
            key={user.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-gold/30 transition-all duration-300 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rank Badge */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(user.rank)} font-bold text-sm relative`}>
                  {user.rank}
                  {user.rank <= 3 && (
                    <div className="absolute -top-1 -right-1">
                      {getBadgeIcon(user.badge)}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-sm">{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{user.wallet}</span>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 text-gold">
                  <Award className="w-4 h-4" />
                  <span className="font-bold">{user.total_xp.toLocaleString()}</span>
                </div>
                <div className="text-gray-300 text-right">
                  <div className="font-medium">{user.total_posts} posts</div>
                  <div className="text-xs text-gray-400">{user.total_nfts} NFTs</div>
                </div>
              </div>
            </div>
            
            {/* Special Badges */}
            <div className="mt-3 flex items-center justify-end space-x-2">
              {user.rank === 1 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                  🏆 Champion
                </span>
              )}
              {user.rank === 2 && (
                <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">
                  🥈 Runner Up
                </span>
              )}
              {user.rank === 3 && (
                <span className="bg-amber-600/20 text-amber-300 px-2 py-1 rounded-full text-xs">
                  🥉 Third Place
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          Updated every 5 minutes • Next refresh in 2:34
        </p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Trophy className="w-3 h-3 text-gold" />
            <span>XP Ranking</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Medal className="w-3 h-3 text-gold" />
            <span>Post Count</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Award className="w-3 h-3 text-gold" />
            <span>NFT Collection</span>
          </div>
        </div>
      </div>
    </div>
  );
} 