import { create } from 'zustand';

type AuthState = {
  accessToken?: string;
  userName?: string;
  isAuthenticated: boolean;
  signIn: (token: string, userName: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signIn: (accessToken, userName) => set({ accessToken, userName, isAuthenticated: true }),
  signOut: () => set({ accessToken: undefined, userName: undefined, isAuthenticated: false }),
}));
