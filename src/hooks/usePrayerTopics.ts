import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { stripContinuingPrefix, isSimilarTopic } from '@/lib/topicUtils';

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
 * Fetch recent active topics for a specific phase (last 14 days, limit 2)
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
        .limit(2); // Reduced from 3 to 2 for less visual clutter

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

      // Strip prefix before saving
      const cleanContent = stripContinuingPrefix(content);
      
      // Create summary from first 100 characters of clean content
      const summary = cleanContent.length > 100 
        ? cleanContent.substring(0, 100).trim() + '...'
        : cleanContent.trim();

      const { data, error } = await supabase
        .from('prayer_topics')
        .insert({
          user_id: userData.user.id,
          session_id: sessionId,
          phase,
          content: cleanContent,
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
 * Implements deduplication: updates existing similar topics instead of creating duplicates
 */
export function useSaveSessionTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      phases,
    }: {
      sessionId: string;
      phases: Record<string, string>;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Not authenticated');
      }

      const userId = userData.user.id;
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const topicPhases: Array<'needs' | 'forgiveness' | 'protection'> = [
        'needs',
        'forgiveness', 
        'protection',
      ];

      const promises = topicPhases
        .filter(phase => phases[phase] && phases[phase].trim().length > 0)
        .map(async phase => {
          const rawContent = phases[phase];
          
          // Strip prefix before saving - never store the prefix
          const cleanContent = stripContinuingPrefix(rawContent);
          
          // Skip if content is empty after stripping
          if (!cleanContent.trim()) return;
          
          // Create summary from first 100 characters of clean content
          const summary = cleanContent.length > 100 
            ? cleanContent.substring(0, 100).trim() + '...'
            : cleanContent.trim();

          // Check for existing similar topics in this phase from last 14 days
          const { data: existingTopics, error: fetchError } = await supabase
            .from('prayer_topics')
            .select('id, summary')
            .eq('user_id', userId)
            .eq('phase', phase)
            .eq('status', 'active')
            .gte('last_prayed_at', fourteenDaysAgo.toISOString());

          if (fetchError) {
            console.error('Error fetching existing topics for dedup:', fetchError);
            // Continue with insert if fetch fails
          }

          // Find a similar existing topic
          const similarTopic = existingTopics?.find(existing => 
            isSimilarTopic(cleanContent, existing.summary)
          );

          if (similarTopic) {
            // Update existing topic's last_prayed_at instead of creating duplicate
            const { error: updateError } = await supabase
              .from('prayer_topics')
              .update({ 
                last_prayed_at: new Date().toISOString(),
                session_id: sessionId, // Link to most recent session
              })
              .eq('id', similarTopic.id);

            if (updateError) throw updateError;
          } else {
            // No similar topic found - create new one
            const { error: insertError } = await supabase
              .from('prayer_topics')
              .insert({
                user_id: userId,
                session_id: sessionId,
                phase,
                content: cleanContent,
                summary,
              });

            if (insertError) throw insertError;
          }
        });

      return Promise.allSettled(promises);
    },
    onSuccess: () => {
      // Invalidate all prayer topics queries
      queryClient.invalidateQueries({ queryKey: ['prayer-topics'] });
    },
  });
}
