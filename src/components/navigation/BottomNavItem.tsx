import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BottomNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export function BottomNavItem({ to, icon: Icon, label }: BottomNavItemProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-body">{label}</span>
    </RouterNavLink>
  );
}
