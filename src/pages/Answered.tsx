import { useEffect, useState } from 'react';
import { PrayerRequest } from '@/lib/prayerData';
import { db, DatabaseError } from '@/lib/db';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export default function Answered() {
  const [answeredRequests, setAnsweredRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnsweredRequests();
  }, []);

  const loadAnsweredRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRequests = await db.getRequests();
      const answered = allRequests.filter((r) => r.isAnswered);
      // Sort by answered date, most recent first
      answered.sort((a, b) => {
        const dateA = a.answeredDate ? new Date(a.answeredDate).getTime() : 0;
        const dateB = b.answeredDate ? new Date(b.answeredDate).getTime() : 0;
        return dateB - dateA;
      });
      setAnsweredRequests(answered);
    } catch (err) {
      const message = err instanceof DatabaseError ? err.message : 'Failed to load answered prayers';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <h1 className="font-display text-2xl text-foreground">Answered Prayers</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          A record of God's faithfulness
        </p>
      </header>

      <main className="px-4 py-4 space-y-3">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-destructive font-body text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadAnsweredRequests} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {loading ? (
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
          </div>
        ) : !error && (
          answeredRequests.map((request) => (
            <Card key={request.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base text-foreground">
                    {request.title}
                  </h3>
                  {request.answeredDate && (
                    <p className="text-xs text-primary font-body">
                      Answered {format(new Date(request.answeredDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
              {request.answeredNote && (
                <p className="text-muted-foreground font-body text-sm border-l-2 border-primary/30 pl-3">
                  {request.answeredNote}
                </p>
              )}
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
