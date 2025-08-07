export interface User {
  id: string;
  email?: string;
  wallet_address?: string;
  xrpl_address?: string;
  far_score: number; // Farcaster-style reputation score
  contribution_points: number;
  created_at: string;
  updated_at: string;
  ipfs_profile_url?: string;
}

// Wallet interface for Sprint 3
export interface Wallet {
  address: string;
  type: "EVM" | "XRPL";
  ensName?: string;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// New KleoPost interface for Sprint 2
export interface KleoPost {
  id: string;
  text: string;
  lat: number;
  lng: number;
  ipfs_url?: string;
  media_type?: "audio" | "image" | "video";
  tags?: string[];
  created_at: string;
  contributor_id?: string;
  wallet_type?: "EVM" | "XRPL"; // Added for Sprint 3
  reward_points?: number; // Added for Sprint 3
  post_cid?: string; // Added for Sprint 3 - IPFS metadata CID
}

export interface Post {
  id?: string;
  user_id: string;
  type: 'text' | 'audio' | 'video' | 'image';
  content: string;
  lat: number;
  lng: number;
  media_url?: string;
  ipfs_metadata_url?: string;
  ipfs_post_url?: string;
  far_score: number; // Post-specific score
  engagement_score: number; // Likes, comments, shares
  flags: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
  tags?: string[]; // Added for Sprint 2
  contributor_id?: string; // Added for Sprint 2
  wallet_type?: "EVM" | "XRPL"; // Added for Sprint 3
  reward_points?: number; // Added for Sprint 3
  post_cid?: string; // Added for Sprint 3
}

export interface CreatePostData {
  type: 'text' | 'audio' | 'video' | 'image';
  content: string;
  lat: number;
  lng: number;
  mediaFile?: File;
  honeypot?: string;
  tags?: string[]; // Added for Sprint 2
  contributor_id?: string; // Added for Sprint 2
  wallet_type?: "EVM" | "XRPL"; // Added for Sprint 3
  reward_points?: number; // Added for Sprint 3
  post_cid?: string; // Added for Sprint 3
}

export interface UploadFormData {
  text: string;
  audioFile?: File;
  videoFile?: File;
  imageFile?: File; // Added for Sprint 2
  honeypot?: string;
  tags?: string[]; // Added for Sprint 2
  contributor_id?: string; // Added for Sprint 2
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  post: Post;
}

export interface IPFSMetadata {
  title: string;
  content: string;
  lat: number;
  lng: number;
  timestamp: string;
  user_id: string;
  media_url?: string;
  type: 'text' | 'audio' | 'video' | 'image';
  far_score: number;
  engagement_score: number;
}

export interface IPFSUserProfile {
  id: string;
  email?: string;
  wallet_address?: string;
  xrpl_address?: string;
  far_score: number;
  contribution_points: number;
  created_at: string;
  updated_at: string;
  posts: string[]; // Array of post IPFS URLs
}

export interface IPFSGlobalState {
  users: { [key: string]: string | User }; // user_id -> profile_ipfs_url or User object
  posts: { [key: string]: string | Post }; // post_id -> post_ipfs_url or Post object
  last_updated: string;
  total_posts: number;
  total_users: number;
}

export interface RewardSystem {
  // Farcaster-style scoring
  far_score: number;
  contribution_points: number;
  engagement_multiplier: number;
  reputation_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  
  // XRPL integration
  xrpl_rewards_enabled: boolean;
  xrpl_address?: string;
  pending_rewards: number;
  
  // Activity tracking
  posts_created: number;
  posts_liked: number;
  posts_shared: number;
  days_active: number;
}

export interface XRPLWallet {
  address: string;
  balance: number;
  connected: boolean;
  network: 'mainnet' | 'testnet' | 'devnet';
} 