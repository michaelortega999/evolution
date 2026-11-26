import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Files } from "lucide-react";
import { Panel } from "@/components/evolution/ModuleLayout";
import { useEvolutionData, type CalendarEvent, type ReminderOffset } from "@/lib/evolution-data";
import { FocusModeCard } from "@/components/evolution/FocusModeCard";
import { TodayTasksCard } from "@/components/evolution/TodayTasksCard";
import { WeeklyTasksCard } from "@/components/evolution/WeeklyTasksCard";
import { cn } from "@/lib/utils";

const HOUR_PX = 48;

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
  const day = d.getDay();
  const diff = (day + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function EventBlock({
  event,
  onSelect,
  onDuplicate,
}: {
  event: CalendarEvent;
  onSelect: () => void;
  onDuplicate: () => void;
}) {
  const start = parseHM(event.time);
  const end = event.endTime ? parseHM(event.endTime) : start + 60;
  const top = (start / 60) * HOUR_PX;
  const height = Math.max(24, ((end - start) / 60) * HOUR_PX - 2);
  return (
    <div
      className="group absolute left-1 right-1 rounded border border-primary bg-primary/20 px-1.5 py-1 overflow-hidden text-left transition-all hover:bg-primary/35 hover:z-10 cursor-pointer"
      style={{
        top,
        height,
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--glow) 25%, transparent)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      title={`${event.title} — ${fmt12(event.time)}${event.endTime ? ` – ${fmt12(event.endTime)}` : ""} (click to edit)`}
      role="button"
      tabIndex={0}
    >
      <div className="hud-label text-[9px] text-primary truncate group-hover:hud-glow">
        {fmt12(event.time)}
      </div>
      <div className="text-[11px] text-foreground truncate font-medium">{event.title}</div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary hover:text-[#00f0ff] hover:drop-shadow-[0_0_4px_#00f0ff]"
        aria-label="Duplicate event"
        title="Duplicate event"
        type="button"
      >
        <Files className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export function WeekViewCard() {
  const { data, mutate } = useEvolutionData();
  const events = data.calendar ?? [];
  const [weekCursor, setWeekCursor] = useState(() => startOfWeek(new Date()));

  const [formDate, setFormDate] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [slotDrag, setSlotDrag] = useState<{ date: string; start: number; current: number } | null>(null);
  const draggedSlot = useRef(false);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekCursor, i)),
    [weekCursor],
  );
  const dayKeys = days.map(ymd);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const todayStr = ymd(now);
  const todayIdx = dayKeys.indexOf(todayStr);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const rangeLabel = `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  function openForm(ds: string, startHM: string, endHM?: string) {
    setEditId(null);
    setFormDate(ds);
    setTime(startHM);
    setEndTime(endHM ?? fmtHM(Math.min(23 * 60 + 59, parseHM(startHM) + 60)));
    setTitle("");
  }

  function openEdit(ev: CalendarEvent) {
    setEditId(ev.id);
    setFormDate(ev.date);
    setTime(ev.time);
    setEndTime(ev.endTime ?? fmtHM(Math.min(23 * 60 + 59, parseHM(ev.time) + 60)));
    setTitle(ev.title);
  }

  function closeForm() {
    setFormDate(null);
    setEditId(null);
    setTitle("");
  }

  function parseEventDate(ds: string) {
    const [y, m, d] = ds.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function duplicateEvent(ev: CalendarEvent) {
    const next = parseEventDate(ev.date);
    next.setDate(next.getDate() + 1);
    const copy: CalendarEvent = {
      id: crypto.randomUUID(),
      date: ymd(next),
      time: ev.time,
      endTime: ev.endTime,
      title: ev.title,
      reminder: ev.reminder,
    };
    mutate((p) => ({ calendar: [...(p.calendar ?? []), copy] }));
  }

  function saveEvent() {
    if (!formDate || !title.trim()) return;
    if (editId) {
      mutate((p) => ({
        calendar: (p.calendar ?? []).map((e) =>
          e.id === editId ? { ...e, date: formDate, time, endTime, title: title.trim() } : e,
        ),
      }));
    } else {
      const ev: CalendarEvent = {
        id: crypto.randomUUID(),
        date: formDate,
        time,
        endTime,
        title: title.trim(),
        reminder: 0 as ReminderOffset,
      };
      mutate((p) => ({ calendar: [...(p.calendar ?? []), ev] }));
    }
    closeForm();
  }

  function deleteEvent() {
    if (!editId) return;
    mutate((p) => ({ calendar: (p.calendar ?? []).filter((e) => e.id !== editId) }));
    closeForm();
  }

  function minutesAtPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const raw = ((event.clientY - rect.top) / rect.height) * 24 * 60;
    return Math.max(0, Math.min(23 * 60 + 45, Math.round(raw / 15) * 15));
  }

  function startSlotDrag(event: ReactPointerEvent<HTMLDivElement>, date: string) {
    if (event.button !== 0) return;
    const minute = minutesAtPointer(event);
    draggedSlot.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSlotDrag({ date, start: minute, current: minute });
  }

  function moveSlotDrag(event: ReactPointerEvent<HTMLDivElement>, date: string) {
    if (!slotDrag || slotDrag.date !== date) return;
    const minute = minutesAtPointer(event);
    if (minute !== slotDrag.start) draggedSlot.current = true;
    setSlotDrag((active) => active && active.date === date ? { ...active, current: minute } : active);
  }

  function endSlotDrag(event: ReactPointerEvent<HTMLDivElement>, date: string) {
    if (!slotDrag || slotDrag.date !== date) return;
    const endMinute = minutesAtPointer(event);
    const start = Math.min(slotDrag.start, endMinute);
    const finish = Math.max(slotDrag.start, endMinute) + (draggedSlot.current ? 15 : 60);
    setSlotDrag(null);
    openForm(date, fmtHM(start), fmtHM(Math.min(24 * 60 - 1, finish)));
  }


  return (
    <div className="flex flex-col gap-3">
      <Panel title={`WEEK · ${rangeLabel.toUpperCase()}`}>
        <div className={cn("grid gap-3", formDate && "lg:grid-cols-[minmax(0,1fr)_230px]")}>
          {formDate && (
            <aside className="self-start rounded-lg border border-primary/40 bg-primary/5 p-3 shadow-[inset_0_0_18px_color-mix(in_srgb,var(--primary)_10%,transparent)] lg:order-2">
              <div className="hud-label text-[10px] text-primary">{editId ? "EDIT EVENT" : "NEW EVENT"}</div>
              <p className="mt-1 text-sm text-foreground">{new Date(`${formDate}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
              <div className="mt-3 space-y-2">
                <input aria-label="Event title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} autoFocus placeholder="Event title" className="w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground" />
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="Start time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="min-w-0 rounded border border-border bg-input px-2 py-2 text-sm text-foreground" />
                  <input aria-label="End time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="min-w-0 rounded border border-border bg-input px-2 py-2 text-sm text-foreground" />
                </div>
                <button onClick={saveEvent} className="w-full rounded border border-primary px-3 py-2 hud-label text-[10px] text-primary hover:bg-primary/10">{editId ? "Save changes" : "Add event"}</button>
                {editId && <button onClick={deleteEvent} className="w-full rounded border border-destructive px-3 py-2 hud-label text-[10px] text-destructive hover:bg-destructive/10">Delete event</button>}
                <button onClick={closeForm} className="w-full rounded border border-border px-3 py-2 hud-label text-[10px] text-muted-foreground hover:bg-muted/20">Cancel</button>
              </div>
            </aside>
          )}
          <div className="min-w-0 lg:order-1">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekCursor(addDays(weekCursor, -7))}
            aria-label="Previous week"
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary flex flex-col items-center leading-none gap-1"
          >
            <span aria-hidden="true" className="text-base">
              ‹
            </span>
            Prev
          </button>
          <button
            onClick={() => setWeekCursor(startOfWeek(new Date()))}
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekCursor(addDays(weekCursor, 7))}
            aria-label="Next week"
            className="px-3 py-1 border border-border rounded hud-label text-[10px] hover:bg-primary/10 text-primary flex flex-col items-center leading-none gap-1"
          >
            <span aria-hidden="true" className="text-base">
              ›
            </span>
            Next
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
                className={cn("text-center py-2 border-l border-border", isToday && "bg-primary/5")}
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
        <div className="overflow-auto max-h-[640px] no-scrollbar">
          <div
            className="relative grid"
            style={{ gridTemplateColumns: `60px repeat(7, minmax(0, 1fr))` }}
          >
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

            {days.map((d) => {
              const ds = ymd(d);
              const dayEvents = events.filter((e) => e.date === ds);
              const isToday = ds === todayStr;
              return (
                <div
                  key={ds}
                  className={cn("relative border-l border-border select-none", isToday && "bg-primary/[0.03]")}
                  role="gridcell"
                  aria-label={`Create event on ${ds}. Click for one hour or drag to set a duration.`}
                  onPointerDown={(event) => startSlotDrag(event, ds)}
                  onPointerMove={(event) => moveSlotDrag(event, ds)}
                  onPointerUp={(event) => endSlotDrag(event, ds)}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div
                      key={h}
                      className="w-full border-b border-border/40 pointer-events-none"
                      style={{ height: HOUR_PX }}
                    />
                  ))}
                  {slotDrag?.date === ds && (
                    <div
                      className="pointer-events-none absolute left-1 right-1 rounded border border-primary bg-primary/20"
                      style={{
                        top: (Math.min(slotDrag.start, slotDrag.current) / 60) * HOUR_PX,
                        height: Math.max(24, ((Math.abs(slotDrag.current - slotDrag.start) + 15) / 60) * HOUR_PX),
                      }}
                    />
                  )}
                  {dayEvents.map((e) => (
                    <EventBlock key={e.id} event={e} onSelect={() => openEdit(e)} onDuplicate={() => duplicateEvent(e)} />
                  ))}
                </div>
              );
            })}

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
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-start" aria-label="Week planning cards">
        <div className="min-w-0">
          <WeeklyTasksCard />
        </div>
        <div className="grid gap-4 min-w-0">
          <TodayTasksCard />
          <FocusModeCard />
        </div>
      </div>

    </div>
  );
}
