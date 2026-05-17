import React, { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

function isIosDevice() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const onPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const onDisplayModeChange = () => setInstalled(isStandalone());

    setIsIos(isIosDevice());
    setInstalled(isStandalone());

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener?.("change", onDisplayModeChange);
    };
  }, []);

  async function install() {
    if (isIos && !installed) {
      setShowIosHelp((current) => !current);
      return;
    }

    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (installed) return null;

  return (
    <div className="relative">
      <button
        className="rounded-xl border border-white/10 bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:opacity-40"
        onClick={install}
        disabled={!isIos && !prompt}
        aria-label="Instalar app"
        title="Instalar app"
      >
        {isIos ? <Share size={20} /> : <Download size={20} />}
      </button>

      {isIos && showIosHelp && (
        <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm font-semibold leading-relaxed text-white shadow-2xl backdrop-blur">
          Abra no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.
        </div>
      )}
    </div>
  );
}
