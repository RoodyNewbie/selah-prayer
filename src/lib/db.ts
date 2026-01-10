import { supabase } from '@/integrations/supabase/client';
import { PrayerRequest, PrayerSession, RequestTag, AnswerType, JournalEntry, JournalEntryType, JournalStatus } from './prayerData';
import type { Tables } from '@/integrations/supabase/types';

type PrayerRequestRow = Tables<'prayer_requests'>;
type PrayerSessionRow = Tables<'prayer_sessions'>;
type JournalEntryRow = Tables<'journal_entries'>;

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
  isFavorite: row.is_favorite || false,
  createdAt: row.created_at,
});

// Transform database row to PrayerSession
const toSession = (row: PrayerSessionRow): PrayerSession => ({
  id: row.id,
  timestamp: row.created_at,
  phases: row.phases as Record<string, string>,
  generatedPrayer: row.generated_prayer || undefined,
});

// Transform database row to JournalEntry
const toJournalEntry = (row: JournalEntryRow): JournalEntry => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  entryType: row.entry_type as JournalEntryType,
  status: row.status as JournalStatus,
  scriptureReference: row.scripture_reference || undefined,
  fulfilledDate: row.fulfilled_date || undefined,
  fulfilledNote: row.fulfilled_note || undefined,
  createdAt: row.created_at,
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
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

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

  // Journal Entries
  async getJournalEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to load your journal entries. Please try again.', error);
    }

    return (data || []).map(toJournalEntry);
  },

  async saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new DatabaseError('Please sign in to save journal entries.');
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userData.user.id,
        title: entry.title,
        description: entry.description || null,
        entry_type: entry.entryType,
        status: entry.status,
        scripture_reference: entry.scriptureReference || null,
        fulfilled_date: entry.fulfilledDate || null,
        fulfilled_note: entry.fulfilledNote || null,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to save your journal entry. Please try again.', error);
    }

    return toJournalEntry(data);
  },

  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.entryType !== undefined) updateData.entry_type = updates.entryType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.scriptureReference !== undefined) updateData.scripture_reference = updates.scriptureReference;
    if (updates.fulfilledDate !== undefined) updateData.fulfilled_date = updates.fulfilledDate;
    if (updates.fulfilledNote !== undefined) updateData.fulfilled_note = updates.fulfilledNote;

    const { error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new DatabaseError('Failed to update your journal entry. Please try again.', error);
    }
  },

  async deleteJournalEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError('Failed to delete the journal entry. Please try again.', error);
    }
  },
};
