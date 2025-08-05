'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './components/LoadingScreen';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingScreen />;
} 