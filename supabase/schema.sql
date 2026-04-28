-- Tasko baseline schema (parent dashboard first)

create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'parent', 'guardian', 'viewer')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null,
  avatar_seed text,
  birth_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_tasks (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  reward_points int not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  routine_task_id uuid not null references public.routine_tasks(id) on delete cascade,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  completed_by_user_id uuid references auth.users(id) on delete set null,
  completed_at timestamptz not null default now(),
  completed_on date not null default current_date,
  unique (routine_task_id, child_id, completed_on)
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  mood text not null check (mood in ('happy', 'content', 'neutral', 'stressed', 'sad')),
  note text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code text not null unique,
  role text not null check (role in ('parent', 'guardian', 'viewer')),
  expires_at timestamptz not null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  used_at timestamptz,
  used_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_families_updated_at on public.families;
create trigger trg_families_updated_at
before update on public.families
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_child_profiles_updated_at on public.child_profiles;
create trigger trg_child_profiles_updated_at
before update on public.child_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_routines_updated_at on public.routines;
create trigger trg_routines_updated_at
before update on public.routines
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_routine_tasks_updated_at on public.routine_tasks;
create trigger trg_routine_tasks_updated_at
before update on public.routine_tasks
for each row execute procedure public.set_updated_at();

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.families f
    where f.id = target_family_id
      and f.owner_user_id = auth.uid()
  );
$$;

create or replace function public.has_family_write_access(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.role in ('owner', 'parent', 'guardian')
  )
  or exists (
    select 1
    from public.families f
    where f.id = target_family_id
      and f.owner_user_id = auth.uid()
  );
$$;

alter table public.families enable row level security;
create or replace function public.create_family_for_current_user(family_name text default 'Mijn Gezin')
returns table(family_id uuid, error_message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_family_id uuid;
  v_error text := null;
begin
  -- Get current user
  v_user_id := auth.uid();
  if v_user_id is null then
    return query select null::uuid as family_id, 'Geen ingelogde gebruiker'::text as error_message;
    return;
  end if;

  -- Create family
  begin
    insert into public.families (name, owner_user_id)
    values (family_name, v_user_id)
    returning id into v_family_id;
  exception when others then
    v_error := SQLERRM;
    return query select null::uuid as family_id, v_error::text as error_message;
    return;
  end;

  -- Add user as owner in family_members
  begin
    insert into public.family_members (family_id, user_id, role)
    values (v_family_id, v_user_id, 'owner');
  exception when others then
    v_error := SQLERRM;
    return query select null::uuid as family_id, v_error::text as error_message;
    return;
  end;

  return query select v_family_id as family_id, null::text as error_message;
end;
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.child_profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.mood_entries enable row level security;
alter table public.team_invites enable row level security;

drop policy if exists families_select on public.families;
create policy families_select on public.families
for select using (public.is_family_member(id));

drop policy if exists families_insert on public.families;
create policy families_insert on public.families
for insert with check (owner_user_id = auth.uid());

drop policy if exists families_update on public.families;
create policy families_update on public.families
for update using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists family_members_select on public.family_members;
create policy family_members_select on public.family_members
for select using (public.is_family_member(family_id));

drop policy if exists family_members_insert on public.family_members;
create policy family_members_insert on public.family_members
for insert with check (public.has_family_write_access(family_id));

drop policy if exists family_members_delete on public.family_members;
create policy family_members_delete on public.family_members
for delete using (public.has_family_write_access(family_id));

drop policy if exists child_profiles_select on public.child_profiles;
create policy child_profiles_select on public.child_profiles
for select using (public.is_family_member(family_id));

drop policy if exists child_profiles_write on public.child_profiles;
create policy child_profiles_write on public.child_profiles
for all using (public.has_family_write_access(family_id))
with check (public.has_family_write_access(family_id));

drop policy if exists routines_select on public.routines;
create policy routines_select on public.routines
for select using (public.is_family_member(family_id));

drop policy if exists routines_write on public.routines;
create policy routines_write on public.routines
for all using (public.has_family_write_access(family_id))
with check (public.has_family_write_access(family_id));

drop policy if exists routine_tasks_select on public.routine_tasks;
create policy routine_tasks_select on public.routine_tasks
for select using (
  exists (
    select 1 from public.routines r
    where r.id = routine_tasks.routine_id
      and public.is_family_member(r.family_id)
  )
);

drop policy if exists routine_tasks_write on public.routine_tasks;
create policy routine_tasks_write on public.routine_tasks
for all using (
  exists (
    select 1 from public.routines r
    where r.id = routine_tasks.routine_id
      and public.has_family_write_access(r.family_id)
  )
)
with check (
  exists (
    select 1 from public.routines r
    where r.id = routine_tasks.routine_id
      and public.has_family_write_access(r.family_id)
  )
);

drop policy if exists task_completions_select on public.task_completions;
create policy task_completions_select on public.task_completions
for select using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists task_completions_insert on public.task_completions;
create policy task_completions_insert on public.task_completions
for insert with check (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists task_completions_delete on public.task_completions;
create policy task_completions_delete on public.task_completions
for delete using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists mood_entries_select on public.mood_entries;
create policy mood_entries_select on public.mood_entries
for select using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = mood_entries.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists mood_entries_insert on public.mood_entries;
create policy mood_entries_insert on public.mood_entries
for insert with check (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = mood_entries.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists team_invites_select on public.team_invites;
create policy team_invites_select on public.team_invites
for select using (public.is_family_member(family_id));

drop policy if exists team_invites_write on public.team_invites;
create policy team_invites_write on public.team_invites
for all using (public.has_family_write_access(family_id))
with check (public.has_family_write_access(family_id));

-- Public function to look up a team invite by code (runs with definer privileges so unauthenticated users can redeem)
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
