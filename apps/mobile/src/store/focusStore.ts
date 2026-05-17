import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration, LayoutAnimation } from 'react-native';
import * as Notifications from 'expo-notifications';

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
  expectedEndTime: number | null; // Absolute Unix millisecond timestamp

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

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      focusSetting: 25,
      shortBreakSetting: 5,
      longBreakSetting: 15,
      
      currentPhase: 'Focus',
      secondsLeft: 25 * 60,
      isRunning: false,
      completedSessions: 0,
      linkedTaskName: null,
      expectedEndTime: null,

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

      startTimer: () => set((state) => {
        const now = Date.now();
        // Calculate when the active countdown should expire in absolute system time
        const expectedEndTime = now + state.secondsLeft * 1000;
        return { isRunning: true, expectedEndTime };
      }),
      
      pauseTimer: () => set({ isRunning: false, expectedEndTime: null }),
      
      resetTimer: () => set((state) => {
        let nextSecs = state.focusSetting * 60;
        if (state.currentPhase === 'Short Break') nextSecs = state.shortBreakSetting * 60;
        if (state.currentPhase === 'Long Break') nextSecs = state.longBreakSetting * 60;
        return { isRunning: false, expectedEndTime: null, secondsLeft: nextSecs };
      }),

      skipPhase: () => set((state) => {
        Vibration.vibrate(10);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (state.currentPhase === 'Focus') {
          return {
            completedSessions: state.completedSessions + 1,
            currentPhase: 'Short Break',
            secondsLeft: state.shortBreakSetting * 60,
            isRunning: false,
            expectedEndTime: null
          };
        } else if (state.currentPhase === 'Short Break') {
          return {
            currentPhase: 'Focus',
            secondsLeft: state.focusSetting * 60,
            isRunning: false,
            expectedEndTime: null
          };
        } else {
          return {
            currentPhase: 'Focus',
            secondsLeft: state.focusSetting * 60,
            isRunning: false,
            expectedEndTime: null
          };
        }
      }),

      tickSecond: (addFocusSession) => {
        const state = get();
        if (!state.isRunning) return;

        const now = Date.now();
        // Calculate remaining seconds mathematically using the absolute expected end timestamp
        const endTime = state.expectedEndTime || (now + state.secondsLeft * 1000);
        const secsLeft = Math.max(0, Math.round((endTime - now) / 1000));

        if (secsLeft <= 0) {
          Vibration.vibrate([0, 500, 200, 500]);

          // Push immediate system notification banner
          Notifications.scheduleNotificationAsync({
            content: {
              title: state.currentPhase === 'Focus' ? '🧠 Focus Block Complete!' : '🧘 Break Period Complete!',
              body: state.currentPhase === 'Focus'
                ? `Sensational! You completed "${state.linkedTaskName || 'General Focus Block'}" focus block.`
                : 'Ready to enter focus flow? Tap to start your next block!',
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX
            },
            trigger: null
          }).catch((err) => console.warn('System push alert scheduling failed:', err));
          
          if (state.currentPhase === 'Focus') {
            const nextSessionCount = state.completedSessions + 1;
            
            // Log focus session in local persistent planner history
            addFocusSession({
              id: `f_${Date.now()}`,
              mode: 'POMODORO',
              taskTitle: state.linkedTaskName || 'General Focus Block',
              plannedMinutes: state.focusSetting,
              completedAt: 'Just now',
              reflection: 'Completed standard focus session.'
            });

            if (nextSessionCount % 4 === 0) {
              set({
                isRunning: false,
                expectedEndTime: null,
                completedSessions: nextSessionCount,
                currentPhase: 'Long Break',
                secondsLeft: state.longBreakSetting * 60
              });
            } else {
              set({
                isRunning: false,
                expectedEndTime: null,
                completedSessions: nextSessionCount,
                currentPhase: 'Short Break',
                secondsLeft: state.shortBreakSetting * 60
              });
            }
          } else {
            set({
              isRunning: false,
              expectedEndTime: null,
              currentPhase: 'Focus',
              secondsLeft: state.focusSetting * 60
            });
          }
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } else {
          set({ secondsLeft: secsLeft });
        }
      }
    }),
    {
      name: 'chronos-focus-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
