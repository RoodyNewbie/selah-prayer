import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { PrayerRequest } from '@/lib/prayerData';
import { cn } from '@/lib/utils';

interface ThreadsStripProps {
  threads: PrayerRequest[];
  className?: string;
}

export function ThreadsStrip({ threads, className }: ThreadsStripProps) {
  const navigate = useNavigate();
  if (threads.length === 0) return null;

  const visible = threads.slice(0, 6);

  return (
    <section className={cn('space-y-2.5', className)} aria-label="Ongoing prayer threads">
      <div className="flex items-center justify-center gap-3 px-1">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
          Ongoing · {threads.length} carried
        </p>
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="text-[11px] text-primary font-body hover:underline underline-offset-2"
        >
          View all
        </button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {visible.map((thread) => {
          const days = thread.createdAt
            ? Math.max(0, differenceInDays(new Date(), new Date(thread.createdAt)))
            : null;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => navigate('/requests')}
              className={cn(
                'flex-shrink-0 min-w-[7rem] max-w-[10rem] text-center',
                'px-3.5 py-3 rounded-xl border border-border/55',
                'bg-card/45 hover:bg-card/70',
                'transition-colors duration-200 motion-reduce:transition-none'
              )}
            >
              <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">
                {thread.title}
              </p>
              {days !== null && (
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
