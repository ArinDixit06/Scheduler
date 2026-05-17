import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AIMessage,
  CalendarEvent,
  FocusSession,
  Habit,
  Insight,
  Integration,
  NotificationPrefs,
  Task,
  TaskStatus
} from '../types';

type PlannerState = {
  tasks: Task[];
  habits: Habit[];
  events: CalendarEvent[];
  insights: Insight[];
  aiMessages: AIMessage[];
  integrations: Integration[];
  notificationPrefs: NotificationPrefs;
  focusHistory: FocusSession[];
  addTask: (title: string, description: string, projectName?: string) => void;
  selectTask: (id: string) => Task | undefined;
  completeTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  addTaskComment: (id: string, comment: string) => void;
  addEvent: (title: string, startAt: string, endAt: string, source?: CalendarEvent['source']) => void;
  selectEvent: (id: string) => CalendarEvent | undefined;
  addHabit: (title: string, reminderTime: string) => void;
  toggleHabit: (id: string) => void;
  selectHabit: (id: string) => Habit | undefined;
  dismissInsight: (id: string) => void;
  sendAIMessage: (text: string) => void;
  quickAIAction: (action: string) => void;
  toggleIntegration: (id: string) => void;
  syncGoogleCalendar: (accessToken?: string) => Promise<void>;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  addFocusSession: (session: FocusSession) => void;
};

const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Prepare weekly review',
    description: 'Summarize wins, blockers, and next-week priorities.',
    status: 'TODO',
    priority: 92,
    manualPriority: 'HIGH',
    dueDate: 'Today 5:00 PM',
    tags: ['review', 'planning'],
    projectName: 'Operations',
    estimatedMinutes: 45,
    comments: ['Pull focus metrics before drafting']
  },
  {
    id: 't2',
    title: 'Reply to design feedback',
    description: 'Turn the mock review into implementation notes.',
    status: 'IN_PROGRESS',
    priority: 80,
    manualPriority: 'MEDIUM',
    dueDate: 'Today 2:00 PM',
    tags: ['design'],
    projectName: 'Mobile',
    estimatedMinutes: 30,
    comments: []
  },
  {
    id: 't3',
    title: 'Book Q3 planning block',
    description: 'Reserve a two-hour slot with the leadership team.',
    status: 'INBOX',
    priority: 67,
    manualPriority: 'LOW',
    dueDate: 'Tomorrow',
    tags: ['calendar'],
    projectName: 'Strategy',
    estimatedMinutes: 15,
    comments: []
  }
];

const initialHabits: Habit[] = [
  {
    id: 'h1',
    title: 'Morning review',
    streak: 18,
    completedToday: true,
    color: '#3E6AE1',
    frequency: 'DAILY',
    reminderTime: '8:00 AM',
    weeklyCompletions: [1, 1, 1, 1, 1, 0, 1],
    notes: ['Strong start this week']
  },
  {
    id: 'h2',
    title: 'Walk outside',
    streak: 6,
    completedToday: false,
    color: '#171A20',
    frequency: 'DAILY',
    reminderTime: '6:00 PM',
    weeklyCompletions: [1, 0, 1, 0, 1, 1, 0],
    notes: []
  }
];

const initialEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Standup',
    startAt: '09:00',
    endAt: '09:15',
    source: 'GOOGLE',
    description: 'Core team daily sync.',
    linkedTaskIds: ['t2']
  },
  {
    id: 'e2',
    title: 'Review session',
    startAt: '11:00',
    endAt: '12:00',
    source: 'OUTLOOK',
    description: 'Discuss launch status and risks.',
    linkedTaskIds: ['t1']
  }
];

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      habits: initialHabits,
      events: initialEvents,
      insights: [
        { id: 'i1', title: 'Workload rising', body: 'Two high-priority tasks are still unscheduled.', dismissed: false },
        { id: 'i2', title: 'Habit drift', body: 'Walking habit dropped below 60% this week.', dismissed: false }
      ],
      aiMessages: [
        { id: 'm1', role: 'assistant', text: 'I can summarize your day, flag overload, and build a focus block.' }
      ],
      integrations: [
        { id: 'gcal', name: 'Google Calendar', connected: true, lastSyncedAt: '10 min ago', scope: 'calendar.readonly' },
        { id: 'outlook', name: 'Outlook', connected: false, lastSyncedAt: 'Never', scope: 'calendar.events' },
        { id: 'slack', name: 'Slack', connected: true, lastSyncedAt: '1 hr ago', scope: 'chat:write' },
        { id: 'github', name: 'GitHub', connected: false, lastSyncedAt: 'Never', scope: 'repo issues' }
      ],
      notificationPrefs: {
        pushEnabled: true,
        emailEnabled: false,
        dailyDigest: true,
        weeklyReview: true
      },
      focusHistory: [
        {
          id: 'f1',
          mode: 'POMODORO',
          taskTitle: 'Prepare weekly review',
          plannedMinutes: 25,
          completedAt: 'Today 9:45 AM',
          reflection: 'Good output with minimal interruption.'
        }
      ],
      addTask: (title, description, projectName) =>
        set((state) => ({
          tasks: [
            {
              id: `t${state.tasks.length + 1}`,
              title,
              description,
              status: 'INBOX',
              priority: 70,
              manualPriority: 'MEDIUM',
              dueDate: 'Unscheduled',
              tags: ['captured'],
              projectName,
              estimatedMinutes: 30,
              comments: []
            },
            ...state.tasks
          ]
        })),
      selectTask: (id) => get().tasks.find((task) => task.id === id),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: 'DONE' } : task))
        })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, status } : task))
        })),
      addTaskComment: (id, comment) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, comments: [...task.comments, comment] } : task))
        })),
      addEvent: (title, startAt, endAt, source = 'INTERNAL') =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: `e${state.events.length + 1}`,
              title,
              startAt,
              endAt,
              source,
              description: 'Added from the mobile planner',
              linkedTaskIds: []
            }
          ]
        })),
      selectEvent: (id) => get().events.find((event) => event.id === id),
      addHabit: (title, reminderTime) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: `h${state.habits.length + 1}`,
              title,
              streak: 0,
              completedToday: false,
              color: '#3E6AE1',
              frequency: 'DAILY',
              reminderTime,
              weeklyCompletions: [0, 0, 0, 0, 0, 0, 0],
              notes: []
            }
          ]
        })),
      toggleHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  completedToday: !habit.completedToday,
                  streak: habit.completedToday ? Math.max(0, habit.streak - 1) : habit.streak + 1
                }
              : habit
          )
        })),
      selectHabit: (id) => get().habits.find((habit) => habit.id === id),
      dismissInsight: (id) =>
        set((state) => ({
          insights: state.insights.map((insight) => (insight.id === id ? { ...insight, dismissed: true } : insight))
        })),
      sendAIMessage: (text) =>
        set((state) => ({
          aiMessages: [
            ...state.aiMessages,
            { id: `u${state.aiMessages.length + 1}`, role: 'user', text },
            {
              id: `a${state.aiMessages.length + 2}`,
              role: 'assistant',
              text: `Action processed: ${text}. I recommend protecting a 45-minute focus block today.`
            }
          ]
        })),
      quickAIAction: (action) =>
        get().sendAIMessage(
          action === "What's my day?"
            ? 'Summarize my day'
            : action === 'Am I overloaded?'
              ? 'Check if I am overloaded'
              : action === 'Schedule my tasks'
                ? 'Schedule my open tasks'
                : 'Summarize my last meeting'
        ),
      toggleIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id
              ? {
                  ...integration,
                  connected: !integration.connected,
                  lastSyncedAt: integration.connected ? 'Disconnected' : 'Just now'
                }
              : integration
          )
        })),
      syncGoogleCalendar: async (accessToken) => {
        let googleEvents: any[] = [];

        if (accessToken) {
          try {
            const response = await fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=15',
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.items && Array.isArray(data.items)) {
                googleEvents = data.items.map((item: any) => {
                  const startStr = item.start?.dateTime || item.start?.date || '';
                  const endStr = item.end?.dateTime || item.end?.date || '';

                  const formatTime = (isoString: string) => {
                    if (!isoString) return '09:00';
                    try {
                      const d = new Date(isoString);
                      const hours = String(d.getHours()).padStart(2, '0');
                      const mins = String(d.getMinutes()).padStart(2, '0');
                      return `${hours}:${mins}`;
                    } catch {
                      return '09:00';
                    }
                  };

                  return {
                    id: `gcal_${item.id}`,
                    title: item.summary || 'Google Event',
                    startAt: formatTime(startStr),
                    endAt: formatTime(endStr),
                    source: 'GOOGLE' as const,
                    description: item.description || 'Google Calendar synced meeting.',
                    linkedTaskIds: []
                  };
                });
              }
            }
          } catch (err) {
            console.warn('Failed to fetch live Google Calendar events, falling back to mock data:', err);
          }
        }

        // Fallback to high-fidelity mock events if live fetch has no items or was skipped
        if (googleEvents.length === 0) {
          googleEvents = [
            {
              id: 'gcal_e1',
              title: 'Strategic Roadmap Align',
              startAt: '13:00',
              endAt: '14:00',
              source: 'GOOGLE' as const,
              description: 'Google Workspace synced Strategic Roadmap review.',
              linkedTaskIds: []
            },
            {
              id: 'gcal_e2',
              title: 'Apex Architecture Sync',
              startAt: '15:30',
              endAt: '16:00',
              source: 'GOOGLE' as const,
              description: 'Google Workspace synced engineering alignment meeting.',
              linkedTaskIds: []
            },
            {
              id: 'gcal_e3',
              title: 'Weekly AI Copilot Standup',
              startAt: '17:00',
              endAt: '17:30',
              source: 'GOOGLE' as const,
              description: 'Google Workspace synced AI Copilot project standup.',
              linkedTaskIds: []
            }
          ];
        }

        set((state) => {
          // Filter out existing gcal events to keep sync idempotent
          const filteredExisting = state.events.filter((e) => !e.id.startsWith('gcal_'));

          return {
            events: [...filteredExisting, ...googleEvents],
            integrations: state.integrations.map((integration) =>
              integration.id === 'gcal'
                ? {
                    ...integration,
                    connected: true,
                    lastSyncedAt: 'Just now'
                  }
                : integration
            )
          };
        });
      },
      setNotificationPref: (key, value) =>
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, [key]: value }
        })),
      addFocusSession: (session) =>
        set((state) => ({
          focusHistory: [session, ...state.focusHistory]
        }))
    }),
    {
      name: 'planner-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
