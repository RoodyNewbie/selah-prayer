import { useState, useCallback, useRef } from 'react';
import { Upload, Music, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUploadAudioTrack, formatFileSize } from '@/hooks/useCustomAudioTracks';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_NAME_LENGTH = 40;

interface AudioUploaderProps {
  disabled?: boolean;
}

export function AudioUploader({ disabled }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trackName, setTrackName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAudioTrack();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload an MP3 or WAV file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    // Default track name to filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setTrackName(nameWithoutExt.slice(0, MAX_NAME_LENGTH));
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackName.trim()) {
      setError('Please enter a name for this track');
      return;
    }

    try {
      await uploadMutation.mutateAsync({ file: selectedFile, name: trackName.trim() });
      resetForm();
    } catch {
      // Error handled in mutation
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTrackName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (disabled) {
    return (
      <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center opacity-50">
        <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Maximum tracks reached. Delete a track to upload a new one.
        </p>
      </div>
    );
  }

  // File selected - show upload form
  if (selectedFile) {
    return (
      <div className="p-4 border border-border rounded-lg space-y-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetForm}
            disabled={uploadMutation.isPending}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Track Name</label>
          <Input
            value={trackName}
            onChange={(e) => setTrackName(e.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="e.g., Peaceful Rain"
            disabled={uploadMutation.isPending}
            maxLength={MAX_NAME_LENGTH}
          />
          <p className="text-xs text-muted-foreground text-right">
            {trackName.length}/{MAX_NAME_LENGTH}
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {uploadMutation.isPending && (
          <Progress value={50} className="w-full" />
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={uploadMutation.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !trackName.trim()}
            className="flex-1"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Drop zone
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-muted-foreground/50 hover:bg-muted/30"
        )}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop an audio file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          MP3 or WAV, max 10MB
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
