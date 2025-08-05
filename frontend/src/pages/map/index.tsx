'use client';

import { useState } from 'react';
import { Post } from '../../types/backend';
import MapContainer from './components/MapContainer';
import MapControls from './components/MapControls';
import PinMarker from './components/PinMarker';
import UploadModal from './components/UploadModal';
import NavBar from './components/NavBar';
import LoadingScreen from './components/LoadingScreen';

export default function MapPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsModalOpen(true);
  };

  const handleAddStory = () => {
    // This would get the current map center
    // For now, we'll use a default location
    setSelectedLocation({ lat: 40.7128, lng: -74.006 });
    setIsModalOpen(true);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostClick = (postId: string) => {
    setActivePostId(activePostId === postId ? null : postId);
  };

  const handleMapLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}

      {/* Navigation Bar */}
      <NavBar />

      {/* Map Container - Fixed positioning to fill remaining space */}
      <div className="absolute inset-0 top-16 bottom-0 left-0 right-0">
        <MapContainer
          onMapClick={handleMapClick}
          onPostCreated={handlePostCreated}
          onMapLoaded={handleMapLoaded}
        />
      </div>

      {/* Map Controls */}
      <MapControls
        postsCount={posts.length}
        onAddStory={handleAddStory}
      />

      {/* Pin Markers */}
      {posts.map((post) => (
        <PinMarker
          key={post.id}
          post={post}
          onClick={() => handlePostClick(post.id!)}
          isActive={activePostId === post.id}
        />
      ))}

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
    </div>
  );
} 