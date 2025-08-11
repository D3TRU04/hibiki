'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false, loading: () => null });

export default function MapPage() {
  return <MapView />;
} 