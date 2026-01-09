export interface Person {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  function?: string;
  location?: string;
  manager_name?: string;
  role?: string;
  tags?: string;
  metadata?: string; // JSON string
  frequency_days?: number;
  notes?: string;
  last_interaction?: number;
  created_at?: number;
  updated_at?: number;
  interactions?: Interaction[];
  reminders?: Reminder[];
}

export interface Interaction {
  id: number;
  person_id: number;
  type: 'call' | 'email' | 'meeting' | 'text' | 'other';
  summary?: string;
  date: number;
}

export interface Reminder {
  id: number;
  person_id: number;
  person_name?: string; // Joined from API
  title: string;
  due_date?: number;
  status: 'pending' | 'done';
}

export interface Campaign {
  id: number;
  title: string;
  subject_template: string;
  body_template: string;
  created_at: number;
  status: 'open' | 'completed' | 'archived';
  recipients?: CampaignRecipient[];
}

export interface CampaignRecipient {
  id: number;
  campaign_id: number;
  person_id: number;
  status: 'pending' | 'sent';
  sent_at?: number;
  name?: string; // Joined from API
  email?: string; // Joined from API
}
