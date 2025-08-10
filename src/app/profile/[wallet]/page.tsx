'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { graphClient, GraphQLPost, GraphQLUser } from '@/lib/graph/graph-client';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import ProfileHeader from '@/app/profile/components/ProfileHeader';
import ProfilePosts from '@/app/profile/components/ProfilePosts';
import NFTGallery from '@/components/NFTGallery';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const walletAddress = params.wallet as string;
  const { wallet: currentWallet, isConnected } = useDynamicWallet();
  
  const [userProfile, setUserProfile] = useState<GraphQLUser | null>(null);
  const [userPosts, setUserPosts] = useState<GraphQLPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!walletAddress) {
        setError('Invalid wallet address');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const ownProfile = isConnected && currentWallet?.address.toLowerCase() === walletAddress.toLowerCase();
        setIsOwnProfile(ownProfile);

        const profile = await graphClient.getUserProfile(walletAddress);
        setUserProfile(profile);

        const posts = await graphClient.getPostsByWallet(walletAddress);
        setUserPosts(posts);

      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [walletAddress, isConnected, currentWallet]);

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

        <div className="mt-8">
          <NFTGallery walletAddress={walletAddress} />
        </div>
      </div>
    </div>
  );
} 