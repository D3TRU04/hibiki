export interface Post {
  id?: string;
  text: string;
  lat: number;
  lng: number;
  media_url?: string;
  created_at?: string;
}

export interface CreatePostData {
  text: string;
  lat: number;
  lng: number;
}

export interface UploadFormData {
  text: string;
  audioFile?: File;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  post: Post;
} 