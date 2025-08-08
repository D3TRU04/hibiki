'use client';

import { Trophy, Star, Coins } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { getUserXP, getLevelTitle, getClaimableRLUSD } from '@/lib/rewards';

export default function UserPanelRewards() {
  const { wallet, isConnected } = useDynamicWallet();

  const userXP = wallet && isConnected 
    ? getUserXP(wallet.address)
    : { totalXP: 0, level: 1, posts: 0 };

  const claimableRLUSD = wallet && isConnected 
    ? getClaimableRLUSD(wallet.address)
    : 0;

  const handleClaimRLUSD = () => {
    if (claimableRLUSD > 0) {
      alert(`Claiming ${claimableRLUSD} RLUSD! (This would trigger a smart contract call in production)`);
    } else {
      alert('No RLUSD available to claim. Keep contributing to earn more!');
    }
  };

  return (
    <>
      {/* XP and Level */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gray-700">Level {userXP.level}</span>
          </div>
          <span className="text-xs text-gray-500">{userXP.totalXP} XP</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((userXP.totalXP % 100) / 100 * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{userXP.posts} posts</span>
          <span>{getLevelTitle(userXP.level)}</span>
        </div>
      </div>

      {/* RLUSD Rewards */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gray-700">RLUSD Rewards</span>
          </div>
          <span className="text-sm font-mono text-gray-900">{claimableRLUSD.toFixed(2)} RLUSD</span>
        </div>
        
        {claimableRLUSD > 0 && (
          <button
            onClick={handleClaimRLUSD}
            className="w-full bg-gold hover:bg-yellow-500 text-white py-2 px-3 rounded text-sm transition-colors"
          >
            Claim Rewards
          </button>
        )}
      </div>
    </>
  );
} 