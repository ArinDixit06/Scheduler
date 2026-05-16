import { create } from 'zustand';
import type { FocusMode } from '../types';

type FocusState = {
  active: boolean;
  mode: FocusMode;
  minutesLeft: number;
  startSession: (mode: FocusMode, minutes: number) => void;
  endSession: () => void;
  tick: () => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  active: false,
  mode: 'POMODORO',
  minutesLeft: 25,
  startSession: (mode, minutes) => set({ active: true, mode, minutesLeft: minutes }),
  endSession: () => set({ active: false, minutesLeft: 25 }),
  tick: () => set((state) => ({ minutesLeft: Math.max(0, state.minutesLeft - 1) })),
}));
