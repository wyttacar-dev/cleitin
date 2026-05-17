const MEMORY_KEY = "cleitin-user-memory";

const defaultMemory = {
  profile: {},
  routine: {},
  recurringTasks: [],
  goals: [],
  procrastinations: [],
  productivity: {
    completed: 0,
    overdue: 0,
    streak: 0,
    lastOpenAt: null,
  },
  history: [],
  favoritePersonality: "ignorante",
};

export function loadMemory() {
  try {
    const saved = localStorage.getItem(MEMORY_KEY);
    return saved ? { ...defaultMemory, ...JSON.parse(saved) } : defaultMemory;
  } catch {
    return defaultMemory;
  }
}

export function saveMemory(memory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify({ ...defaultMemory, ...memory }));
}

export function updateMemory(patchOrUpdater) {
  const current = loadMemory();
  const next =
    typeof patchOrUpdater === "function"
      ? patchOrUpdater(current)
      : { ...current, ...patchOrUpdater };
  saveMemory(next);
  return next;
}

export function updateProductivityMemory({ tasks = [], profile = {}, dailyMemory = {} }) {
  const completed = tasks.filter((task) => task.completed).length;
  const overdue = tasks.filter((task) => !task.completed && task.status === "atrasada").length;
  const goals = profile?.goals ? [profile.goals] : [];

  return updateMemory((current) => ({
    ...current,
    profile,
    routine: {
      wakeTime: profile?.wakeTime,
      sleepTime: profile?.sleepTime,
      fixedTasks: profile?.fixedTasks || [],
    },
    goals,
    productivity: {
      ...current.productivity,
      completed,
      overdue,
      lastOpenAt: Date.now(),
    },
    favoritePersonality: profile?.chargeStyle || current.favoritePersonality,
    history: [
      {
        date: dailyMemory?.current?.date || new Date().toISOString().slice(0, 10),
        completed,
        overdue,
        checkIn: dailyMemory?.current?.checkIn?.answers || {},
      },
      ...(current.history || []),
    ].slice(0, 7),
  }));
}
