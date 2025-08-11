'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { graphClient, GraphQLPost, GraphQLUser } from '@/lib/graph/graph-client';
import { getPosts } from '@/lib/api/api';
import type { KleoPost } from '@/lib/types';
import { dynamicAuthService } from '@/lib/dynamic-auth';
import ProfileHeader from '@/app/profile/components/ProfileHeader';
import ProfilePosts from '@/app/profile/components/ProfilePosts';

export default function ProfilePage() {
  const params = useParams();
  const walletAddress = (params.wallet as string)?.toLowerCase();

  const [userProfile, setUserProfile] = useState<GraphQLUser | null>(null);
  const [userPosts, setUserPosts] = useState<GraphQLPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const loadedRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  // Set own-profile flag once per wallet
  useEffect(() => {
    const current = dynamicAuthService.getCurrentWallet()?.address?.toLowerCase();
    setIsOwnProfile(!!current && current === walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) { setError('Invalid wallet address'); setIsLoading(false); return; }
    if (loadedRef.current === walletAddress || inFlightRef.current) return;
    loadedRef.current = walletAddress;
    inFlightRef.current = true;

    let cancelled = false;
    async function loadProfileData() {
      try {
        setIsLoading(true);
        setError(null);

        const [profileFromGraph, postsFromGraph] = await Promise.all([
          graphClient.getUserProfile(walletAddress),
          graphClient.getPostsByWallet(walletAddress, 50)
        ]);

        let posts: GraphQLPost[] = postsFromGraph || [];
        let profile: GraphQLUser | null = profileFromGraph;

        if (!posts.length) {
          const kleoPosts: KleoPost[] = await getPosts().catch(() => [] as KleoPost[]);
          const mine = (kleoPosts || []).filter(p => (p.user_id || '').toLowerCase() === walletAddress);
          posts = mine.map<GraphQLPost>(p => ({
            id: p.id,
            post_cid: (p as any).post_cid || '',
            wallet: p.user_id,
            timestamp: p.created_at || new Date().toISOString(),
            media_type: p.type === 'video' ? 'video' : (p.content_type === 'news' ? 'news' : 'text'),
            source_url: p.source_url,
            summary_text: p.ai_summary,
            reward_points: p.far_score ?? 0,
            lat: p.lat,
            lng: p.lng,
            is_reliable: !!p.is_reliable,
            credibility_score: p.credibility_score ?? 0,
            contributor_id: (p as any).contributor_id || ''
          }));
        }

        if (!profile) {
          const total_xp = posts.reduce((acc, p) => acc + (p.reward_points || 0), 0);
          profile = {
            id: walletAddress,
            wallet: walletAddress,
            total_xp,
            total_posts: posts.length,
            total_nfts: 0,
            total_rewards_claimed: 0,
            last_activity: posts[0]?.timestamp || new Date().toISOString(),
          } as GraphQLUser;
        }

        if (!cancelled) {
          setUserProfile(profile);
          setUserPosts(posts);
        }
      } catch {
        if (!cancelled) setError('Failed to load profile');
      } finally {
        if (!cancelled) setIsLoading(false);
        inFlightRef.current = false;
      }
    }

    void loadProfileData();
    return () => { cancelled = true; };
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gray-300">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          walletAddress={walletAddress}
          userProfile={userProfile}
          userPosts={userPosts}
          isOwnProfile={isOwnProfile}
        />

        <ProfilePosts
          userPosts={userPosts}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
} 