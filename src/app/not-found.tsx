import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto">
          <span className="text-gray-900 font-bold text-xl">K</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-300 text-sm">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/map"
          className="inline-block px-6 py-3 bg-gradient-to-r from-gold to-yellow-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-gold transition-all duration-200"
        >
          Go to Map
        </Link>
      </div>
    </div>
  );
} 