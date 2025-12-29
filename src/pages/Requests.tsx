import { useEffect, useState } from 'react';
import { PrayerRequest, RequestTag, requestTags } from '@/lib/prayerData';
import { db } from '@/lib/db';
import { BottomNav } from '@/components/navigation/BottomNav';
import { RequestCard } from '@/components/prayer/RequestCard';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Requests() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [selectedTag, setSelectedTag] = useState<RequestTag | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const allRequests = await db.getRequests();
    setRequests(allRequests.filter((r) => !r.isAnswered));
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests =
    selectedTag === 'all'
      ? requests
      : requests.filter((r) => r.tag === selectedTag);

  const handleMarkAnswered = async (id: string, note: string) => {
    await db.updateRequest(id, {
      isAnswered: true,
      answeredNote: note,
      answeredDate: new Date().toISOString(),
    });
    loadRequests();
  };

  const handleDelete = async (id: string) => {
    await db.deleteRequest(id);
    loadRequests();
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

      {/* Requests List */}
      <main className="px-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">
              No prayer requests yet. Add one to get started.
            </p>
          </div>
        ) : (
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
