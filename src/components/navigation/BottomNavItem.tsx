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
          'flex flex-col items-center justify-center gap-1 py-2 px-2 transition-colors duration-200 motion-reduce:transition-none min-w-[60px]',
          isActive ? 'text-primary' : 'text-muted-foreground/70 hover:text-foreground'
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium uppercase tracking-[0.12em]">{label}</span>
    </RouterNavLink>
  );
}
