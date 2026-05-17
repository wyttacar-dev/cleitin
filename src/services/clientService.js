import { getUser } from "./authService";
import { requireSupabase } from "../lib/supabaseClient";

async function getCurrentUserId() {
  const user = await getUser();
  if (!user?.id) throw new Error("Usuario nao autenticado.");
  return user.id;
}

export async function create(client) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...client, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel salvar o cliente.");
  return data;
}

export async function list() {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Nao foi possivel carregar os clientes.");
  return data || [];
}

export async function update(id, patch) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("clients")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel atualizar o cliente.");
  return data;
}

export async function remove(id) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message || "Nao foi possivel remover o cliente.");
}
