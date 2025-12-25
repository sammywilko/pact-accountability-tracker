import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Goal, CheckIn, CreateGoalInput, CreateCheckInInput, Crew, CrewMember } from '../types';

interface GoalsState {
  goals: Goal[]; checkIns: CheckIn[]; crews: Crew[]; crewMembers: CrewMember[]; loading: boolean;
  fetchGoals: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchCheckIns: (goalId?: string) => Promise<void>;
  fetchFeed: () => Promise<void>;
  createCheckIn: (input: CreateCheckInInput & { ai_analysis?: string; confidence_score?: number; is_fake?: boolean }) => Promise<CheckIn | null>;
  toggleKudos: (checkInId: string, userId: string) => Promise<void>;
  fetchCrews: () => Promise<void>;
  createCrew: (name: string) => Promise<Crew | null>;
  joinCrew: (inviteCode: string) => Promise<boolean>;
  leaveCrew: (crewId: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [], checkIns: [], crews: [], crewMembers: [], loading: false,

  fetchGoals: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('goals').select('*, milestones (*), owner:profiles!owner_id (*)').order('created_at', { ascending: false });
    if (error) { console.error('Fetch goals error:', error); set({ loading: false }); return; }
    set({ goals: data || [], loading: false });
  },

  createGoal: async (input) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('goals').insert({ ...input, owner_id: user.id }).select().single();
    if (error) { console.error('Create goal error:', error); return null; }
    set((state) => ({ goals: [data, ...state.goals] }));
    return data;
  },

  updateGoal: async (id, updates) => {
    const { error } = await supabase.from('goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { console.error('Update goal error:', error); return; }
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
  },

  deleteGoal: async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) { console.error('Delete goal error:', error); return; }
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  fetchCheckIns: async (goalId) => {
    set({ loading: true });
    let query = supabase.from('check_ins').select('*, goal:goals (*), user:profiles!user_id (*), kudos (*, user:profiles!user_id (*))').order('created_at', { ascending: false }).limit(50);
    if (goalId) query = query.eq('goal_id', goalId);
    const { data, error } = await query;
    if (error) { console.error('Fetch check-ins error:', error); set({ loading: false }); return; }
    set({ checkIns: data || [], loading: false });
  },

  fetchFeed: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('check_ins').select('*, goal:goals!inner (*), user:profiles!user_id (*), kudos (*, user:profiles!user_id (*))').order('created_at', { ascending: false }).limit(30);
    if (error) { console.error('Fetch feed error:', error); set({ loading: false }); return; }
    const withCounts = (data || []).map((c) => ({ ...c, kudos_count: c.kudos?.length || 0 }));
    set({ checkIns: withCounts, loading: false });
  },

  createCheckIn: async (input) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('check_ins').insert({ ...input, user_id: user.id }).select('*, goal:goals (*), user:profiles!user_id (*)').single();
    if (error) { console.error('Create check-in error:', error); return null; }
    set((state) => ({ checkIns: [{ ...data, kudos: [], kudos_count: 0 }, ...state.checkIns] }));
    get().fetchGoals();
    return data;
  },

  toggleKudos: async (checkInId, userId) => {
    const { data: existing } = await supabase.from('kudos').select('id').eq('check_in_id', checkInId).eq('user_id', userId).single();
    if (existing) {
      await supabase.from('kudos').delete().eq('id', existing.id);
      set((state) => ({ checkIns: state.checkIns.map((c) => c.id === checkInId ? { ...c, kudos: c.kudos?.filter((k) => k.user_id !== userId) || [], kudos_count: Math.max(0, (c.kudos_count || 0) - 1) } : c) }));
    } else {
      const { data } = await supabase.from('kudos').insert({ check_in_id: checkInId, user_id: userId }).select('*, user:profiles!user_id (*)').single();
      if (data) set((state) => ({ checkIns: state.checkIns.map((c) => c.id === checkInId ? { ...c, kudos: [...(c.kudos || []), data], kudos_count: (c.kudos_count || 0) + 1 } : c) }));
    }
  },

  fetchCrews: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: memberData } = await supabase.from('crew_members').select('crew_id').eq('user_id', user.id);
    if (!memberData?.length) { set({ crews: [], crewMembers: [] }); return; }
    const crewIds = memberData.map((m) => m.crew_id);
    const { data: crews } = await supabase.from('crews').select('*').in('id', crewIds);
    const { data: members } = await supabase.from('crew_members').select('*, profile:profiles!user_id (*)').in('crew_id', crewIds);
    set({ crews: crews || [], crewMembers: members || [] });
  },

  createCrew: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: crew, error } = await supabase.from('crews').insert({ name, created_by: user.id }).select().single();
    if (error) { console.error('Create crew error:', error); return null; }
    await supabase.from('crew_members').insert({ crew_id: crew.id, user_id: user.id, role: 'admin' });
    set((state) => ({ crews: [crew, ...state.crews] }));
    return crew;
  },

  joinCrew: async (inviteCode) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: crew } = await supabase.from('crews').select('id').eq('invite_code', inviteCode.toLowerCase()).single();
    if (!crew) { console.error('Crew not found'); return false; }
    const { error } = await supabase.from('crew_members').insert({ crew_id: crew.id, user_id: user.id, role: 'member' });
    if (error) { console.error('Join crew error:', error); return false; }
    get().fetchCrews();
    return true;
  },

  leaveCrew: async (crewId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('crew_members').delete().eq('crew_id', crewId).eq('user_id', user.id);
    set((state) => ({ crews: state.crews.filter((c) => c.id !== crewId), crewMembers: state.crewMembers.filter((m) => !(m.crew_id === crewId && m.user_id === user.id)) }));
  },
}));