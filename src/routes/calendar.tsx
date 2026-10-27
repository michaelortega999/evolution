import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Dumbbell,
  Apple,
  TrendingUp,
  Briefcase,
  Plane,
  BookOpen,
  Target,
  Check,
  Clock,
  Edit3,
  Trash2,
  Copy,
  Bell,
  X,
  NotebookPen,
} from "lucide-react";
import { toast } from "sonner";
import { ModuleLayout } from "@/components/evolution/ModuleLayout";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  useEvolutionData,
  type CalendarEvent,
  type ReminderOffset,
  type EvoCategory,
  type Goal,
  type GoalCategory,
} from "@/lib/evolution-data";
import { resolveHabits } from "@/lib/habits";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Planning — Evolution" },
      { name: "description", content: "Plan your calendar, goals, tasks, habits and notes." },
    ],
  }),
  component: PlanningPage,
});
const CATS = [
  { name: "Fitness", icon: Dumbbell, color: "#38bdf8", image: "photo-1534438327276-14e5300c3a48" },
  { name: "Nutrition", icon: Apple, color: "#34d399", image: "photo-1546833999-b9f581a1996d" },
  { name: "Wealth", icon: TrendingUp, color: "#fbbf24", image: "photo-1485871981521-5b1fd3805eee" },
  { name: "Business", icon: Briefcase, color: "#c084fc", image: "photo-1497366754035-f200968a6e72" },
  { name: "Travel", icon: Plane, color: "#818cf8", image: "photo-1516483638261-f4dbaf036963" },
  { name: "Knowledge", icon: BookOpen, color: "#fb923c", image: "photo-1507842217343-583bb7270b66" },
] as const;
const photo = (id: string, w = 500) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const field =
  "mt-1 w-full rounded-lg border border-sky-400/25 bg-[#06131e] px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/60";
const button =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-400/5 px-3 py-2 text-xs text-sky-200 hover:bg-sky-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:opacity-40";
const active =
  "bg-gradient-to-b from-blue-500/40 to-sky-500/10 border-sky-300/70 shadow-[inset_0_0_14px_#0ea5e955,0_0_10px_#0ea5e925]";
