import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** YYYY-MM-DD in the user's local timezone (toISOString() is UTC and shifts days). */
export function localISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Evo planning workspace: pure local-date scheduling, shared by UI and tests.
export interface EvoRoutineSpec {
  title: string;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  workDays: number;
  offDays: number;
  horizonDays: number;
}
export interface EvoPlanEvent {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  reminder?: 0 | 15 | 30 | 60 | 1440;
}
export interface EvoRoutineRecord {
  id: string;
  spec: EvoRoutineSpec;
  events: EvoPlanEvent[];
  createdAt: number;
  archived?: boolean;
}
export interface EvoAssistantMessage {
  id: string;
  role: "user" | "evo";
  text: string;
  createdAt: number;
}
export function evoValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 2000 || y > 2100) return false;
  const date = new Date(y, m - 1, d, 12);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
export function evoShiftDate(value: string, days: number): string {
  if (!evoValidDate(value) || !Number.isInteger(days)) throw new Error("Choose a valid date.");
  const [y, m, d] = value.split("-").map(Number);
  return localISO(new Date(y, m - 1, d + days, 12));
}
export function evoValidateRoutine(spec: EvoRoutineSpec): string | null {
  if (!spec.title.trim() || spec.title.trim().length > 80) return "Name your routine (1–80 characters).";
  if (!evoValidDate(spec.startDate)) return "Choose a valid first work day between 2000 and 2100.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(spec.startTime)) return "Choose a valid start time.";
  if (!Number.isInteger(spec.durationMinutes) || spec.durationMinutes < 15 || spec.durationMinutes > 960)
    return "Duration must be 15 minutes to 16 hours.";
  if (!Number.isInteger(spec.workDays) || spec.workDays < 1 || spec.workDays > 14)
    return "Work days must be between 1 and 14.";
  if (!Number.isInteger(spec.offDays) || spec.offDays < 1 || spec.offDays > 14)
    return "Off days must be between 1 and 14.";
  if (!Number.isInteger(spec.horizonDays) || spec.horizonDays < 1 || spec.horizonDays > 84)
    return "Plan between 1 and 84 days.";
  return null;
}
export function evoRoutineId(spec: EvoRoutineSpec): string {
  const str = JSON.stringify([
    spec.title.trim(),
    spec.startDate,
    spec.startTime,
    spec.durationMinutes,
    spec.workDays,
    spec.offDays,
    spec.horizonDays,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) hash = Math.imul(hash ^ str.charCodeAt(i), 16777619);
  return "evo-routine-" + (hash >>> 0).toString(36);
}
export function evoBuildRoutine(spec: EvoRoutineSpec): EvoRoutineRecord {
  const error = evoValidateRoutine(spec);
  if (error) throw new Error(error);
  const id = evoRoutineId(spec);
  const events: EvoPlanEvent[] = [];
  const [h, m] = spec.startTime.split(":").map(Number);
  const begin = h * 60 + m;
  const hm = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  for (let i = 0; i < spec.horizonDays; i++) {
    if (i % (spec.workDays + spec.offDays) >= spec.workDays) continue;
    const date = evoShiftDate(spec.startDate, i);
    const end = begin + spec.durationMinutes;
    // Split overnight shifts into actual day segments: the existing calendar has no end-date field.
    events.push({
      id: `${id}-${date}-a`,
      date,
      time: spec.startTime,
      endTime: hm(Math.min(end, 1440)),
      title: spec.title.trim() + (end > 1440 ? " · starts" : ""),
      reminder: 0,
    });
    if (end > 1440)
      events.push({
        id: `${id}-${date}-b`,
        date: evoShiftDate(date, 1),
        time: "00:00",
        endTime: hm(end - 1440),
        title: spec.title.trim() + " · continues",
        reminder: 0,
      });
  }
  return { id, spec: { ...spec, title: spec.title.trim() }, events, createdAt: Date.now() };
}
export function evoEventConflicts(proposed: EvoPlanEvent[], existing: EvoPlanEvent[]): string[] {
  const minute = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return proposed
    .filter((p) =>
      existing.some(
        (e) =>
          e.id !== p.id &&
          e.date === p.date &&
          e.time &&
          Math.max(minute(p.time), minute(e.time)) <
            Math.min(
              minute(p.endTime || p.time) + (!p.endTime ? 1 : 0),
              minute(e.endTime || e.time) + (!e.endTime ? 1 : 0),
            ),
      ),
    )
    .map((e) => e.id);
}
export function evoApplyRoutine<T extends { calendar: EvoPlanEvent[]; assistantRoutines?: EvoRoutineRecord[] }>(
  data: T,
  plan: EvoRoutineRecord,
  allowConflicts = false,
): { calendar: EvoPlanEvent[]; assistantRoutines: EvoRoutineRecord[] } {
  const valid = evoBuildRoutine(plan.spec);
  if (valid.id !== plan.id || JSON.stringify(valid.events) !== JSON.stringify(plan.events))
    throw new Error("Preview changed. Generate a fresh preview.");
  const routines = data.assistantRoutines || [];
  const prior = routines.find((r) => r.id === plan.id);
  if (prior)
    throw new Error(
      prior.archived
        ? "This exact routine was previously removed. Change its name or dates to create a new version."
        : "This routine is already saved. View it under Saved routines.",
    );
  if (evoEventConflicts(plan.events, data.calendar).length && !allowConflicts)
    throw new Error("Calendar conflicts found. Review them before applying.");
  const ids = new Set(data.calendar.map((e) => e.id));
  if (plan.events.some((e) => ids.has(e.id)))
    throw new Error("Some routine events already exist. Review your calendar.");
  return { calendar: [...data.calendar, ...plan.events], assistantRoutines: [...routines, plan] };
}
export function evoUndoRoutine<T extends { calendar: EvoPlanEvent[]; assistantRoutines?: EvoRoutineRecord[] }>(
  data: T,
  id: string,
): { calendar: EvoPlanEvent[]; assistantRoutines: EvoRoutineRecord[]; retained: number } {
  const routines = data.assistantRoutines || [];
  const plan = routines.find((r) => r.id === id);
  if (!plan || plan.archived) throw new Error("This routine is no longer active.");
  const originals = new Map(plan.events.map((e) => [e.id, e]));
  let retained = 0;
  const calendar = data.calendar.filter((e) => {
    const p = originals.get(e.id);
    if (!p) return true;
    const untouched =
      e.date === p.date &&
      e.time === p.time &&
      e.endTime === p.endTime &&
      e.title === p.title &&
      e.reminder === p.reminder;
    if (!untouched) retained++;
    return !untouched;
  });
  return { calendar, assistantRoutines: routines.map((r) => (r.id === id ? { ...r, archived: true } : r)), retained };
}
