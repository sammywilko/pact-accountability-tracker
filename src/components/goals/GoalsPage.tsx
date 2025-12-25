import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Wallet, ArrowLeft, ChevronRight } from 'lucide-react';
import { useGoalsStore } from '../../stores/goalsStore';
import { Card, Button, StreakBadge, CategoryBadge, Input, Textarea, Spinner } from '../ui';
import type { Category, CreateGoalInput } from '../../types';

const CATEGORIES: Category[] = ['fitness', 'creative', 'project', 'life', 'work'];

export const GoalsPage: React.FC = () => {
  const { goals, fetchGoals, loading } = useGoalsStore();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.category === filter);

  return (
    <div className="px-5 py-8 space-y-10 pb-36">
      <header className="flex justify-between items-center">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Vault</h2>
        <Link to="/new-goal"><div className="p-4 bg-emerald-500 text-black rounded-2xl shadow-lg shadow-emerald-500/20"><Plus size={24} strokeWidth={3} /></div></Link>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>All</button>
        {CATEGORIES.map((cat) => <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${filter === cat ? 'bg-emerald-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>{cat}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : filteredGoals.length === 0 ? <Card className="text-center py-12"><p className="text-zinc-500 font-medium">No goals yet</p><Link to="/new-goal" className="mt-6 inline-block"><Button>Create Goal</Button></Link></Card> : (
        <div className="space-y-6">
          {filteredGoals.map((goal) => (
            <Link key={goal.id} to={`/goal/${goal.id}`}>
              <Card className="space-y-4 hover:bg-zinc-900/60 transition-colors">
                <div className="flex justify-between items-start"><div><CategoryBadge category={goal.category} /><h3 className="text-2xl font-black italic tracking-tight mt-2">{goal.title}</h3></div><StreakBadge streak={goal.streak} /></div>
                {goal.description && <p className="text-zinc-500 text-sm font-medium leading-relaxed">{goal.description}</p>}
                {goal.stakes && <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl"><Wallet size={16} className="text-red-500" /><span className="text-[10px] font-black uppercase tracking-widest text-red-400">Stakes: {goal.stakes}</span></div>}
                <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center"><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{goal.cadence}</span><div className="flex items-center gap-1 text-emerald-500"><span className="text-[10px] font-black uppercase tracking-widest">View Details</span><ChevronRight size={14} /></div></div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const NewGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { createGoal } = useGoalsStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGoalInput>({ title: '', description: '', category: 'life', cadence: 'daily', definition_of_done: '', stakes: '' });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    setLoading(true);
    const goal = await createGoal(formData);
    setLoading(false);
    if (goal) navigate('/goals');
  };

  return (
    <div className="px-5 py-8 space-y-10 pb-36">
      <header className="flex items-center gap-4"><button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 rounded-[1.5rem]"><ArrowLeft size={24} /></button><h2 className="text-3xl font-black italic uppercase tracking-tighter">Forge PACT</h2></header>
      <div className="space-y-6">
        <Input label="PACT Name" placeholder="What's your commitment?" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        <Textarea label="Mission Description" placeholder="Describe your goal..." value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">Category</label><div className="flex flex-wrap gap-2">{CATEGORIES.map((cat) => <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${formData.category === cat ? 'bg-emerald-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>{cat}</button>)}</div></div>
        <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">Frequency</label><div className="flex gap-2">{(['daily', 'weekly', 'monthly'] as const).map((c) => <button key={c} type="button" onClick={() => setFormData({ ...formData, cadence: c })} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${formData.cadence === c ? 'bg-emerald-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>{c}</button>)}</div></div>
        <Input label="Definition of Done" placeholder="What proof will you capture?" value={formData.definition_of_done || ''} onChange={(e) => setFormData({ ...formData, definition_of_done: e.target.value })} />
        <Textarea label="The Stakes (Optional)" placeholder="What happens if you miss?" value={formData.stakes || ''} onChange={(e) => setFormData({ ...formData, stakes: e.target.value })} rows={2} />
        <Button onClick={handleSubmit} loading={loading} disabled={!formData.title.trim()} className="w-full py-6">Initiate PACT</Button>
      </div>
    </div>
  );
};

export const GoalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="px-5 py-8 space-y-10 pb-36">
      <header className="flex items-center gap-4"><button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 rounded-[1.5rem]"><ArrowLeft size={24} /></button><h2 className="text-3xl font-black italic uppercase tracking-tighter">Goal Details</h2></header>
      <p className="text-zinc-500">Goal detail view coming soon...</p>
    </div>
  );
};