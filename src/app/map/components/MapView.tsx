import { useState, useCallback, useMemo, useEffect } from 'react';
import { KleoPost, Post } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import GlassyNavbar from '@/components/GlassyNavbar';
import dynamic from 'next/dynamic';
import type { Map as MapboxMap } from 'mapbox-gl';

const MapContainer = dynamic(() => import('./MapContainer'), { ssr: false });
const MapSidebar = dynamic(() => import('./MapSidebar'), { ssr: false, loading: () => null });
const MapModals = dynamic(() => import('./MapModals'), { ssr: false });

function MapViewInner() {
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStoryFeed, setShowStoryFeed] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showNFTNotification, setShowNFTNotification] = useState(false);
  const [nftMintingData] = useState<{ tokenId?: string; transactionHash?: string; postCid?: string; } | null>(null);
  const [pendingShare, setPendingShare] = useState(false);

  const { wallet, isConnected, disconnect } = useDynamicWallet();
  const { map, setMap, posts, setPosts, loadPosts } = useMap();

  // Disable map click for submission; use navbar instead
  const handleMapClick = useCallback(() => {
    // no-op; submissions start from the navbar
  }, []);

  const handleMapReady = useCallback((mapInstance: MapboxMap) => {
    setMap(mapInstance);
    // Defer data load slightly to let tiles appear
    setTimeout(() => { void loadPosts(); }, 0);
  }, [setMap, loadPosts]);

  const handleAddStory = useCallback(() => {
    if (!isConnected || !wallet) {
      setPendingShare(true);
      setShowAuthModal(true);
      return;
    }
    // Open submission modal without requiring a map click; user will enter location
    setSelectedLocation(null);
    setIsSubmissionFormOpen(true);
  }, [isConnected, wallet]);

  const handlePostCreated = useCallback((newPost: KleoPost) => {
    const newPostData: Post = {
      id: newPost.id,
      user_id: newPost.user_id,
      type: newPost.type === 'video' ? 'video' : 'text',
      content: newPost.content,
      lat: newPost.lat,
      lng: newPost.lng,
      media_url: newPost.media_url,
      ipfs_post_url: newPost.ipfs_post_url,
      far_score: newPost.far_score ?? 0,
      engagement_score: newPost.engagement_score ?? 0,
      flags: newPost.flags ?? 0,
      created_at: newPost.created_at,
      updated_at: newPost.updated_at,
    };
    setPosts(prev => [newPostData, ...prev]);
    // Optional NFT notification hook left unchanged
  }, [setPosts]);

  const handlePostClick = useCallback((post: KleoPost) => { if (map) map.flyTo({ center: [post.lng, post.lat], zoom: 15, duration: 800 }); }, [map]);

  const handleFilterChange = useCallback((filters: { tag?: string; type?: string }) => {
    setSelectedTag(filters.tag || '');
    setSelectedType(filters.type || '');
  }, []);

  const MAX_POSTS = Number(process.env.NEXT_PUBLIC_MAP_MAX_POSTS) || 100;
  const limitedPosts = useMemo(() => posts.slice(0, MAX_POSTS), [posts, MAX_POSTS]);

  const mapPosts: KleoPost[] = useMemo(() => limitedPosts.map(post => ({
    id: post.id || '',
    user_id: post.user_id || '',
    type: post.type === 'video' ? 'video' : 'text',
    content: post.content || '',
    lat: post.lat,
    lng: post.lng,
    media_url: post.media_url || post.ipfs_post_url,
    ai_summary: (post as KleoPost).ai_summary,
    source_url: (post as KleoPost).source_url,
    far_score: post.far_score ?? 0,
    engagement_score: post.engagement_score ?? 0,
    flags: post.flags ?? 0,
    created_at: post.created_at || new Date().toISOString(),
    updated_at: post.updated_at || new Date().toISOString(),
    content_type: 'news',
  })), [limitedPosts]);

  const connectClick = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // If user clicked Share Story while unauthenticated, open the submission form once connected
  useEffect(() => {
    if (pendingShare && isConnected && wallet) {
      setShowAuthModal(false);
      setSelectedLocation(null);
      setIsSubmissionFormOpen(true);
      setPendingShare(false);
    }
  }, [pendingShare, isConnected, wallet]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStoryFeed) setShowStoryFeed(false);
        if (showUserPanel) setShowUserPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showStoryFeed, showUserPanel]);

  // Improved feed toggle with better state management
  const handleToggleFeed = useCallback(() => {
    setShowStoryFeed(prev => !prev);
    // Close user panel when opening feed to avoid conflicts
    if (showUserPanel) {
      setShowUserPanel(false);
    }
  }, [showUserPanel]);

  const handleToggleUserPanel = useCallback(() => {
    setShowUserPanel(prev => !prev);
    // Close feed when opening user panel to avoid conflicts
    if (showStoryFeed) {
      setShowStoryFeed(false);
    }
  }, [showStoryFeed]);

  return (
    <div className="h-screen w-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      <GlassyNavbar
        onAddStory={handleAddStory}
        onAuthClick={connectClick}
        onToggleFeed={handleToggleFeed}
        onToggleUserPanel={handleToggleUserPanel}
        isAuthenticated={isConnected}
        wallet={wallet}
        onDisconnect={disconnect}
        showStoryFeed={showStoryFeed}
        showUserPanel={showUserPanel}
        postCount={posts.length}
      />
      
      <div className="pt-16 h-full relative z-10">
        <div className="relative w-full h-full">
          <MapContainer onMapClick={handleMapClick} onMapReady={handleMapReady} posts={mapPosts} />
          
          {/* Sidebar as overlay */}
          {(showStoryFeed || showUserPanel) && (
            <div className="absolute top-0 right-0 h-full z-20 sidebar-enter">
              <MapSidebar
                showStoryFeed={showStoryFeed}
                showUserPanel={showUserPanel}
                selectedTag={selectedTag}
                selectedType={selectedType}
                posts={mapPosts}
                onPostClick={handlePostClick}
                onFilterChange={handleFilterChange}
                onCloseFeed={() => setShowStoryFeed(false)}
                onCloseUserPanel={() => setShowUserPanel(false)}
              />
            </div>
          )}
        </div>
      </div>
      <MapModals
        isSubmissionFormOpen={isSubmissionFormOpen}
        selectedLocation={selectedLocation}
        showAuthModal={showAuthModal}
        showNFTNotification={showNFTNotification}
        nftMintingData={nftMintingData}
        wallet={wallet}
        onCloseSubmissionForm={() => { setIsSubmissionFormOpen(false); setSelectedLocation(null); }}
        onCloseAuthModal={() => { setShowAuthModal(false); setPendingShare(false); }}
        onCloseNFTNotification={() => setShowNFTNotification(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default function MapView() {
  return <MapViewInner />;
} 