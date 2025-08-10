import { Client, Wallet as XRPLWallet, dropsToXrp, xrpToDrops, isValidClassicAddress } from 'xrpl';
import { XRPLWallet as XRPLWalletType, User } from '../types';

// XRPL network configuration
const XRPL_NETWORK = process.env.NEXT_PUBLIC_XRPL_NETWORK || 'testnet';
const XRPL_SERVER = XRPL_NETWORK === 'mainnet' 
  ? 'wss://xrplcluster.com' 
  : 'wss://s.altnet.rippletest.net:51233';

class XRPLWalletService {
  private client: Client | null = null;
  private wallet: XRPLWallet | null = null;
  private isConnected = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      this.client = new Client(XRPL_SERVER);
      await this.client.connect();
      console.log('XRPL client connected');
    } catch (error) {
      console.error('Failed to connect to XRPL:', error);
    }
  }

  // Generate a new wallet
  async generateWallet(): Promise<XRPLWalletType> {
    if (!this.client) {
      throw new Error('XRPL client not connected');
    }

    try {
      const wallet = XRPLWallet.generate();
      const balance = await this.getBalance(wallet.address);

      this.wallet = wallet;
      this.isConnected = true;

      return {
        address: wallet.address,
        balance: balance,
        connected: true,
        network: XRPL_NETWORK as 'mainnet' | 'testnet' | 'devnet'
      };
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw new Error('Failed to generate wallet');
    }
  }

  // Import wallet from seed
  async importWallet(seed: string): Promise<XRPLWalletType> {
    if (!this.client) {
      throw new Error('XRPL client not connected');
    }

    try {
      const wallet = XRPLWallet.fromSeed(seed);
      const balance = await this.getBalance(wallet.address);

      this.wallet = wallet;
      this.isConnected = true;

      return {
        address: wallet.address,
        balance: balance,
        connected: true,
        network: XRPL_NETWORK as 'mainnet' | 'testnet' | 'devnet'
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Failed to import wallet');
    }
  }

  // Get wallet balance
  async getBalance(address: string): Promise<number> {
    if (!this.client) {
      throw new Error('XRPL client not connected');
    }

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });

      const balance = dropsToXrp(response.result.account_data.Balance);
      return Number(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  // Send XRP reward to user (simplified for now)
  async sendReward(toAddress: string, amount: number): Promise<string> {
    if (!this.client || !this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const prepared = await this.client.autofill({
        TransactionType: 'Payment',
        Account: this.wallet.address,
        Amount: xrpToDrops(amount.toString()),
        Destination: toAddress
      });

      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      // Simplified success check
      console.log(`Sent ${amount} XRP to ${toAddress}`);
      return result.result.hash || 'transaction_hash';
    } catch (error) {
      console.error('Error sending reward:', error);
      throw new Error('Failed to send reward');
    }
  }

  // Get faucet funds (testnet only)
  async getFaucetFunds(address: string): Promise<boolean> {
    if (XRPL_NETWORK !== 'testnet') {
      throw new Error('Faucet only available on testnet');
    }

    try {
      const response = await fetch('https://faucet.altnet.rippletest.net/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination: address
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Faucet funds received:', result);
        return true;
      } else {
        throw new Error('Faucet request failed');
      }
    } catch (error) {
      console.error('Error getting faucet funds:', error);
      return false;
    }
  }

  // Check if address is valid
  isValidAddress(address: string): boolean {
    try {
      return isValidClassicAddress(address);
    } catch {
      return false;
    }
  }

  // Get current wallet info
  getCurrentWallet(): XRPLWalletType | null {
    if (!this.wallet) {
      return null;
    }

    return {
      address: this.wallet.address,
      balance: 0, // Would need to fetch
      connected: this.isConnected,
      network: XRPL_NETWORK as 'mainnet' | 'testnet' | 'devnet'
    };
  }

  // Disconnect wallet
  disconnect() {
    this.wallet = null;
    this.isConnected = false;
    if (this.client) {
      this.client.disconnect();
    }
  }

  // Get network info
  getNetworkInfo() {
    return {
      network: XRPL_NETWORK,
      server: XRPL_SERVER,
      isConnected: this.isConnected
    };
  }
}

// Export singleton instance
export const xrplWallet = new XRPLWalletService();

// Utility functions for reward calculations
export function calculateRewardAmount(contributionPoints: number): number {
  // 1 XRP per 100 contribution points
  return Math.floor(contributionPoints / 100);
}

export function calculatePointsForReward(xrpAmount: number): number {
  // Reverse calculation
  return xrpAmount * 100;
}

// Reward distribution logic
export async function distributeRewards(
  userAddress: string, 
  contributionPoints: number
): Promise<boolean> {
  try {
    const rewardAmount = calculateRewardAmount(contributionPoints);
    
    if (rewardAmount > 0) {
      await xrplWallet.sendReward(userAddress, rewardAmount);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error distributing rewards:', error);
    return false;
  }
} 