import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Trash2, Plus, Pencil, Check, X, CheckCircle2 } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { BarChart } from "@/components/evolution/BarChart";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useEvolutionData, todayDate, uid,
  TRADE_GRADES, STRATEGY_STATUSES, STRATEGY_SESSIONS, TRADING_START_BALANCE,
  type Instrument, type TradeDir, type TradeGrade, type TradeStrategy,
  type StrategyStatus, type StrategySession,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/investing")({
  head: () => ({ meta: [
    { title: "INVESTING — Evolution" },
    { name: "description", content: "Strategy builder, trade journal, and performance analytics." },
  ] }),
  component: InvestingPage,
});

const INSTRUMENTS: Instrument[] = ["MNQ", "MES"];
const POINT_VALUE: Record<Instrument, number> = { MNQ: 2, MES: 0.5 };

function fmt(n: number) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(2)}K`;
  return `${sign}$${a.toFixed(2)}`;
}

function calcPnl(dir: TradeDir, inst: Instrument, entry: number, exit: number, contracts: number) {
  const diff = dir === "Long" ? exit - entry : entry - exit;
  return diff * POINT_VALUE[inst] * (contracts || 1);
}

// ============ STATUS BADGE ============
function StatusBadge({ status }: { status: StrategyStatus }) {
  const colorMap: Record<StrategyStatus, string> = {
    "Active": "var(--primary)",
    "In Development": "oklch(0.75 0.18 80)",
    "Backtesting": "oklch(0.7 0.2 240)",
    "Retired": "var(--muted-foreground)",
  };
  const color = colorMap[status];
  return (
    <span
      className="hud-label text-[10px] px-2 py-0.5 rounded border"
      style={{ color, borderColor: `color-mix(in oklch, ${color} 50%, transparent)`, background: `color-mix(in oklch, ${color} 10%, transparent)` }}
    >
      {status}
    </span>
  );
}

// ============ STRATEGY CARD ============
function StrategyCard({
  strategy, onSave, onDelete,
}: {
  strategy: TradeStrategy;
  onSave: (s: TradeStrategy) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TradeStrategy>(strategy);
  useEffect(() => { setDraft(strategy); }, [strategy]);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(strategy); setEditing(false); };

  const upd = <K extends keyof TradeStrategy>(k: K, v: TradeStrategy[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const updGrade = (g: TradeGrade, text: string) =>
    setDraft((d) => ({ ...d, grades: { ...d.grades, [g]: text } }));
  const updBt = (k: keyof TradeStrategy["backtest"], v: number) =>
    setDraft((d) => ({ ...d, backtest: { ...d.backtest, [k]: v } }));

  return (
    <div className="hud-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="hud-label text-[10px] text-muted-foreground">Strategy {strategy.number}</span>
          {editing ? (
            <Input value={draft.name} onChange={(e) => upd("name", e.target.value)} className="h-8 text-sm w-56" />
          ) : (
            <h3 className="hud-label text-lg text-primary hud-glow">— {strategy.name}</h3>
          )}
          {editing ? (
            <select value={draft.status} onChange={(e) => upd("status", e.target.value as StrategyStatus)}
              className="h-8 bg-input border border-border rounded px-2 text-xs">
              {STRATEGY_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          ) : <StatusBadge status={strategy.status} />}
        </div>
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={save}><Check className="h-4 w-4 text-primary" /></Button>
              <Button size="sm" variant="ghost" onClick={cancel}><X className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </>
          )}
        </div>
      </div>

      {/* Rules */}
      <div>
        <div className="hud-label text-[10px] text-muted-foreground mb-2">Strategy Rules</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <Field label="Session">
            {editing ? (
              <select value={draft.session} onChange={(e) => upd("session", e.target.value as StrategySession)}
                className="h-8 w-full bg-input border border-border rounded px-2 text-xs">
                {STRATEGY_SESSIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : <Val>{strategy.session}</Val>}
          </Field>
          <Field label="Instruments">
            {editing ? (
              <select value={draft.instruments} onChange={(e) => upd("instruments", e.target.value as TradeStrategy["instruments"])}
                className="h-8 w-full bg-input border border-border rounded px-2 text-xs">
                <option>MNQ</option><option>MES</option><option>Both</option>
              </select>
            ) : <Val>{strategy.instruments}</Val>}
          </Field>
          <Field label="Entry trigger" full>
            {editing ? <Textarea rows={2} value={draft.entryTrigger} onChange={(e) => upd("entryTrigger", e.target.value)} className="text-xs" />
              : <Val>{strategy.entryTrigger}</Val>}
          </Field>
          <Field label="Target" full>
            {editing ? <Input value={draft.target} onChange={(e) => upd("target", e.target.value)} className="h-8 text-xs" />
              : <Val>{strategy.target}</Val>}
          </Field>
          <Field label="Max risk / trade ($)">
            {editing ? <Input type="number" value={draft.maxRisk} onChange={(e) => upd("maxRisk", Number(e.target.value))} className="h-8 text-xs" />
              : <Val>${strategy.maxRisk}</Val>}
          </Field>
          <Field label="Time exit">
            {editing ? <Input type="time" value={draft.timeExit} onChange={(e) => upd("timeExit", e.target.value)} className="h-8 text-xs" />
              : <Val>{strategy.timeExit} CT</Val>}
          </Field>
          <Field label="Daily loss limit ($)">
            {editing ? <Input type="number" value={draft.dailyLossLimit} onChange={(e) => upd("dailyLossLimit", Number(e.target.value))} className="h-8 text-xs" />
              : <Val>${strategy.dailyLossLimit}</Val>}
          </Field>
          <Field label="Weekly loss limit ($)">
            {editing ? <Input type="number" value={draft.weeklyLossLimit} onChange={(e) => upd("weeklyLossLimit", Number(e.target.value))} className="h-8 text-xs" />
              : <Val>${strategy.weeklyLossLimit}</Val>}
          </Field>
          <Field label="Notes" full>
            {editing ? <Textarea rows={2} value={draft.notes} onChange={(e) => upd("notes", e.target.value)} className="text-xs" />
              : <Val>{strategy.notes || "—"}</Val>}
          </Field>
        </div>
      </div>

      {/* Grades */}
      <div>
        <div className="hud-label text-[10px] text-muted-foreground mb-2">Trade Grade Definitions</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {TRADE_GRADES.map((g) => (
            <div key={g} className="border border-border rounded p-2 text-xs flex gap-2">
              <span className="hud-label text-primary w-8 shrink-0">{g}</span>
              {editing ? (
                <Textarea rows={2} value={draft.grades[g]} onChange={(e) => updGrade(g, e.target.value)} className="text-xs flex-1" />
              ) : (
                <span className="text-foreground/80 flex-1">{strategy.grades[g] || "—"}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backtest */}
      <div>
        <div className="hud-label text-[10px] text-muted-foreground mb-2">Backtest Results</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {([
            ["Net %", "netProfitPct"],
            ["Win Rate %", "winRate"],
            ["Total Trades", "totalTrades"],
            ["Sharpe", "sharpe"],
            ["Max DD %", "maxDrawdown"],
          ] as const).map(([label, k]) => (
            <div key={k} className="border border-border rounded p-2">
              <div className="hud-label text-[9px] text-muted-foreground">{label}</div>
              {editing ? (
                <Input type="number" value={draft.backtest[k]} onChange={(e) => updBt(k, Number(e.target.value))} className="h-7 text-xs mt-1" />
              ) : (
                <div className="hud-label text-sm text-primary mt-0.5">{strategy.backtest[k]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="hud-label text-[9px] text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
function Val({ children }: { children: React.ReactNode }) {
  return <div className="text-foreground/85 text-xs leading-snug">{children}</div>;
}

// ============ MAIN PAGE ============
function InvestingPage() {
  const { data, mutate } = useEvolutionData();
  const [saved, setSaved] = useState(false);

  const strategies = data.strategies;
  const trades = data.trades;

  // ---- Strategy Builder actions ----
  const addStrategy = () => {
    const num = String(strategies.length + 1).padStart(3, "0");
    const fresh: TradeStrategy = {
      id: uid(),
      number: num,
      name: "New Strategy",
      status: "In Development",
      session: "New York AM",
      entryTrigger: "",
      target: "",
      maxRisk: 100,
      dailyLossLimit: 200,
      weeklyLossLimit: 600,
      timeExit: "11:30",
      instruments: "MNQ",
      notes: "",
      grades: { "A+": "", "B+": "", "C-": "", "F": "" },
      backtest: { netProfitPct: 0, winRate: 0, totalTrades: 0, sharpe: 0, maxDrawdown: 0 },
    };
    mutate((p) => ({ strategies: [...p.strategies, fresh] }));
  };
  const saveStrategy = (s: TradeStrategy) =>
    mutate((p) => ({ strategies: p.strategies.map((x) => x.id === s.id ? s : x) }));
  const deleteStrategy = (id: string) =>
    mutate((p) => ({ strategies: p.strategies.filter((x) => x.id !== id) }));

  // ---- Trade Journal state ----
  const [tDate, setTDate] = useState(todayDate());
  const [tTime, setTTime] = useState("");
  const [tInst, setTInst] = useState<Instrument>("MNQ");
  const [tDir, setTDir] = useState<TradeDir>("Long");
  const [tStrat, setTStrat] = useState<string>(strategies[0]?.id ?? "");
  const [tEntry, setTEntry] = useState("");
  const [tExit, setTExit] = useState("");
  const [tCon, setTCon] = useState("1");
  const [tGrade, setTGrade] = useState<TradeGrade>("A+");
  const [tNotes, setTNotes] = useState("");
  const [tShot, setTShot] = useState("");

  useEffect(() => {
    if (!tStrat && strategies[0]) setTStrat(strategies[0].id);
  }, [strategies, tStrat]);

  const previewPnl = useMemo(() => {
    const e = Number(tEntry), x = Number(tExit), c = Number(tCon) || 1;
    if (!e || !x) return 0;
    return calcPnl(tDir, tInst, e, x, c);
  }, [tEntry, tExit, tCon, tDir, tInst]);

  const logTrade = () => {
    const e = Number(tEntry), x = Number(tExit), c = Number(tCon) || 1;
    if (!e || !x) return;
    mutate((prev) => ({
      trades: [...prev.trades, {
        id: uid(), date: tDate, time: tTime || undefined,
        instrument: tInst, direction: tDir, entry: e, exit: x, contracts: c,
        pnl: previewPnl, notes: tNotes.trim() || undefined,
        strategyId: tStrat || undefined, grade: tGrade,
        screenshot: tShot.trim() || undefined,
      }],
    }));
    setTEntry(""); setTExit(""); setTNotes(""); setTShot("");
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  };
  const delTrade = (id: string) => mutate((p) => ({ trades: p.trades.filter((t) => t.id !== id) }));

  // Running totals
  const today = todayDate();
  const dailyPnl = trades.filter((t) => t.date === today).reduce((s, t) => s + t.pnl, 0);

  const weekStart = useMemo(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Monday=0
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }, []);
  const weeklyPnl = trades.filter((t) => t.date >= weekStart).reduce((s, t) => s + t.pnl, 0);
  const balance = TRADING_START_BALANCE + trades.reduce((s, t) => s + t.pnl, 0);

  const activeStrat = strategies.find((s) => s.id === tStrat);
  const dailyLimit = activeStrat?.dailyLossLimit ?? 200;
  const weeklyLimit = activeStrat?.weeklyLossLimit ?? 600;
  const dailyWarn = dailyPnl <= -dailyLimit * 0.8;
  const weeklyWarn = weeklyPnl <= -weeklyLimit * 0.8;

  // ---- Performance Review ----
  const perf = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const winRate = total ? Math.round((wins.length / total) * 100) : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLoss ? grossWin / grossLoss : (grossWin ? Infinity : 0);

    // day P&L map
    const dayMap = new Map<string, number>();
    for (const t of trades) dayMap.set(t.date, (dayMap.get(t.date) ?? 0) + t.pnl);
    let bestDay = { date: "", pnl: -Infinity };
    let worstDay = { date: "", pnl: Infinity };
    for (const [d, p] of dayMap) {
      if (p > bestDay.pnl) bestDay = { date: d, pnl: p };
      if (p < worstDay.pnl) worstDay = { date: d, pnl: p };
    }
    if (!dayMap.size) { bestDay = { date: "—", pnl: 0 }; worstDay = { date: "—", pnl: 0 }; }

    // instrument
    const instPnl: Record<Instrument, number> = { MNQ: 0, MES: 0 };
    const instCount: Record<Instrument, number> = { MNQ: 0, MES: 0 };
    for (const t of trades) { instPnl[t.instrument] += t.pnl; instCount[t.instrument]++; }
    const bestInst: Instrument = instPnl.MNQ >= instPnl.MES ? "MNQ" : "MES";
    const instDelta = instPnl[bestInst] && (instPnl.MNQ + instPnl.MES)
      ? Math.round(Math.abs((instPnl.MNQ - instPnl.MES) / (Math.abs(instPnl.MNQ) + Math.abs(instPnl.MES) || 1)) * 100)
      : 0;

    // grades
    const gradeCount: Record<TradeGrade, number> = { "A+": 0, "B+": 0, "C-": 0, "F": 0 };
    const gradePnl: Record<TradeGrade, number[]> = { "A+": [], "B+": [], "C-": [], "F": [] };
    for (const t of trades) {
      if (t.grade) { gradeCount[t.grade]++; gradePnl[t.grade].push(t.pnl); }
    }
    const discipline = total
      ? Math.round(((gradeCount["A+"] + gradeCount["B+"]) / total) * 100)
      : 0;
    const avgGrade = (g: TradeGrade) => gradePnl[g].length
      ? gradePnl[g].reduce((s, v) => s + v, 0) / gradePnl[g].length : 0;

    // equity curve
    const sorted = [...trades].sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
    let bal = TRADING_START_BALANCE;
    const equity = [bal];
    for (const t of sorted) { bal += t.pnl; equity.push(bal); }

    // monthly bars — last 6 months
    const monthLabels: string[] = [];
    const monthVals: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthLabels.push(d.toLocaleString(undefined, { month: "short" }));
      monthVals.push(trades.filter((t) => t.date.startsWith(key)).reduce((s, t) => s + t.pnl, 0));
    }

    // day of week
    const dowNames = ["M", "T", "W", "T", "F"];
    const dowPnl = [0, 0, 0, 0, 0];
    const dowCount = [0, 0, 0, 0, 0];
    for (const t of trades) {
      const d = new Date(t.date + "T12:00:00");
      const idx = (d.getDay() + 6) % 7;
      if (idx < 5) { dowPnl[idx] += t.pnl; dowCount[idx]++; }
    }

    // streaks
    let cur = 0, longest = 0;
    for (const t of sorted) {
      if (t.pnl > 0) { cur++; longest = Math.max(longest, cur); }
      else cur = 0;
    }

    return {
      total, winRate, avgWin, avgLoss, profitFactor,
      bestDay, worstDay, bestInst, instDelta, instPnl,
      gradeCount, avgGrade, discipline,
      equity, monthLabels, monthVals, dowNames, dowPnl, dowCount,
      currentStreak: cur, longestStreak: longest,
    };
  }, [trades]);

  const insights = useMemo(() => {
    const out: string[] = [];
    if (perf.total >= 3) {
      const aPlus = perf.avgGrade("A+");
      const f = perf.avgGrade("F");
      if (aPlus || f) out.push(`Your A+ trades average ${fmt(aPlus)}. Your F trades average ${fmt(f)}. Stick to A+ setups.`);
      const bestDow = perf.dowPnl.reduce((best, v, i) => v > best.v ? { v, i } : best, { v: -Infinity, i: 0 });
      const dowFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const wr = perf.dowCount[bestDow.i]
        ? Math.round((trades.filter((t) => {
            const d = new Date(t.date + "T12:00:00");
            return (d.getDay() + 6) % 7 === bestDow.i && t.pnl > 0;
          }).length / perf.dowCount[bestDow.i]) * 100)
        : 0;
      if (perf.dowCount[bestDow.i]) out.push(`${dowFull[bestDow.i]} is your best day — ${wr}% win rate`);
      if (perf.instDelta) out.push(`${perf.bestInst} outperforms ${perf.bestInst === "MNQ" ? "MES" : "MNQ"} in your logged trades by ${perf.instDelta}%`);
    }
    return out;
  }, [perf, trades]);

  const gradeTotal = perf.gradeCount["A+"] + perf.gradeCount["B+"] + perf.gradeCount["C-"] + perf.gradeCount["F"] || 1;

  return (
    <ModuleLayout number="06" title="Trading" subtitle="Strategy · Journal · Performance" icon={TrendingUp}>
      <Tabs defaultValue="strategy">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="strategy">Strategy Builder</TabsTrigger>
          <TabsTrigger value="journal">Trade Journal</TabsTrigger>
          <TabsTrigger value="performance">Performance Review</TabsTrigger>
        </TabsList>

        {/* ============ STRATEGY BUILDER ============ */}
        <TabsContent value="strategy" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="hud-label text-xs text-muted-foreground">{strategies.length} strategies</div>
            <Button onClick={addStrategy} size="sm" className="hud-label text-[10px]">
              <Plus className="h-3 w-3 mr-1" /> Add New Strategy
            </Button>
          </div>
          <div className="space-y-4">
            {strategies.map((s) => (
              <StrategyCard key={s.id} strategy={s} onSave={saveStrategy} onDelete={() => deleteStrategy(s.id)} />
            ))}
            {!strategies.length && (
              <div className="hud-card p-8 text-center text-xs text-muted-foreground">
                No strategies yet — click "Add New Strategy" to begin.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ============ TRADE JOURNAL ============ */}
        <TabsContent value="journal" className="space-y-4">
          {/* Running totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel title="Daily P&L">
              <div
                className={`hud-label text-2xl ${dailyPnl >= 0 ? "text-primary" : "text-destructive"} ${dailyWarn ? "animate-pulse" : ""} hud-glow`}
                style={dailyWarn ? { textShadow: "0 0 12px oklch(0.65 0.25 25)" } : undefined}
              >
                {fmt(dailyPnl)}
              </div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">
                Limit: -${dailyLimit} {dailyWarn && <span className="text-destructive">⚠ near limit</span>}
              </div>
            </Panel>
            <Panel title="Weekly P&L">
              <div
                className={`hud-label text-2xl ${weeklyPnl >= 0 ? "text-primary" : "text-destructive"} ${weeklyWarn ? "animate-pulse" : ""} hud-glow`}
                style={weeklyWarn ? { textShadow: "0 0 12px oklch(0.65 0.25 25)" } : undefined}
              >
                {fmt(weeklyPnl)}
              </div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">
                Limit: -${weeklyLimit} {weeklyWarn && <span className="text-destructive">⚠ near limit</span>}
              </div>
            </Panel>
            <Panel title="Account Balance">
              <div className="hud-label text-2xl text-primary hud-glow">{fmt(balance)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">Start: ${TRADING_START_BALANCE}</div>
            </Panel>
          </div>

          {/* Log form */}
          <Panel title="Log Trade">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Date</div>
                <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-9 text-xs" />
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Time</div>
                <Input type="time" value={tTime} onChange={(e) => setTTime(e.target.value)} className="h-9 text-xs" />
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Instrument</div>
                <select value={tInst} onChange={(e) => setTInst(e.target.value as Instrument)}
                  className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
                  {INSTRUMENTS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Direction</div>
                <select value={tDir} onChange={(e) => setTDir(e.target.value as TradeDir)}
                  className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
                  <option>Long</option><option>Short</option>
                </select>
              </label>
              <label className="text-xs md:col-span-2">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Strategy</div>
                <select value={tStrat} onChange={(e) => setTStrat(e.target.value)}
                  className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
                  <option value="">— none —</option>
                  {strategies.map((s) => <option key={s.id} value={s.id}>Strategy {s.number} — {s.name}</option>)}
                </select>
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Grade</div>
                <select value={tGrade} onChange={(e) => setTGrade(e.target.value as TradeGrade)}
                  className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
                  {TRADE_GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Contracts</div>
                <Input type="number" value={tCon} onChange={(e) => setTCon(e.target.value)} className="h-9 text-xs" />
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Entry</div>
                <Input type="number" step="0.25" placeholder="0.00" value={tEntry} onChange={(e) => setTEntry(e.target.value)} className="h-9 text-xs" />
              </label>
              <label className="text-xs">
                <div className="hud-label text-[9px] text-muted-foreground mb-1">Exit</div>
                <Input type="number" step="0.25" placeholder="0.00" value={tExit} onChange={(e) => setTExit(e.target.value)} className="h-9 text-xs" />
              </label>
            </div>
            <Textarea rows={2} placeholder="What happened? What did you see? What did you do right/wrong?"
              value={tNotes} onChange={(e) => setTNotes(e.target.value)} className="text-xs mt-3" />
            <Input placeholder="Screenshot note / setup description (paste image URL or describe)"
              value={tShot} onChange={(e) => setTShot(e.target.value)} className="h-9 text-xs mt-3" />
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <div className="hud-label text-xs text-muted-foreground">
                P&L preview: <span className={previewPnl >= 0 ? "text-primary" : "text-destructive"}>{fmt(previewPnl)}</span>
                <span className="ml-2 text-[10px]">({POINT_VALUE[tInst]}$/pt × {tCon})</span>
              </div>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="hud-label text-[10px] text-primary flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Trade logged
                  </span>
                )}
                <Button onClick={logTrade} size="sm" className="hud-label text-[10px]">+ Log Trade</Button>
              </div>
            </div>
          </Panel>

          {/* Trade log */}
          <Panel title={`Trade Log (${trades.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="hud-label text-[10px] text-muted-foreground text-left border-b border-border">
                    <th className="py-2">Date</th><th>Time</th><th>Inst</th><th>Dir</th>
                    <th>Strategy</th><th>Grade</th><th>Entry</th><th>Exit</th><th>Qty</th>
                    <th className="text-right">P&L</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...trades].reverse().map((t) => {
                    const strat = strategies.find((s) => s.id === t.strategyId);
                    return (
                      <tr key={t.id} className="border-b border-border/50 group">
                        <td className="py-2 hud-label text-muted-foreground">{t.date}</td>
                        <td className="text-muted-foreground">{t.time ?? "—"}</td>
                        <td>{t.instrument}</td>
                        <td>{t.direction}</td>
                        <td className="text-foreground/70">{strat ? `${strat.number}` : "—"}</td>
                        <td className="hud-label text-primary">{t.grade ?? "—"}</td>
                        <td>{t.entry}</td>
                        <td>{t.exit}</td>
                        <td>{t.contracts}</td>
                        <td className={`text-right hud-label ${t.pnl >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(t.pnl)}</td>
                        <td>
                          <button onClick={() => delTrade(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!trades.length && <div className="text-xs text-muted-foreground py-6 text-center">No trades logged yet.</div>}
            </div>
          </Panel>
        </TabsContent>

        {/* ============ PERFORMANCE REVIEW ============ */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Panel title="Total Trades"><div className="hud-label text-2xl text-primary hud-glow">{perf.total}</div></Panel>
            <Panel title="Win Rate"><div className="hud-label text-2xl text-primary hud-glow">{perf.winRate}%</div></Panel>
            <Panel title="Avg Winner"><div className="hud-label text-2xl text-primary hud-glow">{fmt(perf.avgWin)}</div></Panel>
            <Panel title="Avg Loser"><div className="hud-label text-2xl text-destructive hud-glow">{fmt(perf.avgLoss)}</div></Panel>
            <Panel title="Profit Factor">
              <div className="hud-label text-2xl text-primary hud-glow">
                {isFinite(perf.profitFactor) ? perf.profitFactor.toFixed(2) : "∞"}
              </div>
            </Panel>
            <Panel title="Discipline Score">
              <div className="hud-label text-2xl text-primary hud-glow">{perf.discipline}%</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">A+ / B+ share</div>
            </Panel>
            <Panel title="Current Streak"><div className="hud-label text-2xl text-primary hud-glow">{perf.currentStreak}</div></Panel>
            <Panel title="Longest Streak"><div className="hud-label text-2xl text-primary hud-glow">{perf.longestStreak}</div></Panel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Best Day">
              <div className={`hud-label text-xl ${perf.bestDay.pnl >= 0 ? "text-primary" : "text-destructive"} hud-glow`}>{fmt(perf.bestDay.pnl)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">{perf.bestDay.date}</div>
            </Panel>
            <Panel title="Worst Day">
              <div className={`hud-label text-xl ${perf.worstDay.pnl >= 0 ? "text-primary" : "text-destructive"} hud-glow`}>{fmt(perf.worstDay.pnl)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">{perf.worstDay.date}</div>
            </Panel>
          </div>

          <Panel title="Equity Curve · $835 → today">
            <Sparkline data={perf.equity.length > 1 ? perf.equity : [TRADING_START_BALANCE, TRADING_START_BALANCE]} height={220} />
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Monthly P&L">
              <BarChart data={perf.monthVals.map((v) => Math.max(0.01, Math.abs(v)))} labels={perf.monthLabels} height={140} />
              <div className="grid grid-cols-6 gap-1 mt-2 text-[9px] hud-label">
                {perf.monthVals.map((v, i) => (
                  <div key={i} className={`text-center ${v >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(v)}</div>
                ))}
              </div>
            </Panel>
            <Panel title="Day of Week">
              <BarChart data={perf.dowPnl.map((v) => Math.max(0.01, Math.abs(v)))} labels={perf.dowNames} height={140} />
              <div className="grid grid-cols-5 gap-1 mt-2 text-[9px] hud-label">
                {perf.dowPnl.map((v, i) => (
                  <div key={i} className={`text-center ${v >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(v)}</div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Grade Distribution">
              <div className="space-y-2">
                {TRADE_GRADES.map((g) => {
                  const pct = Math.round((perf.gradeCount[g] / gradeTotal) * 100);
                  return (
                    <div key={g}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="hud-label text-primary">{g}</span>
                        <span className="text-muted-foreground">{perf.gradeCount[g]} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 6px var(--primary)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Instrument Breakdown">
              <div className="space-y-3">
                {(["MNQ", "MES"] as Instrument[]).map((i) => (
                  <div key={i} className="border border-border rounded p-3">
                    <div className="flex justify-between items-baseline">
                      <span className="hud-label text-sm text-primary">{i}</span>
                      <span className={`hud-label text-lg ${perf.instPnl[i] >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(perf.instPnl[i])}</span>
                    </div>
                    <div className="hud-label text-[10px] text-muted-foreground mt-1">
                      Point value: ${POINT_VALUE[i]}/pt {perf.bestInst === i && perf.total > 0 && <span className="text-primary ml-2">★ best</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Insights">
            {insights.length ? (
              <ul className="space-y-2">
                {insights.map((s, i) => (
                  <li key={i} className="border border-border rounded p-3 text-xs text-foreground/85">
                    <span className="hud-label text-primary mr-2">›</span>{s}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                Log at least 3 trades to unlock automatic insights.
              </div>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </ModuleLayout>
  );
}
