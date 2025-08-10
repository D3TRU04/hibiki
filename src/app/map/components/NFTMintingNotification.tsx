'use client';

import { useState, useEffect } from 'react';
import { Coins, ExternalLink, CheckCircle, X } from 'lucide-react';

interface NFTMintingNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  tokenId?: string;
  transactionHash?: string;
  postCid?: string;
}

export default function NFTMintingNotification({ isVisible, onClose, tokenId, transactionHash, postCid }: NFTMintingNotificationProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => { setIsClosing(true); setTimeout(() => { onClose(); setIsClosing(false); }, 300); }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); setIsClosing(false); }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}>
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-xl border border-purple-500/20 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-gold" />
              <h3 className="text-white font-semibold">NFT Minted Successfully!</h3>
            </div>
            <p className="text-purple-100 text-sm mb-3">Your story has been minted as an NFT on the blockchain.</p>
            <div className="space-y-1 text-xs text-purple-200">
              {tokenId && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Token ID:</span>
                  <span className="font-mono">{tokenId.slice(0, 20)}...</span>
                </div>
              )}
              {postCid && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Post CID:</span>
                  <span className="font-mono">{postCid.slice(0, 20)}...</span>
                </div>
              )}
              {transactionHash && (
                <a href={`https://explorer.ripple.com/transactions/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-gold hover:text-yellow-300 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>View on Explorer</span>
                </a>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="flex-shrink-0 text-purple-200 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 