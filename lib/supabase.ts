import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithTimeout } from "./network";
import { assertEnv } from "./env";

const { url: SUPABASE_URL, key: ANON_KEY } = assertEnv();

const storage = (AsyncStorage as any) ?? {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (input: any, init: any) =>
      fetchWithTimeout(input, { timeoutMs: 10000, ...(init ?? {}) }),
  },
});
