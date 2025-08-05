'use client';

import { useMap } from '../hooks/useMap';
import { Post } from '../../../types/backend';
import { useEffect, useRef } from 'react';

interface MapContainerProps {
  onMapClick: (lat: number, lng: number) => void;
  onPostCreated: (post: Post) => void;
  onMapLoaded?: () => void;
}

export default function MapContainer({ onMapClick, onMapLoaded }: MapContainerProps) {
  const { mapContainer, map, isLoading } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log('Map container dimensions:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      });
    }
  }, []);

  // Handle map clicks
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    onMapClick(lat, lng);
  };

  // Add click handler when map is ready
  if (map) {
    // Remove existing listeners to avoid duplicates
    map.off('click', handleMapClick);
    map.on('click', handleMapClick);
  }

  // Call onMapLoaded when loading is complete
  if (!isLoading && onMapLoaded) {
    onMapLoaded();
  }

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
} 