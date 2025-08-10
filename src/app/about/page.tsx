'use client';

import Link from 'next/link';
import { Globe, Shield, Coins, Users, MapPin, FileText, Sparkles, Award, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">K</span>
              </div>
              <h1 className="text-2xl font-bold text-white">About Kleo</h1>
            </div>
            <Link 
              href="/Map" 
              className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-medium rounded-lg transition-all transform hover:scale-105"
            >
              Back to Map
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-12 h-12 text-gray-900" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Share Your Stories with the World
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Kleo is a decentralized storytelling platform that connects people through location-based stories, 
            memories, and experiences. Built on IPFS and XRPL for true censorship resistance.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Censorship Resistant</h3>
              <p className="text-gray-300">
                Built on IPFS and blockchain technology to ensure your stories can never be silenced or removed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
              <p className="text-gray-300">
                Every story contributes to the global tapestry of human experience and shared memories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Reward Based</h3>
              <p className="text-gray-300">
                Earn XRP rewards for your contributions and build reputation in the community.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3D Interactive Globe</h3>
              <p className="text-gray-300 text-sm">
                Explore stories on a beautiful 3D globe with terrain and buildings. Click anywhere to discover stories.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Media Stories</h3>
              <p className="text-gray-300 text-sm">
                Share text, audio, or video stories. Every format is supported and rewarded.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Farcaster-Style Rewards</h3>
              <p className="text-gray-300 text-sm">
                Build reputation with far scores and earn XRP rewards for your contributions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">XRPL Integration</h3>
              <p className="text-gray-300 text-sm">
                Generate wallets, earn XRP rewards, and participate in the decentralized economy.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Location-Based</h3>
              <p className="text-gray-300 text-sm">
                Every story is tied to a specific location, creating a rich tapestry of place-based memories.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Beautiful UI</h3>
              <p className="text-gray-300 text-sm">
                Modern, responsive design with a stunning white and gold theme that works on all devices.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Frontend</h3>
              <p className="text-gray-300 text-sm">Next.js 15, React 19, TypeScript, TailwindCSS</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Mapping</h3>
              <p className="text-gray-300 text-sm">Mapbox GL JS 3.14 with 3D globe and terrain</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Storage</h3>
              <p className="text-gray-300 text-sm">IPFS via Pinata for decentralized data</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Blockchain</h3>
              <p className="text-gray-300 text-sm">XRPL for wallet integration and rewards</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Explore the Globe</h3>
              <p className="text-gray-300">
                Navigate the 3D globe and discover stories from around the world. Click on any location to see what others have shared.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Share Your Story</h3>
              <p className="text-gray-300">
                Click anywhere on the map to add your own story. Share text, audio, or video memories tied to that location.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Earn Rewards</h3>
              <p className="text-gray-300">
                Build your reputation with far scores and earn XRP rewards for your contributions to the community.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Share Your Story?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the global community of storytellers and start building your legacy on the decentralized web.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/Map" 
              className="px-8 py-4 bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Start Exploring
            </Link>
            <Link 
              href="/stories" 
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all transform hover:scale-105 border border-white/30"
            >
              Browse Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 