import type { FocusMode, FocusTag, FocusSettings } from "./evolution-data";

export interface PersistedTimer {
  mode: FocusMode;
  task: string;
  tag: FocusTag | null;
  round: number;
  startedAt: number | null;
  remainingMs: number;
  running: boolean;
}
export interface TimerLease { owner: string; generation: number }
export interface TimerSnapshot { lease: TimerLease; timer: PersistedTimer }
type TimerStorage = Pick<Storage, "getItem" | "setItem">;
export const LEGACY_TIMER_KEY = "evolution:focus-timer:v1";
export const LEGACY_TIMER_BACKUP_KEY = `${LEGACY_TIMER_KEY}:unowned`;
export const timerKey = (owner: string) => `evolution:focus-timer:v2:${encodeURIComponent(owner)}`;
export const freshTimer = (settings: FocusSettings): PersistedTimer => ({
  mode: "focus", task: "", tag: null, round: 1, startedAt: null,
  remainingMs: settings.focusMin * 60_000, running: false,
});
const fallbackSettings: FocusSettings = { focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4 };

/** Device-local timer state is owner-scoped. History remains in EvolutionData. */
export function createFocusTimerStore(storage: TimerStorage, getOwner: () => string | null, now = Date.now) {
  const ownerNow = () => getOwner() ?? "guest";
  let owner = ownerNow();
  let generation = 0;
  let changing = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((f) => f());

  // The old global timer has no trustworthy owner. Preserve it verbatim; never adopt it.
  try {
    const legacy = storage.getItem(LEGACY_TIMER_KEY);
    if (legacy !== null && storage.getItem(LEGACY_TIMER_BACKUP_KEY) === null) storage.setItem(LEGACY_TIMER_BACKUP_KEY, legacy);
  } catch { /* the original remains untouched even if backup storage is unavailable */ }

  function readOwner(id: string, settings: FocusSettings): PersistedTimer {
    const empty = freshTimer(settings);
    try {
      const raw = storage.getItem(timerKey(id));
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as Partial<PersistedTimer>;
      if (!parsed || typeof parsed !== "object") return empty;
      const timer = { ...empty, ...parsed };
      if (!["focus", "short", "long"].includes(timer.mode) || typeof timer.task !== "string"
        || !(timer.tag === null || typeof timer.tag === "string")
        || !Number.isFinite(timer.round) || timer.round < 1
        || !Number.isFinite(timer.remainingMs) || timer.remainingMs < 0
        || !(timer.startedAt === null || Number.isFinite(timer.startedAt))
        || typeof timer.running !== "boolean") return empty;
      return timer;
    } catch { return empty; }
  }
  function pauseOwner(id: string) {
    try {
      if (!storage.getItem(timerKey(id))) return;
      const timer = readOwner(id, fallbackSettings);
      if (!timer.running) return;
      const paused: PersistedTimer = { ...timer, running: false, startedAt: null,
        remainingMs: Math.max(0, timer.remainingMs - (timer.startedAt === null ? 0 : Math.max(0, now() - timer.startedAt))) };
      storage.setItem(timerKey(id), JSON.stringify(paused));
    } catch { /* ownership guards still block the old timer if storage is unavailable */ }
  }
  function syncOwner() {
    if (changing || ownerNow() === owner) return;
    pauseOwner(owner);
    owner = ownerNow();
    generation++;
    pauseOwner(owner);
  }
  function isCurrent(lease: TimerLease) {
    syncOwner();
    return !changing && lease.owner === owner && lease.generation === generation && ownerNow() === owner;
  }
  return {
    read(settings: FocusSettings): TimerSnapshot {
      syncOwner();
      return { lease: { owner, generation }, timer: changing ? freshTimer(settings) : readOwner(owner, settings) };
    },
    isCurrent,
    save(lease: TimerLease, timer: PersistedTimer) {
      if (!isCurrent(lease)) return false;
      try { storage.setItem(timerKey(owner), JSON.stringify(timer)); }
      catch { return false; }
      notify();
      return true;
    },
    beginOwnerChange() {
      pauseOwner(owner);
      generation++;
      changing = true;
      notify();
    },
    finishOwnerChange() {
      pauseOwner(owner);
      owner = ownerNow();
      generation++;
      changing = false;
      pauseOwner(owner);
      notify();
    },
    refresh() { syncOwner(); notify(); },
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  };
}
