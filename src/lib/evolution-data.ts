import { localISO } from "./utils";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";


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

export type Hobby = "Cars" | "Guitar" | "Travel" | "Photography" | "Videography" | "Art";

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

export type ThemeKey = "default" | "gold" | "orange" | "green" | "red" | "purple" | "white" | "black";

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
  | "Notes" | "Investing" | "Business" | "Hobby" | "Guitar";

export const FOCUS_TAGS: FocusTag[] = [
  "Wealth", "Nutrition", "Fitness", "Journal",
  "Notes", "Investing", "Business", "Hobby", "Guitar",
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
  backrow: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTarget: number;
  mirror: [string, string, string];
  commitment: [string, string, string];
  onboarded: boolean;
  hologram: "bonsai" | "brain" | "earth" | "jarvis";
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

export type PRLift = "bench" | "squat" | "backrow";
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

// Weekly recurring training schedule (Mon..Sun)
export interface TrainingSlot {
  id: string;
  dayOfWeek: number; // 0=Mon..6=Sun
  time: string;      // "HH:MM"
  endTime: string;   // "HH:MM"
  title: string;     // e.g. "Push Day"
  type: WorkoutType;
}

export type AssetCategory = "Cash" | "Investment" | "Property" | "Other";
export interface Asset {
  id: string;
  name: string;
  value: number;
  category: AssetCategory;
  date?: string;
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
  unit?: string;   // lbs | oz | cups | pieces
  cost?: number;   // optional estimated cost
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
export type TradeGrade = "A+" | "B+" | "C-" | "F";
export const TRADE_GRADES: TradeGrade[] = ["A+", "B+", "C-", "F"];
export interface Trade {
  id: string;
  date: string;
  time?: string;
  instrument: Instrument;
  direction: TradeDir;
  entry: number;
  exit: number;
  contracts: number;
  pnl: number;
  notes?: string;
  strategyId?: string;
  grade?: TradeGrade;
  screenshot?: string;
}

export type StrategyStatus = "Active" | "In Development" | "Backtesting" | "Retired";
export const STRATEGY_STATUSES: StrategyStatus[] = ["Active", "In Development", "Backtesting", "Retired"];
export type StrategySession = "Asia" | "London" | "New York AM" | "Other";
export const STRATEGY_SESSIONS: StrategySession[] = ["Asia", "London", "New York AM", "Other"];
export interface TradeStrategy {
  id: string;
  number: string;           // "001"
  name: string;             // "Asia Sweep"
  status: StrategyStatus;
  session: StrategySession;
  entryTrigger: string;
  target: string;
  maxRisk: number;
  dailyLossLimit: number;
  weeklyLossLimit: number;
  timeExit: string;
  instruments: "MNQ" | "MES" | "Both";
  notes: string;
  grades: Record<TradeGrade, string>;
  backtest: {
    netProfitPct: number;
    winRate: number;
    totalTrades: number;
    sharpe: number;
    maxDrawdown: number;
  };
}

export const TRADING_START_BALANCE = 835;

// ---------- Trading Accounts (source of truth for trading assets) ----------
export interface TradingAccount {
  id: string;
  name: string;         // "TradeDay Funded"
  company: string;      // short logo mark, e.g. "TD"
  size: number;         // funded account size, e.g. 50000
  startingBalance: number;
  createdDate: string;  // YYYY-MM-DD
}

export type TradingTxType = "profit" | "loss";
export interface TradingTx {
  id: string;
  accountId: string;
  date: string;         // YYYY-MM-DD
  time?: string;
  type: TradingTxType;
  amount: number;       // positive; sign derived from type
  notes?: string;
}

export type TradingSessionKind = "Asia" | "London" | "New York";
export const TRADING_SESSIONS: TradingSessionKind[] = ["Asia", "London", "New York"];
export interface TradeJournalEntry {
  id: string;
  date: string;
  session: TradingSessionKind;
  review: string;
  tags: string[];
  pnl: number;
  image?: string;
  imageFit?: "cover" | "contain";
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

export type TripStatus = "Planning" | "Booked" | "In Progress" | "Completed";
export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  notes?: string;
  packing: { id: string; item: string; done: boolean }[];
}

// ---------- Cars ----------
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  purchasePrice: number;
  currentValue: number;
}

export type CarExpenseType = "Gas" | "Insurance" | "Maintenance" | "Modification" | "Parking" | "Registration" | "Other";
export const CAR_EXPENSE_TYPES: CarExpenseType[] = ["Gas", "Insurance", "Maintenance", "Modification", "Parking", "Registration", "Other"];
export interface CarExpense {
  id: string;
  carId: string;
  date: string;
  type: CarExpenseType;
  amount: number;
  notes?: string;
  // Gas-specific
  gallons?: number;
  pricePerGallon?: number;
  mileage?: number;
  // Linked transaction id in wealth
  txId?: string;
}

export type CarEventRsvp = "None" | "Interested" | "Going" | "Attended";
export interface CarEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  rsvp: CarEventRsvp;
  seed?: boolean; // built-in seed event
  calendarId?: string; // linked calendar event id
}

