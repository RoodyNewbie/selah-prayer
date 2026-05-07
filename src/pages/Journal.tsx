import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/navigation/BottomNav';
import { AddJournalEntryDialog } from '@/components/journal/AddJournalEntryDialog';
import { MarkFulfilledDialog } from '@/components/journal/MarkFulfilledDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useJournalEntries,
  useDeleteJournalEntry,
} from '@/hooks/useJournalEntries';
import { JournalEntry } from '@/lib/prayerData';
import { Plus, MoreVertical, Trash2, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Journal() {
  const { data: entries = [], isLoading } = useJournalEntries();
  const deleteEntry = useDeleteJournalEntry();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [entryToFulfill, setEntryToFulfill] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteEntry.mutateAsync(entryToDelete.id);
      toast.success('Journal entry deleted');
      setEntryToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  return (
    <div className="page-background pb-24">
      <header className="relative z-10 px-5 pt-8 pb-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-medium text-foreground leading-tight">
              Journal
            </h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Dreams and words to keep
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
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

      <main className="relative z-10 px-5 divide-y divide-border/40">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <p className="font-display text-lg text-foreground">Your journal is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Record dreams and words from God here
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isWord = entry.entryType === 'word';
            const isFulfilled = entry.status === 'fulfilled';
            return (
              <article key={entry.id} className={cn('py-5 group relative', isFulfilled && 'opacity-70')}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-primary">
                    {isWord ? 'Word' : 'Dream'}
                  </p>
                  <p className="text-[12px] text-muted-foreground/80">
                    {format(new Date(entry.createdAt), 'MMM d')}
                  </p>
                </div>
                {isWord ? (
                  <p className="font-display italic text-[20px] leading-snug text-foreground">
                    "{entry.title}"
                  </p>
                ) : (
                  <p className="font-body text-[15.5px] leading-relaxed text-foreground">
                    {entry.description || entry.title}
                  </p>
                )}

                {/* Hover actions */}
                <div className="absolute top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isFulfilled && (
                        <DropdownMenuItem onClick={() => setEntryToFulfill(entry)}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Mark Fulfilled
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setEntryToDelete(entry)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            );
          })
        )}
      </main>

      <AddJournalEntryDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <MarkFulfilledDialog
        open={!!entryToFulfill}
        onOpenChange={(open) => !open && setEntryToFulfill(null)}
        entry={entryToFulfill}
      />
      <ConfirmDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
        title="Delete Journal Entry?"
        description={`This will permanently delete "${entryToDelete?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteEntry.isPending}
      />

      <BottomNav />
    </div>
  );
}
