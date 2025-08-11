import { pinFileToIPFS, pinJSONToIPFS } from './pinata';
import { KleoPost } from '../types';

type JSONValue = string | number | boolean | null | JSONObject | JSONValue[];
interface JSONObject { [key: string]: JSONValue }

// Graph database interface for relationship mapping
export interface GraphNode {
  id: string;
  type: 'user' | 'post' | 'location' | 'tag' | 'source';
  properties: JSONObject;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'posted' | 'located_at' | 'tagged_with' | 'authored_by' | 'related_to';
  properties: JSONObject;
  createdAt: string;
}

export interface GraphDatabase {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalNodes: number;
    totalEdges: number;
  };
}

export class PinataStorageService {
  private static instance: PinataStorageService;
  private graphDB: GraphDatabase = {
    nodes: [],
    edges: [],
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalNodes: 0,
      totalEdges: 0
    }
  };

  static getInstance(): PinataStorageService {
    if (!PinataStorageService.instance) {
      PinataStorageService.instance = new PinataStorageService();
    }
    return PinataStorageService.instance;
  }

  // Upload file to IPFS via Pinata
  async uploadFile(file: File, _metadata?: JSONObject): Promise<string> {
    try {
      const fileWithMetadata = new File([file], file.name, { type: file.type, lastModified: Date.now() });
      const cid = await pinFileToIPFS(fileWithMetadata);
      return cid;
    } catch (error) {
      throw error;
    }
  }

  // Upload post with Graph database integration
  async uploadPost(post: KleoPost, _enhancedMetadata?: JSONObject): Promise<string> {
    try {
      const metadata = _enhancedMetadata || {
        ...post,
        metadata_version: '1.0',
        timestamp: new Date().toISOString()
      };

      const cid = await pinJSONToIPFS(metadata);

      // Update in-memory graph database
      this.updateGraphDatabase(post);

      return cid;
    } catch (error) {
      throw error;
    }
  }

  private updateGraphDatabase(post: KleoPost): void {
    // Add post node
    const postNode: GraphNode = {
      id: post.id,
      type: 'post',
      properties: {
        content: post.content,
        media_type: post.type, // 'text' | 'video' | 'news'
        lat: post.lat,
        lng: post.lng,
        ipfs_url: post.media_url || post.ipfs_metadata_url,
        credibility_score: post.credibility_score || 0,
        is_reliable: post.is_reliable || false,
        wallet_address: post.user_id,
        source_url: post.source_url,
        created_at: post.created_at,
      } as JSONObject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.graphDB.nodes.push(postNode);

    // Add location node (if not exists)
    const locationId = `${post.lat.toFixed(4)},${post.lng.toFixed(4)}`;
    let locationNode = this.graphDB.nodes.find(n => n.id === locationId);
    if (!locationNode) {
      locationNode = {
        id: locationId,
        type: 'location',
        properties: { lat: post.lat, lng: post.lng, post_count: 0 } as JSONObject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.graphDB.nodes.push(locationNode);
    }

    // Create edges
    const postedEdge: GraphEdge = {
      id: `${post.id}_posted`,
      from: post.user_id,
      to: post.id,
      type: 'posted',
      properties: { created_at: post.created_at } as JSONObject,
      createdAt: new Date().toISOString()
    };
    this.graphDB.edges.push(postedEdge);

    const locatedAtEdge: GraphEdge = {
      id: `${post.id}_located_at`,
      from: post.id,
      to: locationId,
      type: 'located_at',
      properties: { distance: 0 } as JSONObject,
      createdAt: new Date().toISOString()
    };
    this.graphDB.edges.push(locatedAtEdge);

    // Update metadata
    this.graphDB.metadata.totalNodes = this.graphDB.nodes.length;
    this.graphDB.metadata.totalEdges = this.graphDB.edges.length;
  }

  // Export Graph database
  exportGraphDatabase(): GraphDatabase {
    return { ...this.graphDB };
  }

  // Import Graph database
  importGraphDatabase(data: GraphDatabase): void {
    this.graphDB = { ...data };
  }
}

// Export singleton instance
export const pinataStorageService = PinataStorageService.getInstance(); 