// ---------- Guitar ----------
export type SkillLevel = "Beginner" | "Developing" | "Intermediate" | "Advanced" | "Mastered";
export const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Developing", "Intermediate", "Advanced", "Mastered"];
export interface GuitarSkill {
  id: string;
  name: string;
  level: SkillLevel;
}
export interface GuitarSong {
  id: string;
  title: string;
  artist: string;
  progress: number; // 0–100
  targetDate: string;
}

// ---------- Custom hobbies ----------
export interface CustomHobby {
  id: string;
  name: string;
  icon: string; // emoji
  weeklyHoursTarget: number;
  hours: number;
}

export interface EvolutionData {
  supplementList?: { id: string; name: string; time: string; dose: string }[];
  supplementDone?: Record<string, string[]>;
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
  strategies: TradeStrategy[];
  watchlist: WatchlistItem[];
  projects: Project[];
  revenue: RevenueEntry[];
  bizTasks: BizTask[];
  carMeets: CarMeet[];
  guitarSessions: GuitarSession[];
  trips: Trip[];

  // Hobby hub
  cars: Car[];
  carExpenses: CarExpense[];
  carEvents: CarEvent[];
  guitarSkills: GuitarSkill[];
  guitarSongs: GuitarSong[];
  guitarWeeklyHoursTarget: number;
  customHobbies: CustomHobby[];
  weeklyHobbyTargets: { travel: number; cars: number; guitar: number };
  trainingSchedule: TrainingSlot[];
  netWorthSnapshots: NetWorthSnapshot[];
  evoTasks: EvoTask[];
  habitLog: Record<string, string[]>;
  customHabits: EvoHabit[];
  habitOrder: string[];
  hiddenHabits: string[];
  timeLogs: TimeLog[];
  tradingAccounts: TradingAccount[];
  tradingTxns: TradingTx[];
  tradeJournal: TradeJournalEntry[];
}

export interface EvoHabit {
  id: string;
  name: string;
  category: EvoCategory;
  emoji?: string;
  timeFactor?: { minutes: number; module: EvoCategory };
}

export interface TimeLog {
  id: string;
  date: string;        // YYYY-MM-DD
  minutes: number;
  module: EvoCategory;
  habitId?: string;
  source: "habit" | "focus";
  label: string;
  ts: number;
}


export type EvoCategory =
  | "Wealth" | "Nutrition" | "Fitness" | "Journal"
  | "Notes" | "Investing" | "Business" | "Hobby";

export type EvoTaskPriority = "High" | "Medium" | "Low";
export type EvoTaskStatus = "Not Started" | "In Progress" | "Done";
export interface EvoTask {
  id: string;
  text: string;
  category: EvoCategory;
  priority: EvoTaskPriority;
  due: string;
  status: EvoTaskStatus;
}

export interface NetWorthSnapshot {
  id: string;
  monthKey: string; // YYYY-MM
  value: number;
}


const STORAGE_KEY = "evolution:data:v2";
export const STORAGE_VERSION = 6;

type StoredShape = Partial<EvolutionData> & { _version?: number };

// Future migrations: add cases as the schema evolves.
function migrate(parsed: StoredShape): StoredShape {
  const v = parsed._version ?? 1;
  if (v === STORAGE_VERSION) return parsed;
  const next: StoredShape = { ...parsed };
  // Older versions used to wipe wealth/revenue/trading records here. That was destructive and has
  // been removed: valid legacy records are kept as-is; only genuinely missing structures get defaults
  // (hydrate fills them). Nothing is deleted or reassigned.
  if (!Array.isArray(next.tradingAccounts)) next.tradingAccounts = undefined;
  next._version = STORAGE_VERSION;
  return next;
}


