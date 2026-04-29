import { cn } from '@/lib/utils';

interface OrnamentalDividerProps {
  className?: string;
  glyph?: string;
}

export function OrnamentalDivider({ className, glyph = '✦' }: OrnamentalDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center gap-2.5 text-muted-foreground/70', className)}
    >
      <span className="flex-1 h-px bg-foreground/15" />
      <span className="text-[13px] leading-none">{glyph}</span>
      <span className="flex-1 h-px bg-foreground/15" />
    </div>
  );
}
