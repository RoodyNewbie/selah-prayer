import { useState } from 'react';
import { prayerPhases } from '@/lib/prayerData';
import { usePrayerSessions, useUpdateSessionPrayer } from '@/hooks/usePrayerSessions';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, History as HistoryIcon, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PrayerSession } from '@/lib/prayerData';

export default function History() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: sessions = [], isLoading, error, refetch } = usePrayerSessions();
  const updateSessionPrayerMutation = useUpdateSessionPrayer();

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <h1 className="font-display text-2xl text-foreground">Prayer History</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Your prayer journey over time
        </p>
      </header>

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-body">
              Your prayer sessions will appear here
            </p>
          </div>
        ) : !error && (
          sessions.map((session) => {
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
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
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
                          {session.generatedPrayer}
                        </p>
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
                              {content}
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
      </main>

      <BottomNav />
    </div>
  );
}
