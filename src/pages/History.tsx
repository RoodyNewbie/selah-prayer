import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { prayerPhases, PrayerSession } from '@/lib/prayerData';
import { usePrayerSessions, useUpdateSessionPrayer, useDeleteSession, useHasOlderSessions } from '@/hooks/usePrayerSessions';
import { useDonor } from '@/contexts/DonorContext';
import { useMeditationTimer } from '@/contexts/MeditationTimerContext';
import { BottomNav } from '@/components/navigation/BottomNav';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterPill } from '@/components/ui/filter-pill';
import { DateRangeDialog } from '@/components/history/DateRangeDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, subDays, subMonths } from 'date-fns';
import { ChevronDown, ChevronUp, History as HistoryIcon, Loader2, RefreshCw, Copy, Check, Search, X, MoreVertical, Trash2, Clock, Heart, Timer, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type FilterType = 'all' | 'week' | 'month' | 'generated' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
      : part
  );
}

function formatDateRange(range: DateRange): string {
  return `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d')}`;
}

export default function History() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<PrayerSession | null>(null);

  // Donor status determines history limit
  const { isDonor, isLoading: isDonorLoading } = useDonor();
  const { defaultDuration } = useMeditationTimer();
  
  // Only fetch sessions once we know donor status
  const { data: sessions = [], isLoading: isSessionsLoading, error, refetch } = usePrayerSessions({
    isDonor,
    enabled: !isDonorLoading,
  });
  
  // Check if free user has older sessions (for showing upgrade prompt)
  const { data: hasOlderSessions = false } = useHasOlderSessions({
    enabled: !isDonorLoading && !isDonor,
  });

  const isLoading = isDonorLoading || isSessionsLoading;
  
  const updateSessionPrayerMutation = useUpdateSessionPrayer();
  const deleteSessionMutation = useDeleteSession();

  const filteredSessions = useMemo(() => {
    let result = sessions;
    
    // Apply date filter
    const now = new Date();
    switch (filter) {
      case 'week': {
        const weekAgo = subDays(now, 7);
        result = result.filter(s => new Date(s.timestamp) >= weekAgo);
        break;
      }
      case 'month': {
        const monthAgo = subMonths(now, 1);
        result = result.filter(s => new Date(s.timestamp) >= monthAgo);
        break;
      }
      case 'generated':
        result = result.filter(s => s.generatedPrayer);
        break;
      case 'custom':
        if (customDateRange) {
          result = result.filter(s => {
            const date = new Date(s.timestamp);
            return date >= customDateRange.start && date <= customDateRange.end;
          });
        }
        break;
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        // Search in generated prayer
        if (s.generatedPrayer?.toLowerCase().includes(query)) return true;
        // Search in personal prayer
        if (s.personalPrayer?.toLowerCase().includes(query)) return true;
        // Search in phase contents
        return Object.values(s.phases).some(content => 
          content?.toLowerCase().includes(query)
        );
      });
    }
    
    return result;
  }, [sessions, filter, customDateRange, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPhaseLabel = (phaseId: string) => {
    return prayerPhases.find((p) => p.id === phaseId)?.name || phaseId;
  };

  const regeneratePrayer = async (session: PrayerSession) => {
    setRegeneratingId(session.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prayer', {
        body: { phases: session.phases },
      });

      if (error) throw error;

      const prayer = data.prayer;
      
      await updateSessionPrayerMutation.mutateAsync({
        sessionId: session.id,
        generatedPrayer: prayer,
      });
      
      toast.success('Prayer regenerated');
    } catch (err) {
      console.error('Error regenerating prayer:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate prayer');
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyPrayer = async (prayer: string, sessionId: string) => {
    try {
      await navigator.clipboard.writeText(prayer);
      setCopiedId(sessionId);
      toast.success('Prayer copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy prayer');
    }
  };

  const handleFilterClick = (newFilter: FilterType) => {
    if (newFilter === 'custom') {
      setDatePickerOpen(true);
    } else {
      setFilter(newFilter);
      setCustomDateRange(null);
    }
  };

  const handleDateRangeApply = (range: DateRange) => {
    setCustomDateRange(range);
    setFilter('custom');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
    setCustomDateRange(null);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      await deleteSessionMutation.mutateAsync(sessionToDelete.id);
      toast.success('Prayer session deleted');
      setSessionToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete session');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between p-4 pt-6 border-b border-border">
        <div>
          <h1 className="font-display text-2xl text-foreground">Prayer History</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Your prayer journey over time
          </p>
        </div>
        <GlobalAudioButton />
      </header>

      {/* Search and Filter Bar */}
      <div className="px-4 py-3 space-y-3 border-b border-border">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your prayers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <FilterPill active={filter === 'all'} onClick={() => handleFilterClick('all')}>
            All
          </FilterPill>
          <FilterPill active={filter === 'week'} onClick={() => handleFilterClick('week')}>
            This Week
          </FilterPill>
          <FilterPill active={filter === 'month'} onClick={() => handleFilterClick('month')}>
            This Month
          </FilterPill>
          <FilterPill active={filter === 'generated'} onClick={() => handleFilterClick('generated')}>
            With Prayer
          </FilterPill>
          <FilterPill active={filter === 'custom'} onClick={() => handleFilterClick('custom')}>
            {customDateRange ? formatDateRange(customDateRange) : 'Custom'}
          </FilterPill>
        </div>
      </div>

      <main className="px-4 py-4 space-y-3">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-destructive font-body text-sm">
              {error instanceof Error ? error.message : 'Failed to load prayer history'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && filteredSessions.length !== sessions.length && sessions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && sessions.length === 0 ? (
          /* Empty state - differentiate between free user with old sessions vs truly empty */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            {!isDonor && hasOlderSessions ? (
              <>
                <p className="text-foreground font-body font-medium mb-2">
                  No prayer sessions in the last 30 days
                </p>
                <p className="text-muted-foreground font-body text-sm mb-4">
                  Unlock unlimited history to view your older sessions
                </p>
                <Button variant="warm" size="sm" asChild>
                  <Link to="/donate">
                    <Heart className="w-4 h-4 mr-2" />
                    Unlock History
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground font-body mb-4">
                  Your prayer sessions will appear here
                </p>
                <Button variant="warm" size="sm" asChild>
                  <Link to="/pray">Start Praying</Link>
                </Button>
              </>
            )}
          </div>
        ) : !error && filteredSessions.length === 0 && sessions.length > 0 ? (
          /* No Results from Search/Filter */
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-body">No prayers match your search</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </div>
        ) : !error && (
          filteredSessions.map((session) => {
            const hasContent = Object.values(session.phases).some((v) => v && v.trim());
            const isExpanded = expandedId === session.id;
            const isRegenerating = regeneratingId === session.id;

            return (
              <Card
                key={session.id}
                className={cn(
                  "overflow-hidden transition-all",
                  isExpanded && "shadow-lifted"
                )}
              >
                <div className="w-full p-4 flex items-center justify-between">
                  <button
                    className="flex-1 flex items-center justify-between text-left"
                    onClick={() => toggleExpanded(session.id)}
                  >
                    <div>
                      <p className="font-display text-base text-foreground">
                        {format(new Date(session.timestamp), 'EEEE, MMMM d')}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {format(new Date(session.timestamp), 'h:mm a')}
                      </p>
                    </div>
                    {hasContent && (
                      isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isDonor && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/pray/meditate', {
                            state: {
                              duration: defaultDuration,
                              sessionId: session.id,
                              generatedPrayer: session.generatedPrayer || undefined,
                            }
                          })}
                        >
                          <Timer className="w-4 h-4 mr-2" />
                          Meditate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => setSessionToDelete(session)} 
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isExpanded && hasContent && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                    {/* Generated Prayer Section */}
                    {session.generatedPrayer && (
                      <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary font-body">Generated Prayer</p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPrayer(session.generatedPrayer!, session.id)}
                              className="h-8 px-2"
                            >
                              {copiedId === session.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => regeneratePrayer(session)}
                              disabled={isRegenerating}
                              className="h-8 px-2"
                            >
                              <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground font-body whitespace-pre-wrap leading-relaxed">
                          {highlightMatch(session.generatedPrayer, searchQuery)}
                        </p>
                      </div>
                    )}

                    {/* Personal Prayer Section */}
                    {session.personalPrayer && session.personalPrayer.trim() !== '' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <PenLine className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground font-body uppercase tracking-wide">
                            Your Own Words
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/20 border border-border">
                          <p className="text-sm text-foreground font-body whitespace-pre-wrap leading-relaxed italic">
                            {highlightMatch(session.personalPrayer, searchQuery)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* No generated prayer - offer to generate */}
                    {!session.generatedPrayer && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground font-body">No generated prayer</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => regeneratePrayer(session)}
                            disabled={isRegenerating}
                            className="h-8"
                          >
                            {isRegenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate Prayer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Prayer Phases */}
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Prayer Notes</p>
                      {Object.entries(session.phases)
                        .filter(([_, content]) => content && content.trim())
                        .map(([phaseId, content]) => (
                          <div key={phaseId}>
                            <p className="text-xs text-primary font-body font-medium mb-1">
                              {getPhaseLabel(phaseId)}
                            </p>
                            <p className="text-sm text-foreground font-body whitespace-pre-wrap">
                              {highlightMatch(content!, searchQuery)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}

        {/* 30-day limit message for free users */}
        {!isDonor && !isLoading && !error && sessions.length > 0 && (
          <Card className="mt-6 p-4 bg-muted/30 border-dashed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-body">
                  Viewing your last 30 days of prayer sessions
                </p>
                {hasOlderSessions && (
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    You have older sessions that are currently hidden
                  </p>
                )}
                <Link 
                  to="/donate" 
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Unlock unlimited history
                </Link>
              </div>
            </div>
          </Card>
        )}
      </main>

      <ConfirmDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        title="Delete Prayer Session?"
        description={`This will permanently delete your prayer session from ${sessionToDelete ? format(new Date(sessionToDelete.timestamp), 'MMMM d, yyyy') : ''}. This includes all your prayer notes and the generated prayer. This action cannot be undone.`}
        confirmLabel="Delete Session"
        onConfirm={handleDeleteSession}
        loading={deleteSessionMutation.isPending}
      />

      <DateRangeDialog
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        onApply={handleDateRangeApply}
        currentRange={customDateRange}
      />

      <BottomNav />
    </div>
  );
}
