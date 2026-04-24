import { cn } from '@/lib/utils';

interface PullQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export function PullQuote({ quote, attribution, className }: PullQuoteProps) {
  return (
    <figure className={cn('space-y-3', className)}>
      <blockquote className="pull-quote text-lg md:text-xl">“{quote}”</blockquote>
      {attribution && (
        <figcaption className="text-sm text-muted-foreground font-body">— {attribution}</figcaption>
      )}
    </figure>
  );
}
