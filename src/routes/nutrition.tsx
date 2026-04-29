import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Apple, Trash2, Minus, Plus, Droplet, Flame, Clock } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, MEALS, MEAL_TYPES, todayDate, uid,
  dayTotals, nutritionStreak, weeklyAverage, mostLoggedMeal,
  type MealType,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Evolution" }, { name: "description", content: "Daily calories, macros, meals, grocery, water." }] }),
  component: NutritionPage,
});

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function guessMealType(time: string): MealType {
  const h = Number(time.slice(0, 2));
  if (h < 11) return "Breakfast";
  if (h < 15) return "Lunch";
  if (h < 21) return "Dinner";
  return "Snack";
}
function statusColor(pct: number): string {
  if (pct < 80) return "text-emerald-400";
  if (pct <= 105) return "text-emerald-400";
  if (pct <= 115) return "text-yellow-400";
  return "text-red-400";
}

function NutritionPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const today = todayDate();

  const t = dayTotals(today, data.mealLogs);
  const target = data.profile.calorieTarget || 2000;
  const pTarget = data.profile.proteinTarget || 1;
  const cTarget = data.profile.carbsTarget || 1;
  const fTarget = data.profile.fatsTarget || 1;
  const calPct = Math.round((t.kcal / target) * 100);
  const pPct = Math.min(100, Math.round((t.p / pTarget) * 100));
  const cPct = Math.min(100, Math.round((t.c / cTarget) * 100));
  const fPct = Math.min(100, Math.round((t.f / fTarget) * 100));

  // Water
  const waterTarget = data.profile.waterTarget || 8;
  const todayWater = data.water.find((w) => w.date === today)?.glasses ?? 0;
  const setWater = (delta: number) => {
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

  // Meals
  const todayMeals = useMemo(
    () => data.mealLogs.filter((m) => m.date === today).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    [data.mealLogs, today]
  );

  const quickAdd = (key: string) => {
    const m = MEALS.find((x) => x.key === key);
    if (!m) return;
    const time = nowTime();
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: m.label,
        calories: m.kcal, protein: m.p, carbs: m.c, fats: m.f,
        time, mealType: guessMealType(time),
      }],
    }));
  };

  // Custom meal modal
  const [mealOpen, setMealOpen] = useState(false);
  const [mName, setMName] = useState(""); const [mKcal, setMKcal] = useState("");
  const [mP, setMP] = useState(""); const [mC, setMC] = useState(""); const [mF, setMF] = useState("");
  const [mTime, setMTime] = useState(nowTime());
  const [mType, setMType] = useState<MealType>("Lunch");
  const submitMeal = () => {
    if (!mName.trim() || !Number(mKcal)) return;
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: mName.trim(),
        calories: Number(mKcal) || 0, protein: Number(mP) || 0,
        carbs: Number(mC) || 0, fats: Number(mF) || 0,
        time: mTime, mealType: mType,
      }],
    }));
    setMName(""); setMKcal(""); setMP(""); setMC(""); setMF("");
    setMTime(nowTime()); setMType("Lunch");
    setMealOpen(false);
  };
  const delMeal = (id: string) => mutate((prev) => ({ mealLogs: prev.mealLogs.filter((m) => m.id !== id) }));

  // Per-meal-type breakdown for today
  const byType = useMemo(() => {
    const map: Record<MealType, number> = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
    for (const m of todayMeals) {
      const k = (m.mealType ?? guessMealType(m.time ?? "12:00")) as MealType;
      map[k] += m.calories;
    }
    return map;
  }, [todayMeals]);

  // Weekly avg + streak + insights
  const weekly = useMemo(() => weeklyAverage(data.mealLogs), [data.mealLogs]);
  const streak = useMemo(() => nutritionStreak(data.mealLogs, target), [data.mealLogs, target]);
  const top = useMemo(() => mostLoggedMeal(data.mealLogs), [data.mealLogs]);

  // Eating window
  const eatingWindow = useMemo(() => {
    if (!todayMeals.length) return null;
    const times = todayMeals.map((m) => m.time ?? "12:00").sort();
    return { first: times[0], last: times[times.length - 1] };
  }, [todayMeals]);

  // Grocery
  const [gName, setGName] = useState(""); const [gQty, setGQty] = useState("1"); const [gCat, setGCat] = useState("General");
  const addGrocery = () => {
    if (!gName.trim()) return;
    mutate((prev) => ({ grocery: [...prev.grocery, { id: uid(), name: gName.trim(), qty: gQty, category: gCat, done: false }] }));
    setGName(""); setGQty("1");
  };
  const toggleGrocery = (id: string) => mutate((prev) => ({ grocery: prev.grocery.map((g) => g.id === id ? { ...g, done: !g.done } : g) }));
  const delGrocery = (id: string) => mutate((prev) => ({ grocery: prev.grocery.filter((g) => g.id !== id) }));
  const clearDoneGrocery = () => mutate((prev) => ({ grocery: prev.grocery.filter((g) => !g.done) }));

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState<string | null>(null);
  const last30Days = useMemo(() => {
    const out: { date: string; kcal: number }[] = [];
    const d = new Date();
    for (let i = 29; i >= 0; i--) {
      const iso = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10);
      out.push({ date: iso, kcal: dayTotals(iso, data.mealLogs).kcal });
    }
    return out;
  }, [data.mealLogs]);
  const historyMeals = historyDate ? data.mealLogs.filter((m) => m.date === historyDate) : [];

  // Pie (macro breakdown by grams)
  const macroSum = t.p + t.c + t.f || 1;
  const pSlice = (t.p / macroSum) * 100;
  const cSlice = (t.c / macroSum) * 100;

  return (
    <ModuleLayout number="02" title="Nutrition" subtitle="Calories · Macros · Meals · Water" icon={Apple}>
      <Tabs defaultValue="today">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="grocery">Grocery</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
        </TabsList>

        {/* TODAY */}
        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            <Panel title="Today">
              <div className="flex justify-center my-2">
                <RingProgress
                  value={Math.min(100, calPct)}
                  size={170}
                  label={`${calPct}%`}
                  sublabel={`${t.kcal} / ${target} kcal`}
                />
              </div>
              <div className={`text-center hud-label text-[11px] mt-2 ${statusColor(calPct)}`}>
                {calPct < 80 && "On track — room to eat"}
                {calPct >= 80 && calPct <= 105 && "On target"}
                {calPct > 105 && calPct <= 115 && "Close to limit"}
                {calPct > 115 && "Over target"}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="text-center"><RingProgress value={pPct} size={70} label={`${t.p}g`} sublabel="Protein" /></div>
                <div className="text-center"><RingProgress value={cPct} size={70} label={`${t.c}g`} sublabel="Carbs" /></div>
                <div className="text-center"><RingProgress value={fPct} size={70} label={`${t.f}g`} sublabel="Fats" /></div>
              </div>
            </Panel>

            <div className="space-y-6">
              <Panel title="Quick Add — Your Foods">
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => quickAdd(m.key)}
                      className="text-left p-3 rounded-md border border-border hover:border-primary/60 hover:bg-primary/10 transition-colors"
                    >
                      <div className="hud-label text-xs text-foreground">{m.label}</div>
                      <div className="hud-label text-[10px] text-muted-foreground mt-1">
                        {m.kcal} cal · {m.p}P · {m.c}C · {m.f}F
                      </div>
                    </button>
                  ))}
                </div>
                <Button onClick={() => { setMTime(nowTime()); setMType(guessMealType(nowTime())); setMealOpen(true); }} className="w-full mt-4 hud-label text-[10px]">
                  + Log Custom Meal
                </Button>
              </Panel>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel title="Calories by Meal — Today">
                  <div className="space-y-2">
                    {(MEAL_TYPES as MealType[]).map((mt) => {
                      const v = byType[mt];
                      const pct = Math.min(100, Math.round((v / target) * 100));
                      return (
                        <div key={mt}>
                          <div className="flex justify-between hud-label text-[10px]">
                            <span className="text-muted-foreground">{mt}</span>
                            <span className="text-primary">{v} kcal</span>
                          </div>
                          <div className="h-2 rounded bg-primary/15 overflow-hidden mt-1">
                            <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.78 0.22 240), oklch(0.5 0.2 240))" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <Panel title="Macro Breakdown">
                  <div className="flex items-center gap-4">
                    <div
                      className="rounded-full"
                      style={{
                        width: 120, height: 120,
                        background: `conic-gradient(
                          oklch(0.78 0.22 240) 0% ${pSlice}%,
                          oklch(0.75 0.18 140) ${pSlice}% ${pSlice + cSlice}%,
                          oklch(0.78 0.18 60) ${pSlice + cSlice}% 100%
                        )`,
                      }}
                    />
                    <div className="space-y-2 hud-label text-[11px]">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.78 0.22 240)" }} /> Protein {t.p}g</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.75 0.18 140)" }} /> Carbs {t.c}g</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.78 0.18 60)" }} /> Fats {t.f}g</div>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Streak">
              <div className="text-center py-4">
                <Flame className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="hud-label text-4xl text-primary hud-glow">{streak}</div>
                <div className="hud-label text-[10px] text-muted-foreground mt-1">days hitting target</div>
              </div>
            </Panel>
            <Panel title="Weekly Average">
              <div className="text-center py-4">
                <div className="hud-label text-3xl text-primary hud-glow">{weekly.avg}</div>
                <div className="hud-label text-[10px] text-muted-foreground mt-1">kcal/day · 7d</div>
                <div className="hud-label text-[10px] mt-2 text-muted-foreground">
                  {weekly.avg ? `${weekly.avg - target >= 0 ? "+" : ""}${weekly.avg - target} vs target` : "—"}
                </div>
              </div>
            </Panel>
            <Panel title="Eating Window">
              <div className="text-center py-4">
                <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="hud-label text-2xl text-primary hud-glow">
                  {eatingWindow ? `${eatingWindow.first} – ${eatingWindow.last}` : "—"}
                </div>
                <div className="hud-label text-[10px] text-muted-foreground mt-1">first → last meal today</div>
              </div>
            </Panel>
          </div>

          <Panel title="Calories — Last 7 Days">
            <Sparkline data={weekly.totals} height={160} labels={weekly.days.map((d) => d.slice(5))} />
            {top && (
              <div className="hud-label text-[10px] text-muted-foreground mt-3">
                Most logged meal: <span className="text-primary">{top.name}</span> · {top.count}×
              </div>
            )}
          </Panel>
        </TabsContent>

        {/* MEALS */}
        <TabsContent value="meals" className="space-y-6">
          <Panel title={`Today's Meals (${todayMeals.length})`}>
            <Button onClick={() => { setMTime(nowTime()); setMType(guessMealType(nowTime())); setMealOpen(true); }} size="sm" className="hud-label text-[10px] mb-4">
              <Plus className="h-3 w-3 mr-1" /> Log Meal
            </Button>
            <ul className="divide-y divide-border">
              {todayMeals.map((m) => (
                <li key={m.id} className="py-3 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 group">
                  <div>
                    <div className="hud-label text-[10px] text-primary">{m.time ?? "—"}</div>
                    <div className="hud-label text-[9px] text-muted-foreground">{m.mealType ?? guessMealType(m.time ?? "12:00")}</div>
                  </div>
                  <div>
                    <div className="hud-label text-xs text-foreground">{m.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">P{m.protein} · C{m.carbs} · F{m.fats}</div>
                  </div>
                  <span className="hud-label text-sm text-primary">{m.calories} kcal</span>
                  <button onClick={() => delMeal(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!todayMeals.length && <li className="text-xs text-muted-foreground py-6 text-center">No meals logged today.</li>}
            </ul>
          </Panel>
        </TabsContent>

        {/* GROCERY */}
        <TabsContent value="grocery" className="space-y-6">
          <Panel title="Add Item">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_140px_auto] gap-3">
              <Input placeholder="Item name" value={gName} onChange={(e) => setGName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGrocery()} className="h-9 text-xs" />
              <Input placeholder="Qty" value={gQty} onChange={(e) => setGQty(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Category" value={gCat} onChange={(e) => setGCat(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addGrocery} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>
          <Panel title={`Grocery List (${data.grocery.filter((g) => !g.done).length} pending)`}>
            <ul className="space-y-1">
              {data.grocery.map((g) => (
                <li key={g.id} className="flex items-center gap-3 border border-border rounded p-2 group">
                  <button onClick={() => toggleGrocery(g.id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${g.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                    {g.done && <span className="text-[10px] text-primary-foreground">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${g.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.name}</span>
                  <span className="hud-label text-[10px] text-muted-foreground">{g.qty} · {g.category}</span>
                  <button onClick={() => delGrocery(g.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.grocery.length && <li className="text-xs text-muted-foreground py-4 text-center">List is empty.</li>}
            </ul>
            {data.grocery.some((g) => g.done) && (
              <button onClick={clearDoneGrocery} className="mt-3 hud-label text-[10px] text-muted-foreground hover:text-destructive">
                Clear purchased
              </button>
            )}
          </Panel>
        </TabsContent>

        {/* WATER */}
        <TabsContent value="water" className="space-y-6">
          <Panel title="Water Tracker">
            <div className="text-center">
              <div className="hud-label text-5xl text-primary hud-glow">{todayWater} / {waterTarget}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">glasses today</div>
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={() => setWater(-1)} size="lg" className="hud-label">
                  <Minus className="h-4 w-4 mr-1" /> Glass
                </Button>
                <Button onClick={() => setWater(1)} size="lg" className="hud-label">
                  <Plus className="h-4 w-4 mr-1" /> Glass
                </Button>
              </div>
              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {Array.from({ length: waterTarget }).map((_, i) => (
                  <div key={i} className={`w-8 h-12 rounded-b-lg border-2 flex items-end ${i < todayWater ? "border-primary" : "border-border"}`}>
                    {i < todayWater && (
                      <div className="w-full rounded-b-md" style={{ height: "100%", background: "linear-gradient(to top, var(--primary), color-mix(in oklab, var(--primary) 50%, transparent))", boxShadow: "0 0 8px var(--primary)" }}>
                        <Droplet className="h-3 w-3 text-primary-foreground mx-auto mt-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 max-w-[200px] mx-auto">
                <label className="hud-label text-[10px] text-muted-foreground">Daily target (glasses)</label>
                <Input type="number" min={1} value={waterTarget}
                  onChange={(e) => updateProfile({ waterTarget: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-9 text-xs mt-1 text-center" />
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="space-y-6">
          <Panel title="Last 30 Days">
            <div className="grid grid-cols-7 gap-1.5">
              {last30Days.map((d) => {
                const pct = target ? Math.min(120, Math.round((d.kcal / target) * 100)) : 0;
                const cls = !d.kcal ? "bg-muted/30 border-border"
                  : pct < 80 ? "bg-emerald-500/30 border-emerald-500/50"
                  : pct <= 110 ? "bg-emerald-500/60 border-emerald-400"
                  : pct <= 120 ? "bg-yellow-500/60 border-yellow-400"
                  : "bg-red-500/60 border-red-400";
                return (
                  <button
                    key={d.date}
                    onClick={() => { setHistoryDate(d.date); setHistoryOpen(true); }}
                    className={`aspect-square rounded border ${cls} flex flex-col items-center justify-center hover:scale-105 transition-transform`}
                    title={`${d.date}: ${d.kcal} kcal`}
                  >
                    <div className="hud-label text-[9px] text-foreground">{Number(d.date.slice(8))}</div>
                    <div className="hud-label text-[8px] text-foreground/80">{d.kcal || "—"}</div>
                  </button>
                );
              })}
            </div>
          </Panel>
        </TabsContent>

        {/* TARGETS */}
        <TabsContent value="targets" className="space-y-6">
          <Panel title="Daily Targets">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Calories</span>
                <Input type="number" value={data.profile.calorieTarget}
                  onChange={(e) => updateProfile({ calorieTarget: Number(e.target.value) || 0 })}
                  className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Protein (g)</span>
                <Input type="number" value={data.profile.proteinTarget}
                  onChange={(e) => updateProfile({ proteinTarget: Number(e.target.value) || 0 })}
                  className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Carbs (g)</span>
                <Input type="number" value={data.profile.carbsTarget}
                  onChange={(e) => updateProfile({ carbsTarget: Number(e.target.value) || 0 })}
                  className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Fats (g)</span>
                <Input type="number" value={data.profile.fatsTarget}
                  onChange={(e) => updateProfile({ fatsTarget: Number(e.target.value) || 0 })}
                  className="h-9 text-xs mt-1" />
              </label>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      {/* Custom meal modal */}
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
                <Input type="time" value={mTime} onChange={(e) => { setMTime(e.target.value); setMType(guessMealType(e.target.value)); }} className="h-9 text-xs mt-1" />
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
          <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
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
          <div className="hud-label text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
            Total: <span className="text-primary">{historyDate ? dayTotals(historyDate, data.mealLogs).kcal : 0} kcal</span>
          </div>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
