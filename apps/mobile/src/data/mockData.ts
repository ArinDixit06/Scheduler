import type { CalendarEvent, Habit, Insight, Task } from '../types';

export const tasks: Task[] = [
  { id: '1', title: 'Draft weekly review', status: 'INBOX', priority: 92, manualPriority: 'HIGH', tags: ['writing'] },
  { id: '2', title: 'Prep focus session', status: 'TODO', priority: 84, manualPriority: 'MEDIUM', tags: ['focus'] },
  { id: '3', title: 'Send follow-up email', status: 'IN_PROGRESS', priority: 74, manualPriority: 'HIGH', tags: ['email'] }
];

export const habits: Habit[] = [
  { id: 'h1', title: 'Read', streak: 18, completedToday: true, color: '#4ade80', frequency: 'DAILY' },
  { id: 'h2', title: 'Walk', streak: 7, completedToday: false, color: '#60a5fa', frequency: 'DAILY' },
  { id: 'h3', title: 'Journal', streak: 4, completedToday: false, color: '#f59e0b', frequency: 'DAILY' }
];

export const events: CalendarEvent[] = [
  { id: 'e1', title: 'Standup', startAt: '09:00', endAt: '09:15', source: 'GOOGLE' },
  { id: 'e2', title: 'Design review', startAt: '11:00', endAt: '12:00', source: 'OUTLOOK' },
  { id: 'e3', title: 'Deep work block', startAt: '14:00', endAt: '16:00', source: 'INTERNAL' }
];

export const insights: Insight[] = [
  { id: 'i1', title: 'Workload rising', body: 'You have 6 high-priority items due this week. Consider batching comms.' }
];
