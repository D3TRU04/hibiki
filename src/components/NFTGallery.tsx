'use client';

import { useState, useEffect } from 'react';
import { Coins, ExternalLink, Video, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { graphClient, GraphQLNFT } from '@/lib/graph-client';

interface NFTGalleryProps {
  walletAddress: string;
}

export default function NFTGallery({ walletAddress }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<GraphQLNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userNFTs = await graphClient.getNFTsByWallet(walletAddress);
        setNfts(userNFTs);
      } catch (err) {
        console.error('Error loading NFTs:', err);
        setError('Failed to load NFTs');
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress) {
      loadNFTs();
    }
  }, [walletAddress]);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNFTIcon = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata);
      const mediaType = parsed.attributes?.find((attr: { trait_type?: string; value?: string }) => attr.trait_type === 'Media Type')?.value;
      
      switch (mediaType) {
        case 'video':
          return <Video className="w-4 h-4" />;
        case 'news':
          return <LinkIcon className="w-4 h-4" />;
        default:
          return <MessageSquare className="w-4 h-4" />;
      }
    } catch {
      return <Coins className="w-4 h-4" />;
    }
  };

  const getNFTTitle = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata);
      return parsed.name || 'Kleo NFT';
    } catch {
      return 'Kleo NFT';
    }
  };

  const getNFTDescription = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata);
      return parsed.description || 'No description available';
    } catch {
      return 'No description available';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-3"></div>
          <p className="text-gray-300">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center space-x-2 mb-4">
        <Coins className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-semibold text-white">NFT Collection</h3>
        <span className="text-gray-300 text-sm">({nfts.length})</span>
      </div>

      {nfts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-gold/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getNFTIcon(nft.metadata)}
                  <span className="text-white font-medium text-sm">
                    {getNFTTitle(nft.metadata)}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  #{nft.token_id.slice(0, 8)}...
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {getNFTDescription(nft.metadata)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(nft.timestamp)}</span>
                <a
                  href={`https://explorer.ripple.com/transactions/${nft.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-gold transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No NFTs yet</h3>
          <p className="text-gray-400">
            Start sharing stories to mint your first NFT!
          </p>
        </div>
      )}
    </div>
  );
} 