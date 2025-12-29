import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequestTag, requestTags } from '@/lib/prayerData';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAdded?: () => void;
}

export function AddRequestDialog({ open, onOpenChange, onRequestAdded }: AddRequestDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState<RequestTag>('others');
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      await db.saveRequest({
        title: title.trim(),
        description: description.trim(),
        tag,
        isRecurring,
        isAnswered: false,
      });

      setTitle('');
      setDescription('');
      setTag('others');
      setIsRecurring(false);
      onOpenChange(false);
      onRequestAdded?.();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save prayer request',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Prayer Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Input
              placeholder="Name or title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Brief description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          {/* Tags */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block font-body">Category</label>
            <div className="flex flex-wrap gap-2">
              {requestTags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTag(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-body transition-all",
                    tag === t.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                isRecurring ? "bg-primary" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-all",
                  isRecurring ? "left-7" : "left-1"
                )}
              />
            </button>
            <span className="text-sm text-foreground font-body">
              Recurring request (appears in each prayer session)
            </span>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!title.trim() || saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Add Request'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
