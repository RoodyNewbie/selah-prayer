import { Home, ListChecks, Milestone, BookOpen } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 shadow-lifted z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto py-1">
        <BottomNavItem to="/" icon={Home} label="Home" />
        <BottomNavItem to="/requests" icon={ListChecks} label="Requests" />
        <BottomNavItem to="/journal" icon={BookOpen} label="Journal" />
        <BottomNavItem to="/answered" icon={Milestone} label="Stones" />
      </div>
    </nav>
  );
}
