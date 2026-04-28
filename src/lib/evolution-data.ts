import { useEffect, useState, useCallback } from "react";

export type NutritionEntry = { date: string; calories: number; protein?: number; carbs?: number; fats?: number };
export type FitnessEntry = { date: string; workouts: number; label?: string };
export type InvestingEntry = { date: string; value: number };

export type DatasetKey = "nutrition" | "fitness" | "investing";

export type Meal = "ground_beef_rice" | "chicken_rice" | "greek_yogurt" | "broccoli";
export const MEALS: { key: Meal; label: string; kcal: number; p: number; c: number; f: number }[] = [
  { key: "ground_beef_rice", label: "Ground Beef & Rice", kcal: 650, p: 45, c: 70, f: 18 },
  { key: "chicken_rice", label: "Chicken & Rice", kcal: 550, p: 50, c: 75, f: 8 },
  { key: "greek_yogurt", label: "Greek Yogurt", kcal: 180, p: 18, c: 12, f: 6 },
  { key: "broccoli", label: "Broccoli", kcal: 55, p: 4, c: 11, f: 1 },
];

export type Hobby = "Cars" | "Guitar" | "Travel";

export type GoalCategory = "Wealth" | "Fitness" | "Trading" | "Business" | "Nutrition" | "Hobby";
export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  target: number;
  current: number;
  deadline: string; // YYYY-MM-DD
  unit?: string;
  completed: boolean;
}

export type ReminderOffset = 0 | 15 | 30 | 60 | 1440; // minutes before; 0 = none

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (start)
  endTime?: string; // HH:MM (end, optional — defaults to start + 60min in views)
  title: string;
  reminder?: ReminderOffset;
}

export type ThemeKey = "default" | "gold" | "green" | "red" | "purple" | "white";

export interface Settings {
  theme: ThemeKey;
  notifications: {
    daily: boolean;
    goals: boolean;
    journal: boolean;
  };
}

export interface Profile {
  name: string;
  tradingBalance: number;
  goal: number; // portfolio goal
  calorieTarget: number;
  gymSessionsTarget: number;
  bench: number;
  squat: number;
  deadlift: number;
  proteinTarget: number;
  mirror: [string, string, string];
  commitment: [string, string, string];
  onboarded: boolean;
}

export interface EvolutionData {
  profile: Profile;
  nutrition: NutritionEntry[];
  fitness: FitnessEntry[];
  investing: InvestingEntry[];
  meals: Meal[]; // meals logged today
  notes: string[];
  journal: { date: string; text: string }[];
  hobby: { current: Hobby; hours: number };
  events: { date: string; text: string }[];
  goals: Goal[];
  calendar: CalendarEvent[];
  settings: Settings;
}

const STORAGE_KEY = "evolution:data:v2";

export const defaultProfile: Profile = {
  name: "",
  tradingBalance: 1100,
  goal: 50000,
  calorieTarget: 2000,
  gymSessionsTarget: 4,
  bench: 225,
  squat: 250,
  deadlift: 280,
  proteinTarget: 160,
  mirror: ["", "", ""],
  commitment: ["", "", ""],
  onboarded: false,
};

