import { useState, useMemo } from 'react';
import { useAnsweredRequests, useDeleteRequest, useUpdateRequest } from '@/hooks/usePrayerRequests';
import { BottomNav } from '@/components/navigation/BottomNav';
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

// Timeline view for stones
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
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      <div className="space-y-6">
        {requests.map((request) => {
          const daysToAnswer =
            request.answeredDate && request.createdAt
              ? differenceInDays(
                  new Date(request.answeredDate),
                  new Date(request.createdAt)
                )
              : null;

          return (
            <div
              key={request.id}
              className="relative pl-10 cursor-pointer"
              onClick={() => onView(request)}
            >
              {/* Timeline stone */}
              <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-background" />
              </div>

              <Card className="p-4 space-y-2 hover:shadow-lifted transition-all border-l-4 border-l-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base text-foreground">
                      {request.title}
                    </h3>
                    {request.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleFavorite(request)}
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

                {request.answeredDate && (
                  <p className="text-sm text-primary font-body">
                    {format(new Date(request.answeredDate), 'MMMM d, yyyy')}
                  </p>
                )}

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
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl text-foreground">
                Stones of Remembrance
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-muted transition-colors">
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  <p className="font-body text-sm">
                    A record of God's faithfulness
                    <span className="block text-muted-foreground text-xs mt-1">
                      Joshua 4:7 – "These stones are to be a memorial"
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground font-body text-sm mt-1">
              {answeredRequests?.length || 0} testimon
              {answeredRequests?.length === 1 ? 'y' : 'ies'} recorded
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', viewMode === 'cards' && 'bg-background shadow-sm')}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'timeline' && 'bg-background shadow-sm'
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
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-muted-foreground font-body">
                {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Sort & Filter Options */}
      {answeredRequests && answeredRequests.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-border/50">
          {(['newest', 'oldest', 'favorites'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-all',
                sortMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {mode === 'newest' && 'Most Recent'}
              {mode === 'oldest' && 'Oldest First'}
              {mode === 'favorites' && 'Favorites First'}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          <button
            onClick={() => setFilterMode(filterMode === 'all' ? 'favorites' : 'all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-all flex items-center gap-1.5',
              filterMode === 'favorites'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Star
              className={cn(
                'w-3 h-3',
                filterMode === 'favorites' && 'fill-current'
              )}
            />
            {filterMode === 'favorites' ? 'Favorites' : 'All'}
          </button>
        </div>
      )}

      <main className="px-4 py-4 space-y-4">
        {/* Error State */}
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
          // Empty state
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Milestone className="w-10 h-10 text-primary/60" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">
              Your story of God's faithfulness starts here
            </h2>
            <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
              When God answers a prayer, record it as a stone of remembrance to
              encourage your faith in the future.
            </p>
          </div>
        ) : !error && processedRequests.length === 0 ? (
          // No results after filtering
          <div className="text-center py-12">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-body">No favorite testimonies yet</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setFilterMode('all')}
            >
              View all testimonies
            </Button>
          </div>
        ) : !error && viewMode === 'cards' ? (
          processedRequests.map((request) => (
            <StoneCard
              key={request.id}
              request={request}
              expanded={expandedId === request.id}
              onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
              onDelete={() => setRequestToDelete(request)}
              onToggleFavorite={() => handleToggleFavorite(request)}
              onView={() => setSelectedRequest(request)}
            />
          ))
        ) : !error && viewMode === 'timeline' ? (
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
