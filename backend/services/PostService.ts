import { supabase } from '../config/supabase';
import { Post, CreatePostData } from '../models/Post';

export class PostService {
  static async createPost(post: CreatePostData): Promise<Post | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async getPosts(): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }
} 