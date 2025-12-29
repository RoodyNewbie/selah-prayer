import { PrayerRequest, requestTags } from '@/lib/prayerData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Check, MoreVertical, Repeat, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarkAnsweredDialog, AnsweredData } from './MarkAnsweredDialog';
import { useState } from 'react';

interface RequestCardProps {
  request: PrayerRequest;
  onMarkAnswered: (id: string, data: AnsweredData) => void;
  onDelete: (id: string) => void;
}

export function RequestCard({ request, onMarkAnswered, onDelete }: RequestCardProps) {
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tagInfo = requestTags.find((t) => t.id === request.tag);

  const handleAnswerComplete = (data: AnsweredData) => {
    onMarkAnswered(request.id, data);
    setShowAnswerDialog(false);
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
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <MarkAnsweredDialog
        open={showAnswerDialog}
        onOpenChange={setShowAnswerDialog}
        request={request}
        onComplete={handleAnswerComplete}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Prayer Request?"
        description={`This will permanently delete "${request.title}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete(request.id);
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
