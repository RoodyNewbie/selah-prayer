import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useMarkFulfilled } from '@/hooks/useJournalEntries';
import { JournalEntry } from '@/lib/prayerData';
import { Confetti } from '@/components/ui/confetti';

interface MarkFulfilledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null;
}

export function MarkFulfilledDialog({ open, onOpenChange, entry }: MarkFulfilledDialogProps) {
  const [step, setStep] = useState<'celebrate' | 'reflect'>('celebrate');
  const [fulfilledNote, setFulfilledNote] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const markFulfilled = useMarkFulfilled();

  useEffect(() => {
    if (open) {
      setStep('celebrate');
      setFulfilledNote('');
      setShowConfetti(true);
    }
  }, [open]);

  const handleComplete = async () => {
    if (!entry) return;

    try {
      await markFulfilled.mutateAsync({
        id: entry.id,
        fulfilledNote: fulfilledNote.trim() || undefined,
      });
      toast.success('Marked as fulfilled!');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as fulfilled');
    }
  };

  if (!entry) return null;

  return (
    <>
      <Confetti active={showConfetti} />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          {step === 'celebrate' ? (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-display text-2xl text-foreground">
                  {entry.entryType === 'dream' ? 'This dream was fulfilled!' : 'This word has come to pass!'}
                </h2>
                <p className="text-muted-foreground font-body">
                  "{entry.title}"
                </p>
              </div>

              <Button onClick={() => setStep('reflect')} className="gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="font-display text-xl text-foreground">How was it fulfilled?</h2>
                <p className="text-sm text-muted-foreground">
                  Share what happened (optional)
                </p>
              </div>

              <Textarea
                value={fulfilledNote}
                onChange={(e) => setFulfilledNote(e.target.value)}
                placeholder="Describe how this came to pass..."
                rows={4}
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('celebrate')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={markFulfilled.isPending} className="flex-1">
                  {markFulfilled.isPending ? 'Saving...' : 'Complete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
