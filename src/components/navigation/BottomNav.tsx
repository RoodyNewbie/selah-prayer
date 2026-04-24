import { Home, ListChecks, Milestone, BookOpen, Sparkles } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/92 backdrop-blur-md border-t border-border/60 shadow-lifted z-50">
      <div className="grid grid-cols-5 items-end max-w-lg mx-auto px-2 pb-2 pt-1">
        <BottomNavItem to="/" icon={Home} label="Home" />
        <BottomNavItem to="/requests" icon={ListChecks} label="Requests" />
        <NavLink
          to="/pray"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center -mt-6 mx-auto rounded-2xl px-3 pb-1 text-primary transition-transform duration-300 motion-reduce:transition-none',
              isActive ? 'scale-[1.02]' : 'hover:-translate-y-0.5'
            )
          }
          aria-label="Begin prayer"
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center',
                  'bg-primary text-primary-foreground shadow-glow shadow-lifted',
                  'border border-primary/30',
                  'transition-all duration-300 motion-reduce:transition-none',
                  isActive && 'ring-2 ring-primary/25'
                )}
              >
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-[11px] mt-1 font-medium font-body">Pray</span>
            </>
          )}
        </NavLink>
        <BottomNavItem to="/journal" icon={BookOpen} label="Journal" />
        <BottomNavItem to="/answered" icon={Milestone} label="Stones" />
      </div>
    </nav>
  );
}
