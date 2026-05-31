import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** Supabase auth storage: localStorage op web, AsyncStorage op native */
export const supabaseAuthStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
        setItem: (key: string, value: string) => {
          globalThis.localStorage?.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          globalThis.localStorage?.removeItem(key);
          return Promise.resolve();
        },
      }
    : AsyncStorage;
