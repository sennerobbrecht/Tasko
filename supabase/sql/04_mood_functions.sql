-- 04_mood_functions.sql

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
