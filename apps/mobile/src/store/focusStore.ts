import { create } from 'zustand';
import type { FocusMode } from '../types';

type FocusState = {
  active: boolean;
  mode: FocusMode;
  minutesLeft: number;
  taskTitle?: string;
  startSession: (mode: FocusMode, minutes: number, taskTitle?: string) => void;
  endSession: () => void;
  tick: () => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  active: false,
  mode: 'POMODORO',
  minutesLeft: 25,
  taskTitle: undefined,
  startSession: (mode, minutes, taskTitle) => set({ active: true, mode, minutesLeft: minutes, taskTitle }),
  endSession: () => set({ active: false, minutesLeft: 25, taskTitle: undefined }),
  tick: () => set((state) => ({ minutesLeft: Math.max(0, state.minutesLeft - 1) }))
}));
