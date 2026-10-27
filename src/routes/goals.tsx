import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { resolveHabits } from "@/lib/habits";
import { localISO } from "@/lib/utils";
import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Edit3,
  Search,
  TrendingUp,
  Plane,
  X,
  Target,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import {
  useEvolutionData,
  type Goal,
  type GoalCategory,
  todayDate,
  dayTotals,
  tradingTotals,
  workoutCount,
  guitarFocusOnly,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/goals")({
  validateSearch: (s: Record<string, unknown>) => ({
    section: s.section === "planner" ? ("planner" as const) : ("goals" as const),
  }),
  head: () => ({
    meta: [
      { title: "Goals — Evolution" },
      { name: "description", content: "Goals module of Evolution OS." },
      { property: "og:title", content: "Goals — Evolution" },
      { property: "og:description", content: "Goals module of Evolution OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoalsPage,
});

const CATEGORIES: GoalCategory[] = ["Wealth", "Fitness", "Trading", "Business", "Nutrition", "Hobby"];

function isThisWeek(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start && d <= now;
}

function GoalsPage() {
  const { section } = Route.useSearch();
  const { data, mutate } = useEvolutionData();
  const goals = data.goals ?? [];

  const moduleGoals = useMemo(() => {
    const today = todayDate();
    const investingCurrent = tradingTotals(data.tradingAccounts, data.tradingTxns).balance;
    const weeklySessions = workoutCount(data.fitness, data.workouts, isThisWeek);
    const todayCalories = dayTotals(today, data.mealLogs).kcal;
    const monthKey = today.slice(0, 7);
    const monthRevenue = data.revenue.filter((r) => r.date.startsWith(monthKey)).reduce((a, r) => a + r.amount, 0);
    const weeklyHobbyHours =
      data.guitarSessions.filter((s) => isThisWeek(s.date)).reduce((a, s) => a + s.durationMin, 0) / 60 +
      guitarFocusOnly(data.focusSessions, data.guitarSessions)
        .filter((s) => isThisWeek(localISO(new Date(s.completedAt))))
        .reduce((a, s) => a + s.durationSec / 3600, 0);

    return [
      {
        category: "Investing",
        title: "Portfolio Goal",
        current: investingCurrent,
        target: data.profile.goal || 50000,
        unit: "$",
      },
      {
        category: "Fitness",
        title: "Weekly Sessions",
        current: weeklySessions,
        target: data.profile.gymSessionsTarget || 4,
        unit: "",
      },
      {
        category: "Nutrition",
        title: "Daily Calories",
        current: todayCalories,
        target: data.profile.calorieTarget || 2000,
        unit: "kcal",
      },
      {
        category: "Business",
        title: "Monthly Revenue",
        current: monthRevenue,
        target: 10000,
        unit: "$",
      },
      {
        category: "Hobby",
        title: "Weekly Guitar Hours",
        current: Math.round(weeklyHobbyHours * 10) / 10,
        target: data.guitarWeeklyHoursTarget || 5,
        unit: "h",
      },
    ];
  }, [data]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Wealth");
  const [target, setTarget] = useState(100);
  const [current, setCurrent] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [unit, setUnit] = useState("");

  function addGoal() {
    if (!title.trim()) {
      toast.error("Give the goal a title.");
      return;
    }
    if (!(Number(target) > 0)) {
      toast.error("Target must be above 0.");
      return;
    }
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
    setTitle("");
    setTarget(100);
    setCurrent(0);
    setDeadline("");
    setUnit("");
  }

  function update(id: string, patch: Partial<Goal>) {
    mutate((p) => ({ goals: (p.goals ?? []).map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  }

  function del(id: string) {
    mutate((p) => ({ goals: (p.goals ?? []).filter((g) => g.id !== id) }));
  }

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  return (
    <ModuleLayout number="" title="Goals" subtitle="Track what matters" icon={Target}>
      <div className="flex gap-2">
        <Link
          to="/goals"
          search={{ section: "goals" }}
          className="rounded-lg border border-primary/30 px-4 py-2 text-sm text-primary"
        >
          Goals & Tasks
        </Link>
        <Link
          to="/goals"
          search={{ section: "planner" }}
          className="rounded-lg border border-primary/30 px-4 py-2 text-sm text-primary"
        >
          Goals Planner
        </Link>
      </div>
      {section === "planner" ? (
        <GoalsPlanner />
      ) : (
        <>
          <Panel title="NEW GOAL">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                <label className="hud-label text-[10px] text-muted-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="hud-label text-[10px] text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="hud-label text-[10px] text-muted-foreground">Current</label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(Number(e.target.value))}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="hud-label text-[10px] text-muted-foreground">Target</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="hud-label text-[10px] text-muted-foreground">Unit (optional)</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="$, lbs, hrs..."
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="hud-label text-[10px] text-muted-foreground">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addGoal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-xs rounded hover:bg-primary/25 w-full justify-center"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="MODULE GOALS · live from your data">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moduleGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const display = (n: number) =>
                  g.unit === "$" ? `$${n.toLocaleString()}` : `${n}${g.unit ? ` ${g.unit}` : ""}`;
                return (
                  <li key={g.title} className="evo-surface p-3 border border-border rounded bg-primary/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="hud-label text-[10px] text-accent">{g.category}</span>
                      <span className="hud-label text-[10px] text-primary">{pct}%</span>
                    </div>
                    <div className="hud-label text-sm text-foreground">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {display(g.current)} / {display(g.target)}
                    </div>
                    <div className="mt-2 h-2 bg-secondary rounded overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--glow)" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title={`ACTIVE · ${active.length}`}>
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active goals yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {active.map((g) => {
                  const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                  return (
                    <li key={g.id} className="evo-surface p-4 border border-border rounded bg-primary/5">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="hud-label text-[10px] text-accent">{g.category}</span>
                            <h3 className="hud-label text-sm text-foreground truncate">{g.title}</h3>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {g.current}
                            {g.unit ? ` ${g.unit}` : ""} / {g.target}
                            {g.unit ? ` ${g.unit}` : ""}
                            {g.deadline && <span className="ml-2">· due {g.deadline}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => update(g.id, { completed: true })}
                          title="Mark complete"
                          className="p-2 border border-border rounded text-primary hover:bg-primary/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => del(g.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="h-2 bg-secondary rounded overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--glow)" }}
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          value={g.current}
                          onChange={(e) => update(g.id, { current: Number(e.target.value) })}
                          className="w-28 bg-input border border-border rounded px-2 py-1 text-xs text-foreground"
                        />
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
                  <li
                    key={g.id}
                    className="evo-surface flex items-center gap-3 p-2 border border-border rounded opacity-60"
                  >
                    <Check className="h-4 w-4 text-primary" />
                    <span className="hud-label text-[10px] text-accent">{g.category}</span>
                    <span className="text-sm text-foreground line-through flex-1 truncate">{g.title}</span>
                    <button
                      onClick={() => update(g.id, { completed: false })}
                      className="text-[10px] hud-label text-primary hover:underline"
                    >
                      Reopen
                    </button>
                    <button onClick={() => del(g.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </ModuleLayout>
  );
}

const PLANNER_CATEGORIES = ["Fitness", "Nutrition", "Wealth", "Business", "Travel", "Knowledge"] as const;
type PlannerCategory = (typeof PLANNER_CATEGORIES)[number] | "Other";
type PlannerScope = "yearly" | "lifetime";
/** value is a measured completion percentage, not a raw current amount. */
interface GoalProgressPoint {
  date: string;
  value: number;
}
interface PlannerGoal extends Goal {
  plannerCategory?: PlannerCategory;
  plannerScope?: PlannerScope;
  plannerYear?: number;
  progressHistory?: GoalProgressPoint[];
}
type PlannerGoalPatch = Partial<Omit<PlannerGoal, "id" | "progressHistory">>;

function validPlannerDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function goalProgress(goal: Pick<Goal, "current" | "target" | "completed">): number {
  if (goal.completed) return 100;
  if (!Number.isFinite(goal.current) || !Number.isFinite(goal.target) || goal.target <= 0) return 0;
  return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
}

function plannerCategoryOf(goal: PlannerGoal): PlannerCategory {
  if (goal.plannerCategory && [...PLANNER_CATEGORIES, "Other"].includes(goal.plannerCategory))
    return goal.plannerCategory;
  if (goal.category === "Trading") return "Wealth";
  if (goal.category === "Hobby") return "Other";
  return PLANNER_CATEGORIES.includes(goal.category as (typeof PLANNER_CATEGORIES)[number])
    ? (goal.category as PlannerCategory)
    : "Other";
}

function categoryForPlanner(category: PlannerCategory): GoalCategory {
  return category === "Travel" || category === "Knowledge" || category === "Other" ? "Hobby" : category;
}

function goalYear(goal: PlannerGoal, fallbackYear: number): number {
  if (Number.isInteger(goal.plannerYear) && goal.plannerYear! >= 1 && goal.plannerYear! <= 9999)
    return goal.plannerYear!;
  if (validPlannerDate(goal.deadline)) return Number(goal.deadline.slice(0, 4));
  return fallbackYear;
}

function matchesPlannerScope(goal: PlannerGoal, scope: PlannerScope, year: number, currentYear: number): boolean {
  if (scope === "lifetime") return goal.plannerScope === "lifetime";
  return goal.plannerScope !== "lifetime" && goalYear(goal, currentYear) === year;
}

function filterPlannerGoals(
  goals: readonly PlannerGoal[],
  scope: PlannerScope,
  year: number,
  currentYear: number,
): PlannerGoal[] {
  return goals.filter((goal) => matchesPlannerScope(goal, scope, year, currentYear));
}

/** Only real observations in each month. No carry-forward, fabricated baseline, or future curve. */
function monthlyProgress(
  goals: readonly PlannerGoal[],
  year: number,
): Array<{ month: string; date: string } & Record<PlannerCategory, number | null>> {
  const categories: PlannerCategory[] = [...PLANNER_CATEGORIES, "Other"];
  return Array.from({ length: 12 }, (_, month) => {
    const prefix = `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}`;
    const row = Object.fromEntries(categories.map((category) => [category, null])) as Record<
      PlannerCategory,
      number | null
    >;
    for (const category of categories) {
      const observations: number[] = [];
      for (const goal of goals) {
        if (plannerCategoryOf(goal) !== category) continue;
        const points = (goal.progressHistory ?? [])
          .filter(
            (point) =>
              validPlannerDate(point.date) &&
              point.date.startsWith(prefix) &&
              Number.isFinite(point.value) &&
              point.value >= 0 &&
              point.value <= 100,
          )
          .sort((a, b) => a.date.localeCompare(b.date));
        if (points.length) observations.push(points[points.length - 1].value);
      }
      if (observations.length)
        row[category] = observations.reduce((sum, value) => sum + value, 0) / observations.length;
    }
    return {
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month],
      date: `${prefix}-01`,
      ...row,
    };
  });
}

/** Empty string means valid. This validates editable fields without discarding legacy properties. */
function validatePlannerGoal(
  goal: Pick<PlannerGoal, "title" | "target" | "current" | "deadline"> & Partial<PlannerGoal>,
): string {
  if (!goal.title.trim()) return "Give the goal a title.";
  if (goal.title.trim().length > 100) return "Keep the title to 100 characters.";
  if (!Number.isFinite(goal.target) || goal.target <= 0) return "Target must be above zero.";
  if (!Number.isFinite(goal.current) || goal.current < 0) return "Current progress must be zero or above.";
  if (goal.deadline && !validPlannerDate(goal.deadline)) return "Choose a valid deadline.";
  if (
    goal.plannerYear !== undefined &&
    (!Number.isInteger(goal.plannerYear) || goal.plannerYear < 1 || goal.plannerYear > 9999)
  )
    return "Choose a valid year.";
  if (goal.plannerScope !== undefined && goal.plannerScope !== "yearly" && goal.plannerScope !== "lifetime")
    return "Choose a valid planning period.";
  if (goal.plannerCategory !== undefined && ![...PLANNER_CATEGORIES, "Other"].includes(goal.plannerCategory))
    return "Choose a valid category.";
  return "";
}

/** Apply to the latest record inside mutate, never replace it with a stale form snapshot. */
function applyGoalPatch(latest: PlannerGoal, patch: PlannerGoalPatch, today: string): PlannerGoal {
  const next: PlannerGoal = { ...latest, ...patch, id: latest.id };
  const error = validatePlannerGoal(next);
  if (error) throw new Error(error);
  if (!validPlannerDate(today)) throw new Error("A valid progress date is required.");
  next.title = next.title.trim();
  const progressChanged = ["current", "target", "completed"].some(
    (key) =>
      key in patch &&
      next[key as "current" | "target" | "completed"] !== latest[key as "current" | "target" | "completed"],
  );
  if (progressChanged) {
    next.progressHistory = [
      ...(latest.progressHistory ?? []).filter((point) => point.date !== today),
      { date: today, value: goalProgress(next) },
    ].sort((a, b) => a.date.localeCompare(b.date));
  }
  return next;
}

const PHOTOS = [
  "photo-1534438327276-14e5300c3a48",
  "photo-1546833999-b9f581a1996d",
  "photo-1485871981521-5b1fd3805eee",
  "photo-1497366754035-f200968a6e72",
  "photo-1516483638261-f4dbaf036963",
  "photo-1507842217343-583bb7270b66",
];
const CATS: { name: PlannerCategory; icon: typeof Target; color: string; image: string }[] = [
  { name: "Fitness", icon: Dumbbell, color: "#27b9f5", image: PHOTOS[0] },
  { name: "Nutrition", icon: Apple, color: "#20d4ac", image: PHOTOS[1] },
  { name: "Wealth", icon: TrendingUp, color: "#5aa0ff", image: PHOTOS[2] },
  { name: "Business", icon: Briefcase, color: "#32c7ed", image: PHOTOS[3] },
  { name: "Travel", icon: Plane, color: "#a278ff", image: PHOTOS[4] },
  { name: "Knowledge", icon: BookOpen, color: "#c7d9ed", image: PHOTOS[5] },
];
const pic = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
const input =
  "w-full rounded-lg border border-sky-400/20 bg-[#07131e] px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/60";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/5 px-3 py-2 text-xs text-sky-200 hover:bg-sky-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
function Box({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-sky-400/25 bg-gradient-to-br from-[#081521] to-[#02080d] p-4 shadow-[inset_0_0_24px_#0ea5e908]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
const blank = (scope: PlannerScope, year: number, category: PlannerCategory): PlannerGoal => ({
  id: "",
  title: "",
  category: categoryForPlanner(category),
  plannerCategory: category,
  plannerScope: scope,
  plannerYear: year,
  current: 0,
  target: 100,
  unit: "",
  deadline: "",
  completed: false,
});
function GoalsPlanner() {
  const { data, mutate } = useEvolutionData();
  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear),
    [scope, setScope] = useState<PlannerScope>("yearly"),
    [category, setCategory] = useState<PlannerCategory | "All">("All"),
    [query, setQuery] = useState("");
  const [draft, setDraft] = useState<PlannerGoal | null>(null),
    [baseline, setBaseline] = useState<PlannerGoal | null>(null),
    [formError, setFormError] = useState("");
  const [month, setMonth] = useState(now.getMonth()),
    [week, setWeek] = useState(0);
  useEffect(() => {
    const reset = () => {
      setDraft(null);
      setBaseline(null);
      setQuery("");
      setCategory("All");
    };
    window.addEventListener("evolution:owner-changing", reset);
    return () => window.removeEventListener("evolution:owner-changing", reset);
  }, []);
  const scoped = filterPlannerGoals(data.goals as PlannerGoal[], scope, year, currentYear);
  const goals = scoped.filter(
    (g) =>
      (category === "All" || plannerCategoryOf(g) === category) && g.title.toLowerCase().includes(query.toLowerCase()),
  );
  const finished = goals.filter((g) => g.completed).length;
  const progress = goals.length ? Math.round(goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length) : 0;
  const history = useMemo(() => monthlyProgress(goals, year), [goals, year]);
  const habits = resolveHabits(data.customHabits, data.habitOrder, data.hiddenHabits).slice(0, 6);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from(
    { length: Math.min(7, daysInMonth - week * 7) },
    (_, i) => `${year}-${String(month + 1).padStart(2, "0")}-${String(week * 7 + i + 1).padStart(2, "0")}`,
  );
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  const milestones = goals
    .filter((g) => g.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);
  const vision = (data.goals as PlannerGoal[]).filter((g) => g.plannerScope === "lifetime").slice(0, 5);
  function edit(g: PlannerGoal) {
    setDraft({ ...g });
    setBaseline({ ...g });
    setFormError("");
  }
  function create() {
    setDraft(blank(scope, year, category === "All" ? "Fitness" : category));
    setBaseline(null);
    setFormError("");
  }
  function save() {
    if (!draft) return;
    const error = validatePlannerGoal(draft);
    if (error) {
      setFormError(error);
      return;
    }
    const today = localISO();
    if (draft.id && !data.goals.some((g) => g.id === draft.id)) {
      setFormError("This goal was removed elsewhere. Close this form and create a new goal.");
      return;
    }
    const patch: Partial<PlannerGoal> = {};
    for (const key of [
      "title",
      "current",
      "target",
      "unit",
      "deadline",
      "completed",
      "plannerScope",
      "plannerYear",
      "plannerCategory",
      "category",
    ] as const) {
      if (!baseline || draft[key] !== baseline[key]) (patch as Record<string, unknown>)[key] = draft[key];
    }
    try {
      mutate((p) => {
        if (draft.id && !p.goals.some((g) => g.id === draft.id))
          throw new Error("This goal was removed elsewhere. Close this form and create a new goal.");
        return {
          goals: draft.id
            ? p.goals.map((g) => (g.id === draft.id ? applyGoalPatch(g as PlannerGoal, patch, today) : g))
            : [
                ...p.goals,
                {
                  ...applyGoalPatch({ ...draft, id: crypto.randomUUID() }, patch, today),
                  progressHistory: [{ date: today, value: goalProgress(draft) }],
                },
              ],
        };
      });
      setDraft(null);
      setBaseline(null);
      toast.success("Goal saved");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save this goal.");
    }
  }
  function toggle(g: PlannerGoal) {
    try {
      mutate((p) => ({
        goals: p.goals.map((item) =>
          item.id === g.id ? applyGoalPatch(item as PlannerGoal, { completed: !item.completed }, localISO()) : item,
        ),
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this goal.");
    }
  }
  function toggleHabit(id: string, date: string) {
    if (date > localISO()) return;
    mutate((p) => {
      const old = p.habitLog[date] ?? [];
      return {
        habitLog: {
          ...p.habitLog,
          [date]: old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
        },
      };
    });
  }
  return (
    <div className="space-y-5 text-slate-200" data-goals-planner="v1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-light uppercase tracking-[.22em]">Goals Planner</h2>
          <p className="mt-1 text-[10px] uppercase tracking-[.25em] text-slate-400">Visualize. Plan. Execute.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-sky-400/25 p-1">
            {(["yearly", "lifetime"] as const).map((s) => (
              <button
                key={s}
                className={`${btn} ${scope === s ? "bg-sky-500/25 shadow-[inset_0_0_16px_#0ea5e955]" : "border-transparent"}`}
                onClick={() => setScope(s)}
                aria-pressed={scope === s}
              >
                {s === "yearly" ? "Yearly" : "Lifetime"}
              </button>
            ))}
          </div>
          <button
            className={btn}
            aria-label="Previous year"
            onClick={() => {
              setYear((y) => Math.max(2000, y - 1));
              setWeek(0);
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <span className="w-10 text-center text-sm">{year}</span>
          <button
            className={btn}
            aria-label="Next year"
            onClick={() => {
              setYear((y) => Math.min(2100, y + 1));
              setWeek(0);
            }}
          >
            <ChevronRight size={15} />
          </button>
          <button className={btn} onClick={create}>
            <Plus size={17} />
            Add goal
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {CATS.map((c) => {
          const items = scoped.filter((g) => plannerCategoryOf(g) === c.name),
            done = items.filter((g) => g.completed).length,
            pct = items.length ? items.reduce((s, g) => s + goalProgress(g), 0) / items.length : 0;
          return (
            <button
              key={c.name}
              aria-pressed={category === c.name}
              onClick={() => setCategory(category === c.name ? "All" : c.name)}
              className={`group min-w-0 overflow-hidden rounded-xl border text-left transition hover:-translate-y-1 ${category === c.name ? "border-sky-300 shadow-[0_0_20px_#0ea5e925]" : "border-sky-400/25"}`}
            >
              <img
                src={pic(c.image)}
                alt={`${c.name} inspiration`}
                loading="lazy"
                className="h-28 w-full object-cover opacity-80 transition group-hover:opacity-100 sm:h-36"
              />
              <div className="bg-[#05101a] p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <c.icon size={19} className="shrink-0 text-sky-300" />
                  {c.name}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded bg-sky-950">
                    <div
                      className="h-full rounded bg-gradient-to-r from-sky-300 to-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {done}/{items.length}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className={btn} onClick={() => setCategory("All")} aria-pressed={category === "All"}>
            All categories
          </button>
          {scoped.some((g) => plannerCategoryOf(g) === "Other") && (
            <button className={btn} onClick={() => setCategory("Other")}>
              Other goals
            </button>
          )}
        </div>
        <label className="flex min-w-0 items-center gap-2 rounded-lg border border-sky-400/20 px-3 py-2">
          <Search size={15} className="text-sky-300" />
          <input
            aria-label="Search goals"
            placeholder="Search your goals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 bg-transparent text-xs outline-none"
          />
        </label>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <Box
          title={`${scope === "yearly" ? "Yearly" : "Recorded"} progress`}
          action={<span className="text-xs text-slate-400">{year}</span>}
        >
          <ProgressChart history={history} />
          <p className="mt-2 text-[10px] text-slate-500">
            Recorded progress only. History begins when you save or update a goal here.
          </p>
        </Box>
        <Box
          title={`Key goals (${scope === "yearly" ? year : "lifetime"})`}
          action={<span className="text-xs text-sky-300">{goals.length} goals</span>}
        >
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {!goals.length ? (
              <Empty text="Give your next chapter a clear target." action={create} />
            ) : (
              goals.map((g) => (
                <div key={g.id} className="flex items-center gap-2 border-b border-sky-400/10 pb-2">
                  <button
                    className="shrink-0 rounded-full border border-sky-400/50 p-1 text-sky-300"
                    aria-label={`${g.completed ? "Reopen" : "Complete"} ${g.title}`}
                    onClick={() => toggle(g)}
                  >
                    {g.completed ? <Check size={12} /> : <Target size={12} />}
                  </button>
                  <button className="min-w-0 flex-1 text-left" onClick={() => edit(g)}>
                    <span className="block truncate text-xs">{g.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </button>
                  <span className="text-xs text-sky-300">{Math.round(goalProgress(g))}%</span>
                  <button onClick={() => edit(g)} aria-label={`Edit ${g.title}`} className="p-1 text-slate-400">
                    <Edit3 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Box>
        <Box title="Goals completion">
          <div
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full p-3"
            style={{ background: `conic-gradient(#22b8e8 ${progress * 3.6}deg, #0c2433 0deg)` }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#030d16]">
              <strong className="text-3xl font-light">{goals.length ? `${progress}%` : "—"}</strong>
              <span className="mt-1 text-[10px] text-slate-400">average progress</span>
              <span className="text-[10px] text-slate-500">
                {finished}/{goals.length} completed
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {CATS.map((c) => {
              const list = goals.filter((g) => plannerCategoryOf(g) === c.name);
              return (
                <div key={c.name} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 text-slate-400">{c.name}</span>
                  <span>
                    {list.filter((g) => g.completed).length}/{list.length}
                  </span>
                </div>
              );
            })}
          </div>
        </Box>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <Box title={scope === "yearly" ? "This year's milestones" : "Lifetime milestones"}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {milestones.map((g) => {
              const c = CATS.find((c) => c.name === plannerCategoryOf(g));
              return (
                <button key={g.id} onClick={() => edit(g)} className="min-w-0 text-left">
                  <div className="relative overflow-hidden rounded-lg border border-sky-400/20">
                    <img src={pic(c?.image ?? PHOTOS[5])} alt="" className="h-24 w-full object-cover" />
                    {g.completed && (
                      <Check className="absolute right-2 top-2 rounded-full bg-emerald-400 p-1 text-black" size={22} />
                    )}
                  </div>
                  <div className="my-3 h-0.5 bg-sky-500/40" />
                  <div className="text-[10px] uppercase text-sky-300">
                    {new Date(`${g.deadline}T12:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 truncate text-xs">{g.title}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{g.completed ? "Complete" : "Target date"}</div>
                </button>
              );
            })}
          </div>
          {!milestones.length && (
            <p className="py-12 text-center text-xs text-slate-500">
              Add a target date to place a goal on your timeline.
            </p>
          )}
        </Box>
        <Box
          title="Monthly habits"
          action={
            <div className="flex items-center gap-1">
              <button
                className="p-1 text-sky-300"
                aria-label="Previous habit month"
                onClick={() => {
                  if (month === 0) {
                    setMonth(11);
                    setYear((y) => Math.max(2000, y - 1));
                  } else setMonth((m) => m - 1);
                  setWeek(0);
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] text-slate-400">{monthLabel}</span>
              <button
                className="p-1 text-sky-300"
                aria-label="Next habit month"
                onClick={() => {
                  if (month === 11) {
                    setMonth(0);
                    setYear((y) => Math.min(2100, y + 1));
                  } else setMonth((m) => m + 1);
                  setWeek(0);
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          }
        >
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `minmax(55px,1fr) repeat(${dates.length},minmax(20px,1fr))`,
            }}
          >
            <span />
            {dates.map((d) => (
              <span key={d} className="text-center text-[9px] text-slate-500">
                {d.slice(-2)}
              </span>
            ))}
            {habits.map((h) => (
              <div key={h.id} className="contents">
                <span className="self-center truncate py-2 text-[10px] text-slate-400" title={h.name}>
                  {h.name}
                </span>
                {dates.map((d) => {
                  const checked = (data.habitLog[d] ?? []).includes(h.id);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleHabit(h.id, d)}
                      disabled={d > localISO()}
                      aria-label={`${h.name} ${d}`}
                      aria-pressed={checked}
                      className={`m-auto flex h-6 w-6 items-center justify-center rounded-full border ${checked ? "border-sky-400 bg-sky-500/25 text-sky-200 shadow-[0_0_8px_#0ea5e955]" : "border-sky-900 text-sky-900"} disabled:opacity-25`}
                    >
                      {checked ? <Check size={12} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <button className={btn} disabled={week === 0} onClick={() => setWeek((w) => w - 1)}>
              Previous
            </button>
            <span className="self-center text-[10px] text-slate-500">Week {week + 1}</span>
            <button className={btn} disabled={(week + 1) * 7 >= daysInMonth} onClick={() => setWeek((w) => w + 1)}>
              Next
            </button>
          </div>
        </Box>
        <section className="relative min-h-64 overflow-hidden rounded-xl border border-sky-400/25">
          <img
            src={pic("photo-1464822759023-fed622ff2c3b")}
            alt="Mountain landscape inspiration"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02080d] via-[#02080d80] to-transparent" />
          <div className="relative p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider">Lifetime vision</h2>
            <div className="mt-6 space-y-4 border-l border-sky-400/40 pl-4">
              {vision.map((g) => (
                <button key={g.id} onClick={() => edit(g)} className="relative block text-left text-xs">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_8px_#38bdf8]" />
                  {g.title}
                </button>
              ))}
              {!vision.length && (
                <p className="text-xs leading-6 text-slate-400">
                  A bigger picture, built one goal at a time. Add your lifetime ambitions here.
                </p>
              )}
            </div>
            <button
              className={`${btn} mt-6`}
              onClick={() => {
                setDraft(blank("lifetime", year, "Knowledge"));
                setBaseline(null);
                setFormError("");
              }}
            >
              <Plus size={14} />
              Add a vision goal
            </button>
          </div>
        </section>
      </div>
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open) {
            setDraft(null);
            setBaseline(null);
            setFormError("");
          }
        }}
      >
        {draft && (
          <DialogContent className="max-h-[90vh] w-[calc(100%_-_1.5rem)] max-w-xl overflow-y-auto rounded-2xl border-sky-400/30 bg-[#06111c] p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="mb-5 pr-7">
                <DialogTitle className="text-lg text-sky-200">{draft.id ? "Edit goal" : "Create a goal"}</DialogTitle>
                <DialogDescription className="mt-1 text-xs text-slate-400">
                  Set a measurable target and track your own progress.
                </DialogDescription>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 text-xs text-slate-400">
                  Goal title
                  <input
                    autoFocus
                    className={`${input} mt-1`}
                    maxLength={100}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Category
                  <select
                    className={`${input} mt-1`}
                    value={plannerCategoryOf(draft)}
                    onChange={(e) => {
                      const c = e.target.value as PlannerCategory;
                      setDraft({ ...draft, plannerCategory: c, category: categoryForPlanner(c) });
                    }}
                  >
                    {[...CATS.map((c) => c.name), "Other"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-slate-400">
                  Horizon
                  <select
                    className={`${input} mt-1`}
                    value={draft.plannerScope ?? "yearly"}
                    onChange={(e) => setDraft({ ...draft, plannerScope: e.target.value as PlannerScope })}
                  >
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </label>
                {draft.plannerScope !== "lifetime" && (
                  <label className="text-xs text-slate-400">
                    Planning year
                    <input
                      type="number"
                      min={2000}
                      max={2100}
                      className={`${input} mt-1`}
                      value={draft.plannerYear ?? year}
                      onChange={(e) => setDraft({ ...draft, plannerYear: Number(e.target.value) })}
                    />
                  </label>
                )}
                <label className="text-xs text-slate-400">
                  Target date (optional)
                  <input
                    type="date"
                    className={`${input} mt-1`}
                    value={draft.deadline}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Current
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className={`${input} mt-1`}
                    value={draft.current}
                    onChange={(e) => setDraft({ ...draft, current: Number(e.target.value) })}
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Target
                  <input
                    type="number"
                    min="0.000001"
                    step="any"
                    className={`${input} mt-1`}
                    value={draft.target}
                    onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })}
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Unit
                  <input
                    placeholder="books, sessions, $…"
                    maxLength={20}
                    className={`${input} mt-1`}
                    value={draft.unit ?? ""}
                    onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={draft.completed}
                    onChange={(e) => setDraft({ ...draft, completed: e.target.checked })}
                  />
                  Completed
                </label>
              </div>
              {formError && (
                <p role="alert" className="mt-3 text-xs text-red-300">
                  {formError}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" className={btn} onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button type="submit" className={`${btn} bg-sky-500/25`}>
                  Save goal
                </button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
function Empty({ text, action }: { text: string; action: () => void }) {
  return (
    <div className="py-12 text-center">
      <Target size={28} className="mx-auto mb-3 text-sky-400/50" />
      <p className="mb-4 text-xs text-slate-500">{text}</p>
      <button className={btn} onClick={action}>
        Add your first goal
      </button>
    </div>
  );
}
function ProgressChart({ history }: { history: ReturnType<typeof monthlyProgress> }) {
  const chartCats = [...CATS, { name: "Other" as PlannerCategory, color: "#f3ba72" }];
  const hasHistory = history.some((row) =>
    chartCats.some((c) => typeof (row as unknown as Record<string, unknown>)[c.name] === "number"),
  );
  return (
    <div className="relative">
      <svg viewBox="0 0 480 230" className="w-full" role="img" aria-label="Recorded monthly goal progress">
        <g>
          {[0, 25, 50, 75, 100].map((n) => (
            <g key={n}>
              <line x1="30" y1={200 - n * 1.75} x2="465" y2={200 - n * 1.75} stroke="#123044" strokeWidth=".6" />
              <text x="22" y={203 - n * 1.75} textAnchor="end" fill="#71869a" fontSize="9">
                {n}
              </text>
            </g>
          ))}
          {history.map((row, i) => (
            <text key={i} x={35 + i * 38.5} y="222" textAnchor="middle" fill="#71869a" fontSize="9">
              {new Date(2026, i, 1).toLocaleDateString("en", { month: "short" })}
            </text>
          ))}
          {chartCats.map((c) => {
            const points = history.flatMap((row, i) => {
              const v = (row as unknown as Record<string, unknown>)[c.name];
              return typeof v === "number" ? [{ x: 35 + i * 38.5, y: 200 - v * 1.75, month: i }] : [];
            });
            return (
              <g key={c.name}>
                {points.map((p, i) => (
                  <g key={p.month}>
                    {i > 0 && points[i - 1].month === p.month - 1 && (
                      <line
                        x1={points[i - 1].x}
                        y1={points[i - 1].y}
                        x2={p.x}
                        y2={p.y}
                        stroke={c.color}
                        strokeWidth="1.8"
                      />
                    )}
                    <circle cx={p.x} cy={p.y} r="3" fill={c.color} />
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      </svg>
      {!hasHistory && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg bg-[#06111c]/95 px-4 py-3 text-center text-xs text-slate-400">
            No recorded history for this year yet
          </span>
        </div>
      )}
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-2">
        {CATS.map((c) => (
          <span key={c.name} className="flex items-center gap-1 text-[9px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}
