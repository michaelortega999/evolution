import { Bell, Target, RotateCcw } from "lucide-react";
import { RingProgress } from "./RingProgress";
import { useEvolutionData } from "@/lib/evolution-data";

export function TopBar() {
  const { data, reset } = useEvolutionData();
  const name = data.profile.name || "Operator";
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const NOTES_GOAL = 10;
  const notesCount = data.notes.length;
  const dailyProgress = Math.min(100, Math.round((notesCount / NOTES_GOAL) * 100));
  const progressLabel = dailyProgress >= 100 ? "Complete" : dailyProgress >= 60 ? "On Track" : "Behind";

  return (
    <div className="hud-card p-5 flex items-center justify-between gap-6 flex-wrap">
      <div className="flex-1 min-w-[260px]">
        <h1 className="hud-label text-xl text-foreground hud-glow">Good morning, {name}.</h1>
        <p className="text-sm text-muted-foreground mt-1 tracking-wide">
          Discipline. Focus. Consistency. Freedom.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => { if (confirm("Reset all data and onboarding?")) reset(); }}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-primary/10 text-primary hud-label text-[10px]"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>

        <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-primary/5">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <div className="hud-label text-[9px] text-muted-foreground">Focus Mode</div>
            <div className="hud-label text-xs text-primary hud-glow">Active</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-primary/5">
          <RingProgress value={89} size={40} label="89%" />
          <div>
            <div className="hud-label text-[9px] text-muted-foreground">Daily Progress</div>
            <div className="hud-label text-xs text-primary">On Track</div>
          </div>
        </div>

        <div className="hidden md:block px-4 py-2 border border-border rounded-md">
          <div className="hud-label text-[9px] text-muted-foreground">{dayName}</div>
          <div className="hud-label text-xs text-foreground">{dateStr}</div>
          <div className="hud-label text-[10px] text-primary hud-glow">{timeStr}</div>
        </div>

        <button className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-primary hover:bg-primary/10 transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" style={{ boxShadow: "0 0 6px currentColor" }} />
        </button>
      </div>
    </div>
  );
}
