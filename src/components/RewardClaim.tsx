'use client';

import { useState } from 'react';
import { getUserXP } from '../lib/rewards';
import { xrplNFTService } from '../lib/xrpl-nft';

interface RewardClaimProps {
  walletAddress?: string;
  walletSeed?: string;
}

export default function RewardClaim({ walletAddress, walletSeed }: RewardClaimProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  const userXP = walletAddress ? getUserXP(walletAddress) : null;
  const canClaim = userXP && userXP.totalXP > 0 && walletSeed;

  const handleClaimRewards = async () => {
    if (!walletSeed || !userXP) return;

    setIsClaiming(true);
    setClaimResult(null);

    try {
      const result = await xrplNFTService.claimRewards(walletSeed, userXP.totalXP);
      setClaimResult(result);

      if (result.success) {
        console.log('🎉 XRP rewards claimed successfully:', result);
      } else {
        console.error('❌ Failed to claim rewards:', result.error);
      }
    } catch (error) {
      console.error('❌ Error claiming rewards:', error);
      setClaimResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700">XRP Rewards</h3>
        <p className="text-sm text-gray-600">Connect wallet to claim rewards</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">XRP Rewards (RLUSD Simulation)</h3>
      
      {userXP && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total XP:</span>
            <span className="font-bold text-lg text-blue-600">{userXP.totalXP}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Estimated XRP:</span>
            <span className="font-bold text-green-600">{Math.floor(userXP.totalXP * 0.1)} XRP</span>
          </div>
          <div className="text-xs text-gray-500">
            Rate: 1 XP = 0.1 XRP (testnet)
          </div>
        </div>
      )}

      {canClaim ? (
        <button
          onClick={handleClaimRewards}
          disabled={isClaiming}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isClaiming ? 'Claiming...' : 'Claim XRP Rewards'}
        </button>
      ) : (
        <div className="text-sm text-gray-600">
          {!walletSeed ? 'XRPL wallet not connected' : 'No XP to claim'}
        </div>
      )}

      {claimResult && (
        <div className={`mt-4 p-3 rounded-lg ${claimResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-medium ${claimResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {claimResult.success ? '✅ Reward Claimed!' : '❌ Claim Failed'}
          </h4>
          {claimResult.success && (
            <div className="text-sm text-green-700 mt-1">
              <div>Amount: {claimResult.amount} XRP</div>
              <div>Transaction: {claimResult.transactionHash?.slice(0, 20)}...</div>
            </div>
          )}
          {claimResult.error && (
            <div className="text-sm text-red-700 mt-1">
              Error: {claimResult.error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <div>• XRPL Testnet only</div>
        <div>• 1 XP = 0.1 XRP (simulation)</div>
        <div>• Real RLUSD will replace XRP in production</div>
      </div>
    </div>
  );
} 