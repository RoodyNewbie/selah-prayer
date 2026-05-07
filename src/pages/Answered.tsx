import { useState, useMemo } from 'react';
import { useAnsweredRequests, useDeleteRequest, useUpdateRequest } from '@/hooks/usePrayerRequests';
import { BottomNav } from '@/components/navigation/BottomNav';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, differenceInDays } from 'date-fns';
import { answerTypeLabels, PrayerRequest } from '@/lib/prayerData';
import {
  Loader2,
  RefreshCw,
  Milestone,
  Heart,
  Clock,
  LayoutGrid,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Quote,
  MoreVertical,
  Trash2,
  Star,
  Info,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ViewMode = 'cards' | 'timeline';
type SortMode = 'newest' | 'oldest' | 'favorites';
type FilterMode = 'all' | 'favorites';

// Stone card for the journal view
function StoneCard({
  request,
  expanded,
  onToggle,
  onDelete,
  onToggleFavorite,
  onView,
}: {
  request: PrayerRequest;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onView: () => void;
}) {
  const daysToAnswer =
    request.answeredDate && request.createdAt
      ? differenceInDays(new Date(request.answeredDate), new Date(request.createdAt))
      : null;

  return (
    <Card
      className={cn(
        'p-5 space-y-3 transition-all cursor-pointer',
        'hover:shadow-lifted',
        'bg-gradient-to-br from-card to-card/80',
        'border-l-4 border-l-primary/30'
      )}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg text-foreground">{request.title}</h3>
            {request.isFavorite && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          {request.answeredDate && (
            <p className="text-sm text-primary font-body mt-1">
              {format(new Date(request.answeredDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFavorite}
          >
            <Star
              className={cn(
                'w-4 h-4',
                request.isFavorite
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-muted-foreground'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Pencil className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Testimony preview */}
      {request.testimony && (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <Quote className="w-4 h-4 text-primary/50 flex-shrink-0 mt-0.5" />
            <p
              className={cn(
                'font-body text-sm text-foreground/80 italic',
                !expanded && 'line-clamp-3'
              )}
            >
              {request.testimony}
            </p>
          </div>
        </div>
      )}

      {/* Journey info */}
      {daysToAnswer !== null && daysToAnswer > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Clock className="w-3 h-3" />
          <span>
            God answered after {daysToAnswer} day{daysToAnswer !== 1 ? 's' : ''}
          </span>
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

      {/* Expand/Collapse */}
      {(request.testimony || request.gratitudeNote) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
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

// Timeline view for stones — ink rail with days-carried hero number
function TimelineView({
  requests,
  onDelete,
  onToggleFavorite,
  onView,
}: {
  requests: PrayerRequest[];
  onDelete: (request: PrayerRequest) => void;
  onToggleFavorite: (request: PrayerRequest) => void;
  onView: (request: PrayerRequest) => void;
}) {
  return (
    <div className="relative pl-2">
      {/* Ink rail */}
      <div
        aria-hidden="true"
        className="absolute left-[18px] top-3 bottom-3 w-px bg-border"
      />

      <div className="space-y-9">
        {requests.map((request) => {
          const daysToAnswer =
            request.answeredDate && request.createdAt
              ? differenceInDays(new Date(request.answeredDate), new Date(request.createdAt))
              : null;

          return (
            <div key={request.id} className="relative flex gap-4">
              {/* Stone marker on the rail */}
              <div className="relative z-10 flex-shrink-0 mt-1.5">
                <div
                  className={cn(
                    'w-[26px] h-[26px] rounded-full flex items-center justify-center',
                    'border-2 transition-all duration-300 ease-breath motion-reduce:transition-none',
                    request.isFavorite
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  )}
                >
                  <span
                    className={cn(
                      'w-[7px] h-[7px] rounded-full',
                      request.isFavorite ? 'bg-primary-foreground' : 'bg-border'
                    )}
                  />
                </div>
              </div>

              {/* Content */}
              <button
                type="button"
                onClick={() => onView(request)}
                className="flex-1 text-left group focus:outline-none"
              >
                {request.answeredDate && (
                  <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/85 mb-1">
                    {format(new Date(request.answeredDate), 'MMMM yyyy')}
                  </p>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-display text-[1rem] font-semibold text-foreground leading-snug truncate">
                      {request.title}
                    </h3>
                    {request.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleFavorite(request)}
                      aria-label={
                        request.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                      }
                    >
                      <Star
                        className={cn(
                          'w-3.5 h-3.5',
                          request.isFavorite
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground'
                        )}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(request)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(request)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Days carried — hero number */}
                {daysToAnswer !== null && daysToAnswer > 0 && (
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-display text-[2.25rem] font-normal leading-none text-primary">
                      {daysToAnswer}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-body">
                      day{daysToAnswer !== 1 ? 's' : ''} carried
                    </span>
                  </div>
                )}

                {/* Testimony preview */}
                {request.testimony && (
                  <p className="mt-3 font-display italic text-[13px] text-muted-foreground/95 leading-[1.7] line-clamp-3">
                    "{request.testimony}"
                  </p>
                )}
                {!request.testimony && (
                  <p className="mt-3 text-[11px] text-muted-foreground/70 font-body group-hover:text-primary transition-colors">
                    Tap to view details →
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Full testimony detail view
function TestimonyDetailDialog({
  request,
  open,
  onOpenChange,
  onDelete,
  onToggleFavorite,
}: {
  request: PrayerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  if (!request) return null;

  const daysToAnswer =
    request.answeredDate && request.createdAt
      ? differenceInDays(new Date(request.answeredDate), new Date(request.createdAt))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="font-display text-xl text-foreground">
              {request.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={onToggleFavorite}
            >
              <Star
                className={cn(
                  'w-5 h-5',
                  request.isFavorite
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground'
                )}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-sm">
            {request.createdAt && (
              <div>
                <p className="text-xs text-muted-foreground font-body">Requested</p>
                <p className="font-body text-foreground">
                  {format(new Date(request.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            {request.answeredDate && (
              <div>
                <p className="text-xs text-muted-foreground font-body">Answered</p>
                <p className="font-body text-primary">
                  {format(new Date(request.answeredDate), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            {daysToAnswer !== null && daysToAnswer > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-body">Journey</p>
                <p className="font-body text-foreground">
                  {daysToAnswer} day{daysToAnswer !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Original Prayer */}
          {request.description && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-body">Original Prayer</p>
              <p className="font-body text-foreground/90">{request.description}</p>
            </div>
          )}

          {/* How answered */}
          {request.answerType && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-body">How God Answered</p>
              <span className="px-3 py-1 rounded-full text-sm font-body bg-primary/10 text-primary inline-block">
                {answerTypeLabels[request.answerType]}
              </span>
            </div>
          )}

          {/* Testimony */}
          {request.testimony && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-body">Testimony</p>
              <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                <div className="flex gap-3">
                  <Quote className="w-5 h-5 text-primary/40 flex-shrink-0" />
                  <p className="font-body text-foreground/90 italic">
                    {request.testimony}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gratitude */}
          {request.gratitudeNote && (
            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Gratitude
                </span>
              </div>
              <p className="font-body text-foreground/90">{request.gratitudeNote}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Answered() {
  const { data: answeredRequests, isLoading, error, refetch } = useAnsweredRequests();
  const deleteRequestMutation = useDeleteRequest();
  const updateRequestMutation = useUpdateRequest();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<PrayerRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  // Filter and sort requests
  const processedRequests = useMemo(() => {
    let requests = [...(answeredRequests || [])];

    // Filter
    if (filterMode === 'favorites') {
      requests = requests.filter((r) => r.isFavorite);
    }

    // Sort
    requests.sort((a, b) => {
      switch (sortMode) {
        case 'oldest':
          return (
            new Date(a.answeredDate || 0).getTime() -
            new Date(b.answeredDate || 0).getTime()
          );
        case 'favorites': {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return (
            new Date(b.answeredDate || 0).getTime() -
            new Date(a.answeredDate || 0).getTime()
          );
        }
        default: // newest
          return (
            new Date(b.answeredDate || 0).getTime() -
            new Date(a.answeredDate || 0).getTime()
          );
      }
    });

    return requests;
  }, [answeredRequests, sortMode, filterMode]);

  // Stats
  const favoriteCount = answeredRequests?.filter((r) => r.isFavorite).length || 0;

  const handleDeleteAnswered = async () => {
    if (!requestToDelete) return;

    try {
      await deleteRequestMutation.mutateAsync(requestToDelete.id);
      toast.success('Testimony removed');
      setRequestToDelete(null);
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  const handleToggleFavorite = async (request: PrayerRequest) => {
    try {
      await updateRequestMutation.mutateAsync({
        id: request.id,
        updates: { isFavorite: !request.isFavorite },
      });
      // Update selected request if it's the one being toggled
      if (selectedRequest?.id === request.id) {
        setSelectedRequest({ ...request, isFavorite: !request.isFavorite });
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="page-background pb-24">
      <header className="relative z-10 px-5 pt-8 pb-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-medium text-foreground leading-tight">
              Stones of Remembrance
            </h1>
            <p className="text-muted-foreground font-body text-[14px] mt-1">
              Answered prayers, kept close
            </p>
          </div>
          <HeaderActions />
        </div>
      </header>

      <main className="relative z-10 px-5 py-6 space-y-4">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-destructive font-body text-sm">
              {error instanceof Error ? error.message : 'Failed to load testimonies'}
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
          <div className="empty-state">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Milestone className="w-10 h-10 empty-state-icon" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">
              Your story of God's faithfulness starts here
            </h2>
            <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto leading-relaxed">
              When God answers a prayer, record it as a stone of remembrance to
              encourage your faith in the future.
            </p>
          </div>
        ) : !error ? (
          <TimelineView
            requests={processedRequests}
            onDelete={setRequestToDelete}
            onToggleFavorite={handleToggleFavorite}
            onView={setSelectedRequest}
          />
        ) : null}
      </main>

      {/* Testimony Detail Dialog */}
      <TestimonyDetailDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        onDelete={() => {
          setRequestToDelete(selectedRequest);
        }}
        onToggleFavorite={() => selectedRequest && handleToggleFavorite(selectedRequest)}
      />

      <ConfirmDialog
        open={!!requestToDelete}
        onOpenChange={(open) => !open && setRequestToDelete(null)}
        title="Remove this Stone of Remembrance?"
        description={`This will permanently remove "${requestToDelete?.title}" from your testimony journal. This record of God's faithfulness will be lost.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteAnswered}
        loading={deleteRequestMutation.isPending}
      />

      <BottomNav />
    </div>
  );
}
