'use client';

import { DynamicContextProvider, DynamicWagmiConnector } from '@dynamic-labs/sdk-react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { Wallet } from './types';

// Dynamic.xyz configuration
const DYNAMIC_CONFIG = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'demo',
  walletConnectors: [EthereumWalletConnectors],
  settings: {
    walletList: ['metamask', 'walletconnect', 'coinbase'],
    eventsCallbacks: {
      onAuthSuccess: (args: any) => {
        console.log('Dynamic auth success:', args);
      },
      onAuthError: (args: any) => {
        console.error('Dynamic auth error:', args);
      },
      onLogout: () => {
        console.log('Dynamic logout');
      },
    },
  },
};

// Local storage keys
const WALLET_STORAGE_KEY = 'kleo_dynamic_wallet';
const USER_STORAGE_KEY = 'kleo_dynamic_user';

interface DynamicWallet {
  address: string;
  type: "EVM" | "XRPL";
  ensName?: string;
  email?: string;
}

interface DynamicUser {
  id: string;
  email?: string;
  wallet_address?: string;
  wallet_type?: "EVM" | "XRPL";
  ensName?: string;
}

export class DynamicAuthService {
  private static instance: DynamicAuthService;
  private currentUser: DynamicUser | null = null;
  private currentWallet: DynamicWallet | null = null;

  static getInstance(): DynamicAuthService {
    if (!DynamicAuthService.instance) {
      DynamicAuthService.instance = new DynamicAuthService();
    }
    return DynamicAuthService.instance;
  }

  private constructor() {
    this.loadStoredData();
  }

  private loadStoredData() {
    if (typeof window !== 'undefined') {
      try {
        const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedWallet) {
          this.currentWallet = JSON.parse(storedWallet);
        }
        
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
      }
    }
  }

  private saveWalletData(wallet: DynamicWallet) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
      this.currentWallet = wallet;
    }
  }

  private saveUserData(user: DynamicUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      this.currentUser = user;
    }
  }

  private clearStoredData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      this.currentWallet = null;
      this.currentUser = null;
    }
  }

  // Handle wallet connection from Dynamic
  handleWalletConnection(walletData: any) {
    const wallet: DynamicWallet = {
      address: walletData.address,
      type: walletData.chain === 'xrpl' ? "XRPL" : "EVM",
      ensName: walletData.ensName,
      email: walletData.email
    };

    const user: DynamicUser = {
      id: walletData.userId || crypto.randomUUID(),
      email: walletData.email,
      wallet_address: wallet.address,
      wallet_type: wallet.type,
      ensName: wallet.ensName
    };

    this.saveWalletData(wallet);
    this.saveUserData(user);

    return { wallet, user };
  }

  // Handle wallet disconnection
  handleWalletDisconnection() {
    this.clearStoredData();
  }

  // Get current wallet
  getCurrentWallet(): DynamicWallet | null {
    return this.currentWallet;
  }

  // Get current user
  getCurrentUser(): DynamicUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentWallet !== null && this.currentUser !== null;
  }

  // Get wallet for API compatibility
  getWallet(): Wallet | null {
    if (!this.currentWallet) return null;

    return {
      address: this.currentWallet.address,
      type: this.currentWallet.type,
      ensName: this.currentWallet.ensName,
      isConnected: true,
      connect: async () => true, // No-op for Dynamic
      disconnect: () => this.handleWalletDisconnection()
    };
  }
}

// Export singleton instance
export const dynamicAuthService = DynamicAuthService.getInstance();

// Export Dynamic configuration
export { DYNAMIC_CONFIG };

// Export Dynamic components for use in layout
export { DynamicContextProvider, DynamicWagmiConnector }; 