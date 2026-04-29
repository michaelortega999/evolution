import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ImageIcon, Target, Play, Pause, RotateCcw } from "lucide-react";
import { useEvolutionData } from "@/lib/evolution-data";
import { type HologramKey } from "@/lib/holograms";
import { HologramEmblem } from "./HologramEmblem";
import { HologramPicker } from "./HologramPicker";
import { NotesCard } from "./ModuleCards";
import { useFocusTimer, formatMmSs, modeLabel } from "@/lib/use-focus-timer";

export function DashboardHologram() {
  const { data, updateProfile } = useEvolutionData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const timer = useFocusTimer();

  const hologram: HologramKey = (data.profile.hologram as HologramKey) ?? "bonsai";
  const pct = timer.totalMs > 0 ? Math.max(0, Math.min(100, (timer.remainingMs / timer.totalMs) * 100)) : 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 h-auto lg:h-[280px] lg:items-stretch">
      {/* LEFT — Core Mindset */}
      <div className="hud-card p-5 flex flex-col gap-4">
        <span className="hud-label text-[10px] text-primary tracking-[0.3em]">CORE MINDSET</span>
        <p className="italic text-foreground/90 text-sm leading-relaxed">
          “You are the sum of your decisions. Today, you stop drifting. Today, you evolve.”
        </p>
        <div className="hud-label text-[10px] text-muted-foreground tracking-[0.3em]">
          DISCIPLINE · FOCUS · FREEDOM
        </div>
        <div className="mt-auto">
          <Sparkline data={[12, 18, 15, 22, 28, 24, 31, 29, 36, 34, 42, 48]} height={56} />
        </div>
      </div>

      {/* CENTER — Hologram */}
      <div className="hud-card hud-scan relative overflow-hidden flex items-center justify-center group h-full">
        <button
          onClick={() => setPickerOpen(true)}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/40 bg-background/60 backdrop-blur text-primary hud-label text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/15"
          style={{ boxShadow: "0 0 12px var(--primary)" }}
          title="Choose your hologram"
        >
          <ImageIcon className="h-3 w-3" /> Choose Image
        </button>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--glow) 14%, transparent) 0%, transparent 65%)",
          }}
        />

        <HologramEmblem kind={hologram} size={250} />
      </div>

      {/* RIGHT — Focus Mode */}
      <Link to="/focus" className="hud-card p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors group">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <div className="hud-label text-sm">Focus Mode</div>
        </div>
        <div className="hud-label text-primary hud-glow text-3xl tabular-nums tracking-wider text-center">
          {formatMmSs(timer.remainingMs)}
        </div>
        <div className="hud-label text-[10px] text-center text-muted-foreground">
          {modeLabel(timer.mode)} · Round {timer.round} of {timer.settings.longEvery}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }}
          />
        </div>
        <div className="flex gap-2 mt-auto pt-2 border-t border-border">
          <button
            onClick={(e) => { e.preventDefault(); timer.running ? timer.pause() : timer.start(); }}
            className="flex-1 h-8 rounded-md border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10 flex items-center justify-center gap-1.5"
          >
            {timer.running ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); timer.reset(); }}
            className="h-8 w-8 rounded-md border border-border text-foreground/70 hover:text-primary hover:border-primary/40 flex items-center justify-center"
            aria-label="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </Link>

      <HologramPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={hologram}
        onSelect={(key) => updateProfile({ hologram: key })}
      />
    </section>
  );
}
