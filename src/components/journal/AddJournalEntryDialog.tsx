import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Moon, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateJournalEntry } from '@/hooks/useJournalEntries';
import { JournalEntryType } from '@/lib/prayerData';
import { cn } from '@/lib/utils';

interface AddJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJournalEntryDialog({ open, onOpenChange }: AddJournalEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState<JournalEntryType>('dream');
  const [scriptureReference, setScriptureReference] = useState('');

  const createEntry = useCreateJournalEntry();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        entryType,
        status: 'active',
        scriptureReference: scriptureReference.trim() || undefined,
      });
      toast.success('Journal entry saved!');
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEntryType('dream');
    setScriptureReference('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New Journal Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryType('dream')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all',
                entryType === 'dream'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50'
              )}
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dream</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('word')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all',
                entryType === 'word'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-card text-muted-foreground hover:border-amber-500/50'
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Word</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={entryType === 'dream' ? 'Dream about...' : 'Word regarding...'}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you saw or heard..."
              rows={4}
            />
          </div>

          {/* Scripture Reference */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Scripture Reference <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={scriptureReference}
              onChange={(e) => setScriptureReference(e.target.value)}
              placeholder="e.g., Isaiah 43:19"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
