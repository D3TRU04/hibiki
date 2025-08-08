import { Web3Storage, File } from 'web3.storage';
import { KleoPost, User, Post } from './types';

// Graph database interface for relationship mapping
export interface GraphNode {
  id: string;
  type: 'user' | 'post' | 'location' | 'tag' | 'source';
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'posted' | 'located_at' | 'tagged_with' | 'authored_by' | 'related_to';
  properties: Record<string, any>;
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

export class Web3StorageService {
  private static instance: Web3StorageService;
  private client: Web3Storage | null = null;
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

  constructor() {
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
    if (token) {
      this.client = new Web3Storage({ token });
    } else {
      console.warn('Web3.Storage token not found. Using fallback storage.');
    }
  }

  static getInstance(): Web3StorageService {
    if (!Web3StorageService.instance) {
      Web3StorageService.instance = new Web3StorageService();
    }
    return Web3StorageService.instance;
  }

  // Upload file to IPFS via web3.storage
  async uploadFile(file: File, metadata?: Record<string, any>): Promise<string> {
    if (!this.client) {
      throw new Error('Web3.Storage client not initialized');
    }

    try {
      // Create file with metadata
      const fileWithMetadata = new File([file], file.name, {
        type: file.type,
        lastModified: Date.now()
      });

      // Upload to IPFS
      const cid = await this.client.put([fileWithMetadata], {
        name: file.name,
        metadata: metadata || {}
      });

      console.log('File uploaded to IPFS via web3.storage:', cid);
      return cid;
    } catch (error) {
      console.error('Error uploading to web3.storage:', error);
      throw error;
    }
  }

  // Upload post with Graph database integration
  async uploadPost(post: KleoPost, enhancedMetadata?: any): Promise<string> {
    try {
      const metadata = enhancedMetadata || {
        ...post,
        metadata_version: '1.0',
        timestamp: new Date().toISOString()
      };

      const jsonString = JSON.stringify(metadata, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'post-metadata.json', { type: 'application/json' });

      const cid = await this.uploadFile(file);

      // Update in-memory graph database
      this.updateGraphDatabase(post, cid);

      return cid;
    } catch (error) {
      console.error('Error uploading post metadata:', error);
      throw error;
    }
  }

  private updateGraphDatabase(post: KleoPost, cid: string): void {
    // Add post node
    const postNode: GraphNode = {
      id: post.id,
      type: 'post',
      properties: {
        cid,
        content: post.content,
        media_type: post.type,
        source_url: post.source_url,
        summary_text: post.ai_summary,
        wallet_address: post.user_id,
        lat: post.lat,
        lng: post.lng,
        created_at: post.created_at,
        far_score: post.far_score
      }
    };

    // Add location node
    const locationNode: GraphNode = {
      id: `location-${post.lat}-${post.lng}`,
      type: 'location',
      properties: {
        lat: post.lat,
        lng: post.lng,
        post_count: 1
      }
    };

    // Add user node
    const userNode: GraphNode = {
      id: post.user_id,
      type: 'user',
      properties: {
        wallet_address: post.user_id,
        total_posts: 1,
        total_xp: post.far_score,
        last_activity: post.created_at
      }
    };

    // Add source node if applicable
    let sourceNode: GraphNode | null = null;
    if (post.source_url) {
      const domain = new URL(post.source_url).hostname;
      sourceNode = {
        id: `source-${domain}`,
        type: 'source',
        properties: {
          domain,
          url: post.source_url,
          post_count: 1,
          credibility_score: post.credibility_score || 0
        }
      };
    }

    // Add nodes to graph
    this.graphDB.nodes.push(postNode);
    this.graphDB.nodes.push(locationNode);
    this.graphDB.nodes.push(userNode);
    if (sourceNode) {
      this.graphDB.nodes.push(sourceNode);
    }

    // Add edges
    this.graphDB.edges.push({
      from: post.id,
      to: post.user_id,
      type: 'authored_by'
    });

    this.graphDB.edges.push({
      from: post.id,
      to: `location-${post.lat}-${post.lng}`,
      type: 'located_at'
    });

    if (sourceNode) {
      this.graphDB.edges.push({
        from: post.id,
        to: sourceNode.id,
        type: 'related_to'
      });
    }

    // Update existing nodes
    this.updateExistingNodes(post, sourceNode);
  }

