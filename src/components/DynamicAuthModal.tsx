'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { X, User, LogOut, Wallet, Sparkles } from 'lucide-react';
import { getWalletDisplayName, getWalletTypeDisplay } from '@/lib/identity';

interface DynamicAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DynamicAuthModal({ isOpen, onClose }: DynamicAuthModalProps) {
  const { wallet, isLoading, isConnected, disconnect, user } = useDynamicWallet();
  const { setShowAuthFlow } = (useDynamicContext() as unknown as { setShowAuthFlow?: Function });
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const openDynamicAuth = useCallback(async () => {
    try {
      setShowAuthFlow?.(false);
      await sleep(60);
      setShowAuthFlow?.(true);
    } catch {}
  }, [setShowAuthFlow]);
  const [showDetails, setShowDetails] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const envChainId = (process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '1449000').trim();
  const toHex = (id: string) => id.startsWith('0x') ? id.toLowerCase() : `0x${parseInt(id, 10).toString(16)}`;
  const expectedChainHex = useMemo(() => toHex(envChainId), [envChainId]);
  const expectedChainName = process.env.NEXT_PUBLIC_EVM_CHAIN_NAME;
  const expectedRpcUrl = process.env.NEXT_PUBLIC_EVM_RPC_URL;
  const expectedCurrency = process.env.NEXT_PUBLIC_EVM_CURRENCY;
  const expectedBlockExplorer = process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_URL;
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) { setNeedsNetworkSwitch(false); return; }
    try {
      const current = (window as any).ethereum.chainId?.toLowerCase();
      setNeedsNetworkSwitch(!!current && current !== expectedChainHex);
    } catch { setNeedsNetworkSwitch(false); }
  }, [expectedChainHex, isOpen]);

  // When the modal opens and user is not connected, proactively open Dynamic auth flow (non-blocking)
  useEffect(() => {
    if (isOpen && !isConnected) {
      void openDynamicAuth();
    }
  }, [isOpen, isConnected, openDynamicAuth]);

  async function directConnectXRPL() {
    try {
      await openDynamicAuth();
      const eth = (window as any).ethereum;
      if (!eth) {
        window.open('https://metamask.io/download/', '_blank');
        setConnectError('MetaMask not detected. Please install MetaMask and reload.');
        return;
      }
      if (!expectedChainName || !expectedRpcUrl || !expectedCurrency) {
        setConnectError('Missing network env: EVM_CHAIN_NAME / EVM_RPC_URL / EVM_CURRENCY');
        return;
      }
      const addParams: any = {
        chainId: expectedChainHex,
        chainName: expectedChainName,
        rpcUrls: [expectedRpcUrl],
        nativeCurrency: { name: expectedCurrency, symbol: expectedCurrency, decimals: 18 },
      };
      if (expectedBlockExplorer) addParams.blockExplorerUrls = [expectedBlockExplorer];
      try { await eth.request({ method: 'wallet_addEthereumChain', params: [addParams] }); } catch { /* ignore if already added */ }
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: expectedChainHex }] });
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        (window as any).local_xrpl_wallet = { address: accounts[0], type: 'EVM', isConnected: true };
        try { window.dispatchEvent(new Event('kleo_wallet_update')); } catch {}
        onClose();
        setConnectError(null);
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Failed to connect. Please check MetaMask popup.';
      setConnectError(msg);
      openDynamicAuth();
    }
  }

  async function switchNetwork() {
    try {
      const eth = (window as any).ethereum;
      if (!eth) return;
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: expectedChainHex }] });
    } catch (err: any) {
      // 4902: unknown chain; try adding then switching
      if (err?.code === 4902 && expectedRpcUrl) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: expectedChainHex,
              chainName: expectedChainName,
              rpcUrls: [expectedRpcUrl],
              nativeCurrency: { name: expectedCurrency, symbol: expectedCurrency, decimals: 18 },
            }],
          });
          await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: expectedChainHex }] });
        } catch {}
      }
    }
  }

  if (!isOpen) return null;

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

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
            {needsNetworkSwitch && (
              <div className="p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm">
                <div className="mb-2 font-medium">Wrong network</div>
                <p className="mb-3">Your wallet is not on a supported network. Switch to <b>{expectedChainName}</b> to continue.</p>
                <button onClick={switchNetwork} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded">Switch network</button>
              </div>
            )}
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

  // Not connected - show connect options immediately (no blocking loader)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button onClick={() => void openDynamicAuth()} className="w-full bg-gold hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors">
            Connect wallet
          </button>
          <button onClick={() => void directConnectXRPL()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Connect with MetaMask (XRPL EVM)
          </button>
          {connectError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{connectError}</div>
          )}
        </div>
      </div>
    </div>
  );
} 