import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalIcon, Plus, Trash2, X, Bell, BellOff, TrendingUp, Eye, Target, Quote } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import {
  useEvolutionData,
  type CalendarEvent,
  type ReminderOffset,
} from "@/lib/evolution-data";
import { cn } from "@/lib/utils";
import mountainImg from "@/assets/calendar-mountain.jpg";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Evolution" }] }),
  component: CalendarPage,
});

// ---------- date helpers ----------
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseHM(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function fmtHM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function fmt12(t: string): string {
  const [hh, mm] = t.split(":").map(Number);
  const h12 = ((hh + 11) % 12) + 1;
  const ap = hh < 12 ? "AM" : "PM";
  return `${h12}:${String(mm).padStart(2, "0")} ${ap}`;
}
function startOfWeek(d: Date): Date {
  // Monday-start week
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // days since Monday
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  return out;
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function eventStartMs(e: CalendarEvent): number {
  return new Date(`${e.date}T${e.time}:00`).getTime();
}

// ---------- main ----------
function CalendarPage() {
  const { data, mutate } = useEvolutionData();
  const events = data.calendar ?? [];
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [weekCursor, setWeekCursor] = useState(() => startOfWeek(new Date()));

  // form state (shared)
  const [formDate, setFormDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [reminder, setReminder] = useState<ReminderOffset>(0);

  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      (m[e.date] ||= []).push(e);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [events]);

  const upcoming = useMemo(() => {
    const today = ymd(new Date());
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 8);
  }, [events]);

  function openForm(date: string, startHM = "12:00") {
    setFormDate(date);
    setTime(startHM);
    setEndTime(fmtHM(Math.min(23 * 60 + 59, parseHM(startHM) + 60)));
    setTitle("");
    setReminder(0);
  }

  function addEvent() {
    if (!formDate || !title.trim()) return;
    const ev: CalendarEvent = {
      id: crypto.randomUUID(),
      date: formDate,
      time,
      endTime,
      title: title.trim(),
      reminder,
    };
    mutate((p) => ({ calendar: [...(p.calendar ?? []), ev] }));
    setTitle("");
    setFormDate(null);
  }

  function delEvent(id: string) {
    mutate((p) => ({ calendar: (p.calendar ?? []).filter((e) => e.id !== id) }));
  }

  // Month overview stats derived from cursor month
  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = useMemo(
    () => events.filter((e) => e.date.startsWith(monthKey)),
    [events, monthKey],
  );
  const tradingDays = new Set(
    monthEvents.filter((e) => /trad|market|backtest/i.test(e.title)).map((e) => e.date),
  ).size;
  const reviewDays = new Set(
    monthEvents.filter((e) => /review|journal|reflect/i.test(e.title)).map((e) => e.date),
  ).size;
  const goals = data.goals ?? [];
  const goalCompletion = goals.length
    ? Math.round(
        (goals.reduce((s, g) => s + Math.min(1, g.current / Math.max(1, g.target)), 0) /
          goals.length) *
          100,
      )
    : 0;
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <ModuleLayout number="" title="Calendar" subtitle="Schedule and events" icon={CalIcon}>
      <ReminderEngine events={events} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-border mb-3">
        <img
          src={mountainImg}
          alt=""
          width={1024}
          height={768}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="relative p-6 md:p-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Calendar
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your days. Stay consistent. Win the month.
          </p>
          <div className="hud-label text-[11px] text-primary mt-3 hud-glow">
            {monthLabel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-2">
        <ViewToggleButton active={view === "month"} onClick={() => setView("month")}>
          Month View
        </ViewToggleButton>
        <ViewToggleButton active={view === "week"} onClick={() => setView("week")}>
          Weekly View
        </ViewToggleButton>
      </div>


      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        {/* LEFT: calendar */}
        <div className="min-w-0 flex flex-col gap-3">
          <div key={view} className="animate-in fade-in duration-300">
            {view === "month" ? (
              <MonthView
                cursor={cursor}
                setCursor={setCursor}
                eventsByDate={eventsByDate}
                onPickDay={(ds) => openForm(ds)}
                selected={formDate}
              />
            ) : (
              <WeekView
                weekCursor={weekCursor}
                setWeekCursor={setWeekCursor}
                events={events}
                onPickSlot={(ds, hm) => openForm(ds, hm)}
              />
            )}
          </div>

          {formDate && (
            <Panel title={`ADD EVENT · ${formDate}`}>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="hud-label text-[10px] text-muted-foreground">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    autoFocus
                    className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="hud-label text-[10px] text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value || formDate)}
                    className="mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="hud-label text-[10px] text-muted-foreground">Start</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="hud-label text-[10px] text-muted-foreground">End</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="hud-label text-[10px] text-muted-foreground">Reminder</label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(Number(e.target.value) as ReminderOffset)}
                    className="mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                  >
                    <option value={0}>None</option>
                    <option value={15}>15 min before</option>
                    <option value={30}>30 min before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>
                <button
                  onClick={addEvent}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-xs rounded hover:bg-primary/25"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button
                  onClick={() => setFormDate(null)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Panel>
          )}
        </div>

        {/* RIGHT: widgets */}
        <aside className="flex flex-col gap-3 min-w-0">
          <Panel title="MONTH OVERVIEW">
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: CalIcon, value: monthEvents.length, label: "Total Events" },
                { icon: TrendingUp, value: tradingDays, label: "Trading Days" },
                { icon: Eye, value: reviewDays, label: "Review Days" },
                { icon: Target, value: `${goalCompletion}%`, label: "Goal Completion" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1 p-2 border border-border/50 rounded">
                  <s.icon className="h-4 w-4 text-primary" />
                  <div className="text-xl font-semibold text-foreground">{s.value}</div>
                  <div className="hud-label text-[9px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="FOCUS THIS MONTH">
            <div className="flex gap-2">
              <Quote className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-foreground italic leading-relaxed">
                  Discipline is doing what needs to be done, even when you don't feel like doing it.
                </p>
                <p className="hud-label text-[10px] text-primary mt-2">— STAY CONSISTENT</p>
              </div>
            </div>
          </Panel>

          <Panel title="UPCOMING">
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No upcoming events. Click a day to add one.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto">
                {upcoming.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2 p-2 border border-border rounded bg-primary/5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="hud-label text-[10px] text-primary truncate">
                        {e.date} · {fmt12(e.time)}
                      </div>
                      <div className="text-xs text-foreground truncate">{e.title}</div>
                    </div>
                    {e.reminder ? (
                      <Bell className="h-3 w-3 text-primary shrink-0" />
                    ) : (
                      <BellOff className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <button
                      onClick={() => delEvent(e.id)}
                      className="text-destructive hover:text-destructive/80 shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="CATEGORIES">
            <div className="flex flex-col gap-2">
              {[
                { label: "Trading", color: "hsl(var(--primary))" },
                { label: "Planning", color: "#60a5fa" },
                { label: "Personal", color: "#f59e0b" },
                { label: "Review", color: "#a78bfa" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                  <span className="hud-label text-[10px] text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </ModuleLayout>
  );
}


// ---------- view toggle button ----------
function ViewToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 hud-label text-[11px] rounded border transition-all",
        active
          ? "border-primary bg-primary/15 text-primary hud-glow"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-primary/5",
      )}
    >
      {children}
    </button>
  );
}

// ---------- month view ----------
function MonthView({
  cursor,
  setCursor,
  eventsByDate,
  onPickDay,
  selected,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  eventsByDate: Record<string, CalendarEvent[]>;
  onPickDay: (ds: string) => void;
  selected: string | null;
}) {
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);
  const todayStr = ymd(new Date());

  return (
    <Panel title={`MONTH · ${monthLabel.toUpperCase()}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => setCursor(new Date())}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          Today
        </button>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          Next ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="hud-label text-[10px] text-muted-foreground text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const ds = ymd(d);
          const dayEvents = eventsByDate[ds] ?? [];
          const isToday = ds === todayStr;
          const isSelected = ds === selected;
          return (
            <button
              key={i}
              onClick={() => onPickDay(ds)}
              className={cn(
                "aspect-square border rounded p-1 flex flex-col items-start text-left transition-colors hover:bg-primary/10",
                isSelected ? "border-primary bg-primary/15" : "border-border",
                isToday && "ring-1 ring-primary",
              )}
            >
              <span
                className={cn(
                  "hud-label text-[11px]",
                  isToday ? "text-primary hud-glow" : "text-foreground/80",
                )}
              >
                {d.getDate()}
              </span>
              <div className="flex flex-col gap-0.5 mt-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className="text-[9px] truncate text-primary bg-primary/10 px-1 rounded"
                  >
                    {e.time} {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{dayEvents.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

// ---------- week view ----------
const HOUR_PX = 48;

function WeekView({
  weekCursor,
  setWeekCursor,
  events,
  onPickSlot,
}: {
  weekCursor: Date;
  setWeekCursor: (d: Date) => void;
  events: CalendarEvent[];
  onPickSlot: (ds: string, hm: string) => void;
}) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekCursor, i)),
    [weekCursor],
  );
  const dayKeys = days.map(ymd);

  // current time tick — re-renders every 30s for smooth movement
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const todayStr = ymd(now);
  const todayIdx = dayKeys.indexOf(todayStr);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const rangeLabel = `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <Panel title={`WEEK · ${rangeLabel.toUpperCase()}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekCursor(addDays(weekCursor, -7))}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => setWeekCursor(startOfWeek(new Date()))}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          This Week
        </button>
        <button
          onClick={() => setWeekCursor(addDays(weekCursor, 7))}
          className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
        >
          Next ›
        </button>
      </div>

      {/* Header row */}
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: `60px repeat(7, minmax(0, 1fr))` }}
      >
        <div />
        {days.map((d) => {
          const isToday = ymd(d) === todayStr;
          const dayName = d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
          return (
            <div
              key={ymd(d)}
              className={cn(
                "text-center py-2 border-l border-border",
                isToday && "bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "hud-label text-[10px]",
                  isToday ? "text-primary hud-glow" : "text-muted-foreground",
                )}
              >
                {dayName}
              </div>
              <div
                className={cn(
                  "hud-label text-base mt-0.5",
                  isToday ? "text-primary hud-glow" : "text-foreground/80",
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body grid */}
      <div className="overflow-auto max-h-[640px]">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `60px repeat(7, minmax(0, 1fr))` }}
        >
          {/* Time column */}
          <div className="flex flex-col border-r border-border">
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="hud-label text-[9px] text-muted-foreground text-right pr-2 pt-0.5"
                style={{ height: HOUR_PX }}
              >
                {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const ds = ymd(d);
            const dayEvents = events.filter((e) => e.date === ds);
            const isToday = ds === todayStr;
            return (
              <div
                key={ds}
                className={cn("relative border-l border-border", isToday && "bg-primary/[0.03]")}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <button
                    key={h}
                    onClick={() => onPickSlot(ds, `${String(h).padStart(2, "0")}:00`)}
                    className="block w-full border-b border-border/40 hover:bg-primary/10 transition-colors"
                    style={{ height: HOUR_PX }}
                    aria-label={`Add event ${ds} ${h}:00`}
                  />
                ))}
                {dayEvents.map((e) => (
                  <EventBlock key={e.id} event={e} />
                ))}
              </div>
            );
          })}

          {/* Now line — only when today is in the visible week */}
          {todayIdx >= 0 && (
            <div
              className="pointer-events-none absolute left-[60px] right-0"
              style={{ top: (nowMins / 60) * HOUR_PX }}
            >
              <div className="relative">
                <div
                  className="absolute h-[2px] bg-primary"
                  style={{
                    left: `calc(${todayIdx} * (100% / 7))`,
                    width: `calc(100% / 7)`,
                    boxShadow: "0 0 8px var(--glow), 0 0 16px var(--glow)",
                  }}
                />
                <div
                  className="absolute h-2 w-2 rounded-full bg-primary -translate-y-[3px] -translate-x-1"
                  style={{
                    left: `calc(${todayIdx} * (100% / 7))`,
                    boxShadow: "0 0 8px var(--glow)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const start = parseHM(event.time);
  const end = event.endTime ? parseHM(event.endTime) : start + 60;
  const top = (start / 60) * HOUR_PX;
  const height = Math.max(20, ((end - start) / 60) * HOUR_PX - 2);
  return (
    <div
      className="group absolute left-1 right-1 rounded border border-primary bg-primary/20 px-1.5 py-1 overflow-hidden cursor-default transition-all hover:bg-primary/35 hover:border-primary hover:z-10"
      style={{
        top,
        height,
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--glow) 25%, transparent)",
      }}
      title={`${event.title} — ${fmt12(event.time)}${event.endTime ? ` – ${fmt12(event.endTime)}` : ""}`}
    >
      <div className="hud-label text-[9px] text-primary truncate group-hover:hud-glow">
        {fmt12(event.time)}
      </div>
      <div className="text-[11px] text-foreground truncate font-medium">{event.title}</div>
      {/* tooltip */}
      <div className="absolute z-20 left-full ml-2 top-0 hidden group-hover:block bg-popover border border-primary rounded px-2 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
        <div className="text-xs text-foreground font-medium">{event.title}</div>
        <div className="hud-label text-[9px] text-muted-foreground mt-0.5">
          {fmt12(event.time)}
          {event.endTime ? ` – ${fmt12(event.endTime)}` : ""}
        </div>
        {event.reminder ? (
          <div className="hud-label text-[9px] text-primary mt-0.5 flex items-center gap-1">
            <Bell className="h-2.5 w-2.5" /> {event.reminder} min before
          </div>
        ) : null}
      </div>
    </div>
  );
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
    const tick = () => {
      const now = Date.now();
      events.forEach((e) => {
        if (!e.reminder) return;
        const trigger = eventStartMs(e) - e.reminder * 60_000;
        // fire window: trigger reached within last 60s and not yet fired
        if (trigger <= now && now - trigger < 60_000 && !firedRef.current.has(e.id)) {
          firedRef.current.add(e.id);
          setPopups((prev) => [
            ...prev,
            { id: e.id + ":" + now, title: e.title, time: e.time, date: e.date },
          ]);
        }
      });
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
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
