import { PrayerRequest, RequestTag } from '@/lib/prayerData';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Check, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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

const TAG_STYLES: Record<RequestTag, string> = {
  health: 'bg-emerald-900/40 text-emerald-300',
  work: 'bg-blue-900/40 text-blue-300',
  family: 'bg-amber-900/40 text-amber-300',
  finances: 'bg-yellow-900/40 text-yellow-300',
  spiritual: 'bg-purple-900/40 text-purple-300',
  others: 'bg-muted text-muted-foreground',
};

const TAG_LABELS: Record<RequestTag, string> = {
  health: 'Health',
  work: 'Work',
  family: 'Family',
  finances: 'Finances',
  spiritual: 'Spiritual',
  others: 'Others',
};

export function RequestCard({ request, onMarkAnswered, onDelete }: RequestCardProps) {
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAnswerComplete = (data: AnsweredData) => {
    onMarkAnswered(request.id, data);
    setShowAnswerDialog(false);
  };

  const date = request.createdAt ? new Date(request.createdAt) : null;

  return (
    <>
      <div className="flex items-start gap-4 py-4">
        {/* Date column */}
        {date && (
          <div className="w-9 flex-shrink-0 pt-0.5 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80 leading-tight">
              {format(date, 'MMM')}
            </p>
            <p className="text-[14px] text-muted-foreground leading-tight">
              {format(date, 'd')}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-medium text-[15px] text-foreground leading-snug">
            {request.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-md text-[11px] font-medium',
                TAG_STYLES[request.tag] ?? TAG_STYLES.others
              )}
            >
              {TAG_LABELS[request.tag] ?? 'Others'}
            </span>
            {request.isRecurring && (
              <span className="text-[11px] text-muted-foreground/80">· Recurring</span>
            )}
          </div>
        </div>

        {/* Check button */}
        <button
          type="button"
          onClick={() => setShowAnswerDialog(true)}
          aria-label="Mark as answered"
          className="flex-shrink-0 w-8 h-8 rounded-full border border-border/70 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        {/* Hidden actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-1 text-muted-foreground/60 hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
