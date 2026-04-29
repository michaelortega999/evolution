import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Wallet, Trash2, Plus } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Sparkline } from "@/components/evolution/Sparkline";
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
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function WealthPage() {
  const { data, mutate, updateProfile } = useEvolutionData();

  // Net worth = sum of assets + tradingBalance
  const assetsTotal = data.assets.reduce((a, x) => a + x.value, 0);
  const netWorth = assetsTotal + data.profile.tradingBalance;

  // Build sparkline from transactions running balance
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

  const runningBalance = txSeries[txSeries.length - 1];

  // Asset modal
  const [assetOpen, setAssetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [aName, setAName] = useState("");
  const [aValue, setAValue] = useState("");
  const [aCat, setACat] = useState<AssetCategory>("Cash");

  const openNewAsset = () => {
    setEditId(null); setAName(""); setAValue(""); setACat("Cash"); setAssetOpen(true);
  };
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

  // Transaction
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

  // Goals
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
  const updateGoalCurrent = (id: string, v: number) => {
    mutate((prev) => ({ goals: prev.goals.map((g) => g.id === id ? { ...g, current: v, completed: v >= g.target } : g) }));
  };
  const delGoal = (id: string) => mutate((prev) => ({ goals: prev.goals.filter((g) => g.id !== id) }));

  return (
    <ModuleLayout number="01" title="Wealth" subtitle="Net Worth · Assets · Goals" icon={Wallet}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tx">Transactions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Net Worth">
              <div className="hud-label text-3xl text-primary hud-glow">{fmt(netWorth)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">Assets + Trading</div>
            </Panel>
            <Panel title="Assets">
              <div className="hud-label text-3xl text-primary hud-glow">{fmt(assetsTotal)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">{data.assets.length} entries</div>
            </Panel>
            <Panel title="Trading Balance">
              <Input type="number" value={data.profile.tradingBalance}
                onChange={(e) => updateProfile({ tradingBalance: Number(e.target.value) || 0 })}
                className="h-10 text-xl text-primary hud-label" />
            </Panel>
          </div>

          <Panel title="Balance Trend">
            <Sparkline data={txSeries} height={180} />
          </Panel>

          <Panel title={`Assets (${data.assets.length})`}>
            <Button onClick={openNewAsset} size="sm" className="hud-label text-[10px] mb-4">
              <Plus className="h-3 w-3 mr-1" /> Add Asset
            </Button>
            <ul className="divide-y divide-border">
              {data.assets.map((a) => (
                <li key={a.id} className="py-3 grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 group">
                  <div>
                    <div className="hud-label text-xs text-foreground">{a.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">{a.category}</div>
                  </div>
                  <span className="hud-label text-sm text-primary">{fmt(a.value)}</span>
                  <button onClick={() => openEditAsset(a.id)} className="hud-label text-[10px] text-muted-foreground hover:text-primary px-2">Edit</button>
                  <button onClick={() => delAsset(a.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.assets.length && <li className="text-xs text-muted-foreground py-6 text-center">No assets yet.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="tx" className="space-y-6">
          <Panel title="Add Transaction">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input placeholder="Description" value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="h-9 text-xs" />
              <Input type="number" placeholder="Amount" value={tAmt} onChange={(e) => setTAmt(e.target.value)} className="h-9 text-xs" />
              <select value={tType} onChange={(e) => setTType(e.target.value as TxType)}
                className="h-9 bg-input border border-border rounded px-2 text-xs">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <Input placeholder="Category" value={tCat} onChange={(e) => setTCat(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="h-9 text-xs" />
            </div>
            <Button onClick={addTx} size="sm" className="hud-label text-[10px] mt-3">+ Add</Button>
          </Panel>

          <Panel title={`Transactions (${data.transactions.length}) · Balance: ${fmt(runningBalance)}`}>
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
                        <Input type="number" value={g.current} onChange={(e) => updateGoalCurrent(g.id, Number(e.target.value) || 0)}
                          className="h-8 text-xs w-24" />
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
