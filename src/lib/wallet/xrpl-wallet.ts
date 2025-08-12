import { XRPLWallet } from '../types';

// Client-side safe wrapper for XRPL interactions
// Wallet generation/import returns client-stored metadata only; signing stays server-side
export class XRPLWalletService {
  private wallets: Map<string, XRPLWallet> = new Map();

  async generateWallet(): Promise<XRPLWallet> {
    // Client does not generate real XRPL keys; this is a placeholder for UI/testing
    const address = `r${this.generateRandomString(34)}`;

    const wallet: XRPLWallet = {
      address,
      balance: 0,
      connected: false,
      network: 'testnet'
    };

    this.wallets.set(address, wallet);
    return wallet;
  }

  async importWallet(seedOrFamilySeed: string): Promise<XRPLWallet> {
    // Client-side import stores only a placeholder address to avoid handling secrets in browser
    const address = `r${this.generateRandomString(34)}`;

    const wallet: XRPLWallet = {
      address,
      balance: 0,
      connected: false,
      network: 'testnet'
    };

    this.wallets.set(address, wallet);
    return wallet;
  }

  async getBalance(address: string): Promise<number> {
    // Optional: call a public XRPL API to fetch balance; return 0 for now to keep client light
    const wallet = this.wallets.get(address);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    return wallet.balance;
  }

  async connectWallet(address: string): Promise<boolean> {
    const wallet = this.wallets.get(address);
    if (!wallet) {
      return false;
    }
    wallet.connected = true;
    return true;
  }

  async disconnectWallet(address: string): Promise<void> {
    const wallet = this.wallets.get(address);
    if (wallet) {
      wallet.connected = false;
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export singleton instance
export const xrplWallet = new XRPLWalletService();

// Rewards: call server API to send XRPL Testnet payment as RLUSD simulation
export async function distributeRewards(recipientAddress: string, points: number, memo?: string): Promise<{ ok: boolean; txHash?: string; amountDrops?: string } | false> {
  try {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientAddress, points, memo })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data;
  } catch {
    return false;
  }
}

export async function distributeEvmRewards(recipientAddress: string, points: number): Promise<{ ok: boolean; txHash?: string; amountWei?: string } | false> {
  try {
    const res = await fetch('/api/rewards/claim-evm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientAddress, points })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data;
  } catch {
    return false;
  }
}

// Public XRPL balance fetcher (testnet by default)
export async function fetchXrplBalanceDrops(address: string): Promise<number> {
  try {
    const rpcUrl = (process as any)?.env?.XRPL_RPC_URL || 'https://s.altnet.rippletest.net:51234';
    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'account_info',
        params: [
          {
            account: address,
            ledger_index: 'validated',
            strict: true
          }
        ]
      })
    });
    if (!resp.ok) return 0;
    const data = await resp.json();
    const bal = Number(data?.result?.account_data?.Balance);
    return Number.isFinite(bal) ? bal : 0;
  } catch {
    return 0;
  }
} 