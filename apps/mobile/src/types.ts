export type TaskStatus = 'INBOX' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
export type PriorityLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type FocusMode = 'POMODORO' | 'DEEP_WORK' | 'FLOW';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  manualPriority: PriorityLabel;
  dueDate?: string;
  tags: string[];
  projectName?: string;
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  color: string;
  frequency: HabitFrequency;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  source: 'GOOGLE' | 'OUTLOOK' | 'INTERNAL';
};

export type Insight = {
  id: string;
  title: string;
  body: string;
};
