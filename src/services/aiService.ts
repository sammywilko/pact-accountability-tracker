import { supabase } from '../lib/supabase';
import type { AIVerificationResult } from '../types';

export const analyzeCheckIn = async (base64Image: string, goalTitle: string, definitionOfDone: string): Promise<AIVerificationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-checkin', {
      body: { image: base64Image.split(',')[1] || base64Image, goalTitle, definitionOfDone },
    });
    if (error) {
      console.error('AI verification error:', error);
      return { confidence: 50, verdict: 'Verification service unavailable.', isFake: false };
    }
    return data as AIVerificationResult;
  } catch (error) {
    console.error('AI verification error:', error);
    return { confidence: 50, verdict: 'Verification engine timed out.', isFake: false };
  }
};

export const generateVoiceCoach = async (userName: string, streak: number, goalContext: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-coach', { body: { userName, streak, goalContext } });
    if (error) return null;
    return data?.audioBase64 || null;
  } catch { return null; }
};