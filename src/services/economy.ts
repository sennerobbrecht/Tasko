import { type AccessoryKey } from '../components/MonsterPreview';
import { supabase } from '../lib/supabase';
import { enqueueOfflineMutation } from './offlineQueue';

export async function getChildShopState(
  childId: string,
): Promise<{ data: { coinBalance: number; streakDays: number; ownedAccessories: AccessoryKey[] } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_child_shop_state', {
    p_child_id: childId,
  });

  if (error) {
    return { data: null, error };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { data: { coinBalance: 0, streakDays: 0, ownedAccessories: [] }, error: null };
  }

  return {
    data: {
      coinBalance: row.coin_balance ?? 0,
      streakDays: row.streak_days ?? 0,
      ownedAccessories: (row.owned_accessories ?? []) as AccessoryKey[],
    },
    error: null,
  };
}

export async function buyAccessoryForChild({
  childId,
  accessoryKey,
  cost,
}: {
  childId: string;
  accessoryKey: AccessoryKey;
  cost: number;
}): Promise<{ data: { success: boolean; message: string; new_balance: number } | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('buy_child_accessory', {
      p_child_id: childId,
      p_accessory_key: accessoryKey,
      p_cost: cost,
    });

    if (error) {
      const message = String(error.message ?? '').toLowerCase();
      if (message.includes('network') || message.includes('netword') || message.includes('fetch') || message.includes('offline') || message.includes('timeout')) {
        await enqueueOfflineMutation({
          type: 'buy_accessory',
          payload: { childId, accessoryKey, cost },
        });
        return {
          data: { success: true, message: 'Offline opgeslagen, wordt gesynchroniseerd zodra je online bent.', new_balance: 0 },
          error: null,
        };
      }
      return { data: null, error };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      data: (row as { success: boolean; message: string; new_balance: number } | null) ?? {
        success: false,
        message: 'Onbekende fout',
        new_balance: 0,
      },
      error: null,
    };
  } catch (error) {
    const message = String((error as { message?: string } | null)?.message ?? error ?? '').toLowerCase();
    if (message.includes('network') || message.includes('netword') || message.includes('fetch') || message.includes('offline') || message.includes('timeout')) {
      await enqueueOfflineMutation({
        type: 'buy_accessory',
        payload: { childId, accessoryKey, cost },
      });
      return {
        data: { success: true, message: 'Offline opgeslagen, wordt gesynchroniseerd zodra je online bent.', new_balance: 0 },
        error: null,
      };
    }
    return { data: null, error: error as Error };
  }
}
