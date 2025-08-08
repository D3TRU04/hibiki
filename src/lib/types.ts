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
  user_id: string;
  type: 'text' | 'video' | 'news';
  content: string;
  lat: number;
  lng: number;
  media_url?: string;
  ipfs_metadata_url?: string;
  ipfs_post_url?: string;
  far_score: number;
  engagement_score: number;
  flags: number;
  created_at: string;
  updated_at: string;
  user?: User;
  // AI and verification fields
  ai_summary?: string;
  source_url?: string;
  content_type: 'media' | 'news';
  file_size?: number;
  credibility_score?: number;
  is_reliable?: boolean;
  processing_info?: string;
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
  text: string;
  lat: number;
  lng: number;
  mediaFile?: File;
  tags?: string[];
  contributor_id?: string;
  wallet?: Wallet;
  // New fields
  newsUrl?: string;
  content_type: 'media' | 'news';
}

export interface PostSubmission {
  type: 'text' | 'video' | 'news';
  content: string;
  lat: number;
  lng: number;
  media_file?: File;
  news_url?: string;
  ai_summary?: string;
  source_url?: string;
  credibility_score?: number;
  is_reliable?: boolean;
}

export interface AISummary {
  summary: string;
  confidence: number;
  keywords: string[];
}

export interface RateLimitInfo {
  canPost: boolean;
  timeRemaining: number;
  lastPostTime?: number;
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

export interface UserXP {
  total_xp: number;
  posts_created: number;
  posts_liked: number;
  posts_shared: number;
  days_active: number;
  last_activity: string;
  xrpl_address?: string;
  pending_rewards: number;
}

export interface PostProof {
  post_id: string;
  timestamp: string;
  xp_earned: number;
  wallet_address: string;
  transaction_hash?: string;
} 