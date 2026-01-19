import { useState } from 'react';
import { Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  useCustomAudioTracks,
  useDeleteAudioTrack,
  formatFileSize,
  CustomAudioTrack,
} from '@/hooks/useCustomAudioTracks';

const MAX_TRACKS = 3;

interface CustomTrackListProps {
  onLimitChange?: (atLimit: boolean) => void;
}

export function CustomTrackList({ onLimitChange }: CustomTrackListProps) {
  const { data: tracks = [], isLoading } = useCustomAudioTracks();
  const deleteMutation = useDeleteAudioTrack();
  const [deleteConfirm, setDeleteConfirm] = useState<CustomAudioTrack | null>(null);

  const atLimit = tracks.length >= MAX_TRACKS;

  // Notify parent of limit status
  if (onLimitChange) {
    onLimitChange(atLimit);
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteMutation.mutateAsync({
        id: deleteConfirm.id,
        filePath: deleteConfirm.filePath,
      });
    } catch {
      // Error handled in mutation
    }
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">No custom tracks uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(track.fileSize)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteConfirm(track)}
            disabled={deleteMutation.isPending}
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <div className="pt-2 text-center">
        <p className={cn(
          "text-xs",
          atLimit ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
        )}>
          {tracks.length} of {MAX_TRACKS} custom tracks
          {atLimit && " - Maximum reached"}
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Track</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteConfirm?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
