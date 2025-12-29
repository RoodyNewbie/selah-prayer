import { cn } from '@/lib/utils';

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function FilterPill({ active, onClick, children }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );
}
