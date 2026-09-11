import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckSquare, Zap, Wallet, Apple, Dumbbell, TrendingUp,
  Briefcase, Star, Home, Calendar, Bell, ClipboardList,
  Hourglass, Play, Pause, RotateCcw, ChevronRight, BookOpen, Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useEvolutionData, todayDate, dayTotals, fitnessSummary,
  tradingTotals, wealthSummary,
} from "@/lib/evolution-data";
import { hologramSrc } from "@/lib/holograms";
import { useFocusTimer, formatMmSs } from "@/lib/use-focus-timer";
import { HoloIcon, type HoloVariant } from "./HoloIcon";
import { HologramEmblem } from "./HologramEmblem";

type Priority = "High" | "Medium" | "Low";

const PRIORITY_STYLES: Record<Priority, { badge: string; dot: string }> = {
  High:   { badge: "text-purple-300 border-purple-400/60 bg-purple-500/10", dot: "#a855f7" },
  Medium: { badge: "text-orange-300 border-orange-400/60 bg-orange-500/10", dot: "#f97316" },
  Low:    { badge: "text-emerald-300 border-emerald-400/60 bg-emerald-500/10", dot: "#22c55e" },
};

const CYAN = "#00d4ff";
const glowText = `0 0 10px rgba(0,212,255,0.6)`;

const MODULE_ACCENTS: Record<HoloVariant | "focus", string> = {
  wealth: "var(--module-wealth)",
  nutrition: "var(--module-nutrition)",
  fitness: "var(--module-fitness)",
  journal: "var(--module-journal)",
  notes: "var(--module-notes)",
  investing: "var(--module-investing)",
  business: "var(--module-business)",
  hobby: "var(--module-hobby)",
  focus: "var(--module-focus)",
};

function HoloArt({ icon: Icon, label, variant }: { icon: LucideIcon; label: string; variant?: HoloVariant }) {
  const accent = MODULE_ACCENTS[variant ?? "focus"];
  return (
    <div className="mobile-holo mobile-holo--feature" style={{ color: accent, "--glow": accent } as React.CSSProperties} aria-label={label}>
      {variant ? <HoloIcon variant={variant} /> : (
        <div className="mobile-focus-holo" aria-hidden="true">
          <span className="mobile-focus-holo__orbit" />
          <span className="mobile-focus-holo__orbit mobile-focus-holo__orbit--tilted" />
          <Icon className="mobile-focus-holo__icon" strokeWidth={1.2} />
          <span className="mobile-focus-holo__base" />
          <span className="mobile-focus-holo__scan" />
        </div>
      )}
    </div>
  );
}

/**
 * Radial module hub — module rings arranged around the screen with
 * chamfered conduit traces converging into the central bonsai emblem.
 * Structure follows the reference: FOCUS top-center, NUTRITION/FITNESS
 * upper sides, WEALTH/INVESTING mid sides, JOURNAL/BUSINESS lower sides,
 * bonsai ring at bottom-center. All geometry lives in a 350×420 space.
 */
const HUB_NODES: { icon: LucideIcon; label: string; sys: string; to: string; x: number; y: number }[] = [
  { icon: Target,     label: "FOCUS",     sys: "SYS·04", to: "/focus",     x: 175, y: 44 },
  { icon: Apple,      label: "NUTRITION", sys: "SYS·03", to: "/nutrition", x: 70,  y: 150 },
  { icon: Dumbbell,   label: "FITNESS",   sys: "SYS·02", to: "/fitness",   x: 284, y: 150 },
  { icon: Wallet,     label: "WEALTH",    sys: "SYS·01", to: "/wealth",    x: 48,  y: 262 },
  { icon: TrendingUp, label: "INVESTING", sys: "SYS·05", to: "/investing", x: 302, y: 262 },
  { icon: BookOpen,   label: "JOURNAL",   sys: "SYS·07", to: "/journal",   x: 66,  y: 374 },
  { icon: Briefcase,  label: "BUSINESS",  sys: "SYS·06", to: "/business",  x: 284, y: 374 },
];

