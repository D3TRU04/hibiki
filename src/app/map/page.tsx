'use client';

import { useState, useCallback, useEffect } from 'react';
import { Post, KleoPost } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import GlassyNavbar from '@/components/GlassyNavbar';
import MapContainer from '@/components/MapContainer';
import SubmissionForm from '@/components/SubmissionForm';
import StoryFeed from '@/components/StoryFeed';
import UserPanel from '@/components/UserPanel';
import Leaderboard from '@/components/Leaderboard';
import AuthModal from '@/components/AuthModal';
import LoadingPage from '@/components/LoadingPage';
import mapboxgl from 'mapbox-gl';

export default function MapPage() {
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [showStoryFeed, setShowStoryFeed] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  
  const {
    map,
    setMap,
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
    setSelectedLocation({ lat, lng });
    setIsSubmissionFormOpen(true);
  }, []);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const handleAddStory = useCallback(() => {
    // Use current map center if available, otherwise use a default location
    if (map) {
      const center = map.getCenter();
      setSelectedLocation({ lat: center.lat, lng: center.lng });
    } else {
      // Fallback to a reasonable default (world center)
      setSelectedLocation({ lat: 0, lng: 0 });
    }
    setIsSubmissionFormOpen(true);
  }, [map]);

  const handlePostCreated = useCallback((newPost: KleoPost) => {
    // Convert KleoPost to Post for compatibility with existing map functionality
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
  }, [map, setPosts, addNewPostToMap]);

  const handlePostClick = useCallback((post: KleoPost) => {
    if (map) {
      // Fly to the post location
      map.flyTo({
        center: [post.lng, post.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [map]);

  const handleFilterChange = useCallback((filters: { tag?: string; type?: string }) => {
    setSelectedTag(filters.tag);
    setSelectedType(filters.type);
    
    // Filter map pins based on selected filters
    if (map) {
      // Get all markers on the map
      const markers = document.querySelectorAll('.mapboxgl-marker');
      
      markers.forEach((marker) => {
        const popup = marker.querySelector('.mapboxgl-popup');
        if (popup) {
          const content = popup.innerHTML;
          let shouldShow = true;
          
          // Filter by media type
          if (filters.type && filters.type !== 'all') {
            const hasMediaType = content.includes(`bg-gray-100 px-2 py-1 rounded">${filters.type}`);
            if (!hasMediaType) {
              shouldShow = false;
            }
          }
          
          // Filter by tag
          if (filters.tag && shouldShow) {
            const hasTag = content.includes(`#${filters.tag}`);
            if (!hasTag) {
              shouldShow = false;
            }
          }
          
          // Show/hide marker
          (marker as HTMLElement).style.display = shouldShow ? 'block' : 'none';
        }
      });
    }
  }, [map]);

  if (showLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="h-screen w-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Glassy Navbar */}
      <GlassyNavbar 
        onAddStory={handleAddStory} 
        onAuthClick={() => setShowAuthModal(true)}
        onToggleFeed={() => setShowStoryFeed(!showStoryFeed)}
        onToggleUserPanel={() => setShowUserPanel(!showUserPanel)}
      />
      
      {/* Main Content */}
      <div className="pt-16 h-full relative z-10 flex">
        {/* Map Container */}
        <div className={`relative transition-all duration-300 ${
          showStoryFeed || showUserPanel ? 'w-2/3' : 'w-full'
        }`}>
          <MapContainer
            onMapClick={handleMapClick}
            onMapReady={handleMapReady}
          />
        </div>

        {/* Sidebar */}
        {(showStoryFeed || showUserPanel) && (
          <div className="w-1/3 h-full bg-white border-l border-gray-200 flex flex-col">
            {/* User Panel */}
            {showUserPanel && (
              <div className="p-4 border-b border-gray-200">
                <UserPanel />
              </div>
            )}

            {/* Story Feed */}
            {showStoryFeed && (
              <div className="flex-1">
                <StoryFeed
                  onPostClick={handlePostClick}
                  selectedTag={selectedTag}
                  selectedType={selectedType}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            {/* Leaderboard (if both panels are shown) */}
            {showUserPanel && showStoryFeed && (
              <div className="p-4 border-t border-gray-200">
                <Leaderboard />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Form Modal */}
      {selectedLocation && (
        <SubmissionForm
          isOpen={isSubmissionFormOpen}
          onClose={() => {
            setIsSubmissionFormOpen(false);
            setSelectedLocation(null);
          }}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Loading Overlay */}
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