export const defaultProfile: Profile = {
  name: "Michael",
  tradingBalance: 1100,
  goal: 50000,
  calorieTarget: 2000,
  gymSessionsTarget: 4,
  bench: 225,
  squat: 250,
  backrow: 280,
  proteinTarget: 160,
  carbsTarget: 220,
  fatsTarget: 65,
  waterTarget: 8,
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
  strategies: [
    {
      id: "strat-001",
      number: "001",
      name: "Asia Sweep",
      status: "Active",
      session: "Asia",
      entryTrigger: "Price sweeps Asia high or low by 2+ points, enters immediately in opposing direction",
      target: "Opposite Asia level (full range)",
      maxRisk: 100,
      dailyLossLimit: 200,
      weeklyLossLimit: 600,
      timeExit: "11:30",
      instruments: "Both",
      notes: "Asia (7 PM CT — 1 AM CT) + London open. MNQ + MES, 1 contract each, independent.",
      grades: {
        "A+": "Sharp fast sweep, price runs immediately with conviction before 10 AM CT, under 1 hour",
        "B+": "Price sweeps, hovers and retests the level but holds, eventually runs to target",
        "C-": "Price takes too long, doesn't reach opposing liquidity until next session",
        "F": "Price completely ignores opposing liquidity, trends away in sweep direction",
      },
      backtest: { netProfitPct: 0, winRate: 0, totalTrades: 0, sharpe: 0, maxDrawdown: 0 },
    },
  ],
  watchlist: [],
  projects: [
    { id: "p1", name: "Evolution Platform", description: "Personal OS", status: "In Progress", progress: 72, deadline: "2025-12-31", revenueTarget: 18200 },
  ],
  revenue: [],
  bizTasks: [],
  carMeets: [],
  guitarSessions: [],
  trips: [],

  cars: [],
  carExpenses: [],
  carEvents: [
    { id: "ce-seed-1", name: "Cars & Coffee — Downtown", date: nextSatISO(), location: "Main St Plaza", description: "Weekly enthusiast meet, 7–10am.", rsvp: "None", seed: true },
    { id: "ce-seed-2", name: "Radwood Classic Show", date: futureISO(21), location: "Convention Center", description: "80s & 90s rad-era classics.", rsvp: "None", seed: true },
    { id: "ce-seed-3", name: "JDM Sunday Drive", date: futureISO(14), location: "Canyon Loop", description: "Spirited drive + breakfast stop.", rsvp: "None", seed: true },
    { id: "ce-seed-4", name: "Local Auto-X Round", date: futureISO(28), location: "Speedway South Lot", description: "Run what you brung, helmets required.", rsvp: "None", seed: true },
    { id: "ce-seed-5", name: "Euro Meet", date: futureISO(35), location: "Riverside Park", description: "BMW, Porsche, Audi enthusiasts.", rsvp: "None", seed: true },
    { id: "ce-seed-6", name: "Track Day — Beginner Friendly", date: futureISO(42), location: "Raceway Park", description: "HPDE, all skill levels welcome.", rsvp: "None", seed: true },
  ],
  netWorthSnapshots: [],

  guitarSkills: [],
  guitarSongs: [],
  guitarWeeklyHoursTarget: 5,
  customHobbies: [],
  weeklyHobbyTargets: { travel: 2, cars: 3, guitar: 5 },
  trainingSchedule: [
    { id: "ts-1", dayOfWeek: 0, time: "07:00", endTime: "08:00", title: "Push Day", type: "Push" },
    { id: "ts-2", dayOfWeek: 1, time: "07:00", endTime: "08:00", title: "Pull Day", type: "Pull" },
    { id: "ts-3", dayOfWeek: 2, time: "07:00", endTime: "08:00", title: "Leg Day", type: "Legs" },
    { id: "ts-4", dayOfWeek: 3, time: "18:00", endTime: "18:45", title: "Cardio", type: "Cardio" },
    { id: "ts-5", dayOfWeek: 4, time: "07:00", endTime: "08:00", title: "Full Body", type: "Full Body" },
  ],
  evoTasks: [],
  habitLog: {},
  customHabits: [],
  habitOrder: [],
  hiddenHabits: [],
  timeLogs: [],
  tradingAccounts: seedTradingAccounts(),
  tradingTxns: seedTradingTxns(),
  tradeJournal: seedTradeJournal(),
};

function _today(): string { return localISO(new Date()); }
function _firstOfMonth(): string {
  const d = new Date(); d.setDate(1);
  return localISO(d);
}
function _midMonth(): string {
  const d = new Date(); d.setDate(Math.max(2, Math.floor(d.getDate() / 2)));
  return localISO(d);
}

function seedTradingAccounts(): TradingAccount[] {
  return [
    { id: "acc-tradeday", name: "TradeDay Funded", company: "TD", size: 50000, startingBalance: 50000, createdDate: _firstOfMonth() },
  ];
}
function seedTradingTxns(): TradingTx[] {
  return [];
}
function seedTradeJournal(): TradeJournalEntry[] {
  return [];
}


function futureISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return localISO(d);
}
function nextSatISO(): string {
  const d = new Date();
  const diff = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return localISO(d);
}

