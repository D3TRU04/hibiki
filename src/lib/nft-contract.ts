import { ethers } from 'ethers';
import { KleoPost } from './types';

// NFT Contract ABI (updated for Ripple EVM with XRPL integration)
const NFT_CONTRACT_ABI = [
  "function mintNFT(string memory ipfsCID, string memory metadata, string memory xrplAddress, uint256 xrplRewards) external payable",
  "function getUserMintCount(address user) external view returns (uint256)",
  "function getLastMintTime(address user) external view returns (uint256)",
  "function getMintFee() external view returns (uint256)",
  "function getMaxMintsPerUser() external view returns (uint256)",
  "function getMintCooldown() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function getXRPLAddress(uint256 tokenId) external view returns (string memory)",
  "function getXRPLRewards(uint256 tokenId) external view returns (uint256)",
  "function getUserTotalXRPLRewards(address user) external view returns (uint256)",
  "event NFTMinted(address indexed owner, uint256 indexed tokenId, string ipfsCID, string xrplAddress, uint256 xrplRewards)"
];

// Contract configuration for MVP testing
const CONTRACT_CONFIG = {
  // Ripple EVM Sidechain testnet
  network: 'ripple-evm-testnet',
  chainId: 1440002, // Ripple EVM testnet chain ID
  rpcUrl: 'https://rpc-evm-sidechain.xrpl.org', // Ripple EVM RPC
  // Contract address (will be deployed)
  contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '',
  // Spam prevention settings
  mintFee: ethers.utils.parseEther('0.001'), // 0.001 XRP (~$0.001)
  maxMintsPerUser: 10,
  mintCooldown: 300, // 5 minutes
  // Gas settings
  gasLimit: 300000,
  gasPrice: ethers.utils.parseUnits('30', 'gwei')
};

export interface NFTMintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
  gasUsed?: string;
  cost?: string;
}

export interface UserMintStatus {
  canMint: boolean;
  mintCount: number;
  timeRemaining: number;
  mintFee: string;
  reason?: string;
}

