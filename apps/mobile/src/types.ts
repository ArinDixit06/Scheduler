export type TaskStatus = 'INBOX' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
export type PriorityLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type FocusMode = 'POMODORO' | 'DEEP_WORK' | 'FLOW';
export type EventSource = 'GOOGLE' | 'OUTLOOK' | 'INTERNAL';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  manualPriority: PriorityLabel;
  dueDate?: string;
  tags: string[];
  projectName?: string;
  estimatedMinutes: number;
  comments: string[];
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  color: string;
  frequency: HabitFrequency;
  reminderTime: string;
  weeklyCompletions: number[];
  notes: string[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  source: EventSource;
  description: string;
  linkedTaskIds: string[];
};

export type Insight = {
  id: string;
  title: string;
  body: string;
  dismissed: boolean;
};

export type Integration = {
  id: string;
  name: string;
  connected: boolean;
  lastSyncedAt: string;
  scope: string;
};

export type NotificationPrefs = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  dailyDigest: boolean;
  weeklyReview: boolean;
};

export type FocusSession = {
  id: string;
  mode: FocusMode;
  taskTitle: string;
  plannedMinutes: number;
  completedAt: string;
  reflection: string;
};

export type AIMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};
