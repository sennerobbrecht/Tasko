import { supabase } from '../lib/supabase';

export type MoodKey = 'happy' | 'content' | 'neutral' | 'stressed' | 'sad';

export type MoodEntry = {
  child_id: string;
  mood: MoodKey;
  created_at: string;
};

export async function saveMoodForToday(childId: string, mood: MoodKey) {
  const { data, error } = await supabase.rpc('create_mood_entry_for_child', {
    p_child_id: childId,
    p_mood: mood,
  });

  const row = Array.isArray(data) ? data[0] : data;
  return { data: (row as MoodEntry | null) ?? null, error };
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
