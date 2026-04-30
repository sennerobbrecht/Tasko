-- 05_routine_and_shop_functions.sql

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
  where cp.id = p_child_id and r.is_active = true;

  select count(*) into v_completed_count
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

drop function if exists public.get_child_shop_state(uuid);
create or replace function public.get_child_shop_state(
  p_child_id uuid
)
returns table(
  coin_balance int,
  streak_days int,
  owned_accessories text[]
)
language sql
security definer
set search_path = public
as $$
  select
    cp.coin_balance,
    cp.streak_days,
    coalesce(array_agg(ca.accessory_key) filter (where ca.accessory_key is not null), '{}')::text[] as owned_accessories
  from public.child_profiles cp
  left join public.child_accessories ca on ca.child_id = cp.id
  where cp.id = p_child_id
  group by cp.id, cp.coin_balance, cp.streak_days;
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

  select cp.coin_balance into v_balance from public.child_profiles cp where cp.id = p_child_id;
  if v_balance is null then
    return query select false, 'Kindprofiel niet gevonden', 0;
    return;
  end if;

  if exists (select 1 from public.child_accessories ca where ca.child_id = p_child_id and ca.accessory_key = p_accessory_key) then
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
