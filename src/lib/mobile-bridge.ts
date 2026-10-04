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
import { mergePhoneData, advanceBase, sameJSON, applyAliases, recordRenames, type Rename, type IdAliases } from "./record-merge";

export const MOBILE_KEY = "evolution05:userdata:v4";
export const BASE_KEY = "evolution:mobile-bridge:base:v1";
/** Which account the phone store + base belong to. */
/** Last phone-only data both the phone and the account were known to hold (three-way merge base). */
export const PHONE_BASE_KEY = "evolution:mobile-bridge:phone-base:v1";
/** Collision renames of records the running phone still holds under their original id. */
export const PHONE_ALIAS_KEY = "evolution:mobile-bridge:id-alias:v1";
export const PHONE_OWNER_KEY = "evolution:mobile-bridge:owner";
const DESK_OWNER_KEY = "evolution:data:owner"; // = OWNER_KEY in evolution-data.ts
const MOBILE_SEED_V = 3;
/** Phone tasks-screen UI state: kept on the device, never merged or uploaded. */
const TRANSIENT_TK = ["tab", "filter", "monthOffset", "sel", "nt", "nh", "nf"];
const DEFAULT_TK: Record<string, any> = { tab: "TODAY", filter: "ALL", monthOffset: 0, sel: null, nt: { title: "", sub: "", cat: "PERSONAL", time: "" }, nh: "", nf: "", tasks: [], habits: [], focus: [], events: [], goals: [] };
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === "object" && !Array.isArray(v);
const archiveKey = (key: string, owner: string) => `${key}:owner:${owner}`;

/**
 * Make the phone store and bridge base belong to the desktop data's current owner.
 * The previous owner's copies are archived (and restored next time they sign in),
 * so one account's phone items are never merged into another account.
 * Call only while the phone design is NOT running.
 */
