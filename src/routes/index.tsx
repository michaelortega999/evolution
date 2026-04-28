import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, Apple, Dumbbell, FileText, NotebookPen,
  TrendingUp, Briefcase, Star, Calendar as CalIcon, Target,
} from "lucide-react";
import { Sidebar } from "@/components/evolution/Sidebar";
import { TopBar } from "@/components/evolution/TopBar";
import { HudCard } from "@/components/evolution/HudCard";
import { Sparkline } from "@/components/evolution/Sparkline";
import { RingProgress } from "@/components/evolution/RingProgress";
import { BarChart } from "@/components/evolution/BarChart";
import { MarketTicker } from "@/components/evolution/MarketTicker";
import { useEvolutionData, nutritionSummary, fitnessSummary, investingSummary } from "@/lib/evolution-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evolution — Life Operating System" },
      { name: "description", content: "Discipline. Focus. Consistency. Freedom. Track wealth, fitness, nutrition, and more in one HUD." },
    ],
  }),
  component: Index,
});

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function Index() {
  const { data } = useEvolutionData();
  const nut = nutritionSummary(data.nutrition);
  const fit = fitnessSummary(data.fitness);
  const inv = investingSummary(data.investing);

  const nutMonth = [...data.nutrition].slice(-12).map((r) => r.calories);
  const invSeries = inv.data.slice(-12);
  const invLabels = data.investing.slice(-12).map((r) => r.date.slice(5, 7));

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>

        <main className="flex flex-col gap-6 min-w-0">
          <TopBar />

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <HudCard icon={Wallet} number="1" title="Wealth">
              <div className="hud-label text-[10px] text-muted-foreground">Net Worth</div>
              <div className="hud-label text-2xl text-primary hud-glow my-1">{formatMoney(inv.current * 1.82)}</div>
              <div className="hud-label text-[10px] text-primary/80">
                {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}% recent
              </div>
              <div className="mt-3">
                <Sparkline data={invSeries.length ? invSeries : [1]} labels={invLabels.slice(0, 5)} />
              </div>
            </HudCard>

            <HudCard icon={Apple} number="2" title="Nutrition">
              <div className="hud-label text-[10px] text-muted-foreground">Daily Calories</div>
              <div className="hud-label text-2xl text-primary hud-glow my-1">
                {nut.last?.calories.toLocaleString() ?? 0} / {nut.target.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <RingProgress value={nut.percent} sublabel={nut.percent >= 80 ? "Good" : "Low"} />
                <div className="flex-1 space-y-1.5">
                  {([
                    ["Protein", nut.last?.protein],
                    ["Carbs", nut.last?.carbs],
                    ["Fats", nut.last?.fats],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between hud-label text-[10px]">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-primary">{v != null ? `${v}g` : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HudCard>

            <HudCard icon={Dumbbell} number="3" title="Fitness">
              <div className="hud-label text-[10px] text-muted-foreground">Weekly Activity</div>
              <div className="hud-label text-2xl text-primary hud-glow my-1">{fit.daysHit} / {fit.target}</div>
              <div className="hud-label text-[10px] text-muted-foreground mb-2">Active Days</div>
              <BarChart data={fit.data.length ? fit.data : [1]} labels={fit.labels} />
            </HudCard>

            <HudCard icon={FileText} number="4" title="Journal">
              <div className="hud-label text-[10px] text-muted-foreground">Latest Entry</div>
              <p className="text-sm italic text-foreground/90 mt-2 leading-relaxed">
                "Discipline is choosing between what you want now and what you want most."
              </p>
              <div className="hud-label text-[10px] text-muted-foreground mt-4">May 17, 2024 · 8:15 AM</div>
            </HudCard>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <HudCard icon={NotebookPen} number="5" title="Notes" footer="View all notes">
              <div className="hud-label text-[10px] text-muted-foreground mb-2">Quick Notes</div>
              <ul className="space-y-2 text-sm text-foreground/90">
                {["Pick up dry cleaning","Call Mom","Review Q2 Reports","Book flight to Geneva"].map(n => (
                  <li key={n} className="flex gap-2">
                    <span className="text-primary">▸</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </HudCard>

            <HudCard icon={TrendingUp} number="6" title="Investing" footer="View portfolio">
              <div className="hud-label text-[10px] text-muted-foreground">Portfolio Value</div>
              <div className="hud-label text-2xl text-primary hud-glow my-1">{formatMoney(inv.current)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">Recent Change</div>
              <div className="hud-label text-xs text-primary">
                {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}% ({inv.change >= 0 ? "+" : "−"}{formatMoney(Math.abs(inv.change))})
              </div>
              <div className="mt-2">
                <Sparkline data={invSeries.length ? invSeries : [1]} height={50} />
              </div>
            </HudCard>

            <HudCard icon={Briefcase} number="7" title="Business" footer="View projects">
              <div className="hud-label text-[10px] text-muted-foreground">Active Projects</div>
              <div className="hud-label text-2xl text-primary hud-glow my-1">7</div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <div className="hud-label text-[10px] text-muted-foreground">Avg Calories</div>
                  <div className="hud-label text-lg text-primary">
                    {nutMonth.length ? Math.round(nutMonth.reduce((a,b)=>a+b,0)/nutMonth.length).toLocaleString() : "—"}
                  </div>
                </div>
                <RingProgress value={72} size={70} sublabel="On Track" />
              </div>
            </HudCard>

            <HudCard icon={Star} number="8" title="Hobby" footer="View hobbies">
              <div className="hud-label text-[10px] text-muted-foreground">Current Focus</div>
              <div className="hud-label text-xl text-primary hud-glow my-1">Guitar</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-3">Time Invested</div>
              <div className="hud-label text-lg text-foreground">12.4 hrs</div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "62%", boxShadow: "0 0 8px var(--primary)" }} />
              </div>
            </HudCard>
          </section>

          <MarketTicker />

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hud-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalIcon className="h-4 w-4 text-primary" />
                <div className="hud-label text-sm">Calendar</div>
              </div>
              <div className="text-sm text-foreground/80">No events today</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">Enjoy your focus time.</div>
            </div>

            <div className="hud-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <div className="hud-label text-sm">Focus Mode</div>
              </div>
              <div className="hud-label text-primary hud-glow text-lg">Active</div>
              <div className="text-xs text-muted-foreground mt-2">Eliminate distraction.<br/>Maximize execution.</div>
            </div>

            <div className="hud-card p-5 flex items-center gap-5">
              <RingProgress value={89} size={80} sublabel="Complete" />
              <div>
                <div className="hud-label text-sm">Daily Progress</div>
                <div className="hud-label text-[10px] text-muted-foreground mt-1">89% complete</div>
              </div>
            </div>
          </section>

          <footer className="text-center hud-label text-[10px] text-muted-foreground py-4">
            Evolution · Growing today, building forever
          </footer>
        </main>
      </div>
    </div>
  );
}
