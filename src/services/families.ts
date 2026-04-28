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

  // Use PostgreSQL function to bypass RLS
  const { data, error: functionError } = await supabase.rpc('create_family_for_current_user', {
    family_name: defaultFamilyName,
  });

  if (functionError) {
    return { error: functionError, family: null as Family | null };
  }

  if (!data || data.length === 0) {
    return { error: new Error('Kon gezin niet aanmaken.'), family: null as Family | null };
  }

  const result = data[0] as { family_id: string; error_message: string | null };

  if (result.error_message) {
    return { error: new Error(result.error_message), family: null as Family | null };
  }

  if (!result.family_id) {
    return { error: new Error('Kon gezin niet aanmaken.'), family: null as Family | null };
  }

  // Fetch the created family
  const { data: createdFamily, error: fetchError } = await supabase
    .from('families')
    .select('id,name')
    .eq('id', result.family_id)
    .single();

  if (fetchError || !createdFamily) {
    return { error: fetchError ?? new Error('Kon gezin niet ophalen.'), family: null as Family | null };
  }

  return { error: null, family: createdFamily as Family };
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

export async function createTeamInviteForCurrentFamily({ role = 'parent', expiresInDays = 7, code: providedCode }: { role?: string; expiresInDays?: number; code?: string } = {}) {
  const { family, error: famErr } = await getCurrentFamily();
  if (famErr) return { data: null, error: famErr };
  if (!family) return { data: null, error: new Error('Geen gezin gevonden voor huidige gebruiker') };

  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = providedCode ?? '';
  if (!providedCode) {
    for (let i = 0; i < 10; i++) code += codeChars[Math.floor(Math.random() * codeChars.length)];
  }

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
  const { data, error } = await supabase.rpc('create_child_profile_from_invite', {
    p_code: code,
    p_display_name: displayName,
    p_birth_year: birthYear ?? null,
  });

  if (error) {
    return { error, data: null };
  }

  if (!data || data.length === 0) {
    return { error: new Error('Kon kind niet aanmaken.'), data: null };
  }

  return { error: null, data: data[0] as { id: string; display_name: string } };
}

export async function loginChildWithCodeAndName(code: string, displayName: string) {
  const trimmedCode = code.trim();
  const trimmedName = displayName.trim();

  if (!trimmedCode) {
    return { error: new Error('Vul de gezinscode in.'), data: null };
  }

  if (!trimmedName) {
    return { error: new Error('Vul je gebruikersnaam in.'), data: null };
  }

  const { data, error } = await supabase.rpc('find_child_profile_by_invite_code', {
    p_code: trimmedCode,
    p_display_name: trimmedName,
  });

  if (error) {
    return { error, data: null };
  }

  if (!data || data.length === 0) {
    return { error: new Error('Geen kindprofiel gevonden met deze code en gebruikersnaam.'), data: null };
  }

  return { error: null, data: data[0] as { id: string; display_name: string } };
}

export async function familyHasChildForInviteCode(code: string) {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return { error: new Error('Vul de gezinscode in.'), hasChild: false };
  }

  const { data, error } = await supabase.rpc('has_child_profile_for_invite_code', {
    p_code: trimmedCode,
  });

  if (error) {
    return { error, hasChild: false };
  }

  return { error: null, hasChild: Boolean(data) };
}

export async function removeCurrentFamilyChild() {
  const { family, error: familyError } = await getCurrentFamily();
  if (familyError) {
    return { error: familyError };
  }

  if (!family) {
    return { error: new Error('Geen gezin gevonden.') };
  }

  const { data: children, error: childrenError } = await supabase
    .from('child_profiles')
    .select('id')
    .eq('family_id', family.id)
    .limit(1);

  if (childrenError) {
    return { error: childrenError };
  }

  const child = children?.[0] as { id: string } | undefined;
  if (!child) {
    return { error: new Error('Geen kind gevonden om te verwijderen.') };
  }

  const { error } = await supabase.from('child_profiles').delete().eq('id', child.id);
  return { error: error ?? null };
}
