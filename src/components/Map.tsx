'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Region } from '@/types';

interface MapProps {
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
}

// Mock regions data - in production this would come from an API
const mockRegions: Region[] = [
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    coordinates: [-74.006, 40.7128],
    population: 8336817,
    timezone: 'America/New_York'
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    coordinates: [-0.1276, 51.5074],
    population: 8982000,
    timezone: 'Europe/London'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    coordinates: [139.6917, 35.6895],
    population: 13929286,
    timezone: 'Asia/Tokyo'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    coordinates: [72.8777, 19.076],
    population: 12478447,
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'lagos',
    name: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    coordinates: [3.3792, 6.5244],
    population: 14800000,
    timezone: 'Africa/Lagos'
  }
];

export default function Map({ selectedRegion, setSelectedRegion }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // You'll need to set your Mapbox access token
      center: [0, 20],
      zoom: 2,
      attributionControl: false
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      addRegionMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addRegionMarkers = () => {
    if (!map.current) return;

    // Add markers for each region
    mockRegions.forEach((region) => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'region-marker';
      markerEl.innerHTML = `
        <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <div class="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      `;

      // Add click handler
      markerEl.addEventListener('click', () => {
        setSelectedRegion(region);
      });

      // Create and add marker
      new mapboxgl.Marker(markerEl)
        .setLngLat(region.coordinates)
        .addTo(map.current!);
    });
  };

  // Update map when region is selected
  useEffect(() => {
    if (map.current && selectedRegion) {
      map.current.flyTo({
        center: selectedRegion.coordinates,
        zoom: 8,
        duration: 1000
      });
    }
  }, [selectedRegion]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [0, 20],
                zoom: 2,
                duration: 1000
              });
              setSelectedRegion(null);
            }
          }}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading map...</div>
        </div>
      )}
    </div>
  );
} 