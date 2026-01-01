import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PrayerPhase } from '@/lib/prayerData';
import { useAuth } from '@/hooks/useAuth';

export interface PrayerFormat {
  id: string;
  name: string;
  description: string | null;
  phases: PrayerPhase[];
  isDefault: boolean;
  isSystem: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RawPrayerFormat {
  id: string;
  name: string;
  description: string | null;
  phases: unknown;
  is_default: boolean;
  is_system: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

const transformFormat = (row: RawPrayerFormat): PrayerFormat => ({
  id: row.id,
  name: row.name,
  description: row.description,
  phases: row.phases as PrayerPhase[],
  isDefault: row.is_default,
  isSystem: row.is_system,
  userId: row.user_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function usePrayerFormats() {
  return useQuery({
    queryKey: ['prayer-formats'],
    queryFn: async () => {
      // Only fetch user-created formats (is_system = false)
      // Built-in formats are now defined in code via builtInFormats
      const { data, error } = await supabase
        .from('prayer_formats')
        .select('*')
        .eq('is_system', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformFormat);
    },
  });
}

export function useDefaultFormat() {
  const { data: formats } = usePrayerFormats();
  
  // Return the user's default format, or the first system format, or the first available
  if (!formats || formats.length === 0) return null;
  
  const userDefault = formats.find(f => f.isDefault && !f.isSystem);
  if (userDefault) return userDefault;
  
  const systemFormat = formats.find(f => f.isSystem);
  if (systemFormat) return systemFormat;
  
  return formats[0];
}

export function useCreateFormat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (format: {
      name: string;
      description?: string;
      phases: PrayerPhase[];
      isDefault?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // If setting as default, unset other defaults first
      if (format.isDefault) {
        await supabase
          .from('prayer_formats')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('prayer_formats')
        .insert([{
          user_id: user.id,
          name: format.name,
          description: format.description || null,
          phases: JSON.parse(JSON.stringify(format.phases)),
          is_default: format.isDefault || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return transformFormat(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-formats'] });
    },
  });
}

export function useUpdateFormat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        description: string;
        phases: PrayerPhase[];
        isDefault: boolean;
      }>;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // If setting as default, unset other defaults first
      if (updates.isDefault) {
        await supabase
          .from('prayer_formats')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const updatePayload: Record<string, unknown> = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.phases !== undefined) updatePayload.phases = JSON.parse(JSON.stringify(updates.phases));
      if (updates.isDefault !== undefined) updatePayload.is_default = updates.isDefault;

      const { error } = await supabase
        .from('prayer_formats')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-formats'] });
    },
  });
}

export function useDeleteFormat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prayer_formats')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-formats'] });
    },
  });
}

export function useSetDefaultFormat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formatId: string) => {
      if (!user) throw new Error('Must be logged in');

      // Unset all user defaults
      await supabase
        .from('prayer_formats')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);

      // Set new default
      const { error } = await supabase
        .from('prayer_formats')
        .update({ is_default: true })
        .eq('id', formatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-formats'] });
    },
  });
}
