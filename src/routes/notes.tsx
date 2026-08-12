import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckSquare, Plus, Trash2, DollarSign, Apple, Dumbbell, FileText,
  Notebook, TrendingUp, Briefcase, Star, MoreHorizontal, GripVertical,
  ArrowUp, ArrowDown, Circle, Loader2, CheckCircle2, Clock, X,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import {
  useEvolutionData, uid, todayDate,
  type EvoCategory, type EvoTask, type EvoTaskPriority, type EvoTaskStatus,
  type EvoHabit, type TimeLog,
} from "@/lib/evolution-data";
import { cn } from "@/lib/utils";
import { DEFAULT_HABITS } from "@/lib/habits";


export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Tasks — Evolution" }, { name: "description", content: "Goals, tasks, and daily habits." }] }),
  component: TasksPage,
});

const CATEGORY_META: Record<EvoCategory, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  Wealth:    { icon: DollarSign, color: "#00ff88" },
  Nutrition: { icon: Apple,      color: "#a3ff5c" },
  Fitness:   { icon: Dumbbell,   color: "#fb923c" },
  Journal:   { icon: FileText,   color: "#c084fc" },
  Notes:     { icon: Notebook,   color: "#38bdf8" },
  Investing: { icon: TrendingUp, color: "#3b82f6" },
  Business:  { icon: Briefcase,  color: "#60a5fa" },
  Hobby:     { icon: Star,       color: "#ff2d55" },
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



function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

