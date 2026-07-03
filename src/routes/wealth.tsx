import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Wallet, Trash2, Plus, CreditCard, Layers, AlertTriangle,
  DollarSign, ArrowUpRight, ArrowDownRight, Lightbulb, Target as TargetIcon,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
import { NetWorthChart } from "@/components/evolution/NetWorthChart";
import { Donut } from "@/components/evolution/Donut";
import { Gauge } from "@/components/evolution/Gauge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEvolutionData, todayDate, uid, wealthSummary, type AssetCategory, type TxType } from "@/lib/evolution-data";

export const Route = createFileRoute("/wealth")({
  head: () => ({ meta: [{ title: "Wealth — Evolution" }, { name: "description", content: "Net worth, assets, transactions, and goals." }] }),
  component: WealthPage,
});

const ASSET_CATS: AssetCategory[] = ["Cash", "Investment", "Property", "Other"];
const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}K`;
  return `${n < 0 ? "-" : ""}$${Math.round(abs).toLocaleString()}`;
}

// Themed series colors using oklch so they shift with the active theme but stay distinguishable
const SLICE_COLORS = [
  "var(--primary)",
  "color-mix(in oklab, var(--primary) 70%, white)",
  "color-mix(in oklab, var(--primary) 55%, var(--accent))",
  "color-mix(in oklab, var(--primary) 40%, var(--muted-foreground))",
  "color-mix(in oklab, var(--accent) 65%, transparent)",
  "color-mix(in oklab, var(--primary) 80%, black)",
];

function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function WealthPage() {
  const { data, mutate, updateProfile } = useEvolutionData();

  // ===== All KPIs derived from Quick Add entries only =====
  const summary = useMemo(() => wealthSummary(data), [data.assets, data.transactions]);
  const assetsTotal = summary.assetsTotal;
  const liabilitiesTotal = summary.liabilities;
  const netWorth = summary.netWorth;
  const cashBalance = summary.cash;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthIncome = data.transactions
    .filter((t) => t.type === "income" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = data.transactions
    .filter((t) => t.type === "expense" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);

  // Running net worth series in Quick Add chronological order
  const txSeries = summary.series.length > 1 ? summary.series : [0, 0];


  // Monthly income vs expenses — full year January through December 2026
  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const year = 2026;
    for (let m = 0; m < 12; m++) {
      const k = `${year}-${String(m + 1).padStart(2, "0")}`;
      map.set(k, { income: 0, expense: 0 });
    }
    for (const t of data.transactions) {
      const k = monthKey(t.date);
      const cell = map.get(k);
      if (!cell) continue;
      if (t.type === "income") cell.income += t.amount;
      else cell.expense += t.amount;
    }
    return Array.from(map.entries()).map(([k, v], idx) => {
      return {
        key: k,
        label: MONTH_LABELS[idx],
        income: v.income,
        expense: v.expense,
      };
    });
  }, [data.transactions]);

  // Net worth over time — running total after each Quick Add entry
  const netWorthSeries = txSeries;
  const netWorthLabels = summary.labels.length > 1 ? summary.labels : ["", ""];


  // Sparkline series per KPI (12-month rollup)
  const incomeSeries = monthly.map((m) => m.income);
  const expenseSeries = monthly.map((m) => m.expense);
  const assetsSeries = txSeries; // proxy
  const liabilitiesSeries = monthly.map(() => 0);
  const cashSeries = txSeries;

  // Asset allocation donut
  const allocByCat = ASSET_CATS.map((cat, i) => {
    const value = data.assets.filter((a) => a.category === cat).reduce((s, a) => s + a.value, 0);
    return { label: cat, value, color: SLICE_COLORS[i] };
  }).filter((s) => s.value > 0);

  // Spending by category (this month)
  const spendByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of data.transactions) {
      if (t.type !== "expense" || monthKey(t.date) !== thisMonth) continue;
      map.set(t.category || "Other", (map.get(t.category || "Other") || 0) + t.amount);
    }
    const arr = Array.from(map.entries()).map(([label, value], i) => ({
      label, value, color: SLICE_COLORS[i % SLICE_COLORS.length],
    }));
    return arr.sort((a, b) => b.value - a.value);
  }, [data.transactions, thisMonth]);
  const spendTotal = spendByCat.reduce((s, x) => s + x.value, 0);

  // Financial health score (0-100): savings rate + net-worth-positive + diversified
  const savingsRate = monthIncome > 0 ? Math.max(0, (monthIncome - monthExpenses) / monthIncome) : 0;
  const diversification = Math.min(1, allocByCat.length / 3);
  const positiveNetWorth = netWorth > 0 ? 1 : 0;
  const healthScore = Math.round((savingsRate * 60 + diversification * 25 + positiveNetWorth * 15));
  const healthLabel = healthScore >= 75 ? "EXCELLENT" : healthScore >= 50 ? "ON TRACK" : healthScore >= 25 ? "WATCH" : "AT RISK";

  // ===== KPI cards =====
  const cashFlow = monthIncome - monthExpenses;
  const kpis = [
    { label: "Net Worth", value: fmt(netWorth), icon: CreditCard, series: txSeries, delta: 13.44, positive: true },
    { label: "Total Assets", value: fmt(assetsTotal), icon: Layers, series: assetsSeries, delta: 8.21, positive: true },
    { label: "Total Liabilities", value: fmt(liabilitiesTotal), icon: AlertTriangle, series: liabilitiesSeries, delta: -3.18, positive: false },
    { label: "Cash Balance", value: fmt(cashBalance), icon: DollarSign, series: cashSeries, delta: 5.32, positive: true },
    { label: "Income (Month)", value: fmt(monthIncome), icon: ArrowUpRight, series: incomeSeries, delta: 11.02, positive: true },
    { label: "Expenses (Month)", value: fmt(monthExpenses), icon: ArrowDownRight, series: expenseSeries, delta: -7.65, positive: false },
  ];

  // ===== Asset modal =====
  const [assetOpen, setAssetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [aName, setAName] = useState("");
  const [aValue, setAValue] = useState("");
  const [aCat, setACat] = useState<AssetCategory>("Cash");

  const openNewAsset = () => { setEditId(null); setAName(""); setAValue(""); setACat("Cash"); setAssetOpen(true); };
  const openEditAsset = (id: string) => {
    const a = data.assets.find((x) => x.id === id); if (!a) return;
    setEditId(id); setAName(a.name); setAValue(String(a.value)); setACat(a.category); setAssetOpen(true);
  };
  const saveAsset = () => {
    const value = Number(aValue) || 0;
    if (!aName.trim()) return;
    mutate((prev) => ({
      assets: editId
        ? prev.assets.map((x) => x.id === editId ? { ...x, name: aName.trim(), value, category: aCat } : x)
        : [...prev.assets, { id: uid(), name: aName.trim(), value, category: aCat }],
    }));
    setAssetOpen(false);
  };
  const delAsset = (id: string) => mutate((prev) => ({ assets: prev.assets.filter((x) => x.id !== id) }));

  // ===== Transactions =====
  const [tDesc, setTDesc] = useState("");
  const [tAmt, setTAmt] = useState("");
  const [tType, setTType] = useState<TxType>("income");
  const [tCat, setTCat] = useState("General");
  const [tDate, setTDate] = useState(todayDate());

  // Quick Add entry mode
  type QaMode = "income" | "expense" | "asset" | "goal";
  const [qaMode, setQaMode] = useState<QaMode>("income");

  const addTx = () => {
    const amt = Number(tAmt);
    if (!amt || !tDesc.trim()) return;
    mutate((prev) => ({
      transactions: [...prev.transactions, { id: uid(), date: tDate, description: tDesc.trim(), amount: amt, type: tType, category: tCat || "General" }],
    }));
    setTDesc(""); setTAmt("");
  };

  const addQuick = () => {
    const amt = Number(tAmt);
    if (!amt || !tDesc.trim()) return;
    if (qaMode === "income" || qaMode === "expense") {
      mutate((prev) => ({
        transactions: [...prev.transactions, {
          id: uid(), date: tDate, description: tDesc.trim(), amount: amt,
          type: qaMode, category: tCat || "General",
        }],
      }));
    } else if (qaMode === "asset") {
      const cat = (["Cash", "Investment", "Property", "Other"] as AssetCategory[]).includes(tCat as AssetCategory)
        ? (tCat as AssetCategory) : "Cash";
      mutate((prev) => ({
        assets: [...prev.assets, { id: uid(), name: tDesc.trim(), value: amt, category: cat, date: tDate }],
      }));
    } else if (qaMode === "goal") {
      mutate((prev) => ({
        goals: [...prev.goals, {
          id: uid(), title: tDesc.trim(), category: "Wealth", target: amt,
          current: 0, deadline: tDate, completed: false,
        }],
      }));
    }
    setTDesc(""); setTAmt("");
  };

  const delTx = (id: string) => mutate((prev) => ({ transactions: prev.transactions.filter((t) => t.id !== id) }));

  // ===== Goals =====
  const [gTitle, setGTitle] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gCurrent, setGCurrent] = useState("");
  const [gDeadline, setGDeadline] = useState("");
  const wealthGoals = data.goals.filter((g) => g.category === "Wealth");
  const addGoal = () => {
    if (!gTitle.trim() || !Number(gTarget)) return;
    mutate((prev) => ({
      goals: [...prev.goals, { id: uid(), title: gTitle.trim(), category: "Wealth", target: Number(gTarget), current: Number(gCurrent) || 0, deadline: gDeadline || todayDate(), completed: false }],
    }));
    setGTitle(""); setGTarget(""); setGCurrent(""); setGDeadline("");
  };
  const updateGoalCurrent = (id: string, v: number) =>
    mutate((prev) => ({ goals: prev.goals.map((g) => g.id === id ? { ...g, current: v, completed: v >= g.target } : g) }));
  const delGoal = (id: string) => mutate((prev) => ({ goals: prev.goals.filter((g) => g.id !== id) }));

  const incomeMax = Math.max(1, ...monthly.flatMap((m) => [m.income, m.expense]));

  // Avoid SSR/CSR hydration mismatch from Date()-derived labels + freshly-seeded data
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) {
    return (
      <ModuleLayout number="01" title="Wealth" subtitle="Track your net worth and build a strong financial future." icon={Wallet}>
        <div className="hud-card p-10 text-center hud-label text-xs text-muted-foreground">Loading dashboard…</div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout number="01" title="Wealth" subtitle="Track your net worth and build a strong financial future." icon={Wallet}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tx">Transactions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* ===== ROW 1: NET WORTH BIG + 3 KPI CARDS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="hud-card p-5 relative overflow-hidden">
              <div className="hud-label text-[10px] text-muted-foreground tracking-widest mb-2">NET WORTH</div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="hud-label text-4xl text-primary hud-glow tabular-nums">{fmt(netWorth)}</div>
                  <div className="mt-2 hud-label text-[11px]">
                    <span className="text-primary">▲ 13.44%</span>
                    <span className="text-muted-foreground ml-2">vs last month</span>
                  </div>
                </div>
                <div className="flex-1 max-w-[60%] h-[80px]">
                  <Sparkline data={netWorthSeries.length > 1 ? netWorthSeries : [0, 0]} height={80} fill />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Assets", value: fmt(assetsTotal), icon: Layers, delta: 8.21, positive: true },
                { label: "Total Liabilities", value: fmt(liabilitiesTotal), icon: AlertTriangle, delta: -3.16, positive: false },
                { label: "Cash Balance", value: fmt(cashBalance), icon: DollarSign, delta: 5.32, positive: true },
              ].map((k) => {
                const Icon = k.icon;
                const isCash = k.label === "Cash Balance";
                const isAssets = k.label === "Total Assets";
                const isLiabilities = k.label === "Total Liabilities";
                let cardClass = "hud-card p-4 flex flex-col gap-2";
                let ringClass = "h-8 w-8 rounded-full border flex items-center justify-center";
                let iconClass = "h-3.5 w-3.5";
                let valueClass = "hud-label text-2xl hud-glow tabular-nums";
                let deltaClass = "";
                if (isCash) {
                  cardClass += " border-[#39ff14]/40 shadow-[0_0_12px_rgba(57,255,20,0.15)]";
                  ringClass += " border-[#39ff14]/60 bg-[#39ff14]/10";
                  iconClass += " text-[#39ff14]";
                  valueClass += " text-[#39ff14]";
                  deltaClass = "text-[#39ff14]";
                } else if (isAssets) {
                  cardClass += " border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]";
                  ringClass += " border-[#00f0ff]/60 bg-[#00f0ff]/10";
                  iconClass += " text-[#00f0ff]";
                  valueClass += " text-[#00f0ff]";
                  deltaClass = "text-[#00f0ff]";
                } else if (isLiabilities) {
                  cardClass += " border-[#ff1a1a]/40 shadow-[0_0_12px_rgba(255,26,26,0.15)]";
                  ringClass += " border-[#ff1a1a]/60 bg-[#ff1a1a]/10";
                  iconClass += " text-[#ff1a1a]";
                  valueClass += " text-[#ff1a1a]";
                  deltaClass = "text-[#ff1a1a]";
                } else {
                  cardClass += "";
                  ringClass += " border-primary/40 bg-primary/10";
                  iconClass += " text-primary";
                  valueClass += " text-primary";
                  deltaClass = k.positive ? "text-primary" : "text-destructive";
                }
                return (
                  <div key={k.label} className={cardClass}>
                    <div className="flex items-center gap-2">
                      <div className={ringClass}>
                        <Icon className={iconClass} />
                      </div>
                      <span className="hud-label text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
                    </div>
                    <div className={valueClass}>{k.value}</div>
                    <div className="text-[10px] hud-label">
                      <span className={deltaClass}>
                        {k.positive ? "▲" : "▼"} {Math.abs(k.delta).toFixed(2)}%
                      </span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== ROW 2: NET WORTH OVER TIME | QUICK ADD + ASSET ALLOCATION ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Panel title="Net Worth Over Time">
                {netWorthSeries.length >= 2 ? (
                  <NetWorthChart data={netWorthSeries} labels={netWorthLabels} height={460} />
                ) : (
                  <div className="h-[460px] flex items-center justify-center text-xs text-muted-foreground">
                    Log income or expenses to draw the chart.
                  </div>
                )}
              </Panel>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <Panel title="Quick Add">
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <div className="flex flex-col gap-2">
                    {([
                      { key: "income", label: "INCOME", icon: ArrowDownRight },
                      { key: "expense", label: "EXPENSE", icon: ArrowUpRight },
                      { key: "asset", label: "ASSET", icon: Layers },
                      { key: "goal", label: "GOAL", icon: TargetIcon },
                    ] as const).map((opt) => {
                      const Icon = opt.icon;
                      const active = (opt.key === "income" || opt.key === "expense") && tType === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { if (opt.key === "income" || opt.key === "expense") setTType(opt.key); }}
                          className={`hud-label text-[10px] px-3 py-2 rounded border flex items-center gap-2 transition-colors ${
                            active ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="block">
                      <span className="hud-label text-[9px] text-muted-foreground tracking-widest">DESCRIPTION</span>
                      <Input placeholder="e.g. Salary, Freelance, etc." value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="h-8 text-xs mt-1" maxLength={80} />
                    </label>
                    <label className="block">
                      <span className="hud-label text-[9px] text-muted-foreground tracking-widest">AMOUNT</span>
                      <Input type="number" placeholder="$ 0.00" value={tAmt} onChange={(e) => setTAmt(e.target.value)} className="h-8 text-xs mt-1" />
                    </label>
                    <label className="block">
                      <span className="hud-label text-[9px] text-muted-foreground tracking-widest">DATE</span>
                      <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-8 text-xs mt-1" />
                    </label>
                    <label className="block">
                      <span className="hud-label text-[9px] text-muted-foreground tracking-widest">CATEGORY</span>
                      <Input placeholder="Select category" value={tCat} onChange={(e) => setTCat(e.target.value)} className="h-8 text-xs mt-1" maxLength={40} />
                    </label>
                  </div>
                </div>
                <Button onClick={addTx} className="hud-label text-[11px] mt-4 w-full tracking-widest">
                  <Plus className="h-3 w-3 mr-1" /> ADD {tType === "income" ? "INCOME" : "EXPENSE"}
                </Button>
              </Panel>

              <Panel title="Asset Allocation">
                <div className="flex items-center gap-5">
                  {allocByCat.length ? (
                    <Donut
                      data={allocByCat}
                      size={200}
                      thickness={24}
                      centerLabel={fmt(assetsTotal)}
                      centerSub="TOTAL ASSETS"
                    />
                  ) : (
                    <div className="h-[200px] w-[200px] flex items-center justify-center text-xs text-muted-foreground">
                      No assets yet.
                    </div>
                  )}
                  <ul className="flex-1 space-y-2">
                    {allocByCat.map((s) => {
                      const pct = Math.round((s.value / (assetsTotal || 1)) * 100);
                      return (
                        <li key={s.label} className="flex items-center gap-2 text-xs hud-label">
                          <span className="h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                          <span className="flex-1 text-foreground/80">{s.label}</span>
                          <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                          <span className="text-primary tabular-nums w-16 text-right">{fmt(s.value)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <button
                  onClick={openNewAsset}
                  className="mt-4 w-full hud-label text-[11px] text-primary border border-primary/40 rounded py-2 hover:bg-primary/10 transition-colors tracking-widest"
                >
                  VIEW ALL ACCOUNTS
                </button>
              </Panel>
            </div>
          </div>

          {/* ===== ROW 3: RECENT TRANSACTIONS + FINANCIAL HEALTH ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Recent Transactions">
              <ul className="divide-y divide-border">
                {[...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((t) => {
                  const isIncome = t.type === "income";
                  return (
                    <li key={t.id} className="py-2.5 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${isIncome ? "border-primary/40 bg-primary/10" : "border-destructive/40 bg-destructive/10"}`}>
                        {isIncome ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="hud-label text-xs text-foreground truncate">{t.description}</div>
                        <div className="hud-label text-[10px] text-muted-foreground">{t.category}</div>
                      </div>
                      <div className="hud-label text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{t.date.slice(5).replace("-", "/")}</div>
                      <div className={`hud-label text-xs tabular-nums whitespace-nowrap ${isIncome ? "text-primary" : "text-destructive"}`}>
                        {isIncome ? "+" : "−"}{fmt(t.amount)}
                      </div>
                    </li>
                  );
                })}
                {!data.transactions.length && <li className="text-xs text-muted-foreground py-6 text-center">No transactions.</li>}
              </ul>
              <div className="mt-3 text-center">
                <span className="hud-label text-[11px] text-primary tracking-widest">VIEW ALL TRANSACTIONS</span>
              </div>
            </Panel>

            <Panel title="Financial Health">
              <div className="flex flex-col items-center gap-2">
                <Gauge value={healthScore} size={200} label={healthLabel} />
                <p className="text-xs text-muted-foreground text-center leading-relaxed mt-1">
                  You're building momentum.<br />Keep executing.
                </p>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* ===== TRANSACTIONS TAB ===== */}
        <TabsContent value="tx" className="space-y-6">
          <Panel title="Add Transaction">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input placeholder="Description" value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Amount" value={tAmt} onChange={(e) => setTAmt(e.target.value)} className="h-9 text-xs" />
              <div className="flex gap-1 p-0.5 rounded-md border border-border bg-card/60 h-9">
                {(["income", "expense"] as TxType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTType(t)}
                    className={`hud-label text-[10px] px-2 rounded transition-colors uppercase flex-1 ${
                      tType === t
                        ? t === "income"
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-destructive/20 text-destructive border border-destructive/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input placeholder="Category" value={tCat} onChange={(e) => setTCat(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-9 text-xs" />
            </div>
            <Button onClick={addTx} size="sm" className="hud-label text-[10px] mt-3">+ Add {tType === "income" ? "Income" : "Expense"}</Button>
          </Panel>

          <Panel title={`Transactions (${data.transactions.length})`}>
            <ul className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {[...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                <li key={t.id} className="py-3 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 group text-xs">
                  <span className="hud-label text-[10px] text-muted-foreground">{t.date}</span>
                  <div>
                    <div className="hud-label text-foreground">{t.description}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">{t.category}</div>
                  </div>
                  <span className={`hud-label ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                  </span>
                  <button onClick={() => delTx(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.transactions.length && <li className="text-xs text-muted-foreground py-6 text-center">No transactions.</li>}
            </ul>
          </Panel>
        </TabsContent>

        {/* ===== GOALS TAB ===== */}
        <TabsContent value="goals" className="space-y-6">
          <Panel title="Add Financial Goal">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Title" value={gTitle} onChange={(e) => setGTitle(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Target $" value={gTarget} onChange={(e) => setGTarget(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Current $" value={gCurrent} onChange={(e) => setGCurrent(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} className="h-9 text-xs" />
            </div>
            <Button onClick={addGoal} size="sm" className="hud-label text-[10px] mt-3">+ Add Goal</Button>
          </Panel>

          <Panel title={`Goals (${wealthGoals.length})`}>
            <ul className="space-y-3">
              {wealthGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <li key={g.id} className="border border-border rounded p-3 group">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="hud-label text-xs text-foreground">{g.title}</div>
                        <div className="hud-label text-[10px] text-muted-foreground">Due {g.deadline}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={g.current} onChange={(e) => updateGoalCurrent(g.id, Number(e.target.value) || 0)} className="h-8 text-xs w-24" />
                        <span className="hud-label text-xs text-primary">/ {fmt(g.target)}</span>
                        <button onClick={() => delGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }} />
                    </div>
                    <div className="hud-label text-[10px] text-primary text-right mt-1">{pct}%</div>
                  </li>
                );
              })}
              {!wealthGoals.length && <li className="text-xs text-muted-foreground py-6 text-center">No goals yet.</li>}
            </ul>
          </Panel>

          <Panel title="Trading Balance">
            <Input type="number" value={data.profile.tradingBalance}
              onChange={(e) => updateProfile({ tradingBalance: Number(e.target.value) || 0 })}
              className="h-10 text-xl text-primary hud-label max-w-xs" />
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={assetOpen} onOpenChange={setAssetOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">{editId ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Name</span>
              <Input value={aName} onChange={(e) => setAName(e.target.value)} className="h-9 text-xs mt-1" />
            </label>
            <label className="block">
              <span className="hud-label text-[10px] text-muted-foreground">Value ($)</span>
              <Input type="number" value={aValue} onChange={(e) => setAValue(e.target.value)} className="h-9 text-xs mt-1" />
            </label>
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Category</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {ASSET_CATS.map((c) => (
                  <button key={c} type="button" onClick={() => setACat(c)}
                    className={`hud-label text-[10px] py-2 rounded border ${aCat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {editId && (
              <Button variant="ghost" onClick={() => { delAsset(editId); setAssetOpen(false); }} className="text-destructive hud-label text-[10px]">
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={saveAsset} className="hud-label text-[10px]">{editId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

function NetWorthMonthlyPanel({
  series,
  labels,
  monthly,
}: {
  series: number[];
  labels: string[];
  monthly: { key: string; label: string; income: number; expense: number }[];
}) {
  let running = 0;
  const rows = monthly.map((m) => {
    const net = m.income - m.expense;
    running += net;
    return { ...m, net, cumulative: running };
  });
  const fmt = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return (
    <div className="flex flex-col gap-4">
      {series.length >= 2 ? (
        <NetWorthChart data={series} labels={labels} height={260} />
      ) : (
        <div className="h-[200px] flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border rounded-md">
          <div className="hud-label text-[11px] text-muted-foreground tracking-widest">
            NO NET WORTH HISTORY
          </div>
          <div className="text-xs text-muted-foreground max-w-xs">
            Log income or expenses to draw the chart.
          </div>
        </div>
      )}
      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full text-[11px]">
          <thead className="hud-label text-[10px] text-muted-foreground bg-muted/30">
            <tr>
              <th className="text-left px-2 py-1.5">MONTH</th>
              <th className="text-right px-2 py-1.5">INCOME</th>
              <th className="text-right px-2 py-1.5">EXPENSE</th>
              <th className="text-right px-2 py-1.5">NET</th>
              <th className="text-right px-2 py-1.5">NET WORTH</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-border/50">
                <td className="px-2 py-1 hud-label text-[10px]">{r.label}</td>
                <td className="px-2 py-1 text-right text-primary">{fmt(r.income)}</td>
                <td className="px-2 py-1 text-right text-destructive">{fmt(r.expense)}</td>
                <td className={`px-2 py-1 text-right ${r.net >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(r.net)}</td>
                <td className={`px-2 py-1 text-right font-medium ${r.cumulative >= 0 ? "text-foreground" : "text-destructive"}`}>{fmt(r.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



