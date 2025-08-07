import { NFTStorage, File } from 'nft.storage';
import { IPFSMetadata } from './types';

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;

if (!NFT_STORAGE_TOKEN) {
  console.warn('NFT.Storage token not found. IPFS uploads will be disabled.');
}

const client = NFT_STORAGE_TOKEN ? new NFTStorage({ token: NFT_STORAGE_TOKEN }) : null;

export async function uploadToIPFS(file: File, metadata: IPFSMetadata): Promise<{ mediaUrl?: string; metadataUrl?: string }> {
  if (!client) {
    throw new Error('IPFS client not initialized. Please check your NFT.Storage token.');
  }

  try {
    let mediaUrl: string | undefined;

    // Upload media file if provided
    if (file) {
      const mediaBlob = new Blob([file], { type: file.type });
      const mediaFile = new File([mediaBlob], file.name, { type: file.type });
      const mediaCid = await client.storeBlob(mediaFile);
      mediaUrl = `ipfs://${mediaCid}`;
      console.log('Media uploaded to IPFS:', mediaUrl);
    }

    // Upload metadata
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
    const metadataCid = await client.storeBlob(metadataFile);
    const metadataUrl = `ipfs://${metadataCid}`;
    console.log('Metadata uploaded to IPFS:', metadataUrl);

    return { mediaUrl, metadataUrl };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function uploadMetadataToIPFS(metadata: IPFSMetadata): Promise<string> {
  if (!client) {
    throw new Error('IPFS client not initialized. Please check your NFT.Storage token.');
  }

  try {
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
    const metadataCid = await client.storeBlob(metadataFile);
    const metadataUrl = `ipfs://${metadataCid}`;
    console.log('Metadata uploaded to IPFS:', metadataUrl);
    return metadataUrl;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

export function getIPFSGatewayUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${cid}`;
} 