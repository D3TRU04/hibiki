import { Client, Wallet, xrpl } from 'xrpl';
import { KleoPost } from './types';

// XRPL Testnet Configuration
const XRPL_CONFIG = {
  testnet: {
    server: 'wss://s.altnet.rippletest.net:51233',
    explorer: 'https://testnet.xrpl.org'
  },
  mainnet: {
    server: 'wss://xrplcluster.com',
    explorer: 'https://xrpscan.com'
  }
};

export interface XRPLNFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  summary_text?: string;
  source_url?: string;
  wallet_address: string;
  post_cid: string;
}

export interface NFTMintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
  metadata?: XRPLNFTMetadata;
}

export interface XRPLRewardClaim {
  success: boolean;
  amount?: number;
  transactionHash?: string;
  error?: string;
}

export class XRPLNFTService {
  private static instance: XRPLNFTService;
  private client: Client | null = null;

  constructor() {
    this.initializeClient();
  }

  static getInstance(): XRPLNFTService {
    if (!XRPLNFTService.instance) {
      XRPLNFTService.instance = new XRPLNFTService();
    }
    return XRPLNFTService.instance;
  }

  private async initializeClient() {
    try {
      this.client = new Client(XRPL_CONFIG.testnet.server);
      await this.client.connect();
      console.log('✅ Connected to XRPL testnet');
    } catch (error) {
      console.error('❌ Failed to connect to XRPL:', error);
    }
  }

