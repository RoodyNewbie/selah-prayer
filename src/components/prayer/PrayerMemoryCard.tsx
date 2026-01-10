import { useState } from 'react';
import { History, CheckCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  PrayerTopic, 
  useRecentTopics, 
  useMarkTopicAnswered, 
  useMarkTopicReleased,
  useUpdateTopicLastPrayed,
} from '@/hooks/usePrayerTopics';
import { stripContinuingPrefix } from '@/lib/topicUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PrayerMemoryCardProps {
  phaseId: string;
  onContinuePraying: (prefillText: string, topicId: string) => void;
  onDismiss: () => void;
  className?: string;
}

// Phases that support memory
const MEMORY_PHASES = ['needs', 'forgiveness', 'protection'];

export function PrayerMemoryCard({ 
  phaseId, 
  onContinuePraying, 
  onDismiss,
  className,
}: PrayerMemoryCardProps) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [isVisible, setIsVisible] = useState(true);
  const [showAnsweredDialog, setShowAnsweredDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<PrayerTopic | null>(null);
  const [testimonyNote, setTestimonyNote] = useState('');
  
  // Always call hooks, even if we won't use the data
  const isMemoryPhase = MEMORY_PHASES.includes(phaseId);
  const { data: topics = [], isLoading } = useRecentTopics(phaseId);
  const markAnswered = useMarkTopicAnswered();
  const markReleased = useMarkTopicReleased();
  const updateLastPrayed = useUpdateTopicLastPrayed();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Now we can have early returns - ALL hooks are already called above
  // Don't render for non-memory phases
  if (!isMemoryPhase) return null;
  
  // Don't render while loading or if no topics
  if (isLoading || topics.length === 0) return null;

  // Don't render if dismissed
  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleContinuePraying = (topic: PrayerTopic) => {
    // Use clean summary (strip any legacy prefixes) for display
    const cleanSummary = stripContinuingPrefix(topic.summary);
    const prefillText = `Continuing to lift up: ${cleanSummary}\n\n`;
    updateLastPrayed.mutate(topic.id);
    onContinuePraying(prefillText, topic.id);
    setIsVisible(false);
  };

  const handleMarkAnswered = (topic: PrayerTopic) => {
    setSelectedTopic(topic);
    setTestimonyNote('');
    setShowAnsweredDialog(true);
  };

  const handleConfirmAnswered = () => {
    if (!selectedTopic) return;
    
    markAnswered.mutate(
      { topicId: selectedTopic.id, answeredNote: testimonyNote || undefined },
      {
        onSuccess: () => {
          toast.success('Prayer marked as answered!');
          setShowAnsweredDialog(false);
          setSelectedTopic(null);
        },
        onError: () => {
          toast.error('Failed to update. Please try again.');
        },
      }
    );
  };

  const handleMarkReleased = (topic: PrayerTopic) => {
    markReleased.mutate(topic.id, {
      onSuccess: () => {
        toast.success('Released to God\'s grace');
      },
      onError: () => {
        toast.error('Failed to update. Please try again.');
      },
    });
  };

  const getPhaseLabel = () => {
    switch (phaseId) {
      case 'needs': return 'practical needs';
      case 'forgiveness': return 'forgiveness';
      case 'protection': return 'protection';
      default: return 'prayers';
    }
  };

  return (
    <>
      <div 
        className={cn(
          "bg-muted/30 rounded-xl p-4 border border-border/30 space-y-3",
          "transition-all",
          prefersReducedMotion ? "duration-0" : "duration-300 animate-slide-up",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <History className="w-4 h-4" />
            <span className="text-xs font-body">Recent {getPhaseLabel()}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {topics.map((topic) => {
            // Strip any legacy prefixes for display
            const displaySummary = stripContinuingPrefix(topic.summary);
            return (
              <div 
                key={topic.id} 
                className="bg-background/50 rounded-lg p-3 space-y-2"
              >
                <p className="text-sm text-foreground font-body line-clamp-2">
                  {displaySummary}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(topic.lastPrayedAt), { addSuffix: true })}
                </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleContinuePraying(topic)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Continue praying
                </Button>
                
                {phaseId === 'needs' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => handleMarkAnswered(topic)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </Button>
                )}
                
                {phaseId === 'forgiveness' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => handleMarkReleased(topic)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Released
                  </Button>
                )}
                
                {phaseId === 'protection' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => handleMarkReleased(topic)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolved
                  </Button>
                )}
              </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline font-body"
        >
          New prayer instead
        </button>
      </div>

      {/* Mark Answered Dialog with optional testimony */}
      <Dialog open={showAnsweredDialog} onOpenChange={setShowAnsweredDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Prayer Answered!</DialogTitle>
            <DialogDescription className="font-body">
              Would you like to record how God answered this prayer? (Optional)
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Share your testimony..."
              value={testimonyNote}
              onChange={(e) => setTestimonyNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTestimonyNote('');
                handleConfirmAnswered();
              }}
              disabled={markAnswered.isPending}
            >
              Skip testimony
            </Button>
            <Button 
              onClick={handleConfirmAnswered}
              disabled={markAnswered.isPending}
            >
              {markAnswered.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
