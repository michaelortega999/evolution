import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, investingSummary, todayDate } from "@/lib/evolution-data";

export const Route = createFileRoute("/investing")({
  head: () => ({
    meta: [
      { title: "Investing — Evolution" },
      { name: "description", content: "Portfolio value, P&L log, and goal tracking." },
    ],
  }),
  component: InvestingPage,
});

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function InvestingPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const [pnl, setPnl] = useState("");
  const inv = investingSummary(data.investing);
  const goalPct = Math.min(100, Math.round((inv.current / data.profile.goal) * 100));

  const logPnL = () => {
    const n = Number(pnl);
    if (!n) return;
    mutate((prev) => ({
      investing: [...prev.investing, { date: todayDate(), value: (prev.investing.at(-1)?.value ?? 0) + n }],
    }));
    setPnl("");
  };

  const history = [...data.investing].reverse();
  const highs = data.investing.length ? Math.max(...data.investing.map((r) => r.value)) : 0;

  return (
    <ModuleLayout number="06" title="Investing" subtitle="Portfolio · P&L · Goal" icon={TrendingUp}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel title="Portfolio"><div className="hud-label text-2xl text-primary hud-glow">{formatMoney(inv.current)}</div></Panel>
        <Panel title="All-Time High"><div className="hud-label text-2xl text-primary hud-glow">{formatMoney(highs)}</div></Panel>
        <Panel title="Last Change">
          <div className={`hud-label text-2xl hud-glow ${inv.pct >= 0 ? "text-primary" : "text-destructive"}`}>
            {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}%
          </div>
        </Panel>
        <Panel title="Goal Progress">
          <div className="hud-label text-2xl text-primary hud-glow">{goalPct}%</div>
          <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${goalPct}%`, boxShadow: "0 0 8px var(--primary)" }} />
          </div>
        </Panel>
      </div>

      <Panel title="Equity Curve">
        <Sparkline data={inv.data.length ? inv.data : [1]} height={240} />
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Log P&L">
          <div className="space-y-3">
            <Input value={pnl} onChange={(e) => setPnl(e.target.value)} type="number" placeholder="±$ amount" className="h-9 text-xs" onKeyDown={(e) => e.key === "Enter" && logPnL()} />
            <Button onClick={logPnL} className="w-full hud-label text-[10px]">Log Entry</Button>
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Trading balance</span>
              <Input type="number" value={data.profile.tradingBalance} onChange={(e) => updateProfile({ tradingBalance: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
            </label>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Portfolio goal</span>
              <Input type="number" value={data.profile.goal} onChange={(e) => updateProfile({ goal: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
            </label>
          </div>
        </Panel>

        <Panel title="History">
          <ul className="divide-y divide-border max-h-[340px] overflow-y-auto">
            {history.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                <span className="hud-label text-xs text-primary">{formatMoney(e.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
