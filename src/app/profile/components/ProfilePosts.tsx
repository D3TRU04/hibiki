'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GraphQLPost } from '@/lib/graph/graph-client';
import { MessageSquare, Video, Link as LinkIcon } from 'lucide-react';
import StoryCard from '@/app/components/StoryCard';
import { KleoPost } from '@/lib/types';

interface ProfilePostsProps {
  userPosts: GraphQLPost[];
  isOwnProfile: boolean;
}

export default function ProfilePosts({ userPosts, isOwnProfile }: ProfilePostsProps) {
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const convertToKleoPosts = (posts: GraphQLPost[]): KleoPost[] => {
    return posts.map(post => ({
      id: post.id,
      user_id: post.wallet,
      type: post.media_type as 'text' | 'video' | 'news',
      content: post.summary_text || 'No content available',
      lat: post.lat,
      lng: post.lng,
      created_at: formatDate(post.timestamp),
      updated_at: formatDate(post.timestamp),
      far_score: post.reward_points,
      engagement_score: 0,
      flags: 0,
      ai_summary: post.summary_text,
      source_url: post.source_url,
      content_type: post.media_type === 'news' ? 'news' : 'media',
      credibility_score: post.credibility_score,
      is_reliable: post.is_reliable,
      contributor_id: post.contributor_id,
      post_cid: post.post_cid
    }));
  };

  const kleoPosts = convertToKleoPosts(userPosts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Posts ({kleoPosts.length})</h2>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-sm">Filter by type:</span>
          <div className="flex space-x-1">
            {['all', 'video', 'news', 'text'].map(type => (
              <button
                key={type}
                className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {kleoPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kleoPosts.map(post => (
            <div key={post.id} className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:border-gold/50 transition-all duration-300">
              <StoryCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
          <p className="text-gray-400">
            {isOwnProfile 
              ? 'Start sharing stories to see them here!'
              : 'This user hasn\'t shared any stories yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 