import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEvolutionData, todayDate, uid, wealthSummary, type AssetCategory, type TxType } from "@/lib/evolution-data";
import { useBank } from "@/lib/use-bank";
import { summarizeBalances, summarizeFlows, isTransfer } from "@/lib/finance-core";

export const Route = createFileRoute("/wealth")({
  head: () => ({ meta: [{ title: "Wealth — Evolution" }, { property: "og:title", content: "Wealth — Evolution" }, { property: "og:description", content: "Net worth, assets, transactions, and goals." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "description", content: "Net worth, assets, transactions, and goals." }] }),
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
  const bank = useBank();
  // Imported mode: only for the finance owner with stored bank accounts (server + RLS enforce access).
  const imported = bank.status === "ready" && bank.accounts.length > 0;
  const bankBal = useMemo(() => summarizeBalances(bank.accounts, bank.balances), [bank.accounts, bank.balances]);

  // ===== All KPIs derived from Quick Add entries only =====
  const summary = useMemo(() => wealthSummary(data), [data.assets, data.transactions]);
  // Bank balances come only from provider snapshots; bank transactions never add to balances (no double counting).
  // Imported mode: manual asset valuations + provider balances − known linked debt. Manual income/expense
  // history is NOT added to bank balances, and historical expense categories are not debt.
  const manualAssetValues = summary.assetsTotal;
  const assetsTotal = imported ? manualAssetValues + (bankBal.assets ?? 0) : summary.assetsTotal;
  const liabilitiesTotal = imported ? bankBal.knownLiabilities ?? 0 : summary.liabilities;
  const netWorth = imported ? manualAssetValues + (bankBal.assets ?? 0) - (bankBal.knownLiabilities ?? 0) : summary.netWorth;
  const cashBalance = imported ? bankBal.cash ?? 0 : summary.cash;
  const fmtImported = (n: number | null) => (n == null ? "UNAVAILABLE" : fmtCentsShort(n));
  const disp = imported
    ? { net: fmtCentsShort(netWorth), assets: fmtCentsShort(assetsTotal), liab: bankBal.knownLiabilities == null ? "UNAVAILABLE" : fmtCentsShort(bankBal.knownLiabilities), cash: fmtImported(bankBal.cash) }
    : { net: fmt(netWorth), assets: fmt(assetsTotal), liab: fmt(liabilitiesTotal), cash: fmt(cashBalance) };

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Bank flows are only reported when the import is complete (never from an empty or capped set).
  const flowsComplete = imported && bank.coverage.complete;

  // Manual cash flow stays separate from bank flows.
  const monthIncome = data.transactions
    .filter((t) => t.type === "income" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = data.transactions
    .filter((t) => t.type === "expense" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);
  const [bankOpen, setBankOpen] = useState(false);
  const bankFreshness = !imported ? null
    : bankBal.assets == null && bankBal.knownLiabilities == null ? "BANK BALANCES UNAVAILABLE"
    : `${bankBal.allSnapshot ? "IMPORTED SNAPSHOT" : "LAST BANK REFRESH"} · ${bankBal.anyDateUnknown || !bankBal.oldestAsOf ? "BALANCE DATE UNKNOWN" : `AS OF ${bankBal.oldestAsOf.slice(0, 10)}`}`;

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
    const value = Number(aValue);
    if (!aName.trim()) { toast.error("Give the asset a name."); return; }
    if (!Number.isFinite(value) || value < 0) { toast.error("Enter a value of 0 or more."); return; }
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
  type QaMode = "income" | "expense" | "asset";
  const [qaMode, setQaMode] = useState<QaMode>("income");

  const addTx = () => {
    const amt = Number(tAmt);
    if (!tDesc.trim()) { toast.error("Add a description."); return; }
    if (!Number.isFinite(amt) || amt <= 0) { toast.error("Enter an amount above 0."); return; }
    mutate((prev) => ({
      transactions: [...prev.transactions, { id: uid(), date: tDate, description: tDesc.trim(), amount: amt, type: tType, category: tCat || "General" }],
    }));
    setTDesc(""); setTAmt("");
  };

  const addQuick = () => {
    const amt = Number(tAmt);
    if (!tDesc.trim()) { toast.error("Add a description."); return; }
    if (!Number.isFinite(amt) || amt <= 0) { toast.error("Enter an amount above 0."); return; }
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
    if (!gTitle.trim()) { toast.error("Give the goal a title."); return; }
    if (!(Number(gTarget) > 0)) { toast.error("Target must be above 0."); return; }
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
      <div className="flex flex-col gap-3 h-[calc(100vh-180px)] min-h-0">
        {/* ===== ROW 1: NET WORTH + 3 KPI CARDS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 shrink-0">
          <div className="lg:col-span-2 hud-card p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="hud-label text-[9px] text-muted-foreground tracking-widest">NET WORTH</div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="hud-label text-3xl text-primary hud-glow tabular-nums">{disp.net}</div>
                <div className="mt-1 hud-label text-[10px]">
                  {imported ? (
                    <button type="button" onClick={() => setBankOpen(true)} className="text-muted-foreground underline decoration-dotted hover:text-primary text-left" title="Partial: excludes debts not linked. Open bank accounts.">PARTIAL · {bankFreshness} · HISTORY UNAVAILABLE</button>
                  ) : (<>
                  <span className="text-primary">▲ 13.44%</span>
                  <span className="text-muted-foreground ml-2">vs last month</span>
                  </>)}
                </div>
              </div>
              <div className="w-[45%] h-[50px]">
                <Sparkline data={netWorthSeries.length > 1 ? netWorthSeries : [0, 0]} height={50} fill />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-3">
            {[
              { label: "Total Assets", value: disp.assets, icon: Layers, delta: 8.21, positive: true },
              { label: "Total Liabilities", value: disp.liab, icon: AlertTriangle, delta: -3.16, positive: false },
              { label: "Cash Balance", value: disp.cash, icon: DollarSign, delta: 5.32, positive: true },
            ].map((k) => {
              const Icon = k.icon;
              const isCash = k.label === "Cash Balance";
              const isAssets = k.label === "Total Assets";
              const isLiabilities = k.label === "Total Liabilities";
              let cardClass = "hud-card p-3 flex flex-col justify-between gap-1";
              let ringClass = "h-7 w-7 rounded-full border flex items-center justify-center";
              let iconClass = "h-3 w-3";
              let valueClass = "hud-label text-xl hud-glow tabular-nums";
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
              }
              return (
                <div key={k.label} className={cardClass}>
                  <div className="flex items-center gap-2">
                    <div className={ringClass}>
                      <Icon className={iconClass} />
                    </div>
                    <span className="hud-label text-[9px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  </div>
                  <div className={valueClass}>{k.value}</div>
                  <div className="text-[9px] hud-label">
                    {imported ? (
                      <span className="text-muted-foreground">{isLiabilities ? "KNOWN LINKED ONLY · " : ""}HISTORY UNAVAILABLE</span>
                    ) : (<>
                    <span className={deltaClass}>
                      {k.positive ? "▲" : "▼"} {Math.abs(k.delta).toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== ROW 2: NET WORTH OVER TIME | QUICK ADD | ASSET ALLOCATION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 flex-1 min-h-0">
          <div className="lg:col-span-3 hud-card p-4 flex flex-col min-h-0">
            <h2 className="hud-label text-[10px] text-muted-foreground mb-2">NET WORTH OVER TIME</h2>
            <div className="flex-1 min-h-0">
              {imported ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                  Bank net worth history unavailable — only a single imported snapshot with no balance date is stored.
                </div>
              ) : netWorthSeries.length >= 2 ? (
                <NetWorthChart data={netWorthSeries} labels={netWorthLabels} height={220} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Log income or expenses to draw the chart.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
            <Panel title="Quick Add" className="p-3 shrink-0">
              {(() => {
                const QA_COLORS: Record<QaMode, string> = {
                  income: "#00ff88",
                  expense: "#ff3333",
                  asset: "#00d4ff",
                };
                const activeColor = QA_COLORS[qaMode];
                const descPh = qaMode === "asset" ? "e.g. Chase Savings" : "e.g. Salary, Freelance, etc.";
                const catPh = qaMode === "asset" ? "Cash | Investment | Property | Other" : "Category";
                return (
                  <>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <div className="flex flex-col gap-1.5">
                        {([
                          { key: "income", label: "INCOME", icon: ArrowDownRight },
                          { key: "expense", label: "EXPENSE", icon: ArrowUpRight },
                          { key: "asset", label: "ASSET", icon: Layers },
                        ] as const).map((opt) => {
                          const Icon = opt.icon;
                          const color = QA_COLORS[opt.key];
                          const active = qaMode === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => {
                                setQaMode(opt.key);
                                if (opt.key === "income" || opt.key === "expense") setTType(opt.key);
                              }}
                              className="hud-label text-[9px] px-2 py-1.5 rounded border flex items-center gap-1.5 transition-all"
                              style={{
                                borderColor: active ? color : "var(--border)",
                                background: active ? `${color}1a` : "transparent",
                                color: active ? color : undefined,
                                boxShadow: active ? `0 0 8px ${color}66` : "none",
                              }}
                            >
                              <span
                                className="h-5 w-5 rounded-full flex items-center justify-center border shrink-0"
                                style={{
                                  borderColor: color,
                                  background: `${color}22`,
                                  boxShadow: `0 0 6px ${color}88, inset 0 0 4px ${color}44`,
                                }}
                              >
                                <Icon className="h-3 w-3" style={{ color, filter: `drop-shadow(0 0 3px ${color})` }} />
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="block">
                          <span className="hud-label text-[8px] text-muted-foreground tracking-widest">DESCRIPTION</span>
                          <Input placeholder={descPh} value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="h-7 text-[11px] mt-0.5" maxLength={80} />
                        </label>
                        <label className="block">
                          <span className="hud-label text-[8px] text-muted-foreground tracking-widest">AMOUNT</span>
                          <Input type="number" placeholder="$ 0.00" value={tAmt} onChange={(e) => setTAmt(e.target.value)} className="h-7 text-[11px] mt-0.5" />
                        </label>
                        <label className="block">
                          <span className="hud-label text-[8px] text-muted-foreground tracking-widest">DATE</span>
                          <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-7 text-[11px] mt-0.5" />
                        </label>
                        <label className="block">
                          <span className="hud-label text-[8px] text-muted-foreground tracking-widest">CATEGORY</span>
                          <Input placeholder={catPh} value={tCat} onChange={(e) => setTCat(e.target.value)} className="h-7 text-[11px] mt-0.5" maxLength={40} />
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={addQuick}
                      className="hud-label text-[10px] mt-2 w-full tracking-widest rounded-md py-1.5 flex items-center justify-center transition-all border"
                      style={{
                        borderColor: activeColor,
                        background: `${activeColor}1f`,
                        color: activeColor,
                        boxShadow: `0 0 12px ${activeColor}55, inset 0 0 6px ${activeColor}33`,
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> ADD {qaMode.toUpperCase()}
                    </button>
                  </>
                );
              })()}
            </Panel>

            <Panel title="Asset Allocation" className="p-3 flex-1 min-h-0">
              <div className="flex items-center gap-3 h-full">
                {allocByCat.length ? (
                  <Donut
                    data={allocByCat}
                    size={130}
                    thickness={18}
                    centerLabel={fmt(assetsTotal)}
                    centerSub="TOTAL ASSETS"
                  />
                ) : (
                  <div className="h-[130px] w-[130px] flex items-center justify-center text-xs text-muted-foreground">
                    No assets yet.
                  </div>
                )}
                <ul className="flex-1 space-y-1.5">
                  {allocByCat.map((s) => {
                    const pct = Math.round((s.value / (assetsTotal || 1)) * 100);
                    return (
                      <li key={s.label} className="flex items-center gap-2 text-[11px] hud-label">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                        <span className="flex-1 text-foreground/80 truncate">{s.label}</span>
                        <span className="text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                        <span className="text-primary tabular-nums w-14 text-right">{fmt(s.value)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Panel>
          </div>
        </div>

        {/* ===== ROW 3: RECENT TRANSACTIONS + FINANCIAL HEALTH ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
          <Panel title="Recent Transactions" className="p-3">
            <ul className="divide-y divide-border">
              {(() => {
                type Row = { id: string; date: string; kind: "income" | "expense" | "asset" | "goal"; description: string; category: string; amount: number; bank?: boolean };
                const rows: Row[] = [];
                for (const t of data.transactions) rows.push({ id: t.id, date: t.date, kind: t.type, description: t.description, category: t.category, amount: t.amount });
                for (const a of data.assets) rows.push({ id: a.id, date: a.date ?? todayDate(), kind: "asset", description: a.name, category: a.category, amount: a.value });
                for (const g of data.goals) rows.push({ id: g.id, date: g.deadline || todayDate(), kind: "goal", description: g.title, category: g.category, amount: g.target });
                // Imported bank rows are read-only (no delete); amount > 0 = money out.
                if (imported) for (const t of bank.transactions) {
                  if (t.environment === "sandbox") continue;
                  const tags = ["BANK", t.pending ? "PENDING" : null, isTransfer(t) ? "TRANSFER" : null].filter(Boolean).join(" · ");
                  rows.push({ id: t.id, date: t.posted_date ?? t.authorized_date ?? "", kind: t.amount > 0 ? "expense" : "income", description: t.merchant_name || t.name, category: tags, amount: Math.abs(t.amount), bank: true });
                }
                const styles: Record<Row["kind"], { color: string; sign: string; Icon: typeof ArrowUpRight }> = {
                  income: { color: "#00ff88", sign: "+", Icon: ArrowUpRight },
                  expense: { color: "#ff3333", sign: "−", Icon: ArrowDownRight },
                  asset: { color: "#00d4ff", sign: "+", Icon: Layers },
                  goal: { color: "#f59e0b", sign: "◎", Icon: TargetIcon },
                };
                return rows.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((r) => {
                  const s = styles[r.kind];
                  const Icon = s.Icon;
                  const onDelete = () => {
                    if (r.kind === "income" || r.kind === "expense") delTx(r.id);
                    else if (r.kind === "asset") delAsset(r.id);
                    else if (r.kind === "goal") delGoal(r.id);
                  };
                  return (
                    <li key={`${r.kind}-${r.id}`} className="py-2 flex items-center gap-2 group">
                      <div className="h-7 w-7 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: `${s.color}66`, background: `${s.color}1a`, boxShadow: `0 0 6px ${s.color}55` }}>
                        <Icon className="h-3 w-3" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="hud-label text-[11px] text-foreground truncate">{r.description || r.kind.toUpperCase()}</div>
                        <div className="hud-label text-[9px] text-muted-foreground">{r.category || r.kind}</div>
                      </div>
                      <div className="hud-label text-[9px] text-muted-foreground tabular-nums whitespace-nowrap">{r.date.slice(5).replace("-", "/")}</div>
                      <div className="hud-label text-[11px] tabular-nums whitespace-nowrap" style={{ color: s.color }}>
                        {s.sign}{fmt(r.amount)}
                      </div>
                      {r.bank ? <span className="h-5 w-5 shrink-0" aria-hidden /> : (
                      <button
                        type="button"
                        onClick={onDelete}
                        aria-label="Delete entry"
                        className="h-5 w-5 rounded border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/60 hover:bg-destructive/10 transition-colors opacity-60 group-hover:opacity-100"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                      )}
                    </li>
                  );
                });
              })()}
              {!data.transactions.length && !data.assets.length && !data.goals.length && <li className="text-xs text-muted-foreground py-4 text-center">No entries yet.</li>}
            </ul>
          </Panel>

          <Panel title="Financial Health" className="p-3">
            <div className="flex items-center justify-center gap-4 h-full">
              {imported ? (
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px] text-center">
                  Score unavailable — bank data is incomplete (no imported transactions{flowsComplete ? "" : " yet"}, unlinked debts unknown).
              ) : (<>
              <Gauge value={healthScore} size={140} label={healthLabel} />
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[140px]">
                You're building momentum. Keep executing.
              </p>
            </div>
          </Panel>
        </div>
      </div>

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



