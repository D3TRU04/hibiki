'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, User, Star, UserCheck } from 'lucide-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import UserPanelHeader from './UserPanelHeader';
import UserPanelDetails from './UserPanelDetails';
import UserPanelRewards from './UserPanelRewards';

export default function UserPanel() {
  const { wallet, isLoading, isConnected, disconnect } = useDynamicWallet();
  const [showDetails, setShowDetails] = useState(false);

  const walletProofs: string[] = [];

  const handleDisconnect = () => {
    disconnect();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !wallet) {
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
            onClick={() => {
              alert('Please use the Connect Wallet button in the header to connect your wallet.');
            }}
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
      <UserPanelHeader onDisconnect={handleDisconnect} />
      <UserPanelDetails />
      {wallet && (
        <div className="mb-4">
          <Link
            href={`/profile/${wallet.address}`}
            className="w-full flex items-center justify-center space-x-2 bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>View My Profile</span>
          </Link>
        </div>
      )}
      <UserPanelRewards />
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>{showDetails ? 'Hide' : 'Show'} Wallet Details</span>
      </button>
      {showDetails && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Wallet Information</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-gray-900 break-all">{wallet.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-900">{wallet.type}</span>
            </div>
            {wallet.ensName && (
              <div className="flex justify-between">
                <span className="text-gray-600">ENS:</span>
                <span className="text-gray-900">{wallet.ensName}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {walletProofs.length > 0 && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 text-sm mb-2">Recent Proofs</h4>
          <div className="space-y-1">
            {walletProofs.slice(0, 3).map((proof, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <Star className="w-3 h-3 text-blue-500" />
                <span className="text-blue-700 font-mono">{proof.slice(0, 8)}...</span>
              </div>
            ))}
            {walletProofs.length > 3 && (
              <p className="text-xs text-blue-600">+{walletProofs.length - 3} more proofs</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 