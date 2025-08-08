'use client';

import { useState } from 'react';
import { DynamicConnectButton } from '@dynamic-labs/sdk-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { X, User, LogOut, Wallet, Coins, Trophy, Sparkles } from 'lucide-react';
import { getWalletDisplayName, getWalletTypeDisplay } from '@/lib/identity';

interface DynamicAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DynamicAuthModal({ isOpen, onClose }: DynamicAuthModalProps) {
  const { wallet, isLoading, isConnected, disconnect, user } = useDynamicWallet();
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && wallet) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Wallet Connected</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getWalletDisplayName(wallet)}
                </p>
                <p className="text-sm text-gray-500">
                  {getWalletTypeDisplay(wallet)} • {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
              </div>
            </div>

            {/* User Details */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-mono text-gray-900">{user.id.slice(0, 8)}...</span>
                </div>
                {user.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                )}
                {user.ensName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ENS:</span>
                    <span className="text-sm text-gray-900">{user.ensName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Wallet Details</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Wallet</span>
              </button>
            </div>

            {/* Detailed Wallet Info */}
            {showDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900 mb-2">Wallet Information</h4>
                <div className="space-y-1 text-sm">
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
                      <span className="text-gray-600">ENS Name:</span>
                      <span className="text-gray-900">{wallet.ensName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Wallet connected successfully! You can now post stories and earn rewards.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not connected - show connect options
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-600">
              Connect your wallet to share stories, earn rewards, and track your contributions on Kleo.
            </p>
          </div>

          {/* Supported Wallets */}
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Supported Wallets</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>MetaMask (Ethereum)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>WalletConnect (Multi-chain)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Coinbase Wallet (Ethereum)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>XRPL Wallets (via fallback)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <div className="space-y-3">
            <DynamicConnectButton />
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By connecting your wallet, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Benefits of Connecting</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span>Earn XP and rewards for your contributions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-gold" />
                <span>Claim RLUSD tokens for your stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Track your contribution history</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 