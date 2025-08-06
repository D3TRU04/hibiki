'use client';

import { useState, useCallback } from 'react';
import { Post } from '@/lib/types';
import { useMap } from '@/hooks/useMap';
import GlassyNavbar from '@/components/GlassyNavbar';
import MapContainer from '@/components/MapContainer';
import UploadModal from '@/components/UploadModal';
import mapboxgl from 'mapbox-gl';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const {
    map,
    setMap,
    setPosts,
    isLoading,
    addNewPostToMap,
  } = useMap();

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

  return (
    <div className="h-screen w-screen relative space-background">
      {/* Glassy Navbar */}
      <GlassyNavbar onAddStory={handleAddStory} />
      
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

      {/* Kleo Intro Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center space-y-8 max-w-md mx-4">
            {/* Animated Globe */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-spin-slow"></div>
              </div>
              {/* Floating Story Points */}
              <div className="absolute inset-0">
                <div className="absolute top-4 left-8 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-8 right-6 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-6 left-12 w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>

            {/* Kleo Logo & Title */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Kleo
                </h1>
              </div>
              <p className="text-xl text-gray-300 font-light">
                Share Your Stories
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connect with the world through stories, memories, and experiences. 
                Every place has a story waiting to be told.
              </p>
            </div>

            {/* Loading Animation */}
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Connecting Lines Animation */}
            <div className="relative h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-gray-400 text-sm">
              <span className="animate-pulse">Loading your world...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
