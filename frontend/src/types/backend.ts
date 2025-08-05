// Backend types for frontend use
export interface Post {
  id?: string;
  text: string;
  lat: number;
  lng: number;
  media_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePostData {
  text: string;
  lat: number;
  lng: number;
  media_url?: string;
}

export interface UploadFormData {
  text: string;
  audioFile?: File;
} 