import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckSquare, Plus, Trash2, Wallet, Apple, Dumbbell, FileText,
  Notebook, TrendingUp, Briefcase, Star, MoreHorizontal,
  ArrowUp, ArrowDown, Circle, Loader2, CheckCircle2,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import {
  useEvolutionData, uid, todayDate,
  type EvoCategory, type EvoTask, type EvoTaskPriority, type EvoTaskStatus,
} from "@/lib/evolution-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Tasks — Evolution" }, { name: "description", content: "Goals, tasks, and daily habits." }] }),
  component: TasksPage,
});

const CATEGORY_META: Record<EvoCategory, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  Wealth:    { icon: Wallet,     color: "#f5c451" },
  Nutrition: { icon: Apple,      color: "#4ade80" },
  Fitness:   { icon: Dumbbell,   color: "#fb923c" },
  Journal:   { icon: FileText,   color: "#c084fc" },
  Notes:     { icon: Notebook,   color: "#38bdf8" },
  Investing: { icon: TrendingUp, color: "#3b82f6" },
  Business:  { icon: Briefcase,  color: "#60a5fa" },
  Hobby:     { icon: Star,       color: "#ec4899" },
};

const CATS: EvoCategory[] = ["Wealth", "Nutrition", "Fitness", "Journal", "Notes", "Investing", "Business", "Hobby"];

const GOAL_DEFS: { category: EvoCategory; title: string; subtitle: string; pct: number; label: string }[] = [
  { category: "Investing", title: "INVESTING", subtitle: "Portfolio Growth", pct: 72, label: "$10,000 / $14,000" },
  { category: "Business",  title: "BUSINESS",  subtitle: "Monthly Revenue", pct: 65, label: "$6,500 / $10,000" },
  { category: "Hobby",     title: "HOBBY",     subtitle: "Guitar Mastery", pct: 40, label: "Practice 30min daily" },
  { category: "Nutrition", title: "NUTRITION", subtitle: "Stay on Track", pct: 85, label: "26 / 31 Days" },
  { category: "Wealth",    title: "WEALTH",    subtitle: "Emergency Fund", pct: 60, label: "$6,000 / $10,000" },
  { category: "Fitness",   title: "FITNESS",   subtitle: "Build Strength", pct: 70, label: "21 / 30 Workouts" },
  { category: "Journal",   title: "JOURNAL",   subtitle: "Daily Journal", pct: 80, label: "24 / 30 Entries" },
  { category: "Notes",     title: "NOTES",     subtitle: "Stay Organized", pct: 90, label: "27 / 30 Days" },
];

