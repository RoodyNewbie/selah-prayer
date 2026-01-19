import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CustomAudioTrack {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  createdAt: string;
}

const MAX_TRACKS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];

export function useCustomAudioTracks(enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['custom-audio-tracks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('custom_audio_tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((track): CustomAudioTrack => ({
        id: track.id,
        name: track.name,
        fileName: track.file_name,
        filePath: track.file_path,
        fileSize: track.file_size,
        fileType: track.file_type,
        duration: track.duration ?? undefined,
        createdAt: track.created_at,
      }));
    },
    enabled: enabled && !!user?.id,
  });
}

export function useUploadAudioTrack() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Please upload an MP3 or WAV file');
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      // Check track limit
      const { count, error: countError } = await supabase
        .from('custom_audio_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;
      if ((count ?? 0) >= MAX_TRACKS) {
        throw new Error("You've reached the limit of 3 custom tracks. Delete one to upload a new file.");
      }

      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueId = crypto.randomUUID().slice(0, 8);
      const filePath = `${user.id}/${uniqueId}-${sanitizedName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('custom-audio')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error('Unable to save file. Please try again.');

      // Create database record
      const { error: insertError } = await supabase
        .from('custom_audio_tracks')
        .insert({
          user_id: user.id,
          name: name.trim(),
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        });

      if (insertError) {
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from('custom-audio').remove([filePath]);
        throw new Error('Unable to save track. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-audio-tracks'] });
      toast.success('Track uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
    },
  });
}

export function useDeleteAudioTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('custom-audio')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with DB delete even if storage delete fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('custom_audio_tracks')
        .delete()
        .eq('id', id);

      if (dbError) throw new Error('Unable to delete track. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-audio-tracks'] });
      toast.success('Track deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Delete failed. Please try again.');
    },
  });
}

export async function getSignedAudioUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('custom-audio')
    .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour expiry

  if (error) {
    console.error('Failed to get signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