// chamfered conduit traces — each gets a dedicated vertical channel so no
// trace ever crosses a module ring. Left channels: x=120 (wealth) / x=130
// (nutrition); right channels: x=230 (investing) / x=224 (fitness).
const HUB_TRACES: string[] = [
  "M175 76 L175 418",                                                            // focus — straight trunk
  "M70 182 L70 204 L82 216 L118 216 L130 228 L130 425 L138 433",                 // nutrition
  "M284 182 L284 204 L272 216 L236 216 L224 228 L224 425 L212 433",              // fitness
  "M48 294 L48 318 L60 330 L108 330 L120 342 L120 457 L123 465",                 // wealth
  "M302 294 L302 318 L290 330 L242 330 L230 342 L230 457 L227 465",              // investing
  "M66 406 L66 472 L78 484 L128 484 L138 494 L138 500",                          // journal — low left rim
  "M284 406 L284 472 L272 484 L222 484 L212 494 L212 500",                       // business — low right rim
];

const HUB_TERMINALS: [number, number][] = [
  [175, 76], [70, 182], [284, 182], [48, 294], [302, 294], [66, 406], [284, 406],
];

const HUB_BENDS: [number, number][] = [
  [70, 204], [82, 216], [118, 216], [130, 228], [130, 425],
  [284, 204], [272, 216], [236, 216], [224, 228], [224, 425],
  [48, 318], [60, 330], [108, 330], [120, 342], [120, 457],
  [302, 318], [290, 330], [242, 330], [230, 342], [230, 457],
  [66, 472], [78, 484], [128, 484], [138, 494],
  [284, 472], [272, 484], [222, 484], [212, 494],
];

const HUB_RIM_ENDS: [number, number][] = [
  [175, 418], [138, 433], [212, 433], [123, 465], [227, 465], [138, 500], [212, 500],
];

