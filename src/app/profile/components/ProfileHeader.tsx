'use client';

import { memo } from 'react';
import { User, Star, MapPin, Calendar, Trophy, Coins, MessageSquare } from 'lucide-react';
import { GraphQLUser, GraphQLPost } from '@/lib/graph/graph-client';
import { getWalletDisplayName } from '@/lib/identity';

interface ProfileHeaderProps {
  walletAddress: string;
  userProfile: GraphQLUser | null;
  userPosts: GraphQLPost[];
  isOwnProfile: boolean;
}

function ProfileHeader({ 
  walletAddress, 
  userProfile, 
  userPosts, 
  isOwnProfile 
}: ProfileHeaderProps) {
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {getWalletDisplayName({ address: walletAddress, type: 'EVM', isConnected: false, connect: () => {}, disconnect: () => {} })}
            </h1>
            <p className="text-gray-300 font-mono text-sm">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            {isOwnProfile && (
              <span className="inline-block bg-gold text-gray-900 px-2 py-1 rounded text-xs font-medium mt-2">
                Your Profile
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-1 text-gold">
                <Trophy className="w-5 h-5" />
                <span className="text-xl font-bold">{userProfile?.total_xp || 0}</span>
              </div>
              <p className="text-gray-300 text-sm">XP</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1 text-blue-400">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xl font-bold">{userProfile?.total_posts || 0}</span>
              </div>
              <p className="text-gray-300 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1 text-purple-400">
                <Coins className="w-5 h-5" />
                <span className="text-xl font-bold">{userProfile?.total_nfts || 0}</span>
              </div>
              <p className="text-gray-300 text-sm">NFTs</p>
            </div>
          </div>
        </div>
      </div>

      {userProfile && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Last Active</span>
            </div>
            <p className="text-white font-medium">
              {userProfile.last_activity ? formatDate(userProfile.last_activity) : 'Never'}
            </p>
          </div> */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Star className="w-4 h-4" />
              <span className="text-sm">Rewards Claimed</span>
            </div>
            <p className="text-white font-medium">{userProfile.total_rewards_claimed || 0}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Locations</span>
            </div>
            <p className="text-white font-medium">
              {new Set(userPosts.map(post => `${post.lat},${post.lng}`)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ProfileHeader); 