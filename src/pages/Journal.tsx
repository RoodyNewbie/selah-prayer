import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/navigation/BottomNav';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { AddJournalEntryDialog } from '@/components/journal/AddJournalEntryDialog';
import { MarkFulfilledDialog } from '@/components/journal/MarkFulfilledDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useJournalEntries,
  useDeleteJournalEntry,
} from '@/hooks/useJournalEntries';
import { JournalEntry, JournalEntryType, journalTypeLabels } from '@/lib/prayerData';
import {
  BookOpen,
  Plus,
  Moon,
  MessageCircle,
  BookMarked,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'dream' | 'word' | 'fulfilled';

export default function Journal() {
  const { data: entries = [], isLoading } = useJournalEntries();
  const deleteEntry = useDeleteJournalEntry();

  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [entryToFulfill, setEntryToFulfill] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'all') return true;
    if (filter === 'fulfilled') return entry.status === 'fulfilled';
    return entry.entryType === filter && entry.status === 'active';
  });

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

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'dream', label: 'Dreams' },
    { id: 'word', label: 'Words' },
    { id: 'fulfilled', label: 'Fulfilled' },
  ];

  const getTypeIcon = (type: JournalEntryType) => {
    return type === 'dream' ? Moon : MessageCircle;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">Journal</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <GlobalAudioButton />
      </header>

      {/* Filter Pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-lg text-foreground">
                {filter === 'all' ? 'Your journal is empty' : `No ${filter === 'fulfilled' ? 'fulfilled entries' : filter + 's'} yet`}
              </p>
              <p className="text-sm text-muted-foreground">
                Record dreams and words from God here
              </p>
            </div>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const TypeIcon = getTypeIcon(entry.entryType);
            const isFulfilled = entry.status === 'fulfilled';

            return (
              <Card
                key={entry.id}
                className={cn(
                  'p-4 transition-all',
                  isFulfilled && 'opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title and badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display text-base text-foreground truncate">
                        {entry.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          entry.entryType === 'dream'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {journalTypeLabels[entry.entryType]}
                      </Badge>
                      {isFulfilled && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Fulfilled
                        </Badge>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                      {isFulfilled && entry.fulfilledDate && (
                        <span> • Fulfilled {format(new Date(entry.fulfilledDate), 'MMM d, yyyy')}</span>
                      )}
                    </p>

                    {/* Description */}
                    {entry.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {entry.description}
                      </p>
                    )}

                    {/* Scripture reference */}
                    {entry.scriptureReference && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <BookMarked className="w-3 h-3" />
                        {entry.scriptureReference}
                      </div>
                    )}

                    {/* Fulfilled note */}
                    {isFulfilled && entry.fulfilledNote && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground italic">
                          "{entry.fulfilledNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="w-4 h-4" />
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
              </Card>
            );
          })
        )}
      </main>

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg z-40"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Dialogs */}
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
