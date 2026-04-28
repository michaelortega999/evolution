import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, investingSummary, todayDate } from "@/lib/evolution-data";

export const Route = createFileRoute("/wealth")({
  head: () => ({
    meta: [
      { title: "Wealth — Evolution" },
      { name: "description", content: "Track net worth, log assets, monitor growth." },
    ],
  }),
  component: WealthPage,
});

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function WealthPage() {
  const { data, mutate, updateProfile } = useEvolutionData();
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const inv = investingSummary(data.investing);
  const netWorth = inv.current + data.profile.tradingBalance;
  const goalPct = Math.min(100, Math.round((netWorth / data.profile.goal) * 100));

  const addAsset = () => {
    const n = Number(amount);
    if (!n) return;
    mutate((prev) => ({
      investing: [...prev.investing, { date: todayDate(), value: (prev.investing.at(-1)?.value ?? 0) + n }],
    }));
    setAmount("");
    setLabel("");
  };

  const first = data.investing[0]?.value ?? 0;
  const growth = first ? (((inv.current - first) / first) * 100).toFixed(1) : "0";
  const sorted = [...data.investing].slice().reverse();

  return (
    <ModuleLayout number="01" title="Wealth" subtitle="Net worth · Assets · Growth" icon={Wallet}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Net Worth">
          <div className="hud-label text-3xl text-primary hud-glow">{formatMoney(netWorth)}</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">Goal: {formatMoney(data.profile.goal)}</div>
          <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${goalPct}%`, boxShadow: "0 0 8px var(--primary)" }} />
          </div>
          <div className="hud-label text-[10px] text-primary text-right mt-1">{goalPct}%</div>
        </Panel>
        <Panel title="Growth">
          <div className="hud-label text-3xl text-primary hud-glow">{growth}%</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">All-time return</div>
        </Panel>
        <Panel title="Last Change">
          <div className={`hud-label text-3xl hud-glow ${inv.pct >= 0 ? "text-primary" : "text-destructive"}`}>
            {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}%
          </div>
          <div className="hud-label text-[10px] text-muted-foreground mt-2">{formatMoney(Math.abs(inv.change))} Δ</div>
        </Panel>
      </div>

      <Panel title="Portfolio Over Time">
        <Sparkline data={inv.data.length ? inv.data : [1]} height={200} />
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Add Asset / Entry">
          <div className="space-y-3">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="h-9 text-xs" />
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount ($)" className="h-9 text-xs" onKeyDown={(e) => e.key === "Enter" && addAsset()} />
            <Button onClick={addAsset} className="w-full hud-label text-[10px]">+ Add</Button>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="hud-label text-[10px] text-muted-foreground mb-2">Goal</div>
            <Input type="number" value={data.profile.goal} onChange={(e) => updateProfile({ goal: Number(e.target.value) || 0 })} className="h-9 text-xs" />
          </div>
        </Panel>

        <Panel title="History">
          <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
            {sorted.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                <span className="hud-label text-xs text-primary">{formatMoney(e.value)}</span>
              </li>
            ))}
            {!sorted.length && <li className="text-xs text-muted-foreground py-4 text-center">No entries yet.</li>}
          </ul>
        </Panel>
      </div>

      <div className="text-center">
        <Link to="/" className="hud-label text-[10px] text-primary/80 hover:text-primary">← Back to Dashboard</Link>
      </div>
    </ModuleLayout>
  );
}
