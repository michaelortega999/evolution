import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
import hudHub from "@/assets/hud-hub.png.asset.json";

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

function DateTimeCard() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return (
    <div className="rounded-md border border-primary/40 px-3 py-2 text-right" style={{ boxShadow: "0 0 10px rgba(0,212,255,0.15)" }}>
      <div className="flex items-center justify-end gap-1.5">
        <Calendar className="h-3 w-3 text-primary" />
        <span className="hud-label text-[9px] text-primary tracking-[0.3em]">DATE</span>
      </div>
      <div className="hud-label text-[9px] text-muted-foreground mt-1">{dayName}</div>
      <div className="hud-label text-xs text-foreground">{dateStr}</div>
      <div className="hud-label text-base text-primary hud-glow">{timeStr}</div>
    </div>
  );
}

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
 * Radial module hub — the uploaded HUD artwork is used as-is as the
 * background. Invisible hotspots sit over each hologram icon and the
 * bonsai emblem. No geometry is redrawn.
 */
const HUB_HOTSPOTS: { label: string; to: string; x: number; y: number; size: number }[] = [
  { label: "Focus",     to: "/focus",     x: 50.0, y: 9.7,  size: 20 },
  { label: "Nutrition", to: "/nutrition", x: 25.3, y: 18.0, size: 20 },
  { label: "Fitness",   to: "/fitness",   x: 74.6, y: 18.0, size: 20 },
  { label: "Wealth",    to: "/wealth",    x: 13.4, y: 35.7, size: 20 },
  { label: "Investing", to: "/investing", x: 86.6, y: 35.8, size: 20 },
  { label: "Journal",   to: "/journal",   x: 15.0, y: 55.6, size: 20 },
  { label: "Business",  to: "/business",  x: 84.9, y: 55.6, size: 20 },
];

function ModuleHub({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="mt-auto flex-1 min-h-0 flex flex-col animate-fade-in">
      <div className="relative w-full" style={{ aspectRatio: "1068 / 1450" }}>
        <img
          src={hudHub.url}
          alt="Evolution OS module hub"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain select-none"
        />

        {HUB_HOTSPOTS.map(({ label, to, x, y, size }, i) => (
          <Link
            key={label}
            to={to}
            aria-label={label}
            className="hub-hotspot absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}%`,
              aspectRatio: "1 / 1",
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <span className="hub-hotspot__ring" style={{ animationDelay: `${i * 0.55}s` }} />
            <span className="hub-hotspot__ring hub-hotspot__ring--inner" style={{ animationDelay: `${i * 0.55 + 0.3}s` }} />
            <span className="hub-hotspot__glow" style={{ animationDelay: `${i * 0.7}s` }} />
          </Link>
        ))}

        <button
          onClick={onUnlock}
          aria-label="Tap to unlock"
          className="hub-hotspot hub-hotspot--bonsai absolute rounded-full"
          style={{ left: "50%", top: "74.6%", width: "30%", aspectRatio: "1 / 1" }}
        >
          <span className="hub-hotspot__ring hub-hotspot__ring--bonsai" />
          <span className="hub-hotspot__glow" />
        </button>
      </div>
    </div>
  );
}


function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { data } = useEvolutionData();
  const timer = useFocusTimer();

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
      <div className="px-5 pt-6 flex items-start justify-between gap-4">
        <div className="hud-label text-lg tracking-[0.35em] text-foreground">EVOLUTION OS</div>
        <div className="flex flex-col items-end gap-3">
          <button className="text-foreground/80 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full" style={{ background: CYAN, boxShadow: "0 0 6px #00d4ff" }} />
          </button>
          <DateTimeCard />
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


      {/* Default unlock layer: module holograms wired to the bonsai. */}
      <ModuleHub onUnlock={onUnlock} />

      {/* Tasks + Focus cards */}
      <div className="mx-4 mt-8 mb-8 grid grid-cols-2 gap-3">
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
