import { PrayerRequest, requestTags } from '@/lib/prayerData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical, Repeat, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface RequestCardProps {
  request: PrayerRequest;
  onMarkAnswered: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}

export function RequestCard({ request, onMarkAnswered, onDelete }: RequestCardProps) {
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [answerNote, setAnswerNote] = useState('');

  const tagInfo = requestTags.find((t) => t.id === request.tag);

  const handleMarkAnswered = () => {
    onMarkAnswered(request.id, answerNote);
    setShowAnswerDialog(false);
    setAnswerNote('');
  };

  return (
    <>
      <Card className="p-4 hover:shadow-lifted transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-base text-foreground truncate">
                {request.title}
              </h3>
              {request.isRecurring && (
                <Repeat className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            {request.description && (
              <p className="text-sm text-muted-foreground font-body line-clamp-2">
                {request.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-body",
                  tagInfo?.color,
                  "text-foreground/80"
                )}
              >
                {tagInfo?.label}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAnswerDialog(true)}>
                <Check className="w-4 h-4 mr-2" />
                Mark as Answered
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(request.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Prayer Answered! 🙏</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-muted-foreground font-body text-sm">
              Add a note about how this prayer was answered (optional).
            </p>
            <Textarea
              placeholder="How did God answer this prayer?"
              value={answerNote}
              onChange={(e) => setAnswerNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleMarkAnswered} className="w-full">
              Save to Answered Prayers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