function Box({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-sky-400/30 bg-gradient-to-br from-[#071623] to-[#02090f] p-3 shadow-[inset_0_0_20px_#0ea5e908] ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-slate-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function timeLabel(e: PlanningEvent) {
  if (e.allDay) return "All day";
  if (!e.time) return "Any time";
  const format = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  return `${format(e.time)}${e.endTime ? ` – ${format(e.endTime)}` : ""}`;
}
function PlanningPage() {
  const { data, mutate } = useEvolutionData();
  const [tab, setTab] = useState("Calendar"),
    [view, setView] = useState<"month" | "week" | "day" | "agenda">("month"),
    [cursor, setCursor] = useState(() => new Date()),
    [selected, setSelected] = useState(() => localDateKey(new Date())),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState<PlanningCategory | "All">("All");
  const [draft, setDraft] = useState<PlanningEvent | null>(null),
    [baseline, setBaseline] = useState<PlanningEvent | null>(null),
    [error, setError] = useState(""),
    [deleteId, setDeleteId] = useState<string | null>(null),
    [taskText, setTaskText] = useState(""),
    [noteTitle, setNoteTitle] = useState(""),
    [noteBody, setNoteBody] = useState("");
  useEffect(() => {
    const reset = () => {
      setDraft(null);
      setBaseline(null);
      setDeleteId(null);
      setSelectedId(null);
      setQuery("");
      setTaskText("");
      setNoteTitle("");
      setNoteBody("");
      setError("");
    };
    window.addEventListener("evolution:owner-changing", reset);
    return () => window.removeEventListener("evolution:owner-changing", reset);
  }, []);
  const events = data.calendar as PlanningEvent[],
    shown = filterPlanningEvents(events, { query, category: category === "All" ? undefined : category });
  const today = localDateKey(new Date()),
    year = cursor.getFullYear(),
    goals = filterPlannerGoals(data.goals as PlannerGoal[], "yearly", year, new Date().getFullYear()),
    vision = (data.goals as PlannerGoal[]).filter((g) => g.plannerScope === "lifetime").slice(0, 5);
  const dayEvents = shown.filter((e) => e.date === selected),
    selectedEvent = dayEvents.find((e) => e.id === selectedId) ?? dayEvents[0];
  const dayTasks = data.evoTasks.filter((t) => t.due === selected),
    habits = resolveHabits(data.customHabits, data.habitOrder, data.hiddenHabits);
  const cells =
    view === "month" ? monthCells(cursor) : view === "week" ? weekCells(cursor) : [parseDateKey(selected) ?? cursor];
  const categoryMeta = (name?: string) => CATS.find((c) => c.name === name);
  const selectDate = (date: string) => {
    setSelected(date);
    setSelectedId(null);
    setTaskText("");
    setCursor(parseDateKey(date) ?? cursor);
  };
  function step(n: number) {
    const next =
      view === "month"
        ? shiftCalendarMonth(cursor, n)
        : addCalendarDays(cursor, n * (view === "week" ? 7 : view === "agenda" ? 30 : 1));
    setCursor(next);
    setSelected(localDateKey(next));
    setSelectedId(null);
  }
  function openEvent(event?: PlanningEvent, date = selected) {
    setError("");
    setBaseline(event ? { ...event } : null);
    setDraft(
      event
        ? { ...event }
        : {
            id: "",
            title: "",
            date,
            time: "12:00",
            endTime: "13:00",
            reminder: 0,
            category: category === "All" ? "Other" : category,
            allDay: false,
            description: "",
            relatedGoalId: "",
          },
    );
  }
  function saveEvent() {
    if (!draft) return;
    const issue = validatePlanningEvent(draft);
    if (issue) {
      setError(issue);
      return;
    }
    const patch: Partial<PlanningEvent> = {};
    for (const key of [
      "title",
      "date",
      "time",
      "endTime",
      "reminder",
      "category",
      "description",
      "allDay",
      "relatedGoalId",
    ] as const) {
      if (!baseline || draft[key] !== baseline[key]) (patch as Record<string, unknown>)[key] = draft[key];
    }
    try {
      mutate((p) => {
        if (draft.id && !p.calendar.some((e) => e.id === draft.id))
          throw new Error("This event was removed elsewhere. Close and create a new event.");
        return {
          calendar: draft.id
            ? p.calendar.map((e) => (e.id === draft.id ? applyEventPatch(e, patch) : e))
            : [...p.calendar, { ...draft, id: crypto.randomUUID(), title: draft.title.trim() }],
        };
      });
      selectDate(draft.date);
      setDraft(null);
      setBaseline(null);
      toast.success("Event saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save event");
    }
  }
  function duplicate(event: PlanningEvent) {
    const date = localDateKey(addCalendarDays(parseDateKey(event.date) ?? cursor, 1));
    openEvent({ ...event, id: "", date }, date);
    setBaseline(null);
  }
  function addTask() {
    const text = taskText.trim();
    if (!text) return;
    mutate((p) => ({
      evoTasks: [
        ...p.evoTasks,
        {
          id: crypto.randomUUID(),
          text,
          category: (["Fitness", "Nutrition", "Wealth", "Business"].includes(category)
            ? category
            : "Notes") as EvoCategory,
          priority: "Medium",
          due: selected,
          status: "Not Started",
        },
      ],
    }));
    setTaskText("");
  }
  function toggleTask(id: string) {
    mutate((p) => ({
      evoTasks: p.evoTasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "Done" ? "Not Started" : "Done" } : t,
      ),
    }));
  }
  function toggleHabit(id: string) {
    if (selected > today) return;
    mutate((p) => {
      const log = p.habitLog[selected] ?? [];
      return { habitLog: { ...p.habitLog, [selected]: log.includes(id) ? log.filter((x) => x !== id) : [...log, id] } };
    });
  }
  function saveNote() {
    if (!noteTitle.trim()) return;
    mutate((p) => ({
      richNotes: [
        ...p.richNotes,
        {
          id: crypto.randomUUID(),
          date: selected,
          title: noteTitle.trim(),
          body: noteBody.trim(),
          category: "General",
        },
      ],
    }));
    setNoteTitle("");
    setNoteBody("");
    toast.success("Note saved");
  }
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  function TaskList({ all = false }: { all?: boolean }) {
    const list = (all ? data.evoTasks : dayTasks).filter((t) => t.text.toLowerCase().includes(query.toLowerCase()));
    return (
      <>
        <div className="space-y-2">
          {list.map((t) => (
            <label
              key={t.id}
              className="flex items-start gap-2 rounded-lg border border-sky-400/10 bg-sky-400/5 p-2 text-xs"
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-sky-400"
                checked={t.status === "Done"}
                onChange={() => toggleTask(t.id)}
              />
              <span
                className={`min-w-0 break-words ${t.status === "Done" ? "text-slate-500 line-through" : "text-slate-200"}`}
              >
                {t.text}
                {all && (
                  <small className="mt-1 block text-slate-500">
                    {t.due || "No due date"} · {t.category}
                  </small>
                )}
              </span>
            </label>
          ))}
        </div>
        {!list.length && (
          <p className="py-5 text-center text-xs text-slate-500">
            {query ? "No matching tasks." : `No tasks ${all ? "yet" : "due this day"}.`}
          </p>
        )}
      </>
    );
  }
  return (
    <ModuleLayout number="" title="Planning" subtitle="Plan. Execute. Evolve." icon={CalendarDays}>
      <div className="space-y-4 text-slate-200" data-planning-calendar="v1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Planning sections"
            className="flex max-w-full overflow-x-auto rounded-lg border border-sky-400/30 p-1"
          >
            {["Calendar", "Goals", "Tasks", "Habits", "Notes"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`${button} shrink-0 border-transparent ${tab === t ? active : ""}`}
              >
                {t}
              </button>
            ))}
          </nav>
          <label className="flex min-w-0 items-center gap-2 rounded-lg border border-sky-400/25 px-3">
            <Search size={15} className="text-sky-300" />
            <input
              aria-label="Search planning"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your plan"
              className="min-w-0 w-36 bg-transparent py-2 text-xs outline-none"
            />
          </label>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.8fr_1fr_.9fr]">
          <Box
            title="Goals overview"
            action={
              <Link to="/goals" search={{ section: "planner" }} className="text-[10px] text-sky-300">
                View all
              </Link>
            }
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CATS.map((c) => {
                const list = goals.filter((g) => plannerCategoryOf(g) === c.name),
                  done = list.filter((g) => g.completed).length;
                return (
                  <button
                    key={c.name}
                    className={`min-w-0 overflow-hidden rounded-lg border text-left ${category === c.name ? "border-sky-300" : "border-sky-400/20"}`}
                    onClick={() => setCategory(category === c.name ? "All" : c.name)}
                    aria-pressed={category === c.name}
                  >
                    <img
                      src={photo(c.image, 240)}
                      alt={`${c.name} inspiration`}
                      className="h-20 w-full object-cover opacity-80 xl:h-24"
                    />
                    <div className="p-2">
                      <div className="truncate text-[10px]">{c.name}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <c.icon size={16} style={{ color: c.color }} />
                        <span className="text-[10px] text-slate-400">
                          {done}/{list.length}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Box>
          <Box title="Year progress" action={<span className="text-[10px] text-slate-400">{year}</span>}>
            <div className="space-y-3">
              {CATS.map((c) => {
                const list = goals.filter((g) => plannerCategoryOf(g) === c.name),
                  pct = list.length ? Math.round(list.reduce((s, g) => s + goalProgress(g), 0) / list.length) : 0;
                return (
                  <div key={c.name} className="flex items-center gap-2 text-[10px]">
                    <c.icon size={14} style={{ color: c.color }} />
                    <span className="w-16 shrink-0">{c.name}</span>
                    <div className="h-1.5 flex-1 rounded bg-sky-950">
                      <div className="h-full rounded" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                    <span className="w-7 text-right text-slate-400">{list.length ? `${pct}%` : "—"}</span>
                  </div>
                );
              })}
            </div>
          </Box>
          <Box title="Lifetime vision" className="">
            <div className="relative min-h-44 overflow-hidden rounded-lg">
              <img
                src={photo("photo-1464822759023-fed622ff2c3b")}
                alt="Mountain inspiration"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030a12] to-transparent" />
              <div className="relative space-y-3 p-3">
                {vision.map((g) => (
                  <Link key={g.id} to="/goals" search={{ section: "planner" }} className="flex gap-2 text-xs">
                    <Target size={15} className="shrink-0 text-sky-300" />
                    {g.title}
                  </Link>
                ))}
                {!vision.length && (
                  <p className="pt-4 text-xs leading-6 text-slate-300">
                    Make room for the bigger picture.
                    <br />
                    Your lifetime goals appear here.
                  </p>
                )}
                <Link
                  to="/goals"
                  search={{ section: "planner" }}
                  className="inline-flex items-center gap-1 text-[10px] text-sky-300"
                >
                  <Plus size={13} />
                  Plan your vision
                </Link>
              </div>
            </div>
          </Box>
        </div>
        {tab === "Calendar" && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
            <section className="min-w-0 overflow-hidden rounded-xl border border-sky-400/30 bg-[#030c15] shadow-[0_0_20px_#0ea5e908]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-400/15 p-3">
                <div className="flex items-center gap-2">
                  <button className={button} aria-label="Previous calendar period" onClick={() => step(-1)}>
                    <ChevronLeft size={15} />
                  </button>
                  <button className={button} aria-label="Next calendar period" onClick={() => step(1)}>
                    <ChevronRight size={15} />
                  </button>
                  <h2 className="text-lg font-medium">{monthLabel}</h2>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(["month", "week", "day", "agenda"] as const).map((v) => (
                    <button
                      key={v}
                      className={`${button} px-2 capitalize ${view === v ? active : ""}`}
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                    >
                      {v}
                    </button>
                  ))}
                  <button className={button} onClick={() => selectDate(today)}>
                    Today
                  </button>
                  <button className={`${button} ${active}`} onClick={() => openEvent()}>
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                <select
                  aria-label="Filter event category"
                  className="max-w-full rounded border border-sky-400/20 bg-[#06131e] px-2 py-1 text-[10px] text-slate-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlanningCategory | "All")}
                >
                  <option>All</option>
                  {CATS.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                  <option>Other</option>
                </select>
                <span className="text-[10px] text-slate-500">Your saved events · local time</span>
              </div>
              {view === "month" ? (
                <>
                  <div className="grid grid-cols-7 border-y border-sky-400/15">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-2 text-center text-[10px] text-slate-400">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {cells.map((date) => {
                      const key = localDateKey(date),
                        list = shown.filter((e) => e.date === key),
                        isSelected = selected === key;
                      return (
                        <div
                          key={key}
                          className={`min-w-0 min-h-[88px] border-b border-r border-sky-400/10 p-1 sm:min-h-[105px] sm:p-1.5 ${date.getMonth() !== cursor.getMonth() ? "opacity-40" : ""} ${isSelected ? "bg-sky-500/10 shadow-[inset_0_0_0_1px_#38bdf8]" : ""}`}
                        >
                          <button
                            aria-label={`Select ${key}`}
                            aria-pressed={isSelected}
                            onClick={() => selectDate(key)}
                            className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${key === today ? "bg-sky-400 text-slate-950" : "text-slate-300 hover:bg-sky-500/20"}`}
                          >
                            {date.getDate()}
                          </button>
                          {list.slice(0, 2).map((e) => {
                            const c = categoryMeta(e.category);
                            return (
                              <button
                                key={e.id}
                                onClick={() => {
                                  selectDate(key);
                                  setSelectedId(e.id);
                                }}
                                className="mb-1 block w-full min-w-0 rounded border border-sky-400/15 bg-sky-950/30 p-1 text-left"
                                style={{ borderLeftColor: c?.color ?? "#38bdf8", borderLeftWidth: 2 }}
                              >
                                <span className="block truncate text-[8px] sm:text-[10px]">{e.title}</span>
                                <span className="hidden truncate text-[9px] text-slate-500 sm:block">
                                  {e.allDay ? "All day" : e.time || "Any time"}
                                </span>
                              </button>
                            );
                          })}
                          {list.length > 2 && (
                            <button
                              onClick={() => {
                                selectDate(key);
                                setView("day");
                              }}
                              className="text-[8px] text-sky-300"
                            >
                              +{list.length - 2} more
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={`grid gap-2 p-3 ${view === "week" ? "sm:grid-cols-2 lg:grid-cols-4" : ""}`}>
                  {(view === "agenda"
                    ? Array.from(
                        new Set(
                          shown
                            .filter(
                              (e) =>
                                e.date >= selected &&
                                e.date < localDateKey(addCalendarDays(parseDateKey(selected) ?? cursor, 30)),
                            )
                            .map((e) => e.date),
                        ),
                      )
                    : cells.map(localDateKey)
                  ).map((key) => {
                    const list = shown.filter((e) => e.date === key);
                    return (
                      <div key={key} className="min-w-0 rounded-lg border border-sky-400/15 bg-sky-950/10 p-3">
                        <button className="mb-3 text-xs text-sky-200" onClick={() => selectDate(key)}>
                          {parseDateKey(key)?.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </button>
                        <div className="space-y-2">
                          {list.map((e) => (
                            <button
                              key={e.id}
                              onClick={() => {
                                selectDate(key);
                                setSelectedId(e.id);
                              }}
                              className="block w-full rounded-lg border border-sky-400/20 bg-sky-400/5 p-3 text-left"
                            >
                              <p className="break-words text-xs">{e.title}</p>
                              <p className="mt-1 text-[10px] text-slate-400">{timeLabel(e)}</p>
                              <p className="mt-1 text-[9px] text-sky-400">{e.category ?? "Other"}</p>
                            </button>
                          ))}
                        </div>
                        {!list.length && <p className="py-5 text-xs text-slate-500">Nothing scheduled.</p>}
                        <button className={`${button} mt-3 w-full`} onClick={() => openEvent(undefined, key)}>
                          <Plus size={13} />
                          Event
                        </button>
                      </div>
                    );
                  })}
                  {view === "agenda" &&
                    !shown.some(
                      (e) =>
                        e.date >= selected &&
                        e.date < localDateKey(addCalendarDays(parseDateKey(selected) ?? cursor, 30)),
                    ) && <p className="py-16 text-center text-sm text-slate-500">No events in the next 30 days.</p>}
                </div>
              )}
            </section>
            <aside className="space-y-3 min-w-0">
              <Box
                title={(parseDateKey(selected) ?? cursor).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                action={
                  <div className="flex">
                    <button
                      aria-label="Previous selected day"
                      className="p-1 text-sky-300"
                      onClick={() => selectDate(localDateKey(addCalendarDays(parseDateKey(selected) ?? cursor, -1)))}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      aria-label="Next selected day"
                      className="p-1 text-sky-300"
                      onClick={() => selectDate(localDateKey(addCalendarDays(parseDateKey(selected) ?? cursor, 1)))}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                }
              >
                {selectedEvent ? (
                  <>
                    <div className="overflow-hidden rounded-lg border border-sky-400/15">
                      {categoryMeta(selectedEvent.category) && (
                        <img
                          src={photo(categoryMeta(selectedEvent.category)!.image)}
                          alt=""
                          className="h-28 w-full object-cover opacity-80"
                        />
                      )}
                      <div className="p-3">
                        <h3 className="break-words text-sm font-medium">{selectedEvent.title}</h3>
                        {selectedEvent.description && (
                          <p className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-400">
                            {selectedEvent.description}
                          </p>
                        )}
                        <p className="mt-3 flex items-center gap-1 text-[10px] text-sky-300">
                          <Clock size={13} />
                          {timeLabel(selectedEvent)}
                        </p>
                        <div className="mt-3 flex gap-1">
                          <button
                            className={button}
                            aria-label="Edit selected event"
                            onClick={() => openEvent(selectedEvent)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className={button}
                            aria-label="Duplicate selected event"
                            onClick={() => duplicate(selectedEvent)}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className={button}
                            aria-label="Delete selected event"
                            onClick={() => setDeleteId(selectedEvent.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {dayEvents.length > 1 && (
                      <select
                        aria-label="Selected event"
                        className={field}
                        value={selectedEvent.id}
                        onChange={(e) => setSelectedId(e.target.value)}
                      >
                        {dayEvents.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <CalendarDays size={28} className="mx-auto mb-3 text-sky-500/50" />
                    <p className="mb-4 text-xs text-slate-500">A little space for what matters.</p>
                    <button className={button} onClick={() => openEvent()}>
                      Plan this day
                    </button>
                  </div>
                )}
              </Box>
              <Box title={`Tasks (${dayTasks.length})`}>
                <TaskList />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTask();
                  }}
                  className="mt-3 flex gap-1"
                >
                  <input
                    aria-label="New task"
                    value={taskText}
                    maxLength={200}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="Add a task…"
                    className={`${field} mt-0 min-w-0 text-xs`}
                  />
                  <button className={button} aria-label="Add task">
                    <Plus size={15} />
                  </button>
                </form>
              </Box>
              <Box title="Related goals">
                {(selectedEvent?.relatedGoalId
                  ? data.goals.filter((g) => g.id === selectedEvent.relatedGoalId)
                  : goals.filter((g) => category !== "All" && plannerCategoryOf(g) === category)
                )
                  .slice(0, 4)
                  .map((g) => (
                    <Link key={g.id} to="/goals" search={{ section: "planner" }} className="mb-3 block text-xs">
                      <span>{g.title}</span>
                      <div className="mt-2 h-1 rounded bg-sky-950">
                        <div className="h-full rounded bg-sky-400" style={{ width: `${goalProgress(g)}%` }} />
                      </div>
                    </Link>
                  ))}
                {!selectedEvent?.relatedGoalId && category === "All" && (
                  <p className="text-xs leading-5 text-slate-500">
                    Link a goal when editing an event, or choose a goal category above.
                  </p>
                )}
              </Box>
            </aside>
          </div>
        )}
        {tab === "Goals" && (
          <Box
            title={`Your goals · ${year}`}
            action={
              <Link to="/goals" search={{ section: "planner" }} className={button}>
                Open Goals Planner
              </Link>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {goals
                .filter(
                  (g) =>
                    g.title.toLowerCase().includes(query.toLowerCase()) &&
                    (category === "All" || plannerCategoryOf(g) === category),
                )
                .map((g) => (
                  <Link
                    key={g.id}
                    to="/goals"
                    search={{ section: "planner" }}
                    className="rounded-lg border border-sky-400/20 p-4"
                  >
                    <span className="text-xs">{g.title}</span>
                    <p className="mt-2 text-[10px] text-slate-400">
                      {plannerCategoryOf(g)} · {Math.round(goalProgress(g))}%
                    </p>
                    <div className="mt-3 h-1 rounded bg-sky-950">
                      <div className="h-full rounded bg-sky-400" style={{ width: `${goalProgress(g)}%` }} />
                    </div>
                  </Link>
                ))}
            </div>
            {!goals.length && (
              <p className="py-12 text-center text-sm text-slate-500">Your goals will bring this plan to life.</p>
            )}
          </Box>
        )}
        {tab === "Tasks" && (
          <Box
            title="Tasks"
            action={
              <Link to="/notes" className={button}>
                Manage tasks
              </Link>
            }
          >
            <TaskList all />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <input
                aria-label="Task title"
                className={`${field} min-w-0 flex-1`}
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="What needs to get done?"
                maxLength={200}
              />
              <input
                aria-label="Task due date"
                type="date"
                value={selected}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelected(e.target.value);
                    setCursor(parseDateKey(e.target.value) ?? cursor);
                  }
                }}
                className={`${field} w-auto`}
              />
              <button className={button}>Add task</button>
            </form>
          </Box>
        )}
        {tab === "Habits" && (
          <Box
            title="Daily habits"
            action={
              <input
                aria-label="Habit date"
                type="date"
                value={selected}
                max={today}
                className={`${field} mt-0 w-auto`}
                onChange={(e) => e.target.value && selectDate(e.target.value)}
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {habits.map((h) => (
                <button
                  key={h.id}
                  disabled={selected > today}
                  aria-pressed={(data.habitLog[selected] ?? []).includes(h.id)}
                  onClick={() => toggleHabit(h.id)}
                  className="flex items-center gap-3 rounded-lg border border-sky-400/20 p-4 text-left text-sm"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 text-sky-300">
                    {(data.habitLog[selected] ?? []).includes(h.id) && <Check size={16} />}
                  </span>
                  {h.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Shared with your existing habit tracker. Future days cannot be marked complete.
            </p>
          </Box>
        )}
        {tab === "Notes" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <Box title="Planning notes">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.richNotes
                  .filter((n) => (n.title + " " + n.body).toLowerCase().includes(query.toLowerCase()))
                  .map((n) => (
                    <article key={n.id} className="rounded-lg border border-sky-400/20 p-4">
                      <h3 className="break-words text-sm">{n.title}</h3>
                      <p className="mt-1 text-[10px] text-sky-400">
                        {n.date} · {n.category}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-400">{n.body}</p>
                    </article>
                  ))}
              </div>
              {!data.richNotes.length && (
                <p className="py-12 text-center text-sm text-slate-500">Capture an idea for your next chapter.</p>
              )}
            </Box>
            <Box title="New note">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveNote();
                }}
                className="space-y-3"
              >
                <label className="block text-xs">
                  Title
                  <input
                    required
                    maxLength={100}
                    className={field}
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </label>
                <label className="block text-xs">
                  Note
                  <textarea
                    className={`${field} min-h-32`}
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    maxLength={10000}
                  />
                </label>
                <button className={button}>
                  <NotebookPen size={14} />
                  Save note
                </button>
              </form>
            </Box>
          </div>
        )}
        <p className="text-[10px] text-slate-500">
          Planning uses your Evolution calendar. No external calendar connection or background notification service is
          added.
        </p>
        <Dialog
          open={!!draft}
          onOpenChange={(open) => {
            if (!open) {
              setDraft(null);
              setBaseline(null);
              setError("");
            }
          }}
        >
          {draft && (
            <DialogContent className="max-h-[90dvh] w-[calc(100%_-_1.5rem)] max-w-xl overflow-y-auto rounded-xl border-sky-400/30 bg-[#06111c] p-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEvent();
                }}
              >
                <DialogTitle className="text-sky-200">{draft.id ? "Edit event" : "Plan an event"}</DialogTitle>
                <DialogDescription className="mt-1 text-xs text-slate-400">
                  Saved to your Evolution calendar. Times use this device’s local time.
                </DialogDescription>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="col-span-2 text-xs">
                    Event title
                    <input
                      autoFocus
                      required
                      maxLength={100}
                      className={field}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  </label>
                  <label className="text-xs">
                    Date
                    <input
                      required
                      type="date"
                      className={field}
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    />
                  </label>
                  <label className="text-xs">
                    Category
                    <select
                      className={field}
                      value={draft.category ?? "Other"}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value as PlanningCategory })}
                    >
                      {CATS.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="col-span-2 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!draft.allDay}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          allDay: e.target.checked,
                          reminder: e.target.checked ? 0 : draft.reminder,
                        })
                      }
                    />
                    All-day event
                  </label>
                  {!draft.allDay && (
                    <>
                      <label className="text-xs">
                        Start time
                        <input
                          required
                          type="time"
                          className={field}
                          value={draft.time}
                          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                        />
                      </label>
                      <label className="text-xs">
                        End time
                        <input
                          type="time"
                          className={field}
                          value={draft.endTime ?? ""}
                          onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                        />
                      </label>
                    </>
                  )}
                  <label className="col-span-2 text-xs">
                    Description
                    <textarea
                      className={field}
                      maxLength={2000}
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    />
                  </label>
                  <label className="text-xs">
                    Related goal
                    <select
                      className={field}
                      value={draft.relatedGoalId ?? ""}
                      onChange={(e) => setDraft({ ...draft, relatedGoalId: e.target.value })}
                    >
                      <option value="">None</option>
                      {data.goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    In-page reminder
                    <select
                      disabled={draft.allDay}
                      className={field}
                      value={draft.reminder ?? 0}
                      onChange={(e) => setDraft({ ...draft, reminder: Number(e.target.value) as ReminderOffset })}
                    >
                      <option value={0}>None</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  </label>
                </div>
                <p className="mt-3 text-[10px] text-slate-500">
                  Reminders only display while this page is open. No push notifications are promised.
                </p>
                {error && (
                  <p role="alert" className="mt-3 text-xs text-red-300">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" className={button} onClick={() => setDraft(null)}>
                    Cancel
                  </button>
                  <button className={`${button} ${active}`}>Save event</button>
                </div>
              </form>
            </DialogContent>
          )}
        </Dialog>
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="w-[calc(100%_-_1.5rem)] max-w-sm border-sky-400/30 bg-[#06111c]">
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              Only this calendar event will be removed. Tasks and related goals remain.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <button className={button} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className={button}
                onClick={() => {
                  mutate((p) => ({ calendar: p.calendar.filter((e) => e.id !== deleteId) }));
                  setDeleteId(null);
                  setSelectedId(null);
                  toast.success("Event removed");
                }}
              >
                Delete event
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <ReminderEngine events={events} />
      </div>
    </ModuleLayout>
  );
}
function eventStartMs(e: CalendarEvent) {
  return new Date(`${e.date}T${e.time}:00`).getTime();
}
function fmt12(t: string) {
  return timeLabel({ id: "", date: "", title: "", time: t });
}
// ---------- reminder engine + popups ----------
interface ActiveNotification {
  id: string;
  title: string;
  time: string;
  date: string;
}

function ReminderEngine({ events }: { events: CalendarEvent[] }) {
  const [popups, setPopups] = useState<ActiveNotification[]>([]);
  const firedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const reset = () => {
      firedRef.current.clear();
      setPopups([]);
    };
    window.addEventListener("evolution:owner-changing", reset);
    return () => window.removeEventListener("evolution:owner-changing", reset);
  }, []);

  useEffect(() => {
    let validOwner = true;
    const ownerChanged = () => {
      validOwner = false;
    };
    window.addEventListener("evolution:owner-changing", ownerChanged);
    const tick = () => {
      if (!validOwner) return;
      const now = Date.now();
      events.forEach((e) => {
        if (!e.reminder || (e as PlanningEvent).allDay) return;
        const trigger = eventStartMs(e) - e.reminder * 60_000;
        // fire window: trigger reached within last 60s and not yet fired
        if (
          trigger <= now &&
          now - trigger < 60_000 &&
          !firedRef.current.has(`${e.id}:${e.date}:${e.time}:${e.reminder}`)
        ) {
          firedRef.current.add(`${e.id}:${e.date}:${e.time}:${e.reminder}`);
          setPopups((prev) => [...prev, { id: e.id + ":" + now, title: e.title, time: e.time, date: e.date }]);
        }
      });
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => {
      clearInterval(id);
      window.removeEventListener("evolution:owner-changing", ownerChanged);
    };
  }, [events]);

  // auto-dismiss after 10s
  useEffect(() => {
    if (popups.length === 0) return;
    const timers = popups.map((p) =>
      setTimeout(() => {
        setPopups((prev) => prev.filter((x) => x.id !== p.id));
      }, 10_000),
    );
    return () => timers.forEach(clearTimeout);
  }, [popups]);

  if (popups.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {popups.map((p) => (
        <div
          key={p.id}
          className="pointer-events-auto hud-card hud-scan p-3 pr-2 min-w-[260px] max-w-sm animate-in slide-in-from-right-4 fade-in duration-300"
          style={{
            boxShadow:
              "0 0 24px color-mix(in oklab, var(--glow) 50%, transparent), inset 0 0 18px color-mix(in oklab, var(--glow) 12%, transparent)",
          }}
        >
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="hud-label text-[9px] text-primary tracking-[0.3em]">REMINDER</div>
              <div className="text-sm text-foreground font-medium truncate">{p.title}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-0.5">
                {p.date} · {fmt12(p.time)}
              </div>
            </div>
            <button
              onClick={() => setPopups((prev) => prev.filter((x) => x.id !== p.id))}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
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

const PLANNING_CATEGORIES = ["Fitness", "Nutrition", "Wealth", "Business", "Travel", "Knowledge", "Other"] as const;
type PlanningCategory = (typeof PLANNING_CATEGORIES)[number];
interface PlanningEvent extends CalendarEvent {
  category?: PlanningCategory;
  description?: string;
  allDay?: boolean;
  relatedGoalId?: string;
}
type PlanningEventPatch = Partial<Omit<PlanningEvent, "id">>;

function validDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** Construct at local noon to avoid DST midnight boundaries and UTC day shifts. */
function localDate(year: number, month: number, day: number): Date {
  const result = new Date(2000, 0, 1, 12, 0, 0, 0);
  result.setFullYear(year, month, day);
  return result;
}

function localDateKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw new Error("A valid date is required.");
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value: string): Date | null {
  if (!validDateKey(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return localDate(year, month - 1, day);
}

function addCalendarDays(date: Date, days: number): Date {
  if (!Number.isFinite(date.getTime()) || !Number.isInteger(days))
    throw new Error("A valid date and whole day offset are required.");
  return localDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function monthCells(date: Date): Date[] {
  if (!Number.isFinite(date.getTime())) throw new Error("A valid date is required.");
  const first = localDate(date.getFullYear(), date.getMonth(), 1);
  const start = addCalendarDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addCalendarDays(start, index));
}

function weekCells(date: Date): Date[] {
  const start = addCalendarDays(date, -date.getDay());
  return Array.from({ length: 7 }, (_, index) => addCalendarDays(start, index));
}

/** Jan 31 -> Feb's last day, never silently roll into March. */
function shiftCalendarMonth(date: Date, months: number): Date {
  if (!Number.isFinite(date.getTime()) || !Number.isInteger(months))
    throw new Error("A valid date and whole month offset are required.");
  const first = localDate(date.getFullYear(), date.getMonth() + months, 1);
  const last = localDate(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return localDate(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last));
}

function sortPlanningEvents<T extends PlanningEvent>(events: readonly T[]): T[] {
  return [...events].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      Number(!!b.allDay) - Number(!!a.allDay) ||
      (a.time || "").localeCompare(b.time || "") ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id),
  );
}

/** Inclusive date range. Never mutates, drops fields from, or reseeds stored records. */
function filterPlanningEvents<T extends PlanningEvent>(
  events: readonly T[],
  filters: {
    start?: string;
    end?: string;
    query?: string;
    category?: PlanningCategory | "All";
  } = {},
): T[] {
  const query = (filters.query ?? "").trim().toLocaleLowerCase();
  return sortPlanningEvents(
    events.filter(
      (event) =>
        (!filters.start || event.date >= filters.start) &&
        (!filters.end || event.date <= filters.end) &&
        (!filters.category || filters.category === "All" || (event.category ?? "Other") === filters.category) &&
        (!query || `${event.title} ${event.description ?? ""}`.toLocaleLowerCase().includes(query)),
    ),
  );
}

const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
function validatePlanningEvent(event: Omit<PlanningEvent, "id"> | PlanningEvent): string {
  if (!event.title.trim()) return "Give the event a title.";
  if (event.title.trim().length > 100) return "Keep the title to 100 characters.";
  if (!validDateKey(event.date)) return "Choose a valid date.";
  if (!event.allDay) {
    if (!validTime(event.time)) return "Choose a valid start time.";
    if (event.endTime && !validTime(event.endTime)) return "Choose a valid end time.";
    if (event.endTime && event.endTime <= event.time) return "End time must be after start time on the same day.";
  }
  if (event.category !== undefined && !PLANNING_CATEGORIES.includes(event.category)) return "Choose a valid category.";
  if (event.description && event.description.length > 2000) return "Keep the description to 2,000 characters.";
  if (event.reminder !== undefined && ![0, 15, 30, 60, 1440].includes(event.reminder))
    return "Choose a valid reminder.";
  return "";
}

/** Merge only changed fields into the latest record inside mutate; preserve identity and legacy fields. */
function applyEventPatch<T extends PlanningEvent>(latest: T, patch: PlanningEventPatch): T {
  const next = { ...latest, ...patch, id: latest.id };
  const error = validatePlanningEvent(next);
  if (error) throw new Error(error);
  next.title = next.title.trim();
  return next;
}
