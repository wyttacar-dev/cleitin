import { getUser } from "./authService";
import { requireSupabase } from "../lib/supabaseClient";

async function getCurrentUserId() {
  const user = await getUser();
  if (!user?.id) throw new Error("Usuario nao autenticado.");
  return user.id;
}

export async function create(setting) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("settings")
    .insert({ ...setting, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel salvar a configuracao.");
  return data;
}

export async function list() {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Nao foi possivel carregar as configuracoes.");
  return data || [];
}

export async function update(id, patch) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel atualizar a configuracao.");
  return data;
}

export async function remove(id) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("settings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message || "Nao foi possivel remover a configuracao.");
}

export async function getSettingsMap(keys = []) {
  const rows = await list();
  return rows
    .filter((row) => !keys.length || keys.includes(row.key))
    .reduce((map, row) => ({ ...map, [row.key]: row.value }), {});
}

export async function upsertSetting(key, value) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("settings")
    .upsert(
      {
        user_id: userId,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel sincronizar a configuracao.");
  return data;
}
