import { supabase, STORAGE_BUCKET } from '../config/supabase';

export class StorageService {
  static async uploadAudioFile(file: File): Promise<string | null> {
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

  static async deleteFile(fileName: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
} 