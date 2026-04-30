-- 03_invite_and_child_functions.sql

create or replace function public.get_team_invite_by_code(p_code text)
returns table(id uuid, family_id uuid, code text, role text, expires_at timestamptz, created_by_user_id uuid, used_at timestamptz, used_by_user_id uuid, created_at timestamptz)
language sql
security definer
as $$
  select id, family_id, code, role, expires_at, created_by_user_id, used_at, used_by_user_id, created_at
  from public.team_invites
  where code = p_code
  limit 1;
$$;

create or replace function public.create_child_profile_from_invite(
  p_code text,
  p_display_name text,
  p_birth_year int default null
)
returns table(id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  if p_code is null or btrim(p_code) = '' then
    raise exception 'Ongeldige code';
  end if;

  if p_display_name is null or btrim(p_display_name) = '' then
    raise exception 'Kies een gebruikersnaam';
  end if;

  select ti.family_id
    into v_family_id
  from public.team_invites ti
  where ti.code = p_code
    and ti.expires_at > now()
  limit 1;

  if v_family_id is null then
    raise exception 'Code is verlopen of ongeldig';
  end if;

  if exists (
    select 1
    from public.child_profiles cp
    where cp.family_id = v_family_id
    limit 1
  ) then
    raise exception 'Er kan maximaal 1 kind per gezin worden toegevoegd';
  end if;

  return query
  insert into public.child_profiles (family_id, display_name, birth_year)
  values (v_family_id, btrim(p_display_name), p_birth_year)
  returning child_profiles.id, child_profiles.display_name;
end;
$$;

create or replace function public.find_child_profile_by_invite_code(
  p_code text,
  p_display_name text
)
returns table(id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select cp.id, cp.display_name
  from public.team_invites ti
  join public.child_profiles cp on cp.family_id = ti.family_id
  where ti.code = p_code
    and ti.expires_at > now()
    and lower(cp.display_name) = lower(p_display_name)
  order by cp.created_at desc
  limit 1;
$$;

create or replace function public.has_child_profile_for_invite_code(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_invites ti
    join public.child_profiles cp on cp.family_id = ti.family_id
    where ti.code = p_code
      and ti.expires_at > now()
  );
$$;
