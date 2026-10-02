import { localISO } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Apple, Trash2, Minus, Plus, Droplet, Flame, Clock, Check, Undo2, RotateCcw, TrendingDown, Pill } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, MEAL_TYPES, todayDate, uid,
  dayTotals, nutritionStreak,
  type MealType, type GroceryItem,
} from "@/lib/evolution-data";
import { useSelectedMonth } from "@/lib/use-selected-month";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Evolution" }, { name: "description", content: "Daily calories, macros, meals, water, grocery, history." }] }),
  component: NutritionPage,
});

// Quick-add presets (per spec)
const QUICK_FOODS = [
  { key: "ground_beef_rice", label: "Ground Beef & Rice", kcal: 450, p: 35, c: 35, f: 18 },
  { key: "chicken_rice",     label: "Chicken & Rice",     kcal: 380, p: 40, c: 38, f: 6 },
  { key: "greek_yogurt",     label: "Greek Yogurt & Berries", kcal: 200, p: 20, c: 22, f: 2 },
  { key: "broccoli",         label: "Broccoli",           kcal: 150, p: 8,  c: 18, f: 2 },
];

const STANDARD_GROCERY: Omit<GroceryItem, "id" | "done">[] = [
  { name: "Ground beef",    qty: "2",   unit: "lbs",    category: "Protein" },
  { name: "Chicken breast", qty: "3",   unit: "lbs",    category: "Protein" },
  { name: "White rice",     qty: "5",   unit: "cups",   category: "Carbs" },
  { name: "Broccoli",       qty: "4",   unit: "pieces", category: "Vegetables" },
  { name: "Greek yogurt",   qty: "32",  unit: "oz",     category: "Dairy" },
  { name: "Mixed berries",  qty: "16",  unit: "oz",     category: "Dairy" },
];

