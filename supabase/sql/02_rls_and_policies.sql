-- 02_rls_and_policies.sql
-- Security helper functions + all RLS enable/policies.

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
  v_user_id := auth.uid();
  if v_user_id is null then
    return query select null::uuid, 'Geen ingelogde gebruiker'::text;
    return;
  end if;

  begin
    insert into public.families (name, owner_user_id)
    values (family_name, v_user_id)
    returning id into v_family_id;
  exception when others then
    v_error := SQLERRM;
    return query select null::uuid, v_error::text;
    return;
  end;

  begin
    insert into public.family_members (family_id, user_id, role)
    values (v_family_id, v_user_id, 'owner');
  exception when others then
    v_error := SQLERRM;
    return query select null::uuid, v_error::text;
    return;
  end;

  return query select v_family_id, null::text;
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
    select 1 from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists task_completions_insert on public.task_completions;
create policy task_completions_insert on public.task_completions
for insert with check (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists task_completions_delete on public.task_completions;
create policy task_completions_delete on public.task_completions
for delete using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = task_completions.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists mood_entries_select on public.mood_entries;
create policy mood_entries_select on public.mood_entries
for select using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = mood_entries.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists mood_entries_insert on public.mood_entries;
create policy mood_entries_insert on public.mood_entries
for insert with check (
  exists (
    select 1 from public.child_profiles cp
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
    select 1 from public.child_profiles cp
    where cp.id = child_accessories.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists child_accessories_insert on public.child_accessories;
create policy child_accessories_insert on public.child_accessories
for insert with check (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_accessories.child_id
      and public.has_family_write_access(cp.family_id)
  )
);

drop policy if exists child_daily_rewards_select on public.child_daily_rewards;
create policy child_daily_rewards_select on public.child_daily_rewards
for select using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_daily_rewards.child_id
      and public.is_family_member(cp.family_id)
  )
);

drop policy if exists child_daily_rewards_insert on public.child_daily_rewards;
create policy child_daily_rewards_insert on public.child_daily_rewards
for insert with check (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_daily_rewards.child_id
      and public.has_family_write_access(cp.family_id)
  )
);
