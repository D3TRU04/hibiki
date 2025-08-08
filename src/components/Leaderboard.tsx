'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, User, TrendingUp } from 'lucide-react';
import { graphClient, GraphQLUser } from '@/lib/graph-client';

export default function Leaderboard() {
  const [users, setUsers] = useState<GraphQLUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const leaderboard = await graphClient.getLeaderboard(10);
        setUsers(leaderboard);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto mb-2"></div>
          <p className="text-gray-300 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
        <TrendingUp className="w-4 h-4 text-gray-400" />
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.wallet}`}
              className="block bg-white/5 rounded-lg p-3 border border-white/10 hover:border-gold/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gold to-yellow-400 text-gray-900 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium text-sm">
                      {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gold">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{user.total_xp}</span>
                  </div>
                  <div className="text-gray-400">
                    {user.total_posts} posts
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>Last active: {formatDate(user.last_activity)}</span>
                <span>{user.total_nfts} NFTs</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">No data yet</h3>
          <p className="text-gray-400 text-xs">
            Start sharing stories to appear on the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
} 