import { useState, useCallback, useMemo, useEffect } from 'react';
import { KleoPost, Post, Wallet as KleoWallet } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import GlassyNavbar from '@/components/GlassyNavbar';
import dynamic from 'next/dynamic';
import type { Map as MapboxMap } from 'mapbox-gl';
import { withRetry } from '@/lib/dynamicRetry';

type MapContainerProps = { posts: KleoPost[]; onMapClick: (lat: number, lng: number) => void; onMapReady?: (map: MapboxMap) => void };
const MapContainer = dynamic<MapContainerProps>(withRetry(() => import('./MapContainer')), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-white">Loading map…</div> });

type MapSidebarProps = { showStoryFeed: boolean; showUserPanel: boolean; selectedTag: string; selectedType: string; posts?: KleoPost[]; onPostClick: (post: KleoPost) => void; onFilterChange: (filters: { tag?: string; type?: string }) => void };
const MapSidebar = dynamic<MapSidebarProps>(withRetry(() => import('./MapSidebar')), { ssr: false, loading: () => null });

type MapModalsProps = { isSubmissionFormOpen: boolean; selectedLocation: { lat: number; lng: number } | null; showAuthModal: boolean; showNFTNotification: boolean; nftMintingData: { tokenId?: string; transactionHash?: string; postCid?: string } | null; wallet: KleoWallet | null; onCloseSubmissionForm: () => void; onCloseAuthModal: () => void; onCloseNFTNotification: () => void; onPostCreated: (post: KleoPost) => void };
const MapModals = dynamic<MapModalsProps>(withRetry(() => import('./MapModals')), { ssr: false });
const DynamicProvider = dynamic(withRetry(() => import('@/components/DynamicProvider')), { ssr: false, loading: () => null });

export default function MapView() {
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStoryFeed, setShowStoryFeed] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showNFTNotification, setShowNFTNotification] = useState(false);
  const [nftMintingData, _setNftMintingData] = useState<{ tokenId?: string; transactionHash?: string; postCid?: string; } | null>(null);
  const [initDynamic, setInitDynamic] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);

  const { wallet, isConnected, disconnect } = useDynamicWallet();
  const { map, setMap, posts, setPosts, isLoading, loadPosts } = useMap();

  // Disable map click for submission; use navbar instead
  const handleMapClick = useCallback((_lat: number, _lng: number) => {
    // no-op; submissions start from the navbar
  }, []);

  const handleMapReady = useCallback((mapInstance: MapboxMap) => {
    setMap(mapInstance);
    setIsMapReady(true);
    // Defer data load slightly to let tiles appear
    setTimeout(() => { void loadPosts(); }, 0);
  }, [setMap, loadPosts]);

  const handleAddStory = useCallback(() => {
    // Ensure dynamic context is initialized so modals can render
    setInitDynamic(true);

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
    const post: Post = {
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
    setPosts(prev => [post, ...prev]);
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
    setInitDynamic(true);
    setShowAuthModal(true);
  }, []);

  // If user clicked Share Story while unauthenticated, open the submission form once connected
  useEffect(() => {
    if (pendingShare && isConnected && wallet) {
      setInitDynamic(true);
      setShowAuthModal(false);
      setSelectedLocation(null);
      setIsSubmissionFormOpen(true);
      setPendingShare(false);
    }
  }, [pendingShare, isConnected, wallet]);

  const navWallet: KleoWallet | null = isConnected && wallet ? wallet : null;

  return (
    <div className="h-screen w-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GlassyNavbar
        onAddStory={handleAddStory}
        onAuthClick={connectClick}
        onToggleFeed={() => setShowStoryFeed(!showStoryFeed)}
        onToggleUserPanel={() => setShowUserPanel(!showUserPanel)}
        isAuthenticated={!!navWallet}
        wallet={navWallet}
        onDisconnect={disconnect}
      />
      <div className="pt-16 h-full relative z-10 flex">
        <div className={`relative transition-all duration-300 ${showStoryFeed || showUserPanel ? 'w-2/3' : 'w-full'}`}>
          <MapContainer onMapClick={handleMapClick} onMapReady={handleMapReady} posts={mapPosts} />
          {isLoading && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full animate-pulse bg-white/5" />
            </div>
          )}
        </div>
        {isMapReady && (
          <MapSidebar
            showStoryFeed={showStoryFeed}
            showUserPanel={showUserPanel}
            selectedTag={selectedTag}
            selectedType={selectedType}
            posts={mapPosts}
            onPostClick={handlePostClick}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>
      {initDynamic ? (
        <DynamicProvider>
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
        </DynamicProvider>
      ) : null}
    </div>
  );
} 