import { getCurrentFamily } from './families';
import { supabase } from '../lib/supabase';

export type RoutineSummary = {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

export type RoutineTaskSummary = {
  id: string;
  title: string;
  sort_order: number;
  reward_points: number;
  is_required: boolean;
};

export type RoutineWithTasks = RoutineSummary & {
  description: string | null;
  routine_tasks: RoutineTaskSummary[];
};

export type RoutineTaskInput = {
  title: string;
  sort_order: number;
  reward_points?: number;
  is_required?: boolean;
};

export type ChildRoutineTask = {
  routine_task_id: string;
  routine_id: string;
  routine_title: string;
  task_title: string;
  sort_order: number;
  reward_points: number;
  is_completed: boolean;
};

export async function getCurrentFamilyRoutines(): Promise<{ data: RoutineSummary[]; error: Error | null }> {
  const { family, error: familyError } = await getCurrentFamily();
  if (familyError) {
    return { data: [], error: familyError };
  }

  if (!family) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('routines')
    .select('id,title,is_active,created_at')
    .eq('family_id', family.id)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data ?? []) as RoutineSummary[],
    error: null,
  };
}

export async function getCurrentFamilyRoutinesWithTasks(): Promise<{ data: RoutineWithTasks[]; error: Error | null }> {
  const { family, error: familyError } = await getCurrentFamily();
  if (familyError) {
    return { data: [], error: familyError };
  }

  if (!family) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('routines')
    .select('id,title,description,is_active,created_at,routine_tasks(id,title,sort_order,reward_points,is_required)')
    .eq('family_id', family.id)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data ?? []).map((routine) => ({
      ...(routine as RoutineWithTasks),
      routine_tasks: ((routine as RoutineWithTasks).routine_tasks ?? []).slice().sort((left, right) => left.sort_order - right.sort_order),
    })),
    error: null,
  };
}

export async function createRoutineWithTasks({
  title,
  description,
  isActive = true,
  tasks,
}: {
  title: string;
  description?: string;
  isActive?: boolean;
  tasks: RoutineTaskInput[];
}): Promise<{ data: RoutineSummary | null; error: Error | null }> {
  const { family, error: familyError } = await getCurrentFamily();
  if (familyError) {
    return { data: null, error: familyError };
  }

  if (!family) {
    return { data: null, error: new Error('Geen gezin gevonden.') };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { data: null, error: authError ?? new Error('Geen ingelogde gebruiker gevonden.') };
  }

  const createdByUserId = authData.user.id;
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      family_id: family.id,
      title,
      description: description ?? null,
      is_active: isActive,
      created_by_user_id: createdByUserId,
    })
    .select('id,title,is_active,created_at')
    .single();

  if (routineError || !routine) {
    return { data: null, error: routineError ?? new Error('Kon routine niet opslaan.') };
  }

  if (tasks.length > 0) {
    const { error: taskError } = await supabase.from('routine_tasks').insert(
      tasks.map((task) => ({
        routine_id: routine.id,
        title: task.title,
        sort_order: task.sort_order,
        reward_points: task.reward_points ?? 0,
        is_required: task.is_required ?? true,
      })),
    );

    if (taskError) {
      await supabase.from('routines').delete().eq('id', routine.id);
      return { data: null, error: taskError };
    }
  }

  return {
    data: routine as RoutineSummary,
    error: null,
  };
}

export async function getTodayRoutineTasksForChild(
  childId: string,
): Promise<{ data: ChildRoutineTask[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_today_routine_tasks_for_child', {
    p_child_id: childId,
  });

  if (error) {
    return { data: [], error };
  }

  return {
    data: (data ?? []) as ChildRoutineTask[],
    error: null,
  };
}

export async function setTaskCompletionForChild({
  childId,
  routineTaskId,
  completed,
}: {
  childId: string;
  routineTaskId: string;
  completed: boolean;
}): Promise<{
  data: { awarded_points: number; bonus_points: number; total_awarded_points: number; new_balance: number; current_streak_days: number } | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('set_task_completion_for_child', {
    p_child_id: childId,
    p_routine_task_id: routineTaskId,
    p_completed: completed,
  });

  if (error) {
    return { data: null, error };
  }

  const firstRow = Array.isArray(data) ? data[0] : data;
  return {
    data:
      (firstRow as { awarded_points: number; bonus_points: number; total_awarded_points: number; new_balance: number; current_streak_days: number } | null) ??
      { awarded_points: 0, bonus_points: 0, total_awarded_points: 0, new_balance: 0, current_streak_days: 0 },
    error: null,
  };
}