function hydrate(parsed: StoredShape): EvolutionData {
  const loaded: EvolutionData = {
    ...defaultData,
    ...parsed,
    profile: { ...defaultProfile, ...(parsed.profile ?? {}) },
    nutrition: Array.isArray(parsed.nutrition) ? parsed.nutrition : defaultData.nutrition,
    fitness: Array.isArray(parsed.fitness) ? parsed.fitness : defaultData.fitness,
    investing: Array.isArray(parsed.investing) ? parsed.investing : defaultData.investing,
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
    strategies: Array.isArray(parsed.strategies) ? parsed.strategies : defaultData.strategies,
    watchlist: parsed.watchlist ?? [],
    projects: parsed.projects ?? defaultData.projects,
    revenue: parsed.revenue ?? [],
    bizTasks: parsed.bizTasks ?? [],
    carMeets: parsed.carMeets ?? [],
    guitarSessions: parsed.guitarSessions ?? [],
    trips: parsed.trips ?? [],
    cars: parsed.cars ?? [],
    carExpenses: parsed.carExpenses ?? [],
    carEvents: Array.isArray(parsed.carEvents) ? parsed.carEvents : defaultData.carEvents,
    guitarSkills: parsed.guitarSkills ?? [],
    guitarSongs: parsed.guitarSongs ?? [],
    guitarWeeklyHoursTarget: parsed.guitarWeeklyHoursTarget ?? 5,
    customHobbies: parsed.customHobbies ?? [],
    weeklyHobbyTargets: { ...defaultData.weeklyHobbyTargets, ...(parsed.weeklyHobbyTargets ?? {}) },
    trainingSchedule: parsed.trainingSchedule ?? defaultData.trainingSchedule,
    netWorthSnapshots: parsed.netWorthSnapshots ?? [],
    evoTasks: parsed.evoTasks ?? [],
    habitLog: parsed.habitLog ?? {},
    customHabits: parsed.customHabits ?? [],
    habitOrder: parsed.habitOrder ?? [],
    hiddenHabits: parsed.hiddenHabits ?? [],
    timeLogs: parsed.timeLogs ?? [],
    tradingAccounts: parsed.tradingAccounts ?? defaultData.tradingAccounts,
    tradingTxns: parsed.tradingTxns ?? defaultData.tradingTxns,
    tradeJournal: parsed.tradeJournal ?? defaultData.tradeJournal,
    supplementList: Array.isArray(parsed.supplementList) ? parsed.supplementList : defaultData.supplementList,
    supplementDone: parsed.supplementDone && typeof parsed.supplementDone === "object" ? parsed.supplementDone : defaultData.supplementDone,
  };
  return syncTradingAssets(loaded);
}

export function loadEvolutionData(): EvolutionData { return load(); }
export function saveEvolutionData(d: EvolutionData) { save(d); }

function load(): EvolutionData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return hydrate(migrate(JSON.parse(raw) as StoredShape));
  } catch {
    return defaultData;
  }
}

// ------------- Cloud sync -------------
// Safety rules:
//  • Nothing is pushed until the account's cloud copy has been read successfully.
//  • A failed read never counts as an "empty account" (so the cloud is never overwritten on error).
//  • Local data is tagged with its owner. When a different account signs in, the previous
//    owner's local data is archived (evolution:data:backup:<owner>) BEFORE anything is read,
//    so it is never shown to, merged into, or uploaded for the new account.
//  • A per-account "synced snapshot" (last state the cloud acknowledged) is the merge base:
//    local edits since then (including edits made offline, during a failed read, across retries
//    or before a reload) are applied record-by-record on top of the cloud copy — unrelated
//    remote records are never replaced.
//  • Failed saves keep the local changes dirty (snapshot not advanced) and retry later.
export const OWNER_KEY = "evolution:data:owner";
const BACKUP_PREFIX = "evolution:data:backup:";
const SYNCED_PREFIX = "evolution:data:synced:";
export type CloudStatus = "signed-out" | "loading" | "synced" | "saving" | "error";
let cloudStatus: CloudStatus = "loading";
let cloudUserId: string | null = null;      // pushes allowed only for this user
let activatingFor: string | null = null;    // user currently being loaded
let loadBaseline: { uid: string; data: EvolutionData } | null = null; // kept across retries
let cloudSaveTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
let pendingSave: { uid: string; data: EvolutionData } | null = null;
// Single-flight writes: one upsert at a time; later edits coalesce into `queuedPush` (latest wins).
// `cloudGen` changes on every activation/sign-out so stale completions can't touch a new session.
let cloudGen = 0;
let localRev = 0;                            // bumps on every local write
let pushInFlight: Promise<boolean> | null = null;
let queuedPush: { uid: string; gen: number } | null = null;
let pulling = false;                         // an activation read is in flight
let activationTimer: ReturnType<typeof setTimeout> | null = null;
let readyResolved = false;
let resolveCloudReady: () => void = () => {};
/** Resolves once the signed-in user's cloud data has been pulled (or no session / load failed). */
export const cloudReady: Promise<void> =
  typeof window === "undefined" ? Promise.resolve() : new Promise((r) => { resolveCloudReady = r; });
function markReady() {
  if (readyResolved) return;
  readyResolved = true;
  resolveCloudReady();
}
function setCloudStatus(s: CloudStatus) {
  cloudStatus = s;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("evolution:cloud-status", { detail: s }));
}
export function getCloudStatus(): CloudStatus { return cloudStatus; }
export function getLocalOwner(): string | null {
  try { return localStorage.getItem(OWNER_KEY); } catch { return null; }
}

const sameJSON = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const isIdArray = (v: unknown): v is { id: unknown }[] =>
  Array.isArray(v) && v.length > 0 && v.every((x) => x && typeof x === "object" && "id" in (x as object));
const isPlainObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function mergeById(b: unknown[], l: unknown[], r: unknown[]): unknown[] {
  const key = (x: unknown) => String((x as { id: unknown }).id);
  const B = new Map(b.map((x) => [key(x), x])), L = new Map(l.map((x) => [key(x), x])), R = new Map(r.map((x) => [key(x), x]));
  const order = [...r.map(key), ...l.map(key).filter((k) => !R.has(k))];
  const out: unknown[] = [];
  for (const k of order) {
    const lb = B.get(k), ll = L.get(k), lr = R.get(k);
    if (ll !== undefined && lr !== undefined) out.push(lb !== undefined && sameJSON(ll, lb) ? lr : ll);
    else if (ll !== undefined) { if (lb === undefined || !sameJSON(ll, lb)) out.push(ll); }       // local add / local edit of remote-deleted
    else if (lr !== undefined) { if (lb === undefined || !sameJSON(lr, lb)) out.push(lr); }       // remote add / keep if remote edited it
  }
  return out;
}

function mergeValue(b: unknown, l: unknown, r: unknown, depth: number): unknown {
  if (sameJSON(l, b)) return r;          // not changed locally → cloud
  if (sameJSON(r, b)) return l;          // changed locally only → local
  const arr = (x: unknown) => (Array.isArray(x) ? x : []);
  if ((isIdArray(l) || isIdArray(r) || isIdArray(b)) && [b, l, r].every((x) => x === undefined || Array.isArray(x)))
    return mergeById(arr(b), arr(l), arr(r));
  if (depth < 2 && isPlainObj(l) && isPlainObj(r)) {
    const bo = isPlainObj(b) ? b : {};
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) {
      const v = mergeValue(bo[k], l[k], r[k], depth + 1);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return l;                              // true conflict on a scalar → this device's latest edit
}

/** Three-way merge of whole data sets: local edits since `base` applied on top of `remote`. */
export function mergeEvolutionData(base: EvolutionData, local: EvolutionData, remote: EvolutionData): EvolutionData {
  return hydrate(mergeValue(base, local, remote, 0) as StoredShape);
}

function readSynced(uid: string): EvolutionData | null {
  try {
    const raw = localStorage.getItem(SYNCED_PREFIX + uid);
    return raw ? hydrate(migrate(JSON.parse(raw) as StoredShape)) : null;
  } catch { return null; }
}
function writeSynced(uid: string, data: EvolutionData) {
  try { localStorage.setItem(SYNCED_PREFIX + uid, JSON.stringify({ ...data, _version: STORAGE_VERSION })); }
  catch { try { localStorage.removeItem(SYNCED_PREFIX + uid); } catch { /* ignore */ } }
}

type PullResult = { kind: "ok"; data: EvolutionData } | { kind: "empty" } | { kind: "error" };
async function pullCloud(userId: string): Promise<PullResult> {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { kind: "error" };
    if (!data) return { kind: "empty" };
    return { kind: "ok", data: hydrate(migrate((data.data ?? {}) as StoredShape)) };
  } catch {
    return { kind: "error" };
  }
}

function scheduleRetry(uid: string) {
  if (retryTimer) clearTimeout(retryTimer);
  const delay = Math.min(60_000, 3000 * 2 ** retryCount++);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (cloudUserId === uid && getLocalOwner() === uid) void pushCloud(uid, load());
  }, delay);
}

/** Single-flight upload. If a write is in flight, the latest local data is queued and sent after it. */
function pushCloud(userId: string, data: EvolutionData): Promise<boolean> {
  if (cloudUserId !== userId || getLocalOwner() !== userId) return Promise.resolve(false); // account changed
  const gen = cloudGen;
  const rev = localRev;
  if (pushInFlight) {
    queuedPush = { uid: userId, gen }; // coalesced: re-reads the latest local data when it runs
    setCloudStatus("saving");
    return pushInFlight;
  }
  const run = (async () => {
    setCloudStatus("saving");
    let ok = false;
    try {
      const payload = JSON.parse(JSON.stringify({ ...data, _version: STORAGE_VERSION }));
      const { error } = await supabase.from("user_data").upsert({ user_id: userId, data: payload });
      ok = !error;
    } catch { ok = false; }
    const current = gen === cloudGen && cloudUserId === userId && getLocalOwner() === userId;
    if (ok && current) {
      writeSynced(userId, data);        // this exact payload acknowledged → new merge base
      retryCount = 0;
    }
    return { ok, current };
  })().then(({ ok, current }) => {
    pushInFlight = null;
    const q = queuedPush;
    queuedPush = null;
    const qValid = !!q && q.gen === cloudGen && cloudUserId === q.uid && getLocalOwner() === q.uid;
    if (!current) {
      if (qValid) void pushCloud(q!.uid, load());
      return ok;
    }
    if (!ok) {
      // Offline / rejected: local copy stays dirty (snapshot not advanced) and is retried with latest data.
      setCloudStatus("error"); scheduleRetry(userId);
      return false;
    }
    if (qValid || (localRev !== rev && !pendingSave)) void pushCloud(userId, load());
    else setCloudStatus(pendingSave ? "saving" : "synced");
    return true;
  });
  pushInFlight = run;
  return run;
}

