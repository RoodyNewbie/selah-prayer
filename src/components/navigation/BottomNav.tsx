import { NavLink } from 'react-router-dom';
import { BottomNavItem } from './BottomNavItem';
import { PhaseSigil } from '@/components/prayer/PhaseSigil';
import { primaryAppNav } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const [homeNav, requestsNav, prayNav, journalNav, stonesNav] = primaryAppNav;
const secondaryNav = [homeNav, requestsNav, journalNav, stonesNav] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-3 pb-2">
        <div className="relative rounded-[1.75rem] border border-border/55 bg-card/92 backdrop-blur-md px-2 pb-1 pt-2 shadow-soft">
          <div className="grid grid-cols-5 items-end">
            {secondaryNav.slice(0, 2).map((item) => (
              <BottomNavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}

            <NavLink
              to={prayNav.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center -mt-8 mx-auto rounded-full px-2 pb-1 text-primary transition-transform duration-300 motion-reduce:transition-none',
                  isActive ? 'scale-[1.02]' : 'hover:-translate-y-0.5'
                )
              }
              aria-label="Begin prayer"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center',
                      'bg-primary text-primary-foreground border border-primary/25',
                      'transition-all duration-300 motion-reduce:transition-none',
                      isActive && 'ring-2 ring-primary/20'
                    )}
                    style={{ boxShadow: 'var(--shadow-pri)' }}
                  >
                    <PhaseSigil phaseId="worship" className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] mt-1 font-medium font-body">{prayNav.label}</span>
                </>
              )}
            </NavLink>

            {secondaryNav.slice(2).map((item) => (
              <BottomNavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