export const defaultData: EvolutionData = {
  profile: defaultProfile,
  nutrition: [
    { date: "2024-05-11", calories: 1820, protein: 150, carbs: 180, fats: 55 },
    { date: "2024-05-12", calories: 1910, protein: 160, carbs: 185, fats: 58 },
    { date: "2024-05-13", calories: 1750, protein: 145, carbs: 175, fats: 52 },
    { date: "2024-05-14", calories: 2050, protein: 170, carbs: 200, fats: 62 },
    { date: "2024-05-15", calories: 1680, protein: 158, carbs: 165, fats: 50 },
    { date: "2024-05-16", calories: 1890, protein: 165, carbs: 180, fats: 56 },
    { date: "2024-05-17", calories: 1680, protein: 140, carbs: 170, fats: 48 },
  ],
  fitness: [
    { date: "2024-05-13", workouts: 1, label: "M" },
    { date: "2024-05-14", workouts: 0, label: "T" },
    { date: "2024-05-15", workouts: 1, label: "W" },
    { date: "2024-05-16", workouts: 1, label: "T" },
    { date: "2024-05-17", workouts: 0, label: "F" },
    { date: "2024-05-18", workouts: 1, label: "S" },
    { date: "2024-05-19", workouts: 0, label: "S" },
  ],
  investing: [
    { date: "2024-01-01", value: 1100 },
    { date: "2024-02-01", value: 1280 },
    { date: "2024-03-01", value: 1450 },
    { date: "2024-04-01", value: 1720 },
    { date: "2024-04-15", value: 1650 },
    { date: "2024-05-01", value: 1980 },
    { date: "2024-05-08", value: 2210 },
    { date: "2024-05-15", value: 2480 },
    { date: "2024-05-17", value: 2640 },
  ],
  meals: [],
  notes: ["Review Q2 plan", "Call mom", "Book flight"],
  journal: [
    { date: "2024-05-17", text: "Discipline is choosing between what you want now and what you want most." },
  ],
  hobby: { current: "Guitar", hours: 12.4 },
  events: [],
  goals: [],
  calendar: [],
  settings: {
    theme: "default",
    notifications: { daily: true, goals: true, journal: false },
  },
};

function load(): EvolutionData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<EvolutionData>;
    return {
      ...defaultData,
      ...parsed,
      profile: { ...defaultProfile, ...(parsed.profile ?? {}) },
      nutrition: parsed.nutrition?.length ? parsed.nutrition : defaultData.nutrition,
      fitness: parsed.fitness?.length ? parsed.fitness : defaultData.fitness,
      investing: parsed.investing?.length ? parsed.investing : defaultData.investing,
      meals: parsed.meals ?? [],
      notes: parsed.notes ?? defaultData.notes,
      journal: parsed.journal?.length ? parsed.journal : defaultData.journal,
      hobby: parsed.hobby ?? defaultData.hobby,
      events: parsed.events ?? [],
      goals: parsed.goals ?? [],
      calendar: parsed.calendar ?? [],
      settings: { ...defaultData.settings, ...(parsed.settings ?? {}) },
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

  const mutate = useCallback((patch: Partial<EvolutionData> | ((prev: EvolutionData) => Partial<EvolutionData>)) => {
    const prev = load();
    const delta = typeof patch === "function" ? patch(prev) : patch;
    const next = { ...prev, ...delta };
    save(next);
    setData(next);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    const prev = load();
    const next = { ...prev, profile: { ...prev.profile, ...patch } };
    save(next);
    setData(next);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("evolution:data-updated"));
    setData(defaultData);
  }, []);

  return { data, mutate, updateProfile, reset };
}

// ---------- Derived metrics ----------

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function mealTotals(meals: Meal[]) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const m of meals) {
    const item = MEALS.find((x) => x.key === m);
    if (!item) continue;
    t.kcal += item.kcal; t.p += item.p; t.c += item.c; t.f += item.f;
  }
  return t;
}

export function nutritionSummary(rows: NutritionEntry[], meals: Meal[], target: number) {
  const logged = mealTotals(meals);
  const last = rows[rows.length - 1];
  const kcal = logged.kcal || last?.calories || 0;
  return {
    last,
    target,
    calories: kcal,
    protein: logged.p || last?.protein || 0,
    carbs: logged.c || last?.carbs || 0,
    fats: logged.f || last?.fats || 0,
    percent: Math.min(100, Math.round((kcal / target) * 100)),
  };
}

export function fitnessSummary(rows: FitnessEntry[], target: number) {
  const last7 = rows.slice(-7);
  const daysHit = last7.filter((r) => r.workouts > 0).length;
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

export function todayDate() { return today(); }
