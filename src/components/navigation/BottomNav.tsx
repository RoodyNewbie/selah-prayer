import { Home, BookOpen, ListChecks, CheckCircle2, History } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-soft z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <BottomNavItem to="/" icon={Home} label="Home" />
        <BottomNavItem to="/requests" icon={ListChecks} label="Requests" />
        <BottomNavItem to="/answered" icon={CheckCircle2} label="Answered" />
        <BottomNavItem to="/history" icon={History} label="History" />
      </div>
    </nav>
  );
}
