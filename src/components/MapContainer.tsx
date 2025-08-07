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
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.current.on('load', () => {
      console.log('Map loaded, adding terrain and buildings...');
      
      // Add terrain source
      map.current!.addSource('mapbox-terrain', {
        'type': 'vector',
        'url': 'mapbox://mapbox.mapbox-terrain-v2'
      });

      // Add terrain layer
      map.current!.addLayer({
        'id': 'terrain',
        'type': 'hillshade',
        'source': 'mapbox-terrain',
        'source-layer': 'terrain',
        'paint': {
          'hillshade-shadow-color': '#000000',
          'hillshade-highlight-color': '#FFFFFF',
          'hillshade-accent-color': '#000000'
        }
      });

      // Add building layer for 3D buildings
      map.current!.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });

      handleMapReady();
    });

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