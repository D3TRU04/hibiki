import { supabase, STORAGE_BUCKET } from './supabase';
import { Post, CreatePostData } from './types';

export async function uploadAudioFile(file: File): Promise<string | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    return null;
  }
}

export async function createPost(postData: CreatePostData, audioFile?: File): Promise<Post | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    let mediaUrl: string | undefined;

    if (audioFile) {
      const uploadedUrl = await uploadAudioFile(audioFile);
      if (uploadedUrl) {
        mediaUrl = uploadedUrl;
      } else {
        throw new Error('Failed to upload audio file');
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        text: postData.text,
        lat: postData.lat,
        lng: postData.lng,
        media_url: mediaUrl,
      })
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

export async function getPosts(): Promise<Post[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

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