function TasksPage() {
  const { data, mutate } = useEvolutionData();
  const tasks = data.evoTasks ?? [];
  const habitLog = data.habitLog ?? {};
  const customHabits = data.customHabits ?? [];
  const habitOrder = data.habitOrder ?? [];
  const hiddenHabits = data.hiddenHabits ?? [];

  const allHabits = useMemo(() => {
    const combined = [...DEFAULT_HABITS, ...customHabits].filter((h) => !hiddenHabits.includes(h.id));
    const byId = new Map(combined.map((h) => [h.id, h]));
    const ordered: typeof combined = [];
    for (const id of habitOrder) {
      const h = byId.get(id);
      if (h) { ordered.push(h); byId.delete(id); }
    }
    return [...ordered, ...byId.values()];
  }, [customHabits, habitOrder, hiddenHabits]);

  const [filter, setFilter] = useState<EvoCategory | "All">("All");
  const [sortPriority, setSortPriority] = useState(false);
  const [sortDue, setSortDue] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  // Add task modal state
  const [showAdd, setShowAdd] = useState(false);
  const [nText, setNText] = useState("");
  const [nCat, setNCat] = useState<EvoCategory>("Wealth");
  const [nPri, setNPri] = useState<EvoTaskPriority>("Medium");
  const [nDue, setNDue] = useState(todayDate());

  // Add habit form state
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [hName, setHName] = useState("");
  const [hCat, setHCat] = useState<EvoCategory>("Wealth");
  const [hTrackTime, setHTrackTime] = useState(false);
  const [hMinutes, setHMinutes] = useState<string>("30");
  const [hModule, setHModule] = useState<EvoCategory>("Wealth");

  // Time-confirm dialog state
  const [confirmHabit, setConfirmHabit] = useState<EvoHabit | null>(null);
  const [confirmMinutes, setConfirmMinutes] = useState<string>("");

  function addHabit() {
    const name = hName.trim();
    if (!name) return;
    const habit: EvoHabit = { id: `h-${uid()}`, name, category: hCat };
    if (hTrackTime) {
      const m = Math.max(1, Math.round(Number(hMinutes) || 0));
      habit.timeFactor = { minutes: m, module: hModule };
    }
    mutate((p) => ({
      customHabits: [...(p.customHabits ?? []), habit],
      habitOrder: [...(p.habitOrder ?? []), habit.id],
    }));
    setHName(""); setHTrackTime(false); setHMinutes("30"); setShowAddHabit(false);
  }

  function delHabit(id: string) {
    const isCustom = id.startsWith("h-");
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

  function reorderHabits(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const currentIds = allHabits.map((h) => h.id);
    const from = currentIds.indexOf(sourceId);
    const to = currentIds.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = currentIds.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    mutate(() => ({ habitOrder: next }));
  }

  function reorderTasks(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    mutate((p) => {
      const current = p.evoTasks ?? [];
      const from = current.findIndex((t) => t.id === sourceId);
      const to = current.findIndex((t) => t.id === targetId);
      if (from < 0 || to < 0) return {};
      const next = current.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { evoTasks: next };
    });
  }



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
    const isTodayCell = day === todayNum;
    const habit = allHabits.find((h) => h.id === habitId);
    const alreadyDone = (habitLog[habitId] ?? []).includes(iso);

    // If turning ON today's cell for a time-tracked habit, open confirm dialog.
    if (habit?.timeFactor && isTodayCell && !alreadyDone) {
      setConfirmHabit(habit);
      setConfirmMinutes(String(habit.timeFactor.minutes));
      return;
    }

    mutate((p) => {
      const log = { ...(p.habitLog ?? {}) };
      const arr = new Set(log[habitId] ?? []);
      if (arr.has(iso)) arr.delete(iso); else arr.add(iso);
      log[habitId] = [...arr];
      // If unchecking, also drop any auto time log tied to this habit + date.
      const timeLogs = (p.timeLogs ?? []).filter(
        (tl) => !(alreadyDone && tl.habitId === habitId && tl.date === iso && tl.source === "habit"),
      );
      return { habitLog: log, timeLogs };
    });
  }

  function confirmLogTime() {
    if (!confirmHabit || !confirmHabit.timeFactor) return;
    const iso = isoFor(todayNum);
    const mins = Math.max(1, Math.round(Number(confirmMinutes) || confirmHabit.timeFactor.minutes));
    const module = confirmHabit.timeFactor.module;
    const habitId = confirmHabit.id;
    const habitName = confirmHabit.name;
    mutate((p) => {
      const log = { ...(p.habitLog ?? {}) };
      const arr = new Set(log[habitId] ?? []);
      arr.add(iso);
      log[habitId] = [...arr];
      const tl: TimeLog = {
        id: `t-${uid()}`,
        date: iso,
        minutes: mins,
        module,
        habitId,
        source: "habit",
        label: habitName,
        ts: Date.now(),
      };
      return { habitLog: log, timeLogs: [...(p.timeLogs ?? []), tl] };
    });
    setConfirmHabit(null);
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
            const catHabits = allHabits.filter((h) => h.category === g.category);
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
                <th className="w-6"></th>
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
                <tr><td colSpan={8} className="text-center py-8 text-xs text-muted-foreground">No tasks yet. Click ADD TASK to create one.</td></tr>
              )}
              {visibleTasks.map((t) => {
                const meta = CATEGORY_META[t.category];
                const Icon = meta.icon;
                const done = t.status === "Done";
                const priColor = t.priority === "High" ? "#ef4444" : t.priority === "Medium" ? "#f59e0b" : "#4ade80";
                const priArrow = t.priority === "Low" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
                const statusIcon = t.status === "Done" ? <CheckCircle2 className="h-3 w-3" /> : t.status === "In Progress" ? <Loader2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />;
                const statusColor = t.status === "Done" ? "#4ade80" : t.status === "In Progress" ? "#38bdf8" : "#9ca3af";
                const isTaskDragging = dragTaskId === t.id;
                return (
                  <tr
                    key={t.id}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const src = e.dataTransfer.getData("text/plain");
                      if (src) reorderTasks(src, t.id);
                      setDragTaskId(null);
                    }}
                    className={cn(
                      "border-b border-border/50 hover:bg-primary/5 group transition-colors",
                      isTaskDragging && "opacity-40",
                      dragTaskId && !isTaskDragging && "hover:bg-primary/5"
                    )}
                  >
                    <td className="py-2.5">
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", t.id);
                          setDragTaskId(t.id);
                        }}
                        onDragEnd={() => setDragTaskId(null)}
                        aria-label="Drag to reorder"
                        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors -ml-1"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </td>
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
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={() => setShowAddHabit((s) => !s)}
            className="hud-label text-[10px] px-3 py-1.5 rounded border border-primary bg-primary/15 text-primary hover:bg-primary/25 flex items-center gap-1">
            <Plus className="h-3 w-3" /> ADD DAILY HABIT
          </button>
        </div>

        {showAddHabit && (
          <div className="mb-4 p-3 border border-primary/40 rounded bg-primary/5 flex flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <input autoFocus value={hName} onChange={(e) => setHName(e.target.value)} placeholder="Habit name…"
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                className="md:col-span-3 bg-input border border-border rounded px-2 py-1.5 text-xs" />
              <select value={hCat} onChange={(e) => {
                  const v = e.target.value as EvoCategory;
                  setHCat(v);
                  if (!hTrackTime) setHModule(v);
                }}
                className="md:col-span-2 bg-input border border-border rounded px-2 py-1.5 text-xs">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={addHabit} className="flex-1 hud-label text-[10px] px-2 py-1.5 rounded border border-primary bg-primary/15 text-primary">SAVE</button>
                <button onClick={() => setShowAddHabit(false)} className="hud-label text-[10px] px-2 py-1.5 rounded border border-border text-muted-foreground">✕</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
              <label className="md:col-span-3 flex items-center gap-2 hud-label text-[10px] text-muted-foreground cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => { setHTrackTime((s) => { const next = !s; if (next) setHModule(hCat); return next; }); }}
                  aria-pressed={hTrackTime}
                  className={cn(
                    "relative h-4 w-8 rounded-full border transition-colors",
                    hTrackTime ? "bg-primary/40 border-primary" : "bg-muted border-border"
                  )}>
                  <span className={cn(
                    "absolute top-[1px] h-2.5 w-2.5 rounded-full transition-all",
                    hTrackTime ? "left-[17px] bg-primary shadow-[0_0_6px_var(--primary)]" : "left-[2px] bg-muted-foreground"
                  )} />
                </button>
                <Clock className="h-3 w-3" /> TRACK TIME
              </label>
              {hTrackTime && (
                <>
                  <div className="md:col-span-1 flex items-center gap-1">
                    <input
                      type="number" min={1} value={hMinutes}
                      onChange={(e) => setHMinutes(e.target.value)}
                      className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs"
                    />
                    <span className="hud-label text-[10px] text-muted-foreground">MIN</span>
                  </div>
                  <select value={hModule} onChange={(e) => setHModule(e.target.value as EvoCategory)}
                    className="md:col-span-2 bg-input border border-border rounded px-2 py-1.5 text-xs">
                    {CATS.map((c) => <option key={c} value={c}>Module: {c}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>
        )}


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
              {allHabits.map((h) => {
                const meta = CATEGORY_META[h.category];
                const Icon = meta.icon;
                const done = new Set(habitLog[h.id] ?? []);
                const isDragging = dragId === h.id;
                return (
                  <tr
                    key={h.id}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const src = e.dataTransfer.getData("text/plain");
                      if (src) reorderHabits(src, h.id);
                      setDragId(null);
                    }}
                    className={cn(
                      "border-t border-border/40 group transition-colors",
                      isDragging && "opacity-40",
                      dragId && !isDragging && "hover:bg-primary/5"
                    )}
                  >
                    <td className="py-2 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <button
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", h.id);
                            setDragId(h.id);
                          }}
                          onDragEnd={() => setDragId(null)}
                          aria-label="Drag to reorder"
                          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors -ml-1"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <div className="h-7 w-7 rounded border flex items-center justify-center"
                             style={{ borderColor: `${meta.color}55` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                        </div>
                        <span className="hud-label text-[11px] text-foreground/90 uppercase flex items-center gap-1.5">
                          {h.name}
                          {h.timeFactor && (
                            <span
                              title={`${h.timeFactor.minutes} min · ${h.timeFactor.module}`}
                              className="inline-flex items-center gap-0.5"
                              style={{ color: CATEGORY_META[h.timeFactor.module].color }}
                            >
                              <Clock className="h-3 w-3" />
                              <span className="text-[9px] tabular-nums">{h.timeFactor.minutes}m</span>
                            </span>
                          )}
                        </span>

                        <button onClick={() => delHabit(h.id)}
                          aria-label={`Delete ${h.name}`}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive ml-1 transition-opacity">
                          <Trash2 className="h-3 w-3" />
                        </button>
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

      {/* Time-log confirmation dialog */}
      {confirmHabit && confirmHabit.timeFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
             onClick={() => setConfirmHabit(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-card p-5 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: CATEGORY_META[confirmHabit.timeFactor.module].color }} />
                <div>
                  <div className="hud-label text-xs text-foreground">LOG {confirmHabit.name.toUpperCase()}</div>
                  <div className="hud-label text-[9px] text-muted-foreground">
                    {confirmHabit.timeFactor.module}
                  </div>
                </div>
              </div>
              <button onClick={() => setConfirmHabit(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-foreground/90">
              Log <span className="text-primary font-semibold">{confirmMinutes || confirmHabit.timeFactor.minutes}</span> minutes for <span className="text-primary">{confirmHabit.name}</span>?
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} autoFocus
                value={confirmMinutes}
                onChange={(e) => setConfirmMinutes(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmLogTime(); }}
                className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-sm tabular-nums"
              />
              <span className="hud-label text-[10px] text-muted-foreground">MIN</span>
            </div>
            <div className="flex gap-2">
              <button onClick={confirmLogTime}
                className="flex-1 h-9 rounded border border-primary bg-primary/15 text-primary hud-label text-[11px] hover:bg-primary/25">
                CONFIRM
              </button>
              <button onClick={() => setConfirmHabit(null)}
                className="h-9 px-4 rounded border border-border text-muted-foreground hud-label text-[11px] hover:text-foreground">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

    </ModuleLayout>
  );
}

