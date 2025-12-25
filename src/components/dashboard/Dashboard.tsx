import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MapPin, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useGoalsStore } from '../../stores/goalsStore';
import { Avatar, Card, CategoryBadge, Button, Spinner } from '../ui';
import type { CheckIn } from '../../types';

const FeedItem: React.FC<{ checkIn: CheckIn; onKudos: () => void; currentUserId: string }> = ({ checkIn, onKudos, currentUserId }) => {
  const hasKudos = checkIn.kudos?.some(k => k.user_id === currentUserId);
  const isVerified = checkIn.confidence_score && checkIn.confidence_score >= 70;
  const isSuspicious = checkIn.is_fake || (checkIn.confidence_score && checkIn.confidence_score < 50);
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={checkIn.user?.avatar_url || null} alt={checkIn.user?.name || 'User'} size="md" streak={checkIn.user?.streak} />
          <div><h3 className="font-bold text-white">{checkIn.user?.name}</h3><p className="text-[10px] text-zinc-500 font-medium">{formatDistanceToNow(new Date(checkIn.created_at), { addSuffix: true })}</p></div>
        </div>
        <CategoryBadge category={checkIn.goal?.category || 'life'} />
      </div>
      <p className="text-lg font-black italic text-white">{checkIn.goal?.title}</p>
      {checkIn.photo_url && (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={checkIn.photo_url} alt="Check-in" className="w-full aspect-video object-cover" />
          {checkIn.selfie_url && <div className="absolute bottom-3 right-3 w-16 h-16 rounded-xl overflow-hidden border-2 border-black shadow-lg"><img src={checkIn.selfie_url} alt="Selfie" className="w-full h-full object-cover" /></div>}
        </div>
      )}
      {checkIn.note && <p className="text-zinc-400 font-medium leading-relaxed">{checkIn.note}</p>}
      {checkIn.ai_analysis && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isSuspicious ? 'bg-red-500/5 border-red-500/20' : isVerified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-800/50 border-zinc-700/50'}`}>
          {isSuspicious ? <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" /> : isVerified ? <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" /> : <Sparkles size={16} className="text-zinc-500 mt-0.5 shrink-0" />}
          <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">AI Verification {checkIn.confidence_score && `• ${checkIn.confidence_score}%`}</p><p className="text-sm text-zinc-400">{checkIn.ai_analysis}</p></div>
        </div>
      )}
      {checkIn.location_name && <div className="flex items-center gap-2 text-zinc-600"><MapPin size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{checkIn.location_name}</span></div>}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/50">
        <button onClick={onKudos} className={`flex items-center gap-2 transition-colors ${hasKudos ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}><Heart size={18} fill={hasKudos ? 'currentColor' : 'none'} /><span className="text-[10px] font-black uppercase tracking-widest">{checkIn.kudos_count || 0}</span></button>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"><MessageCircle size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Comment</span></button>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { checkIns, fetchFeed, toggleKudos, loading } = useGoalsStore();
  useEffect(() => { fetchFeed(); }, [fetchFeed]);
  const handleKudos = async (checkInId: string) => { if (profile?.id) await toggleKudos(checkInId, profile.id); };
  return (
    <div className="px-5 py-8 space-y-8 pb-36">
      <header className="flex items-center justify-between"><div><p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Welcome back</p><h1 className="text-4xl font-black italic tracking-tighter">{profile?.name?.split(' ')[0] || 'Soldier'}</h1></div><Link to="/profile"><Avatar src={profile?.avatar_url || null} alt={profile?.name || 'Profile'} size="lg" streak={profile?.streak} /></Link></header>
      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.3em]">Current Streak</p><p className="text-5xl font-black italic text-white mt-2">{profile?.streak || 0}<span className="text-2xl text-emerald-500 ml-2">days</span></p></div><div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"><span className="text-4xl">🔥</span></div></div></Card>
      <div className="grid grid-cols-2 gap-4"><Link to="/check-in"><Button className="w-full py-6">Check In</Button></Link><Link to="/goals"><Button variant="outline" className="w-full py-6">My Goals</Button></Link></div>
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-3">Crew Activity</h2>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : checkIns.length === 0 ? <Card className="text-center py-12"><p className="text-zinc-500 font-medium">No activity yet</p><p className="text-[10px] text-zinc-600 mt-2">Be the first to check in!</p></Card> : <div className="space-y-6">{checkIns.map((c) => <FeedItem key={c.id} checkIn={c} onKudos={() => handleKudos(c.id)} currentUserId={profile?.id || ''} />)}</div>}
      </section>
    </div>
  );
};