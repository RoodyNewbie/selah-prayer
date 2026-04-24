import { PullQuote } from '@/components/design/PullQuote';
import { SectionRule } from '@/components/design/SectionRule';
import { cn } from '@/lib/utils';

interface ScriptureHeroProps {
  text: string;
  reference: string;
  className?: string;
}

export function ScriptureHero({ text, reference, className }: ScriptureHeroProps) {
  return (
    <section className={cn('scripture-block text-center', className)}>
      <div className="scripture-glow" aria-hidden="true" />
      <SectionRule className="mb-5 opacity-70" />
      <PullQuote
        quote={text}
        attribution={reference}
        className="max-w-2xl mx-auto"
      />
      <SectionRule className="mt-5 opacity-70" />
    </section>
  );
}
