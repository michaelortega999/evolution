import { useState as useWFState, useEffect as useWFEffect } from "react";
import type { CSSProperties as WFCSSProperties } from "react";
import {
  Activity as WFActivity,
  Dumbbell as WFFitness,
  Wallet as WFWealth,
  ChartNoAxesCombined as WFInvesting,
  BriefcaseBusiness as WFBusiness,
  Focus as WFFocus,
  Apple as WFNutrition,
  BookOpen as WFJournal,
  NotebookPen as WFNotes,
  CalendarDays as WFCalendar,
  Target as WFGoals,
  Gamepad2 as WFHobby,
  Plane as WFTravel,
  Search as WFSearch,
  SlidersHorizontal as WFSliders,
  ArrowRight as WFArrow,
  ArrowUpRight as WFOpen,
  RotateCcw as WFReset,
  Network as WFNetwork,
  Check as WFCheck,
  Eye as WFEye,
  Plug as WFPlug,
} from "lucide-react";
import {
  useEvolutionData as useWFData,
  useCloudStatus as useWFCloud,
  type EvolutionData as WFData,
} from "@/lib/evolution-data";

export type WFCategory =
  | "Fitness"
  | "Wealth"
  | "Investing"
  | "Business"
  | "Focus"
  | "Nutrition"
  | "Journal"
  | "Notes"
  | "Calendar"
  | "Goals"
  | "Hobby"
  | "Travel";
