-- Auto migration for premium, usernames, and multi-child routine assignments.

alter table public.families add column if not exists plan_tier text not null default 'basic';
alter table public.families drop constraint if exists families_plan_tier_check;
alter table public.families add constraint families_plan_tier_check check (plan_tier in ('basic', 'premium'));

alter table public.child_profiles add column if not exists username text;
update public.child_profiles
set username = coalesce(nullif(username, ''), lower(regexp_replace(display_name, '\s+', '', 'g')))
where username is null or username = '';
alter table public.child_profiles alter column username set not null;
create unique index if not exists child_profiles_family_username_unique on public.child_profiles (family_id, username);

create table if not exists public.routine_assignments (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (routine_id, child_id)
);

alter table public.routine_assignments enable row level security;

drop policy if exists routine_assignments_select on public.routine_assignments;
create policy routine_assignments_select on public.routine_assignments
for select using (
  exists (
    select 1 from public.routines r
    where r.id = routine_assignments.routine_id
      and public.is_family_member(r.family_id)
  )
);

drop policy if exists routine_assignments_write on public.routine_assignments;
create policy routine_assignments_write on public.routine_assignments
for all using (
  exists (
    select 1 from public.routines r
    where r.id = routine_assignments.routine_id
      and public.has_family_write_access(r.family_id)
  )
)
with check (
  exists (
    select 1 from public.routines r
    where r.id = routine_assignments.routine_id
      and public.has_family_write_access(r.family_id)
  )
);

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
    and (
      not exists (
        select 1
        from public.routine_assignments ra_any
        where ra_any.routine_id = r.id
      )
      or exists (
        select 1
        from public.routine_assignments ra
        where ra.routine_id = r.id
          and ra.child_id = p_child_id
      )
    )
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
  new_balance int,
  current_streak_days int
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
  v_streak_days int := 0;
  v_day_locked boolean := false;
begin
  if not exists (select 1 from public.child_profiles cp where cp.id = p_child_id) then
    raise exception 'Kindprofiel niet gevonden';
  end if;

  select coalesce(nullif(rt.reward_points, 0), 5)
    into v_reward_points
  from public.routine_tasks rt
  where rt.id = p_routine_task_id;

  if v_reward_points is null then
    raise exception 'Taak niet gevonden';
  end if;

  select exists (
    select 1
    from public.child_daily_rewards cdr
    where cdr.child_id = p_child_id
      and cdr.reward_date = current_date
      and cdr.reward_type = 'all_tasks_done_bonus'
  ) into v_day_locked;

  if v_day_locked then
    select cp.coin_balance, cp.streak_days into v_new_balance, v_streak_days
    from public.child_profiles cp
    where cp.id = p_child_id;
    return query select 0, 0, 0, coalesce(v_new_balance, 0), coalesce(v_streak_days, 0);
    return;
  end if;

  if p_completed is not true then
    if exists (
      select 1 from public.task_completions tc
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
      select cp.coin_balance into v_new_balance from public.child_profiles cp where cp.id = p_child_id;
    end if;

    with recursive streak_chain(day_key, len) as (
      select current_date::date, 1
      where exists (select 1 from public.task_completions tc where tc.child_id = p_child_id and tc.completed_on = current_date)
      union all
      select (day_key - 1), len + 1
      from streak_chain
      where exists (select 1 from public.task_completions tc where tc.child_id = p_child_id and tc.completed_on = day_key - 1)
    )
    select coalesce(max(len), 0) into v_streak_days from streak_chain;

    update public.child_profiles cp set streak_days = v_streak_days where cp.id = p_child_id;

    return query select 0, 0, 0, coalesce(v_new_balance, 0), v_streak_days;
    return;
  end if;

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
    select cp.coin_balance into v_new_balance from public.child_profiles cp where cp.id = p_child_id;
  end if;

  select count(*) into v_total_count
  from public.routines r
  join public.routine_tasks rt on rt.routine_id = r.id
  join public.child_profiles cp on cp.family_id = r.family_id
  where cp.id = p_child_id
    and r.is_active = true
    and (
      not exists (
        select 1
        from public.routine_assignments ra_any
        where ra_any.routine_id = r.id
      )
      or exists (
        select 1
        from public.routine_assignments ra
        where ra.routine_id = r.id
          and ra.child_id = p_child_id
      )
    );

  select count(*) into v_completed_count
  from public.task_completions tc
  join public.routine_tasks rt on rt.id = tc.routine_task_id
  join public.routines r on r.id = rt.routine_id
  join public.child_profiles cp on cp.family_id = r.family_id
  where tc.child_id = p_child_id
    and tc.completed_on = current_date
    and cp.id = p_child_id
    and r.is_active = true
    and (
      not exists (
        select 1
        from public.routine_assignments ra_any
        where ra_any.routine_id = r.id
      )
      or exists (
        select 1
        from public.routine_assignments ra
        where ra.routine_id = r.id
          and ra.child_id = p_child_id
      )
    );

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

  with recursive streak_chain(day_key, len) as (
    select current_date::date, 1
    where exists (select 1 from public.task_completions tc where tc.child_id = p_child_id and tc.completed_on = current_date)
    union all
    select (day_key - 1), len + 1
    from streak_chain
    where exists (select 1 from public.task_completions tc where tc.child_id = p_child_id and tc.completed_on = day_key - 1)
  )
  select coalesce(max(len), 0) into v_streak_days from streak_chain;

  update public.child_profiles cp set streak_days = v_streak_days where cp.id = p_child_id;

  return query select
    case when v_task_inserted_rows > 0 then v_reward_points else 0 end,
    v_bonus_points,
    (case when v_task_inserted_rows > 0 then v_reward_points else 0 end) + v_bonus_points,
    coalesce(v_new_balance, 0),
    v_streak_days;
end;
$$;
