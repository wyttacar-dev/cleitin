import { useEffect, useMemo, useState } from "react";
import { sendMessageToPet } from "../services/chatService";
import { loadMemory } from "../services/memoryService";
import { getCurrentMinutes, getTodayKey, minutesFromTime } from "../utils/day";

const MINUTE = 60 * 1000;
const OVERDUE_REPEAT = 10 * MINUTE;
const UPCOMING_WINDOW = 5;
const INACTIVE_REPEAT = 3 * 60 * 60 * 1000;

export function getTaskStatus(task) {
  if (task.completed) return "concluida";
  if (!task.time) return "pendente";
  return getCurrentMinutes() > minutesFromTime(task.time) ? "atrasada" : "pendente";
}

async function buildAiNotification({ task, type, profile, tasks, mood, petType }) {
  const intent = {
    upcoming: `Crie uma notificacao curta avisando que a tarefa "${task?.title}" esta perto do horario ${task?.time}.`,
    overdue: `Crie uma cobranca curta porque a tarefa "${task?.title}" atrasou. Horario previsto: ${task?.time}.`,
    multipleOverdue: "Crie uma cobranca curta porque varias tarefas do usuario estao atrasadas.",
    inactive: "Crie uma chamada curta porque o usuario ficou muito tempo sem abrir o app e ainda tem tarefas pendentes.",
  };

  const result = await sendMessageToPet({
    message: intent[type],
    userProfile: profile,
    tasks,
    mood,
    petType,
    memory: loadMemory(),
  });

  return result.reply;
}

function buildFallbackNotification({ task, type }) {
  const messages = {
    upcoming: `Sua tarefa "${task?.title}" esta chegando no horario.`,
    overdue: `A tarefa "${task?.title}" atrasou. Bora resolver isso agora.`,
    multipleOverdue: "Voce tem varias tarefas atrasadas. Escolhe uma e comeca por ela.",
    inactive: "Tem tarefa pendente te esperando. Abre o app e fecha pelo menos uma.",
  };

  return messages[type] || "Voce tem uma tarefa pendente.";
}

async function notifyTask(task, type, profile, tasks, mood, petType) {
  let body = buildFallbackNotification({ task, type });

  try {
    body = await buildAiNotification({ task, type, profile, tasks, mood, petType });
  } catch {
    // Keep reminders working even when the local AI backend is unavailable.
  }

  new Notification(type === "overdue" ? "Cleitin esta te julgando" : "Cleitin Cobrancas", {
    body,
    icon: "/pet-icon.svg",
    tag: `${type}-${task.id}`,
  });
}

function buildRecurringReminderMessage(task) {
  const count = Number(task.reminderCount || 0);
  if (count <= 0) return `So lembrando: ${task.title}.`;
  if (count === 1) return `Essa tarefa ainda ta pendente. Vai resolver ou vai criar raiz?`;
  return `Meu parceiro, "${task.title}" ja virou patrimonio historico. Faz logo.`;
}

