import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json');

export default (): ExpoConfig => {
  const base = appJson.expo as ExpoConfig;

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[Tasko] Zet EXPO_PUBLIC_SUPABASE_URL en EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (zie .env.example).',
    );
  }

  return {
    ...base,
    extra: {
      ...base.extra,
      supabaseUrl,
      supabasePublishableKey: supabaseKey,
    },
  };
};
