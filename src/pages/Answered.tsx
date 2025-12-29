import { useState } from 'react';
import { useAnsweredRequests } from '@/hooks/usePrayerRequests';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { answerTypeLabels, PrayerRequest } from '@/lib/prayerData';
import { 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  Heart, 
  Clock,
  LayoutGrid,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'cards' | 'timeline';
type SortMode = 'newest' | 'oldest' | 'longest';

function TestimonyCard({ request, expanded, onToggle }: { 
  request: PrayerRequest; 
  expanded: boolean;
  onToggle: () => void;
}) {
  const daysToAnswer = request.answeredDate && request.createdAt
    ? differenceInDays(new Date(request.answeredDate), new Date(request.createdAt))
    : null;

  return (
    <Card className="p-5 space-y-3 hover:shadow-lifted transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-foreground">
            {request.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {request.answeredDate && (
              <span className="text-xs text-primary font-body flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Answered {format(new Date(request.answeredDate), 'MMM d, yyyy')}
              </span>
            )}
            {daysToAnswer !== null && daysToAnswer > 0 && (
              <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                <Clock className="w-3 h-3" />
                after {daysToAnswer} day{daysToAnswer !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {request.answerType && (
          <span className="px-2.5 py-1 rounded-full text-xs font-body bg-primary/10 text-primary whitespace-nowrap">
            {answerTypeLabels[request.answerType]}
          </span>
        )}
      </div>

      {/* Testimony */}
      {request.testimony && (
        <div className="relative">
          <div className="flex gap-2">
            <Quote className="w-4 h-4 text-primary/50 flex-shrink-0 mt-0.5" />
            <p className={cn(
              "font-body text-sm text-foreground/80 italic",
              !expanded && "line-clamp-3"
            )}>
              {request.testimony}
            </p>
          </div>
        </div>
      )}

      {/* Gratitude Note */}
      {request.gratitudeNote && expanded && (
        <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Gratitude
            </span>
          </div>
          <p className="font-body text-sm text-foreground/80">
            {request.gratitudeNote}
          </p>
        </div>
      )}

      {/* Answered Note (legacy) */}
      {request.answeredNote && !request.testimony && (
        <p className="text-muted-foreground font-body text-sm border-l-2 border-primary/30 pl-3">
          {request.answeredNote}
        </p>
      )}

      {/* Expand/Collapse */}
      {(request.testimony || request.gratitudeNote) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Read more
            </>
          )}
        </Button>
      )}
    </Card>
  );
}

function TimelineView({ requests }: { requests: PrayerRequest[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
      
      <div className="space-y-6">
        {requests.map((request, index) => {
          const daysToAnswer = request.answeredDate && request.createdAt
            ? differenceInDays(new Date(request.answeredDate), new Date(request.createdAt))
            : null;

          return (
            <div key={request.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-background" />
              </div>

              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base text-foreground">
                    {request.title}
                  </h3>
                  {request.answerType && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-body bg-primary/10 text-primary whitespace-nowrap">
                      {answerTypeLabels[request.answerType]}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  <span>
                    Created: {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </span>
                  {request.answeredDate && (
                    <span className="text-primary">
                      Answered: {format(new Date(request.answeredDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                {daysToAnswer !== null && daysToAnswer > 0 && (
                  <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    God answered after {daysToAnswer} day{daysToAnswer !== 1 ? 's' : ''}
                  </p>
                )}

                {request.testimony && (
                  <p className="font-body text-sm text-foreground/80 italic line-clamp-2">
                    "{request.testimony}"
                  </p>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Answered() {
  const { data: answeredRequests, isLoading, error, refetch } = useAnsweredRequests();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort requests
  const sortedRequests = [...(answeredRequests || [])].sort((a, b) => {
    switch (sortMode) {
      case 'oldest':
        return new Date(a.answeredDate || 0).getTime() - new Date(b.answeredDate || 0).getTime();
      case 'longest': {
        const daysA = a.answeredDate && a.createdAt
          ? differenceInDays(new Date(a.answeredDate), new Date(a.createdAt))
          : 0;
        const daysB = b.answeredDate && b.createdAt
          ? differenceInDays(new Date(b.answeredDate), new Date(b.createdAt))
          : 0;
        return daysB - daysA;
      }
      default: // newest
        return new Date(b.answeredDate || 0).getTime() - new Date(a.answeredDate || 0).getTime();
    }
  });

  // Stats
  const thisMonthCount = answeredRequests?.filter(r => {
    if (!r.answeredDate) return false;
    const answeredDate = new Date(r.answeredDate);
    const now = new Date();
    return answeredDate.getMonth() === now.getMonth() && 
           answeredDate.getFullYear() === now.getFullYear();
  }).length || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Answered Prayers
            </h1>
            <p className="text-muted-foreground font-body text-sm mt-1">
              {answeredRequests?.length || 0} testimonies of God's faithfulness
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                viewMode === 'cards' && "bg-background shadow-sm"
              )}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                viewMode === 'timeline' && "bg-background shadow-sm"
              )}
              onClick={() => setViewMode('timeline')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        {answeredRequests && answeredRequests.length > 0 && (
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground font-body">
                {thisMonthCount} this month
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Sort Options */}
      {answeredRequests && answeredRequests.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          {(['newest', 'oldest', 'longest'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-all",
                sortMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {mode === 'newest' && 'Newest First'}
              {mode === 'oldest' && 'Oldest First'}
              {mode === 'longest' && 'Longest Wait'}
            </button>
          ))}
        </div>
      )}

      <main className="px-4 py-4 space-y-3">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-destructive font-body text-sm">
              {error instanceof Error ? error.message : 'Failed to load answered prayers'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && answeredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-body">
              Answered prayers will appear here
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Mark a prayer as answered to start your testimony wall
            </p>
          </div>
        ) : !error && viewMode === 'cards' ? (
          sortedRequests.map((request) => (
            <TestimonyCard 
              key={request.id} 
              request={request}
              expanded={expandedId === request.id}
              onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
            />
          ))
        ) : !error && viewMode === 'timeline' ? (
          <TimelineView requests={sortedRequests} />
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
