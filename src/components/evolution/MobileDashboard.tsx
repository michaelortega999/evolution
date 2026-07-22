import { Link, useLocation } from "@tanstack/react-router";
import {
  CheckSquare, Zap, Wallet, Apple, Dumbbell, TrendingUp,
  Briefcase, Star, Home, Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useEvolutionData, todayDate, dayTotals, fitnessSummary,
  tradingTotals, wealthSummary,
} from "@/lib/evolution-data";
import { hologramSrc } from "@/lib/holograms";

type Priority = "High" | "Medium" | "Low";

const PRIORITY_STYLES: Record<Priority, { badge: string; dot: string }> = {
  High:   { badge: "text-purple-300 border-purple-400/60 bg-purple-500/10", dot: "#a855f7" },
  Medium: { badge: "text-orange-300 border-orange-400/60 bg-orange-500/10", dot: "#f97316" },
  Low:    { badge: "text-emerald-300 border-emerald-400/60 bg-emerald-500/10", dot: "#22c55e" },
};

function ModuleTile({
  icon: Icon, label, value, sub, pct, to,
}: {
  icon: LucideIcon; label: string; value: string; sub: string; pct: number;
  to: "/notes" | "/focus" | "/wealth" | "/nutrition" | "/fitness" | "/investing" | "/business" | "/hobby";
}) {
  return (
    <Link
      to={to}
      className="relative rounded-xl border border-primary/25 bg-[#050a14] p-3 flex flex-col items-center text-center overflow-hidden"
      style={{ boxShadow: "0 0 12px rgba(0,212,255,0.08), inset 0 0 12px rgba(0,212,255,0.04)" }}
    >
      <div className="hud-label text-[9px] tracking-[0.2em] text-foreground/60 self-start">{label}</div>
      <div className="my-1.5 h-12 w-12 rounded-full border border-primary/40 flex items-center justify-center"
           style={{ boxShadow: "0 0 14px rgba(0,212,255,0.35), inset 0 0 10px rgba(0,212,255,0.2)" }}>
        <Icon className="h-6 w-6" style={{ color: "#00d4ff", filter: "drop-shadow(0 0 6px #00d4ff)" }} />
      </div>
      <div className="hud-label text-base leading-tight" style={{ color: "#00d4ff", textShadow: "0 0 10px rgba(0,212,255,0.5)" }}>{value}</div>
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

  // Focus: current session length label
  const todayFocusSec = (data.focusSessions ?? [])
    .filter((s) => new Date(s.completedAt).toISOString().slice(0, 10) === today)
    .reduce((a, s) => a + s.durationSec, 0);
  const fH = Math.floor(todayFocusSec / 3600);
  const fM = Math.floor((todayFocusSec % 3600) / 60);
  const fS = todayFocusSec % 60;
  const focusStr = `${fH}:${String(fM).padStart(2, "0")}:${String(fS).padStart(2, "0")}`;
  const focusPct = Math.min(100, Math.round((todayFocusSec / (2 * 3600)) * 100));

  const wealthPct = Math.min(100, Math.round((wealth.netWorth / (data.profile.goal || 1)) * 100));
  const investPnl = trading.todayPnl;
  const investPct = Math.min(100, Math.abs(investPnl) / 100);

  const heroSrc = hologramSrc(data.profile.hologram);

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
        <ModuleTile icon={CheckSquare} label="TASKS" value={String(openTasks.length)} sub="Tasks Today" pct={tasksPct} to="/notes" />
        <ModuleTile icon={Zap} label="FOCUS" value={focusStr} sub="Current Session" pct={focusPct} to="/focus" />
        <ModuleTile icon={Wallet} label="WEALTH" value={fmtMoney(wealth.netWorth)} sub="Net Worth" pct={wealthPct} to="/wealth" />
        <ModuleTile icon={Apple} label="NUTRITION" value={t.kcal.toLocaleString()} sub="Calories Today" pct={calPct} to="/nutrition" />
      </section>
      <section className="px-4 mt-2 grid grid-cols-4 gap-2">
        <ModuleTile icon={Dumbbell} label="FITNESS" value={String(fit.daysHit)} sub="Sessions" pct={fitPct} to="/fitness" />
        <ModuleTile
          icon={TrendingUp}
          label="INVESTING"
          value={`${investPnl >= 0 ? "+" : "-"}${fmtMoney(Math.abs(investPnl))}`}
          sub="Today's P/L"
          pct={investPct}
          to="/investing"
        />
        <ModuleTile icon={Briefcase} label="BUSINESS" value={String(activeProjects)} sub="Active Projects" pct={avgProgress} to="/business" />
        <ModuleTile icon={Star} label="HOBBY" value={`${hobbyH}h ${hobbyM}m`} sub="Time Today" pct={hobbyPct} to="/hobby" />
      </section>

      {/* Tasks & To Do */}
      <section className="mx-4 mt-5 rounded-2xl border border-primary/25 bg-[#050a14] p-4"
               style={{ boxShadow: "0 0 16px rgba(0,212,255,0.08)" }}>
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
