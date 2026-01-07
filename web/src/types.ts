export interface Person {
  id: number;
  name: string;
  email?: string;
  company?: string;
  manager_name?: string;
  role?: string;
  tags?: string;
  metadata?: string; // JSON string
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
  title: string;
  due_date?: number;
  status: 'pending' | 'done';
}
