import { Home, ListChecks, Milestone, BookOpen } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

function PrayCross({ className }: { className?: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3v18M5 9h14" />
    </svg>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/92 backdrop-blur-md border-t border-border/60 shadow-lifted"
      role="navigation"
    >
      <div className="grid grid-cols-5 items-end max-w-lg mx-auto px-2 pt-1 pb-2">
        <BottomNavItem to="/" icon={Home} label="Home" />
        <BottomNavItem to="/requests" icon={ListChecks} label="Requests" />

        <NavLink
          to="/pray"
          aria-label="Begin prayer"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center mx-auto -mt-7 select-none',
              'transition-transform duration-300 ease-breath motion-reduce:transition-none',
              isActive ? 'scale-[1.04]' : 'hover:-translate-y-0.5'
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center',
                  'bg-primary text-primary-foreground',
                  'shadow-[0_4px_18px_hsl(var(--primary)/0.32),0_10px_28px_-10px_hsl(var(--primary)/0.45)]',
                  'border border-primary/35',
                  'transition-all duration-300 ease-breath motion-reduce:transition-none',
                  isActive && 'ring-2 ring-primary/25 ring-offset-2 ring-offset-card'
                )}
              >
                <PrayCross className="text-primary-foreground" />
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                Pray
              </span>
            </>
          )}
        </NavLink>

        <BottomNavItem to="/journal" icon={BookOpen} label="Journal" />
        <BottomNavItem to="/answered" icon={Milestone} label="Stones" />
      </div>
    </nav>
  );
}
