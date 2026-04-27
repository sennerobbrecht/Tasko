import { supabase } from '../lib/supabase';

export type Family = {
  id: string;
  name: string;
};

export async function getCurrentFamily(): Promise<{ family: Family | null; error: Error | null }> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { family: null, error: authError ?? new Error('Geen ingelogde gebruiker gevonden.') };
  }

  const userId = authData.user.id;

  const { data: ownedFamilies, error: ownedError } = await supabase
    .from('families')
    .select('id,name')
    .eq('owner_user_id', userId)
    .limit(1);

  if (ownedError) {
    return { family: null, error: ownedError };
  }

  if (ownedFamilies && ownedFamilies.length > 0) {
    const first = ownedFamilies[0] as Family;
    return { family: first, error: null };
  }

  const { data: memberRows, error: memberError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .limit(1);

  if (memberError) {
    return { family: null, error: memberError };
  }

  if (!memberRows || memberRows.length === 0) {
    return { family: null, error: null };
  }

  const firstMembership = memberRows[0] as { family_id: string };
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('id,name')
    .eq('id', firstMembership.family_id)
    .single();

  if (familyError) {
    return { family: null, error: familyError };
  }

  return { family: family as Family, error: null };
}

export async function ensureFamilyForCurrentUser(defaultFamilyName = 'Mijn Gezin') {
  const existing = await getCurrentFamily();
  if (existing.error) {
    return { error: existing.error, family: null as Family | null };
  }

  if (existing.family) {
    return { error: null, family: existing.family };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: authError ?? new Error('Geen ingelogde gebruiker gevonden.'), family: null as Family | null };
  }

  const userId = authData.user.id;
  const { data: insertedFamily, error: insertFamilyError } = await supabase
    .from('families')
    .insert({
      name: defaultFamilyName,
      owner_user_id: userId,
    })
    .select('id,name')
    .single();

  if (insertFamilyError || !insertedFamily) {
    return { error: insertFamilyError ?? new Error('Kon geen gezin aanmaken.'), family: null as Family | null };
  }

  const { error: memberError } = await supabase
    .from('family_members')
    .upsert(
      {
        family_id: insertedFamily.id,
        user_id: userId,
        role: 'owner',
      },
      { onConflict: 'family_id,user_id' },
    );

  if (memberError) {
    return { error: memberError, family: null as Family | null };
  }

  return { error: null, family: insertedFamily as Family };
}
