import { KleoPost } from './types';

// XP calculation rules
const XP_RULES = {
  TEXT_ONLY_POST: 10,
  ADD_MEDIA: 5,
  PER_TAG: 2,
  LOGGED_IN_WALLET: 3,
  BONUS_MULTIPLIER: 1.5 // Bonus for high-quality posts
};

// User XP storage
const USER_XP_STORAGE_KEY = 'kleo_user_xp';

interface UserXP {
  [walletAddress: string]: {
    totalXP: number;
    level: number;
    posts: number;
    lastUpdated: string;
  };
}

// Calculate reward points for a post
export function calculateRewardPoints(post: Partial<KleoPost>): number {
  let points = 0;

  // Base points for text-only post
  points += XP_RULES.TEXT_ONLY_POST;

  // Bonus for media
  if (post.media_type) {
    points += XP_RULES.ADD_MEDIA;
  }

  // Points for tags
  if (post.tags && post.tags.length > 0) {
    points += post.tags.length * XP_RULES.PER_TAG;
  }

  // Bonus for logged-in wallet
  if (post.wallet_type) {
    points += XP_RULES.LOGGED_IN_WALLET;
  }

  // Bonus multiplier for posts with both media and tags
  if (post.media_type && post.tags && post.tags.length >= 2) {
    points = Math.floor(points * XP_RULES.BONUS_MULTIPLIER);
  }

  return points;
}

// Calculate user level based on XP
export function calculateLevel(totalXP: number): number {
  if (totalXP < 50) return 1;
  if (totalXP < 150) return 2;
  if (totalXP < 300) return 3;
  if (totalXP < 500) return 4;
  if (totalXP < 750) return 5;
  if (totalXP < 1000) return 6;
  if (totalXP < 1500) return 7;
  if (totalXP < 2000) return 8;
  if (totalXP < 3000) return 9;
  return 10;
}

// Get level title
export function getLevelTitle(level: number): string {
  const titles = [
    'Newcomer',
    'Explorer',
    'Storyteller',
    'Chronicler',
    'Narrator',
    'Sage',
    'Legend',
    'Mythmaker',
    'Oracle',
    'Immortal'
  ];
  return titles[Math.min(level - 1, titles.length - 1)] || 'Legend';
}

// Get user XP data
export function getUserXP(walletAddress: string): { totalXP: number; level: number; posts: number } {
  if (typeof window === 'undefined') {
    return { totalXP: 0, level: 1, posts: 0 };
  }

  try {
    const stored = localStorage.getItem(USER_XP_STORAGE_KEY);
    if (stored) {
      const userXP: UserXP = JSON.parse(stored);
      const user = userXP[walletAddress];
      if (user) {
        return {
          totalXP: user.totalXP,
          level: user.level,
          posts: user.posts
        };
      }
    }
  } catch (error) {
    console.error('Error loading user XP:', error);
  }

  return { totalXP: 0, level: 1, posts: 0 };
}

// Add XP to user
export function addUserXP(walletAddress: string, points: number): { totalXP: number; level: number; posts: number } {
  if (typeof window === 'undefined') {
    return { totalXP: 0, level: 1, posts: 0 };
  }

  try {
    const stored = localStorage.getItem(USER_XP_STORAGE_KEY);
    const userXP: UserXP = stored ? JSON.parse(stored) : {};
    
    const current = userXP[walletAddress] || { totalXP: 0, level: 1, posts: 0, lastUpdated: new Date().toISOString() };
    const newTotalXP = current.totalXP + points;
    const newLevel = calculateLevel(newTotalXP);
    const newPosts = current.posts + 1;

    userXP[walletAddress] = {
      totalXP: newTotalXP,
      level: newLevel,
      posts: newPosts,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(USER_XP_STORAGE_KEY, JSON.stringify(userXP));

    return {
      totalXP: newTotalXP,
      level: newLevel,
      posts: newPosts
    };
  } catch (error) {
    console.error('Error saving user XP:', error);
    return { totalXP: 0, level: 1, posts: 0 };
  }
}

// Get leaderboard data
export function getLeaderboard(): Array<{ address: string; totalXP: number; level: number; posts: number }> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(USER_XP_STORAGE_KEY);
    if (stored) {
      const userXP: UserXP = JSON.parse(stored);
      return Object.entries(userXP)
        .map(([address, data]) => ({
          address,
          totalXP: data.totalXP,
          level: data.level,
          posts: data.posts
        }))
        .sort((a, b) => b.totalXP - a.totalXP)
        .slice(0, 10); // Top 10
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }

  return [];
}

// RLUSD reward preparation functions (functional implementation)
export function generateMerkleProof(postCid: string, walletAddress: string): string {
  // Generate a deterministic proof based on post CID and wallet address
  const data = `${postCid}_${walletAddress}_${Date.now()}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Simple hash function (in production, use a proper cryptographic hash)
  let hash = 0;
  for (let i = 0; i < dataBuffer.length; i++) {
    const char = dataBuffer[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `proof_${Math.abs(hash).toString(16)}_${Date.now()}`;
}

export function getClaimableRLUSD(walletAddress: string): number {
  // Calculate claimable RLUSD based on user's XP and activity
  const userXP = getUserXP(walletAddress);
  
  // Base rate: 1 RLUSD per 100 XP
  let claimable = Math.floor(userXP.totalXP / 100);
  
  // Bonus for higher levels
  if (userXP.level >= 5) {
    claimable += Math.floor(userXP.totalXP / 200); // 50% bonus
  }
  
  // Bonus for active contributors
  if (userXP.posts >= 10) {
    claimable += Math.floor(userXP.totalXP / 500); // 20% bonus
  }
  
  return Math.max(0, claimable);
}

export async function recordPostProof(postCid: string, walletAddress: string): Promise<void> {
  try {
    // Generate proof
    const proof = generateMerkleProof(postCid, walletAddress);
    
    // Store proof in localStorage for now (in production, this would be on-chain)
    const proofsKey = 'kleo_post_proofs';
    const existingProofs = localStorage.getItem(proofsKey);
    const proofs = existingProofs ? JSON.parse(existingProofs) : {};
    
    proofs[postCid] = {
      walletAddress,
      proof,
      timestamp: Date.now(),
      claimable: getClaimableRLUSD(walletAddress)
    };
    
    localStorage.setItem(proofsKey, JSON.stringify(proofs));
    
    console.log('Post proof recorded:', { postCid, walletAddress, proof });
    
    // In a real implementation, this would:
    // 1. Generate a proper Merkle proof
    // 2. Store it on-chain or in a decentralized database
    // 3. Update the user's claimable RLUSD balance
    // 4. Emit events for the frontend to listen to
    
  } catch (error) {
    console.error('Failed to record post proof:', error);
    throw error;
  }
}

// Get all proofs for a wallet
export function getWalletProofs(walletAddress: string): Array<{
  postCid: string;
  proof: string;
  timestamp: number;
  claimable: number;
}> {
  try {
    const proofsKey = 'kleo_post_proofs';
    const existingProofs = localStorage.getItem(proofsKey);
    if (!existingProofs) return [];
    
    const proofs = JSON.parse(existingProofs);
    return Object.entries(proofs)
      .filter(([, data]: [string, unknown]) => {
        const proofData = data as { walletAddress: string };
        return proofData.walletAddress === walletAddress;
      })
      .map(([postCid, data]: [string, unknown]) => {
        const proofData = data as { proof: string; timestamp: number; claimable: number };
        return {
          postCid,
          proof: proofData.proof,
          timestamp: proofData.timestamp,
          claimable: proofData.claimable
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get wallet proofs:', error);
    return [];
  }
} 