export function alignMobileOwner(): void {
  const owner = localStorage.getItem(DESK_OWNER_KEY);
  const cur = localStorage.getItem(PHONE_OWNER_KEY);
  if (!owner || cur === owner) return;
  if (cur === null) {
    // Unowned legacy phone data: keep a raw backup; only a guest device adopts it, never a signed-in account.
    if (owner === "guest") { localStorage.setItem(PHONE_OWNER_KEY, owner); return; }
    for (const key of [MOBILE_KEY, BASE_KEY, PHONE_BASE_KEY, PHONE_ALIAS_KEY]) {
      const raw = localStorage.getItem(key);
      if (raw) { if (!localStorage.getItem(`${key}:unowned`)) localStorage.setItem(`${key}:unowned`, raw); localStorage.removeItem(key); }
      const mine = localStorage.getItem(archiveKey(key, owner));
      if (mine) localStorage.setItem(key, mine);
    }
    localStorage.setItem(PHONE_OWNER_KEY, owner);
    return;
  }
  for (const key of [MOBILE_KEY, BASE_KEY, PHONE_BASE_KEY, PHONE_ALIAS_KEY]) {
    const raw = localStorage.getItem(key);
    if (raw) localStorage.setItem(archiveKey(key, cur), raw);
    const mine = localStorage.getItem(archiveKey(key, owner));
    if (mine) localStorage.setItem(key, mine); else localStorage.removeItem(key);
  }
  localStorage.setItem(PHONE_OWNER_KEY, owner);
}
/** True when phone store and desktop data belong to the same account (or are both unowned). */
export function mobileOwnerMatches(): boolean {
  const owner = localStorage.getItem(DESK_OWNER_KEY);
  const cur = localStorage.getItem(PHONE_OWNER_KEY);
  return !owner || !cur || owner === cur;
}

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
      // Phone wins only when it alone changed since the last sync; otherwise desktop (account) wins.
      out.set(id, b && !same(p, b) && same(d, b) ? { core: p, from: "phone" } : { core: d, from: "desk" });
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
  if (writePhone) alignMobileOwner();
  if (!mobileOwnerMatches()) return false; // never reconcile one account's phone data into another's
  const desk = loadEvolutionData();
  const localStore = readMobile();
  const store = localStore ?? (writePhone ? { seedv: MOBILE_SEED_V } : null);
  if (!store) return false;
  if (writePhone && store.seedv !== MOBILE_SEED_V) store.seedv = MOBILE_SEED_V;
  const tk = store.tk ?? { ...DEFAULT_TK };
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

  // ---- Phone-only sections: three-way merge (phone ↔ account copy) against a true phone base ----
  const deskNow = loadEvolutionData();
  const remotePhone = deskNow.phoneStore?.data;
  const rawPhoneBase = readJSON<Record<string, unknown>>(PHONE_BASE_KEY) ?? undefined;
  // A store that never held phone-only data (fresh device) contributes nothing, so restore wins.
  const aliases = readJSON<IdAliases>(PHONE_ALIAS_KEY) ?? {};
  // Cloud-origin renames are persisted atomically in the alias map; normalize both sides
  // of the local comparison so edits/deletes retain the frame record's exact identity.
  const phoneBase = rawPhoneBase === undefined ? undefined : applyAliases(rawPhoneBase, aliases) as Record<string, unknown>;
  const rawHeld = localStore ? phoneOnlySections(localStore) ?? undefined : undefined;
  const heldPhone = rawHeld === undefined ? undefined : (applyAliases(rawHeld, aliases) as Record<string, unknown>);
  const renames: Rename[] = [];
  const mergedPhone = mergePhoneData(phoneBase, heldPhone, remotePhone, renames);
  // writePhone: the phone now receives the renamed ids itself, so aliases are no longer needed.
  const nextAliases = writePhone ? {} : recordRenames(aliases, renames);
  if (!sameJSON(nextAliases, aliases)) {
    if (Object.keys(nextAliases).length) localStorage.setItem(PHONE_ALIAS_KEY, JSON.stringify(nextAliases));
    else localStorage.removeItem(PHONE_ALIAS_KEY);
  }
  if (mergedPhone && !sameJSON(remotePhone, mergedPhone)) {
    saveEvolutionData({ ...deskNow, phoneStore: { v: 1, data: mergedPhone } });
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
    let evId = Math.max(Date.now(), ...mEvents.map((e) => (e.id || 0) + 1));
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
    // Always materialize the resolved snapshot before the frame starts (unknown fields kept).
    const resolved: Record<string, any> = mergedPhone ? JSON.parse(JSON.stringify(mergedPhone)) : {};
    const transient = Object.fromEntries(TRANSIENT_TK.filter((k) => k in tk).map((k) => [k, tk[k]]));
    const finalStore = {
      ...resolved, seedv: MOBILE_SEED_V,
      tk: { ...DEFAULT_TK, ...transient, ...(isObj(resolved.tk) ? resolved.tk : {}), tasks: nextPhoneTasks, events: nextPhoneEvents },
    };
    const raw = JSON.stringify(finalStore);
    if (localStorage.getItem(MOBILE_KEY) !== raw) { localStorage.setItem(MOBILE_KEY, raw); changed = true; }
  }
  // Phone base advances fully when the phone was just written; while it runs, only where it holds the merged value.
  // Compare with the phone's copy as identified after this pass's renames, so a renamed record's base advances now.
  const heldNow = rawHeld === undefined ? undefined : applyAliases(rawHeld, nextAliases);
  const nextPhoneBase = writePhone ? mergedPhone : advanceBase(phoneBase, heldNow, mergedPhone);
  if (nextPhoneBase !== undefined && !sameJSON(nextPhoneBase, phoneBase)) localStorage.setItem(PHONE_BASE_KEY, JSON.stringify(nextPhoneBase));


  // Base = the value both sides actually share. While the phone design is running we
  // can't update it, so an item only advances its base when the phone already holds the
  // merged value; otherwise the old base is kept (the stale phone copy then reads as
  // "unchanged" and the desktop value keeps winning instead of being reverted).
  const nextBase: Base = { tasks: {}, events: {} };
  if (writePhone) {
    for (const [k, v] of tMerged) nextBase.tasks[k] = v.core;
    for (const [k, v] of eMerged) nextBase.events[k] = v.core;
  } else {
    for (const [k, m] of mtById) {
      const v = tMerged.get(k), pc = mTaskCore(m);
      if (v && same(v.core, pc)) nextBase.tasks[k] = pc;
      else if (base.tasks[k]) nextBase.tasks[k] = base.tasks[k];
    }
    for (const [k, m] of meById) {
      const v = eMerged.get(k), pc = mEventCore(m);
      if (v && same(v.core, pc)) nextBase.events[k] = pc;
      else if (base.events[k]) nextBase.events[k] = base.events[k];
    }
  }
  if (!same(nextBase, base)) localStorage.setItem(BASE_KEY, JSON.stringify(nextBase));
  return changed;
}

/** Desktop ↔ phone before the phone design loads (writes both stores). */
export function pushDesktopIntoMobile() { syncMobileBridge(true); }
/** Phone → desktop while the phone design is running (never touches the phone store). */
export function pullMobileIntoDesktop() { syncMobileBridge(false); }

/** Phone store minus the tasks/events the bridge already maps (pure; unknown fields are kept). */
export function phoneOnlySections(store: Record<string, any> | null): Record<string, unknown> | null {
  if (!store || typeof store !== "object") return null;
  const out: Record<string, unknown> = JSON.parse(JSON.stringify(store));
  if (out.tk && typeof out.tk === "object") { const tk = { ...(out.tk as Record<string, unknown>) }; delete tk.tasks; delete tk.events; for (const k of TRANSIENT_TK) delete tk[k]; out.tk = tk; }
  return out;
}
