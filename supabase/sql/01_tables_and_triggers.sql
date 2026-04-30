-- 01_tables_and_triggers.sql
-- Core extension, tables, columns, and updated_at triggers.

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
  streak_days int not null default 0,
  birth_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.child_profiles add column if not exists coin_balance int not null default 0;
alter table public.child_profiles add column if not exists streak_days int not null default 0;

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

alter table public.routine_tasks alter column reward_points set default 5;
update public.routine_tasks set reward_points = 5 where reward_points = 0;

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