  // Mint XLS-20 NFT from post CID
  async mintFromPostCID(post: KleoPost, walletSeed: string): Promise<NFTMintResult> {
    if (!this.client) {
      return {
        success: false,
        error: 'XRPL client not connected'
      };
    }

    try {
      // Create wallet from seed
      const wallet = Wallet.fromSeed(walletSeed);
      
      // Prepare NFT metadata
      const metadata: XRPLNFTMetadata = {
        name: `Kleo Story #${post.id}`,
        description: post.text,
        attributes: [
          { trait_type: 'Media Type', value: post.media_type },
          { trait_type: 'Location', value: `${post.lat}, ${post.lng}` },
          { trait_type: 'Reward Points', value: post.reward_points || 0 },
          { trait_type: 'Credibility Score', value: post.credibility_score || 0 },
          { trait_type: 'Is Reliable', value: post.is_reliable || false }
        ],
        external_url: post.source_url,
        summary_text: post.ai_summary,
        source_url: post.source_url,
        wallet_address: wallet.address,
        post_cid: post.post_cid || ''
      };

      // Create NFTokenMint transaction
      const transactionBlob = {
        TransactionType: 'NFTokenMint',
        Account: wallet.address,
        URI: xrpl.stringToHex(JSON.stringify(metadata)),
        Flags: 8, // Transferable NFT
        TransferFee: 0, // No transfer fee
        NFTokenTaxon: 0
      };

      // Submit transaction
      const prepared = await this.client.autofill(transactionBlob);
      const signed = wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
        const tokenId = result.result.NFTokenID;
        
        console.log('🎉 NFT minted successfully:', {
          tokenId,
          postId: post.id,
          walletAddress: wallet.address,
          metadata: metadata
        });

        // Record NFT minting
        await this.recordNFTMinted(tokenId, post.post_cid || '', wallet.address);

        return {
          success: true,
          tokenId,
          transactionHash: result.result.hash,
          metadata
        };
      } else {
        return {
          success: false,
          error: `Transaction failed: ${result.result.meta?.TransactionResult}`
        };
      }

    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Claim XRP rewards based on XP (RLUSD simulation)
  async claimRewards(walletSeed: string, totalXP: number): Promise<XRPLRewardClaim> {
    if (!this.client) {
      return {
        success: false,
        error: 'XRPL client not connected'
      };
    }

    try {
      const wallet = Wallet.fromSeed(walletSeed);
      
      // Calculate XRP amount based on XP (simulation)
      // 1 XP = 0.1 XRP for testing
      const xrpAmount = Math.floor(totalXP * 0.1);
      
      if (xrpAmount <= 0) {
        return {
          success: false,
          error: 'Insufficient XP for reward claim'
        };
      }

      // Get account info
      const accountInfo = await this.client.request({
        command: 'account_info',
        account: wallet.address
      });

      // Create Payment transaction (simulating airdrop)
      const transactionBlob = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: wallet.address, // Self-payment for simulation
        Amount: xrpl.xrpToDrops(xrpAmount),
        Memos: [{
          Memo: {
            MemoData: xrpl.stringToHex(`XP Reward: ${totalXP} XP = ${xrpAmount} XRP`),
            MemoFormat: xrpl.stringToHex('text/plain'),
            MemoType: xrpl.stringToHex('text/plain')
          }
        }]
      };

      // Submit transaction
      const prepared = await this.client.autofill(transactionBlob);
      const signed = wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
        console.log('🎉 XRP rewards claimed:', {
          amount: xrpAmount,
          totalXP,
          walletAddress: wallet.address,
          transactionHash: result.result.hash
        });

        // Record reward claim
        await this.recordRewardClaimed(wallet.address, xrpAmount, totalXP);

        return {
          success: true,
          amount: xrpAmount,
          transactionHash: result.result.hash
        };
      } else {
        return {
          success: false,
          error: `Transaction failed: ${result.result.meta?.TransactionResult}`
        };
      }

    } catch (error) {
      console.error('❌ Error claiming rewards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get wallet balance
  async getWalletBalance(walletSeed: string): Promise<number> {
    if (!this.client) return 0;

    try {
      const wallet = Wallet.fromSeed(walletSeed);
      const accountInfo = await this.client.request({
        command: 'account_info',
        account: wallet.address
      });

      return xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
    } catch (error) {
      console.error('❌ Error getting wallet balance:', error);
      return 0;
    }
  }

  // Record NFT minting event
  private async recordNFTMinted(tokenId: string, postCid: string, walletAddress: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const nftMints = JSON.parse(localStorage.getItem('kleo_nft_mints') || '{}');
      nftMints[tokenId] = {
        postCid,
        walletAddress,
        timestamp: new Date().toISOString(),
        type: 'NFT_MINTED'
      };
      localStorage.setItem('kleo_nft_mints', JSON.stringify(nftMints));
    }
  }

  // Record reward claim event
  private async recordRewardClaimed(walletAddress: string, amount: number, totalXP: number): Promise<void> {
    if (typeof window !== 'undefined') {
      const rewardClaims = JSON.parse(localStorage.getItem('kleo_reward_claims') || '{}');
      const claimId = `${walletAddress}_${Date.now()}`;
      rewardClaims[claimId] = {
        walletAddress,
        amount,
        totalXP,
        timestamp: new Date().toISOString(),
        type: 'REWARD_CLAIMED'
      };
      localStorage.setItem('kleo_reward_claims', JSON.stringify(rewardClaims));
    }
  }

  // Get all NFT mints for a wallet
  getWalletNFTMints(walletAddress: string): Array<{
    tokenId: string;
    postCid: string;
    timestamp: string;
  }> {
    if (typeof window === 'undefined') return [];

    const nftMints = JSON.parse(localStorage.getItem('kleo_nft_mints') || '{}');
    return Object.entries(nftMints)
      .filter(([_, mint]: [string, any]) => mint.walletAddress === walletAddress)
      .map(([tokenId, mint]: [string, any]) => ({
        tokenId,
        postCid: mint.postCid,
        timestamp: mint.timestamp
      }));
  }

  // Get all reward claims for a wallet
  getWalletRewardClaims(walletAddress: string): Array<{
    claimId: string;
    amount: number;
    totalXP: number;
    timestamp: string;
  }> {
    if (typeof window === 'undefined') return [];

    const rewardClaims = JSON.parse(localStorage.getItem('kleo_reward_claims') || '{}');
    return Object.entries(rewardClaims)
      .filter(([_, claim]: [string, any]) => claim.walletAddress === walletAddress)
      .map(([claimId, claim]: [string, any]) => ({
        claimId,
        amount: claim.amount,
        totalXP: claim.totalXP,
        timestamp: claim.timestamp
      }));
  }

  // Disconnect client
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// Export singleton instance
export const xrplNFTService = XRPLNFTService.getInstance(); 