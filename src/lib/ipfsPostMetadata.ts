import { KleoPost } from './types';
import { ipfsStorage } from './ipfs-storage';

export interface PostMetadata {
  text: string;
  lat: number;
  lng: number;
  ipfs_url?: string;
  media_type?: "audio" | "image" | "video";
  tags?: string[];
  created_at: string;
  contributor_id?: string;
  wallet_type?: "EVM" | "XRPL";
  reward_points?: number;
}

export async function uploadPostMetadata(post: KleoPost): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create metadata object
      const metadata: PostMetadata = {
        text: post.text,
        lat: post.lat,
        lng: post.lng,
        ipfs_url: post.ipfs_url,
        media_type: post.media_type,
        tags: post.tags || [],
        created_at: post.created_at,
        contributor_id: post.contributor_id,
        wallet_type: post.wallet_type,
        reward_points: post.reward_points || 0
      };

      // Convert to JSON and create file
      const metadataJson = JSON.stringify(metadata, null, 2);
      const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], `post-${post.id}.json`, { 
        type: 'application/json' 
      });

      // Upload to IPFS
      const cid = await ipfsStorage.uploadFile(metadataFile);
      const ipfsUrl = `ipfs://${cid}`;

      console.log('Post metadata uploaded to IPFS:', ipfsUrl);
      return cid;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`IPFS upload attempt ${attempt} failed:`, lastError);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // If all retries failed, throw the last error
  throw new Error(`Failed to upload post metadata after ${maxRetries} attempts: ${lastError?.message}`);
}

// Utility function to get IPFS gateway URL
export function getIPFSGatewayUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${cid}`;
}

// Utility function to fetch post metadata from IPFS
export async function fetchPostMetadata(cid: string): Promise<PostMetadata | null> {
  try {
    const response = await fetch(getIPFSGatewayUrl(`ipfs://${cid}`));
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    const metadata: PostMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Failed to fetch post metadata:', error);
    return null;
  }
} 