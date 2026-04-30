import { type AccessoryKey } from '../components/MonsterPreview';
import { supabase } from '../lib/supabase';

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
  const { data, error } = await supabase.rpc('buy_child_accessory', {
    p_child_id: childId,
    p_accessory_key: accessoryKey,
    p_cost: cost,
  });

  if (error) {
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
}
