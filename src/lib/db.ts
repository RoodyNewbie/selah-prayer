import { supabase } from '@/integrations/supabase/client';
import { PrayerRequest, PrayerSession, RequestTag } from './prayerData';

// Transform database row to PrayerRequest
const toRequest = (row: any): PrayerRequest => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  tag: row.tag as RequestTag,
  isRecurring: row.is_recurring,
  isAnswered: row.is_answered,
  answeredNote: row.answered_note || undefined,
  answeredDate: row.answered_date || undefined,
  createdAt: row.created_at,
});

// Transform database row to PrayerSession
const toSession = (row: any): PrayerSession => ({
  id: row.id,
  timestamp: row.created_at,
  phases: row.phases || {},
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
      console.error('Error fetching requests:', error);
      return [];
    }

    return (data || []).map(toRequest);
  },

  async saveRequest(request: Omit<PrayerRequest, 'id' | 'createdAt'>): Promise<PrayerRequest | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

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
      console.error('Error saving request:', error);
      return null;
    }

    return toRequest(data);
  },

  async updateRequest(id: string, updates: Partial<PrayerRequest>): Promise<boolean> {
    const { error } = await supabase
      .from('prayer_requests')
      .update({
        title: updates.title,
        description: updates.description,
        tag: updates.tag,
        is_recurring: updates.isRecurring,
        is_answered: updates.isAnswered,
        answered_note: updates.answeredNote,
        answered_date: updates.answeredDate,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating request:', error);
      return false;
    }

    return true;
  },

  async deleteRequest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting request:', error);
      return false;
    }

    return true;
  },

  // Prayer Sessions
  async getSessions(): Promise<PrayerSession[]> {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return (data || []).map(toSession);
  },

  async saveSession(phases: Record<string, string>, generatedPrayer?: string): Promise<PrayerSession | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('prayer_sessions')
      .insert({
        user_id: userData.user.id,
        phases,
        generated_prayer: generatedPrayer || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return null;
    }

    return toSession(data);
  },

  async updateSessionPrayer(sessionId: string, generatedPrayer: string): Promise<boolean> {
    const { error } = await supabase
      .from('prayer_sessions')
      .update({ generated_prayer: generatedPrayer })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session prayer:', error);
      return false;
    }

    return true;
  },

  async getLastPrayed(): Promise<string | null> {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.created_at;
  },
};
