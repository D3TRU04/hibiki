import { ipfsStorage } from '../storage/ipfs-storage';
import { xrplWallet, distributeRewards, distributeEvmRewards } from '../wallet/xrpl-wallet';
import { Post, CreatePostData, User, RewardSystem, XRPLWallet, KleoPost, Wallet, PostSubmission } from '../types';
import { simpleRateLimiter } from '../rewards/rate-limiter';

// Local storage for user session
const USER_SESSION_KEY = 'kleo_user_session';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get crypto object safely
const getCrypto = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return window.crypto;
  }
  // Node.js environment - use dynamic import to avoid require() issues
  if (typeof global !== 'undefined' && global.crypto) {
    return global.crypto;
  }
  // Fallback for older Node.js versions
  try {
    // Use dynamic import instead of require
    const crypto = globalThis.crypto || global.crypto;
    if (crypto) return crypto;
  } catch {
    // Fallback to basic crypto if available
  }
  // Final fallback
  return {
    randomUUID: () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

// Generate a temporary contributor ID for anonymous submissions
function generateContributorId(): string {
  try {
    const crypto = getCrypto();
    if (isBrowser) {
      let contributorId = localStorage.getItem('kleo_contributor_id');
      if (!contributorId) {
        contributorId = `anon_${crypto.randomUUID().slice(0, 8)}`;
        localStorage.setItem('kleo_contributor_id', contributorId);
      }
      return contributorId;
    }
    return `anon_${crypto.randomUUID().slice(0, 8)}`;
  } catch (error) {
    // Fallback if crypto.randomUUID is not available
    const fallbackId = `anon_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    if (isBrowser) {
      localStorage.setItem('kleo_contributor_id', fallbackId);
    }
    return fallbackId;
  }
}

// Generate UUID safely
function generateUUID(): string {
  try {
    const crypto = getCrypto();
    return crypto.randomUUID();
  } catch (error) {
    // Fallback if crypto.randomUUID is not available
    return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Upload file to IPFS
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const cid = await ipfsStorage.uploadMedia(file);
    return `ipfs://${cid}`;
  } catch (error) {
    throw error;
  }
}

// Get posts with filtering
export async function getPosts(filters?: { tag?: string; type?: string }): Promise<KleoPost[]> {
  try {
    // Sync from Pinata to ensure we have the latest posts
    await ipfsStorage.syncFromPinata();
    
    const posts = await ipfsStorage.getPosts();
    
    // Convert Post[] to KleoPost[] (align with current KleoPost interface)
    const kleoPosts: KleoPost[] = posts.map((post: Post) => {
      const createdAt = post.created_at || new Date().toISOString();
      const isVideo = post.type === 'video';
      return {
      id: post.id || generateUUID(),
        user_id: post.user_id || post.contributor_id || 'anonymous',
        type: isVideo ? 'video' : 'text',
        content: post.content,
      lat: post.lat,
      lng: post.lng,
        media_url: post.media_url,
        ipfs_metadata_url: post.ipfs_metadata_url,
        ipfs_post_url: post.ipfs_post_url,
        far_score: post.far_score ?? 0,
        engagement_score: post.engagement_score ?? 0,
        flags: post.flags ?? 0,
        created_at: createdAt,
        updated_at: post.updated_at || createdAt,
        ai_summary: undefined,
        source_url: undefined,
        content_type: isVideo ? 'media' : 'news',
        credibility_score: undefined,
        is_reliable: undefined,
      };
    });

    // Apply filters
    let filteredPosts = kleoPosts;

    if (filters?.tag) {
      filteredPosts = filteredPosts.filter(post => 
        false
      );
    }

    if (filters?.type) {
      filteredPosts = filteredPosts.filter(post => 
        post.type === filters.type
      );
    }

    const sortedPosts = filteredPosts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return sortedPosts;
  } catch (error) {
    return [];
  }
}

// Create a new KleoPost with wallet integration
export async function createKleoPost(postData: PostSubmission, wallet: Wallet): Promise<KleoPost> {
  try {
    const FAST_SUBMIT = (process.env.NEXT_PUBLIC_FAST_SUBMIT !== '0');
    const withTimeout = async <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
      ]) as T;
    };
    // Rate limiting check
    const rateInfo = simpleRateLimiter.canUserPost(wallet.address);
    if (!rateInfo.canPost) {
      const timeRemaining = simpleRateLimiter.getTimeRemaining(wallet.address);
      const minutes = Math.ceil(timeRemaining / (1000 * 60));
      throw new Error(`Rate limit exceeded. Please wait ${minutes} minutes before posting again.`);
    }

    let kleoPost: KleoPost;
    let _enhancedMetadata: Record<string, unknown> | undefined;

    if (postData.type === 'news') {
      if (FAST_SUBMIT) {
        // Fast path: skip heavy fetch/AI; rely on user-provided text + URL
        kleoPost = {
          id: generateUUID(),
          user_id: wallet.address,
          type: 'news',
          content: postData.content, // user's own description
          lat: postData.lat,
          lng: postData.lng,
          media_url: undefined,
          ipfs_metadata_url: undefined,
          ipfs_post_url: '',
          far_score: 0,
          engagement_score: 0,
          flags: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ai_summary: undefined,
          source_url: postData.news_url,
          content_type: 'news',
          credibility_score: undefined,
          is_reliable: undefined,
        };
        _enhancedMetadata = {
          ...kleoPost,
          source_url: postData.news_url,
          fast_submit: true,
        };

        // Minimal AI summary in fast path using user's description (short timeout)
        try {
          const ai = (await import('../ai/ai-summary')).aiSummaryService;
          const quickSummary = await withTimeout(
            ai.generateSummary({ mediaType: 'news', content: postData.content || '', url: postData.news_url }),
            2000,
            { summary: undefined, confidence: 0.6 } as unknown as { summary?: string; confidence: number }
          );
          if (quickSummary?.summary) {
            kleoPost.ai_summary = quickSummary.summary;
            // Use confidence heuristic as a lightweight credibility score
            (kleoPost as any).credibility_score = Math.round((quickSummary.confidence || 0.6) * 100);
          }
        } catch {}
      } else {
        // Handle news article submission (with timeouts and graceful fallbacks)
        const newsFetcher = (await import('../news/news-fetcher')).newsFetcherService;
        const article = await withTimeout(
          newsFetcher.fetchArticle(postData.news_url!),
          5000,
          null as unknown as { title?: string; content: string } | null
        );
        if (!article) {
          // Fall back to fast path if content fetch is slow/unavailable
          kleoPost = {
            id: generateUUID(),
            user_id: wallet.address,
            type: 'news',
            content: postData.content,
            lat: postData.lat,
            lng: postData.lng,
            media_url: undefined,
            ipfs_metadata_url: undefined,
            ipfs_post_url: '',
            far_score: 0,
            engagement_score: 0,
            flags: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ai_summary: undefined,
            source_url: postData.news_url,
            content_type: 'news',
            credibility_score: undefined,
            is_reliable: undefined,
          };
          _enhancedMetadata = { ...kleoPost, source_url: postData.news_url, fast_submit: 'timeout_article' };
        } else {
          const detector = (await import('../detector/fake-news-detector')).fakeNewsDetectorService;
          const credibility = await withTimeout(
            detector.analyzeNewsArticle(postData.news_url!, article.content, article.title || ''),
            4000,
            { isReliable: true, score: 60 } as unknown as { isReliable: boolean; score: number }
          );
          // Proceed even if credibility is below, but mark value
          const ai = (await import('../ai/ai-summary')).aiSummaryService;
          const summary = await withTimeout(
            ai.generateSummary({ mediaType: 'news', content: article.content, url: postData.news_url! }),
            4000,
            { summary: undefined, confidence: 0.6, keywords: [] } as unknown as { summary?: string; confidence: number; keywords?: string[] }
          );

          kleoPost = {
            id: generateUUID(),
            user_id: wallet.address,
            type: 'news',
            content: article.content || postData.content,
            lat: postData.lat,
            lng: postData.lng,
            media_url: undefined,
            ipfs_metadata_url: undefined,
            ipfs_post_url: '',
            far_score: 0,
            engagement_score: 0,
            flags: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ai_summary: summary.summary,
            source_url: postData.news_url,
            content_type: 'news',
            credibility_score: Math.round((summary.confidence || 0.6) * 100),
            is_reliable: (credibility as any)?.isReliable ?? true,
          };
  
          _enhancedMetadata = {
            ...kleoPost,
            summary_text: summary.summary,
            keywords: (summary as any)?.keywords,
            source_url: postData.news_url,
            article_title: article.title,
            article_content: article.content,
            credibility_analysis: credibility
          };
        }
      }
    } else {
      // Handle media upload
      let ipfsUrl = '';
      if (postData.media_file) {
        ipfsUrl = await uploadToIPFS(postData.media_file);
      }

      // Create KleoPost object for media (align with current interface)
      kleoPost = {
        id: generateUUID(),
        user_id: wallet.address,
        type: 'video',
        content: postData.content,
        lat: postData.lat,
        lng: postData.lng,
        media_url: ipfsUrl ? `ipfs://${ipfsUrl}` : undefined,
        ipfs_metadata_url: undefined,
        ipfs_post_url: undefined,
        far_score: 0,
        engagement_score: 0,
        flags: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        content_type: 'media',
      } as KleoPost;

      // Generate a short AI summary for text/media content (best-effort)
      try {
        const ai = (await import('../ai/ai-summary')).aiSummaryService;
        const s = await withTimeout(
          ai.generateSummary({ mediaType: 'news', content: postData.content || '' }),
          2000,
          { summary: undefined, confidence: 0.5 } as unknown as { summary?: string; confidence: number }
        );
        if (s?.summary) {
          (kleoPost as any).ai_summary = s.summary;
        }
      } catch {}
    }

    // Upload post metadata to IPFS (Pinata) & mint NFT
    try {
      const cid = await (await import('../storage/pinata-storage')).pinataStorageService.uploadPost(kleoPost);
      kleoPost.ipfs_metadata_url = `ipfs://${cid}`;
    } catch (e) {
      kleoPost.ipfs_metadata_url = `local://metadata-${kleoPost.id}.json`;
    }

    // Persist to global state so pins remain across refresh and for other users
    try {
      await ipfsStorage.createPostFromKleo(kleoPost);
    } catch (e) {
      //
    }
    // Mint NFT from the created post metadata if desired (placeholder seed required in real flow)
    // await (await import('./xrpl-nft')).xrplNFTService.mintFromPostCID(kleoPost, '<WALLET_SEED>');

    // Record XP and proofs
    const { calculateRewardPoints, addUserXP, recordPostProof } = await import('../rewards/rewards');
    const user = await getCurrentUser(); // Get user for email bonus
    const points = calculateRewardPoints(kleoPost, { wallet_address: wallet.address, email: user?.email } as User);
    addUserXP(wallet.address, points);
    await recordPostProof(kleoPost.ipfs_metadata_url!, wallet.address);

    // Best-effort reward payment (XRPL L1 or EVM sidechain)
    try {
      if (user?.xrpl_address) {
        // XRPL L1 path
        const rewardRes = await distributeRewards(user.xrpl_address, points, 'Kleo: content contribution reward');
        if (typeof window !== 'undefined' && rewardRes && (rewardRes as any).ok) {
          sessionStorage.setItem('kleo_last_reward_tx', JSON.stringify({ ...(rewardRes as any), chain: 'xrpl' }));
        }
      } else if (wallet?.address && wallet.address.startsWith('0x')) {
        // EVM sidechain fallback
        const evmRes = await distributeEvmRewards(wallet.address, points);
        if (typeof window !== 'undefined' && evmRes && (evmRes as any).ok) {
          sessionStorage.setItem('kleo_last_reward_tx', JSON.stringify({ ...(evmRes as any), chain: 'evm' }));
        }
      }
    } catch {}

    return kleoPost;

  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check local storage for user session
    if (!isBrowser) return null;
    
    const sessionData = localStorage.getItem(USER_SESSION_KEY);
    if (sessionData) {
      const user = JSON.parse(sessionData);
      // Verify user still exists in IPFS
      const verifiedUser = await ipfsStorage.getUser(user.id);
      if (verifiedUser) {
        return verifiedUser;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    const user = await ipfsStorage.createUser(userData);
    
    // Store user session
    if (isBrowser) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const user = await ipfsStorage.updateUser(userId, updates);
    
    if (user && isBrowser) {
      // Update session
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function signOut(): Promise<void> {
  if (isBrowser) {
    localStorage.removeItem(USER_SESSION_KEY);
  }
}

export async function createPost(postData: CreatePostData): Promise<Post | null> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Honeypot not supported in current CreatePostData shape
    // Create post using IPFS storage
    const post = await ipfsStorage.createPost(postData, user);
    
    if (post) {
      //
    }
    
    return post;
  } catch (error) {
    throw error;
  }
}

export async function getRewardSystem(userId: string): Promise<RewardSystem | null> {
  try {
    return await ipfsStorage.getRewardSystem(userId);
  } catch (error) {
    return null;
  }
}

// XRPL Wallet functions
export async function generateWallet(): Promise<XRPLWallet> {
  try {
    return await xrplWallet.generateWallet();
  } catch (error) {
    throw error;
  }
}

export async function importWallet(seed: string): Promise<XRPLWallet> {
  try {
    return await xrplWallet.importWallet(seed);
  } catch (error) {
    throw error;
  }
}

export async function getWalletBalance(address: string): Promise<number> {
  try {
    return await xrplWallet.getBalance(address);
  } catch (error) {
    return 0;
  }
}

export async function claimRewards(userId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not found');

    const rewardSystem = await getRewardSystem(userId);
    if (!rewardSystem || rewardSystem.pending_rewards <= 0) {
      throw new Error('No rewards available to claim');
    }

    // Distribute rewards (XRPL preferred, fallback to EVM if wallet_address is 0x)
    let success = false;
    if (user.xrpl_address) {
      const res = await distributeRewards(user.xrpl_address, user.contribution_points);
      success = !!(res && (res as any).ok);
    } else if (user.wallet_address && user.wallet_address.startsWith('0x')) {
      const res = await distributeEvmRewards(user.wallet_address, user.contribution_points);
      success = !!(res && (res as any).ok);
    } else {
      throw new Error('No payout address configured');
    }
    
    if (success) {
      // Reset contribution points after successful reward distribution
      await updateUser(userId, { contribution_points: 0 });
    }
    
    return success;
  } catch (error) {
    throw error;
  }
}

// Manually add a post to the global state (for debugging)
export async function addPostToGlobalState(post: Post): Promise<void> {
  try {
    await ipfsStorage.addPostToGlobalState(post);
  } catch (error) {
    //
  }
}

// Legacy function for backward compatibility
export async function uploadAudioFile(): Promise<string | null> {
  return null;
} 

// Get XRPL wallet seed from wallet address
async function _getXRPLWalletSeed(walletAddress: string): Promise<string | null> {
  try {
    // Check if user has an XRPL wallet stored
    if (typeof window !== 'undefined') {
      const userWallets = JSON.parse(localStorage.getItem('kleo_user_wallets') || '{}');
      const userWallet = userWallets[walletAddress];
      
      if (userWallet && userWallet.xrplSeed) {
        return userWallet.xrplSeed;
      }
    }
    
    // For MVP, you can implement wallet generation or import here
    // This is a placeholder - you'll need to integrate with your wallet system
    return null;
  } catch (error) {
    return null;
  }
} 