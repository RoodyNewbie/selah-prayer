import { useEffect, useState } from 'react';
import { PrayerPhase } from '@/lib/prayerData';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhaseCardProps {
  phase: PrayerPhase;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

const phaseColors: Record<string, string> = {
  praise: 'bg-phase-praise',
  will: 'bg-phase-will',
  needs: 'bg-phase-needs',
  forgiveness: 'bg-phase-forgive',
  protection: 'bg-phase-protect',
  worship: 'bg-phase-worship',
};

export function PhaseCard({
  phase,
  value,
  onChange,
  onNext,
  onSkip,
  isLast,
}: PhaseCardProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    setCurrentPromptIndex(Math.floor(Math.random() * phase.prompts.length));
  }, [phase.id]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              phaseColors[phase.id] || "bg-primary"
            )}
          />
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            {phase.name}
          </h2>
        </div>
        <p className="text-muted-foreground font-body text-sm">
          {phase.description}
        </p>
      </div>

      {/* Prompt */}
      <div className="bg-muted/50 rounded-xl p-5 border border-border/50">
        <p className="font-display text-lg text-foreground italic text-center">
          "{phase.prompts[currentPromptIndex]}"
        </p>
      </div>

      {/* Scripture */}
      {phase.scripture && (
        <div className="text-center space-y-1">
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            {phase.scripture.verse}
          </p>
          <p className="text-primary font-body text-xs font-medium">
            — {phase.scripture.reference}
          </p>
        </div>
      )}

      {/* Text Area */}
      <Textarea
        placeholder="Write your thoughts here... (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[180px]"
      />

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
          <SkipForward className="w-4 h-4 mr-1" />
          Skip
        </Button>
        <Button onClick={onNext} size="lg">
          {isLast ? 'Finish' : 'Continue'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
