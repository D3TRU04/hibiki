'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">!</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
            <p className="text-gray-300 text-sm">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-gold to-yellow-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-gold transition-all duration-200"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 