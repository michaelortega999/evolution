import { useState, useEffect, useRef } from "react";
import { useEvolutionData, useCloudStatus, uid, type GoalCategory } from "@/lib/evolution-data";
import {
  localISO,
  evoShiftDate,
  evoValidDate,
  evoBuildRoutine,
  evoApplyRoutine,
  evoUndoRoutine,
  evoEventConflicts,
  type EvoRoutineSpec,
  type EvoRoutineRecord,
} from "@/lib/utils";
import { hologramSrc } from "@/lib/holograms";
import {
  CalendarDays,
  CircleCheck,
  ChartNoAxesCombined,
  Sparkles,
  Orbit,
  MessageCircle,
  Workflow,
  Target,
  X,
  ArrowRight,
  Plus,
  ArrowUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Home,
} from "lucide-react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";

import "../styles.css";
import { useTheme } from "@/lib/use-theme";
import { FocusNotification } from "@/components/evolution/FocusNotification";
import { MobileBottomNav } from "@/components/evolution/MobileBottomNav";
import { MobileApp, useIsPhone } from "@/components/evolution/MobileApp";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Evolution — Life Operating System" },
      {
        name: "description",
        content:
          "Discipline. Focus. Consistency. Freedom. Track wealth, fitness, nutrition, journaling, and investing in one HUD.",
      },
      { name: "author", content: "Evolution" },
      { property: "og:title", content: "Evolution — Life Operating System" },
      {
        property: "og:description",
        content: "Track wealth, fitness, nutrition, journaling, investing, and habits in one HUD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useTheme();
  const isPhone = useIsPhone();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const section = new URLSearchParams(searchStr).get("section");
  if (section === "evo" || section === "alfred")
    return (
      <>
        <EvoAssistantPage />
        <Toaster />
      </>
    );
  if (isPhone && pathname !== "/auth" && pathname !== "/settings") return <MobileApp />;
  return (
    <>
      <Outlet />
      <MobileBottomNav fixed />
      <FocusNotification />
      <Toaster theme="dark" position="top-right" />
    </>
  );
}

