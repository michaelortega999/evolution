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
import { useEvolutionData, todayDate, uid, type AssetCategory, type TxType } from "@/lib/evolution-data";

export const Route = createFileRoute("/wealth")({
  head: () => ({ meta: [{ title: "Wealth — Evolution" }, { name: "description", content: "Net worth, assets, transactions, and goals." }] }),
  component: WealthPage,
});

const ASSET_CATS: AssetCategory[] = ["Cash", "Investment", "Property", "Other"];

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

  // One-shot seed of demo data so the dashboard has texture on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("wealth_seeded_v1")) return;
    if (data.assets.length > 0 || data.transactions.length > 5) {
      localStorage.setItem("wealth_seeded_v1", "1");
      return;
    }

    const seedAssets: { name: string; value: number; category: AssetCategory }[] = [
      { name: "Chase Checking", value: 1250, category: "Cash" },
      { name: "Chase Savings", value: 3200, category: "Cash" },
      { name: "Brokerage Account", value: 4050, category: "Investment" },
      { name: "Roth IRA", value: 2150, category: "Investment" },
      { name: "Real Estate Equity", value: 1012, category: "Property" },
      { name: "Crypto Wallet", value: 473, category: "Other" },
    ];

    const expenseCats = ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Other"];
    const incomeCats = ["Salary", "Freelance", "Investment", "Side Hustle"];
    const now = new Date();
    const seedTx: { date: string; description: string; amount: number; type: TxType; category: string }[] = [];

    // 12 months of activity
    for (let m = 11; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const y = monthDate.getFullYear();
      const mm = String(monthDate.getMonth() + 1).padStart(2, "0");

      // 1-2 income events
      const incomes = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < incomes; i++) {
        const day = String(1 + Math.floor(Math.random() * 27)).padStart(2, "0");
        const cat = incomeCats[Math.floor(Math.random() * incomeCats.length)];
        seedTx.push({
          date: `${y}-${mm}-${day}`,
          description: cat === "Salary" ? "Salary Deposit" : `${cat} Payment`,
          amount: Math.round(1500 + Math.random() * 2000),
          type: "income",
          category: cat,
        });
      }
      // 6-10 expenses
      const expenses = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < expenses; i++) {
        const day = String(1 + Math.floor(Math.random() * 27)).padStart(2, "0");
        const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
        const descs: Record<string, string[]> = {
          Housing: ["Rent", "Mortgage", "HOA Fee"],
          Food: ["Grocery Store", "Restaurant", "Coffee"],
          Transport: ["Gas Station", "Uber", "Parking"],
          Utilities: ["Electricity Bill", "Internet", "Water"],
          Entertainment: ["Netflix", "Movie Night", "Concert"],
          Other: ["Misc Purchase", "Subscription", "Gift"],
        };
        const d = descs[cat][Math.floor(Math.random() * descs[cat].length)];
        seedTx.push({
          date: `${y}-${mm}-${day}`,
          description: d,
          amount: Math.round(20 + Math.random() * 380),
          type: "expense",
          category: cat,
        });
      }
    }

    const seedGoals = [
      { title: "Emergency Fund", target: 10000, current: 3200, deadline: `${now.getFullYear() + 1}-06-30` },
      { title: "House Down Payment", target: 50000, current: 12500, deadline: `${now.getFullYear() + 2}-12-31` },
      { title: "Vacation Fund", target: 5000, current: 1800, deadline: `${now.getFullYear()}-12-15` },
    ];

    mutate((prev) => ({
      assets: [
        ...prev.assets,
        ...seedAssets.map((a) => ({ id: uid(), ...a })),
      ],
      transactions: [
        ...prev.transactions,
        ...seedTx.map((t) => ({ id: uid(), ...t })),
      ],
      goals: [
        ...prev.goals,
        ...seedGoals.map((g) => ({ id: uid(), category: "Wealth" as const, completed: false, ...g })),
      ],
      profile: { ...prev.profile, tradingBalance: prev.profile.tradingBalance || 2820 },
    }));
    localStorage.setItem("wealth_seeded_v1", "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const assetsTotal = data.assets.reduce((a, x) => a + x.value, 0);
  const liabilitiesTotal = 0; // placeholder — extend data model if needed
  const netWorth = assetsTotal + data.profile.tradingBalance - liabilitiesTotal;
  const cashBalance =
    data.assets.filter((a) => a.category === "Cash").reduce((s, a) => s + a.value, 0) +
    data.profile.tradingBalance;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthIncome = data.transactions
    .filter((t) => t.type === "income" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = data.transactions
    .filter((t) => t.type === "expense" && monthKey(t.date) === thisMonth)
    .reduce((s, t) => s + t.amount, 0);



  // Legacy running balance — still used for other KPI sparklines
  const txSeries = useMemo(() => {
    const sorted = [...data.transactions].sort((a, b) => a.date.localeCompare(b.date));
    let bal = data.profile.tradingBalance;
    const arr = [bal];
    for (const t of sorted) {
      bal += t.type === "income" ? t.amount : -t.amount;
      arr.push(bal);
    }
    return arr.length > 1 ? arr : [bal, bal];
  }, [data.transactions, data.profile.tradingBalance]);


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
    // Cap displayed data at May 2026 with 3400 income; later months stay empty
    const capMonth = 4; // 0-indexed May
    return Array.from(map.entries()).map(([k, v], idx) => {
      if (idx === capMonth) {
        return { key: k, label: "MAY", income: 3400, expense: 0 };
      }
      if (idx > capMonth) {
        return {
          key: k,
          label: new Date(k + "-01").toLocaleString("en", { month: "short" }).toUpperCase(),
          income: 0,
          expense: 0,
        };
      }
      return {
        key: k,
        label: new Date(k + "-01").toLocaleString("en", { month: "short" }).toUpperCase(),
        income: v.income,
        expense: v.expense,
      };
    });
  }, [data.transactions]);


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

  const addTx = () => {
    const amt = Number(tAmt);
    if (!amt || !tDesc.trim()) return;
    mutate((prev) => ({
      transactions: [...prev.transactions, { id: uid(), date: tDate, description: tDesc.trim(), amount: amt, type: tType, category: tCat || "General" }],
    }));
    setTDesc(""); setTAmt("");
  };
  const delTx = (id: string) => mutate((prev) => ({ transactions: prev.transactions.filter((t) => t.id !== id) }));
  const recentTx = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

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
          {/* ===== QUICK ADD ROW ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel title="Quick Add · Transaction">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Description" value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="h-8 text-xs col-span-2" maxLength={80} />
                <Input type="number" placeholder="Amount" value={tAmt} onChange={(e) => setTAmt(e.target.value)} className="h-8 text-xs" />
                <div className="flex gap-1 p-0.5 rounded-md border border-border bg-card/60 h-8">
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
                <Input placeholder="Category" value={tCat} onChange={(e) => setTCat(e.target.value)} className="h-8 text-xs" maxLength={40} />
                <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <Button onClick={addTx} size="sm" className="hud-label text-[10px] mt-3 w-full">
                <Plus className="h-3 w-3 mr-1" /> Add {tType === "income" ? "Income" : "Expense"}
              </Button>
            </Panel>

            <Panel title="Quick Add · Asset">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Name (e.g. Chase)" value={aName} onChange={(e) => setAName(e.target.value)} className="h-8 text-xs col-span-2" maxLength={60} />
                <Input type="number" placeholder="Value $" value={aValue} onChange={(e) => setAValue(e.target.value)} className="h-8 text-xs" />
                <select value={aCat} onChange={(e) => setACat(e.target.value as AssetCategory)} className="h-8 bg-input border border-border rounded px-2 text-xs">
                  {ASSET_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button
                onClick={() => { setEditId(null); saveAsset(); }}
                size="sm"
                className="hud-label text-[10px] mt-3 w-full"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Asset
              </Button>
            </Panel>

            <Panel title="Quick Add · Wealth Goal">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Title" value={gTitle} onChange={(e) => setGTitle(e.target.value)} className="h-8 text-xs col-span-2" maxLength={60} />
                <Input type="number" placeholder="Target $" value={gTarget} onChange={(e) => setGTarget(e.target.value)} className="h-8 text-xs" />
                <Input type="number" placeholder="Current $" value={gCurrent} onChange={(e) => setGCurrent(e.target.value)} className="h-8 text-xs" />
                <Input type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} className="h-8 text-xs col-span-2" />
              </div>
              <Button onClick={addGoal} size="sm" className="hud-label text-[10px] mt-3 w-full">
                <Plus className="h-3 w-3 mr-1" /> Add Goal
              </Button>
            </Panel>
          </div>


          {/* ===== KPI ROW ===== */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="hud-card p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border border-primary/40 flex items-center justify-center bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="hud-label text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  </div>
                  <div className="hud-label text-2xl text-primary hud-glow tabular-nums">{k.value}</div>
                  <div className="flex items-center gap-1.5 text-[10px] hud-label">
                    <span className={k.positive ? "text-primary" : "text-destructive"}>
                      {k.positive ? "▲" : "▼"} {Math.abs(k.delta).toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                  <div className="-mx-1 -mb-1 mt-1">
                    <Sparkline data={k.series.length > 1 ? k.series : [0, 0]} height={36} fill />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== NET WORTH OVER TIME + ASSETS ALLOCATION ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <Panel title="Net Worth Over Time">
              <NetWorthMonthlyPanel
                series={netWorthSeries}
                labels={netWorthLabels}
                currentNetWorth={netWorth}
                onAdd={(monthKey, value) =>
                  mutate((prev) => {
                    const existing = prev.netWorthSnapshots.findIndex((s) => s.monthKey === monthKey);
                    const next = [...prev.netWorthSnapshots];
                    if (existing >= 0) next[existing] = { ...next[existing], value };
                    else next.push({ id: uid(), monthKey, value });
                    return { netWorthSnapshots: next };
                  })
                }
                onReset={() => mutate(() => ({ netWorthSnapshots: [] }))}
              />
            </Panel>



            <Panel title="Income vs Expenses">
              <div className="flex items-end gap-1.5 h-[160px]">
                {monthly.map((m) => (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-0.5 justify-end h-full">
                    <div className="w-full flex items-end gap-0.5 h-full">
                      <div
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${(m.income / incomeMax) * 100}%`,
                          background: "linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))",
                          minHeight: m.income > 0 ? 3 : 0,
                          boxShadow: m.income > 0 ? "0 0 6px var(--primary)" : "none",
                        }}
                      />
                      <div
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${(m.expense / incomeMax) * 100}%`,
                          background: "linear-gradient(180deg, var(--destructive), color-mix(in oklab, var(--destructive) 30%, transparent))",
                          minHeight: m.expense > 0 ? 3 : 0,
                          boxShadow: m.expense > 0 ? "0 0 6px var(--destructive)" : "none",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] hud-label text-muted-foreground">
                {monthly.map((m) => <span key={m.key} className="flex-1 text-center">{m.label}</span>)}
              </div>
              <div className="flex items-center justify-between gap-4 mt-3 text-[10px] hud-label">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Expenses</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hud-label text-[10px] h-7"
                  onClick={() => {
                    if (typeof window !== "undefined" && !window.confirm("Reset all income & expense entries?")) return;
                    mutate((prev) => ({
                      transactions: prev.transactions.filter((t) => t.type !== "income" && t.type !== "expense"),
                    }));
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>

              {/* Monthly breakdown table */}
              <div className="mt-4 border-t border-border pt-3">
                <div className="hud-label text-[10px] text-muted-foreground mb-2 tracking-widest">MONTHLY BREAKDOWN</div>
                <div className="max-h-[220px] overflow-y-auto">
                  <table className="w-full text-xs hud-label">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-[10px] text-muted-foreground border-b border-border">
                        <th className="text-left py-1.5">Month</th>
                        <th className="text-right py-1.5">Income</th>
                        <th className="text-right py-1.5">Expenses</th>
                        <th className="text-right py-1.5">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((m) => {
                        const net = m.income - m.expense;
                        return (
                          <tr key={m.key} className="border-b border-border/40">
                            <td className="py-1.5 text-foreground/80">{m.label}</td>
                            <td className="py-1.5 text-right text-primary tabular-nums">{fmt(m.income)}</td>
                            <td className="py-1.5 text-right text-destructive tabular-nums">{fmt(m.expense)}</td>
                            <td className={`py-1.5 text-right tabular-nums ${net >= 0 ? "text-primary" : "text-destructive"}`}>
                              {net >= 0 ? "+" : ""}{fmt(net)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <IncomeExpenseQuickAdd
                onAdd={(type, amount, description, category, date) =>
                  mutate((prev) => ({
                    transactions: [
                      ...prev.transactions,
                      { id: uid(), date, description, amount, type, category },
                    ],
                  }))
                }
              />
            </Panel>


            <Panel title="Assets Allocation">
              <div className="flex flex-col items-center gap-4">
                {allocByCat.length ? (
                  <Donut
                    data={allocByCat}
                    size={180}
                    thickness={22}
                    centerLabel={fmt(assetsTotal)}
                    centerSub="TOTAL ASSETS"
                  />
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                    No assets yet.
                  </div>
                )}
                <ul className="w-full space-y-1.5">
                  {allocByCat.map((s) => {
                    const pct = Math.round((s.value / (assetsTotal || 1)) * 100);
                    return (
                      <li key={s.label} className="flex items-center gap-2 text-xs hud-label">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                        <span className="flex-1 text-foreground/80">{s.label}</span>
                        <span className="text-primary tabular-nums">{fmt(s.value)}</span>
                        <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Panel>
          </div>

          {/* ===== CASH FLOW + FINANCIAL HEALTH ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Cash Flow This Month">

              <div className="flex items-center gap-4">
                <Donut
                  data={[
                    { label: "Income", value: monthIncome || 1, color: "var(--primary)" },
                    { label: "Expenses", value: monthExpenses || 1, color: "var(--destructive)" },
                  ]}
                  size={150}
                  thickness={20}
                  centerLabel={`${cashFlow >= 0 ? "+" : ""}${fmt(cashFlow)}`}
                  centerSub="NET CASH FLOW"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="hud-label text-[10px] text-muted-foreground">INCOME</div>
                    <div className="hud-label text-xl text-primary hud-glow tabular-nums">{fmt(monthIncome)}</div>
                  </div>
                  <div>
                    <div className="hud-label text-[10px] text-muted-foreground">EXPENSES</div>
                    <div className="hud-label text-xl text-destructive tabular-nums">{fmt(monthExpenses)}</div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Financial Health">
              <div className="flex flex-col items-center gap-2">
                <Gauge value={healthScore} size={200} label={healthLabel} />
                <p className="text-xs text-muted-foreground text-center leading-relaxed mt-1">
                  {healthScore >= 75
                    ? "You're on the right track. Keep building your wealth consistently and avoid unnecessary debt."
                    : healthScore >= 50
                    ? "Steady progress. Increase your savings rate to compound faster."
                    : "Focus on reducing expenses and building an emergency cushion."}
                </p>
              </div>
            </Panel>
          </div>

          {/* ===== ACCOUNT OVERVIEW + RECENT TX + WEALTH GOALS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel title={`Account Overview (${data.assets.length})`}>
              <div className="flex items-center justify-between mb-3">
                <span className="hud-label text-[10px] text-muted-foreground">ACCOUNT · TYPE · BALANCE</span>
                <Button onClick={openNewAsset} size="sm" variant="ghost" className="hud-label text-[10px] h-7">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <ul className="divide-y divide-border">
                {data.assets.slice(0, 6).map((a) => (
                  <li key={a.id} className="py-2.5 grid grid-cols-[1fr_auto_auto] items-center gap-3 group">
                    <div>
                      <div className="hud-label text-xs text-foreground">{a.name}</div>
                      <div className="hud-label text-[10px] text-muted-foreground">{a.category}</div>
                    </div>
                    <span className="hud-label text-xs text-primary tabular-nums">{fmt(a.value)}</span>
                    <button onClick={() => openEditAsset(a.id)} className="hud-label text-[10px] text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100">Edit</button>
                  </li>
                ))}
                {!data.assets.length && <li className="text-xs text-muted-foreground py-6 text-center">No accounts yet.</li>}
              </ul>
            </Panel>

            <Panel title="Recent Transactions">
              <ul className="divide-y divide-border">
                {recentTx.map((t) => (
                  <li key={t.id} className="py-2.5 grid grid-cols-[80px_1fr_auto] items-center gap-3 text-xs">
                    <span className="hud-label text-[10px] text-muted-foreground">{t.date.slice(5).replace("-", "/")}</span>
                    <div className="min-w-0">
                      <div className="hud-label text-foreground truncate">{t.description}</div>
                      <div className="hud-label text-[10px] text-muted-foreground">{t.category}</div>
                    </div>
                    <span className={`hud-label tabular-nums ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                      {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                    </span>
                  </li>
                ))}
                {!recentTx.length && <li className="text-xs text-muted-foreground py-6 text-center">No transactions yet.</li>}
              </ul>
            </Panel>

            <Panel title={`Wealth Goals (${wealthGoals.length})`}>
              <ul className="space-y-3">
                {wealthGoals.slice(0, 4).map((g) => {
                  const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                  return (
                    <li key={g.id} className="border border-border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <TargetIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div className="hud-label text-xs text-foreground truncate">{g.title}</div>
                        </div>
                        <div className="hud-label text-[10px] text-primary tabular-nums whitespace-nowrap">{fmt(g.current)} / {fmt(g.target)}</div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 8px var(--primary)" }} />
                      </div>
                      <div className="hud-label text-[10px] text-primary text-right mt-1">{pct}%</div>
                    </li>
                  );
                })}
                {!wealthGoals.length && <li className="text-xs text-muted-foreground py-6 text-center">No wealth goals yet.</li>}
              </ul>
            </Panel>
          </div>

          {/* ===== SPENDING BY CATEGORY + WEALTH TIP ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            <Panel title="Spending by Category (This Month)">
              <div className="flex items-center gap-5">
                {spendByCat.length ? (
                  <Donut
                    data={spendByCat}
                    size={170}
                    thickness={22}
                    centerLabel={fmt(spendTotal)}
                    centerSub="TOTAL"
                  />
                ) : (
                  <div className="h-[170px] w-[170px] flex items-center justify-center text-xs text-muted-foreground">
                    No expenses.
                  </div>
                )}
                <ul className="flex-1 space-y-1.5">
                  {spendByCat.slice(0, 6).map((s) => {
                    const pct = Math.round((s.value / (spendTotal || 1)) * 100);
                    return (
                      <li key={s.label} className="flex items-center gap-2 text-xs hud-label">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                        <span className="flex-1 text-foreground/80 truncate">{s.label}</span>
                        <span className="text-primary tabular-nums">{fmt(s.value)}</span>
                        <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                      </li>
                    );
                  })}
                  {!spendByCat.length && <li className="text-xs text-muted-foreground">Log expenses to see your spending breakdown.</li>}
                </ul>
              </div>
            </Panel>

            <Panel title="Wealth Tip">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full border border-primary/40 flex items-center justify-center bg-primary/10 shrink-0">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="hud-label text-sm text-primary hud-glow mb-2">Automate your investments</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set up recurring transfers to your investment accounts. Compounding growth over time turns small,
                    consistent contributions into significant wealth — without the willpower tax of doing it manually.
                  </p>
                </div>
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

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function NetWorthMonthlyPanel({
  series,
  labels,
  currentNetWorth,
  onAdd,
  onReset,
}: {
  series: number[];
  labels: string[];
  currentNetWorth: number;
  onAdd: (monthKey: string, value: number) => void;
  onReset: () => void;
}) {
  const [month, setMonth] = useState(currentMonthKey());
  const [value, setValue] = useState("");

  const submit = () => {
    const n = Number(value);
    if (!month || !Number.isFinite(n)) return;
    onAdd(month, n);
    setValue("");
  };

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
            Log at least two monthly snapshots below to draw the chart.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
        <label className="flex flex-col gap-1">
          <span className="hud-label text-[10px] text-muted-foreground">Month</span>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 text-xs w-[150px]"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <span className="hud-label text-[10px] text-muted-foreground">Net Worth ($)</span>
          <Input
            type="number"
            placeholder={String(Math.round(currentNetWorth))}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 text-xs"
          />
        </label>
        <Button onClick={submit} className="hud-label text-[10px] h-9">
          <Plus className="h-3 w-3 mr-1" /> Log
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window !== "undefined" && !window.confirm("Reset all net worth history?")) return;
            onReset();
          }}
          className="hud-label text-[10px] h-9"
        >
          <Trash2 className="h-3 w-3 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}

function IncomeExpenseQuickAdd({
  onAdd,
}: {
  onAdd: (
    type: TxType,
    amount: number,
    description: string,
    category: string,
    date: string,
  ) => void;
}) {
  const [type, setType] = useState<TxType>("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayDate());

  const submit = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    onAdd(
      type,
      n,
      description.trim() || (type === "income" ? "Income" : "Expense"),
      category.trim() || "Other",
      date,
    );
    setAmount("");
    setDescription("");
    setCategory("");
  };

  return (
    <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
      <div className="flex gap-1 p-1 rounded-md border border-border bg-card/60 w-fit">
        {(["income", "expense"] as TxType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`hud-label text-[10px] px-2.5 py-1 rounded transition-colors uppercase ${
              type === t
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
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-8 text-xs" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 text-xs" />
      </div>
      <Button onClick={submit} size="sm" className="hud-label text-[10px] h-8 w-full">
        <Plus className="h-3 w-3 mr-1" /> Log {type === "income" ? "Income" : "Expense"}
      </Button>
    </div>
  );
}


