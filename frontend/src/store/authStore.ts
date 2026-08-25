import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';

// SECURITY NOTE: tokens are persisted to localStorage (via zustand's
// `persist` middleware) rather than an httpOnly cookie. This was a
// deliberate simplicity trade-off from Phase 7 Step 1, but it does mean
// tokens are readable by any JS running on this origin (i.e., vulnerable
// to XSS-based token theft, unlike an httpOnly cookie which JS cannot
// read at all). The mitigations already in place — a strict CSP with no
// 'unsafe-inline' for scripts (Phase 10), short 15-minute access token
// lifetime, and no third-party script inclusion anywhere in this app —
// substantially reduce this risk for a single-tenant, internally-hosted
// cafeteria system. Migrating to httpOnly cookies + a CSRF token scheme
// would close this gap fully but is a more invasive change (affecting the
// Axios interceptor, the Socket.IO auth handshake, and CORS credential
// handling together) — flagged as a recommended improvement below rather
// than done silently as part of this pass.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'cafeteria-auth-storage',
    }
  )
);

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}