function EvoAssistantPage() {
  const isPhone = useIsPhone();
  const { data, mutate } = useEvolutionData();
  const cloud = useCloudStatus();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"chat" | "routines" | "calendar" | "goals">("chat");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [draftTask, setDraftTask] = useState("");
  const [taskDate, setTaskDate] = useState(localISO());
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalDate, setGoalDate] = useState(evoShiftDate(localISO(), 30));
  const [goalCategory, setGoalCategory] = useState<GoalCategory>("Business");
  const [habitTitle, setHabitTitle] = useState("");
  const [cursor, setCursor] = useState(localISO());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [spec, setSpec] = useState<EvoRoutineSpec>({
    title: "Work",
    startDate: localISO(),
    startTime: "09:00",
    durationMinutes: 480,
    workDays: 4,
    offDays: 4,
    horizonDays: 56,
  });
  const [preview, setPreview] = useState<EvoRoutineRecord | null>(null);
  const [allowConflicts, setAllowConflicts] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setReady(true);
    const clear = () => {
      setReady(false);
      setPreview(null);
      setMessage("");
      setNotice("");
      setDraftTask("");
      setGoalTitle("");
      setHabitTitle("");
      setUndoId(null);
      setTaskDate(localISO());
      setGoalDate(evoShiftDate(localISO(), 30));
      setGoalTarget("10");
      setGoalCategory("Business");
      setCursor(localISO());
      setShowTools(false);
      setView("chat");
      setSpec({
        title: "Work",
        startDate: localISO(),
        startTime: "09:00",
        durationMinutes: 480,
        workDays: 4,
        offDays: 4,
        horizonDays: 56,
      });
    };
    const loaded = () => setReady(true);
    window.addEventListener("evolution:owner-changing", clear);
    window.addEventListener("evolution:owner-changed", loaded);
    return () => {
      window.removeEventListener("evolution:owner-changing", clear);
      window.removeEventListener("evolution:owner-changed", loaded);
    };
  }, []);
  const disabled = !ready || cloud === "loading";
  const history = ready ? (data.assistantMessages || []).slice(-80) : [];
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [history.length]);
  const append = (user: string, response: string) =>
    mutate((prev) => ({
      assistantMessages: [
        ...(prev.assistantMessages || []),
        { id: uid(), role: "user" as const, text: user, createdAt: Date.now() },
        { id: uid(), role: "evo" as const, text: response, createdAt: Date.now() },
      ].slice(-200),
    }));
  const runCommand = (input: string) => {
    if (disabled) return;
    const text = input.trim().slice(0, 1000);
    if (!text) return;
    setMessage("");
    setNotice("");
    setView("chat");
    const lower = text.toLowerCase();
    let response = "";
    if (/^(add task:|task:)/i.test(text)) {
      const title = text
        .replace(/^(add task:|task:)/i, "")
        .trim()
        .slice(0, 160);
      setDraftTask(title);
      setTaskDate(localISO());
      response = title
        ? "Review the task below, choose its date, then save it to Tasks."
        : "Type “Add task: your task” to prepare a task.";
    } else if (/routine|schedule|\d\s*(days?\s*)?on/.test(lower)) {
      const match = lower.match(/(\d{1,2})\s*(?:days?\s*)?on\s*(?:\/|and)?\s*(\d{1,2})\s*(?:days?\s*)?off/);
      if (match)
        setSpec((s) => ({
          ...s,
          workDays: Math.min(14, Math.max(1, Number(match[1]))),
          offDays: Math.min(14, Math.max(1, Number(match[2]))),
        }));
      setView("routines");
      response =
        "The routine builder is open. Set the first work day, time, shift length and cycle. Preview first; nothing goes on your calendar until you apply it.";
    } else if (/goal|habit/.test(lower)) {
      setView("goals");
      response =
        "Goals and habits are open. Add a measurable goal or a daily habit. Existing progress stays connected to your Evolution data.";
    } else if (/focus/.test(lower)) {
      response =
        "Choose one unfinished task, remove distractions, and start a short focus block. Your Focus module is available from Systems. I haven’t started a timer or changed your calendar.";
    } else if (/plan|today|day|progress|consistent/.test(lower)) {
      const today = localISO();
      const tasks = data.evoTasks.filter((t) => t.due === today && t.status !== "Done");
      const events = data.calendar
        .filter((e) => e.date === today)
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      response =
        `Today: ${tasks.length} unfinished task${tasks.length === 1 ? "" : "s"} and ${events.length} calendar block${events.length === 1 ? "" : "s"}.` +
        (tasks.length
          ? "\nStart with: " +
            tasks
              .slice(0, 3)
              .map((t) => t.text)
              .join(" · ")
          : "\nNo unfinished tasks are dated today. Add your next priority below.") +
        (events.length
          ? "\nScheduled: " +
            events
              .slice(0, 4)
              .map((e) => e.time + " " + e.title)
              .join(" · ")
          : "");
    } else if (/trade/.test(lower)) {
      response =
        "Your trade records are in Investing. This planning workspace has no live market feed or verified strategy engine, so it won’t invent trade analysis or place trades.";
    } else {
      response =
        "I can organize your saved tasks, preview repeating work schedules, add goals and habits, and show your calendar. Try “Plan my day”, “Build a 4 on 4 off routine”, or “Add task: review my week”. Free-form AI chat is not connected yet.";
    }
    append(text, response);
  };
  const saveTask = () => {
    if (disabled) return;
    const title = draftTask.trim();
    if (!title || !evoValidDate(taskDate)) {
      setNotice("Enter a task and a valid date.");
      return;
    }
    mutate((prev) => ({
      evoTasks: [
        ...prev.evoTasks,
        { id: uid(), text: title, category: "Notes", priority: "Medium", due: taskDate, status: "Not Started" },
      ],
    }));
    setDraftTask("");
    setNotice("Task saved to Evolution Tasks.");
  };
  const saveGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    const target = Number(goalTarget);
    if (!goalTitle.trim() || !Number.isFinite(target) || target <= 0 || !evoValidDate(goalDate)) {
      setNotice("Enter a goal, a positive target and a valid deadline.");
      return;
    }
    mutate((prev) => ({
      goals: [
        ...prev.goals,
        {
          id: uid(),
          title: goalTitle.trim().slice(0, 160),
          category: goalCategory,
          target,
          current: 0,
          deadline: goalDate,
          unit: "steps",
          completed: false,
        },
      ],
    }));
    setGoalTitle("");
    setNotice("Goal saved. Update its progress below.");
  };
  const buildPreview = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const plan = evoBuildRoutine(spec);
      setPreview(plan);
      setCursor(plan.spec.startDate);
      setAllowConflicts(false);
      setNotice("Preview only. Your calendar has not changed.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  const applyPreview = () => {
    if (!preview || disabled) return;
    try {
      mutate((prev) => evoApplyRoutine(prev, preview, allowConflicts));
      setPreview(null);
      setNotice("Routine saved to your Evolution calendar. No external reminders were created.");
      setView("calendar");
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  const undoRoutine = () => {
    if (!undoId || disabled) return;
    try {
      let retained = 0;
      mutate((prev) => {
        const result = evoUndoRoutine(prev, undoId);
        retained = result.retained;
        return { calendar: result.calendar, assistantRoutines: result.assistantRoutines };
      });
      setUndoId(null);
      setNotice("Routine removed from the calendar." + (retained ? ` ${retained} edited event(s) were kept.` : ""));
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  const activeRoutines = (data.assistantRoutines || []).filter((r) => !r.archived);
  const conflicts = preview ? evoEventConflicts(preview.events, data.calendar) : [];
  const dateObj = new Date(cursor + "T12:00:00");
  const gridStart =
    calendarView === "month"
      ? evoShiftDate(`${cursor.slice(0, 7)}-01`, -new Date(cursor.slice(0, 7) + "-01T12:00:00").getDay())
      : calendarView === "week"
        ? evoShiftDate(cursor, -dateObj.getDay())
        : cursor;
  const gridCount = calendarView === "month" ? 42 : calendarView === "week" ? 7 : 1;
  const grid = Array.from({ length: gridCount }, (_, i) => evoShiftDate(gridStart, i));
  const displayed = preview ? preview.events : data.calendar;
  const shiftCursor = (direction: number) => {
    if (calendarView === "month") {
      const date = new Date(dateObj.getFullYear(), dateObj.getMonth() + direction, 1, 12);
      setCursor(localISO(date));
    } else setCursor(evoShiftDate(cursor, direction * (calendarView === "week" ? 7 : 1)));
  };
  const statusLabel =
    cloud === "synced"
      ? "Account synced"
      : cloud === "saving"
        ? "Saving to account…"
        : cloud === "error"
          ? "Cloud unavailable · saved on device"
          : cloud === "loading"
            ? "Loading your account…"
            : "Guest · saved on this device";
  if (!ready)
    return (
      <div className="evo-workspace">
        <style>{EVO_WORKSPACE_CSS}</style>
        <p role="status">Loading your workspace…</p>
      </div>
    );
  return (
    <div className="evo-workspace">
      <style>{EVO_WORKSPACE_CSS}</style>
      <header className="evo-header evo-frame">
        <a href="/" className="evo-brand" aria-label="Evolution home">
          <img src={hologramSrc("bonsai")} alt="" />
          <span>
            EVOLUTION <b>OS</b>
            <small>HIGHER STANDARDS. BRIGHTER DAYS.</small>
          </span>
        </a>
        <nav aria-label="Main sections">
          <a href="/">Home</a>
          <a href="/?mobilePage=home">Systems</a>
          <span aria-current="page">Evo Assistant</span>
          <a href={isPhone ? "/?mobilePage=profile" : "/settings"}>Settings</a>
        </nav>
        <div className="evo-head-status">
          <strong>EVO</strong>
          <small>{statusLabel}</small>
        </div>
      </header>
      <div className="evo-mobile-quick" aria-label="Quick planning tools">
        <button disabled={disabled} onClick={() => runCommand("Plan my day")}>
          <CalendarDays />
          Plan
          <br />
          my day
        </button>
        <button disabled={disabled} onClick={() => runCommand("Improve my focus")}>
          <CircleCheck />
          Improve
          <br />
          my focus
        </button>
        <button disabled={disabled} onClick={() => runCommand("Build a habit")}>
          <ChartNoAxesCombined />
          Build
          <br />a habit
        </button>
        <button
          disabled={disabled}
          onClick={() => {
            setShowTools((s) => !s);
            setView("chat");
          }}
        >
          <Sparkles />
          Explore
          <br />
          tools
        </button>
      </div>
      <div className="evo-body">
        <aside className="evo-side evo-frame">
          <div className="evo-side-orb">
            <Orbit />
          </div>
          <h1>EVO ASSISTANT</h1>
          <p>Plan. Execute. Evolve.</p>
          {(
            [
              ["chat", "Conversation", MessageCircle],
              ["routines", "Workflows", Workflow],
              ["calendar", "Calendar", CalendarDays],
              ["goals", "Goals & habits", Target],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              aria-pressed={view === key}
              onClick={() => {
                setView(key);
                setNotice("");
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
          <div className="evo-side-bottom">
            <p>“Discipline turns intention into results.”</p>
            <small>
              Built-in planning tools
              <br />
              Free-form AI not connected
            </small>
          </div>
        </aside>
        <main className="evo-main">
          <div className="evo-view-tabs" aria-label="Evo sections">
            {(["chat", "routines", "calendar", "goals"] as const).map((key) => (
              <button
                key={key}
                aria-pressed={view === key}
                onClick={() => {
                  setView(key);
                  setNotice("");
                }}
              >
                {key === "chat" ? "Evo" : key === "routines" ? "Routines" : key === "goals" ? "Goals" : key}
              </button>
            ))}
          </div>
          {notice && (
            <div role="status" className="evo-notice">
              <CircleCheck size={16} />
              <span>{notice}</span>
              <button aria-label="Dismiss message" onClick={() => setNotice("")}>
                <X size={14} />
              </button>
            </div>
          )}
          {view === "chat" && (
            <div className={"evo-chat-layout " + (history.length || draftTask ? "has-history" : "")}>
              <section className="evo-conversation evo-frame" aria-label="Planning conversation">
                <div className="evo-section-title">
                  <span>
                    <MessageCircle size={16} /> CONVERSATION
                  </span>
                  <small>Planning tools</small>
                </div>
                {history.length === 0 ? (
                  <div className="evo-welcome">
                    <h2>A clearer day starts here.</h2>
                    <p>Turn a routine into a real calendar. Put your next step into action.</p>
                    <button onClick={() => setView("routines")}>
                      Build my routine <ArrowRight size={16} />
                    </button>
                    <small>Choose your dates before applying a schedule.</small>
                  </div>
                ) : (
                  <div className="evo-message-list" aria-live="polite">
                    {history.map((m) => (
                      <article className={"evo-message " + m.role} key={m.id}>
                        <div>
                          {m.role === "user" ? "YOU" : "EVO"}
                          <time>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                        <p>{m.text}</p>
                      </article>
                    ))}
                    <div ref={chatEnd} />
                  </div>
                )}
                {draftTask && (
                  <div className="evo-inline-task">
                    <label>
                      Task title
                      <input value={draftTask} maxLength={160} onChange={(e) => setDraftTask(e.target.value)} />
                    </label>
                    <label>
                      Due date
                      <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                    </label>
                    <div>
                      <button className="evo-primary" disabled={disabled} onClick={saveTask}>
                        Save task
                      </button>
                      <button onClick={() => setDraftTask("")}>Cancel</button>
                    </div>
                  </div>
                )}
              </section>
              <section className="evo-hero" aria-label="Evo hologram">
                <div className="evo-orb">
                  <div className="evo-orbit o1" />
                  <div className="evo-orbit o2" />
                  <div className="evo-orbit o3" />
                  <div className="evo-globe-grid" />
                  <img src={hologramSrc("bonsai")} alt="Blue holographic bonsai" />
                  <div className="evo-orb-base" />
                </div>
                <h2>EVO</h2>
                <p>HOW CAN I HELP?</p>
                <div className="evo-hero-line" />
                <small>Built-in planner · AI chat not connected</small>
              </section>
              <div className="evo-composer evo-frame">
                {showTools && (
                  <div className="evo-tools">
                    <button onClick={() => setView("routines")}>Routine builder</button>
                    <button onClick={() => setView("goals")}>Goals & habits</button>
                    <button
                      onClick={() => {
                        setDraftTask("New task");
                        setShowTools(false);
                      }}
                    >
                      Add a task
                    </button>
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runCommand(message);
                  }}
                >
                  <button type="button" aria-label="Open planning tools" onClick={() => setShowTools((s) => !s)}>
                    <Plus />
                  </button>
                  <input
                    aria-label="Message Evo"
                    placeholder="Plan my day or add task…"
                    value={message}
                    maxLength={1000}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={disabled}
                  />
                  <button
                    type="submit"
                    className="evo-send"
                    disabled={disabled || !message.trim()}
                    aria-label="Send to Evo planning tools"
                  >
                    <ArrowUp />
                  </button>
                </form>
                <div className="evo-command-pills">
                  <button onClick={() => runCommand("Plan my day")}>Plan my day</button>
                  <button onClick={() => runCommand("Build a routine")}>Optimize my routine</button>
                  <button onClick={() => runCommand("Review my progress")}>Review my progress</button>
                </div>
              </div>
            </div>
          )}
          {view === "routines" && (
            <div className="evo-two-column">
              <section className="evo-frame evo-panel">
                <div className="evo-section-title">
                  <span>
                    <Workflow size={17} /> ROUTINE BUILDER
                  </span>
                </div>
                <h2>Your rhythm. Your calendar.</h2>
                <p className="evo-muted">
                  Set the first work day of a repeating cycle. All dates and times follow this device’s local timezone.
                  Overnight shifts are split across two dates.
                </p>
                <form className="evo-form" onSubmit={buildPreview}>
                  <label>
                    Routine name
                    <input
                      maxLength={80}
                      value={spec.title}
                      onChange={(e) => {
                        setSpec({ ...spec, title: e.target.value });
                        setPreview(null);
                      }}
                      required
                    />
                  </label>
                  <div className="evo-form-pair">
                    <label>
                      First work day
                      <input
                        type="date"
                        min="2000-01-01"
                        max="2100-12-31"
                        value={spec.startDate}
                        onChange={(e) => {
                          setSpec({ ...spec, startDate: e.target.value });
                          setPreview(null);
                        }}
                        required
                      />
                    </label>
                    <label>
                      Start time
                      <input
                        type="time"
                        value={spec.startTime}
                        onChange={(e) => {
                          setSpec({ ...spec, startTime: e.target.value });
                          setPreview(null);
                        }}
                        required
                      />
                    </label>
                  </div>
                  <div className="evo-form-pair">
                    <label>
                      Work days
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={spec.workDays}
                        onChange={(e) => {
                          setSpec({ ...spec, workDays: Number(e.target.value) });
                          setPreview(null);
                        }}
                        required
                      />
                    </label>
                    <label>
                      Off days
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={spec.offDays}
                        onChange={(e) => {
                          setSpec({ ...spec, offDays: Number(e.target.value) });
                          setPreview(null);
                        }}
                        required
                      />
                    </label>
                  </div>
                  <div className="evo-form-pair">
                    <label>
                      Shift length (hours)
                      <input
                        type="number"
                        min="0.25"
                        max="16"
                        step="0.25"
                        value={spec.durationMinutes / 60}
                        onChange={(e) => {
                          setSpec({ ...spec, durationMinutes: Math.round(Number(e.target.value) * 60) });
                          setPreview(null);
                        }}
                        required
                      />
                    </label>
                    <label>
                      Plan for
                      <select
                        value={spec.horizonDays}
                        onChange={(e) => {
                          setSpec({ ...spec, horizonDays: Number(e.target.value) });
                          setPreview(null);
                        }}
                      >
                        <option value={14}>2 weeks</option>
                        <option value={28}>4 weeks</option>
                        <option value={56}>8 weeks</option>
                        <option value={84}>12 weeks</option>
                      </select>
                    </label>
                  </div>
                  <button className="evo-primary" disabled={disabled} type="submit">
                    <Eye size={17} /> Preview schedule
                  </button>
                </form>
              </section>
              <section className="evo-frame evo-panel">
                <div className="evo-section-title">
                  <span>
                    <CalendarDays size={17} /> {preview ? "REVIEW BEFORE APPLYING" : "SAVED ROUTINES"}
                  </span>
                </div>
                {preview ? (
                  <>
                    <h2>
                      {preview.spec.workDays} on / {preview.spec.offDays} off
                    </h2>
                    <p>
                      {preview.events.length} calendar blocks · {preview.spec.horizonDays} days
                    </p>
                    <p className="evo-muted">
                      {preview.spec.startDate} through{" "}
                      {evoShiftDate(preview.spec.startDate, preview.spec.horizonDays - 1)}. Off days stay free;
                      overnight continuation may extend to the next day.
                    </p>
                    <div className="evo-preview-cycle">
                      {Array.from({ length: Math.min(16, preview.spec.horizonDays) }, (_, i) => (
                        <div
                          className={
                            i % (preview.spec.workDays + preview.spec.offDays) < preview.spec.workDays ? "work" : "off"
                          }
                          key={i}
                        >
                          <small>{evoShiftDate(preview.spec.startDate, i).slice(5)}</small>
                          {i % (preview.spec.workDays + preview.spec.offDays) < preview.spec.workDays ? "WORK" : "OFF"}
                        </div>
                      ))}
                    </div>
                    {conflicts.length > 0 && (
                      <label className="evo-check">
                        <input
                          type="checkbox"
                          checked={allowConflicts}
                          onChange={(e) => setAllowConflicts(e.target.checked)}
                        />{" "}
                        I reviewed {conflicts.length} overlapping block(s). Keep both.
                      </label>
                    )}
                    <div className="evo-preview-list">
                      {preview.events.slice(0, 12).map((e) => (
                        <div key={e.id}>
                          <span>
                            {e.date}
                            <small>{e.title}</small>
                          </span>
                          <span>
                            {e.time}–{e.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="evo-button-row">
                      <button
                        className="evo-primary"
                        disabled={disabled || (!!conflicts.length && !allowConflicts)}
                        onClick={applyPreview}
                      >
                        Apply to calendar
                      </button>
                      <button onClick={() => setPreview(null)}>Cancel preview</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="evo-muted">
                      {activeRoutines.length
                        ? "Your applied routines appear below."
                        : "No routines saved yet. Preview a cycle to get started."}
                    </p>
                    {activeRoutines.map((r) => (
                      <div className="evo-saved-routine" key={r.id}>
                        <strong>{r.spec.title}</strong>
                        <small>
                          {r.spec.workDays} on / {r.spec.offDays} off · from {r.spec.startDate}
                        </small>
                        <button onClick={() => setUndoId(r.id)}>Remove this routine</button>
                      </div>
                    ))}
                  </>
                )}
                {undoId && (
                  <div role="alertdialog" aria-label="Remove routine" className="evo-confirm">
                    <p>Remove this routine’s unchanged events? Events you edited will be kept.</p>
                    <button onClick={undoRoutine} disabled={disabled}>
                      Remove routine events
                    </button>
                    <button onClick={() => setUndoId(null)}>Cancel</button>
                  </div>
                )}
              </section>
            </div>
          )}
          {view === "calendar" && (
            <section className="evo-frame evo-panel">
              <div className="evo-section-title">
                <span>
                  <CalendarDays size={17} /> {preview ? "SCHEDULE PREVIEW" : "YOUR CALENDAR"}
                </span>
                <button onClick={() => setView("routines")}>Build routine</button>
              </div>
              <div className="evo-calendar-controls">
                <div>
                  <button aria-label="Previous period" onClick={() => shiftCursor(-1)}>
                    <ChevronLeft />
                  </button>
                  <h2>{dateObj.toLocaleDateString([], { month: "long", year: "numeric" })}</h2>
                  <button aria-label="Next period" onClick={() => shiftCursor(1)}>
                    <ChevronRight />
                  </button>
                </div>
                <div>
                  <button onClick={() => setCursor(localISO())}>Today</button>
                  {(["month", "week", "day"] as const).map((v) => (
                    <button key={v} aria-pressed={calendarView === v} onClick={() => setCalendarView(v)}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className={"evo-calendar " + calendarView}>
                {calendarView !== "day" &&
                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <span className="evo-weekday" key={d}>
                      {d}
                    </span>
                  ))}
                {grid.map((date) => (
                  <button
                    className={
                      "evo-day " +
                      (date === localISO() ? "today " : "") +
                      (date.slice(0, 7) !== cursor.slice(0, 7) ? "outside" : "")
                    }
                    key={date}
                    onClick={() => {
                      setCursor(date);
                      setCalendarView("day");
                    }}
                    aria-label={"View " + date}
                  >
                    <span>
                      {calendarView !== "month"
                        ? new Date(date + "T12:00:00").toLocaleDateString([], {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : Number(date.slice(-2))}
                    </span>
                    {displayed
                      .filter((e) => e.date === date)
                      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                      .slice(0, calendarView === "month" ? 3 : Number.MAX_SAFE_INTEGER)
                      .map((e) => (
                        <div className="evo-event" key={e.id}>
                          <time>{e.time}</time>
                          <span>{e.title}</span>
                        </div>
                      ))}
                    {displayed.filter((e) => e.date === date).length >
                      (calendarView === "month" ? 3 : Number.MAX_SAFE_INTEGER) && <small>+ more · open day</small>}
                    {calendarView === "day" && !displayed.some((e) => e.date === date) && (
                      <p className="evo-muted">No calendar blocks on this date.</p>
                    )}
                  </button>
                ))}
              </div>
              <p className="evo-muted">
                Saved blocks also appear in Evolution Plan. No external calendar connection or reminder service is
                enabled.
              </p>
            </section>
          )}
          {view === "goals" && (
            <div className="evo-two-column">
              <section className="evo-frame evo-panel">
                <div className="evo-section-title">
                  <span>
                    <Target size={17} /> SET YOUR DIRECTION
                  </span>
                </div>
                <form className="evo-form" onSubmit={saveGoal}>
                  <label>
                    Goal
                    <input
                      value={goalTitle}
                      maxLength={160}
                      placeholder="Finish my project milestones"
                      onChange={(e) => setGoalTitle(e.target.value)}
                      required
                    />
                  </label>
                  <div className="evo-form-pair">
                    <label>
                      Category
                      <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}>
                        {["Business", "Fitness", "Wealth", "Trading", "Nutrition", "Hobby"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Target steps
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Deadline
                    <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} required />
                  </label>
                  <button className="evo-primary" disabled={disabled}>
                    Save goal
                  </button>
                </form>
                <hr />
                <h3>Build a daily habit</h3>
                <form
                  className="evo-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (disabled || !habitTitle.trim()) return;
                    mutate((prev) => ({
                      customHabits: [
                        ...prev.customHabits,
                        { id: uid(), name: habitTitle.trim().slice(0, 80), category: "Notes", emoji: "✦" },
                      ],
                    }));
                    setHabitTitle("");
                    setNotice("Habit saved to your daily habits.");
                  }}
                >
                  <label>
                    Habit name
                    <input
                      value={habitTitle}
                      maxLength={80}
                      onChange={(e) => setHabitTitle(e.target.value)}
                      placeholder="Review tomorrow’s priorities"
                      required
                    />
                  </label>
                  <button disabled={disabled}>Add habit</button>
                </form>
              </section>
              <section className="evo-frame evo-panel">
                <div className="evo-section-title">
                  <span>
                    <ChartNoAxesCombined size={17} /> PROGRESS
                  </span>
                </div>
                {!data.goals.length && <p className="evo-muted">Your first goal starts with one clear step.</p>}
                {data.goals.map((g) => (
                  <div className="evo-goal" key={g.id}>
                    <strong>{g.title}</strong>
                    <small>
                      {g.category} · by {g.deadline}
                    </small>
                    <progress max={Math.max(1, g.target)} value={Math.max(0, g.current)} />
                    <div>
                      <span>
                        {g.current} / {g.target} {g.unit || ""}
                      </span>
                      <button
                        disabled={disabled || g.current >= g.target}
                        onClick={() =>
                          mutate((prev) => ({
                            goals: prev.goals.map((item) =>
                              item.id === g.id
                                ? {
                                    ...item,
                                    current: Math.min(item.target, item.current + 1),
                                    completed: item.current + 1 >= item.target,
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        +1 step
                      </button>
                    </div>
                  </div>
                ))}
                <h3>Daily habits</h3>
                {!data.customHabits.length && <p className="evo-muted">Add a habit to begin tracking.</p>}
                {data.customHabits.map((h) => {
                  const done = (data.habitLog[h.id] || []).includes(localISO());
                  return (
                    <button
                      className={"evo-habit " + (done ? "complete" : "")}
                      key={h.id}
                      disabled={disabled}
                      aria-pressed={done}
                      onClick={() =>
                        mutate((prev) => {
                          const dates = prev.habitLog[h.id] || [];
                          const today = localISO();
                          return {
                            habitLog: {
                              ...prev.habitLog,
                              [h.id]: dates.includes(today) ? dates.filter((d) => d !== today) : [...dates, today],
                            },
                          };
                        })
                      }
                    >
                      <CircleCheck />
                      {h.name}
                      <small>{done ? "Done today" : "Mark today"}</small>
                    </button>
                  );
                })}
              </section>
            </div>
          )}
          <div className="evo-bottom-actions">
            <button onClick={() => setView("routines")}>
              <Workflow />
              <strong>OPTIMIZE MY ROUTINE</strong>
              <small>Small changes. Real structure.</small>
            </button>
            <button onClick={() => runCommand("Review my progress")}>
              <Sprout />
              <strong>EVOLVE</strong>
              <small>A higher you.</small>
            </button>
            <button onClick={() => setView("goals")}>
              <Target />
              <strong>SET GOALS</strong>
              <small>Turn plans into progress.</small>
            </button>
          </div>
        </main>
      </div>
      <nav className="evo-mobile-nav" aria-label="Mobile navigation">
        <a href="/">
          <Home />
          <span>Home</span>
        </a>
        <button onClick={() => setView("calendar")}>
          <CalendarDays />
          <span>Plan</span>
        </button>
        <a className="evo-nav-bonsai" href="/?mobilePage=home" aria-label="Systems">
          <img src={hologramSrc("bonsai")} alt="" />
        </a>
        <a href="/?mobilePage=stats">
          <ChartNoAxesCombined />
          <span>Stats</span>
        </a>
        <button aria-current="page" onClick={() => setView("chat")}>
          <MessageCircle />
          <span>Evo</span>
        </button>
      </nav>
    </div>
  );
}

const EVO_WORKSPACE_CSS = `.evo-workspace{--evo-blue:#70c8ff;--evo-line:#254e77;--evo-dim:#8eabc5;min-height:100dvh;background:radial-gradient(ellipse at 70% 25%,#102a493d,transparent 55%),#050b13;color:#e1efff;font-family:Rajdhani,system-ui,sans-serif;padding:18px 22px 30px;letter-spacing:.025em}.evo-workspace *{box-sizing:border-box}.evo-workspace button,.evo-workspace a{touch-action:manipulation}.evo-workspace button{cursor:pointer;border:1px solid #284b6b;border-radius:7px;background:#101f30;color:#cfeaff;padding:9px 14px;font:inherit;transition:background .18s,border-color .18s}.evo-workspace button:hover{background:#163454;border-color:#6bbaf5}.evo-workspace button:disabled{opacity:.45;cursor:not-allowed}.evo-workspace button:focus-visible,.evo-workspace a:focus-visible,.evo-workspace input:focus-visible,.evo-workspace select:focus-visible{outline:2px solid #87d4ff;outline-offset:3px}.evo-workspace a{text-decoration:none;color:inherit}.evo-workspace svg{flex-shrink:0;width:19px;height:19px}.evo-frame{border:1px solid #284f73;border-radius:12px;background:linear-gradient(140deg,#10223795,#07111dcc);box-shadow:inset 0 0 25px #13365526,0 8px 40px #0003;position:relative}.evo-frame:before,.evo-frame:after{content:'';pointer-events:none;position:absolute;width:45px;height:5px;background:#75bffe;box-shadow:0 0 12px #43acff75;opacity:.65}.evo-frame:before{top:-1px;left:25px;clip-path:polygon(0 0,100% 0,90% 100%,10% 100%)}.evo-frame:after{bottom:-1px;right:25px;clip-path:polygon(10% 0,90% 0,100% 100%,0 100%)}.evo-header{height:83px;display:flex;align-items:center;justify-content:space-between;padding:14px 25px;gap:20px}.evo-brand{display:flex;align-items:center;gap:12px}.evo-brand img{width:59px;height:54px;object-fit:contain;filter:drop-shadow(0 0 9px #2ba5ff)}.evo-brand span{font-family:Orbitron,sans-serif;font-size:17px;letter-spacing:2px}.evo-brand b{color:#7dbfff;font-weight:500}.evo-brand small{display:block;font-family:Rajdhani,sans-serif;font-size:8px;letter-spacing:2px;margin-top:7px;color:#7994b1}.evo-header nav{display:flex;gap:26px;align-items:center;font-size:15px}.evo-header nav span{padding:10px 17px;border:1px solid #2b6391;border-radius:6px;background:#152e49;color:#aadfff}.evo-head-status{text-align:right}.evo-head-status strong{font-family:Orbitron,sans-serif;font-size:22px;letter-spacing:4px}.evo-head-status small{display:block;color:#8da7bd;font-size:10px;margin-top:6px}.evo-body{display:grid;grid-template-columns:190px minmax(0,1fr);gap:20px;margin-top:22px}.evo-side{min-height:700px;padding:28px 16px;display:flex;flex-direction:column}.evo-side-orb{margin:0 auto 18px;display:grid;place-items:center;width:68px;height:68px;border:1px solid #458cc3;border-radius:50%;box-shadow:inset 0 0 30px #276dac55,0 0 22px #2d82cb44}.evo-side-orb svg{width:42px;height:42px;color:#92d4ff}.evo-side h1{text-align:center;font:12px Orbitron,sans-serif;letter-spacing:1px}.evo-side>p{text-align:center;font-size:12px;color:#9ab0c6;margin:10px 0 25px}.evo-side>button{display:flex;gap:10px;align-items:center;margin:4px 0;text-align:left;border-color:transparent;background:transparent;padding:13px 10px}.evo-side>button[aria-pressed=true]{border-color:#386d98;background:#17334c}.evo-side-bottom{margin-top:auto;padding-top:50px;color:#8aa3ba;font-size:12px}.evo-side-bottom p{font-style:italic;line-height:1.7}.evo-side-bottom small{display:block;border-top:1px solid #223f59;padding-top:15px;margin-top:20px;font-size:10px;line-height:1.7}.evo-main{min-width:0}.evo-view-tabs{display:none}.evo-chat-layout{display:grid;grid-template-columns:minmax(280px,.95fr) minmax(330px,1.1fr);gap:20px}.evo-conversation{min-height:450px;max-height:580px;display:flex;flex-direction:column;padding:20px}.evo-section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:15px;border-bottom:1px solid #234360;margin-bottom:20px;font-size:12px;letter-spacing:1.2px}.evo-section-title>span{display:flex;align-items:center;gap:9px}.evo-section-title small{font-size:10px;color:#82a8c6;letter-spacing:0}.evo-section-title button{font-size:12px;padding:6px 9px}.evo-welcome{margin:auto 0;padding:20px 5px}.evo-welcome h2{font-size:26px;font-weight:500;line-height:1.3;margin-bottom:17px}.evo-welcome p{color:#90abc2;line-height:1.7;font-size:15px}.evo-welcome button{margin-top:25px;display:flex;align-items:center;gap:20px}.evo-welcome small{display:block;color:#6b8ba6;font-size:11px;margin-top:15px}.evo-message-list{overflow:auto;min-height:160px;scrollbar-width:thin;scrollbar-color:#315676 transparent}.evo-message{padding:13px;border:1px solid #2b5275;border-radius:8px;margin:0 0 12px;background:#0c1a29}.evo-message.user{background:#162d44;margin-left:24px}.evo-message>div{font:10px Orbitron,sans-serif;color:#7cbcec;display:flex;justify-content:space-between;gap:8px}.evo-message time{font-family:Rajdhani,sans-serif;font-size:10px;color:#7c98ad}.evo-message p{font-size:14px;line-height:1.65;white-space:pre-wrap;margin:10px 0 0}.evo-hero{min-height:445px;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;overflow:hidden;background:radial-gradient(ellipse at center,#0e335d66,transparent 70%)}.evo-orb{width:min(335px,90%);aspect-ratio:1;position:relative;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#1b78be17 45%,#5bbaff11 64%,transparent 69%);filter:drop-shadow(0 0 25px #258fe833)}.evo-orb:before{content:'';position:absolute;inset:7%;border:1px solid #67b7f3a0;border-radius:50%;box-shadow:inset 0 0 28px #2c83c860,0 0 25px #348cd530}.evo-orb:after{content:'';position:absolute;inset:0;border:1px dashed #73bcec70;border-radius:50%;transform:rotate(-25deg)}.evo-orbit{position:absolute;inset:8%;border:1px solid #77caff75;border-radius:50%;box-shadow:0 0 8px #3898f322}.evo-orbit.o1{transform:rotateX(65deg)}.evo-orbit.o2{transform:rotateY(65deg)}.evo-orbit.o3{transform:rotate(-25deg) rotateX(60deg)}.evo-globe-grid{position:absolute;inset:10%;border-radius:50%;background:repeating-linear-gradient(0deg,transparent 0 28px,#6fbcf522 29px 30px),repeating-linear-gradient(90deg,transparent 0 37px,#6fbcf51a 38px 39px);mask-image:radial-gradient(circle,#000 45%,transparent 70%)}.evo-orb img{width:68%;height:68%;object-fit:contain;position:relative;z-index:1;filter:drop-shadow(0 0 16px #1496ff);mix-blend-mode:screen}.evo-orb-base{position:absolute;bottom:10%;width:76%;height:14%;border:1px solid #73baff;border-radius:50%;box-shadow:0 0 22px #278bdb88,inset 0 0 20px #2686ce44}.evo-hero h2{font:28px Orbitron,sans-serif;letter-spacing:7px;margin:16px 0 9px;color:#cbe5ff;text-shadow:0 0 15px #4a9de9}.evo-hero>p{font:11px Orbitron,sans-serif;letter-spacing:4px;color:#93b6d7;margin:0}.evo-hero-line{height:1px;width:60%;background:linear-gradient(90deg,transparent,#69bfff,transparent);margin:19px 0 10px}.evo-hero>small{font-size:10px;color:#7b98b4}.evo-composer{grid-column:1/-1;padding:16px 18px}.evo-composer form{display:flex;align-items:center;gap:12px}.evo-composer form>input{flex:1;min-width:0;background:transparent;border:0;padding:9px;color:#dceeff;font:16px Rajdhani,sans-serif}.evo-composer form>button{padding:8px;display:grid;place-items:center}.evo-composer form .evo-send{border-radius:50%;background:#497bad;color:#fff}.evo-command-pills{display:flex;gap:8px;justify-content:center;margin-top:15px}.evo-command-pills button{font-size:11px;padding:5px 13px;border-color:#284258;background:#101b28}.evo-tools{display:flex;gap:8px;padding-bottom:15px;flex-wrap:wrap}.evo-tools button{font-size:12px}.evo-bottom-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-top:20px}.evo-bottom-actions button{padding:18px 13px;display:flex;flex-direction:column;align-items:center;gap:10px;min-height:105px;background:linear-gradient(150deg,#11263c,#09131e);border-color:#2c577d}.evo-bottom-actions strong{font:10px Orbitron,sans-serif;letter-spacing:.7px}.evo-bottom-actions small{font-size:11px;color:#839fb6}.evo-bottom-actions svg{color:#77bded}.evo-mobile-quick,.evo-mobile-nav{display:none}.evo-notice{display:flex;gap:9px;align-items:center;padding:12px;border:1px solid #43779d;background:#10293e;border-radius:8px;font-size:13px;margin-bottom:15px}.evo-notice>span{flex:1}.evo-notice button{padding:3px;background:transparent;border:0}.evo-two-column{display:grid;grid-template-columns:1fr 1fr;gap:20px}.evo-panel{padding:23px;min-width:0}.evo-panel h2{font-size:24px;margin:12px 0;font-weight:500}.evo-panel h3{font-size:17px;margin:16px 0}.evo-panel p{font-size:14px;line-height:1.6}.evo-muted{color:#8ca7bd;font-size:13px!important;line-height:1.65}.evo-form{display:grid;gap:16px;margin-top:20px}.evo-workspace label{display:flex;flex-direction:column;gap:7px;font-size:12px;color:#afc6db}.evo-workspace label input,.evo-workspace label select{width:100%;min-width:0;background:#07121e;border:1px solid #2d5274;color:#dfecff;border-radius:6px;padding:11px;font:14px Rajdhani,sans-serif;color-scheme:dark}.evo-form-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.evo-workspace .evo-primary{background:linear-gradient(#286091,#20466c);border-color:#508cbd;display:flex;justify-content:center;align-items:center;gap:8px}.evo-preview-cycle{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:20px 0}.evo-preview-cycle>div{border:1px solid #315f85;border-radius:5px;padding:7px;text-align:center;font-size:11px}.evo-preview-cycle small{display:block;font-size:10px;margin-bottom:4px}.evo-preview-cycle .work{background:#173e60;color:#a7d8ff}.evo-preview-cycle .off{border-color:#234238;background:#0b211b;color:#7cbaa4}.evo-workspace .evo-check{display:flex;flex-direction:row;align-items:start;gap:10px;line-height:1.6;padding:12px;background:#42331b;border-radius:6px;color:#f1ce8a}.evo-check input{width:17px!important;flex:0 0 17px;margin-top:3px}.evo-preview-list{max-height:280px;overflow:auto;margin:15px 0}.evo-preview-list>div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #1b3852;font-size:12px}.evo-preview-list small{display:block;color:#6f91ab;font-size:11px;margin-top:4px}.evo-button-row{display:flex;gap:9px;flex-wrap:wrap}.evo-saved-routine{border:1px solid #244765;padding:14px;border-radius:7px;margin-top:12px}.evo-saved-routine strong,.evo-saved-routine small{display:block}.evo-saved-routine small{font-size:12px;color:#91abc1;margin:7px 0 13px}.evo-saved-routine button{font-size:12px}.evo-confirm{padding:14px;margin-top:15px;border:1px solid #8e7249;border-radius:6px;background:#382d1e}.evo-confirm button{margin:5px 6px 0 0;font-size:12px}.evo-calendar-controls{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:17px}.evo-calendar-controls>div{display:flex;align-items:center;gap:6px}.evo-calendar-controls h2{font-size:18px;margin:0 7px}.evo-calendar-controls button{font-size:12px;padding:7px 9px;text-transform:capitalize}.evo-calendar-controls button[aria-pressed=true]{background:#285276}.evo-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.evo-weekday{text-align:center;font-size:11px;color:#7ca2be;padding:7px 0}.evo-workspace .evo-day{padding:9px 6px;min-height:100px;text-align:left;background:#081624;border-color:#203d58;overflow:hidden}.evo-day>span{font-size:12px;display:block;margin-bottom:6px}.evo-workspace .evo-day.today{border-color:#73bded;background:#112d46}.evo-day.outside{opacity:.45}.evo-event{background:#173d5e;border-left:2px solid #5daae0;border-radius:2px;margin:5px 0;padding:4px;font-size:10px}.evo-event time{display:block;color:#86b9df;font-size:9px}.evo-event>span{display:block;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.evo-day small{font-size:9px;color:#8daeca}.evo-calendar.day{grid-template-columns:1fr}.evo-calendar.day .evo-day{min-height:180px;padding:18px}.evo-calendar.day .evo-event{display:flex;gap:18px;padding:10px;font-size:14px}.evo-calendar.day .evo-event time{font-size:13px}.evo-calendar.week .evo-day{min-height:230px}.evo-inline-task{padding:14px;border:1px solid #487da6;margin-top:12px;border-radius:6px;display:grid;gap:10px;overflow:auto}.evo-inline-task>div{display:flex;gap:8px}.evo-goal{border-bottom:1px solid #254563;padding:16px 0}.evo-goal strong,.evo-goal small{display:block}.evo-goal small{color:#8ba7bf;font-size:11px;margin-top:5px}.evo-goal progress{width:100%;height:7px;accent-color:#6fb8ed;margin:12px 0}.evo-goal>div{display:flex;justify-content:space-between;align-items:center;font-size:12px}.evo-goal button{font-size:12px;padding:6px 10px}.evo-workspace hr{border:0;border-top:1px solid #284864;margin:25px 0}.evo-workspace .evo-habit{width:100%;display:flex;gap:10px;align-items:center;margin-top:8px;text-align:left;font-size:14px}.evo-habit small{margin-left:auto;font-size:10px;white-space:nowrap}.evo-habit.complete{border-color:#3f8471;background:#123b30;color:#a2e2c9}
@media(min-width:1500px){.evo-workspace{padding:25px max(35px,calc((100vw - 1550px)/2))}.evo-conversation{min-height:560px}.evo-hero{min-height:560px}.evo-orb{width:400px}}
@media(max-width:1050px) and (min-width:768px){.evo-header nav{gap:12px}.evo-header nav a{display:none}.evo-body{grid-template-columns:160px 1fr;gap:13px}.evo-side{padding:20px 10px}.evo-chat-layout{grid-template-columns:1fr}.evo-hero{grid-row:1;min-height:300px}.evo-orb{width:220px}.evo-conversation{min-height:250px}.evo-hero h2{font-size:20px}.evo-two-column{grid-template-columns:1fr}}
@media(max-width:767px){.evo-workspace{padding:0 13px calc(100px + env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% 30%,#0c213b70,transparent 60%),#050b13;min-height:100dvh}.evo-header{border:0;border-bottom:1px solid #263e54;border-radius:0;background:transparent;box-shadow:none;height:85px;padding:12px 0;gap:8px}.evo-header:before,.evo-header:after{display:none}.evo-brand{gap:6px}.evo-brand img{width:45px;height:47px}.evo-brand span{font-size:13px;letter-spacing:1.2px}.evo-brand small{font-size:5.5px;letter-spacing:1px}.evo-header nav{display:none}.evo-head-status strong{font-size:19px;letter-spacing:3px}.evo-head-status small{font-size:8px;max-width:95px;line-height:1.3}.evo-mobile-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:17px 0 10px}.evo-mobile-quick button{font-size:11px;line-height:1.2;min-height:73px;padding:8px 2px;background:linear-gradient(145deg,#1a3147,#0b1724);border-color:#3c5a75;box-shadow:inset 0 0 12px #7badcd12}.evo-mobile-quick svg{display:block;margin:0 auto 7px;width:20px;height:20px;color:#c7dff3}.evo-body{display:block;margin-top:0}.evo-side{display:none}.evo-view-tabs{display:flex;gap:5px;justify-content:center;margin:12px 0}.evo-view-tabs button{font-size:11px;padding:5px 13px;border-color:#223e57;background:transparent;text-transform:capitalize}.evo-view-tabs button[aria-pressed=true]{background:#17344e;border-color:#40749a}.evo-chat-layout{display:flex;flex-direction:column;gap:14px}.evo-chat-layout:not(.has-history) .evo-conversation{display:none}.evo-hero{min-height:350px;order:0;padding:10px 0 16px;overflow:visible}.evo-orb{width:255px;max-width:85vw}.evo-hero h2{font-size:24px;margin:16px 0 10px}.evo-hero>p{font-size:10px;letter-spacing:3px}.evo-hero-line{margin:18px 0 7px;width:78%}.evo-hero>small{font-size:9px}.evo-conversation{order:1;min-height:0;max-height:420px;padding:14px}.has-history .evo-hero{min-height:0;padding:0}.has-history .evo-orb{width:125px}.has-history .evo-hero h2{font-size:15px;letter-spacing:4px;margin:6px 0}.has-history .evo-hero>p,.has-history .evo-hero-line,.has-history .evo-hero>small{display:none}.evo-composer{order:2;padding:10px 11px;border-radius:10px}.evo-composer form{gap:7px}.evo-composer form>input{font-size:14px;padding:8px 0}.evo-composer form>button{padding:7px}.evo-command-pills{display:none}.evo-message p{font-size:13px}.evo-section-title{font-size:10px;padding-bottom:12px;margin-bottom:14px}.evo-section-title small{font-size:9px}.evo-bottom-actions{display:none}.evo-mobile-nav{position:fixed;z-index:50;bottom:0;left:0;right:0;display:flex;justify-content:space-around;align-items:center;height:calc(72px + env(safe-area-inset-bottom));padding:5px 8px calc(5px + env(safe-area-inset-bottom));background:#07121ef5;border-top:1px solid #294c6c;backdrop-filter:blur(14px)}.evo-mobile-nav a,.evo-mobile-nav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:0;background:none;width:58px;height:55px;padding:4px;color:#8da8c0;font-size:10px}.evo-mobile-nav [aria-current=page]{color:#91caff}.evo-mobile-nav svg{width:21px;height:21px}.evo-mobile-nav .evo-nav-bonsai{width:70px;height:65px;margin-top:-15px;border:1px solid #417eae;border-radius:50%;background:radial-gradient(#174f7c,#071725);box-shadow:0 0 15px #2e88c83a}.evo-nav-bonsai img{width:57px;height:54px;object-fit:contain}.evo-two-column{display:flex;flex-direction:column;gap:14px}.evo-panel{padding:17px}.evo-panel h2{font-size:21px}.evo-form{gap:14px}.evo-workspace label input,.evo-workspace label select{font-size:16px;padding:10px 8px;min-height:42px}.evo-calendar-controls{gap:12px}.evo-calendar-controls h2{font-size:16px;margin:0 3px}.evo-calendar-controls>div:last-child{width:100%;justify-content:center}.evo-calendar{gap:3px}.evo-workspace .evo-day{min-height:69px;padding:6px 3px}.evo-day>span{font-size:11px}.evo-event{font-size:8px;padding:2px;margin:3px 0}.evo-event time{font-size:7px}.evo-calendar.week{grid-template-columns:1fr}.evo-calendar.week .evo-weekday{display:none}.evo-calendar.week .evo-day{min-height:80px;padding:12px}.evo-calendar.week .evo-event{font-size:12px}.evo-calendar.week .evo-event time{font-size:10px}.evo-calendar.day .evo-event{font-size:12px;gap:10px}.evo-calendar.day .evo-event>span{white-space:normal}.evo-preview-cycle{gap:5px}.evo-preview-cycle>div{font-size:10px;padding:6px}.evo-notice{font-size:12px}.evo-button-row{flex-direction:column}.evo-workspace .evo-habit{font-size:13px}.evo-habit small{font-size:9px}.evo-tools button{font-size:11px;padding:7px}}
@media(max-width:767px) and (max-height:760px){.evo-hero{min-height:285px;padding:2px 0 8px}.evo-orb{width:205px}.evo-hero h2{font-size:21px;margin:9px 0 7px}.evo-hero-line{margin:12px 0 7px}.evo-mobile-quick{margin-top:12px}.evo-mobile-quick button{min-height:67px}.evo-view-tabs{margin:9px 0}.evo-header{height:77px}}
@media(prefers-reduced-motion:reduce){.evo-workspace *{scroll-behavior:auto!important;transition:none!important}}
`;
