import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Apple, Trash2, Minus, Plus, Droplet } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, MEALS, nutritionSummary, todayDate, uid, type Meal,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Evolution" }, { name: "description", content: "Daily calories, macros, meals, grocery, water." }] }),
  component: NutritionPage,
});

const WATER_TARGET = 8;

function NutritionPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const sum = nutritionSummary(data.nutrition, data.meals, data.profile.calorieTarget, data.mealLogs);
  const today = todayDate();

  // Water
  const todayWater = data.water.find((w) => w.date === today)?.glasses ?? 0;
  const setWater = (delta: number) => {
    mutate((prev) => {
      const exists = prev.water.find((w) => w.date === today);
      const next = Math.max(0, (exists?.glasses ?? 0) + delta);
      return {
        water: exists
          ? prev.water.map((w) => w.date === today ? { ...w, glasses: next } : w)
          : [...prev.water, { date: today, glasses: next }],
      };
    });
  };

  // Quick toggles
  const toggleQuick = (m: Meal) => {
    mutate((prev) => ({
      meals: prev.meals.includes(m) ? prev.meals.filter((x) => x !== m) : [...prev.meals, m],
    }));
  };

  // Log meal modal
  const [mealOpen, setMealOpen] = useState(false);
  const [mName, setMName] = useState(""); const [mKcal, setMKcal] = useState("");
  const [mP, setMP] = useState(""); const [mC, setMC] = useState(""); const [mF, setMF] = useState("");
  const submitMeal = () => {
    if (!mName.trim() || !Number(mKcal)) return;
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: mName.trim(),
        calories: Number(mKcal) || 0, protein: Number(mP) || 0, carbs: Number(mC) || 0, fats: Number(mF) || 0,
      }],
    }));
    setMName(""); setMKcal(""); setMP(""); setMC(""); setMF("");
    setMealOpen(false);
  };
  const delMeal = (id: string) => mutate((prev) => ({ mealLogs: prev.mealLogs.filter((m) => m.id !== id) }));

  const todayMeals = data.mealLogs.filter((m) => m.date === today);

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

  const last14 = data.nutrition.slice(-14);

  return (
    <ModuleLayout number="02" title="Nutrition" subtitle="Calories · Macros · Meals · Water" icon={Apple}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="grocery">Grocery</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            <Panel title="Today">
              <div className="flex justify-center my-2">
                <RingProgress value={sum.percent} size={160} label={`${sum.percent}%`} sublabel={`${sum.calories} / ${sum.target} kcal`} />
              </div>
              <div className="space-y-2 mt-4">
                {[["Protein", sum.protein, data.profile.proteinTarget, "g"],
                  ["Carbs", sum.carbs, null, "g"],
                  ["Fats", sum.fats, null, "g"]].map(([k, v, t, u]) => (
                  <div key={k as string} className="flex justify-between hud-label text-[11px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-primary">{v as number}{u}{t ? ` / ${t}${u}` : ""}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Quick Add — Michael's Foods">
              <div className="grid grid-cols-2 gap-2">
                {MEALS.map((m) => {
                  const on = data.meals.includes(m.key);
                  return (
                    <button key={m.key} onClick={() => toggleQuick(m.key)}
                      className={`text-left p-3 rounded-md border transition-colors ${on ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-foreground/80 hover:border-primary/40"}`}>
                      <div className="hud-label text-xs">{m.label}</div>
                      <div className="hud-label text-[10px] text-muted-foreground mt-1">
                        {m.kcal} kcal · P{m.p} C{m.c} F{m.f}
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button onClick={() => setMealOpen(true)} className="w-full mt-4 hud-label text-[10px]">
                + Log Custom Meal
              </Button>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="hud-label text-[10px] text-muted-foreground">Calorie target</span>
                  <Input type="number" value={data.profile.calorieTarget} onChange={(e) => updateProfile({ calorieTarget: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
                </label>
                <label className="block">
                  <span className="hud-label text-[10px] text-muted-foreground">Protein target (g)</span>
                  <Input type="number" value={data.profile.proteinTarget} onChange={(e) => updateProfile({ proteinTarget: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
                </label>
              </div>
            </Panel>
          </div>

          <Panel title="Calorie Trend (Last 14 Days)">
            <Sparkline data={last14.map((r) => r.calories)} height={180} labels={last14.map((r) => r.date.slice(5))} />
          </Panel>
        </TabsContent>

        <TabsContent value="meals" className="space-y-6">
          <Panel title={`Today's Meals (${todayMeals.length})`}>
            <Button onClick={() => setMealOpen(true)} size="sm" className="hud-label text-[10px] mb-4">
              <Plus className="h-3 w-3 mr-1" /> Log Meal
            </Button>
            <ul className="divide-y divide-border">
              {todayMeals.map((m) => (
                <li key={m.id} className="py-3 grid grid-cols-[1fr_auto_auto] items-center gap-3 group">
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

        <TabsContent value="water" className="space-y-6">
          <Panel title="Water Tracker">
            <div className="text-center">
              <div className="hud-label text-5xl text-primary hud-glow">{todayWater} / {WATER_TARGET}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">glasses today</div>
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={() => setWater(-1)} size="lg" className="hud-label">
                  <Minus className="h-4 w-4 mr-1" /> Glass
                </Button>
                <Button onClick={() => setWater(1)} size="lg" className="hud-label">
                  <Plus className="h-4 w-4 mr-1" /> Glass
                </Button>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: WATER_TARGET }).map((_, i) => (
                  <div key={i} className={`w-8 h-12 rounded-b-lg border-2 flex items-end ${i < todayWater ? "border-primary" : "border-border"}`}>
                    {i < todayWater && (
                      <div className="w-full rounded-b-md" style={{ height: "100%", background: "linear-gradient(to top, var(--primary), color-mix(in oklab, var(--primary) 50%, transparent))", boxShadow: "0 0 8px var(--primary)" }}>
                        <Droplet className="h-3 w-3 text-primary-foreground mx-auto mt-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitMeal} className="hud-label text-[10px]">Save Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
