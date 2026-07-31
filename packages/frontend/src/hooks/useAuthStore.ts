import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  teams?: string[];
  applications?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      login: (user, token) => set({ user, isAuthenticated: true, accessToken: token }),
      logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      // v2: the demo auto-login now uses a real seeded user id (needed for
      // FK-backed actions like comments) instead of a fabricated 'demo-user' id.
      // Renamed so any session persisted under the old key re-authenticates.
      name: 'auth-storage-v2',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, accessToken: state.accessToken }),
    }
  )
);