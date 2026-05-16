import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

type AppState = {
  theme: ThemeMode;
  offlineQueue: string[];
  setTheme: (theme: ThemeMode) => void;
  enqueueOfflineAction: (action: string) => void;
  dequeueOfflineAction: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  offlineQueue: [],
  setTheme: (theme) => set({ theme }),
  enqueueOfflineAction: (action) =>
    set((state) => ({ offlineQueue: [...state.offlineQueue, action] })),
  dequeueOfflineAction: () =>
    set((state) => ({ offlineQueue: state.offlineQueue.slice(1) })),
}));
