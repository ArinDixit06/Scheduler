import { create } from 'zustand';
import { Vibration, LayoutAnimation } from 'react-native';

export type Phase = 'Focus' | 'Short Break' | 'Long Break';

type FocusState = {
  // Settings
  focusSetting: number;
  shortBreakSetting: number;
  longBreakSetting: number;
  
  // Active Timer state
  currentPhase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  completedSessions: number;
  linkedTaskName: string | null;

  setFocusSetting: (val: number) => void;
  setShortBreakSetting: (val: number) => void;
  setLongBreakSetting: (val: number) => void;
  setLinkedTaskName: (name: string | null) => void;
  
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  tickSecond: (addFocusSession: (session: any) => void) => void;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  focusSetting: 25,
  shortBreakSetting: 5,
  longBreakSetting: 15,
  
  currentPhase: 'Focus',
  secondsLeft: 25 * 60,
  isRunning: false,
  completedSessions: 0,
  linkedTaskName: null,

  setFocusSetting: (val) => set((state) => {
    const nextSeconds = state.currentPhase === 'Focus' ? val * 60 : state.secondsLeft;
    return { focusSetting: val, secondsLeft: state.isRunning ? state.secondsLeft : nextSeconds };
  }),
  setShortBreakSetting: (val) => set((state) => {
    const nextSeconds = state.currentPhase === 'Short Break' ? val * 60 : state.secondsLeft;
    return { shortBreakSetting: val, secondsLeft: state.isRunning ? state.secondsLeft : nextSeconds };
  }),
  setLongBreakSetting: (val) => set((state) => {
    const nextSeconds = state.currentPhase === 'Long Break' ? val * 60 : state.secondsLeft;
    return { longBreakSetting: val, secondsLeft: state.isRunning ? state.secondsLeft : nextSeconds };
  }),
  setLinkedTaskName: (name) => set({ linkedTaskName: name }),

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  resetTimer: () => set((state) => {
    let nextSecs = state.focusSetting * 60;
    if (state.currentPhase === 'Short Break') nextSecs = state.shortBreakSetting * 60;
    if (state.currentPhase === 'Long Break') nextSecs = state.longBreakSetting * 60;
    return { isRunning: false, secondsLeft: nextSecs };
  }),

  skipPhase: () => set((state) => {
    Vibration.vibrate(10);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (state.currentPhase === 'Focus') {
      return {
        completedSessions: state.completedSessions + 1,
        currentPhase: 'Short Break',
        secondsLeft: state.shortBreakSetting * 60,
        isRunning: false
      };
    } else if (state.currentPhase === 'Short Break') {
      return {
        currentPhase: 'Focus',
        secondsLeft: state.focusSetting * 60,
        isRunning: false
      };
    } else {
      return {
        currentPhase: 'Focus',
        secondsLeft: state.focusSetting * 60,
        isRunning: false
      };
    }
  }),

  tickSecond: (addFocusSession) => {
    const state = get();
    if (!state.isRunning) return;

    if (state.secondsLeft <= 1) {
      // Completed current phase!
      Vibration.vibrate([0, 500, 200, 500]);
      
      if (state.currentPhase === 'Focus') {
        const nextSessionCount = state.completedSessions + 1;
        
        // Log in the planner store
        addFocusSession({
          id: `f_${Date.now()}`,
          mode: 'POMODORO',
          taskTitle: state.linkedTaskName || 'General Focus Block',
          plannedMinutes: state.focusSetting,
          completedAt: 'Just now',
          reflection: 'Completed standard focus session.'
        });

        // Switch to breaks
        if (nextSessionCount % 4 === 0) {
          set({
            isRunning: false,
            completedSessions: nextSessionCount,
            currentPhase: 'Long Break',
            secondsLeft: state.longBreakSetting * 60
          });
        } else {
          set({
            isRunning: false,
            completedSessions: nextSessionCount,
            currentPhase: 'Short Break',
            secondsLeft: state.shortBreakSetting * 60
          });
        }
      } else {
        // Switch from Break to Focus
        set({
          isRunning: false,
          currentPhase: 'Focus',
          secondsLeft: state.focusSetting * 60
        });
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } else {
      set({ secondsLeft: state.secondsLeft - 1 });
    }
  }
}));
