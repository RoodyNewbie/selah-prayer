import { Sigil } from '@/components/design/Sigil';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const PHASE_PREVIEW = ['praise', 'will', 'needs', 'forgiveness', 'protection', 'worship'] as const;

interface BeginPrayerTileProps {
  onClick: () => void;
  meta?: string;
  className?: string;
}

export function BeginPrayerTile({ onClick, meta, className }: BeginPrayerTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left px-5 py-5 rounded-asymmetric',
        'bg-card/55 border border-border/60',
        'transition-all duration-300 ease-breath motion-reduce:transition-none',
        'hover:bg-card/80 hover:shadow-[0_4px_24px_-6px_hsl(var(--primary)/0.28)]',
        'active:scale-[0.995]',
        className
      )}
      aria-label="Begin prayer"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[1.6rem] leading-tight text-foreground">Begin Prayer</p>
        <ArrowRight
          className="w-4 h-4 text-primary transition-transform duration-300 ease-breath group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground/90">
        6 phases · ~10 minutes of guided reflection
      </p>

      <div className="mt-4 flex items-center justify-start gap-3 text-muted-foreground/70" aria-hidden="true">
        {PHASE_PREVIEW.map((id, idx) => (
          <Sigil
            key={id}
            phase={id}
            size={14}
            strokeWidth={1.5}
            className={idx === 0 ? 'text-primary' : ''}
          />
        ))}
      </div>

      {meta && (
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
          {meta}
        </p>
      )}
    </button>
  );
}
