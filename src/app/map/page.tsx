'use client';

import { useState, useCallback, useEffect } from 'react';
import { Post } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import GlassyNavbar from '@/components/GlassyNavbar';
import MapContainer from '@/components/MapContainer';
import UploadModal from '@/components/UploadModal';
import AuthModal from '@/components/AuthModal';
import LoadingPage from '@/components/LoadingPage';
import mapboxgl from 'mapbox-gl';

export default function MapPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  
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
    setIsModalOpen(true);
  }, []);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const handleAddStory = useCallback(() => {
    // Use a default location or get current map center
    setSelectedLocation({ lat: 40.7128, lng: -74.006 });
    setIsModalOpen(true);
  }, []);

  const handlePostCreated = useCallback((newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    if (map) {
      addNewPostToMap(newPost, map);
    }
  }, [map, setPosts, addNewPostToMap]);

  if (showLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="h-screen w-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Glassy Navbar */}
      <GlassyNavbar onAddStory={handleAddStory} onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Map Container - adjusted to account for navbar */}
      <div className="pt-16 h-full relative z-10">
        <MapContainer
          onMapClick={handleMapClick}
          onMapReady={handleMapReady}
        />
      </div>

      {/* Upload Modal */}
      {selectedLocation && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
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