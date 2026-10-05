import { localISO } from "./utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createFocusTimerStore, freshTimer, timerKey, type PersistedTimer, type TimerSnapshot } from "./focus-timer-store";
import {
  useEvolutionData, getLocalOwner, OWNER_KEY,
  type FocusMode,
  type FocusTag,
  type FocusSession,
  type FocusSettings,
  type TimeLog,
  type EvoCategory,
} from "./evolution-data";

function tagToModule(tag: FocusTag | null | undefined): EvoCategory {
  if (!tag) return "Notes";
  if (tag === "Guitar") return "Hobby";
  return tag as EvoCategory;
}


type TimerStore = ReturnType<typeof createFocusTimerStore>;
let timerStore: TimerStore | null = null;
function getTimerStore(): TimerStore | null {
  if (typeof window === "undefined") return null;
  if (timerStore) return timerStore;
  const store = createFocusTimerStore(localStorage, getLocalOwner);
  timerStore = store;
  window.addEventListener("evolution:owner-changing", () => store.beginOwnerChange());
  window.addEventListener("evolution:owner-changed", () => store.finishOwnerChange());
  // Also covers the initial unowned → signed-in transition and other-tab owner changes.
  window.addEventListener("evolution:data-updated", () => store.refresh());
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === OWNER_KEY) store.finishOwnerChange();
    else if (event.key === timerKey(getLocalOwner() ?? "guest")) store.refresh();
  });
  return store;
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
  /** Manually log a full session for the current task/tag and mode. */
  logSession: () => void;
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
  const store = getTimerStore();
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() => store?.read(settings) ?? {
    lease: { owner: "guest", generation: 0 }, timer: freshTimer(settings),
  });
  const lease = snapshot.lease;
  const current = !!store?.isCurrent(lease);
  const state = current ? snapshot.timer : freshTimer(settings);
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<UseFocusTimer["notification"]>(null);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!store) return;
    const handler = () => {
      const next = store.read(settings);
      if (!store.isCurrent(lease)) {
        completingRef.current = false;
        setNotification(null);
      }
      setSnapshot(next);
    };
    const unsubscribe = store.subscribe(handler);
    handler();
    return unsubscribe;
  }, [store, settings, lease.owner, lease.generation]);

  // Every action captures an owner generation; old callbacks cannot write after A→B→A either.
  const changeTimer = useCallback((update: (timer: PersistedTimer) => PersistedTimer) => {
    if (!store?.isCurrent(lease)) return;
    const next = update(store.read(settings).timer);
    if (store.save(lease, next)) setSnapshot(store.read(settings));
  }, [store, lease.owner, lease.generation, settings]);

  // Drive ticks when running
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => { if (store?.isCurrent(lease)) setTick((t) => t + 1); }, 250);
    return () => clearInterval(id);
  }, [state.running, store, lease.owner, lease.generation]);

  const totalMs = modeDurationMs(state.mode, settings);
  const remainingMs = state.running && state.startedAt
    ? Math.max(0, state.remainingMs - (Date.now() - state.startedAt))
    : state.remainingMs;

  // Detect completion. Claim the current persisted run before logging; a stale effect cannot
  // complete after a pause/reset/owner change, nor can another mounted timer log it again.
  useEffect(() => {
    if (!store?.isCurrent(lease) || !state.running || remainingMs > 0 || completingRef.current) return;
    const finished = store.read(settings).timer;
    if (!finished.running || finished.startedAt !== state.startedAt || finished.mode !== state.mode
      || finished.remainingMs !== state.remainingMs) return;
    completingRef.current = true;
    const finishedMode = finished.mode;
    const completedAt = Date.now();
    const nextRound = finishedMode === "focus" ? finished.round + 1 : finished.round;
    const nextMode: FocusMode = finishedMode === "focus"
      ? finished.round % settings.longEvery === 0 ? "long" : "short" : "focus";
    const next: PersistedTimer = { ...finished, mode: nextMode, round: nextRound,
      remainingMs: modeDurationMs(nextMode, settings), running: false, startedAt: null };
    if (!store.save(lease, next)) { completingRef.current = false; return; }
    setSnapshot(store.read(settings));
    if (finishedMode === "focus" && store.isCurrent(lease)) {
      const session: FocusSession = { id: crypto.randomUUID(), startedAt: completedAt - totalMs,
        completedAt, durationSec: Math.round(totalMs / 1000), mode: "focus",
        task: finished.task || "Untitled session", tag: finished.tag ?? undefined };
      const timeLog: TimeLog = { id: crypto.randomUUID(), date: localISO(new Date(completedAt)),
        minutes: Math.max(1, Math.round(totalMs / 60000)), module: tagToModule(finished.tag),
        source: "focus", label: finished.task || "Focus session", ts: completedAt };
      mutate((prev) => store.isCurrent(lease) ? {
        focusSessions: [...prev.focusSessions, session], timeLogs: [...(prev.timeLogs ?? []), timeLog],
      } : {});
    }
    if (store.isCurrent(lease)) {
      try { playChime(); } catch { /* noop */ }
      setNotification({ mode: finishedMode, durationSec: Math.round(totalMs / 1000), nextMode });
    }
    completingRef.current = false;
  }, [remainingMs, state, totalMs, mutate, settings, store, lease.owner, lease.generation]);

  const start = useCallback(() => changeTimer((prev) => ({ ...prev, running: true,
    startedAt: Date.now(), remainingMs: prev.remainingMs > 0 ? prev.remainingMs : modeDurationMs(prev.mode, settings),
  })), [changeTimer, settings]);

  const pause = useCallback(() => changeTimer((prev) => {
    if (!prev.running || prev.startedAt === null) return prev;
    return { ...prev, running: false, remainingMs: Math.max(0, prev.remainingMs - (Date.now() - prev.startedAt)), startedAt: null };
  }), [changeTimer]);

  const reset = useCallback(() => changeTimer((prev) => ({ ...prev, running: false,
    startedAt: null, mode: "focus", round: 1, remainingMs: modeDurationMs("focus", settings),
  })), [changeTimer, settings]);

  const logSession = useCallback(() => {
    if (!store?.isCurrent(lease)) return;
    const active = store.read(settings).timer;
    const duration = modeDurationMs(active.mode, settings);
    const completedAt = Date.now();
    const session: FocusSession = { id: crypto.randomUUID(), startedAt: completedAt - duration,
      completedAt, durationSec: Math.round(duration / 1000), mode: active.mode,
      task: active.task || "Untitled session", tag: active.tag ?? undefined };
    const timeLog: TimeLog = { id: crypto.randomUUID(), date: localISO(new Date(completedAt)),
      minutes: Math.max(1, Math.round(duration / 60000)), module: tagToModule(active.tag),
      source: "focus", label: active.task || "Focus session", ts: completedAt };
    mutate((prev) => store.isCurrent(lease) ? {
      focusSessions: [...prev.focusSessions, session], timeLogs: [...(prev.timeLogs ?? []), timeLog],
    } : {});
  }, [store, lease.owner, lease.generation, settings, mutate]);

  const setMode = useCallback((mode: FocusMode) => changeTimer((prev) => ({ ...prev, mode,
    running: false, startedAt: null, remainingMs: modeDurationMs(mode, settings),
  })), [changeTimer, settings]);
  const setTask = useCallback((task: string) => changeTimer((prev) => ({ ...prev, task })), [changeTimer]);
  const setTag = useCallback((tag: FocusTag | null) => changeTimer((prev) => ({ ...prev, tag })), [changeTimer]);

  const updateSettings = useCallback((patch: Partial<FocusSettings>) => {
    if (!store?.isCurrent(lease)) return;
    mutate((prev) => store.isCurrent(lease) ? { focusSettings: { ...prev.focusSettings, ...patch } } : {});
    changeTimer((prev) => prev.running ? prev : { ...prev, remainingMs: modeDurationMs(prev.mode, { ...settings, ...patch }) });
  }, [store, lease.owner, lease.generation, mutate, changeTimer, settings]);

  const clearNotification = useCallback(() => {
    if (store?.isCurrent(lease)) setNotification(null);
  }, [store, lease.owner, lease.generation]);

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
    logSession,
    setMode,
    setTask,
    setTag,
    updateSettings,
    settings,
    notification: current ? notification : null,
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
  const today = localISO(new Date());
  const todays = sessions.filter((s) => localISO(new Date(s.completedAt)) === today);
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
    const date = localISO(d);
    const minutes = sessions
      .filter((s) => localISO(new Date(s.completedAt)) === date)
      .reduce((sum, s) => sum + s.durationSec / 60, 0);
    out.push({ label: labels[d.getDay()], minutes: Math.round(minutes), date });
  }
  return out;
}

export function focusStreak(sessions: FocusSession[]) {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => localISO(new Date(s.completedAt))));
  let streak = 0;
  const cursor = new Date();
  // allow today even if no session yet
  if (!days.has(localISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(localISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
