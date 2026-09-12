import { useEffect, useState } from "react";

// Global selected month for cross-module filtering (dashboard MonthSelector).
// Stored 0-indexed month + year. Persists in localStorage.

const STORAGE_KEY = "evolution:selectedMonth";
const listeners = new Set<() => void>();

type State = { year: number; month: number };

function todayState(): State {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

let current: State = todayState();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<State>;
      if (typeof p.year === "number" && typeof p.month === "number") {
        const storedIdx = p.year * 12 + p.month;
        const todayIdx = current.year * 12 + current.month;
        // Auto-roll forward with the real calendar: a stored month that is now
        // in the past is replaced by the current month (e.g. SEP -> OCT).
        current = storedIdx < todayIdx ? todayState() : { year: p.year, month: p.month };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
    }
  } catch {}
}

function emit() {
  listeners.forEach((l) => l());
}

export function setSelectedMonth(month: number, year?: number) {
  const y = year ?? current.year;
  current = { year: y, month };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }
  emit();
}

export function useSelectedMonth() {
  const [state, setState] = useState<State>(current);
  useEffect(() => {
    const l = () => setState(current);
    listeners.add(l);
    // Keep the selection tied to the real date: if the calendar month rolls
    // over while the app is open, advance automatically.
    const t = setInterval(() => {
      const tdy = todayState();
      if (tdy.year * 12 + tdy.month > current.year * 12 + current.month) {
        setSelectedMonth(tdy.month, tdy.year);
      }
    }, 60_000);
    return () => {
      listeners.delete(l);
      clearInterval(t);
    };
  }, []);
  const key = `${state.year}-${String(state.month + 1).padStart(2, "0")}`;
  return {
    year: state.year,
    month: state.month,
    key, // "YYYY-MM"
    setMonth: (m: number, y?: number) => setSelectedMonth(m, y),
  };
}

export const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
