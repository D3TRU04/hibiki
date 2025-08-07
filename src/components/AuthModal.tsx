'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { getRewardSystem, generateWallet, importWallet, claimRewards, getFaucetFunds } from '@/lib/api';
import { X, Mail, Lock, User, LogOut, Wallet, Coins, Trophy, Sparkles } from 'lucide-react';
import { User as UserType, RewardSystem } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<UserType | null>(null);
  const [rewardSystem, setRewardSystem] = useState<RewardSystem | null>(null);
  const [showWalletSection, setShowWalletSection] = useState(false);
  const [walletSeed, setWalletSeed] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const rewards = await getRewardSystem(currentUser.id);
        setRewardSystem(rewards);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        await authService.signUp(email);
        setMessage('Account created successfully!');
        setEmail('');
        setPassword('');
        await loadUser();
      } else {
        const user = await authService.signIn(email);
        if (user) {
          onClose();
          setEmail('');
          setPassword('');
          await loadUser();
        } else {
          setMessage('Invalid credentials');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setRewardSystem(null);
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWallet = async () => {
    setLoading(true);
    try {
      const wallet = await generateWallet();
      setWalletAddress(wallet.address);
      setMessage('Wallet generated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallet';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!walletSeed.trim()) {
      setMessage('Please enter a wallet seed');
      return;
    }

    setLoading(true);
    try {
      const wallet = await importWallet(walletSeed);
      setWalletAddress(wallet.address);
      setMessage('Wallet imported successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!walletAddress.trim()) {
      setMessage('Please generate or import a wallet first');
      return;
    }

    setLoading(true);
    try {
      await authService.connectXRPLWallet(walletAddress);
      setMessage('XRPL wallet connected successfully!');
      await loadUser();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const success = await claimRewards(user.id);
      if (success) {
        setMessage('Rewards claimed successfully!');
        await loadUser();
      } else {
        setMessage('No rewards available to claim');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim rewards';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGetFaucetFunds = async () => {
    if (!walletAddress.trim()) {
      setMessage('Please generate or import a wallet first');
      return;
    }

    setLoading(true);
    try {
      const success = await getFaucetFunds(walletAddress);
      if (success) {
        setMessage('Faucet funds received!');
      } else {
        setMessage('Failed to get faucet funds');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get faucet funds';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">K</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kleo</h2>
            </div>
            <p className="text-gray-600">
              {user ? 'Welcome back!' : (isSignUp ? 'Create your account' : 'Sign in to your account')}
            </p>
          </div>

          {user ? (
            /* User Profile & Rewards */
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gold to-yellow-400 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-900" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{user.email || 'Anonymous'}</p>
                    <p className="text-gray-700 text-sm">
                      {user.xrpl_address ? 'XRPL Wallet Connected' : 'No wallet connected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward System Display */}
              {rewardSystem && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-gold" />
                    <h3 className="font-semibold text-gray-900">Reward System</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span>Far Score: {rewardSystem.far_score}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-gold" />
                      <span>Points: {rewardSystem.contribution_points}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gold" />
                      <span>Tier: {rewardSystem.reputation_tier}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4 text-gold" />
                      <span>Pending: {rewardSystem.pending_rewards} XRP</span>
                    </div>
                  </div>

                  {rewardSystem.pending_rewards > 0 && (
                    <button
                      onClick={handleClaimRewards}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                      {loading ? 'Claiming...' : `Claim ${rewardSystem.pending_rewards} XRP`}
                    </button>
                  )}
                </div>
              )}

              {/* XRPL Wallet Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">XRPL Wallet</h3>
                  <button
                    onClick={() => setShowWalletSection(!showWalletSection)}
                    className="text-gold hover:text-yellow-600 text-sm"
                  >
                    {showWalletSection ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showWalletSection && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleGenerateWallet}
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Generate
                      </button>
                      <button
                        onClick={handleGetFaucetFunds}
                        disabled={loading || !walletAddress}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Faucet
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={walletSeed}
                        onChange={(e) => setWalletSeed(e.target.value)}
                        placeholder="Enter wallet seed to import"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleImportWallet}
                          disabled={loading || !walletSeed}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          Import
                        </button>
                        <button
                          onClick={handleConnectWallet}
                          disabled={loading || !walletAddress}
                          className="flex-1 bg-gold hover:bg-yellow-500 text-gray-900 py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          Connect
                        </button>
                      </div>
                    </div>

                    {walletAddress && (
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                        {walletAddress}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <LogOut size={16} />
                <span>{loading ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Enter your password (optional)"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('error') || message.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-gray-900 py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-gold hover:text-yellow-600 text-sm transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 