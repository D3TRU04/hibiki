import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_BUCKET = 'kleo-audio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Handle file upload
      const { fileName, fileData, contentType } = req.body;

      if (!fileName || !fileData || !contentType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, buffer, {
          contentType,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      res.status(200).json({ 
        url: urlData.publicUrl,
        fileName: data.path 
      });
    } catch (error) {
      console.error('Error uploading audio:', error);
      res.status(500).json({ error: 'Failed to upload audio file' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 