  private updateExistingNodes(post: KleoPost, sourceNode: GraphNode | null): void {
    // Update location node
    const locationId = `location-${post.lat}-${post.lng}`;
    const existingLocation = this.graphDB.nodes.find(n => n.id === locationId);
    if (existingLocation) {
      existingLocation.properties.post_count = (existingLocation.properties.post_count || 0) + 1;
    }

    // Update user node
    const existingUser = this.graphDB.nodes.find(n => n.id === post.user_id);
    if (existingUser) {
      existingUser.properties.total_posts = (existingUser.properties.total_posts || 0) + 1;
      existingUser.properties.total_xp = (existingUser.properties.total_xp || 0) + post.far_score;
      existingUser.properties.last_activity = post.created_at;
    }

    // Update source node
    if (sourceNode) {
      const existingSource = this.graphDB.nodes.find(n => n.id === sourceNode!.id);
      if (existingSource) {
        existingSource.properties.post_count = (existingSource.properties.post_count || 0) + 1;
        existingSource.properties.credibility_score = Math.max(
          existingSource.properties.credibility_score || 0,
          post.credibility_score || 0
        );
      }
    }
  }

  // Query Graph database
  async queryGraph(query: {
    type?: 'user' | 'post' | 'location' | 'tag' | 'source';
    properties?: Record<string, any>;
    relationships?: string[];
    limit?: number;
  }): Promise<GraphNode[]> {
    let results = this.graphDB.nodes;

    // Filter by type
    if (query.type) {
      results = results.filter(node => node.type === query.type);
    }

    // Filter by properties
    if (query.properties) {
      results = results.filter(node => {
        return Object.entries(query.properties!).every(([key, value]) => 
          node.properties[key] === value
        );
      });
    }

    // Filter by relationships
    if (query.relationships) {
      const relatedNodeIds = this.graphDB.edges
        .filter(edge => query.relationships!.includes(edge.type))
        .map(edge => edge.to);
      
      results = results.filter(node => relatedNodeIds.includes(node.id));
    }

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  // Get related posts for a location
  async getRelatedPosts(lat: number, lng: number, radius: number = 0.001): Promise<KleoPost[]> {
    const locationNodes = this.graphDB.nodes.filter(node => 
      node.type === 'location' &&
      Math.abs(node.properties.lat - lat) < radius &&
      Math.abs(node.properties.lng - lng) < radius
    );

    const locationIds = locationNodes.map(node => node.id);
    const postEdges = this.graphDB.edges.filter(edge => 
      edge.type === 'located_at' && locationIds.includes(edge.to)
    );

    const postIds = postEdges.map(edge => edge.from);
    const posts = this.graphDB.nodes.filter(node => 
      node.type === 'post' && postIds.includes(node.id)
    );

    return posts.map(node => ({
      id: node.id,
      text: node.properties.text,
      lat: node.properties.lat,
      lng: node.properties.lng,
      ipfs_url: node.properties.ipfs_url,
      media_type: node.properties.media_type,
      tags: node.properties.tags || [],
      created_at: node.createdAt,
      contributor_id: node.properties.contributor_id,
      wallet_type: node.properties.wallet_type,
      reward_points: node.properties.reward_points,
      ai_summary: node.properties.ai_summary,
      source_url: node.properties.source_url,
      credibility_score: node.properties.credibility_score,
      is_reliable: node.properties.is_reliable
    }));
  }

  // Get user activity graph
  async getUserActivity(userId: string): Promise<{
    posts: GraphNode[];
    locations: GraphNode[];
    tags: GraphNode[];
    sources: GraphNode[];
  }> {
    const userEdges = this.graphDB.edges.filter(edge => 
      edge.from === userId || edge.to === userId
    );

    const relatedNodeIds = userEdges.map(edge => 
      edge.from === userId ? edge.to : edge.from
    );

    const relatedNodes = this.graphDB.nodes.filter(node => 
      relatedNodeIds.includes(node.id)
    );

    return {
      posts: relatedNodes.filter(node => node.type === 'post'),
      locations: relatedNodes.filter(node => node.type === 'location'),
      tags: relatedNodes.filter(node => node.type === 'tag'),
      sources: relatedNodes.filter(node => node.type === 'source')
    };
  }

  // Get trending locations
  async getTrendingLocations(limit: number = 10): Promise<GraphNode[]> {
    const locationNodes = this.graphDB.nodes.filter(n => n.type === 'location');
    return locationNodes
      .sort((a, b) => (b.properties.post_count || 0) - (a.properties.post_count || 0))
      .slice(0, limit);
  }

  async getCredibilityAnalysis(): Promise<any> {
    const sourceNodes = this.graphDB.nodes.filter(n => n.type === 'source');
    const totalSources = sourceNodes.length;
    const reliableSources = sourceNodes.filter(n => (n.properties.credibility_score || 0) >= 70).length;
    const averageCredibility = sourceNodes.reduce((sum, n) => sum + (n.properties.credibility_score || 0), 0) / totalSources;

    return {
      total_sources: totalSources,
      reliable_sources: reliableSources,
      average_credibility: averageCredibility,
      top_sources: sourceNodes
        .sort((a, b) => (b.properties.credibility_score || 0) - (a.properties.credibility_score || 0))
        .slice(0, 5)
    };
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
export const web3StorageService = Web3StorageService.getInstance(); 