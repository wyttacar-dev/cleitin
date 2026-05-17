import { requireSupabase } from "../lib/supabaseClient";

export async function signUp(name, email, password) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) throw new Error(error.message || "Nao foi possivel criar sua conta.");

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        name,
        role: "vendedor",
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw new Error(profileError.message || "Conta criada, mas falhou ao salvar o perfil.");
  }

  return data;
}

export async function signIn(email, password) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message || "Email ou senha invalidos.");
  return data;
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message || "Nao foi possivel sair.");
}

export async function getSession() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message || "Nao foi possivel carregar a sessao.");
  return data.session;
}

export async function getUser() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || "Nao foi possivel carregar o usuario.");
  return data.user;
}

export function onAuthStateChange(callback) {
  const supabase = requireSupabase();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
