import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEvolutionData,
  type FocusMode,
  type FocusTag,
  type FocusSession,
  type FocusSettings,
} from "./evolution-data";

const TIMER_KEY = "evolution:focus-timer:v1";

interface PersistedTimer {
  mode: FocusMode;
  task: string;
  tag: FocusTag | null;
  round: number;
  startedAt: number | null; // epoch ms when running
  remainingMs: number;       // remaining when paused
  running: boolean;
}

const defaultTimer: PersistedTimer = {
  mode: "focus",
  task: "",
  tag: null,
  round: 1,
  startedAt: null,
  remainingMs: 25 * 60 * 1000,
  running: false,
};

function loadTimer(settings: FocusSettings): PersistedTimer {
  if (typeof window === "undefined") return { ...defaultTimer, remainingMs: settings.focusMin * 60 * 1000 };
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return { ...defaultTimer, remainingMs: settings.focusMin * 60 * 1000 };
    return { ...defaultTimer, ...(JSON.parse(raw) as Partial<PersistedTimer>) };
  } catch {
    return { ...defaultTimer, remainingMs: settings.focusMin * 60 * 1000 };
  }
}

function saveTimer(state: PersistedTimer) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("evolution:focus-timer-updated"));
}

export function modeDurationMs(mode: FocusMode, settings: FocusSettings) {
  const min = mode === "focus" ? settings.focusMin : mode === "short" ? settings.shortMin : settings.longMin;
  return min * 60 * 1000;
}

export function modeLabel(mode: FocusMode) {
  return mode === "focus" ? "Focus Session" : mode === "short" ? "Short Break" : "Long Break";
}

interface UseFocusTimer {
  mode: FocusMode;
  task: string;
  tag: FocusTag | null;
  round: number;
  remainingMs: number;
  running: boolean;
  totalMs: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: FocusMode) => void;
  setTask: (task: string) => void;
  setTag: (tag: FocusTag | null) => void;
  updateSettings: (patch: Partial<FocusSettings>) => void;
  settings: FocusSettings;
  /** Notification triggered by the timer when a session ends. Consumer clears it. */
  notification: { mode: FocusMode; durationSec: number; nextMode: FocusMode } | null;
  clearNotification: () => void;
}

