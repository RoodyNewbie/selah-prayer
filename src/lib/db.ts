import { supabase } from '@/integrations/supabase/client';
import { PrayerRequest, PrayerSession, RequestTag, AnswerType } from './prayerData';
import type { Tables } from '@/integrations/supabase/types';

type PrayerRequestRow = Tables<'prayer_requests'>;
type PrayerSessionRow = Tables<'prayer_sessions'>;

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Transform database row to PrayerRequest
const toRequest = (row: PrayerRequestRow): PrayerRequest => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  tag: row.tag as RequestTag,
  isRecurring: row.is_recurring,
  isAnswered: row.is_answered,
  answeredNote: row.answered_note || undefined,
  answeredDate: row.answered_date || undefined,
  testimony: row.testimony || undefined,
  answerType: row.answer_type as AnswerType | undefined,
  gratitudeNote: row.gratitude_note || undefined,
  createdAt: row.created_at,
});

// Transform database row to PrayerSession
const toSession = (row: PrayerSessionRow): PrayerSession => ({
  id: row.id,
  timestamp: row.created_at,
  phases: row.phases as Record<string, string>,
  generatedPrayer: row.generated_prayer || undefined,
});

export const db = {
  // Prayer Requests
  async getRequests(): Promise<PrayerRequest[]> {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to load your prayer requests. Please check your connection and try again.', error);
    }

    return (data || []).map(toRequest);
  },

  async saveRequest(request: Omit<PrayerRequest, 'id' | 'createdAt'>): Promise<PrayerRequest> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new DatabaseError('Please sign in to save prayer requests.');
    }

    const { data, error } = await supabase
      .from('prayer_requests')
      .insert({
        user_id: userData.user.id,
        title: request.title,
        description: request.description || null,
        tag: request.tag,
        is_recurring: request.isRecurring,
        is_answered: request.isAnswered,
        answered_note: request.answeredNote || null,
        answered_date: request.answeredDate || null,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to save your prayer request. Please try again.', error);
    }

    return toRequest(data);
  },

  async updateRequest(id: string, updates: Partial<PrayerRequest>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tag !== undefined) updateData.tag = updates.tag;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.isAnswered !== undefined) updateData.is_answered = updates.isAnswered;
    if (updates.answeredNote !== undefined) updateData.answered_note = updates.answeredNote;
    if (updates.answeredDate !== undefined) updateData.answered_date = updates.answeredDate;
    if (updates.testimony !== undefined) updateData.testimony = updates.testimony;
    if (updates.answerType !== undefined) updateData.answer_type = updates.answerType;
    if (updates.gratitudeNote !== undefined) updateData.gratitude_note = updates.gratitudeNote;

    const { error } = await supabase
      .from('prayer_requests')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new DatabaseError('Failed to update your prayer request. Please try again.', error);
    }
  },

  async deleteRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError('Failed to delete the prayer request. Please try again.', error);
    }
  },

  // Prayer Sessions
  async getSessions(): Promise<PrayerSession[]> {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to load your prayer history. Please try again.', error);
    }

    return (data || []).map(toSession);
  },

  async saveSession(phases: Record<string, string>, generatedPrayer?: string, formatId?: string): Promise<PrayerSession> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new DatabaseError('Please sign in to save your prayer session.');
    }

    const { data, error } = await supabase
      .from('prayer_sessions')
      .insert({
        user_id: userData.user.id,
        phases,
        generated_prayer: generatedPrayer || null,
        format_id: formatId || null,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to save your prayer session. Please try again.', error);
    }

    return toSession(data);
  },

  async updateSessionPrayer(sessionId: string, generatedPrayer: string): Promise<void> {
    const { error } = await supabase
      .from('prayer_sessions')
      .update({ generated_prayer: generatedPrayer })
      .eq('id', sessionId);

    if (error) {
      throw new DatabaseError('Failed to save the generated prayer. Please try again.', error);
    }
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('prayer_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError('Failed to delete the prayer session. Please try again.', error);
    }
  },

  async getLastPrayed(): Promise<string | null> {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Silently fail for last prayed - not critical
      console.error('Error fetching last prayed:', error);
      return null;
    }

    return data?.created_at ?? null;
  },
};
