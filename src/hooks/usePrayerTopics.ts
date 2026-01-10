import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrayerTopic {
  id: string;
  userId: string;
  sessionId: string | null;
  phase: 'needs' | 'forgiveness' | 'protection';
  content: string;
  summary: string;
  createdAt: string;
  lastPrayedAt: string;
  status: 'active' | 'answered' | 'released';
  answeredNote: string | null;
  answeredDate: string | null;
}

interface DbPrayerTopic {
  id: string;
  user_id: string;
  session_id: string | null;
  phase: string;
  content: string;
  summary: string;
  created_at: string;
  last_prayed_at: string;
  status: string;
  answered_note: string | null;
  answered_date: string | null;
}

function mapDbToTopic(row: DbPrayerTopic): PrayerTopic {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    phase: row.phase as PrayerTopic['phase'],
    content: row.content,
    summary: row.summary,
    createdAt: row.created_at,
    lastPrayedAt: row.last_prayed_at,
    status: row.status as PrayerTopic['status'],
    answeredNote: row.answered_note,
    answeredDate: row.answered_date,
  };
}

/**
 * Fetch recent active topics for a specific phase (last 14 days, limit 3)
 */
export function useRecentTopics(phase: string) {
  return useQuery({
    queryKey: ['prayer-topics', phase],
    queryFn: async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data, error } = await supabase
        .from('prayer_topics')
        .select('*')
        .eq('phase', phase)
        .eq('status', 'active')
        .gte('last_prayed_at', fourteenDaysAgo.toISOString())
        .order('last_prayed_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching prayer topics:', error);
        return [];
      }

      return (data as DbPrayerTopic[]).map(mapDbToTopic);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new prayer topic from session content
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      phase,
      content,
    }: {
      sessionId: string;
      phase: 'needs' | 'forgiveness' | 'protection';
      content: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Not authenticated');
      }

      // Create summary from first 100 characters
      const summary = content.length > 100 
        ? content.substring(0, 100).trim() + '...'
        : content.trim();

      const { data, error } = await supabase
        .from('prayer_topics')
        .insert({
          user_id: userData.user.id,
          session_id: sessionId,
          phase,
          content,
          summary,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToTopic(data as DbPrayerTopic);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prayer-topics', variables.phase] });
    },
  });
}

/**
 * Update last_prayed_at timestamp for a topic (when continuing to pray)
 */
export function useUpdateTopicLastPrayed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('prayer_topics')
        .update({ last_prayed_at: new Date().toISOString() })
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-topics'] });
    },
  });
}

/**
 * Mark a topic as answered (for Practical Needs)
 */
export function useMarkTopicAnswered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      answeredNote,
    }: {
      topicId: string;
      answeredNote?: string;
    }) => {
      const { error } = await supabase
        .from('prayer_topics')
        .update({
          status: 'answered',
          answered_date: new Date().toISOString(),
          answered_note: answeredNote || null,
        })
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-topics'] });
    },
  });
}

/**
 * Mark a topic as released (for Forgiveness)
 */
export function useMarkTopicReleased() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('prayer_topics')
        .update({
          status: 'released',
          answered_date: new Date().toISOString(),
        })
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-topics'] });
    },
  });
}

/**
 * Extract and save topics from a completed prayer session
 */
export function useSaveSessionTopics() {
  const createTopic = useCreateTopic();

  return useMutation({
    mutationFn: async ({
      sessionId,
      phases,
    }: {
      sessionId: string;
      phases: Record<string, string>;
    }) => {
      const topicPhases: Array<'needs' | 'forgiveness' | 'protection'> = [
        'needs',
        'forgiveness', 
        'protection',
      ];

      const promises = topicPhases
        .filter(phase => phases[phase] && phases[phase].trim().length > 0)
        .map(phase => 
          createTopic.mutateAsync({
            sessionId,
            phase,
            content: phases[phase],
          })
        );

      return Promise.allSettled(promises);
    },
  });
}