export class NFTContractService {
  private static instance: NFTContractService;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  static getInstance(): NFTContractService {
    if (!NFTContractService.instance) {
      NFTContractService.instance = new NFTContractService();
    }
    return NFTContractService.instance;
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
      
      if (CONTRACT_CONFIG.contractAddress) {
        this.contract = new ethers.Contract(
          CONTRACT_CONFIG.contractAddress,
          NFT_CONTRACT_ABI,
          this.provider
        );
      }
    } catch (error) {
      console.error('Error initializing NFT contract provider:', error);
    }
  }

  // Check if user can mint (spam prevention)
  async canUserMint(userAddress: string): Promise<UserMintStatus> {
    if (!this.contract) {
      return {
        canMint: false,
        mintCount: 0,
        timeRemaining: 0,
        mintFee: ethers.utils.formatEther(CONTRACT_CONFIG.mintFee),
        reason: 'Contract not initialized'
      };
    }

    try {
      const [mintCount, lastMintTime, mintFee] = await Promise.all([
        this.contract.getUserMintCount(userAddress),
        this.contract.getLastMintTime(userAddress),
        this.contract.getMintFee()
      ]);

      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceLastMint = currentTime - lastMintTime.toNumber();
      const timeRemaining = Math.max(0, CONTRACT_CONFIG.mintCooldown - timeSinceLastMint);

      const canMint = mintCount.toNumber() < CONTRACT_CONFIG.maxMintsPerUser && 
                     timeRemaining === 0;

      let reason: string | undefined;
      if (mintCount.toNumber() >= CONTRACT_CONFIG.maxMintsPerUser) {
        reason = 'Mint limit reached';
      } else if (timeRemaining > 0) {
        reason = `Cooldown active: ${Math.ceil(timeRemaining / 60)} minutes remaining`;
      }

      return {
        canMint,
        mintCount: mintCount.toNumber(),
        timeRemaining,
        mintFee: ethers.utils.formatEther(mintFee),
        reason
      };
    } catch (error) {
      console.error('Error checking user mint status:', error);
      return {
        canMint: false,
        mintCount: 0,
        timeRemaining: 0,
        mintFee: ethers.utils.formatEther(CONTRACT_CONFIG.mintFee),
        reason: 'Error checking status'
      };
    }
  }

  // Mint NFT for a post
  async mintNFT(post: KleoPost, userAddress: string, signer: ethers.Signer): Promise<NFTMintResult> {
    if (!this.contract) {
      return {
        success: false,
        error: 'Contract not initialized'
      };
    }

    try {
      // Check if user can mint
      const mintStatus = await this.canUserMint(userAddress);
      if (!mintStatus.canMint) {
        return {
          success: false,
          error: mintStatus.reason || 'Cannot mint at this time'
        };
      }

      // Prepare metadata
      const metadata = {
        name: `Kleo Story #${post.id}`,
        description: post.text,
        image: post.ipfs_url || '',
        attributes: [
          { trait_type: 'Media Type', value: post.media_type },
          { trait_type: 'Location', value: `${post.lat}, ${post.lng}` },
          { trait_type: 'Reward Points', value: post.reward_points || 0 },
          { trait_type: 'Credibility Score', value: post.credibility_score || 0 },
          { trait_type: 'Is Reliable', value: post.is_reliable || false }
        ],
        external_url: post.source_url || '',
        ai_summary: post.ai_summary || ''
      };

      // Connect contract with signer
      const contractWithSigner = this.contract.connect(signer);

      // Estimate gas
      const gasEstimate = await contractWithSigner.estimateGas.mintNFT(
        post.post_cid || '',
        JSON.stringify(metadata),
        userAddress, // xrplAddress
        post.reward_points || 0 // xrplRewards
      );

      // Mint NFT
      const tx = await contractWithSigner.mintNFT(
        post.post_cid || '',
        JSON.stringify(metadata),
        userAddress, // xrplAddress
        post.reward_points || 0, // xrplRewards
        {
          value: CONTRACT_CONFIG.mintFee,
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        }
      );

      // Wait for transaction
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.toString();
      const cost = ethers.utils.formatEther(
        receipt.gasUsed.mul(tx.gasPrice || CONTRACT_CONFIG.gasPrice)
      );

      // Get token ID from event
      const mintEvent = receipt.events?.find(event => event.event === 'NFTMinted');
      const tokenId = mintEvent?.args?.tokenId?.toString();

      console.log('NFT minted successfully:', {
        tokenId,
        transactionHash: tx.hash,
        gasUsed,
        cost,
        postId: post.id
      });

      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        gasUsed,
        cost
      };

    } catch (error) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user's NFT balance
  async getUserNFTBalance(userAddress: string): Promise<number> {
    if (!this.contract) return 0;

    try {
      const balance = await this.contract.balanceOf(userAddress);
      return balance.toNumber();
    } catch (error) {
      console.error('Error getting user NFT balance:', error);
      return 0;
    }
  }

  // Get NFT metadata
  async getNFTMetadata(tokenId: string): Promise<any> {
    if (!this.contract) return null;

    try {
      const tokenURI = await this.contract.tokenURI(tokenId);
      const response = await fetch(tokenURI);
      return await response.json();
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      return null;
    }
  }

  // Get XRPL address and rewards for a token
  async getXRPLDetails(tokenId: string): Promise<{ xrplAddress: string; xrplRewards: string } | null> {
    if (!this.contract) return null;

    try {
      const xrplAddress = await this.contract.getXRPLAddress(tokenId);
      const xrplRewards = await this.contract.getXRPLRewards(tokenId);
      return {
        xrplAddress: xrplAddress,
        xrplRewards: xrplRewards.toString()
      };
    } catch (error) {
      console.error('Error getting XRPL details:', error);
      return null;
    }
  }

  // Get total XRPL rewards for a user
  async getUserTotalXRPLRewards(userAddress: string): Promise<string> {
    if (!this.contract) return '0';

    try {
      const totalRewards = await this.contract.getUserTotalXRPLRewards(userAddress);
      return totalRewards.toString();
    } catch (error) {
      console.error('Error getting user total XRPL rewards:', error);
      return '0';
    }
  }

  // Get contract configuration for UI
  getContractConfig() {
    return {
      network: CONTRACT_CONFIG.network,
      chainId: CONTRACT_CONFIG.chainId,
      mintFee: ethers.utils.formatEther(CONTRACT_CONFIG.mintFee),
      maxMintsPerUser: CONTRACT_CONFIG.maxMintsPerUser,
      mintCooldown: CONTRACT_CONFIG.mintCooldown,
      isTestnet: true
    };
  }

  // Check if contract is ready
  isContractReady(): boolean {
    return !!this.contract && !!this.provider;
  }
}

// Export singleton instance
export const nftContractService = NFTContractService.getInstance(); 