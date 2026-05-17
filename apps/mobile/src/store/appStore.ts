import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

type AppState = {
  theme: ThemeMode;
  offlineQueue: string[];
  setTheme: (theme: ThemeMode) => void;
  enqueueOfflineAction: (action: string) => void;
  dequeueOfflineAction: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      offlineQueue: [],
      setTheme: (theme) => set({ theme }),
      enqueueOfflineAction: (action) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, action] })),
      dequeueOfflineAction: () =>
        set((state) => ({ offlineQueue: state.offlineQueue.slice(1) })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