function cancelPendingSave() {
  if (cloudSaveTimer) clearTimeout(cloudSaveTimer);
  if (retryTimer) clearTimeout(retryTimer);
  cloudSaveTimer = null;
  retryTimer = null;
  pendingSave = null;
  queuedPush = null;
}

function scheduleCloudSave(data: EvolutionData) {
  if (!cloudUserId) return; // not verified yet → stays local; merged in on the next successful read
  cancelPendingSave();
  const uid = cloudUserId;
  pendingSave = { uid, data };
  cloudSaveTimer = setTimeout(() => {
    pendingSave = null;
    cloudSaveTimer = null;
    void pushCloud(uid, data);
  }, 800);
}

function writeLocal(data: EvolutionData) {
  localRev++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _version: STORAGE_VERSION }));
  window.dispatchEvent(new CustomEvent("evolution:data-updated"));
}

/** Archive the previous owner's local data and load this account's own device copy (or a clean slate). */
function switchLocalOwner(userId: string) {
  const owner = getLocalOwner();
  if (owner === userId) return;
  if (owner) {
    window.dispatchEvent(new CustomEvent("evolution:owner-changing", { detail: { from: owner, to: userId } }));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) localStorage.setItem(BACKUP_PREFIX + owner, raw);
    const mine = localStorage.getItem(BACKUP_PREFIX + userId);
    if (mine) localStorage.setItem(STORAGE_KEY, mine);
    else localStorage.removeItem(STORAGE_KEY);
  }
  localStorage.setItem(OWNER_KEY, userId);
  window.dispatchEvent(new CustomEvent("evolution:data-updated"));
  if (owner) window.dispatchEvent(new CustomEvent("evolution:owner-changed", { detail: { from: owner, to: userId } }));
}

async function activateCloudForUser(userId: string, attempt = 0): Promise<void> {
  if (cloudUserId === userId || (activatingFor === userId && attempt === 0)) return;
  if (attempt > 0 && (activatingFor !== userId || pulling)) return;
  if (activationTimer) { clearTimeout(activationTimer); activationTimer = null; }
  if (attempt === 0 || cloudUserId !== null) cloudGen++;
  const gen = cloudGen;
  cancelPendingSave();
  cloudUserId = null;
  activatingFor = userId;
  setCloudStatus("loading");
  switchLocalOwner(userId);
  if (!loadBaseline || loadBaseline.uid !== userId) loadBaseline = { uid: userId, data: load() };
  pulling = true;
  let res: PullResult;
  try { res = await pullCloud(userId); } finally { if (gen === cloudGen) pulling = false; }
  if (gen !== cloudGen || activatingFor !== userId || getLocalOwner() !== userId) return; // signed out / switched during load

  if (res.kind === "error") {
    setCloudStatus("error");
    markReady(); // UI runs on this account's local data; uploads stay disabled, edits stay local
    if (attempt < 4) {
      activationTimer = setTimeout(() => {
        activationTimer = null;
        if (gen === cloudGen && activatingFor === userId) void activateCloudForUser(userId, attempt + 1);
      }, 3000 * (attempt + 1));
    }
    // After retries run out, recovery resumes via resumeCloudRead() (the browser "online" event).
    return;
  }

  activatingFor = null;
  cloudUserId = userId;
  const local = load();
  const base = readSynced(userId) ?? loadBaseline.data;
  loadBaseline = null;

  if (res.kind === "ok") {
    writeSynced(userId, res.data);
    const merged = mergeEvolutionData(base, local, res.data);
    writeLocal(merged);
    setCloudStatus("synced");
    if (!sameJSON(merged, res.data)) scheduleCloudSave(merged);
    window.dispatchEvent(new CustomEvent("evolution:cloud-loaded"));
  } else {
    // Brand-new account: seed it with this account's local data.
    await pushCloud(userId, local);
    window.dispatchEvent(new CustomEvent("evolution:cloud-loaded"));
  }
  markReady();
}

/** Reconnect: resume a safe read (then the usual merge) for an account whose load failed. */
function resumeCloudRead(): void {
  if (cloudUserId && cloudStatus === "error") { void pushCloud(cloudUserId, load()); return; }
  const uid = activatingFor;
  if (!uid || cloudUserId || pulling || getLocalOwner() !== uid) return;
  if (activationTimer) { clearTimeout(activationTimer); activationTimer = null; }
  void activateCloudForUser(uid, 1); // fresh retry budget; owner/generation guards still apply
}

function deactivateCloud() {
  cloudGen++;
  pulling = false;
  if (activationTimer) { clearTimeout(activationTimer); activationTimer = null; }
  cancelPendingSave();
  cloudUserId = null;
  activatingFor = null;
  loadBaseline = null;
  setCloudStatus("signed-out");
  markReady();
}

