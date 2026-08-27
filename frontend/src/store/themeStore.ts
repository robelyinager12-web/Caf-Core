import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyThemeClass(next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
    }),
    {
      name: 'cafeteria-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Persisted state is restored asynchronously after React mounts,
        // so the <html> class needs to be re-applied here too — otherwise
        // a page refresh briefly flashes light mode even for a user who
        // chose dark, before the store rehydrates.
        if (state) applyThemeClass(state.theme);
      },
    }
  )
);