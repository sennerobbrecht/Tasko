import { getCurrentFamily } from './families';
import { supabase } from '../lib/supabase';

export type RoutineSummary = {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

export async function getCurrentFamilyRoutines(): Promise<{ data: RoutineSummary[]; error: Error | null }> {
  const { family, error: familyError } = await getCurrentFamily();
  if (familyError) {
    return { data: [], error: familyError };
  }

  if (!family) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('routines')
    .select('id,title,is_active,created_at')
    .eq('family_id', family.id)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data ?? []) as RoutineSummary[],
    error: null,
  };
}