/** Test hooks (not used by the app). */
export const __cloudTest = { activateCloudForUser, deactivateCloud, resumeCloudRead, idle: async () => { while (pushInFlight) await pushInFlight; }, flushSave: () => { const p = pendingSave; cancelPendingSave(); return p ? pushCloud(p.uid, p.data) : Promise.resolve(false); } };

if (typeof window !== "undefined" && typeof document !== "undefined" && !(globalThis as { __EVO_NO_AUTO_CLOUD__?: boolean }).__EVO_NO_AUTO_CLOUD__) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) void activateCloudForUser(data.session.user.id);
    else deactivateCloud();
  }).catch(() => deactivateCloud());
  supabase.auth.onAuthStateChange((event, session) => {
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
      void activateCloudForUser(session.user.id);
    } else if (event === "SIGNED_OUT") {
      deactivateCloud();
    }
  });
  // Best-effort: start a pending save when the tab is hidden/closed. Not guaranteed to finish —
  // if it doesn't, the change stays dirty locally and is merged up on the next load.
  const flush = () => {
    if (!pendingSave) return;
    const { uid, data } = pendingSave;
    cancelPendingSave();
    void pushCloud(uid, data);
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("online", resumeCloudRead);
}

/** Hook: current cloud sync status for UI badges. */
export function useCloudStatus(): CloudStatus {
  const [s, setS] = useState<CloudStatus>("loading");
  useEffect(() => {
    setS(cloudStatus);
    const h = () => setS(cloudStatus);
    window.addEventListener("evolution:cloud-status", h);
    return () => window.removeEventListener("evolution:cloud-status", h);
  }, []);
  return s;
}

const PHONE_KEY = "evolution05:userdata:v4";          // phone design store (see mobile-bridge.ts)
const PHONE_BASE_KEY = "evolution:mobile-bridge:base:v1";
/** Archive the phone store, then empty its tasks/events and the bridge base. */
export function clearPhoneTasksForReset() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PHONE_KEY);
    if (raw) {
      localStorage.setItem(`${PHONE_KEY}:cleared:${getLocalOwner() ?? "local"}`, raw);
      const store = JSON.parse(raw);
      if (store?.tk) { store.tk.tasks = []; store.tk.events = []; }
      localStorage.setItem(PHONE_KEY, JSON.stringify(store));
    }
    localStorage.removeItem(PHONE_BASE_KEY);
  } catch { /* ignore */ }
}

function save(data: EvolutionData) {
  if (typeof window === "undefined") return;
  writeLocal(data);
  scheduleCloudSave(data);
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
    // Save defaults (also to the cloud) so cleared data does not come back on next load,
    // and clear the phone design's tasks/events + bridge base so they cannot sync back.
    clearPhoneTasksForReset();
    save(defaultData);
    setData(defaultData);
  }, []);

  return { data, mutate, updateProfile, reset };
}

// ---------- Derived metrics ----------

