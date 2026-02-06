// Only dark mode utilities remain; prayer data is stored in Supabase.

export const storage = {
  getDarkMode: (): boolean => {
    return localStorage.getItem('selah_dark_mode') === 'true';
  },

  setDarkMode: (dark: boolean): void => {
    localStorage.setItem('selah_dark_mode', dark ? 'true' : 'false');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  initDarkMode: (): void => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('selah_dark_mode');
    const isDark = stored !== null ? stored === 'true' : prefersDark;
    storage.setDarkMode(isDark);
  },
};
