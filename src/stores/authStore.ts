import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, profile: null, session: null, loading: true, initialized: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            set({ user: session.user, session, profile, loading: false, initialized: true });
          } else {
            set({ loading: false, initialized: true });
          }
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
              set({ user: session.user, session, profile, loading: false });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, profile: null, loading: false });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false, initialized: true });
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/`, queryParams: { access_type: 'offline', prompt: 'consent' } },
        });
        if (error) { console.error('Sign in error:', error); set({ loading: false }); }
      },

      signOut: async () => {
        set({ loading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null, loading: false });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id).select().single();
        if (error) { console.error('Profile update error:', error); return; }
        set({ profile: data });
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) set({ profile: data });
      },
    }),
    { name: 'pact-auth', partialize: () => ({}) }
  )
);