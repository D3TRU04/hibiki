'use client';

import { useState, useCallback, useEffect } from 'react';
import { KleoPost, Post } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import GlassyNavbar from '@/components/GlassyNavbar';
import MapContainer from '@/components/MapContainer';
import MapSidebar from '@/components/MapSidebar';
import MapModals from '@/components/MapModals';
import LoadingPage from '@/components/LoadingPage';
import mapboxgl from 'mapbox-gl';

export default function MapPage() {
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [showStoryFeed, setShowStoryFeed] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showNFTNotification, setShowNFTNotification] = useState(false);
  const [nftMintingData, setNftMintingData] = useState<{
    tokenId?: string;
    transactionHash?: string;
    postCid?: string;
  } | null>(null);
  
  const { wallet, isConnected } = useDynamicWallet();
  
  const {
    map,
    setMap,
    posts,
    setPosts,
    isLoading,
    addNewPostToMap,
  } = useMap();

  // Show loading page for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!isConnected || !wallet) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedLocation({ lat, lng });
    setIsSubmissionFormOpen(true);
  }, [isConnected, wallet]);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const handleAddStory = useCallback(() => {
    if (!isConnected || !wallet) {
      setShowAuthModal(true);
      return;
    }

    if (map) {
      const center = map.getCenter();
      setSelectedLocation({ lat: center.lat, lng: center.lng });
    } else {
      setSelectedLocation({ lat: 0, lng: 0 });
    }
    setIsSubmissionFormOpen(true);
  }, [map, isConnected, wallet]);

  const handlePostCreated = useCallback((newPost: KleoPost) => {
    const post: Post = {
      id: newPost.id,
      user_id: newPost.contributor_id || 'anonymous',
      type: newPost.media_type || 'text',
      content: newPost.text,
      lat: newPost.lat,
      lng: newPost.lng,
      media_url: newPost.ipfs_url,
      ipfs_post_url: newPost.ipfs_url,
      far_score: 0,
      engagement_score: 0,
      flags: 0,
      created_at: newPost.created_at,
      updated_at: newPost.created_at,
      tags: newPost.tags,
      contributor_id: newPost.contributor_id,
      wallet_type: newPost.wallet_type,
      reward_points: newPost.reward_points,
      post_cid: newPost.post_cid
    };

    setPosts(prev => [post, ...prev]);
    if (map) {
      addNewPostToMap(post, map);
    }

    if (newPost.post_cid) {
      setNftMintingData({
        tokenId: newPost.post_cid,
        postCid: newPost.post_cid,
        transactionHash: 'NFT minted successfully'
      });
      setShowNFTNotification(true);
    }
  }, [map, setPosts, addNewPostToMap]);

  const handlePostClick = useCallback((post: KleoPost) => {
    if (map) {
      map.flyTo({
        center: [post.lng, post.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [map]);

  const handleFilterChange = useCallback((filters: { tag?: string; type?: string }) => {
    setSelectedTag(filters.tag || '');
    setSelectedType(filters.type || '');
  }, []);

  // Convert posts to the format expected by MapContainer
  const mapPosts = posts.map(post => ({
    id: post.id || '',
    lat: post.lat,
    lng: post.lng,
    text: post.content,
    media_type: post.type,
    ipfs_url: post.media_url || post.ipfs_post_url,
    ai_summary: (post as any).ai_summary,
    source_url: (post as any).source_url,
    tags: post.tags || [],
    reward_points: post.reward_points || 0,
    contributor_id: post.contributor_id,
    created_at: post.created_at || new Date().toISOString()
  }));

  if (showLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="h-screen w-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GlassyNavbar 
        onAddStory={handleAddStory} 
        onAuthClick={() => setShowAuthModal(true)}
        onToggleFeed={() => setShowStoryFeed(!showStoryFeed)}
        onToggleUserPanel={() => setShowUserPanel(!showUserPanel)}
        isAuthenticated={isConnected}
      />
      
      <div className="pt-16 h-full relative z-10 flex">
        <div className={`relative transition-all duration-300 ${
          showStoryFeed || showUserPanel ? 'w-2/3' : 'w-full'
        }`}>
          <MapContainer
            onMapClick={handleMapClick}
            onMapReady={handleMapReady}
            posts={mapPosts}
          />
        </div>

        <MapSidebar
          showStoryFeed={showStoryFeed}
          showUserPanel={showUserPanel}
          selectedTag={selectedTag}
          selectedType={selectedType}
          onPostClick={handlePostClick}
          onFilterChange={handleFilterChange}
        />
      </div>

      <MapModals
        isSubmissionFormOpen={isSubmissionFormOpen}
        selectedLocation={selectedLocation}
        showAuthModal={showAuthModal}
        showNFTNotification={showNFTNotification}
        nftMintingData={nftMintingData}
        wallet={wallet}
        onCloseSubmissionForm={() => {
          setIsSubmissionFormOpen(false);
          setSelectedLocation(null);
        }}
        onCloseAuthModal={() => setShowAuthModal(false)}
        onCloseNFTNotification={() => setShowNFTNotification(false)}
        onPostCreated={handlePostCreated}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
} 