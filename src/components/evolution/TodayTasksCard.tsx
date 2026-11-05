import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { useEvolutionData } from "@/lib/evolution-data";
import { localISO } from "@/lib/utils";

/**
 * Today's Tasks — same data as the Home calendar card's "Today's Task Schedule"
 * panel, shown as its own card so it can sit beside the week view.
 */
export function TodayTasksCard() {
  const { data } = useEvolutionData();
  const todayKey = localISO(new Date());

  const todayTasks = useMemo(
    () => (data.evoTasks ?? []).filter((task) => task.due === todayKey),
    [data.evoTasks, todayKey],
  );
  const todayEvents = useMemo(
    () =>
      (data.calendar ?? [])
        .filter((event) => event.date === todayKey)
        .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [data.calendar, todayKey],
  );

  const done = todayTasks.filter((task) => task.status === "Done").length;

  return (
    <section className="hud-card hud-scan p-5 flex flex-col min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-full border border-primary/50 flex items-center justify-center bg-primary/10">
          <ListChecks className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="hud-label text-sm text-primary hud-glow">Today&apos;s Tasks</h3>
          <div className="hud-label text-[10px] text-muted-foreground">
            {done}/{todayTasks.length} tasks completed · {todayEvents.length} scheduled
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
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
    </section>
  );
}
