'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  onMapClick: (lat: number, lng: number) => void;
  onMapReady: (map: mapboxgl.Map) => void;
}

export default function MapContainer({ onMapClick, onMapReady }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const isInitialized = useRef(false);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    onMapClick(lat, lng);
  }, [onMapClick]);

  const handleMapReady = useCallback(() => {
    console.log('Map ready callback triggered');
    if (map.current) {
      onMapReady(map.current);
    }
  }, [onMapReady]);

  useEffect(() => {
    console.log('MapContainer useEffect triggered', { 
      hasContainer: !!mapContainer.current, 
      isInitialized: isInitialized.current 
    });
    
    if (!mapContainer.current || isInitialized.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    console.log('Initializing Mapbox map...');
    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // Satellite style
      center: [0, 0], // Center on the world
      zoom: 1, // Show the whole world
      projection: 'globe', // Enable 3D globe
      maxZoom: 22,
      minZoom: 1,
    });

    map.current.on('load', handleMapReady);
    map.current.on('click', handleMapClick);

    isInitialized.current = true;
    console.log('Mapbox map initialized');

    return () => {
      console.log('MapContainer cleanup');
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.off('load', handleMapReady);
        map.current.remove();
        isInitialized.current = false;
      }
    };
  }, [handleMapClick, handleMapReady]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
    />
  );
} 