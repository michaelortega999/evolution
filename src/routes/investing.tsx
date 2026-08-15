import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, Plus, Trash2, BookOpen, ChevronLeft, ChevronRight,
  Download, X, Building2, ArrowLeft, Layers,
} from "lucide-react";


import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, todayDate, uid, syncTradingAssets, tradingTotals,
  TRADING_SESSIONS,
  type EvolutionData, type TradingAccount, type TradingTx,
  type TradingTxType, type TradeJournalEntry, type TradingSessionKind,
} from "@/lib/evolution-data";

export const Route = createFileRoute("/investing")({
  head: () => ({ meta: [
    { title: "Investing — Evolution" },
    { name: "description", content: "Prop trading terminal. Accounts, calendar, journal — all synced to Wealth." },
  ] }),
  component: InvestingPage,
});

// ---------- helpers ----------
function fmtMoney(n: number, opts?: { sign?: boolean }) {
  const sign = n < 0 ? "-" : opts?.sign ? "+" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtBig(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function pnlClass(n: number) {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-muted-foreground";
}
const JOURNAL_DAILY_TX_PREFIX = "journal-daily-";
function journalDailyTxId(date: string) {
  return `${JOURNAL_DAILY_TX_PREFIX}${date}`;
}
function signedTxAmount(t: TradingTx) {
  return t.type === "profit" ? Math.abs(t.amount) : -Math.abs(t.amount);
}

function useClientNow() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function InvestingPage() {
  const { data, mutate } = useEvolutionData();

  // ---- Mutation wrappers that also re-sync trading assets into Wealth ----
  const mutateTrading = (
    patch: (prev: EvolutionData) => Partial<Pick<EvolutionData, "tradingAccounts" | "tradingTxns" | "tradeJournal">>,
  ) => {
    mutate((prev) => {
      const delta = patch(prev);
      const next: EvolutionData = { ...prev, ...delta };
      const synced = syncTradingAssets(next);
      return { tradingAccounts: synced.tradingAccounts, tradingTxns: synced.tradingTxns, tradeJournal: synced.tradeJournal, assets: synced.assets };
    });
  };

  const accounts = data.tradingAccounts;
  const txns = data.tradingTxns;
  const journal = data.tradeJournal;

  const totals = useMemo(() => tradingTotals(accounts, txns), [accounts, txns]);
  const allTx = useMemo(() => [...txns].sort((a, b) => (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? ""))), [txns]);

  // ---- top stats ----
  const nowIso = useClientNow();
  const now = nowIso ? new Date(nowIso) : null;
  const dayStr = now ? now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase() : "—";
  const dateStr = now ? now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase() : "—";
  const timeStr = now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";

  const totalPnl = useMemo(() =>
    txns.reduce((s, t) => s + (t.type === "profit" ? t.amount : -t.amount), 0),
  [txns]);
  const winCount = txns.filter((t) => t.type === "profit").length;
  const winRate = txns.length ? Math.round((winCount / txns.length) * 100) : 0;
  const dayMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of txns) m.set(t.date, (m.get(t.date) ?? 0) + (t.type === "profit" ? t.amount : -t.amount));
    return m;
  }, [txns]);
  const bestDay = useMemo(() => {
    let best = { date: "—", pnl: 0 };
    for (const [d, p] of dayMap) if (p > best.pnl) best = { date: d, pnl: p };
    return best;
  }, [dayMap]);

  // ---- Add account modal ----
  const [addAccOpen, setAddAccOpen] = useState(false);
  const [accName, setAccName] = useState("");
  const [accCompany, setAccCompany] = useState("");
  const [accSize, setAccSize] = useState("");
  const [accStart, setAccStart] = useState("");

  const submitAccount = () => {
    if (!accName.trim() || !Number(accSize)) return;
    const start = Number(accStart) || Number(accSize);
    const newAcc: TradingAccount = {
      id: uid(),
      name: accName.trim(),
      company: (accCompany.trim() || accName.trim().slice(0, 2)).toUpperCase().slice(0, 3),
      size: Number(accSize),
      startingBalance: start,
      createdDate: todayDate(),
    };
    mutateTrading((prev) => ({ tradingAccounts: [...prev.tradingAccounts, newAcc] }));
    setAccName(""); setAccCompany(""); setAccSize(""); setAccStart("");
    setAddAccOpen(false);
  };
  const deleteAccount = (id: string) => {
    if (!confirm("Delete this account and all its transactions?")) return;
    mutateTrading((prev) => ({
      tradingAccounts: prev.tradingAccounts.filter((a) => a.id !== id),
      tradingTxns: prev.tradingTxns.filter((t) => t.accountId !== id),
    }));
  };

  // ---- Add transaction ----
  const [txTab, setTxTab] = useState<TradingTxType>("profit");
  const [txAcc, setTxAcc] = useState<string>(accounts[0]?.id ?? "");
  const [txAmt, setTxAmt] = useState("");
  const [txDate, setTxDate] = useState(todayDate());
  const [txReview, setTxReview] = useState("");
  const [txSession, setTxSession] = useState<TradingSessionKind>("New York");

  useEffect(() => {
    if (!accounts.length) {
      if (txAcc) setTxAcc("");
      return;
    }
    if (!accounts.some((a) => a.id === txAcc)) setTxAcc(accounts[0].id);
  }, [accounts, txAcc]);

  const submitTx = () => {
    const amt = Number(txAmt);
    const accId = txAcc || accounts[0]?.id;
    if (!Number.isFinite(amt) || amt === 0 || !accId) return;
    const resolvedType: TradingTxType = amt < 0 ? "loss" : txTab;
    const newTx: TradingTx = {
      id: uid(),
      accountId: accId,
      date: txDate,
      type: resolvedType,
      amount: Math.abs(amt),
      notes: txReview.trim() || undefined,
    };
    mutateTrading((prev) => {
      const nextTxns = [...prev.tradingTxns, newTx];
      // Upsert a trade-review journal entry for this date so calendar + strategy journal stay in sync.
      const existing = prev.tradeJournal.find((e) => e.date === txDate);
      let nextJournal = prev.tradeJournal;
      if (txReview.trim() || existing) {
        const dayPnl =
          nextTxns
            .filter((t) => t.date === txDate)
            .reduce((s, t) => s + signedTxAmount(t), 0);
        if (existing) {
          const mergedReview = txReview.trim()
            ? (existing.review ? `${existing.review}\n\n${txReview.trim()}` : txReview.trim())
            : existing.review;
          nextJournal = prev.tradeJournal.map((e) =>
            e.id === existing.id ? { ...e, review: mergedReview, pnl: dayPnl, session: txSession } : e,
          );
        } else {
          nextJournal = [
            { id: uid(), date: txDate, session: txSession, review: txReview.trim(), tags: [], pnl: dayPnl },
            ...prev.tradeJournal,
          ];
        }
      }
      return { tradingTxns: nextTxns, tradeJournal: nextJournal };
    });
    setTxAmt(""); setTxReview("");
  };
  const deleteTx = (id: string) =>
    mutateTrading((prev) => ({ tradingTxns: prev.tradingTxns.filter((t) => t.id !== id) }));



  // ---- Journal ----
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalEditing, setJournalEditing] = useState<TradeJournalEntry | null>(null);
  const [jDate, setJDate] = useState(todayDate());
  const [jSession, setJSession] = useState<TradingSessionKind>("New York");
  const [jReview, setJReview] = useState("");
  const [jTags, setJTags] = useState("");
  const [jPnl, setJPnl] = useState("");

  // ---- In-page Journal Review view ----
  const [reviewDate, setReviewDate] = useState<string | null>(null);
  const openReview = (date: string) => {
    const entry = journal.find((e) => e.date === date);
    if (entry) {
      setJournalEditing(entry);
      setJDate(entry.date); setJSession(entry.session); setJReview(entry.review);
      setJTags(entry.tags.join(", ")); setJPnl(String(entry.pnl));
    } else {
      setJournalEditing(null);
      setJDate(date); setJSession("New York");
      setJReview(""); setJTags(""); setJPnl(String(dayMap.get(date) ?? ""));
    }
    setReviewDate(date);
  };
  const closeReview = () => setReviewDate(null);

  const openNewJournal = (date?: string) => {
    openReview(date ?? todayDate());
  };
  const openEditJournal = (entry: TradeJournalEntry) => {
    openReview(entry.date);
  };
  const submitJournal = () => {
    if (!jReview.trim() && !jPnl.trim()) return;
    const tags = jTags.split(",").map((s) => s.trim()).filter(Boolean);
    const pnlN = Number(jPnl) || 0;
    if (journalEditing) {
      const updated = { ...journalEditing, date: jDate, session: jSession, review: jReview.trim(), tags, pnl: pnlN };
      mutateTrading((prev) => {
        const replacingIds = new Set([journalDailyTxId(jDate), journalDailyTxId(journalEditing.date)]);
        const hasPnlInput = jPnl.trim() !== "" && Number.isFinite(Number(jPnl));
        let nextTxns = prev.tradingTxns.filter((t) => !replacingIds.has(t.id));
        if (hasPnlInput && prev.tradingAccounts[0]) {
          const manualPnl = nextTxns
            .filter((t) => t.date === jDate)
            .reduce((s, t) => s + signedTxAmount(t), 0);
          const delta = pnlN - manualPnl;
          if (delta !== 0) {
            nextTxns = [...nextTxns, {
              id: journalDailyTxId(jDate),
              accountId: prev.tradingAccounts[0].id,
              date: jDate,
              type: delta > 0 ? "profit" : "loss",
              amount: Math.abs(delta),
              notes: `Trade review daily P/L${jReview.trim() ? `: ${jReview.trim()}` : ""}`,
            }];
          }
        }
        return { tradeJournal: prev.tradeJournal.map((e) => e.id === updated.id ? updated : e), tradingTxns: nextTxns };
      });
      setJournalEditing(updated);
    } else {
      const fresh: TradeJournalEntry = { id: uid(), date: jDate, session: jSession, review: jReview.trim(), tags, pnl: pnlN };
      mutateTrading((prev) => {
        const hasPnlInput = jPnl.trim() !== "" && Number.isFinite(Number(jPnl));
        let nextTxns = prev.tradingTxns.filter((t) => t.id !== journalDailyTxId(jDate));
        if (hasPnlInput && prev.tradingAccounts[0]) {
          const manualPnl = nextTxns
            .filter((t) => t.date === jDate)
            .reduce((s, t) => s + signedTxAmount(t), 0);
          const delta = pnlN - manualPnl;
          if (delta !== 0) {
            nextTxns = [...nextTxns, {
              id: journalDailyTxId(jDate),
              accountId: prev.tradingAccounts[0].id,
              date: jDate,
              type: delta > 0 ? "profit" : "loss",
              amount: Math.abs(delta),
              notes: `Trade review daily P/L${jReview.trim() ? `: ${jReview.trim()}` : ""}`,
            }];
          }
        }
        return { tradeJournal: [fresh, ...prev.tradeJournal], tradingTxns: nextTxns };
      });
      setJournalEditing(fresh);
    }
    setJournalOpen(false);
  };
  const deleteJournal = (id: string) =>
    mutateTrading((prev) => ({ tradeJournal: prev.tradeJournal.filter((e) => e.id !== id) }));


  const journalByDate = useMemo(() => {
    const m = new Map<string, TradeJournalEntry>();
    for (const j of journal) m.set(j.date, j);
    return m;
  }, [journal]);

  // ---- Calendar ----
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const shiftMonth = (delta: number) =>
    setCalMonth((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goToday = () => { const d = new Date(); setCalMonth({ y: d.getFullYear(), m: d.getMonth() }); };

  const calCells = useMemo(() => {
    const first = new Date(calMonth.y, calMonth.m, 1);
    const firstWeekday = first.getDay(); // 0=Sun
    const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    const cells: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: iso, day: d });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
    return cells;
  }, [calMonth]);

  const monthlyPnl = useMemo(() => {
    const key = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}`;
    return txns
      .filter((t) => t.date.startsWith(key))
      .reduce((s, t) => s + (t.type === "profit" ? t.amount : -t.amount), 0);
  }, [txns, calMonth]);
  const monthStartBalance = useMemo(() => {
    const key = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}`;
    const before = txns
      .filter((t) => t.date < `${key}-01`)
      .reduce((s, t) => s + (t.type === "profit" ? t.amount : -t.amount), 0);
    const seed = accounts.reduce((s, a) => s + a.startingBalance, 0);
    return seed + before;
  }, [txns, accounts, calMonth]);
  const monthlyReturnPct = monthStartBalance ? (monthlyPnl / monthStartBalance) * 100 : 0;
  const monthLabel = new Date(calMonth.y, calMonth.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }).toUpperCase();

  // ---- Transaction history filters ----
  const [histAcc, setHistAcc] = useState<string>("all");
  const [histType, setHistType] = useState<string>("all");
  const filteredHistory = useMemo(() => {
    return allTx.filter((t) => {
      if (histAcc !== "all" && t.accountId !== histAcc) return false;
      if (histType !== "all" && t.type !== histType) return false;
      return true;
    });
  }, [allTx, histAcc, histType]);
  const runningBalances = useMemo(() => {
    // running balance PER account across time-ordered rows
    const byAcc: Record<string, number> = {};
    for (const acc of accounts) byAcc[acc.id] = acc.startingBalance;
    const asc = [...txns].sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
    const map: Record<string, number> = {};
    for (const t of asc) {
      byAcc[t.accountId] = (byAcc[t.accountId] ?? 0) + (t.type === "profit" ? t.amount : -t.amount);
      map[t.id] = byAcc[t.accountId];
    }
    return map;
  }, [txns, accounts]);
  const exportCsv = () => {
    const rows = [
      ["Date", "Account", "Type", "Amount", "P/L", "Balance", "Notes"],
      ...filteredHistory.map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        const signed = t.type === "profit" ? t.amount : -t.amount;
        return [t.date, acc?.name ?? "—", t.type, t.amount.toFixed(2), signed.toFixed(2), (runningBalances[t.id] ?? 0).toFixed(2), (t.notes ?? "").replace(/[\r\n,]/g, " ")];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `investing-transactions-${todayDate()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModuleLayout number="06" title="INVESTING" subtitle="Track performance. Refine strategy. Build freedom." icon={TrendingUp}>
      {/* ============ TOP STATS BAR ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="hud-card p-3 flex flex-col gap-1.5 border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border border-[#00f0ff]/60 bg-[#00f0ff]/10 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-[#00f0ff]" />
            </div>
            <span className="hud-label text-[10px] text-muted-foreground uppercase tracking-wider">Total Assets</span>
          </div>
          <div className="hud-label text-xl text-[#00f0ff] hud-glow tabular-nums">{fmtBig(totals.balance)}</div>
        </div>
        <StatCard label="Win Rate" value={`${winRate}%`} valueClass="text-primary" />
        <StatCard label="Best Day" value={fmtMoney(bestDay.pnl, { sign: true })} valueClass="text-emerald-400" />
        <div className="hud-card p-3">
          <div className="hud-label text-[9px] text-muted-foreground">{dayStr}</div>
          <div className="hud-label text-base text-primary hud-glow leading-tight">{dateStr}</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-0.5">{timeStr}</div>
        </div>
      </div>

      {reviewDate ? (
        <JournalReviewView
          onBack={closeReview}
          onSave={submitJournal}
          onDelete={journalEditing ? () => { deleteJournal(journalEditing.id); closeReview(); } : undefined}
          isNew={!journalEditing}
          jDate={jDate} setJDate={setJDate}
          jSession={jSession} setJSession={setJSession}
          jReview={jReview} setJReview={setJReview}
          jTags={jTags} setJTags={setJTags}
          jPnl={jPnl} setJPnl={setJPnl}
        />
      ) : (
      <>
      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 xl:h-[calc(100vh-13rem)]">
        {/* Left: Monthly Performance + Transaction History */}
        <div className="xl:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          <Panel title="MONTHLY PERFORMANCE" className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between -mt-8 mb-2">
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => shiftMonth(-1)} className="text-primary hover:bg-primary/10 rounded p-1"><ChevronLeft className="h-3 w-3" /></button>
                <div className="hud-label text-xs text-primary hud-glow">{monthLabel}</div>
                <button onClick={() => shiftMonth(1)} className="text-primary hover:bg-primary/10 rounded p-1"><ChevronRight className="h-3 w-3" /></button>
              </div>
              <Button onClick={goToday} size="sm" variant="outline" className="hud-label text-[10px]">TODAY</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
                <div key={d} className="hud-label text-[9px] text-muted-foreground text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1">
              {calCells.map((cell, i) => {
                if (!cell.date) return <div key={i} className="aspect-square" />;
                const pnl = dayMap.get(cell.date) ?? 0;
                const hasJournal = journalByDate.has(cell.date);
                const isToday = cell.date === todayDate();
                return (
                  <div
                    key={i}
                    className={`aspect-square border rounded p-1 flex flex-col justify-between text-[10px] transition-colors ${isToday ? "border-primary bg-primary/5" : "border-border"} ${pnl !== 0 ? "hover:bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`hud-label ${isToday ? "text-primary hud-glow" : "text-muted-foreground"}`}>{cell.day}</span>
                      <button
                        onClick={() => openReview(cell.date!)}
                        className={`h-5 w-5 rounded flex items-center justify-center border transition-all ${hasJournal ? "bg-primary/25 border-primary/70 text-primary hud-glow" : "bg-primary/10 border-primary/40 text-primary hover:bg-primary/25 hover:border-primary/70"}`}
                        title={hasJournal ? "Open trade review" : "Add trade review"}
                      >
                        <BookOpen className="h-3 w-3" />
                      </button>
                    </div>
                    {pnl !== 0 && (
                      <div className={`hud-label tabular-nums text-[8px] leading-none ${pnlClass(pnl)}`}>
                        {pnl > 0 ? "+" : ""}${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
              <div>
                <div className="hud-label text-[9px] text-muted-foreground">MONTHLY P/L</div>
                <div className={`hud-label text-base tabular-nums ${pnlClass(monthlyPnl)}`}>{fmtMoney(monthlyPnl, { sign: true })}</div>
              </div>
              <div>
                <div className="hud-label text-[9px] text-muted-foreground">MONTHLY RETURN</div>
                <div className={`hud-label text-base tabular-nums ${pnlClass(monthlyPnl)}`}>
                  {monthlyPnl > 0 ? "+" : ""}{monthlyReturnPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="TRANSACTION HISTORY" className="h-[42%] flex flex-col min-h-0">
            <div className="flex items-center justify-end -mt-8 mb-2 gap-2 flex-wrap">
              <select value={histAcc} onChange={(e) => setHistAcc(e.target.value)}
                className="h-8 bg-input border border-border rounded px-2 text-xs hud-label">
                <option value="all">ALL ACCOUNTS</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select value={histType} onChange={(e) => setHistType(e.target.value)}
                className="h-8 bg-input border border-border rounded px-2 text-xs hud-label">
                <option value="all">ALL TYPES</option>
                <option value="profit">PROFIT</option>
                <option value="loss">LOSS</option>
              </select>
              <Button onClick={exportCsv} size="sm" variant="outline" className="hud-label text-[10px]">
                <Download className="h-3 w-3 mr-1" /> EXPORT
              </Button>
            </div>
            <div className="overflow-x-auto flex-1 min-h-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="hud-label text-[10px] text-muted-foreground text-left border-b border-border">
                    <th className="py-1.5 pr-3">DATE</th>
                    <th className="pr-3">ACCOUNT</th>
                    <th className="pr-3">TYPE</th>
                    <th className="pr-3 text-right">AMOUNT</th>
                    <th className="pr-3 text-right">P/L</th>
                    <th className="pr-3 text-right">BALANCE</th>
                    <th className="pr-3">NOTES</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((t) => {
                    const acc = accounts.find((a) => a.id === t.accountId);
                    const signed = t.type === "profit" ? t.amount : -t.amount;
                    const bal = runningBalances[t.id] ?? 0;
                    return (
                      <tr key={t.id} className="border-b border-border/50 group">
                        <td className="py-1.5 pr-3 text-muted-foreground">{new Date(t.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="pr-3">{acc?.name ?? "—"}</td>
                        <td className="pr-3">
                          <span className={`hud-label text-[10px] px-2 py-0.5 rounded border ${t.type === "profit" ? "text-emerald-400 border-emerald-400/40 bg-emerald-500/10" : "text-red-400 border-red-400/40 bg-red-500/10"}`}>
                            {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="pr-3 text-right tabular-nums">${t.amount.toFixed(2)}</td>
                        <td className={`pr-3 text-right tabular-nums hud-label ${pnlClass(signed)}`}>{fmtMoney(signed, { sign: true })}</td>
                        <td className="pr-3 text-right tabular-nums text-muted-foreground">${bal.toFixed(2)}</td>
                        <td className="pr-3 text-muted-foreground truncate max-w-[240px]">{t.notes ?? "—"}</td>
                        <td>
                          <button onClick={() => deleteTx(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filteredHistory.length && (
                <div className="text-xs text-muted-foreground text-center py-6">No transactions match the current filters.</div>
              )}
            </div>
          </Panel>
        </div>

        {/* Right: Accounts + Add Transaction + Strategy Journal */}
        <div className="xl:col-span-4 flex flex-col gap-3 h-full overflow-hidden">
          <Panel title="ACCOUNTS" className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-end -mt-8 mb-2">
              <Button onClick={() => setAddAccOpen(true)} size="sm" variant="outline" className="hud-label text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> Add Account
              </Button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const t = totals.perAccount[acc.id] ?? { balance: acc.startingBalance, today: 0, month: 0 };
                return (
                  <div key={acc.id} className="hud-card p-2.5 group relative">
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      title="Delete account"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center hud-label text-[10px] text-primary">
                        {acc.company}
                      </div>
                      <div className="min-w-0">
                        <div className="hud-label text-xs text-foreground truncate">{acc.name}</div>
                        <div className="hud-label text-[9px] text-muted-foreground">${acc.size.toLocaleString()} ACCOUNT</div>
                      </div>
                    </div>
                    <div className="hud-label text-[8px] text-muted-foreground mt-1.5">BALANCE</div>
                    <div className="hud-label text-lg text-primary hud-glow tabular-nums">{fmtBig(t.balance)}</div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 border-t border-border pt-1.5">
                      <div>
                        <div className="hud-label text-[8px] text-muted-foreground">P/L TODAY</div>
                        <div className={`hud-label text-xs tabular-nums ${pnlClass(t.today)}`}>{fmtMoney(t.today, { sign: true })}</div>
                      </div>
                      <div>
                        <div className="hud-label text-[8px] text-muted-foreground">P/L THIS MONTH</div>
                        <div className={`hud-label text-xs tabular-nums ${pnlClass(t.month)}`}>{fmtMoney(t.month, { sign: true })}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!accounts.length && (
                <div className="text-center text-xs text-muted-foreground py-6">
                  No accounts yet — click "Add Account" to begin.
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-border space-y-2 shrink-0">
              <div className="border border-primary/40 bg-primary/5 rounded p-2.5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="hud-label text-[9px] text-muted-foreground">TOTAL P/L (ALL ACCOUNTS)</div>
                  <div className={`hud-label text-lg hud-glow tabular-nums truncate ${pnlClass(totalPnl)}`}>{fmtMoney(totalPnl, { sign: totalPnl > 0 })}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FooterStat label="P/L TODAY" value={fmtMoney(totals.todayPnl, { sign: true })} valueClass={pnlClass(totals.todayPnl)} />
                <FooterStat label="P/L MONTH" value={fmtMoney(totals.monthPnl, { sign: true })} valueClass={pnlClass(totals.monthPnl)} />
              </div>
            </div>

            <div className="mt-1 text-[9px] hud-label text-muted-foreground text-right shrink-0">
              ↻ Accounts synced to Wealth
            </div>
          </Panel>

          <Panel title="ADD TRANSACTION · TRADE REVIEW" className="shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => setTxTab("profit")}
                    className={`hud-label text-[10px] py-1.5 rounded border transition-colors ${txTab === "profit" ? "bg-emerald-500/15 border-emerald-400/60 text-emerald-400 hud-glow" : "border-border text-muted-foreground hover:bg-primary/5"}`}
                  >
                    ADD PROFIT
                  </button>
                  <button
                    onClick={() => setTxTab("loss")}
                    className={`hud-label text-[10px] py-1.5 rounded border transition-colors ${txTab === "loss" ? "bg-red-500/15 border-red-400/60 text-red-400 hud-glow" : "border-border text-muted-foreground hover:bg-primary/5"}`}
                  >
                    ADD LOSS
                  </button>
                </div>
                <label className="block mb-1.5">
                  <div className="hud-label text-[8px] text-muted-foreground mb-1">ACCOUNT</div>
                  <select value={txAcc} onChange={(e) => setTxAcc(e.target.value)}
                    className="h-8 w-full bg-input border border-border rounded px-2 text-xs">
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </label>
                <label className="block mb-1.5">
                  <div className="hud-label text-[8px] text-muted-foreground mb-1">AMOUNT ($)</div>
                  <Input type="number" step="0.01" placeholder="Enter amount" value={txAmt} onChange={(e) => setTxAmt(e.target.value)} className="h-8 text-xs" />
                </label>
                <label className="block">
                  <div className="hud-label text-[8px] text-muted-foreground mb-1">DATE</div>
                  <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="h-8 text-xs" />
                </label>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="hud-label text-[8px] text-muted-foreground">TRADE REVIEW</div>
                  <button
                    type="button"
                    onClick={() => openReview(txDate)}
                    className="hud-label text-[8px] text-primary hud-glow hover:underline flex items-center gap-1"
                    title="Open the full trade review for this date"
                  >
                    <BookOpen className="h-3 w-3" /> OPEN FULL REVIEW
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="block">
                    <div className="hud-label text-[8px] text-muted-foreground mb-1">SESSION</div>
                    <select
                      value={txSession}
                      onChange={(e) => setTxSession(e.target.value as TradingSessionKind)}
                      className="h-8 w-full bg-input border border-border rounded px-2 text-xs"
                    >
                      {TRADING_SESSIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <div className="flex items-end">
                    <div className="text-[8px] hud-label text-muted-foreground leading-tight">
                      Saved to <span className="text-primary">Strategy Journal</span> &amp; <span className="text-primary">Monthly Calendar</span> for {txDate}.
                    </div>
                  </div>
                </div>
                <label className="block mb-2 flex-1">
                  <Textarea
                    rows={4}
                    placeholder="Setup, execution, emotions, mistakes, lessons..."
                    value={txReview}
                    onChange={(e) => setTxReview(e.target.value)}
                    className="text-xs h-full"
                  />
                </label>
                <Button onClick={submitTx} className={`w-full hud-label text-[10px] ${txTab === "profit" ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-400/50" : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"}`}>
                  {txTab === "profit" ? "ADD PROFIT" : "ADD LOSS"}
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="STRATEGY JOURNAL" className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-end -mt-8 mb-2">
              <Button onClick={() => openNewJournal()} size="sm" variant="outline" className="hud-label text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> NEW ENTRY
              </Button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1">
              {journal.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">No entries yet.</div>
              )}
              {[...journal].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                <div key={e.id} className="border border-border rounded p-2 hover:border-primary/40 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="hud-label text-[10px] text-primary">{new Date(e.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</div>
                      <div className="hud-label text-[9px] text-muted-foreground mt-0.5">{e.session.toUpperCase()} SESSION</div>
                    </div>
                    <button onClick={() => deleteJournal(e.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => openReview(e.date)} className="block text-left w-full mt-1.5">
                    <div className="text-xs text-foreground/85 leading-snug line-clamp-2">{e.review}</div>
                    <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
                      <div className="flex flex-wrap gap-1">
                        {e.tags.map((t) => (
                          <span key={t} className="hud-label text-[9px] text-primary/80">#{t.replace(/\s+/g, "")}</span>
                        ))}
                      </div>
                      <div className={`hud-label text-xs tabular-nums ${pnlClass(e.pnl)}`}>{fmtMoney(e.pnl, { sign: true })}</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* ============ MODALS ============ */}

      <Dialog open={addAccOpen} onOpenChange={setAddAccOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="hud-label text-primary flex items-center gap-2"><Building2 className="h-4 w-4" /> Add Trading Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block">
              <div className="hud-label text-[10px] text-muted-foreground mb-1">Account Name</div>
              <Input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="e.g. Apex Trader Funded" className="h-9 text-xs" />
            </label>
            <label className="block">
              <div className="hud-label text-[10px] text-muted-foreground mb-1">Company Mark (2-3 letters)</div>
              <Input value={accCompany} onChange={(e) => setAccCompany(e.target.value)} placeholder="e.g. ATF" maxLength={3} className="h-9 text-xs" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Account Size ($)</div>
                <Input type="number" value={accSize} onChange={(e) => setAccSize(e.target.value)} placeholder="50000" className="h-9 text-xs" />
              </label>
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Starting Balance ($)</div>
                <Input type="number" value={accStart} onChange={(e) => setAccStart(e.target.value)} placeholder="defaults to size" className="h-9 text-xs" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAccOpen(false)}>Cancel</Button>
            <Button onClick={submitAccount}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="hud-label text-primary flex items-center gap-2"><BookOpen className="h-4 w-4" /> {journalEditing ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Date</div>
                <Input type="date" value={jDate} onChange={(e) => setJDate(e.target.value)} className="h-9 text-xs" />
              </label>
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Trading Session</div>
                <select value={jSession} onChange={(e) => setJSession(e.target.value as TradingSessionKind)}
                  className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
                  {TRADING_SESSIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <div className="hud-label text-[10px] text-muted-foreground mb-1">Review</div>
              <Textarea rows={4} value={jReview} onChange={(e) => setJReview(e.target.value)} placeholder="What happened? Setup, execution, outcome..." className="text-xs" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Tags (comma separated)</div>
                <Input value={jTags} onChange={(e) => setJTags(e.target.value)} placeholder="ICT, Liquidity" className="h-9 text-xs" />
              </label>
              <label className="block">
                <div className="hud-label text-[10px] text-muted-foreground mb-1">Daily P/L ($)</div>
                <Input type="number" step="0.01" value={jPnl} onChange={(e) => setJPnl(e.target.value)} className="h-9 text-xs" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJournalOpen(false)}>Cancel</Button>
            <Button onClick={submitJournal}>{journalEditing ? "Save Changes" : "Save Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

// ---------- small presentational helpers ----------
function StatCard({ label, value, valueClass = "text-primary", icon: Icon, iconRight = false }: { label: string; value: string; valueClass?: string; icon?: React.ComponentType<{ className?: string }>; iconRight?: boolean }) {
  return (
    <div className="hud-card p-4">
      <div className="hud-label text-[9px] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className={`hud-label text-lg tabular-nums hud-glow ${valueClass}`}>{value}</div>
        {Icon && iconRight && <Icon className="h-6 w-6 text-primary" />}
        {Icon && !iconRight && <Icon className="h-3.5 w-3.5 text-primary" />}
      </div>
    </div>
  );
}
function FooterStat({ label, value, valueClass = "text-primary" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="border border-border rounded p-3 text-center">
      <div className="hud-label text-[9px] text-muted-foreground">{label}</div>
      <div className={`hud-label text-lg mt-1 tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}

// ---------- In-page Trade Review view ----------
function JournalReviewView(props: {
  onBack: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isNew: boolean;
  jDate: string; setJDate: (v: string) => void;
  jSession: TradingSessionKind; setJSession: (v: TradingSessionKind) => void;
  jReview: string; setJReview: (v: string) => void;
  jTags: string; setJTags: (v: string) => void;
  jPnl: string; setJPnl: (v: string) => void;
}) {
  const { onBack, onSave, onDelete, isNew, jDate, setJDate, jSession, setJSession, jReview, setJReview, jTags, setJTags, jPnl, setJPnl } = props;
  const pnlN = Number(jPnl) || 0;
  return (
    <Panel title={isNew ? "NEW TRADE REVIEW" : "TRADE REVIEW"}>
      <div className="flex items-center justify-between -mt-8 mb-4 gap-2">
        <Button onClick={onBack} size="sm" variant="outline" className="hud-label text-[10px]">
          <ArrowLeft className="h-3 w-3 mr-1" /> BACK
        </Button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button onClick={onDelete} size="sm" variant="outline" className="hud-label text-[10px] text-red-400 border-red-400/40 hover:bg-red-500/10">
              <Trash2 className="h-3 w-3 mr-1" /> DELETE
            </Button>
          )}
          <Button onClick={onSave} size="sm" className="hud-label text-[10px] bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50">
            {isNew ? "SAVE ENTRY" : "SAVE CHANGES"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="hud-card p-4">
          <div className="hud-label text-[9px] text-muted-foreground mb-1">DATE</div>
          <Input type="date" value={jDate} onChange={(e) => setJDate(e.target.value)} className="h-9 text-xs" />
        </div>
        <div className="hud-card p-4">
          <div className="hud-label text-[9px] text-muted-foreground mb-1">SESSION</div>
          <select value={jSession} onChange={(e) => setJSession(e.target.value as TradingSessionKind)}
            className="h-9 w-full bg-input border border-border rounded px-2 text-xs">
            {TRADING_SESSIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="hud-card p-4">
          <div className="hud-label text-[9px] text-muted-foreground mb-1">DAILY P/L ($)</div>
          <Input type="number" step="0.01" value={jPnl} onChange={(e) => setJPnl(e.target.value)}
            className={`h-9 text-xs tabular-nums ${pnlN > 0 ? "text-emerald-400" : pnlN < 0 ? "text-red-400" : ""}`} />
        </div>
      </div>

      <label className="block mb-4">
        <div className="hud-label text-[10px] text-muted-foreground mb-2">TRADE REVIEW / DAILY INPUTS</div>
        <Textarea
          rows={14}
          value={jReview}
          onChange={(e) => setJReview(e.target.value)}
          placeholder="What was the setup? How did you execute? What did you learn? Emotions, mistakes, wins, refinements..."
          className="text-xs leading-relaxed"
        />
      </label>

      <label className="block">
        <div className="hud-label text-[10px] text-muted-foreground mb-2">STRATEGY TAGS (comma separated)</div>
        <Input value={jTags} onChange={(e) => setJTags(e.target.value)} placeholder="ICT, Liquidity, FVG, SMT" className="h-9 text-xs" />
      </label>
    </Panel>
  );
}
