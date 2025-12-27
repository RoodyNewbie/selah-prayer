import { useEffect, useState } from 'react';
import { PrayerSession, prayerPhases } from '@/lib/prayerData';
import { storage } from '@/lib/storage';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function History() {
  const [sessions, setSessions] = useState<PrayerSession[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(storage.getSessions());
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPhaseLabel = (phaseId: string) => {
    return prayerPhases.find((p) => p.id === phaseId)?.name || phaseId;
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
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-body">
              Your prayer sessions will appear here
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const hasContent = Object.values(session.phases).some((v) => v.trim());
            const isExpanded = expandedId === session.id;

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
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {Object.entries(session.phases)
                      .filter(([_, content]) => content.trim())
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
