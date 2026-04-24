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
          "flex flex-col items-center justify-center gap-1 py-2 px-2 transition-all duration-200 motion-reduce:transition-none relative min-w-[60px]",
          isActive
            ? "text-primary"
            : "text-muted-foreground/70 hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "relative p-1.5 rounded-xl transition-all duration-200",
            "motion-reduce:transition-none",
            isActive && "bg-primary/10"
          )}>
            <Icon className={cn(
              "w-5 h-5 transition-all duration-200",
              isActive && "drop-shadow-sm"
            )} />
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-glow" />
            )}
          </div>
          <span className={cn(
            "text-xs font-body transition-all duration-200",
            isActive ? "font-medium" : "font-normal"
          )}>
            {label}
          </span>
        </>
      )}
    </RouterNavLink>
  );
}
