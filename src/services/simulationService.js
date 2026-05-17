import { getUser } from "./authService";
import { requireSupabase } from "../lib/supabaseClient";

async function getCurrentUserId() {
  const user = await getUser();
  if (!user?.id) throw new Error("Usuario nao autenticado.");
  return user.id;
}

export async function create(simulation) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("simulations")
    .insert({ ...simulation, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel salvar a simulacao.");
  return data;
}

export async function list() {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Nao foi possivel carregar as simulacoes.");
  return data || [];
}

export async function update(id, patch) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("simulations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Nao foi possivel atualizar a simulacao.");
  return data;
}

export async function remove(id) {
  const supabase = requireSupabase();
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("simulations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message || "Nao foi possivel remover a simulacao.");
}
