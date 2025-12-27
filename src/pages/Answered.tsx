import { useEffect, useState } from 'react';
import { PrayerRequest } from '@/lib/prayerData';
import { storage } from '@/lib/storage';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

export default function Answered() {
  const [answeredRequests, setAnsweredRequests] = useState<PrayerRequest[]>([]);

  useEffect(() => {
    const allRequests = storage.getRequests().filter((r) => r.isAnswered);
    // Sort by answered date, most recent first
    allRequests.sort((a, b) => {
      const dateA = a.answeredDate ? new Date(a.answeredDate).getTime() : 0;
      const dateB = b.answeredDate ? new Date(b.answeredDate).getTime() : 0;
      return dateB - dateA;
    });
    setAnsweredRequests(allRequests);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <h1 className="font-display text-2xl text-foreground">Answered Prayers</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          A record of God's faithfulness
        </p>
      </header>

      <main className="px-4 py-4 space-y-3">
        {answeredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-body">
              Answered prayers will appear here
            </p>
          </div>
        ) : (
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