function ModuleHub({ onUnlock }: { onUnlock: () => void }) {
  const bonsai = hologramSrc("bonsai");
  const px = (x: number) => `${(x / 350) * 100}%`;
  const py = (y: number) => `${(y / 420) * 100}%`;

  return (
    <div className="mt-auto flex-1 min-h-0 flex flex-col animate-fade-in">
      <div className="relative flex-1 min-h-[400px]">
        {/* corner frame brackets, like the reference HUD */}
        {[
          "top-0 left-0",
          "top-0 right-0 -scale-x-100",
          "bottom-0 left-0 -scale-y-100",
          "bottom-0 right-0 -scale-100",
        ].map((pos, i) => (
          <svg key={i} viewBox="0 0 60 60" className={`absolute ${pos} h-12 w-12 pointer-events-none`} aria-hidden="true">
            <path
              d="M2 58 L2 18 L10 10 L18 2 L58 2"
              fill="none"
              stroke={CYAN}
              strokeWidth="1.2"
              opacity="0.55"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,212,255,0.6))" }}
            />
            <path d="M9 58 L9 24 L16 17 L24 9 L58 9" fill="none" stroke={CYAN} strokeWidth="0.5" opacity="0.3" />
            <circle cx="2" cy="58" r="1.4" fill={CYAN} opacity="0.7" />
            <circle cx="58" cy="2" r="1.4" fill={CYAN} opacity="0.7" />
          </svg>
        ))}

        {/* conduit circuit traces */}
        <svg viewBox="0 0 350 420" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#hub-glow)" fill="none">
            {HUB_TRACES.map((d, i) => (
              <g key={i}>
                {/* dim parallel echo trace (Jarvis double-wire look) */}
                <path d={d} stroke={CYAN} strokeWidth="0.5" opacity="0.3" transform="translate(1.8 1.8)" />
                {/* main trace */}
                <path d={d} stroke={CYAN} strokeWidth="1" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ))}
          </g>
          {/* hollow terminal rings where traces leave each module */}
          {HUB_TERMINALS.map(([x, y], i) => (
            <circle
              key={`t${i}`}
              cx={x}
              cy={y}
              r="2.6"
              fill="none"
              stroke={CYAN}
              strokeWidth="0.9"
              style={{ filter: "drop-shadow(0 0 4px #00d4ff)" }}
            />
          ))}
          {/* glow nodes at each chamfered bend */}
          {HUB_BENDS.map(([x, y], i) => (
            <circle key={`b${i}`} cx={x} cy={y} r="1.2" fill={CYAN} opacity="0.9" style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }} />
          ))}
          {/* bright junction nodes where traces land on the bonsai rim */}
          {HUB_RIM_ENDS.map(([x, y], i) => (
            <circle key={`r${i}`} cx={x} cy={y} r="1.8" fill={CYAN} style={{ filter: "drop-shadow(0 0 5px #00d4ff)" }} />
          ))}
        </svg>

        {/* module rings */}
        {HUB_NODES.map(({ icon: Icon, label, sys, to, x, y }) => (
          <Link
            key={label}
            to={to}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
            style={{ left: px(x), top: py(y) }}
          >
            <div
              className="relative h-16 w-16 transition-transform group-active:scale-95"
              style={{ color: CYAN, "--glow": CYAN } as React.CSSProperties}
            >
              {/* outer ring */}
              <span
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: "rgba(0,212,255,0.55)", boxShadow: "0 0 14px rgba(0,212,255,0.35), inset 0 0 12px rgba(0,212,255,0.15)" }}
              />
              {/* dashed inner ring */}
              <span
                className="absolute inset-1.5 rounded-full border border-dashed animate-[spin_14s_linear_infinite]"
                style={{ borderColor: "rgba(0,212,255,0.3)" }}
              />
              {/* tilted orbital ellipse */}
              <span
                className="absolute rounded-[50%] border -rotate-12"
                style={{
                  width: "138%",
                  height: "58%",
                  left: "-19%",
                  top: "21%",
                  borderColor: "rgba(0,212,255,0.35)",
                  transform: "rotate(-14deg)",
                }}
              />
              <Icon
                className="absolute inset-0 m-auto h-7 w-7"
                strokeWidth={1.4}
                style={{ filter: "drop-shadow(0 0 8px rgba(0,212,255,0.9))" }}
              />
              {/* top + bottom ring nodes */}
              <span className="absolute left-1/2 -translate-x-1/2 -top-[3px] h-[5px] w-[5px] rounded-full" style={{ background: CYAN, boxShadow: "0 0 6px #00d4ff" }} />
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] h-[5px] w-[5px] rounded-full" style={{ background: CYAN, boxShadow: "0 0 6px #00d4ff" }} />
            </div>
            <span
              className="hud-label text-[8px] tracking-[0.18em] mt-1.5 leading-none px-1 rounded bg-background/70 z-10"
              style={{ color: CYAN, textShadow: glowText }}
            >
              {label}
            </span>
            <span className="hud-label text-[6px] tracking-[0.22em] text-primary/60 leading-none mt-0.5 px-1 rounded bg-background/70 z-10">
              {sys}
            </span>
          </Link>
        ))}

        {/* bonsai unlock emblem — all traces land on its rim */}
        <button
          onClick={onUnlock}
          className="absolute -translate-x-1/2 -translate-y-1/2 h-[104px] w-[104px] rounded-full flex items-center justify-center z-10"
          style={{ left: px(175), top: py(350) }}
        >
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "rgba(0,212,255,0.75)", boxShadow: "0 0 30px rgba(0,212,255,0.55), inset 0 0 22px rgba(0,212,255,0.3)" }}
          />
          <span
            className="absolute -inset-2 rounded-full border"
            style={{ borderColor: "rgba(0,212,255,0.25)" }}
          />
          <span
            className="absolute inset-2 rounded-full border border-dashed animate-[spin_12s_linear_infinite]"
            style={{ borderColor: "rgba(0,212,255,0.4)" }}
          />
          <img
            src={bonsai}
            alt="Unlock Evolution OS"
            className="h-16 w-16 object-contain"
            style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 14px rgba(0,212,255,0.95))" }}
          />
        </button>
      </div>

      {/* unlock label + footer */}
      <div className="flex flex-col items-center">
        <div
          className="hud-label text-[10px] tracking-[0.4em]"
          style={{ color: CYAN, textShadow: glowText }}
        >
          TAP TO UNLOCK
        </div>
        <div className="w-full px-5 mt-2 pb-2 flex items-end justify-between">
          <div className="hud-label text-[8px] tracking-[0.2em] text-muted-foreground leading-relaxed">
            EVOLUTION OS
            <br />
            v2.1.0
          </div>
          <div className="hud-label text-[8px] tracking-[0.2em] text-muted-foreground text-right leading-relaxed">
            HIGHER STANDARDS.
            <br />
            BRIGHTER DAYS.
          </div>
        </div>
      </div>
    </div>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { data } = useEvolutionData();
  const timer = useFocusTimer();
  const name = data.profile.name || "Operator";
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase();
  const dateStr = now
    .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();

  const openTasks = (data.evoTasks ?? []).filter((t) => t.status !== "Done").slice(0, 5);
  const openCount = (data.evoTasks ?? []).filter((t) => t.status !== "Done").length;

  const today = todayDate();
  const todayFocusSec = (data.focusSessions ?? [])
    .filter((s) => new Date(s.completedAt).toISOString().slice(0, 10) === today)
    .reduce((a, s) => a + s.durationSec, 0);
  const totalRounds = data.focusSettings?.longEvery ?? 4;
  const focusRate = totalRounds > 0 ? Math.min(100, Math.round(((timer.round - 1) / totalRounds) * 100)) : 0;
  const fH = Math.floor(todayFocusSec / 3600);
  const fM = Math.floor((todayFocusSec % 3600) / 60);
  const deepWork = fH > 0 ? `${fH}h ${fM}m` : `${fM}m`;

  return (
    <div className="md:hidden min-h-screen bg-[#02050b] text-foreground flex flex-col relative overflow-x-hidden overflow-y-auto no-scrollbar">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)" }}
      />

      {/* Top bar */}
      <div className="px-5 pt-6 flex items-start justify-between">
        <div>
          <div className="hud-label text-lg tracking-[0.35em] text-foreground">EVOLUTION OS</div>
          <div className="hud-label text-[9px] tracking-[0.2em] text-muted-foreground mt-1 leading-relaxed">
            GROWING TODAY.
            <br />
            BUILDING TOMORROW.
            <br />
            FOREVER.
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button className="text-foreground/80 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full" style={{ background: CYAN, boxShadow: "0 0 6px #00d4ff" }} />
          </button>
          <div className="rounded-md border border-primary/40 px-2.5 py-1.5 text-right" style={{ boxShadow: "0 0 10px rgba(0,212,255,0.15)" }}>
            <div className="hud-label text-[8px] text-muted-foreground tracking-[0.15em]">{dayName}</div>
            <div className="hud-label text-[10px]" style={{ color: CYAN, textShadow: glowText }}>{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Hero bonsai */}
      <div className="relative px-5 mt-4">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 hud-label text-[9px] tracking-[0.25em] text-muted-foreground leading-loose">
          DISCIPLINE
          <br />
          FOCUS
          <br />
          CONSISTENCY
          <br />
          FREEDOM
        </div>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-right hud-label text-[9px] tracking-[0.2em] leading-relaxed" style={{ color: CYAN, textShadow: glowText }}>
          "A BETTER YOU
          <br />
          EVERYDAY."
        </div>
        <div className="relative mx-auto w-64 h-64 flex items-center justify-center mobile-bonsai-hero">
          <HologramEmblem kind="bonsai" size={250} />
        </div>
      </div>

      {/* Greeting bar */}
      <div className="mx-4 mt-2 hud-card hud-scan mobile-hud-card px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="hud-label text-sm tracking-[0.15em] text-foreground">GOOD MORNING, {name.toUpperCase()}.</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Discipline. Focus. Consistency. Freedom.</div>
        </div>
        <div className="shrink-0 flex items-center gap-2 rounded-lg border border-primary/30 px-2.5 py-1.5">
          <div
            className="h-8 w-8 rounded-full border-2"
            style={{
              borderColor: CYAN,
              borderTopColor: "rgba(0,212,255,0.2)",
              boxShadow: "0 0 10px rgba(0,212,255,0.4)",
            }}
          />
          <div>
            <div className="hud-label text-[7px] text-muted-foreground tracking-[0.2em]">SYSTEM STATUS</div>
            <div className="hud-label text-[10px]" style={{ color: CYAN, textShadow: glowText }}>OPTIMAL</div>
          </div>
        </div>
      </div>

      {/* Tasks + Focus cards */}
      <div className="mx-4 mt-8 grid grid-cols-2 gap-3">
        {/* Today's Tasks */}
        <div className="hud-card hud-scan mobile-hud-card p-3 flex flex-col relative">
          <div className="mobile-holo mobile-holo--tasks">
            <HoloArt icon={ClipboardList} label="Tasks" variant="notes" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckSquare className="h-3.5 w-3.5 shrink-0" style={{ color: CYAN, filter: "drop-shadow(0 0 4px #00d4ff)" }} />
              <span className="hud-label text-[10px] tracking-[0.15em] text-foreground truncate">TODAY'S TASKS</span>
            </div>
          </div>
          <ul className="flex flex-col gap-2 mt-24">
            {openTasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 min-w-0">
                <span className="h-3.5 w-3.5 rounded-full border border-white/30 shrink-0" />
                <span className="text-[11px] text-foreground/85 truncate">{t.text}</span>
              </li>
            ))}
            {openTasks.length === 0 && (
              <li className="text-[10px] text-muted-foreground italic">No open tasks.</li>
            )}
          </ul>
          <Link
            to="/notes"
            className="mt-auto pt-3 flex items-center justify-center gap-1.5 rounded-md border border-primary/40 py-2 hud-label text-[9px] tracking-[0.2em]"
            style={{ color: CYAN, textShadow: glowText }}
          >
            VIEW ALL TASKS <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Focus Mode */}
        <div className="hud-card hud-scan mobile-hud-card p-3 flex flex-col">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: CYAN, filter: "drop-shadow(0 0 4px #00d4ff)" }} />
            <span className="hud-label text-[10px] tracking-[0.15em] text-foreground">FOCUS MODE</span>
          </div>
          <div className="hud-label text-[7px] tracking-[0.2em] text-muted-foreground mt-0.5">ONE TASK AT A TIME</div>
          <HoloArt icon={Hourglass} label="Focus" />
          <div className="text-center">
            <div className="hud-label text-3xl tabular-nums tracking-wider" style={{ color: CYAN, textShadow: "0 0 14px rgba(0,212,255,0.7)" }}>
              {formatMmSs(timer.remainingMs)}
            </div>
            <div className="hud-label text-[8px] tracking-[0.2em] text-muted-foreground mt-0.5">
              ROUND {timer.round} OF {totalRounds}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              {Array.from({ length: totalRounds }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={
                    i < timer.round
                      ? { background: CYAN, boxShadow: "0 0 6px #00d4ff" }
                      : { background: "rgba(255,255,255,0.12)" }
                  }
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            <button
              onClick={() => timer.reset()}
              className="rounded-md border border-primary/40 py-1.5 flex flex-col items-center gap-0.5 hud-label text-[7px]"
              style={{ color: CYAN }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> RESTART
            </button>
            <button
              onClick={() => timer.start()}
              className="rounded-md py-1.5 flex flex-col items-center gap-0.5 hud-label text-[7px] text-[#02050b]"
              style={{ background: CYAN, boxShadow: "0 0 12px rgba(0,212,255,0.5)" }}
            >
              <Play className="h-3.5 w-3.5" /> START
            </button>
            <button
              onClick={() => timer.pause()}
              className="rounded-md border border-primary/40 py-1.5 flex flex-col items-center gap-0.5 hud-label text-[7px]"
              style={{ color: CYAN }}
            >
              <Pause className="h-3.5 w-3.5" /> PAUSE
            </button>
          </div>
          <div className="mt-2.5 rounded-lg border border-primary/25 p-2">
            <div className="hud-label text-[7px] tracking-[0.2em] text-muted-foreground mb-1.5">FOCUS STATS</div>
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="hud-label text-xs" style={{ color: CYAN, textShadow: glowText }}>{timer.round - 1}/{totalRounds}</div>
                <div className="hud-label text-[6px] text-muted-foreground tracking-[0.15em]">SESSIONS</div>
              </div>
              <div>
                <div className="hud-label text-xs" style={{ color: CYAN, textShadow: glowText }}>{focusRate}%</div>
                <div className="hud-label text-[6px] text-muted-foreground tracking-[0.15em]">FOCUS RATE</div>
              </div>
              <div>
                <div className="hud-label text-xs" style={{ color: CYAN, textShadow: glowText }}>{deepWork}</div>
                <div className="hud-label text-[6px] text-muted-foreground tracking-[0.15em]">DEEP WORK</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Default unlock layer: module holograms wired to the bonsai. */}
      <ModuleHub onUnlock={onUnlock} />
    </div>
  );
}