const DEFAULT_HABITS: { id: string; name: string; category: EvoCategory; emoji: string }[] = [
  { id: "workout",   name: "Work Out",         category: "Fitness",   emoji: "🏋️" },
  { id: "deficit",   name: "Eat in a Deficit", category: "Nutrition", emoji: "🍎" },
  { id: "bible",     name: "Bible Study",      category: "Hobby",     emoji: "📖" },
  { id: "trade",     name: "Trade Futures",    category: "Investing", emoji: "📈" },
  { id: "coldcall",  name: "Cold Calls",       category: "Business",  emoji: "💰" },
  { id: "evolution", name: "Build Evolution",  category: "Notes",     emoji: "💻" },
  { id: "journal",   name: "Journal",          category: "Journal",   emoji: "✍️" },
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

function TasksPage() {
  const { data, mutate } = useEvolutionData();
  const tasks = data.evoTasks ?? [];
  const habitLog = data.habitLog ?? {};

  const [filter, setFilter] = useState<EvoCategory | "All">("All");
  const [sortPriority, setSortPriority] = useState(false);
  const [sortDue, setSortDue] = useState(false);

  // Add task modal state
  const [showAdd, setShowAdd] = useState(false);
  const [nText, setNText] = useState("");
  const [nCat, setNCat] = useState<EvoCategory>("Wealth");
  const [nPri, setNPri] = useState<EvoTaskPriority>("Medium");
  const [nDue, setNDue] = useState(todayDate());

  const visibleTasks = useMemo(() => {
    let t = tasks.slice();
    if (filter !== "All") t = t.filter((x) => x.category === filter);
    if (sortPriority) {
      const rank: Record<EvoTaskPriority, number> = { High: 0, Medium: 1, Low: 2 };
      t.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    if (sortDue) t.sort((a, b) => a.due.localeCompare(b.due));
    return t;
  }, [tasks, filter, sortPriority, sortDue]);

  function addTask() {
    if (!nText.trim()) return;
    const task: EvoTask = {
      id: uid(), text: nText.trim(), category: nCat, priority: nPri,
      due: nDue || todayDate(), status: "Not Started",
    };
    mutate((p) => ({ evoTasks: [...(p.evoTasks ?? []), task] }));
    setNText(""); setShowAdd(false);
  }
  function delTask(id: string) {
    mutate((p) => ({ evoTasks: (p.evoTasks ?? []).filter((t) => t.id !== id) }));
  }
  function cycleStatus(id: string) {
    const order: EvoTaskStatus[] = ["Not Started", "In Progress", "Done"];
    mutate((p) => ({
      evoTasks: (p.evoTasks ?? []).map((t) =>
        t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t
      ),
    }));
  }
  function toggleDone(id: string, done: boolean) {
    mutate((p) => ({
      evoTasks: (p.evoTasks ?? []).map((t) => t.id === id ? { ...t, status: done ? "Done" : "Not Started" } : t),
    }));
  }

  // Habit tracker: current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dim = daysInMonth(year, month);
  const days = Array.from({ length: dim }, (_, i) => i + 1);
  const todayNum = now.getDate();

  function isoFor(day: number) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  function toggleHabit(habitId: string, day: number) {
    const iso = isoFor(day);
    mutate((p) => {
      const log = { ...(p.habitLog ?? {}) };
      const arr = new Set(log[habitId] ?? []);
      if (arr.has(iso)) arr.delete(iso); else arr.add(iso);
      log[habitId] = [...arr];
      return { habitLog: log };
    });
  }

  const dateLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();

  return (
    <ModuleLayout number="03" title="Goals & Tasks" subtitle="Plan your day, Execute your tasks. Build your future." icon={CheckSquare}>
      {/* GOALS */}
      <Panel title={`GOALS · ${dateLabel}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {GOAL_DEFS.map((g) => {
            const meta = CATEGORY_META[g.category];
            const Icon = meta.icon;
            const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
            const catHabits = DEFAULT_HABITS.filter((h) => h.category === g.category);
            let checked = 0;
            for (const h of catHabits) {
              const arr = habitLog[h.id] ?? [];
              checked += arr.filter((iso) => iso.startsWith(monthPrefix)).length;
            }
            const denom = catHabits.length * dim;
            const pct = denom > 0 ? Math.round((checked / denom) * 100) : 0;
            const label = catHabits.length > 0
              ? `${checked} / ${denom} days`
              : "No habit linked";
            return (
              <div key={g.title} className="border border-border rounded p-3 bg-primary/5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded border border-border flex items-center justify-center"
                       style={{ borderColor: `${meta.color}55`, boxShadow: `0 0 8px ${meta.color}40` }}>
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="hud-label text-[10px]" style={{ color: meta.color }}>{g.title}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{g.subtitle}</div>
                  </div>
                </div>
                <div className="hud-label text-2xl text-foreground">{pct}<span className="text-sm text-muted-foreground">%</span></div>
                <div className="text-[10px] text-muted-foreground mt-1 truncate">{label}</div>
                <div className="mt-2 h-1.5 bg-secondary rounded overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: meta.color, boxShadow: pct > 0 ? `0 0 6px ${meta.color}` : undefined }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>


      {/* TASKS */}
      <Panel title="TASKS / TO-DO LIST">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button onClick={() => setFilter("All")}
            className={cn("hud-label text-[10px] px-3 py-1.5 rounded border", filter === "All" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
            ALL
          </button>
          {CATS.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            const active = filter === c;
            return (
              <button key={c} onClick={() => setFilter(c)}
                title={c}
                className={cn("h-8 w-8 rounded border flex items-center justify-center transition-colors",
                  active ? "bg-primary/10" : "hover:bg-primary/5")}
                style={{ borderColor: active ? meta.color : `${meta.color}55`, boxShadow: active ? `0 0 8px ${meta.color}80` : undefined }}>
                <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { setSortPriority((s) => !s); setSortDue(false); }}
              className={cn("hud-label text-[10px] px-3 py-1.5 rounded border", sortPriority ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              PRIORITY ▾
            </button>
            <button onClick={() => { setSortDue((s) => !s); setSortPriority(false); }}
              className={cn("hud-label text-[10px] px-3 py-1.5 rounded border", sortDue ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              DUE DATE ▾
            </button>
            <button onClick={() => setShowAdd(true)}
              className="hud-label text-[10px] px-3 py-1.5 rounded border border-primary bg-primary/15 text-primary hover:bg-primary/25 flex items-center gap-1">
              <Plus className="h-3 w-3" /> ADD TASK
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="mb-4 p-3 border border-primary/40 rounded bg-primary/5 grid grid-cols-1 md:grid-cols-6 gap-2">
            <input autoFocus value={nText} onChange={(e) => setNText(e.target.value)} placeholder="Task…"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="md:col-span-2 bg-input border border-border rounded px-2 py-1.5 text-xs" />
            <select value={nCat} onChange={(e) => setNCat(e.target.value as EvoCategory)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs">
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={nPri} onChange={(e) => setNPri(e.target.value as EvoTaskPriority)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs">
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <input type="date" value={nDue} onChange={(e) => setNDue(e.target.value)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs" />
            <div className="flex gap-2">
              <button onClick={addTask} className="flex-1 hud-label text-[10px] px-2 py-1.5 rounded border border-primary bg-primary/15 text-primary">SAVE</button>
              <button onClick={() => setShowAdd(false)} className="hud-label text-[10px] px-2 py-1.5 rounded border border-border text-muted-foreground">✕</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="hud-label text-[10px] text-muted-foreground border-b border-border">
                <th className="w-8"></th>
                <th className="text-left py-2 font-normal">TASK</th>
                <th className="text-left py-2 font-normal w-24">CATEGORY</th>
                <th className="text-left py-2 font-normal w-28">PRIORITY</th>
                <th className="text-left py-2 font-normal w-32">DUE DATE</th>
                <th className="text-left py-2 font-normal w-32">STATUS</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-xs text-muted-foreground">No tasks yet. Click ADD TASK to create one.</td></tr>
              )}
              {visibleTasks.map((t) => {
                const meta = CATEGORY_META[t.category];
                const Icon = meta.icon;
                const done = t.status === "Done";
                const priColor = t.priority === "High" ? "#ef4444" : t.priority === "Medium" ? "#f59e0b" : "#4ade80";
                const priArrow = t.priority === "Low" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
                const statusIcon = t.status === "Done" ? <CheckCircle2 className="h-3 w-3" /> : t.status === "In Progress" ? <Loader2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />;
                const statusColor = t.status === "Done" ? "#4ade80" : t.status === "In Progress" ? "#38bdf8" : "#9ca3af";
                return (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-primary/5 group">
                    <td className="py-2.5">
                      <input type="checkbox" checked={done} onChange={(e) => toggleDone(t.id, e.target.checked)}
                        className="h-3.5 w-3.5 accent-primary" />
                    </td>
                    <td className={cn("py-2.5 text-foreground", done && "line-through text-muted-foreground")}>{t.text}</td>
                    <td className="py-2.5">
                      <div className="h-7 w-7 rounded border flex items-center justify-center"
                           style={{ borderColor: `${meta.color}55` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 hud-label text-[11px]" style={{ color: priColor }}>
                        {priArrow} {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-foreground/80">{t.due}</td>
                    <td className="py-2.5">
                      <button onClick={() => cycleStatus(t.id)}
                        className="flex items-center gap-1.5 text-[11px] hover:opacity-80"
                        style={{ color: statusColor }}>
                        {statusIcon} {t.status}
                      </button>
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => delTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground inline group-hover:hidden" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* DAILY HABITS */}
      <Panel title={`DAILY HABITS · ${now.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left hud-label text-[10px] text-muted-foreground pb-2 sticky left-0 bg-card min-w-[180px]">HABIT</th>
                {days.map((d) => {
                  const dow = new Date(year, month, d).getDay();
                  const isToday = d === todayNum;
                  return (
                    <th key={d} className="pb-2 px-0.5 font-normal">
                      <div className={cn("hud-label text-[9px]", isToday ? "text-primary" : "text-muted-foreground")}>{WEEKDAY[dow]}</div>
                      <div className={cn("hud-label text-[10px]", isToday ? "text-primary" : "text-foreground/70")}>{d}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {DEFAULT_HABITS.map((h) => {
                const meta = CATEGORY_META[h.category];
                const Icon = meta.icon;
                const done = new Set(habitLog[h.id] ?? []);
                return (
                  <tr key={h.id} className="border-t border-border/40">
                    <td className="py-2 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded border flex items-center justify-center"
                             style={{ borderColor: `${meta.color}55` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                        </div>
                        <span className="hud-label text-[11px] text-foreground/90 uppercase">{h.name}</span>
                      </div>
                    </td>
                    {days.map((d) => {
                      const iso = isoFor(d);
                      const isDone = done.has(iso);
                      return (
                        <td key={d} className="px-0.5 py-1 text-center">
                          <button
                            onClick={() => toggleHabit(h.id, d)}
                            aria-label={`${h.name} ${iso}`}
                            className={cn(
                              "h-5 w-5 rounded border transition-all",
                              isDone ? "" : "hover:border-primary/60"
                            )}
                            style={isDone
                              ? { borderColor: meta.color, background: meta.color, boxShadow: `0 0 6px ${meta.color}` }
                              : { borderColor: "hsl(var(--border))", background: "transparent" }}
                          >
                            {isDone && <span className="text-[10px] text-background leading-none">✓</span>}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </ModuleLayout>
  );
}
