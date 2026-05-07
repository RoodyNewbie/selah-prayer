import { format, differenceInDays } from 'date-fns';
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
  const daysCarried =
    stone.answeredDate && stone.createdAt
      ? Math.max(0, differenceInDays(new Date(stone.answeredDate), new Date(stone.createdAt)))
      : null;

  const meta = stone.answeredDate
    ? `${format(new Date(stone.answeredDate), 'MMMM yyyy')}${
        daysCarried !== null ? ` · ${daysCarried} day${daysCarried === 1 ? '' : 's'} carried` : ''
      }`
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-stretch gap-4 py-1 group',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="w-[3px] self-stretch rounded-[2px] bg-primary flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-1.5">
          Stone of Remembrance
        </p>
        <p className="font-body font-semibold text-[15px] leading-snug text-foreground line-clamp-2">
          {stone.title}
        </p>
        {meta && (
          <p className="mt-1 text-[12px] text-muted-foreground/80">{meta}</p>
        )}
      </div>
    </button>
  );
}
