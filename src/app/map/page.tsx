'use client';

import dynamic from 'next/dynamic';
import { withRetry } from '@/lib/dynamicRetry';

const MapView = dynamic(withRetry(() => import('./components/MapView')), { ssr: false, loading: () => null });

export default function MapPage() {
  return <MapView />;
} 