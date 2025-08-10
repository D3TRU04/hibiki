import { KleoPost, User } from '../types';

// Simple XP Configuration for MVP
const XP_CONFIG = {
  BASE_POST: 1,           // Base points for any post
  AI_VERIFIED_NEWS: 10,   // AI-verified news content
  VIDEO_UPLOAD: 5,        // Video upload
  WALLET_EMAIL_PAIRED: 3  // Wallet/email paired bonus
};

// User XP storage
const USER_XP_KEY = 'kleo_user_xp';

export interface UserXP {
  totalXP: number;
  posts: number;
  lastUpdated: string;
}

// Calculate reward points based on post type and user status
export function calculateRewardPoints(post: KleoPost, user?: User): number {
  let points = XP_CONFIG.BASE_POST;
  
  // AI-verified news content (infer from content_type or presence of source_url)
  if (post.content_type === 'news' && post.is_reliable) {
    points += XP_CONFIG.AI_VERIFIED_NEWS;
  }
  
  // Video upload
  if (post.type === 'video') {
    points += XP_CONFIG.VIDEO_UPLOAD;
  }
  
  // Wallet/email paired bonus
  if (user && user.wallet_address && user.email) {
    points += XP_CONFIG.WALLET_EMAIL_PAIRED;
  }
  
  return points;
}

// Add XP to user
export function addUserXP(walletAddress: string, points: number): UserXP {
  const existingXP = getUserXP(walletAddress);
  
  const updatedXP: UserXP = {
    totalXP: existingXP.totalXP + points,
    posts: existingXP.posts + 1,
    lastUpdated: new Date().toISOString()
  };
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    const allUserXP = JSON.parse(localStorage.getItem(USER_XP_KEY) || '{}');
    allUserXP[walletAddress] = updatedXP;
    localStorage.setItem(USER_XP_KEY, JSON.stringify(allUserXP));
  }
  
  return updatedXP;
}

// Get user's XP
export function getUserXP(walletAddress: string): UserXP {
  if (typeof window === 'undefined') {
    return {
      totalXP: 0,
      posts: 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  const allUserXP = JSON.parse(localStorage.getItem(USER_XP_KEY) || '{}');
  const userXP = allUserXP[walletAddress];
  
  if (!userXP) {
    return {
      totalXP: 0,
      posts: 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  return userXP;
}

// Get XP breakdown for a specific post
export function getPostXPBreakdown(post: KleoPost, user?: User): {
  total: number;
  reasons: string[];
} {
  let total = XP_CONFIG.BASE_POST;
  const reasons: string[] = ['Base post (+1 XP)'];
  
  // AI-verified news content
  if (post.content_type === 'news' && post.is_reliable) {
    total += XP_CONFIG.AI_VERIFIED_NEWS;
    reasons.push(`AI-verified news (+${XP_CONFIG.AI_VERIFIED_NEWS} XP)`);
  }
  
  // Video upload
  if (post.type === 'video') {
    total += XP_CONFIG.VIDEO_UPLOAD;
    reasons.push(`Video upload (+${XP_CONFIG.VIDEO_UPLOAD} XP)`);
  }
  
  // Wallet/email paired bonus
  if (user && user.wallet_address && user.email) {
    total += XP_CONFIG.WALLET_EMAIL_PAIRED;
    reasons.push(`Wallet/email paired (+${XP_CONFIG.WALLET_EMAIL_PAIRED} XP)`);
  }
  
  return { total, reasons };
}

// Record post proof for future claims
export async function recordPostProof(postCid: string, walletAddress: string): Promise<void> {
  const userXP = getUserXP(walletAddress);
  
  // Store post proof in localStorage
  if (typeof window !== 'undefined') {
    const postProofs = JSON.parse(localStorage.getItem('kleo_post_proofs') || '{}');
    postProofs[postCid] = {
      walletAddress,
      timestamp: new Date().toISOString(),
      userXP: userXP.totalXP
    };
    localStorage.setItem('kleo_post_proofs', JSON.stringify(postProofs));
  }
}

// Get all post proofs for a wallet
export function getPostProofs(walletAddress: string): Array<{
  postCid: string;
  timestamp: string;
  userXP: number;
}> {
  if (typeof window === 'undefined') return [];
  
  const postProofs = JSON.parse(localStorage.getItem('kleo_post_proofs') || '{}');
  const typed: Record<string, { walletAddress: string; timestamp: string; userXP: number }> = postProofs;
  return Object.entries(typed)
    .filter(([_, proof]) => proof.walletAddress === walletAddress)
    .map(([postCid, proof]) => ({
      postCid,
      timestamp: proof.timestamp,
      userXP: proof.userXP
    }));
}

// Export user XP to JSON (for future Merkle proofs)
export function exportUserXPToJSON(walletAddress: string): string {
  const userXP = getUserXP(walletAddress);
  
  const exportData = {
    walletAddress,
    totalXP: userXP.totalXP,
    posts: userXP.posts,
    lastUpdated: userXP.lastUpdated
  };
  
  return JSON.stringify(exportData, null, 2);
} 