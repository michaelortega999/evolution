// Two-way sync of Tasks + Calendar between the phone design's store
// (evolution05:userdata:v4 → tk.tasks / tk.events) and the desktop store
// (evoTasks / calendar), which itself syncs to the user's account.
//
// Uses a three-way merge against the last synced snapshot ("base") so that:
//  • phone-only items created before sync are never wiped at startup,
//  • deletes on either side propagate instead of being resurrected,
//  • desktop-only fields (priority, category, status, reminders…) survive phone edits.
import { localISO } from "./utils";
import {
  loadEvolutionData, saveEvolutionData,
  type EvoTask, type EvoCategory, type CalendarEvent,
} from "./evolution-data";

export const MOBILE_KEY = "evolution05:userdata:v4";
const BASE_KEY = "evolution:mobile-bridge:base:v1";
const MOBILE_SEED_V = 3;

type MTask = { id: number; title: string; sub?: string; cat?: string; time?: string; done: boolean; date: string; doneAt?: string | null; extId?: string };
type MEvent = { id: number; title: string; sub?: string; date: string; time: string; dur: number; cat: string; done?: boolean; extId?: string };

/** Fields shared by both sides — what the merge compares. */
type TaskCore = { title: string; date: string; done: boolean };
type EventCore = { title: string; date: string; time: string; dur: number };
type Base = { tasks: Record<string, TaskCore>; events: Record<string, EventCore> };

const toDeskCat = (c?: string): EvoCategory =>
  c === "HEALTH" || c === "FITNESS" ? "Fitness"
  : c === "NUTRITION" ? "Nutrition"
  : c === "BUSINESS" ? "Business"
  : c === "FINANCE" ? "Wealth"
  : c === "TRADING" ? "Investing"
  : c === "JOURNAL" ? "Journal" : "Notes";
const toMobTaskCat = (c: EvoCategory) =>
  c === "Fitness" || c === "Nutrition" ? "HEALTH" : c === "Business" ? "BUSINESS" : c === "Wealth" || c === "Investing" ? "FINANCE" : "PERSONAL";

const toMin = (t?: string) => { if (!t) return null; const [h, m] = t.split(":"); const n = +h * 60 + (+m || 0); return Number.isFinite(n) ? n : null; };
const fromMin = (n: number) => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const deskIdOf = (x: { id: number; extId?: string }) => x.extId ?? `m${x.id}`;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const mTaskCore = (t: MTask): TaskCore => ({ title: t.title ?? "", date: t.date || localISO(), done: !!t.done });
const dTaskCore = (t: EvoTask): TaskCore => ({ title: t.text ?? "", date: t.due || localISO(), done: t.status === "Done" });
const mEventCore = (e: MEvent): EventCore => ({ title: e.title ?? "", date: e.date, time: e.time ?? "", dur: e.dur || 60 });
const dEventCore = (e: CalendarEvent): EventCore => {
  const s = toMin(e.time), en = toMin(e.endTime);
  return { title: e.title ?? "", date: e.date, time: e.time ?? "", dur: s != null && en != null && en > s ? en - s : 60 };
};

function readJSON<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : null; } catch { return null; }
}
const readMobile = () => readJSON<Record<string, any>>(MOBILE_KEY);
const readBase = (): Base => readJSON<Base>(BASE_KEY) ?? { tasks: {}, events: {} };

/**
 * Generic three-way merge. Returns the merged core per id, plus which side the
 * winning value came from (so callers can keep that side's extra fields).
 */
function merge3<C>(
  phone: Map<string, C>, desk: Map<string, C>, base: Record<string, C>,
): Map<string, { core: C; from: "phone" | "desk" }> {
  const out = new Map<string, { core: C; from: "phone" | "desk" }>();
  const ids = new Set([...phone.keys(), ...desk.keys()]);
  for (const id of ids) {
    const p = phone.get(id), d = desk.get(id), b = base[id];
    if (p && d) {
      const pChanged = !b || !same(p, b);
      out.set(id, pChanged && (b ? true : !same(p, d)) && !(b && !same(d, b) && !pChanged) ? { core: p, from: "phone" } : { core: d, from: "desk" });
      // If both changed since base, desktop wins (it's the account's source of truth) unless only phone changed.
      if (b && !same(p, b) && same(d, b)) out.set(id, { core: p, from: "phone" });
      else if (b && !same(d, b)) out.set(id, { core: d, from: "desk" });
    } else if (p && !d) {
      // Absent on desktop: deleted there if it was synced before (keep only if phone edited it since).
      if (!b || !same(p, b)) out.set(id, { core: p, from: "phone" });
    } else if (d && !p) {
      if (!b || !same(d, b)) out.set(id, { core: d, from: "desk" });
    }
  }
  return out;
}

/**
 * Reconcile phone ↔ desktop.
 * @param writePhone  true only before the phone design has loaded — once it is
 *                    running it owns its store in memory and would overwrite us.
 * @returns true if anything changed.
 */
