'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kleo</h1>
          <p className="text-gray-600">Share your local stories</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-500">
          <p className="text-sm">Loading your world...</p>
        </div>
      </div>
    </div>
  );
} 