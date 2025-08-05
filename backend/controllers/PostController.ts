import { PostService } from '../services/PostService';
import { StorageService } from '../services/StorageService';
import { Post, CreatePostData } from '../models/Post';

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