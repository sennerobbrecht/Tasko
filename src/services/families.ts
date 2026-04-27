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

export async function getFamilyChildren(familyId?: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('Geen ingelogde gebruiker gevonden.') };
  }

  let targetFamilyId = familyId;
  if (!targetFamilyId) {
    const current = await getCurrentFamily();
    if (current.error) return { data: null, error: current.error };
    if (!current.family) return { data: [], error: null };
    targetFamilyId = current.family.id;
  }

  const { data, error } = await supabase.from('child_profiles').select('id,display_name,avatar_seed,birth_year').eq('family_id', targetFamilyId);
  return { data, error };
}

export async function createTeamInviteForCurrentFamily({ role = 'parent', expiresInDays = 7 } : { role?: string; expiresInDays?: number } = {}) {
  const { family, error: famErr } = await getCurrentFamily();
  if (famErr) return { data: null, error: famErr };
  if (!family) return { data: null, error: new Error('Geen gezin gevonden voor huidige gebruiker') };

  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) code += codeChars[Math.floor(Math.random() * codeChars.length)];

  const expires_at = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('team_invites')
    .insert({ family_id: family.id, code, role, expires_at, created_by_user_id: (await supabase.auth.getUser()).data?.user?.id })
    .select('code')
    .single();

  return { data, error };
}

export async function acceptTeamInvite(code: string) {
  // find invite via RPC (bypasses RLS for lookup)
  const { data: inviteRows, error: rpcErr } = await supabase.rpc('get_team_invite_by_code', { p_code: code });
  if (rpcErr) return { error: rpcErr, success: false };
  if (!inviteRows || (Array.isArray(inviteRows) && inviteRows.length === 0)) return { error: new Error('Ongeldige uitnodigingscode'), success: false };

  const invite = Array.isArray(inviteRows) ? inviteRows[0] as any : (inviteRows as any);
  if (invite.used_at) return { error: new Error('Uitnodiging is al gebruikt'), success: false };
  if (new Date(invite.expires_at) < new Date()) return { error: new Error('Uitnodiging is verlopen'), success: false };

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) return { error: authErr ?? new Error('Geen ingelogde gebruiker'), success: false };

  const userId = authData.user.id;

  // upsert family_members
  const { error: upsertErr } = await supabase.from('family_members').upsert({ family_id: invite.family_id, user_id: userId, role: invite.role }, { onConflict: 'family_id,user_id' });
  if (upsertErr) return { error: upsertErr, success: false };

  // mark invite used
  const { error: markErr } = await supabase.from('team_invites').update({ used_at: new Date().toISOString(), used_by_user_id: userId }).eq('id', invite.id);
  if (markErr) return { error: markErr, success: false };

  return { error: null, success: true };
}

export async function createChildFromInvite(code: string, displayName: string, birthYear?: number) {
  const { data: inviteRows, error: rpcErr } = await supabase.rpc('get_team_invite_by_code', { p_code: code });
  if (rpcErr) return { error: rpcErr, data: null };
  if (!inviteRows || (Array.isArray(inviteRows) && inviteRows.length === 0)) return { error: new Error('Ongeldige code'), data: null };
  const invite = Array.isArray(inviteRows) ? inviteRows[0] as any : (inviteRows as any);
  if (new Date(invite.expires_at) < new Date()) return { error: new Error('Code is verlopen'), data: null };

  const { data, error } = await supabase.from('child_profiles').insert({ family_id: invite.family_id, display_name: displayName, birth_year: birthYear ?? null }).select('id,display_name').single();
  return { error, data };
}
