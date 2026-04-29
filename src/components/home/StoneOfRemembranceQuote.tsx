import { formatDistanceToNow } from 'date-fns';
import { PrayerRequest } from '@/lib/prayerData';
import { cn } from '@/lib/utils';

interface StoneOfRemembranceQuoteProps {
  stone: PrayerRequest;
  onClick: () => void;
  className?: string;
}

export function StoneOfRemembranceQuote({
  stone,
  onClick,
  className,
}: StoneOfRemembranceQuoteProps) {
  const meta = stone.answeredDate
    ? `Answered ${formatDistanceToNow(new Date(stone.answeredDate), { addSuffix: true })}`
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left flex gap-4 py-3 group',
        'transition-colors duration-200 motion-reduce:transition-none',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 w-[3px] mt-1 rounded-[2px] bg-primary"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-1.5">
          Stone of Remembrance
        </p>
        <p className="font-display italic text-[1.05rem] leading-snug text-foreground line-clamp-2">
          "{stone.title}"
        </p>
        {meta && (
          <p className="mt-1.5 text-[11px] text-muted-foreground/80">{meta}</p>
        )}
      </div>
    </button>
  );
}
