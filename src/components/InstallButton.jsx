import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <button
      className="rounded-xl border border-white/10 bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:opacity-40"
      onClick={install}
      disabled={!prompt || installed}
      aria-label="Instalar como app"
      title={installed ? "App instalado" : "Instalar como app"}
    >
      <Download size={20} />
    </button>
  );
}
