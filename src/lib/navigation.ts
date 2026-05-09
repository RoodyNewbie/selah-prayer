import { BookOpen, ClipboardList, Home, Sparkles, Star } from 'lucide-react';

export const primaryAppNav = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/pray', label: 'Pray', icon: Sparkles },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/answered', label: 'Stones', icon: Star },
] as const;

export type PrimaryAppNavItem = (typeof primaryAppNav)[number];
