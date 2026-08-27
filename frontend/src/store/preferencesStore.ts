import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  toastNotificationsEnabled: boolean;
  toggleToastNotifications: () => void;
}

/**
 * Local, device-specific preferences — not synced to the backend, since
 * there's no per-user preferences table in the schema. Distinct from
 * themeStore only in name/purpose; kept as a separate store so future
 * preferences (e.g., sound alerts) have an obvious home without overloading
 * the theme store's responsibility.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      toastNotificationsEnabled: true,
      toggleToastNotifications: () =>
        set((state) => ({ toastNotificationsEnabled: !state.toastNotificationsEnabled })),
    }),
    {
      name: 'cafeteria-preferences-storage',
    }
  )
);