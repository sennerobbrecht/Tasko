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

drop function if exists public.create_child_profile_from_invite(text, text, int);
create or replace function public.create_child_profile_from_invite(
  p_code text,
  p_username text,
  p_display_name text,
  p_birth_year int default null
)
returns table(id uuid, username text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_plan_tier text := 'basic';
begin
  if p_code is null or btrim(p_code) = '' then
    raise exception 'Ongeldige code';
  end if;

  if p_display_name is null or btrim(p_display_name) = '' then
    raise exception 'Kies een monsternaam';
  end if;

  if p_username is null or btrim(p_username) = '' then
    raise exception 'Kies een gebruikersnaam';
  end if;

  select ti.family_id
    into v_family_id
  from public.team_invites ti
  where ti.code = p_code
  limit 1;

  if v_family_id is null then
    raise exception 'Code is verlopen of ongeldig';
  end if;

  select coalesce(f.plan_tier, 'basic')
    into v_plan_tier
  from public.families f
  where f.id = v_family_id;

  if v_plan_tier <> 'premium'
    and exists (
      select 1
      from public.child_profiles cp
      where cp.family_id = v_family_id
      limit 1
    ) then
    raise exception 'Basis account: maximaal 1 kind per gezin';
  end if;

  if exists (
    select 1
    from public.child_profiles cp
    where cp.family_id = v_family_id
      and lower(cp.username) = lower(btrim(p_username))
    limit 1
  ) then
    raise exception 'Deze gebruikersnaam bestaat al in dit gezin';
  end if;

  return query
  insert into public.child_profiles (family_id, username, display_name, birth_year)
  values (v_family_id, lower(btrim(p_username)), btrim(p_display_name), p_birth_year)
  returning child_profiles.id, child_profiles.username, child_profiles.display_name;
end;
$$;

drop function if exists public.get_child_limit_status_for_invite_code(text);
create or replace function public.get_child_limit_status_for_invite_code(p_code text)
returns table(
  plan_tier text,
  child_count int,
  limit_reached boolean
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(f.plan_tier, 'basic') as plan_tier,
    coalesce(count(cp.id), 0)::int as child_count,
    case
      when coalesce(f.plan_tier, 'basic') = 'premium' then false
      else coalesce(count(cp.id), 0) >= 1
    end as limit_reached
  from public.team_invites ti
  join public.families f on f.id = ti.family_id
  left join public.child_profiles cp on cp.family_id = f.id
  where ti.code = p_code
  group by f.plan_tier;
$$;

drop function if exists public.find_child_profile_by_invite_code(text, text);
create or replace function public.find_child_profile_by_invite_code(
  p_code text,
  p_username text
)
returns table(id uuid, username text, display_name text)
language sql
security definer
set search_path = public
as $$
  select cp.id, cp.username, cp.display_name
  from public.team_invites ti
  join public.child_profiles cp on cp.family_id = ti.family_id
  where ti.code = p_code
    and lower(cp.username) = lower(p_username)
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
  );
$$;
