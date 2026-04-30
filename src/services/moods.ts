import { supabase } from '../lib/supabase';
import { enqueueOfflineMutation } from './offlineQueue';

export type MoodKey = 'happy' | 'content' | 'neutral' | 'stressed' | 'sad';

export type MoodEntry = {
  child_id: string;
  mood: MoodKey;
  created_at: string;
};

export async function saveMoodForToday(childId: string, mood: MoodKey) {
  try {
    const { data, error } = await supabase.rpc('create_mood_entry_for_child', {
      p_child_id: childId,
      p_mood: mood,
    });

    if (error) {
      const message = String(error.message ?? '').toLowerCase();
      if (message.includes('network') || message.includes('netword') || message.includes('fetch') || message.includes('offline') || message.includes('timeout')) {
        await enqueueOfflineMutation({
          type: 'save_mood',
          payload: { childId, mood },
        });
        return { data: null, error: null, queued: true };
      }
    }

    const row = Array.isArray(data) ? data[0] : data;
    return { data: (row as MoodEntry | null) ?? null, error, queued: false };
  } catch (error) {
    const message = String((error as { message?: string } | null)?.message ?? error ?? '').toLowerCase();
    if (message.includes('network') || message.includes('netword') || message.includes('fetch') || message.includes('offline') || message.includes('timeout')) {
      await enqueueOfflineMutation({
        type: 'save_mood',
        payload: { childId, mood },
      });
      return { data: null, error: null, queued: true };
    }
    return { data: null, error: error as Error, queued: false };
  }
}

export async function getTodayMoodForChild(childId: string) {
  const { data, error } = await supabase.rpc('get_today_mood_for_child', {
    p_child_id: childId,
  });

  const row = Array.isArray(data) ? data[0] : data;
  return { data: (row as MoodEntry | null) ?? null, error };
}

export async function getWeekMoodsForFamily(fromIso: string) {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('child_id,mood,created_at')
    .gte('created_at', fromIso)
    .order('created_at', { ascending: false });

  return { data: (data as MoodEntry[] | null) ?? [], error };
}

export async function getWeekMoodsForChild(childId: string, fromIso: string) {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('child_id,mood,created_at')
    .eq('child_id', childId)
    .gte('created_at', fromIso)
    .order('created_at', { ascending: false });

  return { data: (data as MoodEntry[] | null) ?? [], error };
}
