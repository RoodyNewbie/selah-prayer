import { RequestTag, requestTags } from '@/lib/prayerData';
import { useActiveRequests, useMarkAnswered, useDeleteRequest } from '@/hooks/usePrayerRequests';
import { BottomNav } from '@/components/navigation/BottomNav';
import { RequestCard } from '@/components/prayer/RequestCard';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { AnsweredData } from '@/components/prayer/MarkAnsweredDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Requests() {
  const [selectedTag, setSelectedTag] = useState<RequestTag | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: requests, isLoading, error, refetch } = useActiveRequests();
  const markAnsweredMutation = useMarkAnswered();
  const deleteMutation = useDeleteRequest();

  const filteredRequests =
    selectedTag === 'all'
      ? requests
      : requests.filter((r) => r.tag === selectedTag);

  const handleMarkAnswered = async (id: string, data: AnsweredData) => {
    try {
      await markAnsweredMutation.mutateAsync({
        id,
        testimony: data.testimony,
        answerType: data.answerType,
        gratitudeNote: data.gratitudeNote,
      });
      toast.success('Praise God! Prayer marked as answered.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update request');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Prayer request deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

  return (
    <div className="page-background pb-24">
      <header className="relative z-10 px-5 pt-8 pb-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] font-medium text-foreground">Requests</h1>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              onClick={() => setShowAddDialog(true)}
              className="rounded-full w-11 h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_18px_hsl(var(--primary)/0.32)]"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <HeaderActions />
          </div>
        </div>
      </header>

      <div className="relative z-10 px-5 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTag('all')}
            className={cn(
              'filter-pill press-scale',
              selectedTag === 'all' ? 'filter-pill-active' : 'filter-pill-inactive'
            )}
          >
            All
          </button>
          {requestTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={cn(
                'filter-pill press-scale',
                selectedTag === tag.id ? 'filter-pill-active' : 'filter-pill-inactive'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="relative z-10 mx-5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-destructive font-body text-sm">
            {error instanceof Error ? error.message : 'Failed to load requests'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      <main className="relative z-10 px-5 divide-y divide-border/40">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && filteredRequests.length === 0 ? (
          <div className="empty-state">
            <Inbox className="w-12 h-12 mx-auto empty-state-icon" />
            <p className="text-muted-foreground font-body leading-relaxed">
              No prayer requests yet.<br />Add one to get started.
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

      <AddRequestDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <BottomNav />
    </div>
  );
}