function ModuleTile({
  icon: Icon, variant, label, value, sub, pct, to,
}: {
  icon: LucideIcon; variant?: HoloVariant; label: string; value: string; sub: string; pct: number;
  to: "/notes" | "/focus" | "/wealth" | "/nutrition" | "/fitness" | "/investing" | "/business" | "/hobby";
}) {
  return (
    <Link
      to={to}
      className="hud-card hud-scan mobile-hud-card mobile-module-card relative p-3 flex flex-col items-center text-center overflow-hidden"
      style={{ "--glow": MODULE_ACCENTS[variant ?? "focus"] } as React.CSSProperties}
    >
      <div className="hud-label text-[9px] tracking-[0.2em] text-foreground/60 self-start">{label}</div>
      <div className="mobile-holo mobile-holo--tile">
        {variant ? <HoloIcon variant={variant} /> : <HoloArt icon={Icon} label={label} />}
      </div>
      <div className="hud-label text-base leading-tight" style={{ color: MODULE_ACCENTS[variant ?? "focus"], textShadow: "0 0 10px color-mix(in oklab, var(--glow) 55%, transparent)" }}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>
      <div className="mt-2 w-full flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, pct))}%`,
              background: "linear-gradient(90deg, #00d4ff, #7cf6ff)",
              boxShadow: "0 0 6px #00d4ff",
            }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground">{Math.round(pct)}%</span>
      </div>
    </Link>
  );
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function MobileDashboard() {
  const { data } = useEvolutionData();
  const { pathname } = useLocation();
  const [stage, setStage] = useState(1);
  const name = data.profile.name || "Operator";

  const today = todayDate();
  const t = dayTotals(today, data.mealLogs);
  const calTarget = data.profile.calorieTarget || 2000;
  const calPct = Math.min(100, Math.round((t.kcal / calTarget) * 100));

  const fit = fitnessSummary(data.fitness, data.profile.gymSessionsTarget);
  const fitPct = fit.target ? Math.min(100, Math.round((fit.daysHit / fit.target) * 100)) : 0;

  const trading = tradingTotals(data.tradingAccounts, data.tradingTxns);
  const wealth = wealthSummary(data);

  const openTasks = (data.evoTasks ?? []).filter((x) => x.status !== "Done");
  const tasksDone = (data.evoTasks ?? []).filter((x) => x.status === "Done").length;
  const totalTasks = (data.evoTasks ?? []).length;
  const tasksPct = totalTasks ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const activeProjects = data.projects.filter((p) => p.status !== "Completed").length;
  const avgProgress = data.projects.length
    ? Math.round(data.projects.reduce((a, p) => a + p.progress, 0) / data.projects.length)
    : 0;

  const hobbyHrs = data.hobby.hours || 0;
  const hobbyH = Math.floor(hobbyHrs);
  const hobbyM = Math.round((hobbyHrs - hobbyH) * 60);
  const hobbyPct = Math.min(100, hobbyHrs * 5);

  const todayFocusSec = (data.focusSessions ?? [])
    .filter((s) => new Date(s.completedAt).toISOString().slice(0, 10) === today)
    .reduce((a, s) => a + s.durationSec, 0);
  const fH = Math.floor(todayFocusSec / 3600);
  const fM = Math.floor((todayFocusSec % 3600) / 60);
  let focusStr = "";
  if (fH > 0 && fM > 0) focusStr = `${fH}hr${fM}m`;
  else if (fH > 0) focusStr = `${fH}hr`;
  else focusStr = `${fM}m`;
  const focusPct = Math.min(100, Math.round((todayFocusSec / (2 * 3600)) * 100));

  const wealthPct = Math.min(100, Math.round((wealth.netWorth / (data.profile.goal || 1)) * 100));
  const investPnl = trading.todayPnl;
  const investPct = Math.min(100, Math.abs(investPnl) / 100);

  const heroSrc = hologramSrc(data.profile.hologram);
  const bonsai = hologramSrc("bonsai");

  const bottomNav: {
    icon: LucideIcon;
    to: "/" | "/notes" | "/focus" | "/wealth" | "/nutrition" | "/fitness" | "/investing" | "/calendar" | "/hobby";
  }[] = [
    { icon: Home, to: "/" },
    { icon: CheckSquare, to: "/notes" },
    { icon: Zap, to: "/focus" },
    { icon: Wallet, to: "/wealth" },
    { icon: Apple, to: "/nutrition" },
    { icon: Dumbbell, to: "/fitness" },
    { icon: TrendingUp, to: "/investing" },
    { icon: Calendar, to: "/calendar" },
    { icon: Star, to: "/hobby" },
  ];

  if (stage === 1) {
    return (
      <LockScreen onUnlock={() => setStage(2)} />
    );
  }

  return (
    <div className="md:hidden min-h-screen bg-[#02050b] text-foreground pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="inline-block">
              <div
                className="hud-label text-sm tracking-[0.35em]"
                style={{ color: "#00d4ff", textShadow: "0 0 10px rgba(0,212,255,0.6)" }}
              >
                EVOLUTION OS
              </div>
              <div
                className="h-[2px] mt-1 rounded-full"
                style={{ background: "linear-gradient(90deg,#00d4ff,transparent)", boxShadow: "0 0 6px #00d4ff" }}
              />
            </div>
            <h1 className="mt-5 text-2xl font-light leading-tight text-foreground">
              Welcome back,
              <br />
              <span style={{ color: "#00d4ff", textShadow: "0 0 12px rgba(0,212,255,0.55)" }}>
                {name}.
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed">
              <span style={{ color: "#00d4ff" }}>Discipline</span>
              <span className="text-muted-foreground"> today.</span>
              <br />
              <span style={{ color: "#00d4ff" }}>Freedom</span>
              <span className="text-muted-foreground"> tomorrow.</span>
            </p>
          </div>
          <div className="shrink-0 -mt-2 -mr-2">
            <img
              src={heroSrc}
              alt=""
              aria-hidden="true"
              className="w-40 h-40 object-contain"
              style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 18px rgba(0,212,255,0.6))" }}
            />
          </div>
        </div>
      </header>

      {/* Module grid */}
      <section className="px-4 grid grid-cols-4 gap-2">
        <ModuleTile icon={CheckSquare} variant="notes" label="TASKS" value={String(openTasks.length)} sub="Tasks Today" pct={tasksPct} to="/notes" />
        <ModuleTile icon={Target} label="FOCUS" value={focusStr} sub="Current Session" pct={focusPct} to="/focus" />
        <ModuleTile icon={Wallet} variant="wealth" label="WEALTH" value={fmtMoney(wealth.netWorth)} sub="Net Worth" pct={wealthPct} to="/wealth" />
        <ModuleTile icon={Apple} variant="nutrition" label="NUTRITION" value={t.kcal.toLocaleString()} sub="Calories Today" pct={calPct} to="/nutrition" />
      </section>
      <section className="px-4 mt-2 grid grid-cols-4 gap-2">
        <ModuleTile icon={Dumbbell} variant="fitness" label="FITNESS" value={String(fit.daysHit)} sub="Sessions" pct={fitPct} to="/fitness" />
        <ModuleTile
          icon={TrendingUp}
          variant="investing"
          label="INVESTING"
          value={`${investPnl >= 0 ? "+" : "-"}${fmtMoney(Math.abs(investPnl))}`}
          sub="Today's P/L"
          pct={investPct}
          to="/investing"
        />
        <ModuleTile icon={Briefcase} variant="business" label="BUSINESS" value={String(activeProjects)} sub="Active Projects" pct={avgProgress} to="/business" />
        <ModuleTile icon={Star} variant="hobby" label="HOBBY" value={`${hobbyH}h ${hobbyM}m`} sub="Time Today" pct={hobbyPct} to="/hobby" />
      </section>

      {/* Tasks & To Do */}
      <section className="mx-4 mt-5 hud-card hud-scan mobile-hud-card p-4">
        <div className="flex items-center justify-between">
          <div className="hud-label text-sm text-foreground tracking-[0.2em]">TASKS &amp; TO DO</div>
          <Link to="/notes" className="text-xs" style={{ color: "#00d4ff" }}>
            View All ›
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-6 border-b border-white/5 text-[11px] hud-label">
          <div className="pb-2 border-b-2" style={{ borderColor: "#00d4ff", color: "#00d4ff" }}>TODAY</div>
          <div className="pb-2 text-muted-foreground">UPCOMING</div>
          <div className="pb-2 text-muted-foreground">COMPLETED</div>
        </div>

        <ul className="mt-3 relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
          {openTasks.slice(0, 5).map((task) => {
            const p = PRIORITY_STYLES[task.priority as Priority] ?? PRIORITY_STYLES.Medium;
            return (
              <li key={task.id} className="relative flex items-center gap-3 py-2.5">
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0 z-10"
                  style={{ background: p.dot, boxShadow: `0 0 8px ${p.dot}` }}
                />
                <span className="h-4 w-4 rounded-full border border-white/25 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{task.text}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{task.category}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{task.due?.slice(5) ?? ""}</div>
                <span className={`shrink-0 text-[10px] hud-label px-2 py-0.5 rounded border ${p.badge}`}>
                  {task.priority.toUpperCase()}
                </span>
              </li>
            );
          })}
          {openTasks.length === 0 && (
            <li className="text-xs text-muted-foreground italic py-2">No open tasks.</li>
          )}
        </ul>
      </section>

      {/* Floating bonsai — tap to return to first screen */}
      <div className="fixed bottom-[calc(56px+max(env(safe-area-inset-bottom),8px))] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        <button
          onClick={() => setStage(1)}
          className="relative h-14 w-14 rounded-full flex items-center justify-center"
          aria-label="Back to lock screen"
        >
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: "rgba(0,212,255,0.7)",
              boxShadow: "0 0 18px rgba(0,212,255,0.45), inset 0 0 12px rgba(0,212,255,0.2)",
            }}
          />
          <span
            className="absolute inset-1 rounded-full border border-dashed animate-[spin_12s_linear_infinite]"
            style={{ borderColor: "rgba(0,212,255,0.35)" }}
          />
          <img
            src={bonsai}
            alt=""
            className="h-9 w-9 object-contain"
            style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 10px rgba(0,212,255,0.85))" }}
          />
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
           style={{ background: "#02050b", borderTop: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center justify-between px-3 py-2 pb-[max(env(safe-area-inset-bottom),8px)]">
          {bottomNav.map(({ icon: Icon, to }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="h-10 w-10 rounded-md flex items-center justify-center"
                style={
                  active
                    ? {
                        border: "1px solid #00d4ff",
                        background: "rgba(0,212,255,0.12)",
                        boxShadow: "0 0 10px rgba(0,212,255,0.5)",
                      }
                    : undefined
                }
              >
                <Icon
                  className="h-5 w-5"
                  style={{
                    color: active ? "#00d4ff" : "#6b7a8a",
                    filter: active ? "drop-shadow(0 0 6px #00d4ff)" : undefined,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
