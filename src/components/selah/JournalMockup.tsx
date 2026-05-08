import { BookOpen, Heart, Sparkles } from "lucide-react";

type Props = {
  compact?: boolean;
};

export const JournalMockup = ({ compact = false }: Props) => {
  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-lantern blur-2xl opacity-70 pointer-events-none" />
      <div
        className={`relative rounded-[1.75rem] border hairline bg-card-soft backdrop-blur-xl shadow-soft overflow-hidden ${
          compact ? "p-5" : "p-6 sm:p-7"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-foreground/20" />
            <span className="h-2 w-2 rounded-full bg-foreground/20" />
            <span className="h-2 w-2 rounded-full bg-foreground/20" />
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Today · Evening
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-primary/90 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-medium tracking-wide">A quiet prompt</span>
        </div>

        <p className="font-serif text-parchment text-lg sm:text-xl leading-snug mb-6 text-balance">
          Where did you notice God's nearness today?
        </p>

        <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90 font-serif italic">
          <p>"Lord, teach me to be still today.</p>
          <p>
            I came in carrying the noise of the week — a tired heart, a hurried mind. Help me set
            it down here, slowly, honestly."
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border hairline bg-background/40 px-3 py-2.5">
          <BookOpen className="h-4 w-4 text-primary/80" />
          <span className="text-xs text-muted-foreground">
            Linked to <span className="text-parchment">Psalm 46:10</span>
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-accent" />
            Gratitude · Confession · Petition
          </div>
          <button className="text-xs text-primary hover:brightness-110 transition-all">
            Save entry
          </button>
        </div>
      </div>
    </div>
  );
};
