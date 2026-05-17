import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(url) {
  if (!url || url.includes("SEU_PROJECT_REF")) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  hasUrl: isValidSupabaseUrl(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey !== "SUA_ANON_KEY"),
};

export const isSupabaseConfigured = supabaseConfig.hasUrl && supabaseConfig.hasAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase URL ou Anon Key nao configuradas");
  }

  return supabase;
}