function today() {
  return localISO(new Date());
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
  // Only today's dated input counts — never fall back to an older day's numbers; zeros are real zeros.
  const last = rows.find((r) => r.date === today);
  const anyLogged = todayLogs.length > 0 || meals.some((m) => m.logged);
  const kcal = anyLogged ? loggedQuick.kcal + loggedCustom.kcal : last?.calories ?? 0;
  const protein = anyLogged ? loggedQuick.p + loggedCustom.p : last?.protein ?? 0;
  const carbs = anyLogged ? loggedQuick.c + loggedCustom.c : last?.carbs ?? 0;
  const fats = anyLogged ? loggedQuick.f + loggedCustom.f : last?.fats ?? 0;
  return {
    last,
    target,
    calories: kcal,
    protein,
    carbs,
    fats,
    percent: target > 0 && Number.isFinite(target) ? Math.min(100, Math.round((kcal / target) * 100)) : 0,
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

export const LIABILITY_CATEGORIES = new Set([
  "Rent", "Mortgage", "Car Payment", "Insurance", "Loan", "Credit Card",
]);

export function wealthSummary(data: { assets: Asset[]; transactions: Transaction[] }) {
  const assetsTotal = data.assets.reduce((s, a) => s + a.value, 0);
  const income = data.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = data.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const liabilities = data.transactions
    .filter((t) => t.type === "expense" && LIABILITY_CATEGORIES.has(t.category))
    .reduce((s, t) => s + t.amount, 0);
  const cash = income - expenses;
  const netWorth = assetsTotal + income - expenses;

  type E = { date: string; delta: number };
  const entries: E[] = [];
  for (const t of data.transactions) {
    entries.push({ date: t.date, delta: t.type === "income" ? t.amount : -t.amount });
  }
  for (const a of data.assets) {
    entries.push({ date: a.date ?? today(), delta: a.value });
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));
  const series: number[] = [0];
  const labels: string[] = [""];
  let running = 0;
  for (const e of entries) {
    running += e.delta;
    series.push(running);
    labels.push(e.date);
  }
  const first = series[0];
  const last = series[series.length - 1];
  const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : (last !== 0 ? 100 : 0);

  return { assetsTotal, income, expenses, liabilities, cash, netWorth, series, labels, pct };
}

export function todayDate() { return today(); }

// ---------- Nutrition helpers ----------

export function dayTotals(date: string, mealLogs: MealLog[]) {
  const logs = mealLogs.filter((m) => m.date === date);
  return logs.reduce(
    (a, m) => ({
      kcal: a.kcal + m.calories,
      p: a.p + m.protein,
      c: a.c + m.carbs,
      f: a.f + m.fats,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

export function nutritionStreak(mealLogs: MealLog[], target: number) {
  if (!target) return 0;
  let streak = 0;
  const d = new Date();
  // walk back day-by-day; today only counts if hit
  for (let i = 0; i < 365; i++) {
    const iso = localISO(new Date(d.getTime() - i * 86400000));
    const total = dayTotals(iso, mealLogs).kcal;
    const hit = total > 0 && total <= target * 1.05 && total >= target * 0.85;
    if (hit) streak++;
    else if (i > 0) break; // allow today to be in-progress without breaking
  }
  return streak;
}

export function weeklyAverage(mealLogs: MealLog[]) {
  const days: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) days.push(localISO(new Date(d.getTime() - i * 86400000)));
  const totals = days.map((iso) => dayTotals(iso, mealLogs).kcal);
  const logged = totals.filter((t) => t > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0;
  return { days, totals, avg };
}

export function mostLoggedMeal(mealLogs: MealLog[]) {
  const counts = new Map<string, number>();
  for (const m of mealLogs) counts.set(m.name, (counts.get(m.name) ?? 0) + 1);
  let best = ""; let n = 0;
  for (const [name, c] of counts) if (c > n) { best = name; n = c; }
  return best ? { name: best, count: n } : null;
}

// ---------- Time-log helpers (Time Factor feature) ----------

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function weekStartMonday(d: Date = new Date()): Date {
  const out = new Date(d);
  const day = out.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function weekDaysMonSun(start: Date = weekStartMonday()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return localISO(d);
  });
}

export function weekLogs(logs: TimeLog[], start: Date = weekStartMonday()): TimeLog[] {
  const days = new Set(weekDaysMonSun(start));
  return logs.filter((l) => days.has(l.date));
}

export function groupMinutesBy<T extends string>(
  logs: TimeLog[],
  key: (l: TimeLog) => T,
): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const l of logs) {
    const k = key(l);
    out[k] = (out[k] ?? 0) + l.minutes;
  }
  return out;
}

export function formatHm(mins: number): string {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------- Trading account balance + Wealth sync ----------

export function accountBalance(accountId: string, accounts: TradingAccount[], txns: TradingTx[]): number {
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) return 0;
  const accountIds = new Set(accounts.map((a) => a.id));
  const primaryId = accounts[0]?.id;
  return acc.startingBalance + txns
    .filter((t) => t.accountId === accountId || (accountId === primaryId && !accountIds.has(t.accountId)))
    .reduce((s, t) => s + (t.type === "profit" ? t.amount : -t.amount), 0);
}

export function tradingTotals(accounts: TradingAccount[], txns: TradingTx[]) {
  const today = todayDate();
  const monthKey = today.slice(0, 7);
  let balance = 0, todayPnl = 0, monthPnl = 0;
  const perAccount: Record<string, { balance: number; today: number; month: number }> = {};
  const accountIds = new Set(accounts.map((a) => a.id));
  const primaryId = accounts[0]?.id;
  for (const acc of accounts) {
    let b = acc.startingBalance, tP = 0, mP = 0;
    for (const t of txns.filter((x) => x.accountId === acc.id || (acc.id === primaryId && !accountIds.has(x.accountId)))) {
      const signed = t.type === "profit" ? t.amount : -t.amount;
      b += signed;
      if (t.date === today) tP += signed;
      if (t.date.startsWith(monthKey)) mP += signed;
    }
    perAccount[acc.id] = { balance: b, today: tP, month: mP };
    balance += b; todayPnl += tP; monthPnl += mP;
  }
  return { balance, todayPnl, monthPnl, perAccount };
}

/** Rebuild `assets` so every trading account is mirrored as an Investment asset (`trading-{id}`). */
export function syncTradingAssets(next: EvolutionData): EvolutionData {
  const { perAccount } = tradingTotals(next.tradingAccounts, next.tradingTxns);
  const nonTrading = next.assets.filter((a) => !a.id.startsWith("trading-"));
  const tradingAssets: Asset[] = next.tradingAccounts.map((acc) => ({
    id: `trading-${acc.id}`,
    name: acc.name,
    value: Math.max(0, Math.round(perAccount[acc.id]?.balance ?? acc.startingBalance)),
    category: "Investment",
    date: acc.createdDate,
  }));
  return { ...next, assets: [...nonTrading, ...tradingAssets] };
}


