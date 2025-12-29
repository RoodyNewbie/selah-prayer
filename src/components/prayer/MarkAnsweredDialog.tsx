import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Confetti } from '@/components/ui/confetti';
import { PrayerRequest, AnswerType } from '@/lib/prayerData';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  HandHeart,
  Lightbulb
} from 'lucide-react';

export type { AnswerType };

export interface AnsweredData {
  answerType: AnswerType;
  testimony: string;
  gratitudeNote: string;
}

interface MarkAnsweredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PrayerRequest | null;
  onComplete: (data: AnsweredData) => void;
}

const ANSWER_TYPES: { 
  type: AnswerType; 
  label: string; 
  description: string; 
  icon: typeof CheckCircle2;
}[] = [
  { 
    type: 'fully', 
    label: 'Fully Answered', 
    description: 'God gave exactly what I asked',
    icon: CheckCircle2,
  },
  { 
    type: 'differently', 
    label: 'Answered Differently', 
    description: 'God answered in an unexpected way',
    icon: Lightbulb,
  },
  { 
    type: 'partially', 
    label: 'Partially Answered', 
    description: 'Still in progress but seeing movement',
    icon: RefreshCw,
  },
  { 
    type: 'peace', 
    label: 'Peace Received', 
    description: 'God gave peace even if circumstances did not change',
    icon: HandHeart,
  },
];

export function MarkAnsweredDialog({ 
  open, 
  onOpenChange, 
  request,
  onComplete 
}: MarkAnsweredDialogProps) {
  const [step, setStep] = useState(1);
  const [answerType, setAnswerType] = useState<AnswerType | null>(null);
  const [testimony, setTestimony] = useState('');
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const resetForm = () => {
    setStep(1);
    setAnswerType(null);
    setTestimony('');
    setGratitudeNote('');
    setShowConfetti(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    } else {
      // Trigger confetti when opening
      setShowConfetti(true);
    }
    onOpenChange(newOpen);
  };

  const handleComplete = () => {
    if (!answerType) return;
    
    onComplete({
      answerType,
      testimony,
      gratitudeNote,
    });
    resetForm();
  };

  const canProceed = () => {
    if (step === 2) return answerType !== null;
    return true;
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <Confetti active={showConfetti && step === 1} />
        
        {/* Step 1: Celebrate */}
        {step === 1 && (
          <div className="text-center py-6 space-y-6 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-ping opacity-20" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-2xl text-foreground">
                Praise God!
              </h2>
              <p className="text-muted-foreground font-body">
                Your prayer has been answered!
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left border border-border/50">
              <p className="text-xs text-muted-foreground font-body mb-1">
                Original Prayer
              </p>
              <p className="font-display text-foreground">
                {request.title}
              </p>
              {request.description && (
                <p className="text-sm text-muted-foreground font-body mt-2 line-clamp-2">
                  {request.description}
                </p>
              )}
            </div>

            <Button onClick={() => setStep(2)} size="lg" className="w-full gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: How was it answered? */}
        {step === 2 && (
          <div className="py-4 space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-xl text-foreground">
                How did God answer?
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Select the option that best describes your experience
              </p>
            </div>

            <div className="space-y-2">
              {ANSWER_TYPES.map((option) => {
                const Icon = option.icon;
                const isSelected = answerType === option.type;
                
                return (
                  <button
                    key={option.type}
                    onClick={() => setAnswerType(option.type)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border',
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        'font-body font-medium',
                        isSelected ? 'text-foreground' : 'text-foreground/80'
                      )}>
                        {option.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!canProceed()}
                className="flex-1 gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Reflect */}
        {step === 3 && (
          <div className="py-4 space-y-5 animate-fade-in">
            <div className="text-center">
              <h2 className="font-display text-xl text-foreground">
                Reflect & Give Thanks
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Optional: Record this testimony for future encouragement
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  How did God answer this prayer?
                </label>
                <Textarea
                  placeholder="Share the story of how God worked..."
                  value={testimony}
                  onChange={(e) => setTestimony(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  What are you grateful for?
                </label>
                <Textarea
                  placeholder="Express your thankfulness..."
                  value={gratitudeNote}
                  onChange={(e) => setGratitudeNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)} 
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)}
                className="flex-1 gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="py-6 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl text-foreground">
                Testimony Recorded
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                This answered prayer will be saved to your testimony wall
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3 border border-border/50">
              <div>
                <p className="text-xs text-muted-foreground font-body">Prayer</p>
                <p className="font-body text-foreground text-sm">{request.title}</p>
              </div>
              
              {answerType && (
                <div>
                  <p className="text-xs text-muted-foreground font-body">How Answered</p>
                  <p className="font-body text-foreground text-sm">
                    {ANSWER_TYPES.find(a => a.type === answerType)?.label}
                  </p>
                </div>
              )}

              {testimony && (
                <div>
                  <p className="text-xs text-muted-foreground font-body">Testimony</p>
                  <p className="font-body text-foreground text-sm line-clamp-2">{testimony}</p>
                </div>
              )}

              {gratitudeNote && (
                <div>
                  <p className="text-xs text-muted-foreground font-body">Gratitude</p>
                  <p className="font-body text-foreground text-sm line-clamp-2">{gratitudeNote}</p>
                </div>
              )}
            </div>

            <Button onClick={handleComplete} size="lg" className="w-full">
              Complete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
