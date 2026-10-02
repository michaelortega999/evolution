import { localISO } from "./utils";
// Two-way sync of Tasks + Calendar between the phone design's store
// (evolution05:userdata:v4 → tk.tasks / tk.events) and the desktop store
// (evoTasks / calendar), which itself syncs to the user's account.
import {
  loadEvolutionData, saveEvolutionData,
  type EvoTask, type EvoCategory, type CalendarEvent,
} from "./evolution-data";

export const MOBILE_KEY = "evolution05:userdata:v4";
const MOBILE_SEED_V = 3;

type MTask = { id: number; title: string; sub?: string; cat?: string; time?: string; done: boolean; date: string; doneAt?: string | null; extId?: string };
type MEvent = { id: number; title: string; sub?: string; date: string; time: string; dur: number; cat: string; done?: boolean; extId?: string };

const toDeskCat = (c?: string): EvoCategory =>
  c === "HEALTH" || c === "FITNESS" ? "Fitness"
  : c === "NUTRITION" ? "Nutrition"
  : c === "BUSINESS" ? "Business"
  : c === "FINANCE" ? "Wealth"
  : c === "TRADING" ? "Investing"
  : c === "JOURNAL" ? "Journal" : "Notes";
const toMobTaskCat = (c: EvoCategory) =>
  c === "Fitness" || c === "Nutrition" ? "HEALTH" : c === "Business" ? "BUSINESS" : c === "Wealth" || c === "Investing" ? "FINANCE" : "PERSONAL";

const toMin = (t?: string) => { if (!t) return null; const [h, m] = t.split(":"); return +h * 60 + (+m || 0); };
const fromMin = (n: number) => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const todayKey = () => localISO(new Date());
const deskIdOf = (x: { id: number; extId?: string }) => x.extId ?? `m${x.id}`;

function readMobile(): Record<string, any> | null {
  try { const r = localStorage.getItem(MOBILE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

/** Desktop → phone. Call before the phone design loads. */
export function pushDesktopIntoMobile() {
  const desk = loadEvolutionData();
  const store = readMobile() ?? { seedv: MOBILE_SEED_V };
  if (store.seedv !== MOBILE_SEED_V) Object.assign(store, { seedv: MOBILE_SEED_V });
  const tk = store.tk ?? { tab: "TODAY", filter: "ALL", monthOffset: 0, sel: null, nt: { title: "", sub: "", cat: "PERSONAL", time: "" }, nh: "", nf: "", tasks: [], habits: [], focus: [], events: [], goals: [] };
  const oldTasks: MTask[] = tk.tasks ?? [];
  const oldEvents: MEvent[] = tk.events ?? [];

  let nextId = Math.max(0, ...oldTasks.map((t) => t.id)) + 1;
  tk.tasks = (desk.evoTasks ?? []).map((d: EvoTask): MTask => {
    const m = oldTasks.find((t) => deskIdOf(t) === d.id);
    const done = d.status === "Done";
    return {
      ...(m ?? {}), id: m?.id ?? nextId++, extId: d.id, title: d.text,
      cat: m?.cat ?? toMobTaskCat(d.category), done,
      date: d.due || m?.date || todayKey(),
      doneAt: done ? (m?.doneAt ?? todayKey()) : null,
    } as MTask;
  });

  let evId = Date.now();
  tk.events = (desk.calendar ?? []).map((d: CalendarEvent): MEvent => {
    const m = oldEvents.find((e) => deskIdOf(e) === d.id);
    const s = toMin(d.time), e = toMin(d.endTime);
    return {
      ...(m ?? {}), id: m?.id ?? evId++, extId: d.id, title: d.title, date: d.date,
      time: d.time ?? "", dur: s != null && e != null && e > s ? e - s : (m?.dur ?? 60),
      cat: m?.cat ?? "PERSONAL",
    } as MEvent;
  });

  store.tk = tk;
  localStorage.setItem(MOBILE_KEY, JSON.stringify(store));
  lastSig = sig(store);
}

let lastSig = "";
const sig = (s: Record<string, any> | null) => JSON.stringify([s?.tk?.tasks ?? [], s?.tk?.events ?? []]);

/** Phone → desktop. Call periodically; only writes when phone tasks/events changed. */
export function pullMobileIntoDesktop() {
  const store = readMobile();
  if (!store?.tk) return;
  const s = sig(store);
  if (s === lastSig) return;
  lastSig = s;
  const desk = loadEvolutionData();
  const tasks: MTask[] = store.tk.tasks ?? [];
  const events: MEvent[] = store.tk.events ?? [];

  const evoTasks: EvoTask[] = tasks.map((t) => {
    const id = deskIdOf(t);
    const prev = desk.evoTasks?.find((d) => d.id === id);
    return {
      id, text: t.title,
      category: prev?.category ?? toDeskCat(t.cat),
      priority: prev?.priority ?? "Medium",
      due: t.date ?? prev?.due ?? todayKey(),
      status: t.done ? "Done" : prev && prev.status !== "Done" ? prev.status : "Not Started",
    };
  });
  const calendar: CalendarEvent[] = events.map((e) => {
    const id = deskIdOf(e);
    const prev = desk.calendar?.find((d) => d.id === id);
    const s = toMin(e.time);
    return {
      ...(prev ?? {}), id, title: e.title, date: e.date, time: e.time,
      endTime: s != null ? fromMin(s + (e.dur || 60)) : prev?.endTime,
    };
  });
  saveEvolutionData({ ...desk, evoTasks, calendar });
}
