import { OrnamentalDivider } from '@/components/design/OrnamentalDivider';
import { cn } from '@/lib/utils';

interface ScriptureHeroProps {
  text: string;
  reference: string;
  className?: string;
}

export function ScriptureHero({ text, reference, className }: ScriptureHeroProps) {
  return (
    <section className={cn('text-center px-2', className)}>
      <OrnamentalDivider className="mb-5" />

      <blockquote
        className={cn(
          'font-display italic text-foreground',
          'text-[1.55rem] leading-[1.55] tracking-[0.005em]',
          'max-w-[34ch] mx-auto text-pretty'
        )}
      >
        "{text}"
      </blockquote>

      <cite
        className={cn(
          'mt-3 inline-block not-italic',
          'text-[10px] font-semibold tracking-[0.16em] uppercase text-primary'
        )}
      >
        — {reference}
      </cite>

      <OrnamentalDivider className="mt-5" />
    </section>
  );
}
