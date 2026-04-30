import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type TaskCompletionMutation = {
  id: string;
  type: 'set_task_completion';
  payload: { childId: string; routineTaskId: string; completed: boolean };
  createdAt: string;
};

type MoodMutation = {
  id: string;
  type: 'save_mood';
  payload: { childId: string; mood: 'happy' | 'content' | 'neutral' | 'stressed' | 'sad' };
  createdAt: string;
};

type BuyAccessoryMutation = {
  id: string;
  type: 'buy_accessory';
  payload: { childId: string; accessoryKey: string; cost: number };
  createdAt: string;
};

export type OfflineMutation = TaskCompletionMutation | MoodMutation | BuyAccessoryMutation;

const STORAGE_KEY = 'tasko.offline.queue.v1';
let isFlushing = false;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isTransientNetworkError(error: unknown) {
  const msg = String((error as { message?: string } | null)?.message ?? error ?? '').toLowerCase();
  return msg.includes('network') || msg.includes('fetch') || msg.includes('internet') || msg.includes('offline') || msg.includes('timeout');
}

async function readQueue(): Promise<OfflineMutation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OfflineMutation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getOfflineQueueCount() {
  const queue = await readQueue();
  return queue.length;
}

async function writeQueue(queue: OfflineMutation[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function enqueueOfflineMutation(mutation: Omit<OfflineMutation, 'id' | 'createdAt'>) {
  const queue = await readQueue();
  const next: OfflineMutation = { ...mutation, id: makeId(), createdAt: new Date().toISOString() } as OfflineMutation;

  // Keep the latest toggle per task for same child/task.
  if (next.type === 'set_task_completion') {
    const deduped = queue.filter(
      (entry) =>
        !(
          entry.type === 'set_task_completion' &&
          entry.payload.childId === next.payload.childId &&
          entry.payload.routineTaskId === next.payload.routineTaskId
        ),
    );
    deduped.push(next);
    await writeQueue(deduped);
    return;
  }

  // Keep latest mood of the day intent per child.
  if (next.type === 'save_mood') {
    const deduped = queue.filter((entry) => !(entry.type === 'save_mood' && entry.payload.childId === next.payload.childId));
    deduped.push(next);
    await writeQueue(deduped);
    return;
  }

  // Avoid duplicate purchase intents for same accessory.
  if (next.type === 'buy_accessory') {
    const alreadyQueued = queue.some(
      (entry) =>
        entry.type === 'buy_accessory' &&
        entry.payload.childId === next.payload.childId &&
        entry.payload.accessoryKey === next.payload.accessoryKey,
    );
    if (alreadyQueued) return;
  }

  queue.push(next);
  await writeQueue(queue);
}

async function executeMutation(mutation: OfflineMutation): Promise<'done' | 'retry'> {
  if (mutation.type === 'set_task_completion') {
    const { error } = await supabase.rpc('set_task_completion_for_child', {
      p_child_id: mutation.payload.childId,
      p_routine_task_id: mutation.payload.routineTaskId,
      p_completed: mutation.payload.completed,
    });
    if (!error) return 'done';
    return isTransientNetworkError(error) ? 'retry' : 'done';
  }

  if (mutation.type === 'save_mood') {
    const { error } = await supabase.rpc('create_mood_entry_for_child', {
      p_child_id: mutation.payload.childId,
      p_mood: mutation.payload.mood,
    });
    if (!error) return 'done';
    return isTransientNetworkError(error) ? 'retry' : 'done';
  }

  const { error } = await supabase.rpc('buy_child_accessory', {
    p_child_id: mutation.payload.childId,
    p_accessory_key: mutation.payload.accessoryKey,
    p_cost: mutation.payload.cost,
  });
  if (!error) return 'done';

  const message = String(error.message ?? '');
  if (message.includes('Al in bezit')) return 'done';
  return isTransientNetworkError(error) ? 'retry' : 'done';
}

export async function flushOfflineQueue() {
  if (isFlushing) return;
  isFlushing = true;
  try {
    const queue = await readQueue();
    if (queue.length === 0) return;

    const remaining: OfflineMutation[] = [];
    for (const mutation of queue) {
      const result = await executeMutation(mutation);
      if (result === 'retry') {
        remaining.push(mutation);
      }
    }
    await writeQueue(remaining);
  } finally {
    isFlushing = false;
  }
}
