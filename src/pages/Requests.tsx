import { useEffect, useState } from 'react';
import { PrayerRequest, RequestTag, requestTags } from '@/lib/prayerData';
import { db, DatabaseError } from '@/lib/db';
import { BottomNav } from '@/components/navigation/BottomNav';
import { RequestCard } from '@/components/prayer/RequestCard';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Requests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [selectedTag, setSelectedTag] = useState<RequestTag | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRequests = await db.getRequests();
      setRequests(allRequests.filter((r) => !r.isAnswered));
    } catch (err) {
      const message = err instanceof DatabaseError ? err.message : 'Failed to load requests';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests =
    selectedTag === 'all'
      ? requests
      : requests.filter((r) => r.tag === selectedTag);

  const handleMarkAnswered = async (id: string, note: string) => {
    try {
      await db.updateRequest(id, {
        isAnswered: true,
        answeredNote: note,
        answeredDate: new Date().toISOString(),
      });
      loadRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update request',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteRequest(id);
      loadRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 pt-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground">Prayer Requests</h1>
          <Button variant="warm" size="icon" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Filter Tags */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTag('all')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-all",
              selectedTag === 'all'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {requestTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-all",
                selectedTag === tag.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-destructive font-body text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={loadRequests} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Requests List */}
      <main className="px-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">
              No prayer requests yet. Add one to get started.
            </p>
          </div>
        ) : !error && (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onMarkAnswered={handleMarkAnswered}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>

      <AddRequestDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onRequestAdded={loadRequests}
      />
      <BottomNav />
    </div>
  );
}
