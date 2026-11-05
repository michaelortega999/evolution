import { useMemo, useRef, useState } from "react";
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ListChecks,
  Timer,
  CalendarDays,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useEvolutionData } from "@/lib/evolution-data";

import { WeeklyTasksCard } from "./WeeklyTasksCard";
import { formatMmSs, modeLabel, useFocusTimer } from "@/lib/use-focus-timer";

const PANELS = ["Calendar", "Today’s Task Schedule", "Focus Mode", "Weekly Tasks"];
const PANEL_ICONS = [CalIcon, ListChecks, Timer, CalendarDays];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const DOT_COLORS = [
  "bg-primary",
  "bg-[oklch(0.78_0.18_200)]",
  "bg-[oklch(0.75_0.20_300)]",
  "bg-[oklch(0.78_0.18_160)]",
  "bg-[oklch(0.80_0.18_50)]",
];

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarCard() {
  const { data, mutate } = useEvolutionData();
  const timer = useFocusTimer();
  const [panel, setPanel] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const changePanel = (delta: number) => setPanel((current) => (current + delta + PANELS.length) % PANELS.length);
  const PanelIcon = PANEL_ICONS[panel];
  const today = new Date();
  const todayKey = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
  const todayTasks = data.evoTasks.filter((task) => task.due === todayKey);
  const todayEvents = data.calendar
    .filter((event) => event.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string>(fmtDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [evt, setEvt] = useState("");

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const prevMonthDays = new Date(view.year, view.month, 0).getDate();

    const arr: { date: string; day: number; outside: boolean }[] = [];
    // leading days from prev month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = view.month - 1;
      const y = m < 0 ? view.year - 1 : view.year;
      arr.push({ date: fmtDate(y, (m + 12) % 12, d), day: d, outside: true });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ date: fmtDate(view.year, view.month, d), day: d, outside: false });
    }
    // trailing
    while (arr.length < 42) {
      const idx = arr.length - (startWeekday + daysInMonth) + 1;
      const m = view.month + 1;
      const y = m > 11 ? view.year + 1 : view.year;
      arr.push({ date: fmtDate(y, m % 12, idx), day: idx, outside: true });
    }
    return arr;
  }, [view]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const e of data.events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e.text);
    }
    return map;
  }, [data.events]);

  const selectedEvents = eventsByDate.get(selected) ?? [];

  const navigate = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });
  };

  const addEvent = () => {
    const text = evt.trim();
    if (!text) return;
    mutate((prev) => ({ events: [...prev.events, { date: selected, text }] }));
    setEvt("");
  };

  return (
    <div
      className="dashboard-card dashboard-calendar hud-card p-4 flex flex-col h-full min-h-[300px]"
      role="region"
      aria-label="Calendar overview"
      aria-roledescription="carousel"
      style={{ touchAction: "pan-y" }}
      onTouchStart={(event) => {
        suppressClick.current = false;
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchCancel={() => {
        touchStart.current = null;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          suppressClick.current = true;
          changePanel(dx < 0 ? 1 : -1);
        }
      }}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <div className="flex items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2 min-w-0" aria-live="polite">
          <PanelIcon className="h-4 w-4 text-primary shrink-0" />
          <div className="hud-label text-xs leading-tight">{PANELS[panel]}</div>
        </div>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => changePanel(-1)}
            aria-label="Previous overview"
            className="h-8 w-8 flex items-center justify-center text-primary rounded hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changePanel(1)}
            aria-label="Next overview"
            className="h-8 w-8 flex items-center justify-center text-primary rounded hover:bg-primary/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {panel === 0 && (
        <>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="h-6 w-6 rounded flex items-center justify-center text-primary hover:bg-primary/10"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="hud-label text-xs text-primary hud-glow tracking-widest">
              {MONTHS[view.month]} {view.year}
            </div>
            <button
              onClick={() => navigate(1)}
              className="h-6 w-6 rounded flex items-center justify-center text-primary hover:bg-primary/10"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="hud-label text-[9px] text-muted-foreground text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const isSelected = c.date === selected;
              const hasEvents = (eventsByDate.get(c.date)?.length ?? 0) > 0;
              return (
                <button
                  key={c.date + (c.outside ? "o" : "")}
                  onClick={() => setSelected(c.date)}
                  className={[
                    "relative aspect-square text-[9px] rounded border transition-colors flex items-center justify-center max-h-7",
                    c.outside ? "text-muted-foreground/50 border-transparent" : "text-foreground/90 border-border/40",
                    isSelected
                      ? "bg-primary/20 border-primary text-primary hud-glow"
                      : "hover:bg-primary/10 hover:border-primary/50",
                  ].join(" ")}
                >
                  {c.day}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          <details className="dashboard-actions">
            <summary>Events ({selectedEvents.length}) / Add</summary>
            {/* Events list */}
            <div className="mt-3 pt-3 border-t border-border/60 flex-1 space-y-1.5 overflow-y-auto max-h-32">
              {selectedEvents.length === 0 ? (
                <div className="text-xs text-muted-foreground">No events</div>
              ) : (
                selectedEvents.map((text, i) => {
                  // try to split "10:00 AM Team Standup"
                  const m = text.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s+(.*)$/i);
                  const time = m?.[1];
                  const label = m?.[2] ?? text;
                  return (
                    <div key={i} className="text-xs text-foreground/90 flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                      {time && <span className="text-primary tabular-nums w-16 shrink-0">{time}</span>}
                      <span className="truncate">{label}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add event + view details */}
            <div className="mt-3 flex gap-2">
              <Input
                value={evt}
                onChange={(e) => setEvt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
                placeholder="Add event…"
                className="h-8 text-xs"
              />
              <button
                onClick={addEvent}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10 shrink-0"
                aria-label="Add event"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </details>

          <Link to="/calendar" className="hud-label text-[10px] text-primary hud-glow mt-3 hover:underline">
            VIEW DETAILS →
          </Link>
        </>
      )}
      {panel === 1 && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="text-xs text-muted-foreground mb-3">
            {todayTasks.filter((task) => task.status === "Done").length}/{todayTasks.length} tasks completed ·{" "}
            {todayEvents.length} scheduled
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {todayTasks.length === 0 && todayEvents.length === 0 && (
              <p className="text-sm text-muted-foreground py-6">Nothing scheduled for today.</p>
            )}
            {todayEvents.map((event) => (
              <div key={event.id} className="flex gap-2 text-xs border-b border-border/40 pb-2">
                <span className="text-primary tabular-nums shrink-0">{event.time || "All day"}</span>
                <span className="break-words min-w-0">{event.title}</span>
              </div>
            ))}
            {todayTasks.map((task) => (
              <div key={task.id} className="flex gap-2 text-xs border-b border-border/40 pb-2">
                <span className="text-primary shrink-0">{task.status === "Done" ? "✓" : "○"}</span>
                <div className="min-w-0">
                  <div
                    className={
                      task.status === "Done" ? "line-through text-muted-foreground break-words" : "break-words"
                    }
                  >
                    {task.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {task.status} · {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-auto pt-3 hud-label text-[10px] text-primary">
            <Link to="/calendar">OPEN SCHEDULE →</Link>
            <Link to="/notes">OPEN TASKS →</Link>
          </div>
        </div>
      )}
      {panel === 2 && (
        <div className="flex flex-col flex-1 items-center justify-center gap-3 py-3">
          <div className="hud-label text-xs text-muted-foreground">{modeLabel(timer.mode)}</div>
          <output className="text-4xl tabular-nums text-primary hud-glow" aria-label="Time remaining">
            {formatMmSs(timer.remainingMs)}
          </output>
          <p className="text-xs text-muted-foreground text-center break-words max-w-full">
            {timer.task || "Choose a task in Focus Mode"}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={timer.running ? timer.pause : timer.start}
              className="flex items-center gap-2 px-3 h-9 rounded border border-primary/50 text-primary text-xs hover:bg-primary/10"
            >
              {timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {timer.running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={timer.reset}
              aria-label="Reset focus timer"
              className="h-9 w-9 flex items-center justify-center rounded border border-border text-primary hover:bg-primary/10"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <Link to="/focus" className="hud-label text-[10px] text-primary mt-1">
            OPEN FOCUS MODE →
          </Link>
        </div>
      )}
      <div hidden={panel !== 3} className="calendar-weekly flex-1 min-w-0">
        <WeeklyTasksCard />
      </div>
      <nav className="flex items-center justify-center gap-1 mt-auto pt-3" aria-label="Choose calendar overview">
        {PANELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setPanel(index)}
            aria-label={label}
            aria-current={panel === index ? "true" : undefined}
            title={label}
            className="h-7 w-8 flex items-center justify-center rounded hover:bg-primary/10"
          >
            <span
              className={
                panel === index
                  ? "h-1.5 w-5 rounded-full bg-primary transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-primary/30 transition-all"
              }
            />
          </button>
        ))}
      </nav>
      <style>
        {
          ".calendar-weekly > section { padding: 0; border: 0; background: transparent; box-shadow: none; } .calendar-weekly > section > div:first-child { margin-bottom: 8px; flex-wrap: wrap; } .calendar-weekly table { min-width: 0; table-layout: fixed; } .calendar-weekly th:first-child { width: 32%; } .calendar-weekly th { width: auto; font-size: 8px; padding-bottom: 6px; } .calendar-weekly th:last-child { width: 20px; } .calendar-weekly td { font-size: 11px; padding-top: 4px; padding-bottom: 4px; } .calendar-weekly td:first-child { overflow-wrap: anywhere; padding-right: 3px; } .calendar-weekly td button { width: 17px; height: 17px; } .calendar-weekly td:last-child button { opacity: 1; } .calendar-weekly .overflow-x-auto { max-height: 240px; overflow-y: auto; }"
        }
      </style>
    </div>
  );
}
