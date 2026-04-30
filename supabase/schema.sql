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
  coin_balance int not null default 0,
  birth_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.child_profiles
add column if not exists coin_balance int not null default 0;

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
  reward_points int not null default 5,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routine_tasks
alter column reward_points set default 5;

update public.routine_tasks
set reward_points = 5
where reward_points = 0;

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

create table if not exists public.child_accessories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  accessory_key text not null check (accessory_key in ('sunglasses','hoodie','crown','bowtie','flower','wand','patch','neon_glasses','chef_hat','space_helmet','laser_blade','super_cape','disco_crown','cyber_visor','heart_glasses','ice_hat','dragon_crown','golden_scepter','galaxy_suit','leaf_wreath','star_patch')),
  purchased_at timestamptz not null default now(),
  unique (child_id, accessory_key)
);

create table if not exists public.child_daily_rewards (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  reward_date date not null default current_date,
  reward_type text not null check (reward_type in ('all_tasks_done_bonus')),
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique (child_id, reward_date, reward_type)
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
alter table public.child_accessories enable row level security;
alter table public.child_daily_rewards enable row level security;

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

drop policy if exists child_accessories_select on public.child_accessories;
create policy child_accessories_select on public.child_accessories
for select using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = child_accessories.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists child_accessories_insert on public.child_accessories;
create policy child_accessories_insert on public.child_accessories
for insert with check (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = child_accessories.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists child_daily_rewards_select on public.child_daily_rewards;
create policy child_daily_rewards_select on public.child_daily_rewards
for select using (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = child_daily_rewards.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists child_daily_rewards_insert on public.child_daily_rewards;
create policy child_daily_rewards_insert on public.child_daily_rewards
for insert with check (
  exists (
    select 1
    from public.child_profiles cp
    where cp.id = child_daily_rewards.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

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

create or replace function public.create_mood_entry_for_child(
  p_child_id uuid,
  p_mood text
)
returns table(child_id uuid, mood text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_id uuid;
begin
  if p_mood not in ('happy', 'content', 'neutral', 'stressed', 'sad') then
    raise exception 'Ongeldige mood';
  end if;

  if not exists (
    select 1
    from public.child_profiles cp
    where cp.id = p_child_id
  ) then
    raise exception 'Kindprofiel niet gevonden';
  end if;

  select me.id
    into v_existing_id
  from public.mood_entries me
  where me.child_id = p_child_id
    and me.created_at >= date_trunc('day', now())
    and me.created_at < date_trunc('day', now()) + interval '1 day'
  order by me.created_at desc
  limit 1;

  if v_existing_id is not null then
    return query
    update public.mood_entries me
       set mood = p_mood
     where me.id = v_existing_id
     returning me.child_id, me.mood, me.created_at;
    return;
  end if;

  return query
  insert into public.mood_entries (child_id, mood)
  values (p_child_id, p_mood)
  returning mood_entries.child_id, mood_entries.mood, mood_entries.created_at;
end;
$$;

create or replace function public.get_today_mood_for_child(
  p_child_id uuid
)
returns table(child_id uuid, mood text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select me.child_id, me.mood, me.created_at
  from public.mood_entries me
  where me.child_id = p_child_id
    and me.created_at >= date_trunc('day', now())
    and me.created_at < date_trunc('day', now()) + interval '1 day'
  order by me.created_at desc
  limit 1;
$$;

create or replace function public.get_today_routine_tasks_for_child(
  p_child_id uuid
)
returns table(
  routine_task_id uuid,
  routine_id uuid,
  routine_title text,
  task_title text,
  sort_order int,
  reward_points int,
  is_completed boolean
)
language sql
security definer
set search_path = public
as $$
  select
    rt.id as routine_task_id,
    r.id as routine_id,
    r.title as routine_title,
    rt.title as task_title,
    rt.sort_order,
    coalesce(nullif(rt.reward_points, 0), 5) as reward_points,
    exists (
      select 1
      from public.task_completions tc
      where tc.routine_task_id = rt.id
        and tc.child_id = p_child_id
        and tc.completed_on = current_date
    ) as is_completed
  from public.child_profiles cp
  join public.routines r on r.family_id = cp.family_id
  join public.routine_tasks rt on rt.routine_id = r.id
  where cp.id = p_child_id
    and r.is_active = true
  order by r.created_at desc, rt.sort_order asc, rt.created_at asc;
$$;

drop function if exists public.set_task_completion_for_child(uuid, uuid, boolean);

create or replace function public.set_task_completion_for_child(
  p_child_id uuid,
  p_routine_task_id uuid,
  p_completed boolean
)
returns table(
  awarded_points int,
  bonus_points int,
  total_awarded_points int,
  new_balance int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward_points int := 0;
  v_bonus_points int := 0;
  v_inserted_rows int := 0;
  v_task_inserted_rows int := 0;
  v_completed_count int := 0;
  v_total_count int := 0;
  v_new_balance int := 0;
begin
  if not exists (
    select 1
    from public.child_profiles cp
    where cp.id = p_child_id
  ) then
    raise exception 'Kindprofiel niet gevonden';
  end if;

  select coalesce(nullif(rt.reward_points, 0), 5)
    into v_reward_points
  from public.routine_tasks rt
  where rt.id = p_routine_task_id;

  if v_reward_points is null then
    raise exception 'Taak niet gevonden';
  end if;

  if p_completed is not true then
    if exists (
      select 1
      from public.task_completions tc
      where tc.routine_task_id = p_routine_task_id
        and tc.child_id = p_child_id
        and tc.completed_on = current_date
    ) then
      delete from public.task_completions tc
      where tc.routine_task_id = p_routine_task_id
        and tc.child_id = p_child_id
        and tc.completed_on = current_date;

      update public.child_profiles cp
      set coin_balance = greatest(0, cp.coin_balance - v_reward_points)
      where cp.id = p_child_id
      returning cp.coin_balance into v_new_balance;
    else
      select cp.coin_balance into v_new_balance
      from public.child_profiles cp
      where cp.id = p_child_id;
    end if;

    return query select 0, 0, 0, coalesce(v_new_balance, 0);
    return;
  end if;

  if p_completed then
    insert into public.task_completions (routine_task_id, child_id, completed_on)
    values (p_routine_task_id, p_child_id, current_date)
    on conflict (routine_task_id, child_id, completed_on) do nothing;

    get diagnostics v_inserted_rows = row_count;
    v_task_inserted_rows := v_inserted_rows;

    if v_inserted_rows > 0 then
      update public.child_profiles cp
      set coin_balance = cp.coin_balance + v_reward_points
      where cp.id = p_child_id
      returning cp.coin_balance into v_new_balance;
    else
      select cp.coin_balance into v_new_balance
      from public.child_profiles cp
      where cp.id = p_child_id;
    end if;

    select count(*)
      into v_total_count
    from public.routines r
    join public.routine_tasks rt on rt.routine_id = r.id
    join public.child_profiles cp on cp.family_id = r.family_id
    where cp.id = p_child_id
      and r.is_active = true;

    select count(*)
      into v_completed_count
    from public.task_completions tc
    join public.routine_tasks rt on rt.id = tc.routine_task_id
    join public.routines r on r.id = rt.routine_id
    join public.child_profiles cp on cp.family_id = r.family_id
    where tc.child_id = p_child_id
      and tc.completed_on = current_date
      and cp.id = p_child_id
      and r.is_active = true;

    if v_total_count > 0 and v_completed_count >= v_total_count then
      insert into public.child_daily_rewards (child_id, reward_date, reward_type, points)
      values (p_child_id, current_date, 'all_tasks_done_bonus', 30)
      on conflict (child_id, reward_date, reward_type) do nothing;

      get diagnostics v_inserted_rows = row_count;

      if v_inserted_rows > 0 then
        v_bonus_points := 30;
        update public.child_profiles cp
        set coin_balance = cp.coin_balance + v_bonus_points
        where cp.id = p_child_id
        returning cp.coin_balance into v_new_balance;
      end if;
    end if;

    return query select
      case when v_task_inserted_rows > 0 then v_reward_points else 0 end,
      v_bonus_points,
      (case when v_task_inserted_rows > 0 then v_reward_points else 0 end) + v_bonus_points,
      coalesce(v_new_balance, 0);
    return;
  end if;
end;
$$;

create or replace function public.get_child_shop_state(
  p_child_id uuid
)
returns table(
  coin_balance int,
  owned_accessories text[]
)
language sql
security definer
set search_path = public
as $$
  select
    cp.coin_balance,
    coalesce(array_agg(ca.accessory_key) filter (where ca.accessory_key is not null), '{}')::text[] as owned_accessories
  from public.child_profiles cp
  left join public.child_accessories ca on ca.child_id = cp.id
  where cp.id = p_child_id
  group by cp.id, cp.coin_balance;
$$;

create or replace function public.buy_child_accessory(
  p_child_id uuid,
  p_accessory_key text,
  p_cost int
)
returns table(
  success boolean,
  message text,
  new_balance int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
begin
  if p_accessory_key not in ('sunglasses','hoodie','crown','bowtie','flower','wand','patch','neon_glasses','chef_hat','space_helmet','laser_blade','super_cape','disco_crown','cyber_visor','heart_glasses','ice_hat','dragon_crown','golden_scepter','galaxy_suit','leaf_wreath','star_patch') then
    return query select false, 'Ongeldig accessoire', 0;
    return;
  end if;

  select cp.coin_balance into v_balance
  from public.child_profiles cp
  where cp.id = p_child_id;

  if v_balance is null then
    return query select false, 'Kindprofiel niet gevonden', 0;
    return;
  end if;

  if exists (
    select 1 from public.child_accessories ca
    where ca.child_id = p_child_id
      and ca.accessory_key = p_accessory_key
  ) then
    return query select true, 'Al in bezit', v_balance;
    return;
  end if;

  if v_balance < p_cost then
    return query select false, 'Niet genoeg munten', v_balance;
    return;
  end if;

  update public.child_profiles cp
  set coin_balance = cp.coin_balance - p_cost
  where cp.id = p_child_id
  returning cp.coin_balance into v_balance;

  insert into public.child_accessories (child_id, accessory_key)
  values (p_child_id, p_accessory_key);

  return query select true, 'Gekocht', v_balance;
end;
$$;