export function syncMobileBridge(writePhone: boolean): boolean {
  const desk = loadEvolutionData();
  const store = readMobile() ?? (writePhone ? { seedv: MOBILE_SEED_V } : null);
  if (!store) return false;
  if (writePhone && store.seedv !== MOBILE_SEED_V) store.seedv = MOBILE_SEED_V;
  const tk = store.tk ?? { tab: "TODAY", filter: "ALL", monthOffset: 0, sel: null, nt: { title: "", sub: "", cat: "PERSONAL", time: "" }, nh: "", nf: "", tasks: [], habits: [], focus: [], events: [], goals: [] };
  if (!writePhone && !store.tk) return false;
  const base = readBase();

  const mTasks: MTask[] = Array.isArray(tk.tasks) ? tk.tasks : [];
  const mEvents: MEvent[] = Array.isArray(tk.events) ? tk.events : [];
  const dTasks: EvoTask[] = desk.evoTasks ?? [];
  const dEvents: CalendarEvent[] = desk.calendar ?? [];

  const mtById = new Map(mTasks.map((t) => [deskIdOf(t), t]));
  const meById = new Map(mEvents.map((e) => [deskIdOf(e), e]));
  const dtById = new Map(dTasks.map((t) => [t.id, t]));
  const deById = new Map(dEvents.map((e) => [e.id, e]));

  const tMerged = merge3(
    new Map([...mtById].map(([k, v]) => [k, mTaskCore(v)])),
    new Map([...dtById].map(([k, v]) => [k, dTaskCore(v)])),
    base.tasks,
  );
  const eMerged = merge3(
    new Map([...meById].map(([k, v]) => [k, mEventCore(v)])),
    new Map([...deById].map(([k, v]) => [k, dEventCore(v)])),
    base.events,
  );

  // ---- Desktop result (keep desktop order, then append new phone items) ----
  const deskTaskOrder = [...dTasks.map((t) => t.id), ...mTasks.map(deskIdOf).filter((id) => !dtById.has(id))];
  const nextDeskTasks: EvoTask[] = deskTaskOrder.filter((id) => tMerged.has(id)).map((id) => {
    const { core } = tMerged.get(id)!;
    const prev = dtById.get(id);
    const m = mtById.get(id);
    return {
      ...(prev ?? {}),
      id, text: core.title, due: core.date,
      category: prev?.category ?? toDeskCat(m?.cat),
      priority: prev?.priority ?? "Medium",
      status: core.done ? "Done" : prev && prev.status !== "Done" ? prev.status : "Not Started",
    } as EvoTask;
  });
  const deskEventOrder = [...dEvents.map((e) => e.id), ...mEvents.map(deskIdOf).filter((id) => !deById.has(id))];
  const nextDeskEvents: CalendarEvent[] = deskEventOrder.filter((id) => eMerged.has(id)).map((id) => {
    const { core } = eMerged.get(id)!;
    const prev = deById.get(id);
    const s = toMin(core.time);
    return {
      ...(prev ?? {}), id, title: core.title, date: core.date,
      time: core.time || undefined,
      endTime: s != null ? fromMin(s + (core.dur || 60)) : prev?.endTime,
    } as CalendarEvent;
  });

  let changed = false;
  if (!same(nextDeskTasks, dTasks) || !same(nextDeskEvents, dEvents)) {
    saveEvolutionData({ ...desk, evoTasks: nextDeskTasks, calendar: nextDeskEvents });
    changed = true;
  }

  // ---- Phone result ----
  if (writePhone) {
    let nextId = Math.max(0, ...mTasks.map((t) => t.id || 0)) + 1;
    const phoneTaskOrder = [...mTasks.map(deskIdOf), ...dTasks.map((t) => t.id).filter((id) => !mtById.has(id))];
    const nextPhoneTasks: MTask[] = phoneTaskOrder.filter((id) => tMerged.has(id)).map((id) => {
      const { core } = tMerged.get(id)!;
      const m = mtById.get(id);
      const d = dtById.get(id);
      return {
        ...(m ?? {}), id: m?.id ?? nextId++, extId: id,
        title: core.title, date: core.date, done: core.done,
        cat: m?.cat ?? (d ? toMobTaskCat(d.category) : "PERSONAL"),
        doneAt: core.done ? (m?.doneAt ?? localISO()) : null,
      } as MTask;
    });
    let evId = Math.max(Date.now(), ...mEvents.map((e) => e.id || 0) .map((n) => n + 1));
    const phoneEventOrder = [...mEvents.map(deskIdOf), ...dEvents.map((e) => e.id).filter((id) => !meById.has(id))];
    const nextPhoneEvents: MEvent[] = phoneEventOrder.filter((id) => eMerged.has(id)).map((id) => {
      const { core } = eMerged.get(id)!;
      const m = meById.get(id);
      return {
        ...(m ?? {}), id: m?.id ?? evId++, extId: id,
        title: core.title, date: core.date, time: core.time, dur: core.dur,
        cat: m?.cat ?? "PERSONAL",
      } as MEvent;
    });
    if (!same(nextPhoneTasks, mTasks) || !same(nextPhoneEvents, mEvents) || !store.tk) {
      tk.tasks = nextPhoneTasks;
      tk.events = nextPhoneEvents;
      store.tk = tk;
      localStorage.setItem(MOBILE_KEY, JSON.stringify(store));
      changed = true;
    }
  }

  const nextBase: Base = {
    tasks: Object.fromEntries([...tMerged].map(([k, v]) => [k, v.core])),
    events: Object.fromEntries([...eMerged].map(([k, v]) => [k, v.core])),
  };
  if (!same(nextBase, base)) localStorage.setItem(BASE_KEY, JSON.stringify(nextBase));
  return changed;
}

/** Desktop ↔ phone before the phone design loads (writes both stores). */
export function pushDesktopIntoMobile() { syncMobileBridge(true); }
/** Phone → desktop while the phone design is running (never touches the phone store). */
export function pullMobileIntoDesktop() { syncMobileBridge(false); }
