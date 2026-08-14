import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useEvolutionData, uid, type EvoCategory, type EvoHabit } from "@/lib/evolution-data";
import { resolveHabits, DEFAULT_HABITS } from "@/lib/habits";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "TH", "F", "SA", "SU"];

const CATEGORIES: EvoCategory[] = [
  "Wealth", "Nutrition", "Fitness", "Journal", "Notes", "Investing", "Business", "Hobby",
];

function weekDates(base = new Date()): string[] {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  });
}

export function WeeklyTasksCard() {
  const { data, mutate } = useEvolutionData();
  const habitLog = data.habitLog ?? {};
  const habits = useMemo(
    () => resolveHabits(data.customHabits ?? [], data.habitOrder ?? [], data.hiddenHabits ?? []),
    [data.customHabits, data.habitOrder, data.hiddenHabits],
  );
  const days = useMemo(() => weekDates(), []);
  const today = new Date().toISOString().slice(0, 10);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<EvoCategory>("Fitness");

  function toggle(habitId: string, iso: string) {
    mutate((p) => {
      const log = { ...(p.habitLog ?? {}) };
      const set = new Set(log[habitId] ?? []);
      if (set.has(iso)) set.delete(iso); else set.add(iso);
      log[habitId] = [...set];
      return { habitLog: log };
    });
  }

  function addHabit() {
    const n = name.trim();
    if (!n) return;
    const habit: EvoHabit = { id: `h-${uid()}`, name: n, category: cat };
    mutate((p) => ({
      customHabits: [...(p.customHabits ?? []), habit],
      habitOrder: [...(p.habitOrder ?? []), habit.id],
    }));
    setName("");
    setShowAdd(false);
  }

  function delHabit(id: string) {
    const isCustom = !DEFAULT_HABITS.some((h) => h.id === id);
    mutate((p) => {
      const log = { ...(p.habitLog ?? {}) };
      delete log[id];
      return {
        customHabits: isCustom ? (p.customHabits ?? []).filter((h) => h.id !== id) : (p.customHabits ?? []),
        hiddenHabits: isCustom ? (p.hiddenHabits ?? []) : [...new Set([...(p.hiddenHabits ?? []), id])],
        habitOrder: (p.habitOrder ?? []).filter((x) => x !== id),
        habitLog: log,
      };
    });
  }

  const totalCells = habits.length * 7;
  const done = habits.reduce(
    (a, h) => a + days.filter((d) => (habitLog[h.id] ?? []).includes(d)).length,
    0,
  );
  const pct = totalCells ? Math.round((done / totalCells) * 100) : 0;

  return (
    <section className="hud-card p-6">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <div className="hud-label text-base text-foreground/90">Weekly Tasks</div>
          <div className="hud-label text-xs text-muted-foreground mt-1">
            {done}/{totalCells} COMPLETED · {pct}%
          </div>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="hud-label text-xs flex items-center gap-1.5 border border-primary/50 text-primary rounded px-3 py-1.5 hover:bg-primary/10"
        >
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "CANCEL" : "ADD"}
        </button>
      </div>

      {showAdd && (
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addHabit(); }}
            placeholder="Weekly task name"
            className="flex-1 min-w-[160px] bg-transparent border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as EvoCategory)}
            className="bg-background border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={addHabit}
            className="hud-label text-xs border border-primary text-primary rounded px-4 py-2 hover:bg-primary/10"
          >
            SAVE
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="text-left hud-label text-xs text-muted-foreground font-normal pb-3">TASK</th>
              {DAY_LABELS.map((d, i) => (
                <th
                  key={d + i}
                  className={cn(
                    "hud-label text-xs font-normal pb-3 w-12 text-center",
                    days[i] === today ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {d}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => (
              <tr key={h.id} className="group">
                <td className="text-sm text-foreground/90 pr-3 py-1.5">
                  <span className="mr-2">{h.emoji ?? "•"}</span>
                  {h.name}
                </td>
                {days.map((iso) => {
                  const checked = (habitLog[h.id] ?? []).includes(iso);
                  return (
                    <td key={iso} className="text-center py-1.5">
                      <button
                        onClick={() => toggle(h.id, iso)}
                        aria-label={`${h.name} ${iso}`}
                        className={cn(
                          "h-6 w-6 rounded border transition-colors",
                          checked
                            ? "bg-primary/70 border-primary"
                            : "border-border hover:border-primary/60",
                        )}
                        style={checked ? { boxShadow: "0 0 8px var(--primary)" } : undefined}
                      />
                    </td>
                  );
                })}
                <td className="text-center">
                  <button
                    onClick={() => delHabit(h.id)}
                    aria-label={`Delete ${h.name}`}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {habits.length === 0 && (
              <tr>
                <td colSpan={9} className="text-sm text-muted-foreground italic py-3">
                  No weekly tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