export type WFAppearance = {
  color: "blue" | "red" | "green" | "purple" | "pink" | "orange";
  design: "classic" | "rings" | "neural" | "hex" | "gyro" | "dots";
  size: number;
  lineWeight: number;
  motion: number;
};
export const WF_DEFAULTS: WFAppearance = {
  color: "blue",
  design: "classic",
  size: 100,
  lineWeight: 1.5,
  motion: 35,
};
export const WF_COLORS = [
  { id: "blue", name: "Blue", hex: "#42c9ff" },
  { id: "red", name: "Red", hex: "#ff6577" },
  { id: "green", name: "Dark Green", hex: "#27b58c" },
  { id: "purple", name: "Dark Purple", hex: "#a273ee" },
  { id: "pink", name: "Dark Pink", hex: "#d04d9a" },
  { id: "orange", name: "Dark Orange", hex: "#d78338" },
] as const;
export const WF_DESIGNS = [
  { id: "classic", name: "Classic Orbit" },
  { id: "rings", name: "Orbital Rings" },
  { id: "neural", name: "Neural Links" },
  { id: "hex", name: "Hex Circuit" },
  { id: "gyro", name: "Gyroscope" },
  { id: "dots", name: "Minimal Dots" },
] as const;
export function normalizeWorkflowAppearance(value: unknown): WFAppearance {
  const v = value && typeof value === "object" ? (value as Partial<WFAppearance>) : {};
  const bound = (n: unknown, min: number, max: number, fallback: number) =>
    typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  return {
    color: WF_COLORS.some((c) => c.id === v.color) ? v.color! : WF_DEFAULTS.color,
    design: WF_DESIGNS.some((d) => d.id === v.design) ? v.design! : WF_DEFAULTS.design,
    size: bound(v.size, 70, 130, 100),
    lineWeight: bound(v.lineWeight, 1, 3, 1.5),
    motion: bound(v.motion, 0, 100, 35),
  };
}
type WFDefinition = {
  name: WFCategory;
  icon: typeof WFBusiness;
  route: string;
  subtitle: string;
  steps: string[];
  apps: string[];
  sources: [keyof WFData, string][];
  tool: "chat" | "routines" | "calendar" | "goals";
};
export const WF_DOMAINS: WFDefinition[] = [
  {
    name: "Business",
    icon: WFBusiness,
    route: "/business",
    subtitle: "From an idea to a reviewed next step.",
    steps: ["Capture brief", "Plan project", "Review work", "Schedule next step"],
    apps: ["Docs", "Content tools"],
    sources: [
      ["projects", "Projects"],
      ["bizTasks", "Business tasks"],
      ["revenue", "Revenue records"],
    ],
    tool: "chat",
  },
  {
    name: "Investing",
    icon: WFInvesting,
    route: "/investing",
    subtitle: "Research, prepare and review your own process.",
    steps: ["Research thesis", "Review strategy", "Log decision", "Reflect"],
    apps: ["TradingView", "Market feeds"],
    sources: [
      ["strategies", "Strategies"],
      ["trades", "Trade records"],
      ["watchlist", "Watchlist items"],
      ["tradingAccounts", "Trading accounts"],
      ["tradingTxns", "Ledger records"],
      ["tradeJournal", "Trade journal records"],
    ],
    tool: "chat",
  },
  {
    name: "Goals",
    icon: WFGoals,
    route: "/goals",
    subtitle: "Turn a direction into a repeatable practice.",
    steps: ["Define outcome", "Choose habit", "Plan time", "Review progress"],
    apps: ["Habit services", "Reminders"],
    sources: [
      ["goals", "Goals"],
      ["customHabits", "Custom habits"],
      ["timeLogs", "Time logs"],
    ],
    tool: "goals",
  },
  {
    name: "Fitness",
    icon: WFFitness,
    route: "/fitness",
    subtitle: "Plan your training, then record what you did.",
    steps: ["Plan session", "Train", "Log workout", "Review recovery"],
    apps: ["Strava", "Wearables"],
    sources: [
      ["workouts", "Workout records"],
      ["prHistory", "PR records"],
      ["recovery", "Recovery entries"],
      ["trainingSchedule", "Training slots"],
    ],
    tool: "routines",
  },
  {
    name: "Nutrition",
    icon: WFNutrition,
    route: "/nutrition",
    subtitle: "Build a deliberate daily food routine.",
    steps: ["Plan meals", "Prepare groceries", "Log meals", "Review day"],
    apps: ["Food services", "Nutrition apps"],
    sources: [
      ["mealLogs", "Meal logs"],
      ["grocery", "Grocery items"],
      ["water", "Water entries"],
    ],
    tool: "routines",
  },
  {
    name: "Notes",
    icon: WFNotes,
    route: "/notes",
    subtitle: "Capture a thought and give it a next step.",
    steps: ["Capture note", "Organize", "Choose action", "Review"],
    apps: ["Notion", "Obsidian"],
    sources: [
      ["richNotes", "Rich notes"],
      ["evoTasks", "Tasks"],
    ],
    tool: "chat",
  },
  {
    name: "Journal",
    icon: WFJournal,
    route: "/journal",
    subtitle: "A space to reflect without automated interpretation.",
    steps: ["Recall day", "Write entry", "Reflect", "Set intention"],
    apps: ["Writing tools", "External journals"],
    sources: [
      ["journalEntries", "Journal entries"],
      ["reflections", "Reflections"],
    ],
    tool: "chat",
  },
  {
    name: "Focus",
    icon: WFFocus,
    route: "/focus",
    subtitle: "Protect a block of attention for meaningful work.",
    steps: ["Choose intention", "Start timer", "Take break", "Review session"],
    apps: ["Focus apps", "External timers"],
    sources: [["focusSessions", "Focus sessions"]],
    tool: "routines",
  },
  {
    name: "Hobby",
    icon: WFHobby,
    route: "/hobby",
    subtitle: "Make room for practice, projects and enjoyment.",
    steps: ["Choose project", "Plan practice", "Record session", "Explore next"],
    apps: ["Creative tools", "Community apps"],
    sources: [
      ["guitarSessions", "Guitar sessions"],
      ["customHobbies", "Custom hobbies"],
      ["carEvents", "Saved car events"],
      ["cars", "Cars"],
      ["carExpenses", "Car expense records"],
      ["guitarSongs", "Guitar songs"],
      ["guitarSkills", "Guitar skills"],
    ],
    tool: "calendar",
  },
  {
    name: "Calendar",
    icon: WFCalendar,
    route: "/calendar",
    subtitle: "Give your plans a real place in your day.",
    steps: ["Choose date", "Draft schedule", "Review conflicts", "Save explicitly"],
    apps: ["Google Calendar", "Outlook"],
    sources: [
      ["calendar", "Calendar events"],
      ["assistantRoutines", "Saved routines"],
    ],
    tool: "calendar",
  },
  {
    name: "Travel",
    icon: WFTravel,
    route: "/hobby",
    subtitle: "Organize a journey without booking automatically.",
    steps: ["Choose destination", "Plan itinerary", "Prepare packing", "Review trip"],
    apps: ["Flights", "Hotel services"],
    sources: [["trips", "Trips"]],
    tool: "calendar",
  },
  {
    name: "Wealth",
    icon: WFWealth,
    route: "/wealth",
    subtitle: "Review your manually tracked financial picture.",
    steps: ["Gather records", "Categorize", "Review plan", "Set next action"],
    apps: ["Spreadsheets", "Finance tools"],
    sources: [
      ["assets", "Asset records"],
      ["transactions", "Transaction records"],
      ["netWorthSnapshots", "Manual snapshots"],
    ],
    tool: "goals",
  },
];
export type WFDomainSummary = {
  name: WFCategory;
  total: number;
  metrics: { label: string; count: number }[];
  recent: { key: string; kind: string; date: string }[];
};
export function workflowDomainSummaries(data: WFData): WFDomainSummary[] {
  return WF_DOMAINS.map((domain) => {
    const recent: WFDomainSummary["recent"] = [];
    const metrics = domain.sources.map(([key, label]) => {
      const raw: unknown = data[key];
      const records = Array.isArray(raw)
        ? (raw as unknown[]).filter((record) => {
            if (!record || typeof record !== "object") return false;
            const r = record as Record<string, unknown>;
            return !(key === "carEvents" && r.seed === true) && !(key === "assistantRoutines" && r.archived === true);
          })
        : [];
      records.forEach((record, index) => {
        const r = record as Record<string, unknown>;
        const date = [r.date, r.startDate, r.createdAt, r.due, r.deadline].find(
          (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d),
        );
        if (date)
          recent.push({
            key: `${String(key)}:${typeof r.id === "string" ? r.id : index}`,
            kind: label,
            date: String(date).slice(0, 10),
          });
      });
      return { label, count: records.length };
    });
    return {
      name: domain.name,
      total: metrics.reduce((sum, m) => sum + m.count, 0),
      metrics,
      recent: recent.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    };
  });
}
export function WorkflowAtom({ appearance, small = false }: { appearance: WFAppearance; small?: boolean }) {
  const d = appearance.design;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return [50 + 36 * Math.cos(a), 50 + 36 * Math.sin(a)];
  });
  return (
    <svg
      className={`wf-atom wf-atom-${d}${small ? " wf-atom-small" : ""}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
      data-design={d}
      style={
        {
          "--wf-weight": appearance.lineWeight,
          "--wf-size": appearance.size / 100,
          "--wf-speed": `${36 - appearance.motion * 0.26}s`,
          animationPlayState: appearance.motion === 0 ? "paused" : "running",
        } as WFCSSProperties
      }
    >
      {d === "classic" && (
        <g className="wf-orbits">
          {[0, 60, 120].map((a) => (
            <ellipse key={a} cx="50" cy="50" rx="39" ry="16" transform={`rotate(${a} 50 50)`} />
          ))}
        </g>
      )}
      {d === "rings" && (
        <g className="wf-orbits">
          <circle cx="50" cy="50" r="18" />
          <circle cx="50" cy="50" r="29" />
          <circle cx="50" cy="50" r="40" />
        </g>
      )}
      {d === "neural" && (
        <g className="wf-orbits">
          {pts.map(([x, y], i) => (
            <path key={i} d={`M50 50 Q${50 + (x - 50) * 0.2} ${y} ${x} ${y}`} />
          ))}
        </g>
      )}
      {d === "hex" && (
        <g className="wf-orbits">
          <polygon points={pts.map((p) => p.join(",")).join(" ")} />
          {pts.map(([x, y], i) => (
            <path key={i} d={`M50 50 L${x} ${y}`} />
          ))}
          {pts.map(([x, y], i) => (
            <polygon
              key={`h${i}`}
              points={Array.from(
                { length: 6 },
                (_, n) => `${x + 5 * Math.cos((n * Math.PI) / 3)},${y + 5 * Math.sin((n * Math.PI) / 3)}`,
              ).join(" ")}
            />
          ))}
        </g>
      )}
      {d === "gyro" && (
        <g className="wf-orbits">
          <ellipse cx="50" cy="50" rx="40" ry="23" transform="rotate(-22 50 50)" />
          <ellipse cx="50" cy="50" rx="40" ry="23" transform="rotate(70 50 50)" />
          <path d="M50 8 L50 92 M8 50 L92 50" strokeDasharray="2 5" />
        </g>
      )}
      {d === "dots" && (
        <g className="wf-orbits">
          {pts
            .filter((_, i) => i !== 3)
            .map(([x, y], i) => (
              <path key={i} d={`M50 50 L${x} ${y}`} />
            ))}
        </g>
      )}
      <circle className="wf-atom-core" cx="50" cy="50" r={d === "dots" ? 10 : 13} />
      <g className="wf-orbits wf-electrons">
        {(d === "rings"
          ? [
              [50, 10],
              [79, 50],
              [50, 79],
              [32, 50],
            ]
          : d === "dots"
            ? pts.filter((_, i) => i !== 3)
            : pts
        ).map(([x, y], i) => (
          <circle className="wf-electron" key={i} cx={x} cy={y} r={d === "dots" ? 4 : 3.5} />
        ))}
      </g>
    </svg>
  );
}

export function AIWorkflowDashboard({
  onOpenTool,
  ready,
}: {
  onOpenTool: (view: "chat" | "routines" | "calendar" | "goals") => void;
  ready: boolean;
}) {
  const { data, mutate } = useWFData();
  const cloud = useWFCloud();
  const allowed = ready && cloud !== "loading" && cloud !== "signed-out";
  const [view, setRawView] = useWFState<"graph" | "connections" | "activity" | "customize">("graph");
  const [selected, setRawSelected] = useWFState<WFCategory>("Business");
  const [query, setQuery] = useWFState("");
  const [filter, setFilter] = useWFState("All");
  const setView = (next: "graph" | "connections" | "activity" | "customize") => {
    if (next === view) return;
    setRawView(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.pushState({}, "", url);
    }
  };
  const setSelected = (next: WFCategory) => {
    if (next === selected) return;
    setRawSelected(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("topic", next.toLowerCase());
      window.history.pushState({}, "", url);
    }
  };
  useWFEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const nextView = params.get("view");
      setRawView(
        nextView === "customize" || nextView === "connections" || nextView === "activity" ? nextView : "graph",
      );
      const topic = WF_DOMAINS.find((d) => d.name.toLowerCase() === params.get("topic"));
      setRawSelected(topic?.name || "Business");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const appearance = normalizeWorkflowAppearance(allowed ? data.settings.workflowAppearance : undefined);
  const color = WF_COLORS.find((c) => c.id === appearance.color)!.hex;
  const summaries = allowed ? workflowDomainSummaries(data) : [];
  const domain = WF_DOMAINS.find((d) => d.name === selected)!;
  const summary = summaries.find((d) => d.name === selected);
  const updateAppearance = (patch: Partial<WFAppearance>) => {
    if (!allowed) return;
    mutate((prev) => ({
      settings: {
        ...prev.settings,
        workflowAppearance: {
          ...normalizeWorkflowAppearance(prev.settings.workflowAppearance),
          ...patch,
        },
      },
    }));
  };
  const visible = (name: WFCategory) =>
    (filter === "All" || filter === name) && name.toLowerCase().includes(query.trim().toLowerCase());
  const filtered = WF_DOMAINS.filter((d) => visible(d.name));
  const select = (name: WFCategory) => {
    if (allowed) setSelected(name);
  };
  const paletteStyle = {
    "--wf-color": color,
    "--wf-faint": `${color}18`,
    "--wf-line": `${color}55`,
  } as WFCSSProperties;
  const graph = (preview = false) => (
    <div
      className={`wf-universe${preview ? " wf-mini" : ""}`}
      aria-label={preview ? "Appearance live preview" : "Twelve category workflow map"}
    >
      <div className="wf-axis wf-axis-top">
        COMPLEX <span>↑</span>
      </div>
      <div className="wf-axis wf-axis-bottom">
        <span>↓</span> SIMPLE
      </div>
      <svg className="wf-oval" viewBox="0 0 1000 850" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="500" cy="425" rx="420" ry="343" />
        {WF_DOMAINS.map((d, i) => {
          const a = ((-105 + i * 30) * Math.PI) / 180;
          return <circle key={d.name} cx={500 + 420 * Math.cos(a)} cy={425 + 343 * Math.sin(a)} r="3" />;
        })}
      </svg>
      {WF_DOMAINS.map((d, i) => {
        const a = ((-105 + i * 30) * Math.PI) / 180;
        const show = preview || visible(d.name);
        const Icon = d.icon;
        return (
          <button
            type="button"
            key={d.name}
            className={`wf-category${selected === d.name ? " is-selected" : ""}${show ? "" : " is-filtered"}`}
            aria-pressed={selected === d.name}
            aria-label={`Select ${d.name} workflow`}
            disabled={!allowed || !show}
            onClick={() => select(d.name)}
            style={{ left: `${50 + 42 * Math.cos(a)}%`, top: `${50 + 40 * Math.sin(a)}%` }}
          >
            <span className="wf-atom-wrap">
              <WorkflowAtom appearance={appearance} />
              <Icon className="wf-category-icon" size={21} />
            </span>
            <strong>{d.name}</strong>
            {!preview && (
              <small>{allowed ? `${summaries.find((s) => s.name === d.name)?.total ?? 0} records` : "Loading"}</small>
            )}
          </button>
        );
      })}
      {preview ? (
        <div className="wf-preview-center">
          <WFNetwork size={36} />
          <strong>{WF_DESIGNS.find((d) => d.id === appearance.design)?.name}</strong>
          <span>12 categories · your visual style</span>
          <small>Appearance preview · no data changes</small>
        </div>
      ) : (
        <div className="wf-center">{panel()}</div>
      )}
      <span className="wf-map-legend">Category arrangement · not live connections</span>
    </div>
  );
  const panel = () => (
    <section className="wf-topic hud-card" aria-label={`${selected} workflow details`}>
      <div className="wf-topic-title">
        <h2>{selected.toUpperCase()} WORKFLOW</h2>
        <span>MANUAL PLAN</span>
      </div>
      <p className="wf-subtitle">{domain.subtitle}</p>
      <div className="wf-topic-box">
        <h3>
          YOUR WORKFLOW <small>Suggested steps · not automation</small>
        </h3>
        <div className="wf-flow">
          {domain.steps.map((step, i) => (
            <div className="wf-flow-part" key={step}>
              <span>
                <domain.icon size={15} />
                {step}
              </span>
              {i < domain.steps.length - 1 && <WFArrow size={14} />}
            </div>
          ))}
        </div>
      </div>
      <div className="wf-topic-columns">
        <div className="wf-topic-box">
          <h3>
            DATED RECORDS <small>Latest record dates</small>
          </h3>
          {summary?.recent.length ? (
            <ul className="wf-recent">
              {summary.recent.map((r) => (
                <li key={r.key}>
                  <span>
                    <WFNotes size={13} />
                    {r.kind}
                  </span>
                  <time>{r.date}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="wf-empty-small">
              {allowed ? "No dated records saved yet." : "Account data is not available yet."}
            </p>
          )}
        </div>
        <div className="wf-topic-box">
          <h3>{selected.toUpperCase()} RECORDS</h3>
          <div className="wf-mini-chart" aria-label="Saved record counts">
            {summary?.metrics.map((m) => (
              <div key={m.label}>
                <span className="wf-bar-track">
                  <i
                    style={{
                      height: `${m.count ? Math.max(7, (m.count / Math.max(...summary.metrics.map((x) => x.count), 1)) * 100) : 0}%`,
                    }}
                  />
                </span>
                <strong>{m.count}</strong>
                <small>{m.label}</small>
              </div>
            ))}
          </div>
          {summary?.total === 0 && <p className="wf-zero">No saved records. Nothing has been seeded.</p>}
        </div>
      </div>
      <div className="wf-topic-box wf-apps">
        <h3>
          EXTERNAL APPS <small>Not connected to this workflow</small>
        </h3>
        {domain.apps.map((app) => (
          <span key={app}>
            <WFPlug size={13} />
            {app}
            <small>Unavailable</small>
          </span>
        ))}
      </div>
      <div className="wf-topic-actions">
        <a href={domain.route}>
          Open {selected} <WFOpen size={14} />
        </a>
        <button disabled={!allowed} onClick={() => onOpenTool(domain.tool)}>
          Plan next step <WFArrow size={14} />
        </button>
      </div>
    </section>
  );
  return (
    <section
      className={`wf-app${view === "customize" ? " wf-customizing" : ""}`}
      style={paletteStyle}
      aria-label="AI Workflow"
    >
      <style>{WF_CSS}</style>
      <header className="wf-head hud-card p-4 md:p-5">
        <div className="wf-head-row">
          <div>
            <h1>{view === "customize" ? "CUSTOMIZE AI WORKFLOW" : "AI WORKFLOW"}</h1>
            <p>{view === "customize" ? "Colors and atom designs." : "Your Evolution data. One connected view."}</p>
          </div>
          <button
            className="wf-primary"
            disabled={!allowed}
            onClick={() => setView(view === "customize" ? "graph" : "customize")}
          >
            {view === "customize" ? <WFNetwork size={16} /> : <WFSliders size={16} />}{" "}
            {view === "customize" ? "Back to workflow" : "Customize"}
          </button>
        </div>
      </header>
      <nav className="wf-nav" aria-label="Workflow views">
        {(["graph", "connections", "activity"] as const).map((v) => (
          <button key={v} aria-current={view === v ? "page" : undefined} onClick={() => setView(v)}>
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
        <label className="wf-search">
          <WFSearch size={16} />
          <input
            aria-label="Search workflow categories"
            placeholder="Search categories…"
            disabled={!allowed}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </nav>
      {!allowed ? (
        <div role="status" className="wf-locked">
          <WFNetwork size={40} />
          <h2>{cloud === "signed-out" ? "Sign in to view your workspace" : "Loading your workspace…"}</h2>
          <p>Your data stays hidden until the account is ready.</p>
        </div>
      ) : view === "customize" ? (
        <div className="wf-custom-grid">
          <section className="wf-custom-preview hud-card">
            <div className="wf-panel-title">
              <h2>LIVE PREVIEW</h2>
              <span>Oval 12-category layout</span>
            </div>
            {graph(true)}
            <p className="wf-footnote">Appearance only. Your records, plans and connected accounts are unchanged.</p>
          </section>
          <section className="wf-custom-controls">
            <div className="wf-control-panel hud-card">
              <h2>COLOR THEMES</h2>
              <p>Choose your workflow accent.</p>
              <div className="wf-colors">
                {WF_COLORS.map((c) => (
                  <button
                    key={c.id}
                    aria-label={`${c.name} workflow color`}
                    aria-pressed={appearance.color === c.id}
                    onClick={() => updateAppearance({ color: c.id })}
                    style={{ "--swatch": c.hex } as WFCSSProperties}
                  >
                    <span />
                    {appearance.color === c.id && <WFCheck size={12} />}
                    <small>{c.name}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="wf-control-panel hud-card">
              <h2>ATOM DESIGNS</h2>
              <p>Six different structures. One connected workspace.</p>
              <div className="wf-designs">
                {WF_DESIGNS.map((d) => (
                  <button
                    key={d.id}
                    aria-pressed={appearance.design === d.id}
                    onClick={() => updateAppearance({ design: d.id })}
                  >
                    <WorkflowAtom small appearance={{ ...appearance, design: d.id, motion: 0 }} />
                    <span>{d.name}</span>
                    {appearance.design === d.id && <WFCheck size={13} />}
                  </button>
                ))}
              </div>
              <div className="wf-sliders">
                {(
                  [
                    { key: "size", label: "Node size", min: 70, max: 130, step: 1 },
                    { key: "lineWeight", label: "Line weight", min: 1, max: 3, step: 0.1 },
                    { key: "motion", label: "Motion", min: 0, max: 100, step: 1 },
                  ] as const
                ).map((s) => (
                  <label key={s.key}>
                    {s.label}
                    <input
                      aria-label={s.label}
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={appearance[s.key]}
                      onChange={(e) => updateAppearance({ [s.key]: Number(e.target.value) })}
                    />
                    <output>
                      {appearance[s.key]}
                      {s.key === "motion" ? "%" : s.key === "size" ? "%" : "px"}
                    </output>
                  </label>
                ))}
              </div>
              <button className="wf-reset" onClick={() => updateAppearance(WF_DEFAULTS)}>
                <WFReset size={14} /> Reset workflow appearance
              </button>
              <p className="wf-save" role="status">
                {cloud === "saving"
                  ? "Saving appearance…"
                  : cloud === "error"
                    ? "Saved on this device. Account sync unavailable."
                    : "Appearance saves automatically to your account."}
              </p>
              <p className="wf-footnote">Reduced-motion preferences take priority.</p>
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="wf-filters" aria-label="Category filters">
            {["All", ...WF_DOMAINS.map((d) => d.name)].map((name) => (
              <button
                key={name}
                aria-pressed={filter === name}
                onClick={() => {
                  setFilter(name);
                  if (name !== "All") setSelected(name as WFCategory);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          {query && (
            <p className="wf-search-result" role="status">
              {filtered.length} matching categories{" "}
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("All");
                }}
              >
                Clear filters
              </button>
            </p>
          )}
          {view === "graph" ? (
            <>
              <div className="wf-graph-shell hud-card">{graph()}</div>
              <div className="wf-mobile-topic">{panel()}</div>
            </>
          ) : view === "connections" ? (
            <section className="wf-list-panel hud-card">
              <h2>WORKSPACE MAP</h2>
              <p>These are organizational categories, not external integrations or inferred semantic relationships.</p>
              <div className="wf-domain-list">
                {filtered.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      select(d.name);
                      setView("graph");
                    }}
                  >
                    <d.icon size={22} />
                    <strong>{d.name}</strong>
                    <span>{summaries.find((s) => s.name === d.name)?.total ?? 0} saved records</span>
                    <WFOpen size={14} />
                  </button>
                ))}
              </div>
              <p className="wf-footnote">
                Counts are saved records in the named collections, not performance totals. Legacy phone snapshots, bank
                data and built-in suggested car events are excluded.
              </p>
            </section>
          ) : (
            <section className="wf-list-panel hud-card">
              <h2>DATED RECORDS</h2>
              <p>
                Scheduled or logged dates, not save times or an agent-run log. Personal titles, bodies and financial
                amounts stay out of this overview.
              </p>
              <div className="wf-activity-list">
                {summaries
                  .filter((s) => visible(s.name))
                  .flatMap((s) => s.recent.map((r) => ({ ...r, category: s.name })))
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 12)
                  .map((r) => (
                    <button
                      key={`${r.category}:${r.key}`}
                      onClick={() => {
                        select(r.category);
                        setView("graph");
                      }}
                    >
                      <WFActivity size={17} />
                      <strong>{r.category}</strong>
                      <span>{r.kind}</span>
                      <time>{r.date}</time>
                    </button>
                  ))}
              </div>
              {summaries.filter((s) => visible(s.name)).every((s) => s.recent.length === 0) && (
                <p className="wf-empty-small">No dated records to show.</p>
              )}
            </section>
          )}
          <footer className="wf-footer">
            <span>
              <WFEye size={13} /> Privacy-safe overview · record contents are not shown
            </span>
            <span>No autonomous workers or external apps connected here</span>
          </footer>
        </>
      )}
    </section>
  );
}

const WF_CSS = `
.wf-app{--wf-color:#42c9ff;--wf-line:#42c9ff55;--wf-faint:#42c9ff18;color:#d9ecfa;min-width:0;background:radial-gradient(ellipse at 50% 35%,#07364a25,transparent 62%);font-family:Rajdhani,system-ui,sans-serif}.wf-app *{box-sizing:border-box}.wf-app button,.wf-app input{font:inherit}.wf-app button{cursor:pointer}.wf-app button:disabled{cursor:not-allowed;opacity:.45}.wf-app a{color:inherit;text-decoration:none}.wf-app button:focus-visible,.wf-app a:focus-visible,.wf-app input:focus-visible{outline:2px solid var(--wf-color);outline-offset:4px}.wf-brand{display:flex;align-items:center;justify-content:space-between;gap:15px;padding-bottom:15px;border-bottom:1px solid var(--wf-line);margin-bottom:20px}.wf-brand>span{font-size:9px;letter-spacing:.2em;color:#7e9cb1}.wf-head-row{display:flex;justify-content:space-between;align-items:center;gap:14px}.wf-head h1{font-family:Orbitron,system-ui,sans-serif;font-size:clamp(21px,2.7vw,34px);font-weight:500;letter-spacing:.07em;margin:0;color:#e0efff;text-shadow:0 0 18px var(--wf-faint)}.wf-head p{font-size:14px;letter-spacing:.08em;color:#9ed5e8;margin:7px 0 0}.wf-primary{display:inline-flex;gap:8px;align-items:center;justify-content:center;padding:10px 15px;border:1px solid var(--wf-color);border-radius:4px;background:linear-gradient(145deg,var(--wf-faint),#071529);color:#d4efff;font-size:12px;box-shadow:inset 0 0 15px var(--wf-faint),0 0 12px var(--wf-faint);white-space:nowrap}.wf-nav{display:flex;align-items:center;gap:2px;margin-top:23px;border-bottom:1px solid var(--wf-line);padding-bottom:14px}.wf-nav>button{background:#041322;border:1px solid #22465d;color:#a4bed0;padding:9px 18px;font-size:12px}.wf-nav>button:first-child{border-radius:5px 0 0 5px}.wf-nav>button:nth-child(3){border-radius:0 5px 5px 0}.wf-nav>button[aria-current=page]{border-color:var(--wf-color);color:#dff6ff;box-shadow:inset 0 0 16px var(--wf-faint),0 0 10px var(--wf-faint)}.wf-search{display:flex;align-items:center;gap:9px;color:#96cce9;background:#020c15;border:1px solid var(--wf-line);padding:9px 12px;border-radius:5px;margin-left:auto;min-width:160px;width:32%;max-width:300px}.wf-search input{min-width:0;width:100%;color:#dfedf8;border:none;outline:none;background:transparent;font-size:11px}.wf-search input::placeholder{color:#83a3bc}.wf-filters{display:flex;flex-wrap:wrap;gap:5px;padding:13px 0 3px}.wf-filters button{border:1px solid #193f55;background:#030f1b;color:#94b4ca;border-radius:4px;padding:6px 9px;font-size:10px}.wf-filters button[aria-pressed=true]{border-color:var(--wf-color);color:#cff1ff;background:var(--wf-faint)}.wf-graph-shell{margin-top:4px;position:relative;border:1px solid #1d4d6544;border-radius:8px;background-image:linear-gradient(#17446011 1px,transparent 1px),linear-gradient(90deg,#17446011 1px,transparent 1px);background-size:24px 24px;overflow:hidden}.wf-universe{position:relative;width:100%;aspect-ratio:1.16;min-height:750px;isolation:isolate}.wf-oval{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}.wf-oval ellipse{fill:none;stroke:var(--wf-color);stroke-width:.8;opacity:.4}.wf-oval circle{fill:var(--wf-color);filter:drop-shadow(0 0 4px var(--wf-color));opacity:.8}.wf-axis{position:absolute;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:.2em;text-align:center;color:#8bb4cb;z-index:1}.wf-axis span{font-size:20px;color:var(--wf-color);display:block;line-height:1.1}.wf-axis-top{top:9px}.wf-axis-bottom{bottom:12px}.wf-category{position:absolute;z-index:2;transform:translate(-50%,-50%);border:0;background:transparent;padding:0;color:#c5dfed;width:102px;display:flex;flex-direction:column;align-items:center;transition:opacity .2s,filter .2s}.wf-category.is-filtered{opacity:.09!important;pointer-events:none}.wf-category.is-selected{color:#fff;filter:drop-shadow(0 0 5px var(--wf-faint))}.wf-category strong{font-size:12px;font-weight:500;text-shadow:0 0 10px #000;line-height:1.4;white-space:nowrap}.wf-category small{font-size:9px;color:#7095ad;margin-top:1px;white-space:nowrap}.wf-atom-wrap{position:relative;width:83px;height:83px;display:grid;place-items:center}.wf-category-icon{position:absolute;inset:0;margin:auto;color:var(--wf-color);filter:drop-shadow(0 0 3px var(--wf-color));pointer-events:none;width:19px;height:19px}.wf-atom{color:var(--wf-color);width:100%;height:100%;overflow:visible;transform:scale(var(--wf-size,1));filter:drop-shadow(0 0 3px var(--wf-faint))}.wf-orbits{stroke:currentColor;stroke-width:var(--wf-weight,1.5);fill:none;transform-origin:50px 50px;animation:wf-orbit-spin var(--wf-speed,26s) linear infinite;animation-play-state:inherit}.wf-atom-core{fill:#051626;stroke:currentColor;stroke-width:var(--wf-weight,1.5);filter:drop-shadow(0 0 4px var(--wf-color))}.wf-electron{fill:var(--wf-color);stroke:#d7f7ff;stroke-width:.8;filter:drop-shadow(0 0 3px var(--wf-color))}.wf-category.is-selected .wf-atom-core{fill:var(--wf-faint);stroke-width:2.5}.wf-category.is-selected strong:after{content:'';display:block;height:1px;background:var(--wf-color);width:25px;margin:3px auto 0}.wf-center{position:absolute;left:19%;width:62%;top:25%;z-index:3}.wf-topic{min-width:0;position:relative;background:linear-gradient(140deg,#061929f5,#010a13f7);border:1px solid var(--wf-line);border-radius:10px;padding:14px;box-shadow:0 0 24px #0008,inset 0 0 22px var(--wf-faint)}.wf-topic:before,.wf-control-panel:before,.wf-custom-preview:before{content:'';position:absolute;top:0;left:18px;width:65px;height:1px;background:var(--wf-color);box-shadow:0 0 7px var(--wf-color)}.wf-topic-title{display:flex;align-items:center;justify-content:space-between;gap:8px}.wf-topic h2{font-family:Orbitron,system-ui,sans-serif;font-size:clamp(11px,1.2vw,17px);letter-spacing:.04em;margin:0;color:#d9ebff;font-weight:500}.wf-topic-title>span{font-size:7px;letter-spacing:.08em;border:1px solid var(--wf-color);border-radius:8px;padding:3px 5px;color:var(--wf-color);white-space:nowrap}.wf-subtitle{font-size:10px;color:#91b2c8;margin:6px 0 11px}.wf-topic-box{border:1px solid #28557380;border-radius:5px;padding:10px;background:linear-gradient(120deg,#09253b70,#020c16);min-width:0}.wf-topic-box h3{font-size:9px;font-weight:500;letter-spacing:.06em;color:#a8daf4;margin:0 0 8px}.wf-topic-box h3 small{font-size:7px;letter-spacing:0;color:#7693a8;display:block;margin-top:3px}.wf-flow{display:flex;align-items:stretch;gap:4px;min-width:0}.wf-flow-part{display:flex;align-items:center;gap:4px;flex:1;min-width:0}.wf-flow-part>span{display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--wf-line);background:linear-gradient(135deg,var(--wf-faint),#061322);border-radius:4px;padding:9px 5px;font-size:8px;color:#cce6f6;flex:1;min-height:43px;line-height:1.4;text-align:center}.wf-flow-part svg{flex:none;color:var(--wf-color);width:13px}.wf-topic-columns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.wf-recent{list-style:none;padding:0;margin:0}.wf-recent li{display:flex;justify-content:space-between;align-items:center;gap:5px;border-bottom:1px solid #22475f55;padding:8px 0;font-size:8px;color:#b7d0df}.wf-recent li:last-child{border:0}.wf-recent li>span{display:flex;align-items:center;gap:5px}.wf-recent li svg{color:var(--wf-color);flex:none}.wf-recent time{font-size:7px;white-space:nowrap;color:#7ba0bc}.wf-empty-small{font-size:10px;line-height:1.7;color:#7898af;margin:15px 0}.wf-mini-chart{display:flex;gap:9px;align-items:end;height:91px;min-width:0}.wf-mini-chart>div{flex:1;display:flex;align-items:center;flex-direction:column;min-width:0}.wf-bar-track{height:43px;width:15px;display:flex;align-items:end;border-bottom:1px solid var(--wf-line);background:#15466922}.wf-bar-track i{width:100%;display:block;background:linear-gradient(var(--wf-color),var(--wf-faint));box-shadow:0 0 5px var(--wf-faint)}.wf-mini-chart strong{font-size:13px;font-weight:500;line-height:1.3;color:var(--wf-color);padding-top:3px}.wf-mini-chart small{font-size:7px;line-height:1.3;text-align:center;min-height:19px;color:#98b7ca;margin-top:3px}.wf-zero{font-size:7px;color:#7190a5;margin:7px 0 0}.wf-apps{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.wf-apps h3{margin:0;flex:1;min-width:90px}.wf-apps>span{display:flex;gap:5px;align-items:center;padding:5px;border:1px solid #244c6577;border-radius:3px;font-size:8px;color:#9bb7cc}.wf-apps>span small{font-size:7px;color:#718d9d}.wf-apps svg{color:#729aae}.wf-topic-actions{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-top:9px}.wf-topic-actions>a,.wf-topic-actions>button{display:flex;align-items:center;gap:6px;font-size:9px;color:var(--wf-color);background:transparent;border:0;padding:4px 0}.wf-map-legend{position:absolute;bottom:11px;left:13px;font-size:8px;color:#688ea5;max-width:35%;line-height:1.5}.wf-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;font-size:9px;color:#7393a9;padding:13px 1px}.wf-footer>span{display:flex;gap:6px;align-items:center}.wf-mobile-topic{display:none}.wf-search-result{font-size:11px;color:#a6c0d1;display:flex;gap:12px;align-items:center}.wf-search-result button{border:0;background:transparent;color:var(--wf-color);text-decoration:underline}.wf-list-panel{border:1px solid var(--wf-line);border-radius:8px;padding:22px;background:#04111ddd;margin-top:18px}.wf-list-panel h2{font-size:16px;letter-spacing:.08em;font-weight:500;margin:0}.wf-list-panel>p{font-size:12px;color:#8aaabe;line-height:1.7}.wf-domain-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}.wf-domain-list button{display:grid;grid-template-columns:25px 1fr 16px;gap:5px 10px;align-items:center;border:1px solid var(--wf-line);border-radius:5px;background:linear-gradient(130deg,var(--wf-faint),#030d17);color:var(--wf-color);text-align:left;padding:16px}.wf-domain-list strong{color:#cce6f5;font-size:13px;font-weight:500}.wf-domain-list span{grid-column:2;font-size:10px;color:#7f9eb4}.wf-domain-list svg:last-child{grid-column:3;grid-row:1/3}.wf-activity-list{display:flex;flex-direction:column;gap:8px;margin-top:19px}.wf-activity-list button{display:grid;grid-template-columns:20px 110px 1fr 85px;align-items:center;gap:10px;border:1px solid #234d6577;background:#041323;padding:12px;color:#9bbace;font-size:11px;text-align:left;border-radius:4px}.wf-activity-list strong{color:#d0e9f9;font-weight:500}.wf-activity-list svg{color:var(--wf-color)}.wf-activity-list time{text-align:right;font-size:10px}.wf-locked{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:440px;text-align:center;color:var(--wf-color)}.wf-locked h2{font-weight:500;font-size:21px}.wf-locked p{color:#8ba9bb;font-size:13px}.wf-custom-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,1fr);gap:17px;margin-top:20px;align-items:start}.wf-custom-preview,.wf-control-panel{position:relative;border:1px solid var(--wf-line);border-radius:8px;background:linear-gradient(130deg,#061724,#020b14);padding:16px;min-width:0}.wf-panel-title{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid var(--wf-line);padding-bottom:13px}.wf-panel-title h2{font-size:12px;letter-spacing:.12em;margin:0;font-weight:500;color:#bceaff}.wf-panel-title span{font-size:9px;color:#7ca3b9}.wf-custom-controls{display:flex;flex-direction:column;gap:15px}.wf-control-panel h2{font-family:Orbitron,system-ui,sans-serif;font-size:14px;font-weight:500;letter-spacing:.04em;color:#d5e8ff;margin:0}.wf-control-panel>p{font-size:11px;color:#92b0c2;line-height:1.6;margin:7px 0 15px}.wf-colors{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.wf-colors button{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0;border:1px solid #2b536f;border-radius:6px;padding:9px 3px 7px;background:#030e18;color:#bcd8e7}.wf-colors button>span{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 25%,#ffffff90,var(--swatch) 35%,#000b);box-shadow:0 0 12px color-mix(in srgb,var(--swatch),transparent 60%)}.wf-colors small{font-size:8px;line-height:1.4;min-height:20px;text-align:center}.wf-colors button>svg{position:absolute;right:3px;top:3px;background:#082138;border:1px solid var(--wf-color);border-radius:50%;color:#dff6ff}.wf-colors button[aria-pressed=true],.wf-designs button[aria-pressed=true]{border-color:var(--wf-color);box-shadow:inset 0 0 12px var(--wf-faint),0 0 12px var(--wf-faint)}.wf-designs{display:grid;grid-template-columns:1fr 1fr;gap:9px}.wf-designs button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:radial-gradient(ellipse,var(--wf-faint),#020b14 75%);border:1px solid #24506b;border-radius:6px;color:#d2e5f3;min-height:117px;padding:10px}.wf-designs .wf-atom{width:74px;height:74px;transform:none}.wf-designs button>span{font-size:10px}.wf-designs button>svg:last-child:not(.wf-atom){position:absolute;right:7px;top:7px;color:var(--wf-color)}.wf-sliders{display:grid;gap:14px;margin-top:20px}.wf-sliders label{display:grid;grid-template-columns:78px 1fr 35px;align-items:center;gap:8px;font-size:11px;color:#b2d0e2}.wf-sliders input{min-width:0;width:100%;height:4px;accent-color:var(--wf-color);cursor:pointer}.wf-sliders output{font-size:10px;text-align:right;color:var(--wf-color)}.wf-reset{display:flex;justify-content:center;align-items:center;gap:8px;width:100%;padding:10px;border:1px solid var(--wf-line);border-radius:4px;background:var(--wf-faint);color:#bde6fc;font-size:11px;margin-top:20px}.wf-control-panel .wf-save{font-size:10px;margin:13px 0 0;color:var(--wf-color)}.wf-footnote{font-size:9px!important;line-height:1.7;color:#7191a8!important}.wf-mini{min-height:600px;aspect-ratio:.87}.wf-mini .wf-category{width:80px}.wf-mini .wf-atom-wrap{width:64px;height:64px}.wf-mini .wf-category strong{font-size:10px}.wf-mini .wf-category-icon{width:15px;height:15px}.wf-mini .wf-axis{font-size:8px}.wf-mini .wf-map-legend{font-size:7px}.wf-preview-center{position:absolute;left:23%;top:34%;width:54%;height:30%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;padding:13px;border:1px solid var(--wf-line);border-radius:12px;background:radial-gradient(ellipse,var(--wf-faint),#030d18);text-align:center;box-shadow:0 0 25px #0008}.wf-preview-center svg{color:var(--wf-color);filter:drop-shadow(0 0 7px var(--wf-color))}.wf-preview-center strong{font-family:Orbitron,system-ui,sans-serif;font-size:14px;font-weight:500;color:#d6efff}.wf-preview-center span{font-size:10px;color:#9fc2d6}.wf-preview-center small{font-size:8px;color:#688ea7}.wf-mini-chart{overflow-x:auto;justify-content:flex-start}.wf-mini-chart>div{min-width:48px;flex:1}.wf-mini-chart small{overflow-wrap:anywhere}@keyframes wf-orbit-spin{to{transform:rotate(360deg)}}
@media(min-width:1450px){.wf-universe{min-height:820px}.wf-center{top:26%}.wf-topic{padding:18px}.wf-topic-box{padding:13px}.wf-topic h2{font-size:17px}.wf-topic-box h3{font-size:10px}.wf-flow-part>span{font-size:10px;min-height:49px}.wf-recent li{font-size:10px}.wf-recent time{font-size:8px}.wf-mini-chart{height:110px}.wf-bar-track{height:60px}.wf-apps>span{font-size:9px}.wf-category{width:115px}.wf-atom-wrap{width:98px;height:98px}.wf-category strong{font-size:14px}.wf-topic-actions>a,.wf-topic-actions>button{font-size:11px}.wf-mini{min-height:650px}.wf-mini .wf-category{width:80px}.wf-mini .wf-atom-wrap{width:67px;height:67px}}
@media(max-width:1100px){.wf-custom-grid{grid-template-columns:1fr}.wf-custom-preview .wf-mini{min-height:650px;aspect-ratio:1.05;max-width:800px;margin:auto}.wf-custom-controls{display:grid;grid-template-columns:1fr 1.4fr;align-items:start}.wf-colors{grid-template-columns:repeat(3,1fr)}.wf-colors small{font-size:10px}.wf-colors button>span{width:35px;height:35px}.wf-colors small{min-height:14px}.wf-universe{min-height:720px}.wf-topic-columns{grid-template-columns:1fr 1fr}.wf-center{width:63%;left:18.5%}}
@media(max-width:850px){.wf-brand>span{display:none}.wf-head h1{font-size:23px}.wf-universe{min-height:570px;aspect-ratio:1.1}.wf-graph-shell .wf-center{display:none}.wf-mobile-topic{display:block;margin-top:15px}.wf-graph-shell .wf-universe:after{content:'Select a category to explore its workflow below';position:absolute;left:29%;top:45%;width:42%;text-align:center;line-height:1.8;font-size:12px;color:#729eb7;pointer-events:none}.wf-atom-wrap{width:74px;height:74px}.wf-category strong{font-size:12px}.wf-category small{font-size:8px}.wf-topic{padding:20px}.wf-topic h2{font-size:17px}.wf-subtitle{font-size:12px}.wf-topic-box h3{font-size:11px}.wf-topic-box h3 small{font-size:9px}.wf-topic-title>span{font-size:8px}.wf-flow-part>span{font-size:11px;min-height:55px}.wf-recent li{font-size:10px}.wf-recent time{font-size:9px}.wf-mini-chart{height:110px}.wf-bar-track{height:55px}.wf-mini-chart small{font-size:9px}.wf-zero{font-size:9px}.wf-apps>span{font-size:11px;padding:9px}.wf-apps>span small{font-size:9px}.wf-topic-actions>a,.wf-topic-actions>button{font-size:12px;padding:8px 0}.wf-domain-list{grid-template-columns:repeat(2,1fr)}.wf-footer{flex-wrap:wrap}.wf-nav>button{padding:9px 12px}.wf-custom-controls{grid-template-columns:1fr 1.4fr}}
@media(max-width:560px){.wf-head-row{align-items:start;flex-direction:column;gap:14px}.wf-head h1{font-size:20px;line-height:1.5}.wf-head p{font-size:11px}.wf-brand{padding-bottom:12px;margin-bottom:14px}.wf-primary{font-size:11px;padding:9px 12px}.wf-nav{flex-wrap:wrap;margin-top:18px;gap:3px}.wf-nav>button{font-size:11px;flex:1}.wf-search{max-width:none;flex-basis:100%;width:100%;margin-top:8px}.wf-filters{gap:5px}.wf-filters button{font-size:10px;padding:6px 8px}.wf-universe{min-height:470px;aspect-ratio:.78}.wf-category{width:69px}.wf-atom-wrap{width:53px;height:53px}.wf-category-icon{width:14px;height:14px}.wf-category strong{font-size:10px}.wf-category small{font-size:7px}.wf-axis{font-size:8px}.wf-map-legend{font-size:7px;max-width:31%}.wf-graph-shell .wf-universe:after{font-size:10px;left:28%;width:44%}.wf-topic{padding:13px}.wf-topic h2{font-size:13px}.wf-topic-title>span{font-size:7px}.wf-subtitle{font-size:10px}.wf-flow{display:grid;grid-template-columns:1fr 1fr;gap:7px}.wf-flow-part>span{font-size:10px;min-height:47px}.wf-flow-part svg{width:12px}.wf-topic-columns{grid-template-columns:1fr}.wf-topic-box{padding:12px}.wf-recent li{font-size:11px}.wf-mini-chart{height:100px;gap:16px}.wf-mini-chart small{font-size:10px}.wf-topic-actions{gap:8px;flex-wrap:wrap}.wf-topic-actions>a,.wf-topic-actions>button{font-size:11px}.wf-apps{gap:8px}.wf-apps h3{flex-basis:100%}.wf-apps>span{font-size:10px}.wf-domain-list{grid-template-columns:1fr}.wf-activity-list button{grid-template-columns:18px 1fr 80px;font-size:10px;gap:5px}.wf-activity-list button>span{grid-column:2;grid-row:2}.wf-activity-list time{grid-column:3;grid-row:1/3;font-size:9px}.wf-list-panel{padding:15px}.wf-list-panel h2{font-size:14px}.wf-list-panel>p{font-size:11px}.wf-custom-controls{display:flex;flex-direction:column;align-items:stretch;gap:15px;min-width:0}.wf-custom-controls>.wf-control-panel{width:100%;min-width:0}.wf-custom-preview{padding:10px}.wf-custom-preview .wf-mini{min-height:480px;aspect-ratio:.8}.wf-mini .wf-atom-wrap{width:48px;height:48px}.wf-mini .wf-category{width:60px}.wf-mini .wf-category strong{font-size:9px}.wf-mini .wf-category-icon{width:12px;height:12px}.wf-preview-center{left:23%;width:54%;height:29%;top:35%;padding:9px;gap:9px}.wf-preview-center strong{font-size:11px}.wf-preview-center span{font-size:8px}.wf-preview-center small{font-size:7px}.wf-preview-center svg{width:27px}.wf-panel-title h2{font-size:10px}.wf-panel-title span{font-size:8px}.wf-colors{grid-template-columns:repeat(6,1fr)}.wf-colors button>span{width:28px;height:28px}.wf-colors small{font-size:8px}.wf-locked{min-height:330px}}
/* Reserve a clear center band; narrow canvases keep details below the oval. */
.wf-graph-shell .wf-universe{width:calc(100% - 24px);margin-inline:auto}
@media(min-width:1200px){.wf-graph-shell .wf-universe{min-height:1160px}.wf-graph-shell .wf-center{top:31%;left:21%;width:58%;max-height:39%;overflow:auto;scrollbar-width:thin}.wf-mobile-topic{display:none}}
@media(max-width:1199px){.wf-graph-shell .wf-center{display:none}.wf-mobile-topic{display:block;margin-top:18px}.wf-graph-shell .wf-universe:after{content:'Select a category to explore its workflow below';position:absolute;left:29%;top:45%;width:42%;text-align:center;line-height:1.8;font-size:12px;color:#729eb7;pointer-events:none}}
@media(max-width:560px){.wf-graph-shell .wf-universe{min-height:520px}.wf-graph-shell .wf-category{width:min(62px,20%)}.wf-graph-shell .wf-atom-wrap{width:clamp(36px,11vw,53px);height:clamp(36px,11vw,53px)}.wf-mini .wf-category{width:min(60px,20%)}.wf-mini .wf-atom-wrap{width:clamp(32px,10vw,48px);height:clamp(32px,10vw,48px)}.wf-graph-shell .wf-universe:after{font-size:10px}}
@media(prefers-reduced-motion:reduce){.wf-app *{animation:none!important;transition:none!important}}
`;

import { supabase } from "@/integrations/supabase/client";
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
  cn,
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
import { AppBrandBar } from "@/components/evolution/AppBrandBar";
import { Toaster } from "sonner";
import { HomeShell } from "@/components/evolution/HomeShell";

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
  const [authState, setAuthState] = useState<"loading" | "signed-in" | "signed-out" | "error">("loading");
  useEffect(() => {
    let active = true;
    let generation = 0;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "INITIAL_SESSION") return;
      generation++;
      setAuthState(session ? "signed-in" : "signed-out");
    });
    const started = generation;
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!data.session) return false;
        const verified = await supabase.auth.getUser();
        if (verified.error) throw verified.error;
        return !!verified.data.user;
      })
      .then((signedIn) => {
        if (active && started === generation) setAuthState(signedIn ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active && started === generation) setAuthState("error");
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (pathname !== "/auth" && authState === "signed-out") window.location.replace("/auth");
  }, [pathname, authState]);
  // Gate before all mobile and assistant branches. This UI gate supplements, never replaces, server RLS.
  if (pathname === "/auth")
    return (
      <>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </>
    );
  if (authState !== "signed-in")
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="hud-card p-8 text-center max-w-md" role={authState === "error" ? "alert" : "status"}>
          <h1 className="hud-label text-primary text-lg">EVOLUTION OS</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {authState === "error"
              ? "We could not verify your session. Check your connection and try again."
              : "Checking your session…"}
          </p>
          {authState === "error" && (
            <div className="mt-4 flex justify-center gap-5">
              <button onClick={() => window.location.reload()}>Retry</button>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signOut({ scope: "local" });
                    if (error) throw error;
                    window.location.assign("/auth");
                  } catch {
                    window.alert("Sign-out could not finish. Please retry when your connection is restored.");
                  }
                }}
              >
                Sign in again
              </button>
            </div>
          )}
        </div>
      </main>
    );
  if (pathname.startsWith("/evolution-mobile/"))
    return <div role="alert">Mobile asset unavailable. Open the Dashboard from the main app.</div>;
  if (section === "ai-workflow")
    return (
      <>
        <AIWorkflowFeaturePage />
        <Toaster />
      </>
    );
  if (section === "evo" || section === "alfred")
    return (
      <>
        {isPhone ? (
          <EvoAssistantPage />
        ) : (
          <HomeShell>
            <EvoAssistantPage />
          </HomeShell>
        )}
        <Toaster />
      </>
    );
  if (
    isPhone &&
    !(pathname === "/" && !new URLSearchParams(searchStr).has("mobilePage")) &&
    new URLSearchParams(searchStr).get("mobileFallback") !== "1" &&
    pathname !== "/auth" &&
    pathname !== "/settings" &&
    pathname !== "/business" &&
    pathname !== "/hobby" &&
    pathname !== "/calendar" &&
    pathname !== "/goals"
  )
    return <MobileApp />;
  return (
    <>
      <Outlet />
      <MobileBottomNav fixed />
      <FocusNotification />
      <Toaster theme="dark" position="top-right" />
    </>
  );
}

function AIWorkflowFeaturePage() {
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    setReady(true);
    const changing = () => {
      setReady(false);
      setGeneration((value) => value + 1);
    };
    const changed = () => setReady(true);
    window.addEventListener("evolution:owner-changing", changing);
    window.addEventListener("evolution:owner-changed", changed);
    return () => {
      window.removeEventListener("evolution:owner-changing", changing);
      window.removeEventListener("evolution:owner-changed", changed);
    };
  }, []);
  return (
    <HomeShell>
      <AIWorkflowDashboard
        key={generation}
        ready={ready}
        onOpenTool={(tool) => {
          window.location.assign(`/?section=evo&tool=${tool}`);
        }}
      />
    </HomeShell>
  );
}

function EvoAssistantPage() {
  const isPhone = useIsPhone();
  const { data, mutate } = useEvolutionData();
  const cloud = useCloudStatus();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"chat" | "routines" | "calendar" | "goals">(() => {
    const tool = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tool");
    return tool === "routines" || tool === "calendar" || tool === "goals" ? tool : "chat";
  });
  const [viewportHeight, setViewportHeight] = useState<number | undefined>();
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => setViewportHeight(viewport?.height || window.innerHeight);
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);
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
        {
          id: uid(),
          text: title,
          category: "Notes",
          priority: "Medium",
          due: taskDate,
          status: "Not Started",
        },
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
      <div
        className={"evo-workspace" + (isPhone ? " evo-phone" : "") + (view === "chat" ? " evo-chat-screen" : "")}
        style={isPhone && view === "chat" ? { height: viewportHeight } : undefined}
      >
        <style>{EVO_WORKSPACE_CSS}</style>
        <p role="status">Loading your workspace…</p>
      </div>
    );
  return (
    <div
      className={"evo-workspace" + (isPhone ? " evo-phone" : "") + (view === "chat" ? " evo-chat-screen" : "")}
      style={isPhone && view === "chat" ? { height: viewportHeight } : undefined}
    >
      <style>{EVO_WORKSPACE_CSS}</style>
      {isPhone && <AppBrandBar />}
      <div className="flex items-center justify-between gap-3 px-1 py-2 text-xs text-muted-foreground" role="status">
        <span className="tracking-widest text-primary">EVO AI</span>
        <span>{statusLabel}</span>
      </div>
      <header className="evo-header evo-frame" style={{ display: "none" }}>
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
          <strong>EVO AI</strong>
          <small>{statusLabel}</small>
        </div>
      </header>
      <div className="evo-mobile-quick" aria-label="Quick planning tools">
        <button className="hud-card" disabled={disabled} onClick={() => runCommand("Plan my day")}>
          <CalendarDays />
          Plan
          <br />
          my day
        </button>
        <button className="hud-card" disabled={disabled} onClick={() => runCommand("Improve my focus")}>
          <CircleCheck />
          Improve
          <br />
          my focus
        </button>
        <button className="hud-card" disabled={disabled} onClick={() => runCommand("Build a habit")}>
          <ChartNoAxesCombined />
          Build
          <br />a habit
        </button>
        <button
          className="hud-card"
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
        <aside className={cn("evo-side evo-frame", "hud-card")}>
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
              <section className={cn("evo-conversation evo-frame", "hud-card")} aria-label="Planning conversation">
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
                  <div
                    className="evo-message-list"
                    role="log"
                    aria-live="polite"
                    aria-label="Saved planning conversation"
                  >
                    {history.map((m) => (
                      <article className={"evo-message " + m.role} key={m.id}>
                        <div>
                          {m.role === "user" ? "YOU" : "EVO"}
                          <time>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
              <div className={cn("evo-composer evo-frame", "hud-card")}>
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
                  <button
                    type="button"
                    aria-label="Open planning tools"
                    aria-expanded={showTools}
                    onClick={() => setShowTools((s) => !s)}
                  >
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
              <section className={cn("evo-frame evo-panel", "hud-card")}>
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
                          setSpec({
                            ...spec,
                            durationMinutes: Math.round(Number(e.target.value) * 60),
                          });
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
              <section className={cn("evo-frame evo-panel", "hud-card")}>
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
            <section className={cn("evo-frame evo-panel", "hud-card")}>
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
              <section className={cn("evo-frame evo-panel", "hud-card")}>
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
                        {
                          id: uid(),
                          name: habitTitle.trim().slice(0, 80),
                          category: "Notes",
                          emoji: "✦",
                        },
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
              <section className={cn("evo-frame evo-panel", "hud-card")}>
                <div className="evo-section-title">
                  <span>
                    <ChartNoAxesCombined size={17} /> PROGRESS
                  </span>
                </div>
                {!data.goals.length && <p className="evo-muted">Your first goal starts with one clear step.</p>}
                {data.goals.map((g) => (
                  <div className="evo-goal evo-surface" key={g.id}>
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
                      className={"evo-habit evo-surface " + (done ? "complete" : "")}
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
            <button className={cn("evo-surface", isPhone && "hud-card")} onClick={() => setView("routines")}>
              <Workflow />
              <strong>OPTIMIZE MY ROUTINE</strong>
              <small>Small changes. Real structure.</small>
            </button>
            <button className={cn("evo-surface", isPhone && "hud-card")} onClick={() => runCommand("Review my progress")}>
              <Sprout />
              <strong>EVOLVE</strong>
              <small>A higher you.</small>
            </button>
            <button className={cn("evo-surface", isPhone && "hud-card")} onClick={() => setView("goals")}>
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

/* Full-height conversation stage with a reachable composer on phone and desktop. */
.evo-message p{overflow-wrap:anywhere}.evo-message-list{flex:1;min-height:0;overscroll-behavior:contain}.evo-inline-task{flex-shrink:0;max-height:45vh}.evo-chat-screen .evo-side{min-height:0}.evo-chat-screen .evo-composer{flex-shrink:0;background:linear-gradient(145deg,#142a3e,#081420);z-index:3}.evo-chat-screen .evo-orb{filter:drop-shadow(0 0 24px #3aaeff55)}.evo-chat-screen .evo-orb:before{box-shadow:inset 0 0 32px #45aaff55,0 0 30px #3b9de533}.evo-chat-screen .evo-orb img{width:78%;height:78%;filter:drop-shadow(0 0 19px #28a5ff)}
@media(min-width:1051px){.evo-chat-screen .evo-body{min-height:calc(100dvh - 155px)}.evo-chat-screen .evo-chat-layout{grid-template-rows:minmax(380px,1fr) auto;min-height:calc(100dvh - 275px)}.evo-chat-screen .evo-conversation{max-height:calc(100dvh - 310px);min-height:380px}.evo-chat-screen .evo-hero{min-height:380px}.evo-chat-screen .evo-bottom-actions{margin-top:14px}.evo-chat-screen .evo-bottom-actions button{min-height:75px;padding:11px;gap:5px}}
@media(max-width:767px){
.evo-chat-screen{position:relative;height:100dvh;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:0 13px calc(82px + env(safe-area-inset-bottom));}
.evo-chat-screen .evo-mobile-nav{position:absolute;}
.evo-chat-screen .evo-header{height:76px;min-height:76px;flex-shrink:0;}.evo-chat-screen .evo-head-status strong{font-size:16px;letter-spacing:2px}
.evo-chat-screen .evo-mobile-quick{flex-shrink:0;margin:14px 0 6px;gap:7px}.evo-chat-screen .evo-mobile-quick button{min-height:62px;font-size:11px;}.evo-chat-screen .evo-mobile-quick svg{width:18px;height:18px;margin-bottom:5px}
.evo-chat-screen .evo-body{flex:1;min-height:0;display:flex;flex-direction:column;}.evo-chat-screen .evo-main{flex:1;min-height:0;display:flex;flex-direction:column;}.evo-chat-screen .evo-view-tabs{flex-shrink:0;margin:6px 0 9px;}.evo-chat-screen .evo-view-tabs button{padding:4px 10px;min-height:30px;}
.evo-chat-screen .evo-chat-layout{flex:1;min-height:0;display:flex;gap:9px;}.evo-chat-screen .evo-hero{flex:1;min-height:0;padding:0 0 7px;overflow:hidden;}.evo-chat-screen .evo-orb{width:min(265px,62vw);max-height:calc(100% - 86px);flex-shrink:1;}.evo-chat-screen .evo-hero h2{font-size:22px;margin:9px 0 7px;}.evo-chat-screen .evo-hero-line{margin:13px 0 7px}.evo-chat-screen .evo-hero>small{font-size:9px;}
.evo-chat-screen .has-history .evo-hero{display:none;}.evo-chat-screen .evo-conversation{flex:1;min-height:0;max-height:none;overflow:hidden;padding:13px;}.evo-chat-screen .evo-section-title{flex-shrink:0;margin-bottom:10px;padding-bottom:9px;}.evo-chat-screen .evo-welcome{padding:10px 0;}.evo-chat-screen .evo-welcome h2{font-size:20px;margin:4px 0;}.evo-chat-screen .evo-welcome p,.evo-chat-screen .evo-welcome small{display:none;}.evo-chat-screen .evo-welcome button{margin-top:8px;}
.evo-chat-screen .evo-composer{padding:10px 12px;min-height:61px;}.evo-chat-screen .evo-composer form>input{font-size:16px;min-height:38px;}.evo-chat-screen .evo-composer form>button{min-width:38px;min-height:38px;}.evo-chat-screen .evo-tools{max-height:120px;overflow:auto;padding-bottom:9px;}.evo-chat-screen .evo-notice{flex-shrink:0;max-height:100px;overflow:auto;margin-bottom:7px;}
}
@media(max-width:767px) and (max-height:610px){.evo-chat-screen .evo-header{height:54px;min-height:54px;}.evo-chat-screen .evo-mobile-quick{display:none;}.evo-chat-screen .evo-hero h2,.evo-chat-screen .evo-hero>p,.evo-chat-screen .evo-hero-line{display:none;}.evo-chat-screen .evo-orb{max-height:calc(100% - 22px);width:170px;}}
`;
