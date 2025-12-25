import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui';
import { useAuthStore } from '../../stores/authStore';

const GoogleIcon = () => <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12 bg-black">
      <div className="space-y-2 text-center">
        <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-1">PACT</h1>
        <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em]">Private Accountability Crew Tracker</p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <Button onClick={signInWithGoogle} loading={loading} className="w-full py-6"><GoogleIcon /> Sign in with Google</Button>
        <p className="text-[10px] text-center text-zinc-700 font-bold uppercase tracking-widest">Secure Authentication</p>
      </div>
      <div className="max-w-sm space-y-6 text-center">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><span className="text-2xl">📸</span></div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Photo Proof</p></div>
          <div className="space-y-2"><div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><span className="text-2xl">🔥</span></div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Streak System</p></div>
          <div className="space-y-2"><div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><span className="text-2xl">👥</span></div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Crew Support</p></div>
        </div>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-4 text-zinc-800"><ShieldCheck size={48} strokeWidth={1} /><p className="text-[9px] font-black uppercase tracking-[0.3em]">AI-Verified Check-ins</p></div>
    </div>
  );
};