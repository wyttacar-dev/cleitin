import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BarChart3, LogOut, MessageCircle, Moon, Palette, RotateCcw, ShoppingBag, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { chargeStyles, pickPhrase, pickSmartPhrase } from "./data/phrases";
import { getAccessoryById } from "./data/accessories";
import { getPetById } from "./data/pets";
import { getThemeById } from "./data/themes";
import { generateDailyPlan } from "./services/aiService";
import { applyReminderClarification, interpretReminderFromMessage, isCompletionMessage } from "./services/reminderInterpreter";
import { loadMemory, updateMemory, updateProductivityMemory } from "./services/memoryService";
import { getCurrentMinutes, getTodayKey, minutesFromTime } from "./utils/day";
import { defaultCustomization, mergeCustomization } from "./utils/storage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getTaskStatus, useNotifications } from "./hooks/useNotifications";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Onboarding } from "./components/Onboarding";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { InstallButton } from "./components/InstallButton";
import { FocusMode } from "./components/FocusMode";
import { DailyChat, createInitialDailyChat } from "./components/DailyChat";
import { DaySummary } from "./components/DaySummary";
import { PetDisplay } from "./components/PetDisplay";
import { CustomizationPanel } from "./components/CustomizationPanel";
import { Shop } from "./components/Shop";
import { WhatsappCrm } from "./components/WhatsappCrm";
import { Login } from "./pages/Login";
import { getSession, onAuthStateChange, signOut } from "./services/authService";
import { getAiHealth } from "./services/chatService";
import { list as listClientRecords } from "./services/clientService";
import { list as listSimulationRecords } from "./services/simulationService";
import { getSettingsMap, upsertSetting } from "./services/settingsService";

const cloudSettingKeys = [
  "pet-cobrador-profile",
  "pet-cobrador-tasks",
  "cleitin-daily-memory",
  "cleitin-customization",
  "cleitin-wallet-xp",
];

const starterTasks = [];

function makeTask(title, time = "", options = {}) {
  return {
    id: crypto.randomUUID(),
    title,
    time,
    priority: options.priority || "media",
    category: options.category || "rotina",
    completed: false,
    status: "pendente",
    date: getTodayKey(),
    source: options.source || "manual",
    createdAt: Date.now(),
    completedAt: null,
    lastUpcomingDate: null,
    lastNotificationDate: null,
    lastNotificationAt: null,
    reminderEnabled: Boolean(options.reminderEnabled),
    repeatUntilDone: Boolean(options.repeatUntilDone),
    repeatIntervalMinutes: options.repeatIntervalMinutes || 30,
    lastReminderAt: options.lastReminderAt || null,
    reminderCount: options.reminderCount || 0,
    createdByChat: Boolean(options.createdByChat),
    originalMessage: options.originalMessage || "",
  };
}

function makeTasksFromProfile(profile) {
  return profile.fixedTasks
    .map((title) => title.trim())
    .filter(Boolean)
    .map((title) => makeTask(title, "", { category: "rotina", source: "perfil" }));
}

function makeDailyMemory() {
  return {
      current: {
      date: getTodayKey(),
      checkIn: {
        active: false,
        step: 0,
        planned: false,
        answers: {},
      },
      pendingReminder: null,
      messages: createInitialDailyChat(),
      summaryShown: false,
    },
    history: [],
  };
}

function makeMessage(role, text) {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: Date.now(),
  };
}

function styleFromAnswer(answer) {
  const text = answer.toLowerCase();
  if (text.includes("ignorante")) return "ignorante";
  if (text.includes("acida") || text.includes("acido") || text.includes("ácida") || text.includes("ácido")) return "acido";
  if (text.includes("motiv")) return "motivador";
  if (text.includes("leve")) return "leve";
  return null;
}

