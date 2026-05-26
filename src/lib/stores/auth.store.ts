import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const ACCESS_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** JWT cookie for Edge proxy; localStorage keys for axios interceptors — kept in sync with Zustand persist. */
function syncClientAuthSession(access: string | null, refresh: string | null) {
  if (typeof document === 'undefined') return;
  if (access) {
    document.cookie = `oda_access_token=${access}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE_SEC}; samesite=lax`;
    try {
      localStorage.setItem('oda_access_token', access);
      if (refresh) localStorage.setItem('oda_refresh_token', refresh);
    } catch {
      /* ignore quota / private mode */
    }
  }
}

function clearClientAuthSession() {
  if (typeof document === 'undefined') return;
  document.cookie = 'oda_access_token=; path=/; max-age=0';
  try {
    localStorage.removeItem('oda_access_token');
    localStorage.removeItem('oda_refresh_token');
  } catch {
    /* ignore */
  }
}

export interface AuthUser {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  mustChangePassword?: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  setTokens: (access: string, refresh: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

/** SSR-safe no-op storage so Zustand `persist` always attaches `api.persist` on the server. */
const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
        syncClientAuthSession(accessToken, refreshToken);
      },
      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
      logout: () => {
        clearClientAuthSession();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'oda:auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state.isAuthenticated) {
          syncClientAuthSession(state.accessToken, state.refreshToken);
        }
      },
    },
  ),
);
