import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

function readEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'): string {
  const fromProcess = process.env[name]?.trim();
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  const fromExtra =
    name === 'EXPO_PUBLIC_SUPABASE_URL'
      ? extra?.supabaseUrl?.trim()
      : extra?.supabasePublishableKey?.trim();
  const value = fromProcess || fromExtra;
  if (!value) {
    throw new Error(`Missing env var: ${name} (zet in .env.local en herstart Expo met -c)`);
  }
  return value;
}

const supabaseUrl = readEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabasePublishableKey = readEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

/** React Native fetch-fouten bij offline / gepauzeerd Supabase-project */
export function isTransientNetworkError(error: unknown): boolean {
  const msg = String((error as { message?: string } | null)?.message ?? error ?? '').toLowerCase();
  return (
    msg.includes('network request failed') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout')
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
