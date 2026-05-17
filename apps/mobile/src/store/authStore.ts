import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  accessToken?: string;
  userName?: string;
  isAuthenticated: boolean;
  signIn: (token: string, userName: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      signIn: (accessToken, userName) => set({ accessToken, userName, isAuthenticated: true }),
      signOut: () => set({ accessToken: undefined, userName: undefined, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
