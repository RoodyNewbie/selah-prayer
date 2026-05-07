import { Link } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <GlobalAudioButton />
      <ThemeToggle />
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Settings"
      >
        <Link to="/settings">
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  );
}
