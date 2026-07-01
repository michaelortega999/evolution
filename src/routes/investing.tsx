import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { TrendingUp, Trash2 } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEvolutionData, todayDate, uid, type Instrument, type TradeDir } from "@/lib/evolution-data";
import { useSelectedMonth } from "@/lib/use-selected-month";

export const Route = createFileRoute("/investing")({
  head: () => ({ meta: [{ title: "Investing — Evolution" }, { name: "description", content: "Trades, P&L, watchlist, and goal tracking." }] }),
  component: InvestingPage,
});

const INSTRUMENTS: Instrument[] = ["MNQ", "MES"];
const TICK: Record<Instrument, number> = { MNQ: 2, MES: 5 }; // $/point per contract approx

function fmt(n: number) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(1)}K`;
  return `${sign}$${Math.round(a).toLocaleString()}`;
}

function InvestingPage() {
  const { data, mutate, updateProfile } = useEvolutionData();

  // Trade form
  const [tDate, setTDate] = useState(todayDate());
  const [tInst, setTInst] = useState<Instrument>("MNQ");
  const [tDir, setTDir] = useState<TradeDir>("Long");
  const [tEntry, setTEntry] = useState("");
  const [tExit, setTExit] = useState("");
  const [tCon, setTCon] = useState("1");
  const [tNotes, setTNotes] = useState("");

  const previewPnl = useMemo(() => {
    const e = Number(tEntry), x = Number(tExit), c = Number(tCon) || 1;
    if (!e || !x) return 0;
    const diff = (tDir === "Long" ? x - e : e - x);
    return diff * TICK[tInst] * c;
  }, [tEntry, tExit, tCon, tDir, tInst]);

  const addTrade = () => {
    const e = Number(tEntry), x = Number(tExit), c = Number(tCon) || 1;
    if (!e || !x) return;
    const pnl = previewPnl;
    mutate((prev) => ({
      trades: [...prev.trades, {
        id: uid(), date: tDate, instrument: tInst, direction: tDir,
        entry: e, exit: x, contracts: c, pnl, notes: tNotes.trim() || undefined,
      }],
    }));
    setTEntry(""); setTExit(""); setTNotes("");
  };
  const delTrade = (id: string) => mutate((prev) => ({ trades: prev.trades.filter((t) => t.id !== id) }));
  const updateTradeNotes = (id: string, notes: string) =>
    mutate((prev) => ({ trades: prev.trades.map((t) => t.id === id ? { ...t, notes } : t) }));

  // Stats
  const sortedTrades = useMemo(() => [...data.trades].sort((a, b) => a.date.localeCompare(b.date)), [data.trades]);
  const equityCurve = useMemo(() => {
    let bal = data.profile.tradingBalance;
    const arr = [bal];
    for (const t of sortedTrades) { bal += t.pnl; arr.push(bal); }
    return arr.length > 1 ? arr : [bal, bal];
  }, [sortedTrades, data.profile.tradingBalance]);
  const portfolio = equityCurve[equityCurve.length - 1];
  const wins = data.trades.filter((t) => t.pnl > 0).length;
  const winRate = data.trades.length ? Math.round((wins / data.trades.length) * 100) : 0;
  const goalPct = Math.min(100, Math.round((portfolio / data.profile.goal) * 100));

  // Daily P&L log
  const [dailyPnl, setDailyPnl] = useState("");
  const logDailyPnl = () => {
    const n = Number(dailyPnl); if (!n) return;
    mutate((prev) => ({
      investing: [...prev.investing, { date: todayDate(), value: (prev.investing.at(-1)?.value ?? 0) + n }],
    }));
    setDailyPnl("");
  };

  // Watchlist
  const [wTicker, setWTicker] = useState(""); const [wPrice, setWPrice] = useState(""); const [wNotes, setWNotes] = useState("");
  const addWatch = () => {
    if (!wTicker.trim()) return;
    mutate((prev) => ({ watchlist: [...prev.watchlist, { id: uid(), ticker: wTicker.toUpperCase().trim(), price: Number(wPrice) || 0, notes: wNotes.trim() || undefined }] }));
    setWTicker(""); setWPrice(""); setWNotes("");
  };
  const delWatch = (id: string) => mutate((prev) => ({ watchlist: prev.watchlist.filter((w) => w.id !== id) }));

  return (
    <ModuleLayout number="06" title="Investing" subtitle="Trades · P&L · Goal" icon={TrendingUp}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">P&L Tracker</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Panel title="Portfolio"><div className="hud-label text-2xl text-primary hud-glow">{fmt(portfolio)}</div></Panel>
            <Panel title="Win Rate"><div className="hud-label text-2xl text-primary hud-glow">{winRate}%</div><div className="hud-label text-[10px] text-muted-foreground mt-1">{data.trades.length} trades</div></Panel>
            <Panel title="Goal Progress">
              <div className="hud-label text-2xl text-primary hud-glow">{goalPct}%</div>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${goalPct}%`, boxShadow: "0 0 8px var(--primary)" }} />
              </div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">Target: {fmt(data.profile.goal)}</div>
            </Panel>
            <Panel title="Daily P&L">
              <Input type="number" placeholder="±$" value={dailyPnl} onChange={(e) => setDailyPnl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && logDailyPnl()} className="h-9 text-xs" />
              <Button onClick={logDailyPnl} size="sm" className="w-full mt-2 hud-label text-[10px]">Log Day</Button>
            </Panel>
          </div>

          <Panel title="Equity Curve">
            <Sparkline data={equityCurve} height={240} />
          </Panel>
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <Panel title="Log Trade">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-9 text-xs" />
              <select value={tInst} onChange={(e) => setTInst(e.target.value as Instrument)}
                className="h-9 bg-input border border-border rounded px-2 text-xs">
                {INSTRUMENTS.map((i) => <option key={i}>{i}</option>)}
              </select>
              <select value={tDir} onChange={(e) => setTDir(e.target.value as TradeDir)}
                className="h-9 bg-input border border-border rounded px-2 text-xs">
                <option>Long</option><option>Short</option>
              </select>
              <Input type="number" placeholder="Entry" value={tEntry} onChange={(e) => setTEntry(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Exit" value={tExit} onChange={(e) => setTExit(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Contracts" value={tCon} onChange={(e) => setTCon(e.target.value)} className="h-9 text-xs" />
            </div>
            <Input placeholder="Setup notes (optional)" value={tNotes} onChange={(e) => setTNotes(e.target.value)} className="h-9 text-xs mt-3" />
            <div className="flex items-center justify-between mt-3">
              <div className="hud-label text-xs text-muted-foreground">
                P&L: <span className={previewPnl >= 0 ? "text-primary" : "text-destructive"}>{fmt(previewPnl)}</span>
              </div>
              <Button onClick={addTrade} size="sm" className="hud-label text-[10px]">+ Add Trade</Button>
            </div>
          </Panel>

          <Panel title={`Trade Log (${data.trades.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="hud-label text-[10px] text-muted-foreground text-left border-b border-border">
                    <th className="py-2">Date</th><th>Inst</th><th>Dir</th><th>Entry</th><th>Exit</th><th>Qty</th><th className="text-right">P&L</th><th>Bal</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let bal = data.profile.tradingBalance;
                    return sortedTrades.map((t) => {
                      bal += t.pnl;
                      return (
                        <tr key={t.id} className="border-b border-border/50 group">
                          <td className="py-2 hud-label text-muted-foreground">{t.date}</td>
                          <td>{t.instrument}</td>
                          <td>{t.direction}</td>
                          <td>{t.entry}</td>
                          <td>{t.exit}</td>
                          <td>{t.contracts}</td>
                          <td className={`text-right hud-label ${t.pnl >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(t.pnl)}</td>
                          <td className="hud-label text-foreground/70">{fmt(bal)}</td>
                          <td><button onClick={() => delTrade(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button></td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              {!data.trades.length && <div className="text-xs text-muted-foreground py-6 text-center">No trades logged.</div>}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
          <Panel title="Add to Watchlist">
            <div className="grid grid-cols-1 md:grid-cols-[100px_120px_1fr_auto] gap-3">
              <Input placeholder="Ticker" value={wTicker} onChange={(e) => setWTicker(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Price" value={wPrice} onChange={(e) => setWPrice(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Notes" value={wNotes} onChange={(e) => setWNotes(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addWatch} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.watchlist.map((w) => (
              <div key={w.id} className="hud-card p-4 group relative">
                <div className="flex items-center justify-between">
                  <span className="hud-label text-lg text-primary hud-glow">{w.ticker}</span>
                  <span className="hud-label text-sm text-foreground/80">${w.price}</span>
                </div>
                {w.notes && <div className="text-xs text-foreground/70 mt-2">{w.notes}</div>}
                <button onClick={() => delWatch(w.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {!data.watchlist.length && <div className="text-xs text-muted-foreground py-6 text-center col-span-full">Watchlist is empty.</div>}
          </div>
        </TabsContent>

        <TabsContent value="journal">
          <Panel title="Trade Journal">
            <div className="hud-label text-[10px] text-muted-foreground mb-4">Click a trade's notes to update what worked / what didn't.</div>
            <ul className="space-y-3 max-h-[600px] overflow-y-auto">
              {[...data.trades].reverse().map((t) => (
                <li key={t.id} className="border border-border rounded p-3">
                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className="hud-label text-muted-foreground">{t.date}</span>
                    <span className="hud-label text-primary">{t.instrument} {t.direction}</span>
                    <span className={`hud-label ml-auto ${t.pnl >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(t.pnl)}</span>
                  </div>
                  <textarea value={t.notes ?? ""} onChange={(e) => updateTradeNotes(t.id, e.target.value)} rows={2}
                    placeholder="Setup, what worked, what didn't…"
                    className="w-full bg-transparent border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
                </li>
              ))}
              {!data.trades.length && <li className="text-xs text-muted-foreground py-6 text-center">Log trades first.</li>}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <Panel title="Targets">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Trading balance ($)</span>
            <Input type="number" value={data.profile.tradingBalance} onChange={(e) => updateProfile({ tradingBalance: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
          </label>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Portfolio goal ($)</span>
            <Input type="number" value={data.profile.goal} onChange={(e) => updateProfile({ goal: Number(e.target.value) || 0 })} className="h-9 text-xs mt-1" />
          </label>
        </div>
      </Panel>
    </ModuleLayout>
  );
}
