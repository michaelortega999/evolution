import { useEffect, useState, useCallback } from "react";

export type NutritionEntry = { date: string; calories: number; protein?: number; carbs?: number; fats?: number };
export type FitnessEntry = { date: string; workouts: number; label?: string };
export type InvestingEntry = { date: string; value: number };

export type DatasetKey = "nutrition" | "fitness" | "investing";

export interface EvolutionData {
  nutrition: NutritionEntry[];
  fitness: FitnessEntry[];
  investing: InvestingEntry[];
}

const STORAGE_KEY = "evolution:data:v1";

export const defaultData: EvolutionData = {
  nutrition: [
    { date: "2024-05-11", calories: 2200, protein: 150, carbs: 210, fats: 70 },
    { date: "2024-05-12", calories: 2410, protein: 160, carbs: 220, fats: 72 },
    { date: "2024-05-13", calories: 2350, protein: 155, carbs: 215, fats: 74 },
    { date: "2024-05-14", calories: 2500, protein: 170, carbs: 230, fats: 78 },
    { date: "2024-05-15", calories: 2280, protein: 158, carbs: 212, fats: 71 },
    { date: "2024-05-16", calories: 2390, protein: 165, carbs: 222, fats: 75 },
    { date: "2024-05-17", calories: 2350, protein: 165, carbs: 225, fats: 75 },
  ],
  fitness: [
    { date: "2024-05-13", workouts: 6, label: "M" },
    { date: "2024-05-14", workouts: 4, label: "T" },
    { date: "2024-05-15", workouts: 7, label: "W" },
    { date: "2024-05-16", workouts: 5, label: "T" },
    { date: "2024-05-17", workouts: 8, label: "F" },
    { date: "2024-05-18", workouts: 3, label: "S" },
    { date: "2024-05-19", workouts: 6, label: "S" },
  ],
  investing: [
    { date: "2024-01-01", value: 40_000_000 },
    { date: "2024-02-01", value: 42_000_000 },
    { date: "2024-03-01", value: 45_000_000 },
    { date: "2024-04-01", value: 50_000_000 },
    { date: "2024-05-01", value: 58_000_000 },
    { date: "2024-05-08", value: 62_000_000 },
    { date: "2024-05-15", value: 66_500_000 },
    { date: "2024-05-17", value: 68_420_000 },
  ],
};

function load(): EvolutionData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<EvolutionData>;
    return {
      nutrition: parsed.nutrition?.length ? parsed.nutrition : defaultData.nutrition,
      fitness: parsed.fitness?.length ? parsed.fitness : defaultData.fitness,
      investing: parsed.investing?.length ? parsed.investing : defaultData.investing,
    };
  } catch {
    return defaultData;
  }
}

function save(data: EvolutionData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("evolution:data-updated"));
}

export function useEvolutionData() {
  const [data, setData] = useState<EvolutionData>(defaultData);

  useEffect(() => {
    setData(load());
    const handler = () => setData(load());
    window.addEventListener("evolution:data-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("evolution:data-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((key: DatasetKey, rows: EvolutionData[DatasetKey]) => {
    const next = { ...load(), [key]: rows } as EvolutionData;
    save(next);
    setData(next);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("evolution:data-updated"));
    setData(defaultData);
  }, []);

  return { data, update, reset };
}

// ---------- Parsers ----------

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const splitLine = (l: string) => {
    const out: string[] = [];
    let cur = "", q = false;
    for (const ch of l) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim().replace(/^"|"$/g, ""));
  };
  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return NaN;
  return Number(v.replace(/[,$\s]/g, ""));
}

export function parseImport(
  text: string,
  filename: string,
  kind: DatasetKey,
): EvolutionData[DatasetKey] {
  const isJSON = filename.toLowerCase().endsWith(".json") || text.trim().startsWith("[") || text.trim().startsWith("{");
  let rows: Record<string, unknown>[];
  if (isJSON) {
    const parsed = JSON.parse(text);
    rows = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { data?: unknown }).data) ? (parsed as { data: Record<string, unknown>[] }).data : [];
  } else {
    rows = parseCSV(text);
  }
  if (!rows.length) throw new Error("No rows found in file");

  if (kind === "nutrition") {
    return rows
      .map((r) => ({
        date: String(r.date ?? r.day ?? ""),
        calories: num(r.calories ?? r.kcal ?? r.cal),
        protein: num(r.protein) || undefined,
        carbs: num(r.carbs) || undefined,
        fats: num(r.fats ?? r.fat) || undefined,
      }))
      .filter((r) => r.date && !Number.isNaN(r.calories)) as NutritionEntry[];
  }
  if (kind === "fitness") {
    return rows
      .map((r) => ({
        date: String(r.date ?? r.day ?? ""),
        workouts: num(r.workouts ?? r.count ?? r.sessions ?? r.value),
        label: (r.label as string) || undefined,
      }))
      .filter((r) => r.date && !Number.isNaN(r.workouts)) as FitnessEntry[];
  }
  return rows
    .map((r) => ({
      date: String(r.date ?? r.day ?? ""),
      value: num(r.value ?? r.portfolio ?? r.amount ?? r.balance),
    }))
    .filter((r) => r.date && !Number.isNaN(r.value)) as InvestingEntry[];
}

// ---------- Derived metrics ----------

export function nutritionSummary(rows: NutritionEntry[]) {
  const last = rows[rows.length - 1];
  const target = 2800;
  return {
    last,
    target,
    percent: last ? Math.min(100, Math.round((last.calories / target) * 100)) : 0,
  };
}

export function fitnessSummary(rows: FitnessEntry[]) {
  const last7 = rows.slice(-7);
  const daysHit = last7.filter((r) => r.workouts > 0).length;
  const target = 6;
  return {
    data: last7.map((r) => r.workouts),
    labels: last7.map((r, i) => r.label ?? ["M","T","W","T","F","S","S"][i] ?? ""),
    daysHit,
    target,
  };
}

export function investingSummary(rows: InvestingEntry[]) {
  const data = rows.map((r) => r.value);
  const current = data[data.length - 1] ?? 0;
  const prev = data[data.length - 2] ?? current;
  const change = current - prev;
  const pct = prev ? (change / prev) * 100 : 0;
  return { data, current, change, pct };
}