const UNITS = ["lbs", "oz", "cups", "pieces"];
const GROCERY_CATEGORIES = ["Protein", "Carbs", "Vegetables", "Dairy", "Other"];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function categoryFromTime(time: string): MealType {
  const h = Number(time.slice(0, 2));
  if (h < 10) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 18) return "Dinner";
  return "Snack";
}
function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function NutritionPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const today = todayDate();

  // ------- Targets -------
  const calTarget = data.profile.calorieTarget || 2000;
  const pTarget = data.profile.proteinTarget || 160;
  const cTarget = data.profile.carbsTarget || 220;
  const fTarget = data.profile.fatsTarget || 70;
  const waterTarget = data.profile.waterTarget || 8;

  // ------- Today totals -------
  const t = dayTotals(today, data.mealLogs);
  const calPct = Math.round((t.kcal / calTarget) * 100);
  const pPct = Math.min(100, Math.round((t.p / pTarget) * 100));
  const cPct = Math.min(100, Math.round((t.c / cTarget) * 100));
  const fPct = Math.min(100, Math.round((t.f / fTarget) * 100));
  const remaining = calTarget - t.kcal;

  // Nutrition score 0–100 — average proximity to each macro target
  const score = useMemo(() => {
    const prox = (cur: number, tgt: number) => {
      if (!tgt) return 0;
      const ratio = cur / tgt;
      // peak 100 at ratio=1, decays linearly to 0 at 0 or 2
      return Math.max(0, Math.round(100 * (1 - Math.abs(1 - ratio))));
    };
    return Math.round((prox(t.kcal, calTarget) + prox(t.p, pTarget) + prox(t.c, cTarget) + prox(t.f, fTarget)) / 4);
  }, [t.kcal, t.p, t.c, t.f, calTarget, pTarget, cTarget, fTarget]);

  const streak = useMemo(() => nutritionStreak(data.mealLogs, calTarget), [data.mealLogs, calTarget]);

  // ------- Today's meals -------
  const todayMeals = useMemo(
    () => data.mealLogs.filter((m) => m.date === today)
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    [data.mealLogs, today]
  );

  const addQuick = (q: typeof QUICK_FOODS[number]) => {
    pushSnapshot(`Added ${q.label}`);
    const time = nowTime();
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: q.label,
        calories: q.kcal, protein: q.p, carbs: q.c, fats: q.f,
        time, mealType: categoryFromTime(time),
      }],
    }));
  };

  // Custom-meal modal
  const [mealOpen, setMealOpen] = useState(false);
  const [mName, setMName] = useState(""); const [mKcal, setMKcal] = useState("");
  const [mP, setMP] = useState(""); const [mC, setMC] = useState(""); const [mF, setMF] = useState("");
  const [mTime, setMTime] = useState(nowTime());
  const [mType, setMType] = useState<MealType>("Lunch");
  const openCustom = () => { setMTime(nowTime()); setMType(categoryFromTime(nowTime())); setMealOpen(true); };
  const submitMeal = () => {
    if (!mName.trim() || !Number(mKcal)) return;
    pushSnapshot(`Added ${mName.trim()}`);
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: mName.trim(),
        calories: Number(mKcal) || 0, protein: Number(mP) || 0,
        carbs: Number(mC) || 0, fats: Number(mF) || 0,
        time: mTime, mealType: mType,
      }],
    }));
    setMName(""); setMKcal(""); setMP(""); setMC(""); setMF("");
    setMealOpen(false);
  };
  // ------- Undo stack (in-memory snapshots of today's meals + water) -------
  type Snapshot = { mealLogs: typeof data.mealLogs; water: typeof data.water; label: string };
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const pushSnapshot = (label: string) => {
    setUndoStack((s) => [
      ...s.slice(-19), // keep last 20
      { mealLogs: data.mealLogs, water: data.water, label },
    ]);
  };
  const undo = () => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    mutate(() => ({ mealLogs: last.mealLogs, water: last.water }));
    setUndoStack((s) => s.slice(0, -1));
  };

  const delMeal = (id: string) => {
    pushSnapshot("Deleted meal");
    mutate((prev) => ({ mealLogs: prev.mealLogs.filter((m) => m.id !== id) }));
  };

  // ------- Reset today -------
  const [resetOpen, setResetOpen] = useState(false);
  const resetToday = () => {
    pushSnapshot("Reset today");
    mutate((prev) => ({
      mealLogs: prev.mealLogs.filter((m) => m.date !== today),
      water: prev.water.filter((w) => w.date !== today),
    }));
    setResetOpen(false);
  };

  // ------- Water -------
  const todayWater = data.water.find((w) => w.date === today)?.glasses ?? 0;
  const waterPct = Math.min(100, Math.round((todayWater / waterTarget) * 100));
  const setWater = (delta: number) => {
    pushSnapshot(delta > 0 ? "Added water" : "Removed water");
    mutate((prev) => {
      const exists = prev.water.find((w) => w.date === today);
      const next = Math.max(0, (exists?.glasses ?? 0) + delta);
      return {
        water: exists
          ? prev.water.map((w) => (w.date === today ? { ...w, glasses: next } : w))
          : [...prev.water, { date: today, glasses: next }],
      };
    });
  };
  const waterMessage =
    todayWater <= 2 ? "Start hydrating — your body needs water"
    : todayWater <= 5 ? "Good progress — keep going"
    : todayWater <= 7 ? "Almost there — one more push"
    : "Fully hydrated — excellent work";

  // ------- Grocery: seed standard list once -------
  useEffect(() => {
    if (!data.grocery || data.grocery.length === 0) {
      mutate(() => ({
        grocery: STANDARD_GROCERY.map((s) => ({ ...s, id: uid(), done: false })),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Removed one-time "reset today to zero" effect — it was wiping meals
  // the user added, causing them to disappear after refresh.)




  const [gFilter, setGFilter] = useState<string>("All");
  const [gName, setGName] = useState(""); const [gQty, setGQty] = useState("1");
  const [gUnit, setGUnit] = useState("pieces"); const [gCat, setGCat] = useState("Protein");
  const [gCost, setGCost] = useState("");
  const addGrocery = () => {
    if (!gName.trim()) return;
    mutate((prev) => ({
      grocery: [...prev.grocery, {
        id: uid(), name: gName.trim(), qty: gQty, unit: gUnit,
        category: gCat, done: false,
        cost: Number(gCost) || undefined,
      }],
    }));
    setGName(""); setGQty("1"); setGCost("");
  };
  const toggleGrocery = (id: string) =>
    mutate((prev) => ({ grocery: prev.grocery.map((g) => g.id === id ? { ...g, done: !g.done } : g) }));
  const delGrocery = (id: string) =>
    mutate((prev) => ({ grocery: prev.grocery.filter((g) => g.id !== id) }));
  const updateGroceryCost = (id: string, cost: number) =>
    mutate((prev) => ({ grocery: prev.grocery.map((g) => g.id === id ? { ...g, cost } : g) }));
  const resetChecks = () =>
    mutate((prev) => ({ grocery: prev.grocery.map((g) => ({ ...g, done: false })) }));
  const filteredGrocery = data.grocery.filter((g) => gFilter === "All" || g.category === gFilter);
  const totalCost = data.grocery.reduce((a, g) => a + (g.cost ?? 0) * (Number(g.qty) || 1), 0);

  // ------- Macros tab data -------
  const macroSum = t.p + t.c + t.f || 1;
  const pPctSlice = (t.p * 4 / Math.max(1, t.kcal)) * 100; // calories from protein %
  const cPctSlice = (t.c * 4 / Math.max(1, t.kcal)) * 100;
  const fPctSlice = (t.f * 9 / Math.max(1, t.kcal)) * 100;
  // fallback when no calories logged → use grams ratio
  const slice1 = t.kcal ? pPctSlice : (t.p / macroSum) * 100;
  const slice2 = t.kcal ? cPctSlice : (t.c / macroSum) * 100;
  const slice3 = t.kcal ? fPctSlice : (t.f / macroSum) * 100;

  const mealsByMealItem = todayMeals.map((m) => ({ name: m.name, kcal: m.calories }));

  // Last 7 days
  const last7 = useMemo(() => {
    const out: { date: string; kcal: number; p: number; c: number; f: number; water: number }[] = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const iso = localISO(new Date(d.getTime() - i * 86400000));
      const tot = dayTotals(iso, data.mealLogs);
      out.push({
        date: iso, kcal: tot.kcal, p: tot.p, c: tot.c, f: tot.f,
        water: data.water.find((w) => w.date === iso)?.glasses ?? 0,
      });
    }
    return out;
  }, [data.mealLogs, data.water]);

  const weeklyAvg = useMemo(() => {
    const logged = last7.filter((d) => d.kcal > 0);
    if (!logged.length) return { kcal: 0, p: 0, c: 0, f: 0, water: 0 };
    const sum = logged.reduce((a, b) => ({
      kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f,
      water: a.water + b.water,
    }), { kcal: 0, p: 0, c: 0, f: 0, water: 0 });
    return {
      kcal: Math.round(sum.kcal / logged.length),
      p: Math.round(sum.p / logged.length),
      c: Math.round(sum.c / logged.length),
      f: Math.round(sum.f / logged.length),
      water: Math.round(sum.water / logged.length),
    };
  }, [last7]);

  // Auto insights
  const insights = useMemo(() => {
    const out: string[] = [];
    if (weeklyAvg.kcal && weeklyAvg.kcal < calTarget - 100) {
      out.push(`You are averaging ${calTarget - weeklyAvg.kcal} calories below your target this week — consider adding a snack`);
    }
    if (weeklyAvg.kcal > calTarget + 150) {
      out.push(`You are ${weeklyAvg.kcal - calTarget} calories over target on average — small portion cuts add up`);
    }
    if (weeklyAvg.p && weeklyAvg.p >= pTarget * 0.9) {
      out.push("Your protein intake has been consistent — great work");
    } else if (weeklyAvg.p && weeklyAvg.p < pTarget * 0.7) {
      out.push(`Protein is averaging ${weeklyAvg.p}g — push toward ${pTarget}g for muscle retention`);
    }
    const eveningCals = todayMeals.filter((m) => Number((m.time ?? "12:00").slice(0, 2)) >= 18)
      .reduce((a, m) => a + m.calories, 0);
    if (t.kcal && eveningCals / t.kcal > 0.5) {
      out.push("You tend to eat most of your calories after 6pm — consider an earlier meal");
    }
    if (weeklyAvg.water && weeklyAvg.water < waterTarget - 2) {
      out.push(`Hydration averaging ${weeklyAvg.water} glasses — aim for ${waterTarget}`);
    }
    if (!out.length) out.push("Keep logging — insights will appear as data builds up");
    return out;
  }, [weeklyAvg, calTarget, pTarget, waterTarget, t.kcal, todayMeals]);

  // ------- History tab (filtered by global selected month) -------
  const { year: selYear, month: selMonth, key: selMonthKey } = useSelectedMonth();
  const last30 = useMemo(() => {
    const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
    const out: { date: string; kcal: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${selMonthKey}-${String(d).padStart(2, "0")}`;
      out.push({ date: iso, kcal: dayTotals(iso, data.mealLogs).kcal });
    }
    return out;
  }, [data.mealLogs, selYear, selMonth, selMonthKey]);

  const consistency = Math.round((last30.filter((d) => d.kcal > 0).length / Math.max(1, last30.length)) * 100);
  const bestDay = useMemo(() => {
    let best: { date: string; score: number } | null = null;
    for (const d of last30) {
      if (!d.kcal) continue;
      const tot = dayTotals(d.date, data.mealLogs);
      const prox = (cur: number, tgt: number) => Math.max(0, 100 * (1 - Math.abs(1 - cur / Math.max(1, tgt))));
      const s = (prox(tot.kcal, calTarget) + prox(tot.p, pTarget) + prox(tot.c, cTarget) + prox(tot.f, fTarget)) / 4;
      if (!best || s > best.score) best = { date: d.date, score: Math.round(s) };
    }
    return best;
  }, [last30, data.mealLogs, calTarget, pTarget, cTarget, fTarget]);

  // Past 4 weeks summary
  const weekSummaries = useMemo(() => {
    const weeks: { label: string; kcal: number; p: number; c: number; f: number; water: number }[] = [];
    for (let w = 0; w < 4; w++) {
      let kcal = 0, p = 0, c = 0, f = 0, water = 0, days = 0;
      for (let i = 0; i < 7; i++) {
        const dayOffset = w * 7 + i;
        const iso = localISO(new Date(Date.now() - dayOffset * 86400000));
        const tot = dayTotals(iso, data.mealLogs);
        if (tot.kcal > 0) {
          kcal += tot.kcal; p += tot.p; c += tot.c; f += tot.f;
          water += data.water.find((x) => x.date === iso)?.glasses ?? 0;
          days++;
        }
      }
      const div = days || 1;
      weeks.push({
        label: w === 0 ? "This week" : `${w} week${w > 1 ? "s" : ""} ago`,
        kcal: Math.round(kcal / div), p: Math.round(p / div),
        c: Math.round(c / div), f: Math.round(f / div),
        water: Math.round(water / div),
      });
    }
    return weeks;
  }, [data.mealLogs, data.water]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState<string | null>(null);
  const historyMeals = historyDate ? data.mealLogs.filter((m) => m.date === historyDate) : [];
  const historyTotals = historyDate ? dayTotals(historyDate, data.mealLogs) : { kcal: 0, p: 0, c: 0, f: 0 };
  const historyWater = historyDate ? data.water.find((w) => w.date === historyDate)?.glasses ?? 0 : 0;

  // Eating window timeline
  const timelineMeals = todayMeals.map((m) => {
    const time = m.time ?? "12:00";
    const [hh, mm] = time.split(":").map(Number);
    const pct = ((hh * 60 + mm) / (24 * 60)) * 100;
    return { id: m.id, time, pct, name: m.name, type: m.mealType ?? categoryFromTime(time) };
  });

  // ------- Overview: weight tracker (local) -------
  type WeightEntry = { date: string; lbs: number };
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [weightPeriod, setWeightPeriod] = useState<"7D" | "30D" | "90D" | "1Y" | "ALL">("30D");
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newStartingWeight, setNewStartingWeight] = useState("");
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [startingWeight, setStartingWeight] = useState<number | null>(null);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [weightHydrated, setWeightHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nutrition.weightTracker");
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.weights)) setWeights(data.weights);
        if (typeof data.startingWeight === "number") setStartingWeight(data.startingWeight);
        if (typeof data.goalWeight === "number") setGoalWeight(data.goalWeight);
      }
    } catch {}
    setWeightHydrated(true);
  }, []);
  useEffect(() => {
    if (!weightHydrated) return;
    try {
      localStorage.setItem(
        "nutrition.weightTracker",
        JSON.stringify({ weights, startingWeight, goalWeight })
      );
    } catch {}
  }, [weights, startingWeight, goalWeight, weightHydrated]);

  const currentWeight = weights[weights.length - 1]?.lbs ?? 0;
  const startWeight = startingWeight ?? weights[0]?.lbs ?? 0;
  const lastWeekWeight = weights[weights.length - 8]?.lbs ?? currentWeight;
  const weeklyChange = +(currentWeight - lastWeekWeight).toFixed(1);
  const totalChange = +(currentWeight - startWeight).toFixed(1);
  const percentChange = startWeight ? +((totalChange / startWeight) * 100).toFixed(2) : 0;
  const highestWeight = weights.length ? Math.max(...weights.map((w) => w.lbs)) : 0;
  const lowestWeight = weights.length ? Math.min(...weights.map((w) => w.lbs)) : 0;
  const avgWeeklyChange = weights.length >= 7 ? +(totalChange / (weights.length / 7)).toFixed(1) : 0;
  const bodyFatEst = 0;
  const periodDays: Record<typeof weightPeriod, number> = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365, "ALL": 9999 };
  const visibleWeights = weights.slice(-periodDays[weightPeriod]);
  const submitWeight = () => {
    const v = Number(newWeight);
    const sw = Number(newStartingWeight);
    const gw = Number(newGoalWeight);
    const hasStart = !!newStartingWeight && !Number.isNaN(sw) && sw > 0;
    const hasGoal = !!newGoalWeight && !Number.isNaN(gw) && gw > 0;
    // If starting or goal provided → reset the chart (new goal cycle)
    if (hasStart || hasGoal) {
      const today = todayDate();
      const seed: WeightEntry[] = v
        ? [{ date: today, lbs: v }]
        : hasStart
        ? [{ date: today, lbs: sw }]
        : [];
      setWeights(seed);
      if (hasStart) setStartingWeight(sw);
      else if (v) setStartingWeight(v);
      if (hasGoal) setGoalWeight(gw);
    } else if (v) {
      setWeights((w) => [...w, { date: todayDate(), lbs: v }]);
      if (startingWeight === null) setStartingWeight(v);
    }
    setNewWeight("");
    setNewStartingWeight("");
    setNewGoalWeight("");
    setLogWeightOpen(false);
  };

  // ------- Overview: supplements -------
  type Supplement = { id: string; name: string; time: string; dose: string; done: boolean };
  const DEFAULT_SUPPS = [
    { id: "s1", name: "Whey Protein",       time: "8:30 AM",  dose: "1 scoop" },
    { id: "s2", name: "Creatine Monohydrate", time: "11:00 AM", dose: "5g" },
    { id: "s3", name: "Omega 3",            time: "1:00 PM",  dose: "2 softgels" },
    { id: "s4", name: "Vitamin D3",         time: "1:00 PM",  dose: "5000 IU" },
    { id: "s5", name: "Magnesium",          time: "9:00 PM",  dose: "400mg" },
  ];
  // Saved with the rest of your data; check-offs reset each day.
  const suppList = data.supplementList ?? DEFAULT_SUPPS;
  const suppDone = data.supplementDone?.[today] ?? [];
  const supplements: Supplement[] = suppList.map((x) => ({ ...x, done: suppDone.includes(x.id) }));
  const toggleSupp = (id: string) =>
    mutate((p) => {
      const all = { ...(p.supplementDone ?? {}) };
      const cur = new Set(all[today] ?? []);
      if (cur.has(id)) cur.delete(id); else cur.add(id);
      all[today] = [...cur];
      return { supplementDone: all };
    });
  const [suppOpen, setSuppOpen] = useState(false);
  const [suppAll, setSuppAll] = useState(false);
  const [sName, setSName] = useState(""); const [sDose, setSDose] = useState(""); const [sTime, setSTime] = useState("");
  const addSupp = () => {
    const n = sName.trim();
    if (!n) return;
    mutate((p) => ({ supplementList: [...(p.supplementList ?? DEFAULT_SUPPS), { id: `s-${uid()}`, name: n.slice(0, 60), dose: sDose.trim().slice(0, 30), time: sTime.trim().slice(0, 20) }] }));
    setSName(""); setSDose(""); setSTime(""); setSuppOpen(false);
  };
  const delSupp = (id: string) =>
    mutate((p) => ({ supplementList: (p.supplementList ?? DEFAULT_SUPPS).filter((x) => x.id !== id) }));




  return (
    <ModuleLayout number="02" title="Nutrition" subtitle={todayLabel()} icon={Apple}>
      <Tabs defaultValue="overview" className="animate-fade-in">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="hud-label text-[11px] tracking-wider">OVERVIEW</TabsTrigger>
          <TabsTrigger value="meals" className="hud-label text-[11px] tracking-wider">FOOD DIARY</TabsTrigger>
          <TabsTrigger value="macros" className="hud-label text-[11px] tracking-wider">MACROS</TabsTrigger>
          <TabsTrigger value="water" className="hud-label text-[11px] tracking-wider">WATER</TabsTrigger>
          <TabsTrigger value="grocery" className="hud-label text-[11px] tracking-wider">GROCERY</TabsTrigger>
          <TabsTrigger value="history" className="hud-label text-[11px] tracking-wider">HISTORY</TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW ============ */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {/* Row 1: Weight Tracker + Calorie Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <Panel title="Weight Tracker">
              <div className="flex items-center justify-end gap-2 mb-4 -mt-1">
                {(["7D", "30D", "90D", "1Y", "ALL"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setWeightPeriod(p)}
                    className={`hud-label text-[10px] px-2 py-1 rounded border transition-colors ${weightPeriod === p ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {p}
                  </button>
                ))}
                <Button size="sm" onClick={() => setLogWeightOpen(true)} className="hud-label text-[10px] h-7">
                  <Plus className="h-3 w-3 mr-1" /> LOG WEIGHT
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="hud-label text-[10px] text-muted-foreground">CURRENT WEIGHT</div>
                    <div className="hud-label text-primary hud-glow tabular-nums mt-1 whitespace-nowrap flex items-baseline gap-1.5">
                      <span className="text-4xl">{currentWeight}</span>
                      <span className="text-base text-primary/70 normal-case">lbs</span>
                    </div>
                    <div className="hud-label text-[10px] mt-1 text-primary/80 whitespace-nowrap">
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      {Math.abs(weeklyChange)} lbs vs last week
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="hud-label text-muted-foreground">STARTING WEIGHT</span><span className="text-foreground tabular-nums">{startingWeight !== null ? `${startingWeight.toFixed(1)} lbs` : "—"}</span></div>
                    <div className="flex justify-between"><span className="hud-label text-muted-foreground">GOAL WEIGHT</span><span className="text-foreground tabular-nums">{goalWeight !== null ? `${goalWeight.toFixed(1)} lbs` : "—"}</span></div>
                    <div className="flex justify-between"><span className="hud-label text-muted-foreground">TOTAL CHANGE</span><span className={`tabular-nums ${totalChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>▼ {Math.abs(totalChange)} lbs</span></div>
                    <div className="flex justify-between"><span className="hud-label text-muted-foreground">PERCENT CHANGE</span><span className={`tabular-nums ${percentChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>▼ {Math.abs(percentChange)}%</span></div>
                    <div className="flex justify-between"><span className="hud-label text-muted-foreground">DAYS TRACKING</span><span className="text-foreground tabular-nums">{weights.length} Days</span></div>
                  </div>
                </div>

                {/* Line chart */}
                <div className="relative" style={{ height: 220 }}>
                  {(() => {
                    const w = 600, h = 220, pad = { l: 30, r: 10, t: 10, b: 24 };
                    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
                    if (visibleWeights.length === 0) {
                      return (
                        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
                          <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" className="hud-label">
                            NO WEIGHT LOGGED YET
                          </text>
                        </svg>
                      );
                    }
                    const min = Math.floor(Math.min(...visibleWeights.map((v) => v.lbs)) - 2);
                    const max = Math.ceil(Math.max(...visibleWeights.map((v) => v.lbs)) + 2);
                    const xs = (i: number) => pad.l + (i / Math.max(1, visibleWeights.length - 1)) * iw;
                    const ys = (v: number) => pad.t + (1 - (v - min) / Math.max(1, max - min)) * ih;
                    const pts = visibleWeights.map((d, i) => `${xs(i)},${ys(d.lbs)}`).join(" ");
                    const area = `${pad.l},${pad.t + ih} ${pts} ${xs(visibleWeights.length - 1)},${pad.t + ih}`;
                    const yTicks = 5;
                    const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + ((max - min) * i) / yTicks);
                    return (
                      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
                        {ticks.map((t, i) => (
                          <g key={i}>
                            <line x1={pad.l} x2={w - pad.r} y1={ys(t)} y2={ys(t)} stroke="var(--border)" strokeDasharray="2 3" opacity="0.4" />
                            <text x={pad.l - 4} y={ys(t) + 5} textAnchor="end" fontSize="18" fill="var(--muted-foreground)">{Math.round(t)}</text>
                          </g>
                        ))}
                        <polygon points={area} fill="oklch(0.78 0.22 240 / 0.18)" />
                        <polyline points={pts} fill="none" stroke="oklch(0.78 0.22 240)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px oklch(0.78 0.22 240 / 0.7))" }} />
                        {visibleWeights.map((d, i) => (
                          <circle key={i} cx={xs(i)} cy={ys(d.lbs)} r="2.5" fill="oklch(0.78 0.22 240)" />
                        ))}
                        {visibleWeights.filter((_, i) => i % Math.ceil(visibleWeights.length / 6) === 0).map((d, i, arr) => {
                          const origIdx = visibleWeights.indexOf(d);
                          return (
                            <text key={i} x={xs(origIdx)} y={h - 4} textAnchor="middle" fontSize="18" fill="var(--muted-foreground)">
                              {new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}
                            </text>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-5 pt-5 border-t border-border">
                {[
                  { label: "WEEKLY CHANGE", value: `▼ ${Math.abs(weeklyChange)} lbs`, good: weeklyChange <= 0 },
                  { label: "AVG. WEEKLY CHANGE", value: `▼ ${Math.abs(avgWeeklyChange)} lbs`, good: avgWeeklyChange <= 0 },
                  { label: "HIGHEST WEIGHT", value: `${highestWeight.toFixed(1)} lbs` },
                  { label: "LOWEST WEIGHT", value: `${lowestWeight.toFixed(1)} lbs` },
                  { label: "BODY FAT (EST.)", value: `${bodyFatEst}%` },
                ].map((s) => (
                  <div key={s.label} className="border border-border rounded-md p-2 text-center">
                    <div className="hud-label text-[9px] text-muted-foreground">{s.label}</div>
                    <div className={`hud-label text-base mt-1 tabular-nums ${s.good ? "text-emerald-400" : "text-foreground"}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Calorie Summary">
              <div className="flex flex-col items-center">
                <RingProgress value={Math.min(100, calPct)} size={180} label={`${t.kcal}`} sublabel={`kcal Consumed`} />
                <div className={`hud-label text-[11px] mt-2 ${remaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ▲ {Math.abs(Math.round(((t.kcal || 1) / Math.max(1, calTarget)) * 100 - 88))}% vs Yesterday
                </div>
              </div>
              <div className="space-y-1.5 mt-4 text-[11px]">
                <div className="flex justify-between"><span className="hud-label text-muted-foreground">Calorie Target</span><span className="text-foreground tabular-nums">{calTarget.toLocaleString()} kcal</span></div>
                <div className="flex justify-between"><span className="hud-label text-muted-foreground">Consumed</span><span className="text-foreground tabular-nums">{t.kcal.toLocaleString()} kcal</span></div>
                <div className="flex justify-between"><span className="hud-label text-muted-foreground">Remaining</span><span className="text-emerald-400 tabular-nums">{Math.max(0, remaining).toLocaleString()} kcal</span></div>
                <div className="flex justify-between"><span className="hud-label text-muted-foreground">Burned (Active)</span><span className="text-foreground tabular-nums">420 kcal</span></div>
                <div className="flex justify-between pt-1 border-t border-border"><span className="hud-label text-muted-foreground">Net</span><span className="text-foreground tabular-nums">{(t.kcal - 420).toLocaleString()} kcal</span></div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "PROTEIN", cur: t.p, tgt: pTarget, color: "oklch(0.78 0.22 240)" },
                  { label: "CARBS",   cur: t.c, tgt: cTarget, color: "oklch(0.65 0.28 310)" },
                  { label: "FATS",    cur: t.f, tgt: fTarget, color: "oklch(0.78 0.18 60)" },
                ].map((m) => {
                  const pct = Math.min(100, (m.cur / Math.max(1, m.tgt)) * 100);
                  return (
                    <div key={m.label}>
                      <div className="flex justify-between hud-label text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} /> {m.label}</span>
                        <span className="text-muted-foreground tabular-nums">{m.cur}g / {m.tgt}g</span>
                      </div>
                      <div className="h-1.5 rounded bg-primary/10 overflow-hidden mt-1">
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => document.getElementById("food-diary")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="hud-label text-[10px] text-primary hover:hud-glow mt-4 w-full text-center">VIEW MACRO DETAILS ›</button>
            </Panel>
          </div>

          {/* Row 2: Food Diary + Quick Add */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">
            <div id="food-diary" className="contents" />
            <Panel title="Food Diary">
              <div className="grid grid-cols-[70px_1fr_50px_45px_50px_45px] gap-x-2 gap-y-1 text-[10px]">
                <div className="hud-label text-muted-foreground">MEAL</div>
                <div className="hud-label text-muted-foreground">FOOD</div>
                <div className="hud-label text-muted-foreground text-right">CALS</div>
                <div className="hud-label text-muted-foreground text-right">CARB</div>
                <div className="hud-label text-muted-foreground text-right">PRO</div>
                <div className="hud-label text-muted-foreground text-right">FATS</div>
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as MealType[]).map((mt) => {
                  const meals = todayMeals.filter((m) => (m.mealType ?? categoryFromTime(m.time ?? "12:00")) === mt);
                  if (!meals.length) return null;
                  const firstTime = meals[0].time ?? "";
                  return (
                    <div key={mt} className="contents">
                      <div className="row-span-1 py-2">
                        <div className="hud-label text-[11px] text-primary">{mt === "Breakfast" ? "☀" : mt === "Lunch" ? "☼" : mt === "Dinner" ? "☾" : "◆"} {mt}</div>
                        <div className="hud-label text-[9px] text-muted-foreground">{firstTime}</div>
                      </div>
                      <div className="col-span-5 py-2">
                        {meals.map((m) => (
                          <div key={m.id} className="group grid grid-cols-[1fr_50px_45px_50px_45px_20px] gap-x-2 py-0.5 text-xs items-center">
                            <span className="text-foreground truncate">{m.name}</span>
                            <span className="text-right text-primary tabular-nums">{m.calories}</span>
                            <span className="text-right text-muted-foreground tabular-nums">{m.carbs}g</span>
                            <span className="text-right text-muted-foreground tabular-nums">{m.protein}g</span>
                            <span className="text-right text-muted-foreground tabular-nums">{m.fats}g</span>
                            <button
                              onClick={() => delMeal(m.id)}
                              aria-label={`Delete ${m.name}`}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity justify-self-end"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                      </div>
                    </div>
                  );
                })}
                <div className="col-span-6 border-t border-border mt-2 pt-2 grid grid-cols-[70px_1fr_50px_45px_50px_45px] gap-x-2 text-[11px]">
                  <div className="hud-label text-primary">DAILY TOTAL</div>
                  <div />
                  <div className="text-right text-primary hud-glow tabular-nums">{t.kcal} kcal</div>
                  <div className="text-right text-muted-foreground tabular-nums">{t.c}g</div>
                  <div className="text-right text-muted-foreground tabular-nums">{t.p}g</div>
                  <div className="text-right text-muted-foreground tabular-nums">{t.f}g</div>
                </div>
                {!todayMeals.length && <div className="col-span-6 text-center text-xs text-muted-foreground py-6">No meals logged today.</div>}
              </div>
            </Panel>

            <Panel title="Quick Add Meals">
              <div className="space-y-2">
                {QUICK_FOODS.slice(0, 3).map((q) => (
                  <div key={q.key} className="border border-border rounded-md p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="hud-label text-[12px] text-foreground">{q.label}</div>
                        <div className="hud-label text-[10px] text-muted-foreground mt-1">
                          - {q.kcal} kcal · E {q.c}g · P {q.p}g · F {q.f}g
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addQuick(q)} className="hud-label text-[10px] h-7 shrink-0">ADD MEAL</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={openCustom} className="w-full mt-3 hud-label text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> LOG CUSTOM MEAL
              </Button>
            </Panel>
          </div>

          {/* Row 3: Supplements + Weekly Nutrition Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            <Panel title="Supplements">
              <div className="flex items-center justify-end mb-2">
                <Button size="sm" variant="outline" onClick={() => setSuppOpen((o) => !o)} className="hud-label text-[10px] h-7">
                  <Plus className="h-3 w-3 mr-1" /> {suppOpen ? "CANCEL" : "ADD SUPPLEMENT"}
                </Button>
              </div>
              {suppOpen && (
                <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 mb-3">
                  <Input autoFocus value={sName} onChange={(e) => setSName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSupp()} placeholder="Name" className="h-7 text-xs" />
                  <Input value={sDose} onChange={(e) => setSDose(e.target.value)} placeholder="Dose" className="h-7 text-xs" />
                  <Input value={sTime} onChange={(e) => setSTime(e.target.value)} placeholder="Time" className="h-7 text-xs" />
                  <Button size="sm" onClick={addSupp} disabled={!sName.trim()} className="hud-label text-[10px] h-7">SAVE</Button>
                </div>
              )}
              <ul className="space-y-2">
                {!supplements.length && <li className="text-xs text-muted-foreground italic">No supplements yet.</li>}
                {(suppAll ? supplements : supplements.slice(0, 5)).map((s) => (
                  <li key={s.id} className="group grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 text-[11px]">
                    <button onClick={() => toggleSupp(s.id)}
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${s.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                      {s.done && <Check className="h-3 w-3 text-primary-foreground" />}
                    </button>
                    <span className={`truncate ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                    <span className="hud-label text-[9px] text-muted-foreground tabular-nums">{s.time}</span>
                    <span className="hud-label text-[10px] text-primary tabular-nums">{s.dose}</span>
                    <button onClick={() => delSupp(s.id)} aria-label={`Remove ${s.name}`} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              {supplements.length > 5 && (
                <button onClick={() => setSuppAll((v) => !v)} className="hud-label text-[10px] text-primary hover:hud-glow mt-4 w-full text-center">{suppAll ? "SHOW LESS ‹" : `VIEW ALL SUPPLEMENTS (${supplements.length}) ›`}</button>
              )}
            </Panel>

            <Panel title="Weekly Nutrition Summary">
              <div className="grid grid-cols-[1fr_140px] gap-4">
                <div>
                  {(() => {
                    const chartMax = Math.max(3000, calTarget + 200, ...last7.map((d) => d.kcal));
                    const roundedMax = Math.ceil(chartMax / 1000) * 1000;
                    const gridSteps = [0, 0.25, 0.5, 0.75, 1];
                    const targetPct = Math.min(100, (calTarget / roundedMax) * 100);
                    return (
                      <>
                        <div className="flex justify-end gap-4 mb-2 hud-label text-[9px]">
                          <span className="flex items-center gap-1.5 text-primary">
                            <span className="w-4 border-t border-dashed border-primary" /> Target ({calTarget.toLocaleString()} kcal)
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-3 h-2 rounded-sm" style={{ background: "linear-gradient(180deg, oklch(0.78 0.22 240), oklch(0.5 0.2 240))" }} /> Consumed
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex flex-col justify-between hud-label text-[9px] text-muted-foreground tabular-nums" style={{ height: 180 }}>
                            {[...gridSteps].reverse().map((s) => (
                              <span key={s}>{Math.round(roundedMax * s).toLocaleString()}</span>
                            ))}
                          </div>
                          <div className="relative flex-1" style={{ height: 180 }}>
                            {gridSteps.map((s) => (
                              <div key={s} className="absolute left-0 right-0 border-t border-border/40" style={{ top: `${(1 - s) * 100}%` }} />
                            ))}
                            <div
                              className="absolute left-0 right-0 border-t border-dashed border-primary pointer-events-none"
                              style={{ top: `${100 - targetPct}%` }}
                            />
                            <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">
                              {last7.map((d, i) => {
                                const h = d.kcal > 0 ? Math.max(2, (d.kcal / roundedMax) * 100) : 0;
                                const isToday = i === last7.length - 1;
                                return (
                                  <div key={d.date} className="flex-1 h-full flex items-end">
                                    <div
                                      className="w-full rounded-t-sm transition-all duration-500"
                                      style={{
                                        height: `${h}%`,
                                        background: "linear-gradient(180deg, oklch(0.78 0.22 240), oklch(0.5 0.2 240))",
                                        boxShadow: isToday ? "0 0 8px oklch(0.78 0.22 240 / 0.7)" : "none",
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="hud-label text-[9px] invisible tabular-nums">{roundedMax.toLocaleString()}</div>
                          <div className="flex-1 flex justify-between gap-2 px-1">
                            {last7.map((d) => {
                              const label = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase().slice(0, 3);
                              return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                                  <div className="hud-label text-[10px] text-muted-foreground">{label}</div>
                                  <div className="hud-label text-xs text-foreground tabular-nums">{d.kcal > 0 ? d.kcal.toLocaleString() : "—"}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="space-y-2 text-[11px] border-l border-border pl-4">
                  <div><div className="hud-label text-[9px] text-muted-foreground">WEEKLY AVG</div><div className="text-primary hud-glow tabular-nums">{weeklyAvg.kcal.toLocaleString()} kcal</div></div>
                  <div><div className="hud-label text-[9px] text-muted-foreground">AVG PROTEIN</div><div className="text-foreground tabular-nums">{weeklyAvg.p}g</div></div>
                  <div><div className="hud-label text-[9px] text-muted-foreground">AVG CARBS</div><div className="text-foreground tabular-nums">{weeklyAvg.c}g</div></div>
                  <div><div className="hud-label text-[9px] text-muted-foreground">AVG FATS</div><div className="text-foreground tabular-nums">{weeklyAvg.f}g</div></div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Log weight dialog */}
          <Dialog open={logWeightOpen} onOpenChange={setLogWeightOpen}>
            <DialogContent className="hud-card border-primary/40">
              <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Log Weight</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <label className="block">
                  <span className="hud-label text-[10px] text-muted-foreground">Weight (lbs)</span>
                  <Input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="h-9 text-xs mt-1" placeholder="e.g. 175.4" />
                </label>
                <div className="pt-2 border-t border-border">
                  <div className="hud-label text-[10px] text-muted-foreground mb-2">
                    RESET
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="hud-label text-[10px] text-muted-foreground">Starting Weight (lbs)</span>
                      <Input type="number" step="0.1" value={newStartingWeight} onChange={(e) => setNewStartingWeight(e.target.value)} className="h-9 text-xs mt-1" placeholder="optional" />
                    </label>
                    <label className="block">
                      <span className="hud-label text-[10px] text-muted-foreground">Goal Weight (lbs)</span>
                      <Input type="number" step="0.1" value={newGoalWeight} onChange={(e) => setNewGoalWeight(e.target.value)} className="h-9 text-xs mt-1" placeholder="optional" />
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogWeightOpen(false)} className="hud-label text-[10px]">Cancel</Button>
                <Button onClick={submitWeight} className="hud-label text-[10px]">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>



        {/* ============ MEALS ============ */}
        <TabsContent value="meals" className="space-y-6 animate-fade-in">
          <Panel title="Today's Timeline">
            <div className="relative h-12 mt-2 mb-1">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" />
              {[0, 6, 12, 18, 24].map((h) => (
                <div key={h} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${(h / 24) * 100}%` }}>
                  <div className="w-px h-2 bg-border" />
                  <span className="hud-label text-[9px] text-muted-foreground mt-1">{h}:00</span>
                </div>
              ))}
              {timelineMeals.map((m) => (
                <div
                  key={m.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                  style={{ left: `${m.pct}%` }}
                  title={`${m.time} · ${m.name}`}
                >
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background animate-scale-in"
                    style={{ boxShadow: "0 0 8px var(--primary)" }} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={`Today's Meals (${todayMeals.length}) · ${t.kcal} kcal`}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Button onClick={openCustom} size="sm" className="hud-label text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> Add Meal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!undoStack.length}
                className="hud-label text-[10px]"
                title={undoStack.length ? `Undo: ${undoStack[undoStack.length - 1].label}` : "Nothing to undo"}
              >
                <Undo2 className="h-3 w-3 mr-1" /> Undo {undoStack.length ? `(${undoStack.length})` : ""}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetOpen(true)}
                disabled={!todayMeals.length && !todayWater}
                className="hud-label text-[10px] border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reset Today
              </Button>
            </div>
            <ul className="space-y-2">
              {todayMeals.map((m) => (
                <li key={m.id} className="grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 border border-border rounded-md p-3 group hover:border-primary/40 transition-colors animate-fade-in">
                  <div>
                    <div className="hud-label text-[10px] text-primary">{m.time ?? "—"}</div>
                    <div className="hud-label text-[9px] text-muted-foreground">{m.mealType ?? categoryFromTime(m.time ?? "12:00")}</div>
                  </div>
                  <div>
                    <div className="hud-label text-xs text-foreground">{m.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">P{m.protein} · C{m.carbs} · F{m.fats}</div>
                  </div>
                  <span className="hud-label text-sm text-primary">{m.calories} kcal</span>
                  <button onClick={() => delMeal(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!todayMeals.length && <li className="text-xs text-muted-foreground py-6 text-center">No meals logged today.</li>}
            </ul>
          </Panel>
        </TabsContent>

        {/* ============ MACROS ============ */}
        <TabsContent value="macros" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Calorie Source Breakdown">
              <div className="flex items-center gap-6">
                <div
                  className="rounded-full transition-all duration-700"
                  style={{
                    width: 150, height: 150,
                    background: `conic-gradient(
                      oklch(0.78 0.22 240) 0% ${slice1}%,
                      oklch(0.75 0.18 140) ${slice1}% ${slice1 + slice2}%,
                      oklch(0.78 0.18 60) ${slice1 + slice2}% ${slice1 + slice2 + slice3}%,
                      oklch(0.3 0.05 240) ${slice1 + slice2 + slice3}% 100%
                    )`,
                  }}
                />
                <div className="space-y-2 hud-label text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.78 0.22 240)" }} /> Protein {Math.round(slice1)}%</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.75 0.18 140)" }} /> Carbs {Math.round(slice2)}%</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.78 0.18 60)" }} /> Fats {Math.round(slice3)}%</div>
                </div>
              </div>
            </Panel>

            <Panel title="Calories by Meal — Today">
              <div className="space-y-2">
                {mealsByMealItem.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">No meals logged today.</div>}
                {mealsByMealItem.map((m, i) => {
                  const pct = Math.min(100, (m.kcal / Math.max(1, calTarget)) * 100);
                  return (
                    <div key={i} className="animate-fade-in">
                      <div className="flex justify-between hud-label text-[10px]">
                        <span className="text-muted-foreground truncate">{m.name}</span>
                        <span className="text-primary">{m.kcal} kcal</span>
                      </div>
                      <div className="h-2.5 rounded bg-primary/15 overflow-hidden mt-1">
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.78 0.22 240), oklch(0.5 0.2 240))" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <Panel title="Calories — Last 7 Days">
            <div className="relative" style={{ height: 200 }}>
              {/* target dashed line */}
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-primary/40 pointer-events-none"
                style={{ top: `${100 - Math.min(100, (calTarget / 2500) * 100)}%` }}>
                <span className="absolute -top-4 right-0 hud-label text-[9px] text-primary">Target {calTarget}</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-full">
                {last7.map((d) => {
                  const max = Math.max(2500, ...last7.map((x) => x.kcal));
                  const h = Math.max(4, (d.kcal / max) * 100);
                  const hit = d.kcal > 0 && Math.abs(d.kcal - calTarget) <= calTarget * 0.1;
                  const color = !d.kcal ? "oklch(0.3 0.05 240)" : hit ? "oklch(0.7 0.2 145)" : d.kcal > calTarget * 1.1 || d.kcal < calTarget * 0.85 ? "oklch(0.65 0.25 25)" : "oklch(0.78 0.22 240)";
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end" style={{ height: "85%" }}>
                        <div className="w-full rounded-t-sm transition-all duration-500"
                          style={{ height: `${h}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
                      </div>
                      <div className="hud-label text-[9px] text-muted-foreground">{d.date.slice(5)}</div>
                      <div className="hud-label text-[9px] text-foreground">{d.kcal || "—"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Weekly Averages">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Calories", weeklyAvg.kcal, "kcal"],
                  ["Protein",  weeklyAvg.p,    "g"],
                  ["Carbs",    weeklyAvg.c,    "g"],
                  ["Fats",     weeklyAvg.f,    "g"],
                ].map(([label, value, unit]) => (
                  <div key={label as string} className="border border-border rounded-md p-3">
                    <div className="hud-label text-[10px] text-muted-foreground">{label}</div>
                    <div className="hud-label text-2xl text-primary hud-glow mt-1">{value}<span className="text-xs text-muted-foreground ml-1">{unit}</span></div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Insights">
              <ul className="space-y-2">
                {insights.map((msg, i) => (
                  <li key={i} className="border border-primary/30 bg-primary/5 rounded-md p-3 hud-label text-[11px] text-foreground animate-fade-in">
                    {msg}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </TabsContent>

        {/* ============ WATER ============ */}
        <TabsContent value="water" className="space-y-6 animate-fade-in">
          <Panel title="Hydration Today">
            <div className="flex flex-col items-center gap-4">
              <RingProgress value={waterPct} size={170} label={`${waterPct}%`} sublabel="hydrated" />
              <div className="hud-label text-3xl text-primary hud-glow">{todayWater} / {waterTarget}</div>
              <div className="hud-label text-[11px] text-muted-foreground">{waterMessage}</div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWater(-1)} size="lg" className="hud-label">
                  <Minus className="h-4 w-4 mr-1" /> Glass
                </Button>
                <Button onClick={() => setWater(1)} size="lg" className="hud-label">
                  <Plus className="h-4 w-4 mr-1" /> Glass
                </Button>
              </div>
              <div className="flex justify-center gap-2 flex-wrap pt-2">
                {Array.from({ length: waterTarget }).map((_, i) => {
                  const filled = i < todayWater;
                  return (
                    <div key={i} className={`w-10 h-14 rounded-b-lg border-2 flex items-end overflow-hidden transition-colors ${filled ? "border-primary" : "border-border"}`}>
                      {filled && (
                        <div className="w-full animate-fade-in"
                          style={{
                            height: "100%",
                            background: "linear-gradient(to top, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))",
                            boxShadow: "0 0 10px var(--primary)",
                          }}>
                          <Droplet className="h-3 w-3 text-primary-foreground mx-auto mt-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="max-w-[200px] w-full">
                <label className="hud-label text-[10px] text-muted-foreground">Daily target (glasses)</label>
                <Input type="number" min={1} value={waterTarget}
                  onChange={(e) => updateProfile({ waterTarget: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-9 text-xs mt-1 text-center" />
              </div>
            </div>
          </Panel>

          <Panel title="Glasses — Last 7 Days">
            <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
              {last7.map((d) => {
                const h = Math.max(4, (d.water / Math.max(1, waterTarget)) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: "80%" }}>
                      <div className="w-full rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: "linear-gradient(180deg, oklch(0.78 0.22 240), oklch(0.5 0.2 240))",
                          boxShadow: "0 0 6px oklch(0.78 0.22 240 / 0.6)",
                        }} />
                    </div>
                    <div className="hud-label text-[9px] text-muted-foreground">{d.date.slice(5)}</div>
                    <div className="hud-label text-[9px] text-foreground">{d.water}</div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>

        {/* ============ GROCERY ============ */}
        <TabsContent value="grocery" className="space-y-6 animate-fade-in">
          <Panel title="Add Item">
            <div className="grid grid-cols-2 md:grid-cols-[1fr_80px_110px_140px_100px_auto] gap-2">
              <Input placeholder="Item name" value={gName} onChange={(e) => setGName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGrocery()} className="h-9 text-xs" />
              <Input placeholder="Qty" value={gQty} onChange={(e) => setGQty(e.target.value)} className="h-9 text-xs" />
              <select value={gUnit} onChange={(e) => setGUnit(e.target.value)}
                className="h-9 text-xs rounded-md border border-input bg-transparent px-2">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={gCat} onChange={(e) => setGCat(e.target.value)}
                className="h-9 text-xs rounded-md border border-input bg-transparent px-2">
                {GROCERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input type="number" placeholder="$" value={gCost} onChange={(e) => setGCost(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addGrocery} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>

          <Panel title={`Grocery List (${data.grocery.filter((g) => !g.done).length} pending) · Est. Total $${totalCost.toFixed(2)}`}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {["All", ...GROCERY_CATEGORIES].map((c) => (
                <button key={c} onClick={() => setGFilter(c)}
                  className={`hud-label text-[10px] px-2 py-1 rounded border transition-colors ${gFilter === c ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {c}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={resetChecks} className="hud-label text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                Reset checks
              </button>
            </div>
            <ul className="space-y-1">
              {filteredGrocery.map((g) => (
                <li key={g.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 border border-border rounded p-2 group animate-fade-in">
                  <button onClick={() => toggleGrocery(g.id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${g.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                    {g.done && <Check className="h-3 w-3 text-primary-foreground" />}
                  </button>
                  <span className={`text-sm ${g.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.name}</span>
                  <span className="hud-label text-[10px] text-muted-foreground">{g.qty} {g.unit ?? ""} · {g.category}</span>
                  <Input type="number" placeholder="$" defaultValue={g.cost ?? ""}
                    onBlur={(e) => updateGroceryCost(g.id, Number(e.target.value) || 0)}
                    className="h-7 w-16 text-[10px]" />
                  <button onClick={() => delGrocery(g.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!filteredGrocery.length && <li className="text-xs text-muted-foreground py-4 text-center">No items.</li>}
            </ul>
          </Panel>
        </TabsContent>

        {/* ============ HISTORY ============ */}
        <TabsContent value="history" className="space-y-6 animate-fade-in">
          <Panel title="Last 30 Days">
            <div className="grid grid-cols-7 gap-1.5">
              {last30.map((d) => {
                const pct = calTarget ? (d.kcal / calTarget) * 100 : 0;
                const cls = !d.kcal ? "bg-muted/30 border-border text-muted-foreground"
                  : Math.abs(d.kcal - calTarget) <= 100 ? "bg-emerald-500/60 border-emerald-400 text-foreground"
                  : Math.abs(d.kcal - calTarget) <= 200 ? "bg-yellow-500/50 border-yellow-400 text-foreground"
                  : "bg-red-500/50 border-red-400 text-foreground";
                return (
                  <button
                    key={d.date}
                    onClick={() => { setHistoryDate(d.date); setHistoryOpen(true); }}
                    className={`aspect-square rounded border ${cls} flex flex-col items-center justify-center hover:scale-105 transition-transform`}
                    title={`${d.date}: ${d.kcal} kcal · ${Math.round(pct)}%`}
                  >
                    <div className="hud-label text-[9px]">{Number(d.date.slice(8))}</div>
                    <div className="hud-label text-[8px] opacity-90">{d.kcal || "—"}</div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Best Day This Month">
              {bestDay ? (
                <div className="text-center py-4">
                  <div className="hud-label text-2xl text-primary hud-glow">{bestDay.date}</div>
                  <div className="hud-label text-[10px] text-muted-foreground mt-1">macro balance score {bestDay.score}/100</div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">No data yet.</div>
              )}
            </Panel>
            <Panel title="Consistency Score">
              <div className="text-center py-4">
                <div className="hud-label text-4xl text-primary hud-glow">{consistency}%</div>
                <div className="hud-label text-[10px] text-muted-foreground mt-1">days logged in last 30</div>
              </div>
            </Panel>
          </div>

          <Panel title="Weekly Summaries">
            <div className="space-y-2">
              {weekSummaries.map((w) => (
                <div key={w.label} className="grid grid-cols-2 md:grid-cols-6 gap-2 border border-border rounded-md p-3">
                  <div className="hud-label text-[11px] text-primary">{w.label}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">Cal <span className="text-foreground">{w.kcal}</span></div>
                  <div className="hud-label text-[10px] text-muted-foreground">P <span className="text-foreground">{w.p}g</span></div>
                  <div className="hud-label text-[10px] text-muted-foreground">C <span className="text-foreground">{w.c}g</span></div>
                  <div className="hud-label text-[10px] text-muted-foreground">F <span className="text-foreground">{w.f}g</span></div>
                  <div className="hud-label text-[10px] text-muted-foreground">Water <span className="text-foreground">{w.water}</span></div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      {/* Custom-meal modal */}
      <Dialog open={mealOpen} onOpenChange={setMealOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Log Meal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Meal name" value={mName} onChange={(e) => setMName(e.target.value)} className="h-9 text-xs" />
            <div className="grid grid-cols-4 gap-2">
              <Input type="number" placeholder="kcal" value={mKcal} onChange={(e) => setMKcal(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="P" value={mP} onChange={(e) => setMP(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="C" value={mC} onChange={(e) => setMC(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="F" value={mF} onChange={(e) => setMF(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Time</span>
                <Input type="time" value={mTime} onChange={(e) => { setMTime(e.target.value); setMType(categoryFromTime(e.target.value)); }} className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Meal</span>
                <select value={mType} onChange={(e) => setMType(e.target.value as MealType)}
                  className="h-9 text-xs mt-1 w-full rounded-md border border-input bg-transparent px-2">
                  {MEAL_TYPES.map((mt) => <option key={mt} value={mt}>{mt}</option>)}
                </select>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitMeal} className="hud-label text-[10px]">Save Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History day modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">{historyDate}</DialogTitle></DialogHeader>
          <ul className="divide-y divide-border max-h-[50vh] overflow-y-auto">
            {historyMeals.map((m) => (
              <li key={m.id} className="py-2 grid grid-cols-[60px_1fr_auto] items-center gap-2">
                <span className="hud-label text-[10px] text-primary">{m.time ?? "—"}</span>
                <div>
                  <div className="hud-label text-xs text-foreground">{m.name}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">P{m.protein} · C{m.carbs} · F{m.fats}</div>
                </div>
                <span className="hud-label text-xs text-primary">{m.calories} kcal</span>
              </li>
            ))}
            {!historyMeals.length && <li className="text-xs text-muted-foreground py-4 text-center">No meals logged.</li>}
          </ul>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="hud-label text-[10px] text-muted-foreground">Total: <span className="text-primary">{historyTotals.kcal} kcal</span></div>
            <div className="hud-label text-[10px] text-muted-foreground">Macros: <span className="text-foreground">P{historyTotals.p} · C{historyTotals.c} · F{historyTotals.f}</span></div>
            <div className="hud-label text-[10px] text-muted-foreground col-span-2">Water: <span className="text-primary">{historyWater} glasses</span></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset today confirmation */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="hud-card border-destructive/50">
          <DialogHeader>
            <DialogTitle className="hud-label text-destructive">Reset Today's Log?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This clears all <span className="text-foreground">{todayMeals.length}</span> meal{todayMeals.length === 1 ? "" : "s"} and{" "}
            <span className="text-foreground">{todayWater}</span> glass{todayWater === 1 ? "" : "es"} of water for today.
            You can undo this immediately after.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button
              onClick={resetToday}
              className="hud-label text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