export function useFocusTimer(): UseFocusTimer {
  const { data, mutate } = useEvolutionData();
  const settings = data.focusSettings;
  const [state, setState] = useState<PersistedTimer>(() => loadTimer(settings));
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<UseFocusTimer["notification"]>(null);
  const completingRef = useRef(false);

  // Sync from other tabs / components
  useEffect(() => {
    const handler = () => setState(loadTimer(settings));
    window.addEventListener("evolution:focus-timer-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("evolution:focus-timer-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [settings]);

  // Drive ticks when running
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [state.running]);

  const totalMs = modeDurationMs(state.mode, settings);
  const remainingMs = state.running && state.startedAt
    ? Math.max(0, state.remainingMs - (Date.now() - state.startedAt))
    : state.remainingMs;

  // Detect completion
  useEffect(() => {
    if (!state.running || remainingMs > 0 || completingRef.current) return;
    completingRef.current = true;

    const finishedMode = state.mode;
    const completedAt = Date.now();
    const startedAt = completedAt - totalMs;

    // Log session if focus
    if (finishedMode === "focus") {
      const session: FocusSession = {
        id: crypto.randomUUID(),
        startedAt,
        completedAt,
        durationSec: Math.round(totalMs / 1000),
        mode: "focus",
        task: state.task || "Untitled session",
        tag: state.tag ?? undefined,
      };
      mutate((prev) => ({ focusSessions: [...prev.focusSessions, session] }));
    }

    // Decide next mode
    const nextRound = finishedMode === "focus" ? state.round + 1 : state.round;
    const nextMode: FocusMode =
      finishedMode === "focus"
        ? state.round % settings.longEvery === 0 ? "long" : "short"
        : "focus";

    const nextRemaining = modeDurationMs(nextMode, settings);
    const next: PersistedTimer = {
      ...state,
      mode: nextMode,
      round: nextRound,
      remainingMs: nextRemaining,
      running: false,
      startedAt: null,
    };

    // Chime
    try { playChime(); } catch { /* noop */ }

    setNotification({ mode: finishedMode, durationSec: Math.round(totalMs / 1000), nextMode });
    setState(next);
    saveTimer(next);

    // release lock for next session
    setTimeout(() => { completingRef.current = false; }, 100);
  }, [remainingMs, state, totalMs, mutate, settings]);

  const start = useCallback(() => {
    setState((prev) => {
      const next: PersistedTimer = {
        ...prev,
        running: true,
        startedAt: Date.now(),
        remainingMs: prev.remainingMs > 0 ? prev.remainingMs : modeDurationMs(prev.mode, settings),
      };
      saveTimer(next);
      return next;
    });
  }, [settings]);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.running || !prev.startedAt) return prev;
      const next: PersistedTimer = {
        ...prev,
        running: false,
        remainingMs: Math.max(0, prev.remainingMs - (Date.now() - prev.startedAt)),
        startedAt: null,
      };
      saveTimer(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      const next: PersistedTimer = {
        ...prev,
        running: false,
        startedAt: null,
        remainingMs: modeDurationMs(prev.mode, settings),
      };
      saveTimer(next);
      return next;
    });
  }, [settings]);

  const setMode = useCallback((mode: FocusMode) => {
    setState((prev) => {
      const next: PersistedTimer = {
        ...prev,
        mode,
        running: false,
        startedAt: null,
        remainingMs: modeDurationMs(mode, settings),
      };
      saveTimer(next);
      return next;
    });
  }, [settings]);

  const setTask = useCallback((task: string) => {
    setState((prev) => {
      const next = { ...prev, task };
      saveTimer(next);
      return next;
    });
  }, []);

  const setTag = useCallback((tag: FocusTag | null) => {
    setState((prev) => {
      const next = { ...prev, tag };
      saveTimer(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<FocusSettings>) => {
    mutate((prev) => ({ focusSettings: { ...prev.focusSettings, ...patch } }));
    // adjust current timer if not running and mode duration changed
    setState((prev) => {
      if (prev.running) return prev;
      const merged = { ...settings, ...patch };
      const newRemaining = modeDurationMs(prev.mode, merged);
      const next = { ...prev, remainingMs: newRemaining };
      saveTimer(next);
      return next;
    });
  }, [mutate, settings]);

  const clearNotification = useCallback(() => setNotification(null), []);

  // ensure tick is referenced so re-renders happen while running
  void tick;

  return {
    mode: state.mode,
    task: state.task,
    tag: state.tag,
    round: state.round,
    remainingMs,
    running: state.running,
    totalMs,
    start,
    pause,
    reset,
    setMode,
    setTask,
    setTag,
    updateSettings,
    settings,
    notification,
    clearNotification,
  };
}

let audioCtx: AudioContext | null = null;
function playChime() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  audioCtx = audioCtx ?? new Ctor();
  const ctx = audioCtx;
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = now + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.start(t);
    osc.stop(t + 0.65);
  });
}

export function formatMmSs(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ---------- Stats helpers ----------

export function focusStatsToday(sessions: FocusSession[]) {
  const today = new Date().toISOString().slice(0, 10);
  const todays = sessions.filter((s) => new Date(s.completedAt).toISOString().slice(0, 10) === today);
  const totalSec = todays.reduce((sum, s) => sum + s.durationSec, 0);
  const longest = todays.reduce((m, s) => Math.max(m, s.durationSec), 0);
  return { todays, totalSec, longest, count: todays.length };
}

export function focusWeeklyMinutes(sessions: FocusSession[]) {
  // Returns array of 7 days ending today, [{label, minutes, date}]
  const out: { label: string; minutes: number; date: string }[] = [];
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const minutes = sessions
      .filter((s) => new Date(s.completedAt).toISOString().slice(0, 10) === date)
      .reduce((sum, s) => sum + s.durationSec / 60, 0);
    out.push({ label: labels[d.getDay()], minutes: Math.round(minutes), date });
  }
  return out;
}

export function focusStreak(sessions: FocusSession[]) {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => new Date(s.completedAt).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  // allow today even if no session yet
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
