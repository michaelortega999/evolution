import { useMemo, useState } from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useEvolutionData } from "@/lib/evolution-data";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
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
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string>(
    fmtDate(today.getFullYear(), today.getMonth(), today.getDate()),
  );
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
    <div className="hud-card p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <CalIcon className="h-4 w-4 text-primary" />
        <div className="hud-label text-sm">Calendar</div>
      </div>

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
                "relative aspect-square text-[11px] rounded border transition-colors flex items-center justify-center",
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

      <Link
        to="/calendar"
        className="hud-label text-[10px] text-primary hud-glow mt-3 hover:underline"
      >
        VIEW DETAILS →
      </Link>
    </div>
  );
}
