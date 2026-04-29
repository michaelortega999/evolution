import { useEffect, useState, useCallback } from "react";

export type NutritionEntry = { date: string; calories: number; protein?: number; carbs?: number; fats?: number };
export type FitnessEntry = { date: string; workouts: number; label?: string };
export type InvestingEntry = { date: string; value: number };

export type DatasetKey = "nutrition" | "fitness" | "investing";

export type Meal = "ground_beef_rice" | "chicken_rice" | "greek_yogurt" | "broccoli";
export const MEALS: { key: Meal; label: string; kcal: number; p: number; c: number; f: number }[] = [
  { key: "ground_beef_rice", label: "Ground Beef & Rice", kcal: 450, p: 35, c: 35, f: 18 },
  { key: "chicken_rice", label: "Chicken & Rice", kcal: 380, p: 40, c: 38, f: 6 },
  { key: "greek_yogurt", label: "Greek Yogurt & Berries", kcal: 200, p: 20, c: 22, f: 2 },
  { key: "broccoli", label: "Broccoli", kcal: 150, p: 8, c: 18, f: 2 },
];

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export type Hobby = "Cars" | "Guitar" | "Travel";

export type GoalCategory = "Wealth" | "Fitness" | "Trading" | "Business" | "Nutrition" | "Hobby";
export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  target: number;
  current: number;
  deadline: string;
  unit?: string;
  completed: boolean;
}

export type ReminderOffset = 0 | 15 | 30 | 60 | 1440;

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  endTime?: string;
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

export type FocusMode = "focus" | "short" | "long";
export type FocusTag =
  | "Wealth" | "Nutrition" | "Fitness" | "Journal"
  | "Notes" | "Investing" | "Business" | "Hobby";

export const FOCUS_TAGS: FocusTag[] = [
  "Wealth", "Nutrition", "Fitness", "Journal",
  "Notes", "Investing", "Business", "Hobby",
];

export interface FocusSession {
  id: string;
  startedAt: number;
  completedAt: number;
  durationSec: number;
  mode: FocusMode;
  task: string;
  tag?: FocusTag;
}

export interface FocusSettings {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number;
}

export const defaultFocusSettings: FocusSettings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
};

export interface Profile {
  name: string;
  tradingBalance: number;
  goal: number;
  calorieTarget: number;
  gymSessionsTarget: number;
  bench: number;
  squat: number;
  deadlift: number;
  proteinTarget: number;
  mirror: [string, string, string];
  commitment: [string, string, string];
  onboarded: boolean;
  hologram: "bonsai" | "brain" | "earth";
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

// ============ NEW INTERACTIVE TYPES ============

export type WorkoutType = "Push" | "Pull" | "Legs" | "Cardio" | "Full Body";
export interface WorkoutLog {
  id: string;
  date: string;
  type: WorkoutType;
  durationMin: number;
  notes?: string;
}

export type PRLift = "bench" | "squat" | "deadlift";
export interface PREntry {
  id: string;
  date: string;
  lift: PRLift;
  weight: number;
}

export type StressLevel = "Low" | "Medium" | "High";
export interface RecoveryEntry {
  id: string;
  date: string;
  sleepHours: number;
  stress: StressLevel;
}

export type AssetCategory = "Cash" | "Investment" | "Property" | "Other";
export interface Asset {
  id: string;
  name: string;
  value: number;
  category: AssetCategory;
}

export type TxType = "income" | "expense";
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TxType;
  category: string;
}

export interface MealLog {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time?: string;        // "HH:MM"
  mealType?: MealType;  // Breakfast | Lunch | Dinner | Snack
}

export interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  category: string;
  done: boolean;
}

export interface WaterEntry {
  date: string;
  glasses: number;
}

export type Mood = "Great" | "Good" | "Neutral" | "Struggling" | "Difficult";
export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  text: string;
  mood: Mood;
  tags: string[];
}

export interface Reflection {
  id: string;
  date: string;
  wins: string;
  challenges: string;
  lessons: string;
}

export type NoteCategory = "Trading Ideas" | "Business" | "Fitness" | "General" | "YouTube" | "Instagram";
export const NOTE_CATEGORIES: NoteCategory[] = ["Trading Ideas", "Business", "Fitness", "General", "YouTube", "Instagram"];
export interface RichNote {
  id: string;
  date: string;
  title: string;
  body: string;
  category: NoteCategory;
}

export type Instrument = "MNQ" | "MES";
export type TradeDir = "Long" | "Short";
export interface Trade {
  id: string;
  date: string;
  instrument: Instrument;
  direction: TradeDir;
  entry: number;
  exit: number;
  contracts: number;
  pnl: number;
  notes?: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  price: number;
  notes?: string;
}

export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed";
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  revenueTarget: number;
}

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  category: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
export interface BizTask {
  id: string;
  text: string;
  priority: TaskPriority;
  due: string;
  category: string;
  done: boolean;
}

export interface CarMeet {
  id: string;
  date: string;
  location: string;
  cars: string;
  notes?: string;
}

export interface GuitarSession {
  id: string;
  date: string;
  durationMin: number;
  practiced: string;
}

export type TripStatus = "Planning" | "Booked" | "Completed";
export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  packing: { id: string; item: string; done: boolean }[];
}

