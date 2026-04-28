import { createFileRoute } from "@tanstack/react-router";
import { Target, Plus, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { useEvolutionData, type Goal, type GoalCategory } from "@/lib/evolution-data";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — Evolution" }] }),
  component: GoalsPage,
});

const CATEGORIES: GoalCategory[] = ["Wealth", "Fitness", "Trading", "Business", "Nutrition", "Hobby"];

function GoalsPage() {
  const { data, mutate } = useEvolutionData();
  const goals = data.goals ?? [];

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Wealth");
  const [target, setTarget] = useState(100);
  const [current, setCurrent] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [unit, setUnit] = useState("");

  function addGoal() {
    if (!title.trim() || target <= 0) return;
    const g: Goal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      target: Number(target),
      current: Number(current) || 0,
      deadline: deadline || "",
      unit: unit.trim() || undefined,
      completed: false,
    };
    mutate((p) => ({ goals: [...(p.goals ?? []), g] }));
    setTitle(""); setTarget(100); setCurrent(0); setDeadline(""); setUnit("");
  }

  function update(id: string, patch: Partial<Goal>) {
    mutate((p) => ({ goals: (p.goals ?? []).map((g) => g.id === id ? { ...g, ...patch } : g) }));
  }

  function del(id: string) {
    mutate((p) => ({ goals: (p.goals ?? []).filter((g) => g.id !== id) }));
  }

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  return (
    <ModuleLayout number="" title="Goals" subtitle="Track what matters" icon={Target}>
      <Panel title="NEW GOAL">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <label className="hud-label text-[10px] text-muted-foreground">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="hud-label text-[10px] text-muted-foreground">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="hud-label text-[10px] text-muted-foreground">Current</label>
            <input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="hud-label text-[10px] text-muted-foreground">Target</label>
            <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="hud-label text-[10px] text-muted-foreground">Unit (optional)</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="$, lbs, hrs..."
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="hud-label text-[10px] text-muted-foreground">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
          </div>
          <div className="flex items-end">
            <button onClick={addGoal}
              className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-xs rounded hover:bg-primary/25 w-full justify-center">
              <Plus className="h-4 w-4" /> Add Goal
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={`ACTIVE · ${active.length}`}>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active goals yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <li key={g.id} className="p-4 border border-border rounded bg-primary/5">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="hud-label text-[10px] text-accent">{g.category}</span>
                        <h3 className="hud-label text-sm text-foreground truncate">{g.title}</h3>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {g.current}{g.unit ? ` ${g.unit}` : ""} / {g.target}{g.unit ? ` ${g.unit}` : ""}
                        {g.deadline && <span className="ml-2">· due {g.deadline}</span>}
                      </div>
                    </div>
                    <button onClick={() => update(g.id, { completed: true })}
                      title="Mark complete"
                      className="p-2 border border-border rounded text-primary hover:bg-primary/10">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => del(g.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--glow)" }} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" value={g.current}
                      onChange={(e) => update(g.id, { current: Number(e.target.value) })}
                      className="w-28 bg-input border border-border rounded px-2 py-1 text-xs text-foreground" />
                    <span className="hud-label text-[10px] text-primary">{pct}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {completed.length > 0 && (
        <Panel title={`COMPLETED · ${completed.length}`}>
          <ul className="flex flex-col gap-2">
            {completed.map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-2 border border-border rounded opacity-60">
                <Check className="h-4 w-4 text-primary" />
                <span className="hud-label text-[10px] text-accent">{g.category}</span>
                <span className="text-sm text-foreground line-through flex-1 truncate">{g.title}</span>
                <button onClick={() => update(g.id, { completed: false })}
                  className="text-[10px] hud-label text-primary hover:underline">Reopen</button>
                <button onClick={() => del(g.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </ModuleLayout>
  );
}
