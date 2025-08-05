import { Post, CreatePostData } from '../types/backend';

// API base URL
const API_BASE = '/api';

// Post Service
export class PostService {
  static async createPost(post: CreatePostData): Promise<Post | null> {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async getPosts(): Promise<Post[]> {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting post by id:', error);
      return null;
    }
  }

  static async updatePost(id: string, post: Partial<Post>): Promise<Post | null> {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }
}

// Storage Service
export class StorageService {
  static async uploadAudioFile(file: File): Promise<string | null> {
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch(`${API_BASE}/upload/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: `${Date.now()}-${file.name}`,
          fileData: base64,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      return null;
    }
  }
}

// Post Controller
export class PostController {
  static async createPost(postData: CreatePostData, audioFile?: File): Promise<Post | null> {
    try {
      let mediaUrl: string | undefined;

      // Upload audio file if provided
      if (audioFile) {
        const uploadedUrl = await StorageService.uploadAudioFile(audioFile);
        if (uploadedUrl) {
          mediaUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload audio file');
        }
      }

      // Create post with media URL
      const postWithMedia = {
        ...postData,
        media_url: mediaUrl,
      };

      return await PostService.createPost(postWithMedia);
    } catch (error) {
      console.error('Error in PostController.createPost:', error);
      return null;
    }
  }

  static async getPosts(): Promise<Post[]> {
    try {
      return await PostService.getPosts();
    } catch (error) {
      console.error('Error in PostController.getPosts:', error);
      return [];
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    try {
      return await PostService.getPostById(id);
    } catch (error) {
      console.error('Error in PostController.getPostById:', error);
      return null;
    }
  }
} 