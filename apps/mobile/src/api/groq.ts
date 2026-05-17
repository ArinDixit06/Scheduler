import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalendarEvent, Habit, Task, FocusSession } from '../types';

// Read the Groq API key from environment, falling back to the local dev key
const GROQ_API_KEY = 
  process.env.EXPO_PUBLIC_GROQ_API_KEY || 
  process.env.GROQ_API_KEY || 
  '';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Simple in-memory response cache for identical prompt queries to prevent spam
const memoryCache: Record<string, { response: string; timestamp: number }> = {};
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL

export type AppRAGState = {
  tasks: Task[];
  habits: Habit[];
  events: CalendarEvent[];
  focusHistory: FocusSession[];
  selectedDate: string;
};

/**
 * Compiles a rich Markdown-styled string representing the complete state of the application.
 * This is fed into the LLM system prompt as the active RAG Context.
 */
export function compileRAGContext(state: AppRAGState): string {
  const { tasks, habits, events, focusHistory, selectedDate } = state;

  let context = `### USER APPREGISTRY CONTEXT (Active Date: ${selectedDate})\n\n`;

  // 1. Calendar Events
  context += `#### 📅 SCHEDULED EVENTS FOR TODAY:\n`;
  if (events.length === 0) {
    context += `- No events scheduled today.\n`;
  } else {
    events.forEach(e => {
      context += `- [${e.source}] "${e.title}" from ${e.startAt} to ${e.endAt}${e.description ? ` (${e.description})` : ''}\n`;
    });
  }
  context += `\n`;

  // 2. Tasks
  context += `#### 📋 CAPTURED TASKS:\n`;
  const pendingTasks = tasks.filter(t => t.status !== 'DONE');
  if (pendingTasks.length === 0) {
    context += `- All tasks are completed! Good job.\n`;
  } else {
    pendingTasks.forEach(t => {
      context += `- [${t.status}] "${t.title}" | Priority: ${t.manualPriority} (Value: ${t.priority}) | Est: ${t.estimatedMinutes}m | Due: ${t.dueDate || 'Unscheduled'}\n`;
    });
  }
  context += `\n`;

  // 3. Habits
  context += `#### ⚡ HABITS PROGRESS:\n`;
  if (habits.length === 0) {
    context += `- No habits created yet.\n`;
  } else {
    habits.forEach(h => {
      const completionsStr = h.weeklyCompletions.join(', ');
      context += `- "${h.title}" | Streak: ${h.streak} days | Today: ${h.completedToday ? '✅ COMPLETED' : '❌ PENDING'} | Frequency: ${h.frequency} | Weekly completions: [${completionsStr}]\n`;
    });
  }
  context += `\n`;

  // 4. Focus History
  context += `#### 🧠 FOCUS SESSION HISTORY:\n`;
  if (focusHistory.length === 0) {
    context += `- No focus sessions logged today.\n`;
  } else {
    focusHistory.slice(0, 5).forEach(f => {
      context += `- Mode: ${f.mode} | Topic: "${f.taskTitle}" | Duration: ${f.plannedMinutes}m | Done: ${f.completedAt} | Reflection: "${f.reflection}"\n`;
    });
  }

  return context;
}

/**
 * Sends a message thread to the Groq API, injecting compiled RAG context as the system prompt.
 * Automatically utilizes structured outputs and parses potential scheduling recommendations.
 */
export async function fetchGroqChatResponse(
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  appState: AppRAGState
): Promise<string> {
  if (!GROQ_API_KEY) {
    console.warn('[Groq Client] Warning: GROQ_API_KEY is empty. Please ensure EXPO_PUBLIC_GROQ_API_KEY is defined in apps/mobile/.env and restart your Expo server.');
  }
  const userPrompt = chatHistory[chatHistory.length - 1]?.content || '';
  
  // 1. Check local cache
  const now = Date.now();
  const cacheKey = `${userPrompt}_${JSON.stringify(appState.events.length)}_${JSON.stringify(appState.tasks.length)}`;
  if (memoryCache[cacheKey] && now - memoryCache[cacheKey].timestamp < CACHE_TTL_MS) {
    console.log('[Groq Client] Query served from local memory cache.');
    return memoryCache[cacheKey].response;
  }

  // 2. Compile RAG context
  const ragContext = compileRAGContext(appState);

  // 3. Define the optimized System Message
  const systemMessage = {
    role: 'system',
    content: `You are Scheduler Copilot, an ultra-smart mobile AI productivity companion.
Your goal is to help the user design a calm, focused, and high-performance day by scheduling events, building habits, and tracking Pomodoros.

You have live RAG access to the application data below:
${ragContext}

INSTRUCTIONS:
1. Be concise, highly professional, and encouraging. Focus heavily on actionability.
2. If the user asks to schedule a focus block, plan a task, or block out a meeting, make a concrete suggestion.
3. CRITICAL: When recommending a concrete event/block to add to their calendar, format it using a special tag so the application can render a custom Card Reply with an "Add to Calendar / Accept" button.
Format the suggestion EXACTLY like this (do not add any additional wrapper text inside the tag block):
[SUGGESTION:EVENT]
{
  "title": "Focus Block: [Task/Event Name]",
  "startAt": "HH:MM",
  "endAt": "HH:MM",
  "description": "Suggested by AI Copilot"
}
[/SUGGESTION]

Example: "I noticed you have 'Prepare weekly review' due. Let me set up a slot for that:
[SUGGESTION:EVENT]
{
  "title": "Focus Block: Prepare weekly review",
  "startAt": "14:00",
  "endAt": "14:45",
  "description": "AI-scheduled focus block to complete weekly review task"
}
[/SUGGESTION]"

Keep recommendations realistic. Do not overlap with their existing scheduled events. Always refer back to their current RAG context details.`
  };

  try {
    const messagesToSend = [
      systemMessage,
      ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    console.log('[Groq Client] Sending request to Groq API...');
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Using Groq's high-capacity, lightning fast reasoning model
        messages: messagesToSend,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    const responseText = response.data?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t compile a response right now.';
    
    // 4. Save to cache
    memoryCache[cacheKey] = {
      response: responseText,
      timestamp: now
    };

    return responseText;
  } catch (error: any) {
    console.error('[Groq Client] Error querying Groq API:', error?.response?.data || error.message);
    
    // Attempt fallback with llama-3.1-8b-instant if the primary fails or is rate-limited
    try {
      console.log('[Groq Client] Attempting fallback model llama-3.1-8b-instant...');
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            systemMessage,
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
          ],
          temperature: 0.7,
          max_tokens: 800,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000
        }
      );
      const responseText = response.data?.choices?.[0]?.message?.content || '';
      if (responseText) {
        memoryCache[cacheKey] = { response: responseText, timestamp: now };
        return responseText;
      }
    } catch (fallbackError) {
      console.error('[Groq Client] Fallback model also failed.');
    }

    return 'Network Error: I am unable to connect to the Copilot service. Please check your GROQ_API_KEY setup in your `.env` file.';
  }
}

/**
 * Persists the chat conversation list locally.
 */
export async function saveConversationHistory(messages: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem('@copilot_chat_history', JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving chat history:', err);
  }
}

/**
 * Rehydrates the chat conversation list from local storage.
 */
export async function loadConversationHistory(): Promise<any[] | null> {
  try {
    const val = await AsyncStorage.getItem('@copilot_chat_history');
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.error('Error loading chat history:', err);
    return null;
  }
}
