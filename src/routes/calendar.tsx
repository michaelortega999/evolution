import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalIcon, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { useEvolutionData, type CalendarEvent } from "@/lib/evolution-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Evolution" }] }),
  component: CalendarPage,
});

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CalendarPage() {
  const { data, mutate } = useEvolutionData();
  const events = data.calendar ?? [];
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");

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

  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => { (m[e.date] ||= []).push(e); });
    return m;
  }, [events]);

  const upcoming = useMemo(() => {
    const today = ymd(new Date());
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 8);
  }, [events]);

  function addEvent() {
    if (!selected || !title.trim()) return;
    const ev: CalendarEvent = {
      id: crypto.randomUUID(),
      date: selected,
      time,
      title: title.trim(),
    };
    mutate((p) => ({ calendar: [...(p.calendar ?? []), ev] }));
    setTitle("");
  }

  function delEvent(id: string) {
    mutate((p) => ({ calendar: (p.calendar ?? []).filter((e) => e.id !== id) }));
  }

  const todayStr = ymd(new Date());

  return (
    <ModuleLayout number="" title="Calendar" subtitle="Schedule and events" icon={CalIcon}>
      <Panel title={`MONTH · ${monthLabel.toUpperCase()}`}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary">‹ Prev</button>
          <button onClick={() => setCursor(new Date())}
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary">Today</button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary">Next ›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="hud-label text-[10px] text-muted-foreground text-center py-1">{d}</div>
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
                onClick={() => setSelected(ds)}
                className={cn(
                  "aspect-square border rounded p-1 flex flex-col items-start text-left transition-colors hover:bg-primary/10",
                  isSelected ? "border-primary bg-primary/15" : "border-border",
                  isToday && "ring-1 ring-primary"
                )}
              >
                <span className={cn("hud-label text-[11px]", isToday ? "text-primary hud-glow" : "text-foreground/80")}>
                  {d.getDate()}
                </span>
                <div className="flex flex-col gap-0.5 mt-0.5 w-full overflow-hidden">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span key={e.id} className="text-[9px] truncate text-primary bg-primary/10 px-1 rounded">
                      {e.time} {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      {selected && (
        <Panel title={`ADD EVENT · ${selected}`}>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="hud-label text-[10px] text-muted-foreground">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
                className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="hud-label text-[10px] text-muted-foreground">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="mt-1 bg-input border border-border rounded px-3 py-2 text-sm text-foreground" />
            </div>
            <button onClick={addEvent}
              className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary text-primary hud-label text-xs rounded hover:bg-primary/25">
              <Plus className="h-4 w-4" /> Add
            </button>
            <button onClick={() => setSelected(null)} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </Panel>
      )}

      <Panel title="UPCOMING">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events. Click a day on the calendar to add one.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3 p-3 border border-border rounded bg-primary/5">
                <div className="hud-label text-[11px] text-primary w-28 shrink-0">{e.date} · {e.time}</div>
                <div className="flex-1 text-sm text-foreground truncate">{e.title}</div>
                <button onClick={() => delEvent(e.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </ModuleLayout>
  );
}
