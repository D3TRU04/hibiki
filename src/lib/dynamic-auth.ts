'use client';

import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react';
import { Wallet } from './types';

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
      } catch {}
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

  handleWalletConnection(walletData: { address: string; chain?: string; ensName?: string; email?: string; userId?: string }) {
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

  handleWalletDisconnection() {
    this.clearStoredData();
  }

  getCurrentWallet(): DynamicWallet | null { return this.currentWallet; }
  getCurrentUser(): DynamicUser | null { return this.currentUser; }
  isAuthenticated(): boolean { return this.currentWallet !== null && this.currentUser !== null; }

  getWallet(): Wallet | null {
    if (!this.currentWallet) return null;
    return {
      address: this.currentWallet.address,
      type: this.currentWallet.type,
      ensName: this.currentWallet.ensName,
      isConnected: true,
      connect: async () => true,
      disconnect: () => this.handleWalletDisconnection()
    };
  }
}

export const dynamicAuthService = DynamicAuthService.getInstance();

export { useDynamicContext, DynamicWidget }; 