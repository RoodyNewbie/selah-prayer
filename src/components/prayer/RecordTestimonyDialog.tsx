import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Confetti } from '@/components/ui/confetti';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PrayerRequest, AnswerType } from '@/lib/prayerData';
import { PrayerTopic } from '@/hooks/usePrayerTopics';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  HandHeart,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export interface TestimonyData {
  answerType: AnswerType;
  testimony: string;
  gratitudeNote: string;
  answeredDate: Date;
}

interface RecordTestimonyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: PrayerRequest | null;
  topic?: PrayerTopic | null;
  onComplete: (data: TestimonyData) => void;
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

export function RecordTestimonyDialog({
  open,
  onOpenChange,
  request,
  topic,
  onComplete,
}: RecordTestimonyDialogProps) {
  const [step, setStep] = useState(1);
  const [answerType, setAnswerType] = useState<AnswerType | null>(null);
  const [testimony, setTestimony] = useState('');
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [answeredDate, setAnsweredDate] = useState<Date>(new Date());
  const [showConfetti, setShowConfetti] = useState(false);

  const originalPrayer = request?.title || topic?.summary || '';
  const originalDescription = request?.description || topic?.content || '';

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
    }
  }, [open]);

  const resetForm = () => {
    setStep(1);
    setAnswerType(null);
    setTestimony('');
    setGratitudeNote('');
    setAnsweredDate(new Date());
    setShowConfetti(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleComplete = () => {
    if (!answerType) return;

    onComplete({
      answerType,
      testimony,
      gratitudeNote,
      answeredDate,
    });
    resetForm();
  };

  const isTestimonyValid = testimony.trim().length >= 20;

  if (!request && !topic) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                Record God's Faithfulness
              </h2>
              <p className="text-muted-foreground font-body text-sm">
                Set up a stone of remembrance for this answered prayer
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left border border-border/50">
              <p className="text-xs text-muted-foreground font-body mb-1">
                Original Prayer
              </p>
              <p className="font-display text-foreground">{originalPrayer}</p>
              {originalDescription && (
                <p className="text-sm text-muted-foreground font-body mt-2 line-clamp-2">
                  {originalDescription}
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
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-body font-medium',
                          isSelected ? 'text-foreground' : 'text-foreground/80'
                        )}
                      >
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
                disabled={!answerType}
                className="flex-1 gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Record testimony */}
        {step === 3 && (
          <div className="py-4 space-y-5 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-center">
                Record Your Testimony
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-body text-center mt-1">
                Describe how God moved in this situation
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answeredDate">When did God answer?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !answeredDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {answeredDate
                        ? format(answeredDate, 'MMMM d, yyyy')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={answeredDate}
                      onSelect={(date) => date && setAnsweredDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimony">
                  How did God answer? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="testimony"
                  placeholder="Describe how God moved in this situation..."
                  value={testimony}
                  onChange={(e) => setTestimony(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {testimony.length < 20
                    ? `At least ${20 - testimony.length} more characters needed`
                    : 'Looking good!'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gratitude">What are you grateful for?</Label>
                <Textarea
                  id="gratitude"
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
                onClick={handleComplete}
                disabled={!isTestimonyValid}
                className="flex-1"
              >
                Save Testimony
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
