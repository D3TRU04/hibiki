'use client';

import { useState } from 'react';
import { Wallet, User, Trophy, Star, LogOut, Coins } from 'lucide-react';
import { useWallet, getWalletDisplayName, getWalletTypeDisplay } from '@/lib/identity';
import { getUserXP, getLevelTitle, getClaimableRLUSD, getWalletProofs } from '@/lib/rewards';

export default function UserPanel() {
  const wallet = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  const userXP = wallet.isConnected && wallet.address 
    ? getUserXP(wallet.address)
    : { totalXP: 0, level: 1, posts: 0 };

  const claimableRLUSD = wallet.isConnected && wallet.address 
    ? getClaimableRLUSD(wallet.address)
    : 0;

  const walletProofs = wallet.isConnected && wallet.address 
    ? getWalletProofs(wallet.address)
    : [];

  const handleConnect = async () => {
    await wallet.connect();
  };

  const handleDisconnect = () => {
    wallet.disconnect();
  };

  const handleClaimRLUSD = () => {
    if (claimableRLUSD > 0) {
      alert(`Claiming ${claimableRLUSD} RLUSD! (This would trigger a smart contract call in production)`);
    } else {
      alert('No RLUSD available to claim. Keep contributing to earn more!');
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your wallet to earn XP and track your contributions
          </p>
          <button
            onClick={handleConnect}
            className="w-full px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Wallet Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center">
          <Wallet className="w-5 h-5 text-gray-900" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {getWalletDisplayName(wallet)}
          </h3>
          <p className="text-xs text-gray-500">
            {getWalletTypeDisplay(wallet)} • Connected
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* XP Display */}
      <div className="bg-gradient-to-r from-gold to-yellow-400 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 font-medium">
              Level {userXP.level} {getLevelTitle(userXP.level)}
            </p>
            <p className="text-xs text-gray-800">
              {userXP.totalXP} Cookie Points
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-bold text-gray-900">
              {userXP.posts} posts
            </span>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-2 bg-white bg-opacity-30 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((userXP.totalXP % 100) / 100 * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* RLUSD Display */}
      {claimableRLUSD > 0 && (
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">
                Claimable Rewards
              </p>
              <p className="text-xs text-green-100">
                {claimableRLUSD} RLUSD available
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-white" />
              <button
                onClick={handleClaimRLUSD}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded text-white hover:bg-opacity-30 transition-colors"
              >
                Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">{userXP.totalXP}</div>
          <div className="text-xs text-gray-500">Total XP</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">{userXP.posts}</div>
          <div className="text-xs text-gray-500">Stories</div>
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        {showDetails ? 'Hide' : 'Show'} Details
      </button>

      {/* Detailed Info */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Wallet Details</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Address:</span> {wallet.address}</p>
              <p><span className="font-medium">Type:</span> {getWalletTypeDisplay(wallet)}</p>
              {wallet.ensName && (
                <p><span className="font-medium">ENS:</span> {wallet.ensName}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Achievements</h4>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600">
                Level {userXP.level} {getLevelTitle(userXP.level)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rewards</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Claimable RLUSD:</span> {claimableRLUSD}</p>
              <p><span className="font-medium">Proofs Generated:</span> {walletProofs.length}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Next Level</h4>
            <div className="text-xs text-gray-600">
              {userXP.level < 10 ? (
                <p>Need {Math.max(0, (userXP.level * 50) - userXP.totalXP)} more XP for Level {userXP.level + 1}</p>
              ) : (
                <p>Maximum level reached! 🎉</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 