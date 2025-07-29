'use client';

import { Crown, Shield, Star } from 'lucide-react';
import { Contributor } from '@/types';

interface ContributorBadgeProps {
  contributor: Contributor;
}

export default function ContributorBadge({ contributor }: ContributorBadgeProps) {
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Verified', icon: Crown, color: 'text-green-600 dark:text-green-400' };
    if (score >= 70) return { level: 'Trusted', icon: Shield, color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 50) return { level: 'Established', icon: Star, color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'New', icon: Star, color: 'text-gray-600 dark:text-gray-400' };
  };

  const trustLevel = getTrustLevel(contributor.trustScore);
  const TrustIcon = trustLevel.icon;

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {contributor.username.charAt(0).toUpperCase()}
        </div>
        
        {/* NFT Badge */}
        {contributor.hasStoryNodeNFT && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">🎨</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {contributor.username}
          </span>
          <TrustIcon size={12} className={trustLevel.color} />
          <span className={`text-xs ${trustLevel.color}`}>
            {trustLevel.level}
          </span>
        </div>
        
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Trust: {contributor.trustScore}%</span>
          <span>•</span>
          <span>{contributor.storyCount} stories</span>
          {contributor.hasStoryNodeNFT && (
            <>
              <span>•</span>
              <span className="text-yellow-600 dark:text-yellow-400">StoryNode NFT</span>
            </>
          )}
        </div>
      </div>

      {/* RLUSD Balance (placeholder) */}
      <div className="text-right">
        <div className="text-xs font-medium text-green-600 dark:text-green-400">
          +5.2 RLUSD
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          earned
        </div>
      </div>
    </div>
  );
} 