function timeFromAnswer(answer) {
  const match = answer.match(/\b([01]?\d|2[0-3])(?:[:h](\d{2}))?\b/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2] ?? "00"}`;
}

function normalizeMood(mood) {
  const map = {
    feliz: "happy",
    neutro: "neutral",
    bravo: "angry",
    irritado: "angry",
    debochado: "debochado",
    decepcionado: "disappointed",
    animado: "excited",
    happy: "happy",
    neutral: "neutral",
    angry: "angry",
    disappointed: "disappointed",
    excited: "excited",
  };
  return map[mood] || null;
}

function buildReminderConfirmation(task) {
  const repeat = task.repeatUntilDone
    ? ` e vou te cobrar a cada ${task.repeatIntervalMinutes} minutos ate voce concluir`
    : "";
  const time = task.time ? ` para ${task.time}` : "";
  return `Fechado. Criei o lembrete "${task.title}"${time}${repeat}. Se enrolar, eu vou saber.`;
}

export default function App() {
  const [profile, setProfile] = useLocalStorage("pet-cobrador-profile", null);
  const [tasks, setTasks] = useLocalStorage("pet-cobrador-tasks", starterTasks);
  const [dailyMemory, setDailyMemory] = useLocalStorage("cleitin-daily-memory", makeDailyMemory());
  const [customizationRaw, setCustomizationRaw] = useLocalStorage("cleitin-customization", defaultCustomization);
  const [walletXp, setWalletXp] = useLocalStorage("cleitin-wallet-xp", 150);
  const [screen, setScreen] = useState(profile ? "dashboard" : "welcome");
  const [activePage, setActivePage] = useState("dashboard");
  const [focusMode, setFocusMode] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [lastOpenAt, setLastOpenAt] = useState(Date.now());
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [isPetTyping, setIsPetTyping] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [aiMood, setAiMood] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [cloudCounts, setCloudCounts] = useState({ clients: 0, simulations: 0 });

  const customization = useMemo(() => mergeCustomization(customizationRaw), [customizationRaw]);
  const activePet = useMemo(() => getPetById(customization.selectedPet), [customization.selectedPet]);
  const activeTheme = useMemo(() => getThemeById(customization.selectedTheme), [customization.selectedTheme]);
  const themeVars = useMemo(() => ({
    "--theme-background": activeTheme.background,
    "--theme-card": activeTheme.card,
    "--theme-card-strong": activeTheme.cardStrong,
    "--theme-border": activeTheme.border,
    "--theme-text": activeTheme.text,
    "--theme-muted": activeTheme.muted,
    "--theme-accent": activeTheme.accent,
    "--theme-button": activeTheme.button,
    "--theme-button-text": activeTheme.buttonText,
  }), [activeTheme]);

  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};

    getSession()
      .then((currentSession) => {
        if (alive) setSession(currentSession);
      })
      .catch((error) => {
        if (alive) setCloudError(error.message || "Configure o Supabase para usar login e nuvem.");
      })
      .finally(() => {
        if (alive) setAuthLoading(false);
      });

    try {
      unsubscribe = onAuthStateChange((nextSession) => {
        setSession(nextSession);
        setCloudHydrated(false);
        setAuthLoading(false);
      });
    } catch {
      // The login screen will show the missing Supabase configuration.
    }

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setCloudHydrated(false);
      return;
    }

    let alive = true;
    setCloudError("");

    getSettingsMap(cloudSettingKeys)
      .then((settings) => {
        if (!alive) return;

        if (Object.prototype.hasOwnProperty.call(settings, "pet-cobrador-profile")) {
          setProfile(settings["pet-cobrador-profile"]);
          setScreen(settings["pet-cobrador-profile"] ? "dashboard" : "welcome");
        }
        if (Object.prototype.hasOwnProperty.call(settings, "pet-cobrador-tasks")) setTasks(settings["pet-cobrador-tasks"] || []);
        if (Object.prototype.hasOwnProperty.call(settings, "cleitin-daily-memory")) setDailyMemory(settings["cleitin-daily-memory"] || makeDailyMemory());
        if (Object.prototype.hasOwnProperty.call(settings, "cleitin-customization")) setCustomizationRaw(settings["cleitin-customization"] || defaultCustomization);
        if (Object.prototype.hasOwnProperty.call(settings, "cleitin-wallet-xp")) setWalletXp(settings["cleitin-wallet-xp"] ?? 150);
      })
      .catch((error) => {
        if (alive) setCloudError(error.message || "Nao foi possivel carregar dados do Supabase. Usando dados locais.");
      })
      .finally(() => {
        if (alive) setCloudHydrated(true);
      });

    return () => {
      alive = false;
    };
  }, [session?.user?.id, setProfile, setTasks, setDailyMemory, setCustomizationRaw, setWalletXp]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    const timeout = window.setTimeout(() => {
      upsertSetting("pet-cobrador-profile", profile).catch((error) => setCloudError(error.message || "Falha ao salvar perfil na nuvem."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudHydrated, profile]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    const timeout = window.setTimeout(() => {
      upsertSetting("pet-cobrador-tasks", tasks).catch((error) => setCloudError(error.message || "Falha ao salvar tarefas na nuvem."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudHydrated, tasks]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    const timeout = window.setTimeout(() => {
      upsertSetting("cleitin-daily-memory", dailyMemory).catch((error) => setCloudError(error.message || "Falha ao salvar memoria diaria na nuvem."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudHydrated, dailyMemory]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    const timeout = window.setTimeout(() => {
      upsertSetting("cleitin-customization", customizationRaw).catch((error) => setCloudError(error.message || "Falha ao salvar personalizacao na nuvem."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudHydrated, customizationRaw]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    const timeout = window.setTimeout(() => {
      upsertSetting("cleitin-wallet-xp", walletXp).catch((error) => setCloudError(error.message || "Falha ao salvar XP na nuvem."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudHydrated, walletXp]);

  useEffect(() => {
    if (!session?.user?.id || !cloudHydrated) return;
    let alive = true;

    Promise.all([listClientRecords(), listSimulationRecords()])
      .then(([clients, simulations]) => {
        if (alive) setCloudCounts({ clients: clients.length, simulations: simulations.length });
      })
      .catch((error) => {
        if (alive) setCloudError(error.message || "Nao foi possivel carregar dados comerciais da nuvem.");
      });

    return () => {
      alive = false;
    };
  }, [session?.user?.id, cloudHydrated]);

  useEffect(() => {
    const now = Date.now();
    localStorage.setItem("cleitin-last-open", String(now));
    setLastOpenAt(now);
  }, []);

  useEffect(() => {
    let alive = true;
    async function checkHealth() {
      try {
        const health = await getAiHealth();
        if (alive) {
          setAiOnline(Boolean(health.ok && health.groqConfigured));
        }
      } catch {
        if (alive) {
          setAiOnline(false);
        }
      }
    }
    checkHealth();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const today = getTodayKey();
    if (dailyMemory?.current?.date === today) return;

    setDailyMemory((memory) => {
      const previous = memory?.current;
      const history = previous
        ? [{ ...previous, archivedAt: Date.now() }, ...(memory?.history || [])].slice(0, 7)
        : memory?.history || [];
      return {
        current: {
          date: today,
          checkIn: { active: false, step: 0, planned: false, answers: {} },
          pendingReminder: null,
          messages: createInitialDailyChat(),
          summaryShown: false,
        },
        history,
      };
    });
  }, [dailyMemory?.current?.date, setDailyMemory]);

  const updateTask = useCallback((id, patch) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...patch } : task))
    );
  }, [setTasks]);

  const notifications = useNotifications(tasks, profile, updateTask, {
    lastOpenAt,
    petType: customization.selectedPet,
  });

  const todayTasks = useMemo(
    () => tasks.filter((task) => !task.date || task.date === getTodayKey()),
    [tasks]
  );

  const stats = useMemo(() => {
    const completed = todayTasks.filter((task) => task.completed).length;
    const overdue = todayTasks.filter((task) => getTaskStatus(task) === "atrasada").length;
    const total = todayTasks.length;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    const xp = completed * 25 + Math.max(progress - overdue * 5, 0);
    return { completed, overdue, total, progress, xp };
  }, [todayTasks]);

  const streakActive = stats.completed >= 3 && !stats.overdue;
  const petMood = stats.overdue
    ? "disappointed"
    : streakActive
      ? "excited"
      : stats.total && stats.progress >= 80
        ? "happy"
        : stats.total && stats.progress < 40
          ? "angry"
          : "neutral";
  const displayedMood = aiMood && !stats.overdue ? aiMood : petMood;
  const petLine = stats.overdue
    ? pickSmartPhrase(stats.overdue > 2 ? "multipleOverdue" : "overdue", profile?.chargeStyle)
    : activePet.phrases?.[displayedMood] || activePet.phrases?.[petMood] || pickPhrase(profile?.chargeStyle, stats.completed + stats.overdue + stats.total);

  useEffect(() => {
    updateProductivityMemory({ tasks: todayTasks, profile, dailyMemory });
  }, [todayTasks, profile, dailyMemory]);

  useEffect(() => {
    const endTime = dailyMemory?.current?.checkIn?.answers?.endTime || profile?.sleepTime;
    if (!endTime || dailyMemory?.current?.summaryShown) return;
    if (getCurrentMinutes() < minutesFromTime(endTime)) return;

    setSummaryOpen(true);
    setDailyMemory((memory) => ({
      ...memory,
      current: {
        ...memory.current,
        summaryShown: true,
      },
    }));
  }, [dailyMemory, profile?.sleepTime, setDailyMemory]);

  function finishOnboarding(nextProfile) {
    setProfile(nextProfile);
    setTasks((current) => [...current, ...makeTasksFromProfile(nextProfile)]);
    setScreen("dashboard");
  }

  function addTask(task) {
    setTasks((current) => [makeTask(task.title, task.time, task), ...current]);
  }

  function addReminderTask(reminder) {
    const task = makeTask(reminder.title, reminder.time, {
      priority: reminder.priority || "media",
      category: reminder.category || "rotina",
      source: "chat",
      reminderEnabled: true,
      repeatUntilDone: Boolean(reminder.repeatUntilDone),
      repeatIntervalMinutes: reminder.repeatIntervalMinutes || 30,
      lastReminderAt: null,
      reminderCount: 0,
      createdByChat: true,
      originalMessage: reminder.originalMessage,
    });
    setTasks((current) => [task, ...current]);
    return task;
  }

  function addGeneratedTasks(generatedTasks) {
    if (!generatedTasks.length) return;
    setTasks((current) => [
      ...generatedTasks.map((task) => makeTask(task.title, task.time, task)),
      ...current,
    ]);
  }

  function notifyCompletion(task) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("Cleitin aprovou", {
      body: `${pickSmartPhrase("completed", profile?.chargeStyle)} "${task.title}"`,
      icon: "/pet-icon.svg",
      tag: `completed-${task.id}`,
    });
  }

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const willComplete = !task.completed;
    updateTask(id, {
      completed: willComplete,
      status: willComplete ? "concluida" : "pendente",
      completedAt: willComplete ? Date.now() : null,
    });
    if (willComplete) {
      setWalletXp((current) => current + 25);
      if (customization.visualEffects.bounceOnComplete) {
        setCelebrationKey((current) => current + 1);
      }
      notifyCompletion(task);
    }
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function resetToday() {
    setTasks((current) =>
      current.map((task) => ({
        ...task,
        completed: false,
        status: "pendente",
        completedAt: null,
        lastUpcomingDate: null,
        lastNotificationDate: null,
        lastNotificationAt: null,
      }))
    );
  }

  function startPlanning() {
    setDailyMemory((memory) => ({
      ...memory,
      current: {
        ...memory.current,
        checkIn: { active: true, step: 0, planned: false, answers: {} },
        messages: [...memory.current.messages, makeMessage("pet", "Fechado. Vamos planejar. Bom dia, o que voce precisa resolver hoje?")],
      },
    }));
  }

  function updateCheckInAnswer(key, value) {
    setDailyMemory((memory) => ({
      ...memory,
      current: {
        ...memory.current,
        checkIn: {
          ...memory.current.checkIn,
          answers: {
            ...memory.current.checkIn.answers,
            [key]: value,
          },
        },
      },
    }));
  }

  function equipPet(petId) {
    if (!customization.unlockedPets.includes(petId)) return;
    setCustomizationRaw((current) => ({
      ...mergeCustomization(current),
      selectedPet: petId,
    }));
  }

  function equipAccessory(category, accessoryId) {
    if (accessoryId && !customization.unlockedAccessories.includes(accessoryId)) return;
    setCustomizationRaw((current) => {
      const merged = mergeCustomization(current);
      return {
        ...merged,
        equippedAccessories: {
          ...merged.equippedAccessories,
          [category]: accessoryId,
        },
      };
    });
  }

  function equipTheme(themeId) {
    if (!customization.unlockedThemes.includes(themeId)) return;
    setCustomizationRaw((current) => ({
      ...mergeCustomization(current),
      selectedTheme: themeId,
    }));
  }

  function toggleVisualEffect(effectId) {
    setCustomizationRaw((current) => {
      const merged = mergeCustomization(current);
      return {
        ...merged,
        visualEffects: {
          ...merged.visualEffects,
          [effectId]: !merged.visualEffects[effectId],
        },
      };
    });
  }

  function updateRobotColors(patch) {
    setCustomizationRaw((current) => {
      const merged = mergeCustomization(current);
      return {
        ...merged,
        robotColors: {
          ...merged.robotColors,
          ...patch,
        },
      };
    });
  }

  function buyItem(type, item) {
    const merged = customization;
    const unlockKey = type === "pet" ? "unlockedPets" : type === "accessory" ? "unlockedAccessories" : "unlockedThemes";
    if (merged[unlockKey].includes(item.id)) {
      return { ok: true, message: "Item ja desbloqueado." };
    }
    if (walletXp < item.cost) {
      return { ok: false, message: "XP insuficiente, vai trabalhar primeiro." };
    }

    setWalletXp((current) => current - item.cost);
    setCustomizationRaw((current) => {
      const next = mergeCustomization(current);
      const updated = {
        ...next,
        [unlockKey]: [...next[unlockKey], item.id],
      };
      if (type === "accessory") {
        updated.equippedAccessories = {
          ...next.equippedAccessories,
          glasses: item.id,
        };
      }
      return updated;
    });
    return { ok: true, message: type === "accessory" ? `${item.name} comprado e equipado.` : `${item.name} desbloqueado. Agora sim, luxo produtivo.` };
  }

  async function sendChatMessage(text, question) {
    const userMessage = makeMessage("user", text);
    setIsPetTyping(true);

    try {
      let nextPetMessages = [];
      let generatedTasks = [];
      const pendingReminder = dailyMemory?.current?.pendingReminder;

      if (!question && isCompletionMessage(text)) {
        const latestPending = todayTasks.find((task) => !task.completed);
        if (!latestPending) {
          setDailyMemory((memory) => ({
            ...memory,
            current: {
              ...memory.current,
              messages: [...memory.current.messages, userMessage, makeMessage("pet", "Boa. Mas nao achei tarefa pendente pra marcar como feita. Milagre organizado ou sumiu tudo?")],
            },
          }));
          return;
        }

        updateTask(latestPending.id, {
          completed: true,
          status: "concluida",
          completedAt: Date.now(),
          reminderEnabled: false,
        });
        setWalletXp((current) => current + 25);
        setCelebrationKey((current) => current + 1);
        notifyCompletion(latestPending);
        setDailyMemory((memory) => ({
          ...memory,
          current: {
            ...memory.current,
            messages: [...memory.current.messages, userMessage, makeMessage("pet", `Milagre. "${latestPending.title}" concluida. O Cleitin ate piscou de orgulho.`)],
          },
        }));
        return;
      }

      if (!question && pendingReminder) {
        const reminder = applyReminderClarification(pendingReminder, text);
        if (reminder.needsClarification) {
          const clarification = reminder.missing.title
            ? "Beleza, mas qual e o nome da tarefa?"
            : "Beleza, mas que horas eu começo a te cobrar isso?";
          setDailyMemory((memory) => ({
            ...memory,
            current: {
              ...memory.current,
              pendingReminder: reminder,
              messages: [...memory.current.messages, userMessage, makeMessage("pet", clarification)],
            },
          }));
          return;
        }

        const task = addReminderTask(reminder);
        setDailyMemory((memory) => ({
          ...memory,
          current: {
            ...memory.current,
            pendingReminder: null,
            messages: [...memory.current.messages, userMessage, makeMessage("pet", buildReminderConfirmation(task))],
          },
        }));
        return;
      }

      if (!question) {
        const reminder = interpretReminderFromMessage(text);
        if (reminder.hasIntent) {
          if (reminder.needsClarification) {
            const clarification = reminder.missing.title
              ? "Fechado, mas qual e o nome da tarefa que eu vou te cobrar?"
              : "Beleza, mas que horas eu começo a te cobrar isso?";
            setDailyMemory((memory) => ({
              ...memory,
              current: {
                ...memory.current,
                pendingReminder: reminder,
                messages: [...memory.current.messages, userMessage, makeMessage("pet", clarification)],
              },
            }));
            return;
          }

          const task = addReminderTask(reminder);
          setDailyMemory((memory) => ({
            ...memory,
            current: {
              ...memory.current,
              pendingReminder: null,
              messages: [...memory.current.messages, userMessage, makeMessage("pet", buildReminderConfirmation(task))],
            },
          }));
          return;
        }
      }

      if (question) {
        const answerKey = question.key;
        const answers = {
          ...dailyMemory.current.checkIn.answers,
          [answerKey]: text,
        };
        const nextStep = dailyMemory.current.checkIn.step + 1;
        const pickedStyle = answerKey === "chargeStyle" ? styleFromAnswer(text) : null;
        const pickedEndTime = answerKey === "endTime" ? timeFromAnswer(text) : null;

        if (pickedStyle) {
          setProfile((current) => ({ ...current, chargeStyle: pickedStyle }));
          answers.chargeStyle = pickedStyle;
        }
        if (pickedEndTime) answers.endTime = pickedEndTime;

        if (nextStep >= 6) {
          const combined = Object.values(answers).join(". ");
          const plan = await generateDailyPlan(
            combined,
            { ...profile, chargeStyle: answers.chargeStyle || profile?.chargeStyle },
            {
              tasks: todayTasks,
              mood: displayedMood,
              petType: customization.selectedPet,
              memory: loadMemory(),
            }
          );
          generatedTasks = plan.tasks;
          addGeneratedTasks(generatedTasks);
          if (plan.mood) setAiMood(normalizeMood(plan.mood));
          updateMemory((memory) => ({
            ...memory,
            procrastinations: answers.procrastinated
              ? [answers.procrastinated, ...(memory.procrastinations || [])].slice(0, 10)
              : memory.procrastinations,
            lastProductivityAnalysis: plan.productivityAnalysis,
          }));
          nextPetMessages = [
            makeMessage("pet", plan.reply),
            makeMessage("pet", generatedTasks.length ? "Pronto. Tarefas criadas, horarios encaixados e julgamento programado." : "Nao consegui montar tarefas claras. Me manda com acao e horario que eu organizo."),
          ];
          setDailyMemory((memory) => ({
            ...memory,
            current: {
              ...memory.current,
                checkIn: {
                  active: false,
                  step: 6,
                  planned: true,
                  answers,
              },
              messages: [...memory.current.messages, userMessage, ...nextPetMessages],
            },
          }));
          return;
        }

        const questions = [
          "Bom dia, o que voce precisa resolver hoje?",
          "Qual e a tarefa mais importante do dia?",
          "Tem algum compromisso com horario marcado?",
          "Tem algo que voce esta enrolando ha dias?",
          "Que horas voce quer encerrar o dia?",
          "Quer cobranca leve, motivadora, acida ou ignorante engracada hoje?",
        ];
        nextPetMessages = [makeMessage("pet", questions[nextStep])];
        setDailyMemory((memory) => ({
          ...memory,
          current: {
            ...memory.current,
              checkIn: {
                active: true,
                step: nextStep,
                planned: false,
                answers,
            },
            messages: [...memory.current.messages, userMessage, ...nextPetMessages],
          },
        }));
        return;
      }

      const plan = await generateDailyPlan(text, profile, {
        tasks: todayTasks,
        mood: displayedMood,
        petType: customization.selectedPet,
        memory: loadMemory(),
      });
      generatedTasks = plan.tasks;
      addGeneratedTasks(generatedTasks);
      if (plan.mood) setAiMood(normalizeMood(plan.mood));
      updateMemory((memory) => ({
        ...memory,
        lastProductivityAnalysis: plan.productivityAnalysis,
      }));
      nextPetMessages = [
        makeMessage("pet", plan.reply),
        ...(generatedTasks.length ? [makeMessage("pet", "Adicionei essas tarefas na lista de hoje.")] : []),
      ];

      setDailyMemory((memory) => ({
        ...memory,
        current: {
          ...memory.current,
          messages: [...memory.current.messages, userMessage, ...nextPetMessages],
        },
      }));
    } catch (error) {
      setAiOnline(false);
      setDailyMemory((memory) => ({
        ...memory,
        current: {
          ...memory.current,
          messages: [
            ...memory.current.messages,
            userMessage,
            makeMessage("pet", error.message || "A IA do Cleitin caiu. Confere o backend e a chave da Groq."),
          ],
        },
      }));
    } finally {
      setIsPetTyping(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setSession(null);
      setCloudHydrated(false);
    } catch (error) {
      setCloudError(error.message || "Nao foi possivel sair.");
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center shadow-glow">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-200">Cleitin Cobrancas</p>
          <p className="mt-2 text-2xl font-black">Carregando sessao...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <Login onAuthChange={setSession} />;
  }

  if (screen === "welcome") {
    return <WelcomeScreen onStart={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return <Onboarding onFinish={finishOnboarding} />;
  }

  if (focusMode) {
    return (
      <FocusMode
        tasks={todayTasks}
        onExit={() => setFocusMode(false)}
        onToggle={toggleTask}
        petId={customization.selectedPet}
        accessories={customization.equippedAccessories}
        visualEffects={customization.visualEffects}
        robotColors={customization.robotColors}
      />
    );
  }

  return (
    <main className="app-shell px-4 py-5 sm:px-6 lg:px-8" style={themeVars}>
      <nav className="mx-auto mb-5 flex max-w-7xl flex-wrap items-center gap-2 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-2 backdrop-blur-2xl">
        <NavButton active={activePage === "dashboard"} icon={Sparkles} label="Dashboard" onClick={() => setActivePage("dashboard")} />
        <NavButton active={activePage === "crm"} icon={MessageCircle} label="CRM WhatsApp" onClick={() => setActivePage("crm")} />
        <NavButton active={activePage === "customize"} icon={Palette} label="Personalizar" onClick={() => setActivePage("customize")} />
        <NavButton active={activePage === "shop"} icon={ShoppingBag} label="Loja" onClick={() => setActivePage("shop")} />
        <div className="ml-auto rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] px-4 py-2 text-sm font-black text-[var(--theme-text)]">
          {walletXp} XP
        </div>
        <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] px-4 py-2 text-xs font-black text-[var(--theme-muted)]">
          Nuvem: {cloudCounts.clients} clientes / {cloudCounts.simulations} simulacoes
        </div>
        <button className="soft-button bg-white text-slate-950" onClick={handleSignOut}>
          <LogOut size={18} />
          Sair
        </button>
      </nav>
      {cloudError && (
        <div className="mx-auto mb-5 max-w-7xl rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
          {cloudError}
        </div>
      )}
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.88fr_1.5fr]">
        <section className="glass rounded-2xl p-5 sm:p-6 lg:sticky lg:top-5 lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">Cleitin Cobrancas</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Oi, {profile?.name || "produtivo"}.</h1>
            </div>
            <InstallButton />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[170px_1fr] lg:grid-cols-1">
            <PetDisplay
              petId={customization.selectedPet}
              mood={displayedMood}
              accessories={customization.equippedAccessories}
              visualEffects={customization.visualEffects}
              robotColors={customization.robotColors}
              celebrationKey={celebrationKey}
            />
            <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
              <p className="text-sm text-[var(--theme-muted)]">{activePet.name} diz:</p>
              <p className="mt-2 text-xl font-black leading-tight text-amber-200">"{petLine}"</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                <span className="rounded-full bg-teal-300/15 px-3 py-1 text-teal-100">{activePet.name}</span>
                <span className="rounded-full bg-teal-300/15 px-3 py-1 text-teal-100">Modo {chargeStyles[profile?.chargeStyle]?.label}</span>
                <span className="rounded-full bg-amber-300/15 px-3 py-1 text-amber-100">{profile?.wakeTime} - {dailyMemory?.current?.checkIn?.answers?.endTime || profile?.sleepTime}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Metric icon={Trophy} label="XP" value={walletXp} />
            <Metric icon={Target} label="Feitas" value={`${stats.completed}/${stats.total}`} />
            <Metric icon={Zap} label="Hoje" value={`${stats.progress}%`} />
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Produtividade</span>
              <span className="text-[var(--theme-accent)]">{stats.progress}%</span>
            </div>
            <div className="mt-3 h-4 rounded-full bg-slate-950/40 p-1">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.progress}%`, background: `linear-gradient(90deg, ${activeTheme.accent}, ${activePet.mainColor})` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--theme-muted)]">Oculos equipado</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
              {customization.equippedAccessories.glasses ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[var(--theme-text)]">
                  {getAccessoryById(customization.equippedAccessories.glasses)?.name}
                </span>
              ) : (
                <span className="text-[var(--theme-muted)]">Sem oculos</span>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button
              className="soft-button bg-[var(--theme-button)] text-[var(--theme-button-text)]"
              onClick={notifications.requestPermission}
              disabled={notifications.permission === "granted"}
            >
              <Bell size={18} />
              {notifications.permission === "granted"
                ? "Notificacoes ativas"
                : notifications.permission === "denied"
                  ? "Notificacoes bloqueadas"
                  : "Ativar lembretes"}
            </button>
            {notifications.error && (
              <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-100">
                {notifications.error}
              </p>
            )}
            <button className="soft-button bg-amber-300" onClick={() => setFocusMode(true)}>
              <Moon size={18} />
              Modo foco
            </button>
            <button className="soft-button bg-white text-slate-950" onClick={() => setSummaryOpen(true)}>
              <BarChart3 size={18} />
              Resumo do dia
            </button>
          </div>
        </section>

        {activePage === "dashboard" && (
          <section className="space-y-5">
            <DailyChat
              messages={dailyMemory?.current?.messages || []}
              checkIn={dailyMemory?.current?.checkIn || { step: 0, planned: false, answers: {} }}
              onSend={sendChatMessage}
              onStartPlanning={startPlanning}
              onUpdateCheckIn={updateCheckInAnswer}
              isTodayPlanned={dailyMemory?.current?.checkIn?.planned}
              isLoading={isPetTyping}
              aiOnline={aiOnline}
            />

            <div className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
                    <Sparkles size={16} />
                    Ranking do dia
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Missoes de hoje</h2>
                </div>
                <button className="soft-button bg-white text-slate-950" onClick={resetToday}>
                  <RotateCcw size={18} />
                  Reiniciar
                </button>
              </div>
              <TaskForm onAdd={addTask} />
            </div>

            <TaskList
              tasks={todayTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          </section>
        )}

        {activePage === "customize" && (
          <CustomizationPanel
            customization={customization}
            activePet={activePet}
            petMood={displayedMood}
            walletXp={walletXp}
            onEquipPet={equipPet}
            onEquipAccessory={equipAccessory}
            onEquipTheme={equipTheme}
            onToggleVisualEffect={toggleVisualEffect}
            onUpdateRobotColors={updateRobotColors}
          />
        )}

        {activePage === "crm" && (
          <WhatsappCrm
            profile={profile}
            notifications={notifications}
          />
        )}

        {activePage === "shop" && (
          <Shop
            customization={customization}
            walletXp={walletXp}
            onBuy={buyItem}
          />
        )}
      </div>

      <DaySummary
        open={summaryOpen}
        tasks={todayTasks}
        profile={profile}
        onClose={() => setSummaryOpen(false)}
      />
    </main>
  );
}

function NavButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
        active
          ? "bg-[var(--theme-button)] text-[var(--theme-button-text)]"
          : "text-[var(--theme-muted)] hover:bg-white/10"
      }`}
      onClick={onClick}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-3">
      <Icon className="text-[var(--theme-accent)]" size={18} />
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--theme-muted)]">{label}</p>
      <p className="text-xl font-black text-[var(--theme-text)]">{value}</p>
    </div>
  );
}