export function useNotifications(tasks, profile, updateTask, options = {}) {
  const [permission, setPermission] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [error, setError] = useState("");

  const canNotify = permission === "granted" && window.isSecureContext;

  async function requestPermission() {
    setError("");

    if (!("Notification" in window)) {
      setPermission("unsupported");
      setError("Este navegador nao suporta notificacoes.");
      return;
    }

    if (!window.isSecureContext) {
      setError("Notificacoes so funcionam em HTTPS ou localhost.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        new Notification("Notificacoes ativadas", {
          body: "Pronto. O Cleitin ja pode te cobrar quando tiver tarefa no horario.",
          icon: "/pet-icon.svg",
          tag: "notifications-enabled",
        });
      } else if (result === "denied") {
        setError("As notificacoes estao bloqueadas no navegador. Libere nas configuracoes do site.");
      }
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel ativar notificacoes.");
    }
  }

  useEffect(() => {
    if (!("Notification" in window)) return undefined;

    const syncPermission = () => setPermission(Notification.permission);
    window.addEventListener("focus", syncPermission);
    document.addEventListener("visibilitychange", syncPermission);

    return () => {
      window.removeEventListener("focus", syncPermission);
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  useEffect(() => {
    if (!canNotify) return undefined;

    const checkTasks = async () => {
      const now = Date.now();
      const today = getTodayKey();
      const minuteNow = getCurrentMinutes();
      const pendingTasks = tasks.filter((task) => !task.completed);
      const overdueTasks = pendingTasks.filter((task) => task.time && minuteNow > minutesFromTime(task.time));

      if (overdueTasks.length >= 3) {
        const lastMultiple = Number(localStorage.getItem("cleitin-last-multiple-overdue") || 0);
        if (now - lastMultiple >= OVERDUE_REPEAT) {
          try {
            const body = await buildAiNotification({
              type: "multipleOverdue",
              profile,
              tasks,
              mood: options?.mood || "decepcionado",
              petType: options?.petType || "cleitin",
            });
            new Notification("Cleitin esta ficando sem paciencia", {
              body,
              icon: "/pet-icon.svg",
              tag: "multiple-overdue",
            });
            localStorage.setItem("cleitin-last-multiple-overdue", String(now));
          } catch {
            new Notification("Cleitin esta ficando sem paciencia", {
              body: buildFallbackNotification({ type: "multipleOverdue" }),
              icon: "/pet-icon.svg",
              tag: "multiple-overdue",
            });
            localStorage.setItem("cleitin-last-multiple-overdue", String(now));
          }
        }
      }

      const lastOpen = Number(localStorage.getItem("cleitin-last-open") || now);
      const lastInactive = Number(localStorage.getItem("cleitin-last-inactive-notification") || 0);
      if (pendingTasks.length && now - lastOpen >= INACTIVE_REPEAT && now - lastInactive >= INACTIVE_REPEAT) {
        try {
          const body = await buildAiNotification({
            type: "inactive",
            profile,
            tasks,
            mood: options?.mood || "neutro",
            petType: options?.petType || "cleitin",
          });
          new Notification("Cleitin chamou", {
            body,
            icon: "/pet-icon.svg",
            tag: "inactive-return",
          });
          localStorage.setItem("cleitin-last-inactive-notification", String(now));
        } catch {
          new Notification("Cleitin chamou", {
            body: buildFallbackNotification({ type: "inactive" }),
            icon: "/pet-icon.svg",
            tag: "inactive-return",
          });
          localStorage.setItem("cleitin-last-inactive-notification", String(now));
        }
      }

      tasks.forEach(async (task) => {
        if (task.completed || !task.time) return;

        const taskMinute = minutesFromTime(task.time);
        const isUpcoming = taskMinute - minuteNow >= 0 && taskMinute - minuteNow <= UPCOMING_WINDOW;
        const isOverdue = minuteNow > taskMinute;
        const alreadyUpcoming = task.lastUpcomingDate === today;
        const canRepeatOverdue = !task.lastNotificationAt || now - task.lastNotificationAt >= OVERDUE_REPEAT;
        const repeatInterval = Number(task.repeatIntervalMinutes || 30) * MINUTE;
        const canRepeatReminder = task.reminderEnabled
          && task.repeatUntilDone
          && minuteNow >= taskMinute
          && (!task.lastReminderAt || now - task.lastReminderAt >= repeatInterval);

        if (canRepeatReminder) {
          new Notification("Cleitin cobrando de novo", {
            body: buildRecurringReminderMessage(task),
            icon: "/pet-icon.svg",
            tag: `recurring-reminder-${task.id}`,
          });
          updateTask(task.id, {
            lastReminderAt: now,
            reminderCount: Number(task.reminderCount || 0) + 1,
            lastNotificationAt: now,
            lastNotificationDate: today,
          });
          return;
        }

        if (isUpcoming && !alreadyUpcoming) {
          try {
            await notifyTask(task, "upcoming", profile, tasks, options?.mood || "neutro", options?.petType || "cleitin");
            updateTask(task.id, {
              lastUpcomingDate: today,
            });
          } catch {
            return;
          }
        }

        if (isOverdue && canRepeatOverdue) {
          try {
            await notifyTask(task, "overdue", profile, tasks, options?.mood || "decepcionado", options?.petType || "cleitin");
            updateTask(task.id, {
              lastNotificationDate: today,
              lastNotificationAt: now,
            });
          } catch {
            return;
          }
        }
      });
    };

    checkTasks();
    const interval = window.setInterval(checkTasks, MINUTE);
    return () => window.clearInterval(interval);
  }, [canNotify, profile?.chargeStyle, tasks, updateTask, options?.lastOpenAt]);

  return useMemo(
    () => ({ permission, canNotify, error, requestPermission }),
    [permission, canNotify, error]
  );
}