export interface EvolutionData {
  profile: Profile;
  nutrition: NutritionEntry[];
  fitness: FitnessEntry[];
  investing: InvestingEntry[];
  meals: Meal[];
  notes: TodoItem[];
  journal: { date: string; text: string }[];
  hobby: { current: Hobby; hours: number };
  events: { date: string; text: string }[];
  goals: Goal[];
  calendar: CalendarEvent[];
  settings: Settings;
  focusSessions: FocusSession[];
  focusSettings: FocusSettings;

  // New
  workouts: WorkoutLog[];
  prHistory: PREntry[];
  recovery: RecoveryEntry[];
  assets: Asset[];
  transactions: Transaction[];
  mealLogs: MealLog[];
  grocery: GroceryItem[];
  water: WaterEntry[];
  journalEntries: JournalEntry[];
  reflections: Reflection[];
  richNotes: RichNote[];
  trades: Trade[];
  watchlist: WatchlistItem[];
  projects: Project[];
  revenue: RevenueEntry[];
  bizTasks: BizTask[];
  carMeets: CarMeet[];
  guitarSessions: GuitarSession[];
  trips: Trip[];
}

const STORAGE_KEY = "evolution:data:v2";

export const defaultProfile: Profile = {
  name: "Michael",
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
  hologram: "bonsai",
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
  notes: [
    { id: "n1", text: "Review Q2 plan", done: false },
    { id: "n2", text: "Call mom", done: false },
    { id: "n3", text: "Book flight", done: true },
  ],
  journal: [],
  hobby: { current: "Guitar", hours: 12.4 },
  events: [],
  goals: [],
  calendar: [],
  settings: {
    theme: "default",
    notifications: { daily: true, goals: true, journal: false },
  },
  focusSessions: [],
  focusSettings: defaultFocusSettings,

  workouts: [],
  prHistory: [],
  recovery: [],
  assets: [],
  transactions: [],
  mealLogs: [],
  grocery: [],
  water: [],
  journalEntries: [],
  reflections: [],
  richNotes: [],
  trades: [],
  watchlist: [],
  projects: [
    { id: "p1", name: "Evolution Platform", description: "Personal OS", status: "In Progress", progress: 72, deadline: "2025-12-31", revenueTarget: 18200 },
  ],
  revenue: [],
  bizTasks: [],
  carMeets: [],
  guitarSessions: [],
  trips: [],
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
      notes: (() => {
        const r = (parsed as { notes?: unknown }).notes;
        if (!Array.isArray(r)) return defaultData.notes;
        return r.map((n, i) =>
          typeof n === "string"
            ? { id: `n-legacy-${i}-${Date.now()}`, text: n, done: false }
            : (n as TodoItem)
        );
      })(),
      journal: parsed.journal ?? [],
      hobby: parsed.hobby ?? defaultData.hobby,
      events: parsed.events ?? [],
      goals: parsed.goals ?? [],
      calendar: parsed.calendar ?? [],
      settings: { ...defaultData.settings, ...(parsed.settings ?? {}) },
      focusSessions: parsed.focusSessions ?? [],
      focusSettings: { ...defaultFocusSettings, ...(parsed.focusSettings ?? {}) },
      workouts: parsed.workouts ?? [],
      prHistory: parsed.prHistory ?? [],
      recovery: parsed.recovery ?? [],
      assets: parsed.assets ?? [],
      transactions: parsed.transactions ?? [],
      mealLogs: parsed.mealLogs ?? [],
      grocery: parsed.grocery ?? [],
      water: parsed.water ?? [],
      journalEntries: parsed.journalEntries ?? [],
      reflections: parsed.reflections ?? [],
      richNotes: parsed.richNotes ?? [],
      trades: parsed.trades ?? [],
      watchlist: parsed.watchlist ?? [],
      projects: parsed.projects ?? defaultData.projects,
      revenue: parsed.revenue ?? [],
      bizTasks: parsed.bizTasks ?? [],
      carMeets: parsed.carMeets ?? [],
      guitarSessions: parsed.guitarSessions ?? [],
      trips: parsed.trips ?? [],
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

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
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

export function nutritionSummary(rows: NutritionEntry[], meals: Meal[], target: number, mealLogs: MealLog[] = []) {
  const today = todayDate();
  const todayLogs = mealLogs.filter((m) => m.date === today);
  const loggedQuick = mealTotals(meals);
  const loggedCustom = todayLogs.reduce((acc, m) => ({
    kcal: acc.kcal + m.calories, p: acc.p + m.protein, c: acc.c + m.carbs, f: acc.f + m.fats,
  }), { kcal: 0, p: 0, c: 0, f: 0 });
  const last = rows[rows.length - 1];
  const kcal = (loggedQuick.kcal + loggedCustom.kcal) || last?.calories || 0;
  const protein = (loggedQuick.p + loggedCustom.p) || last?.protein || 0;
  const carbs = (loggedQuick.c + loggedCustom.c) || last?.carbs || 0;
  const fats = (loggedQuick.f + loggedCustom.f) || last?.fats || 0;
  return {
    last,
    target,
    calories: kcal,
    protein,
    carbs,
    fats,
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
