import { primaryAppNav } from '@/lib/navigation';
import { demoAnsweredPrayers, demoHistorySessions } from '@/lib/marketingContent';
import { cn } from '@/lib/utils';

interface ProductPreviewProps {
  className?: string;
}

export function ProductPreview({ className }: ProductPreviewProps) {
  const answeredPrayer = demoAnsweredPrayers[0];
  const historySession = demoHistorySessions[0];

  return (
    <div className={cn('relative w-full max-w-md mx-auto', className)}>
      <div className="rounded-[2rem] border border-border/60 bg-card/80 shadow-lifted backdrop-blur-sm p-4">
        <div className="rounded-[1.5rem] bg-background/80 border border-border/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selah Preview</p>
            <p className="font-display text-xl text-foreground mt-1">Peace be with you</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="scripture-block text-center py-6 px-4">
              <div className="scripture-glow" />
              <p className="font-display italic text-lg leading-relaxed text-foreground/90">
                “Be still, and know that I am God.”
              </p>
              <p className="text-primary text-xs mt-2">— Psalm 46:10</p>
            </div>

            <div className="rounded-2xl bg-primary/[0.08] border border-primary/15 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-primary font-medium">Stone of Remembrance</p>
              <p className="text-sm italic text-foreground/80 mt-2">“{answeredPrayer.title}”</p>
              <p className="text-xs text-muted-foreground mt-2">{answeredPrayer.testimony}</p>
            </div>

            <div className="rounded-2xl bg-muted/25 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Recent Prayer Session</p>
              <p className="text-sm text-foreground/85 mt-2 line-clamp-2">{historySession.generatedPrayer}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 border-t border-border/30 bg-card/70 px-2 py-2">
            {primaryAppNav.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.to} className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] leading-none">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
