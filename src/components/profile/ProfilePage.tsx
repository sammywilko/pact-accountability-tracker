import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, LogOut, ShieldCheck, Edit2, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Avatar, Button, Input, Textarea, Card } from '../ui';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => { setSaving(true); await updateProfile({ name, bio, location }); setSaving(false); setEditing(false); };
  const handleLogout = async () => { await signOut(); navigate('/'); };
  if (!profile) return null;

  return (
    <div className="px-5 py-8 space-y-10 pb-36">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 rounded-[1.5rem]"><ArrowLeft size={24} /></button>
        <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving} className="p-4 bg-zinc-900 rounded-[1.5rem] text-emerald-500">{saving ? <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : editing ? <Check size={24} /> : <Edit2 size={24} />}</button>
      </header>
      <div className="flex flex-col items-center text-center space-y-6">
        <Avatar src={profile.avatar_url} alt={profile.name} size="xl" streak={profile.streak} />
        <div className="flex gap-8"><div className="text-center"><p className="text-3xl font-black italic text-white">{profile.streak}</p><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Day Streak</p></div><div className="w-px bg-zinc-800" /><div className="text-center"><p className="text-3xl font-black italic text-white">0</p><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Check-ins</p></div></div>
      </div>
      <div className="space-y-6">
        {editing ? (<><Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /><Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell your crew about yourself..." rows={3} /><Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where are you based?" /></>) : (
          <div className="space-y-3 text-center"><h3 className="text-4xl font-black italic tracking-tight">{profile.name}</h3><p className="text-zinc-400 font-medium max-w-[280px] mx-auto leading-relaxed">{profile.bio || 'No bio yet. Tap edit to add one.'}</p>{profile.location && <div className="flex items-center justify-center gap-2 text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em] pt-4"><MapPin size={12} className="text-emerald-500/50" />{profile.location}</div>}</div>
        )}
      </div>
      {!editing && (
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-3">Security</h4>
          <Card className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></div><div><p className="text-sm font-bold text-zinc-200">Google Verified</p><p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Linked OAuth</p></div></div><ShieldCheck size={20} className="text-emerald-500" /></Card>
          <button onClick={handleLogout} className="w-full p-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-500/60 text-xs font-black uppercase tracking-[0.2em] transition-colors"><LogOut size={18} /> Terminate Session</button>
        </section>
      )}
    </div>
  );
};