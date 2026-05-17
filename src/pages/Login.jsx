import React, { useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { signIn, signOut, signUp } from "../services/authService";

export function Login({ session, onAuthChange }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = mode === "signup"
        ? await signUp(name, email, password)
        : await signIn(email, password);
      onAuthChange?.(data.session || null);
      setMessage(mode === "signup" ? "Cadastro criado. Confira o email se a confirmacao estiver ativa." : "Sessao iniciada.");
    } catch (error) {
      setMessage(error.message || "Nao foi possivel autenticar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    setMessage("");
    try {
      await signOut();
      onAuthChange?.(null);
    } catch (error) {
      setMessage(error.message || "Nao foi possivel sair.");
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 shadow-glow">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-200">Conta ativa</p>
          <h1 className="mt-2 text-3xl font-black">Voce esta logado.</h1>
          <p className="mt-3 text-sm text-slate-300">{session.user?.email}</p>
          {message && <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm font-bold">{message}</p>}
          <button className="soft-button mt-5 w-full bg-white text-slate-950" onClick={handleSignOut} disabled={loading}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-200">Cleitin Cobrancas</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">CRM comercial com dados na nuvem.</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            Entre para manter clientes, simulacoes e configuracoes separados por usuario com Supabase.
          </p>
        </div>

        <form className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-glow backdrop-blur-2xl" onSubmit={handleSubmit}>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/50 p-1">
            <button
              className={`rounded-lg px-3 py-2 text-sm font-black ${mode === "signin" ? "bg-white text-slate-950" : "text-slate-300"}`}
              type="button"
              onClick={() => setMode("signin")}
            >
              Entrar
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm font-black ${mode === "signup" ? "bg-white text-slate-950" : "text-slate-300"}`}
              type="button"
              onClick={() => setMode("signup")}
            >
              Cadastrar
            </button>
          </div>

          {mode === "signup" && (
            <label className="mb-3 block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Nome</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-2 block text-sm font-bold text-slate-300">Email</span>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-slate-300">Senha</span>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={6} />
          </label>

          {!isSupabaseConfigured && (
            <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">
              Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env da raiz.
            </p>
          )}

          {message && <p className="mb-4 rounded-xl bg-white/10 p-3 text-sm font-bold text-slate-100">{message}</p>}

          <button className="soft-button w-full bg-teal-300 text-slate-950" type="submit" disabled={loading || !isSupabaseConfigured}>
            {mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? "Aguarde" : mode === "signup" ? "Criar conta" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
