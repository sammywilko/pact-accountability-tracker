import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});

export const STORAGE_BUCKET = 'check-in-photos';

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadImage = async (file: Blob, folder: 'activity' | 'selfie', userId: string): Promise<string | null> => {
  const fileName = `${userId}/${folder}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { contentType: 'image/jpeg' });
  if (error) { console.error('Upload error:', error); return null; }
  return getPublicUrl(data.path);
};

export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const mimeType = parts[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
  return new Blob([ab], { type: mimeType });
};