'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/map');
  }, [router]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mx-auto">
          <span className="text-gray-900 font-bold text-sm">K</span>
        </div>
        <p className="text-white text-sm">Redirecting to Kleo...</p>
      </div>
    </div>
  );
}
