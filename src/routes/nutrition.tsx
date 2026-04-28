import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Apple } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { RingProgress } from "@/components/evolution/RingProgress";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useEvolutionData, MEALS, nutritionSummary, todayDate, type Meal,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — Evolution" },
      { name: "description", content: "Calories, macros, meals, and nutrition history." },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const sum = nutritionSummary(data.nutrition, data.meals, data.profile.calorieTarget);
  const [cal, setCal] = useState("");
  const [prot, setProt] = useState("");

  const toggle = (m: Meal) => {
    mutate((prev) => ({
      meals: prev.meals.includes(m) ? prev.meals.filter((x) => x !== m) : [...prev.meals, m],
    }));
  };

  const logDay = () => {
    const calories = Number(cal) || sum.calories;
    const protein = Number(prot) || sum.protein;
    if (!calories) return;
    mutate((prev) => ({
      nutrition: [...prev.nutrition, { date: todayDate(), calories, protein, carbs: sum.carbs, fats: sum.fats }],
      meals: [],
    }));
    setCal(""); setProt("");
  };

  const last14 = data.nutrition.slice(-14);

  return (
    <ModuleLayout number="02" title="Nutrition" subtitle="Calories · Macros · Meals" icon={Apple}>
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

        <Panel title="Select Meals">
          <div className="grid grid-cols-2 gap-2">
            {MEALS.map((m) => {
              const on = data.meals.includes(m.key);
              return (
                <button key={m.key} onClick={() => toggle(m.key)}
                  className={`text-left p-3 rounded-md border transition-colors ${on ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-foreground/80 hover:border-primary/40"}`}>
                  <div className="hud-label text-xs">{m.label}</div>
                  <div className="hud-label text-[10px] text-muted-foreground mt-1">
                    {m.kcal} kcal · P{m.p} C{m.c} F{m.f}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="hud-label text-[10px] text-muted-foreground">Log custom values for today</div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={cal} onChange={(e) => setCal(e.target.value)} type="number" placeholder="Calories" className="h-9 text-xs" />
              <Input value={prot} onChange={(e) => setProt(e.target.value)} type="number" placeholder="Protein (g)" className="h-9 text-xs" />
            </div>
            <Button onClick={logDay} size="sm" className="w-full hud-label text-[10px]">Log Day</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Calorie Trend (Last 14 Days)">
        <Sparkline data={last14.map((r) => r.calories)} height={180} labels={last14.map((r) => r.date.slice(5))} />
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Targets">
          <div className="space-y-3">
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

        <Panel title="History">
          <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
            {[...data.nutrition].reverse().map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                <span className="hud-label text-xs text-primary">{e.calories} kcal</span>
                <span className="hud-label text-[10px] text-foreground/70">P{e.protein ?? 0}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
