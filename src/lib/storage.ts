import { PrayerRequest, PrayerSession } from './prayerData';

const REQUESTS_KEY = 'selah_requests';
const SESSIONS_KEY = 'selah_sessions';
const LAST_PRAYED_KEY = 'selah_last_prayed';

export const storage = {
  // Prayer Requests
  getRequests: (): PrayerRequest[] => {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRequest: (request: PrayerRequest): void => {
    const requests = storage.getRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  },

  deleteRequest: (id: string): void => {
    const requests = storage.getRequests().filter(r => r.id !== id);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  },

  // Prayer Sessions
  getSessions: (): PrayerSession[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: PrayerSession): void => {
    const sessions = storage.getSessions();
    sessions.unshift(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem(LAST_PRAYED_KEY, session.timestamp);
  },

  getLastPrayed: (): string | null => {
    return localStorage.getItem(LAST_PRAYED_KEY);
  },

  // Dark mode
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
