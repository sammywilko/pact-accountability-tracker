export type Category = 'fitness' | 'creative' | 'project' | 'life' | 'work';
export type MetricType = 'count' | 'duration' | 'milestone';
export type Cadence = 'daily' | 'weekly' | 'monthly' | 'once';
export type CrewRole = 'admin' | 'member';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  streak: number;
  last_check_in: string | null;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface Crew {
  id: string;
  name: string;
  invite_code: string;
  group_streak: number;
  active_stakes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  crew_id: string;
  user_id: string;
  role: CrewRole;
  joined_at: string;
  profile?: Profile;
}

export interface Goal {
  id: string;
  crew_id: string | null;
  owner_id: string;
  title: string;
  description: string | null;
  category: Category;
  metric_type: MetricType;
  target_value: string | null;
  cadence: Cadence;
  definition_of_done: string | null;
  is_shared: boolean;
  streak: number;
  stakes: string | null;
  schedule: GoalSchedule | null;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
  owner?: Profile;
}

export interface GoalSchedule { days: string[]; time: string; }

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  goal_id: string;
  user_id: string;
  photo_url: string | null;
  selfie_url: string | null;
  note: string | null;
  ai_analysis: string | null;
  confidence_score: number | null;
  is_fake: boolean;
  is_late: boolean;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  goal?: Goal;
  user?: Profile;
  kudos?: Kudos[];
  kudos_count?: number;
}

export interface Kudos {
  id: string;
  check_in_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: Profile;
}

export interface NotificationSettings {
  reminders: boolean;
  crewActivity: boolean;
  reactions: boolean;
  weeklySummary: boolean;
}

export interface AIVerificationResult {
  confidence: number;
  verdict: string;
  isFake: boolean;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: Category;
  metric_type?: MetricType;
  target_value?: string;
  cadence?: Cadence;
  definition_of_done?: string;
  is_shared?: boolean;
  stakes?: string;
  crew_id?: string;
}

export interface CreateCheckInInput {
  goal_id: string;
  photo_url?: string;
  selfie_url?: string;
  note?: string;
  location_name?: string;
  lat?: number;
  lng?: number;
}