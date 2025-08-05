import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get a specific post by ID
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  } else if (req.method === 'PUT') {
    // Update a post
    try {
      const { text, lat, lng, media_url } = req.body;

      const { data, error } = await supabase
        .from('posts')
        .update({ text, lat, lng, media_url, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a post
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 