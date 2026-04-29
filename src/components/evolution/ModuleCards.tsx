import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Wallet, Apple, Dumbbell, FileText, NotebookPen,
  TrendingUp, Briefcase, Star, Plus, ChevronRight, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkline } from "./Sparkline";
import hobbyHologram from "@/assets/hobby-hologram.png";
import { RingProgress } from "./RingProgress";
import { BarChart } from "./BarChart";
import { HoloIcon, type HoloVariant } from "./HoloIcon";
import {
  useEvolutionData, MEALS, nutritionSummary, fitnessSummary, investingSummary,
  todayDate, dayTotals, nutritionStreak, uid,
  type Meal, type Hobby,
} from "@/lib/evolution-data";

type ModuleHref = "/wealth" | "/nutrition" | "/fitness" | "/journal" | "/notes" | "/investing" | "/business" | "/hobby";

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

// Per-module accent colors (hex) used for icon ring + title only
const ACCENT: Record<HoloVariant, string> = {
  wealth:    "#f59e0b",
  nutrition: "#22c55e",
  fitness:   "#f97316",
  journal:   "#a855f7",
  notes:     "#eab308",
  investing: "#06b6d4",
  business:  "#3b82f6",
  hobby:     "#ec4899",
};

function Card({
  icon: Icon, variant, number, title, href, children,
}: { icon: LucideIcon; variant: HoloVariant; number: string; title: string; href: ModuleHref; children: React.ReactNode }) {
  const accent = ACCENT[variant];
  return (
    <div className="hud-card hud-scan p-5 flex flex-col hover:border-primary/50 transition-colors relative">
      <HoloIcon variant={variant} />
      <Link to={href} className="flex items-center gap-3 mb-4 group/header">
        <div
          className="h-10 w-10 rounded-full border-2 flex items-center justify-center group-hover/header:scale-105 transition-transform"
          style={{
            borderColor: accent,
            background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
            boxShadow: `0 0 10px ${accent}80`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span className="hud-label text-xs text-muted-foreground">{number}</span>
        <h3
          className="hud-label text-sm transition-colors group-hover/header:opacity-100"
          style={{ color: accent, textShadow: `0 0 10px ${accent}66` }}
        >
          {title}
        </h3>
      </Link>
      <div className="flex-1 flex flex-col">{children}</div>
      <Link to={href} className="mt-3 flex items-center gap-1 text-[10px] hud-label text-primary/80 hover:text-primary w-fit">
        View Details <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export function WealthCard() {
  const { data, mutate } = useEvolutionData();
  const [amount, setAmount] = useState("");
  const inv = investingSummary(data.investing);
  const netWorth = inv.current + data.profile.tradingBalance;

  const addAsset = () => {
    const n = Number(amount);
    if (!n) return;
    mutate((prev) => ({
      investing: [...prev.investing, { date: todayDate(), value: (prev.investing.at(-1)?.value ?? 0) + n }],
    }));
    setAmount("");
  };

  return (
    <Card icon={Wallet} variant="wealth" number="01" title="Wealth" href="/wealth">
      <div className="hud-label text-[10px] text-muted-foreground">Net Worth</div>
      <div className="hud-label text-2xl text-primary hud-glow my-1">{formatMoney(netWorth)}</div>
      <div className="hud-label text-[10px] text-primary/80">
        {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}%
      </div>
      <div className="mt-3">
        <Sparkline data={inv.data.length ? inv.data : [1]} height={50} />
      </div>
      <div className="flex gap-2 mt-3">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && addAsset()}
               placeholder="+$" type="number" className="h-8 text-xs" />
        <button onClick={addAsset} className="h-8 px-3 rounded-md border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10">Add</button>
      </div>
    </Card>
  );
}

// Same quick-add presets as the Nutrition page
const QUICK_FOODS = [
  { key: "ground_beef_rice", label: "Ground Beef & Rice", kcal: 450, p: 35, c: 35, f: 18 },
  { key: "chicken_rice",     label: "Chicken & Rice",     kcal: 380, p: 40, c: 38, f: 6 },
  { key: "greek_yogurt",     label: "Greek Yogurt & Berries", kcal: 200, p: 20, c: 22, f: 2 },
  { key: "broccoli",         label: "Broccoli",           kcal: 150, p: 8,  c: 18, f: 2 },
];

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function categoryFromTime(time: string): "Breakfast" | "Lunch" | "Dinner" | "Snack" {
  const h = Number(time.slice(0, 2));
  if (h < 10) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 18) return "Dinner";
  return "Snack";
}

export function NutritionCard() {
  const { data, mutate } = useEvolutionData();
  const today = todayDate();

  // Live totals from the same source the Nutrition page uses
  const t = dayTotals(today, data.mealLogs);
  const calTarget = data.profile.calorieTarget || 2000;
  const pTarget = data.profile.proteinTarget || 160;
  const calPct = Math.min(100, Math.round((t.kcal / calTarget) * 100));
  const streak = nutritionStreak(data.mealLogs, calTarget);
  const water = data.water.find((w) => w.date === today)?.glasses ?? 0;
  const waterTarget = data.profile.waterTarget || 8;

  const quickAdd = (q: typeof QUICK_FOODS[number]) => {
    const time = nowHM();
    mutate((prev) => ({
      mealLogs: [...prev.mealLogs, {
        id: uid(), date: today, name: q.label,
        calories: q.kcal, protein: q.p, carbs: q.c, fats: q.f,
        time, mealType: categoryFromTime(time),
      }],
    }));
  };

  return (
    <Card icon={Apple} variant="nutrition" number="02" title="Nutrition" href="/nutrition">
      <div className="hud-label text-[10px] text-muted-foreground">Daily Calories</div>
      <div className="hud-label text-xl text-primary hud-glow my-1">
        {t.kcal.toLocaleString()} / {calTarget.toLocaleString()}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <RingProgress value={calPct} size={80} label={`${calPct}%`} sublabel={`🔥 ${streak}d`} />
        <div className="flex-1 space-y-1">
          {([
            ["Protein", t.p, pTarget, "g"],
            ["Carbs", t.c, data.profile.carbsTarget || null, "g"],
            ["Fats", t.f, data.profile.fatsTarget || null, "g"],
            ["Water", water, waterTarget, ""],
          ] as const).map(([k, v, tgt, u]) => (
            <div key={k} className="flex justify-between hud-label text-[10px]">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-primary">{v}{u}{tgt ? ` / ${tgt}${u}` : ""}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {QUICK_FOODS.map((q) => (
          <button
            key={q.key}
            onClick={(e) => { e.preventDefault(); quickAdd(q); }}
            className="text-[10px] hud-label px-2 py-1.5 rounded border text-left border-border text-foreground/80 hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
            title={`+${q.kcal} kcal · ${q.p}P ${q.c}C ${q.f}F`}
          >
            + {q.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

export function FitnessCard() {
  const { data, mutate } = useEvolutionData();
  const fit = fitnessSummary(data.fitness, data.profile.gymSessionsTarget);

  const logSession = () => {
    const today = todayDate();
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const label = labels[new Date().getDay()];
    mutate((prev) => {
      const existing = prev.fitness.find((r) => r.date === today);
      const next = existing
        ? prev.fitness.map((r) => r.date === today ? { ...r, workouts: r.workouts + 1 } : r)
        : [...prev.fitness, { date: today, workouts: 1, label }];
      return { fitness: next };
    });
  };

  return (
    <Card icon={Dumbbell} variant="fitness" number="03" title="Fitness" href="/fitness">
      <div className="hud-label text-[10px] text-muted-foreground">Weekly Sessions</div>
      <div className="hud-label text-xl text-primary hud-glow my-1">{fit.daysHit} / {fit.target}</div>
      <div className="mt-2">
        <BarChart data={fit.data.length ? fit.data : [1]} labels={fit.labels} height={50} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        {[["Bench", data.profile.bench], ["Squat", data.profile.squat], ["Dead", data.profile.deadlift]].map(([k, v]) => (
          <div key={k as string} className="border border-border rounded p-1.5">
            <div className="hud-label text-[9px] text-muted-foreground">{k}</div>
            <div className="hud-label text-xs text-primary">{v}</div>
          </div>
        ))}
      </div>
      <button onClick={logSession} className="mt-3 h-8 rounded-md border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10">
        + Log Session
      </button>
    </Card>
  );
}

export function JournalCard() {
  const { data, mutate } = useEvolutionData();
  const [text, setText] = useState("");
  const latest = data.journal.at(-1);

  const save = () => {
    const t = text.trim();
    if (!t) return;
    mutate((prev) => ({ journal: [...prev.journal, { date: todayDate(), text: t }] }));
    setText("");
  };

  return (
    <Card icon={FileText} variant="journal" number="04" title="Journal" href="/journal">
      <div className="hud-label text-[10px] text-muted-foreground">Latest Entry</div>
      <p className="text-xs italic text-foreground/90 mt-1 leading-relaxed line-clamp-3">
        "{latest?.text ?? "No entries yet."}"
      </p>
      <div className="hud-label text-[9px] text-muted-foreground mt-1">{latest?.date}</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Write…" rows={2}
                className="mt-3 w-full bg-transparent border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
      <Button onClick={save} size="sm" className="mt-2 hud-label text-[10px]">Save Entry</Button>
    </Card>
  );
}

export function NotesCard() {
  const { data, mutate } = useEvolutionData();
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    mutate((prev) => ({
      notes: [...prev.notes, { id: `n${Date.now()}`, text: t, done: false }],
    }));
    setText("");
  };
  const toggle = (id: string) =>
    mutate((prev) => ({
      notes: prev.notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
    }));
  const remove = (id: string) =>
    mutate((prev) => ({ notes: prev.notes.filter((n) => n.id !== id) }));

  return (
    <Card icon={NotebookPen} variant="notes" number="05" title="Notes" href="/notes">
      <ul className="space-y-1.5 flex-1 overflow-y-auto max-h-32">
        {data.notes.map((n) => (
          <li key={n.id} className="flex items-start gap-2 text-xs group">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(n.id); }}
              className={`mt-0.5 h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                n.done ? "bg-primary border-primary text-primary-foreground" : "border-primary/50 hover:border-primary"
              }`}
              aria-label={n.done ? "Mark as not done" : "Mark as done"}
            >
              {n.done && <span className="text-[8px] leading-none">✓</span>}
            </button>
            <span className={`flex-1 ${n.done ? "line-through text-muted-foreground" : "text-foreground/90"}`}>{n.text}</span>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-3">
        <Input value={text} onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && add()}
               placeholder="Capture…" className="h-8 text-xs" />
        <button onClick={add} className="h-8 w-8 rounded-md border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}

export function InvestingCard() {
  const { data, mutate } = useEvolutionData();
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

  return (
    <Card icon={TrendingUp} variant="investing" number="06" title="Investing" href="/investing">
      <div className="hud-label text-[10px] text-muted-foreground">Portfolio</div>
      <div className="hud-label text-2xl text-primary hud-glow my-1">{formatMoney(inv.current)}</div>
      <div className="hud-label text-[10px] text-primary">
        {inv.pct >= 0 ? "▲" : "▼"} {Math.abs(inv.pct).toFixed(2)}%
      </div>
      <div className="mt-2">
        <Sparkline data={inv.data.length ? inv.data : [1]} height={40} />
      </div>
      <div className="mt-2">
        <div className="flex justify-between hud-label text-[9px] text-muted-foreground">
          <span>Goal</span><span>{formatMoney(data.profile.goal)}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${goalPct}%`, boxShadow: "0 0 8px var(--primary)" }} />
        </div>
        <div className="hud-label text-[9px] text-primary text-right mt-1">{goalPct}%</div>
      </div>
      <div className="flex gap-2 mt-2">
        <Input value={pnl} onChange={(e) => setPnl(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && logPnL()}
               placeholder="P&L ±$" type="number" className="h-8 text-xs" />
        <button onClick={logPnL} className="h-8 px-3 rounded-md border border-primary/40 text-primary hud-label text-[10px] hover:bg-primary/10">Log</button>
      </div>
    </Card>
  );
}

export function BusinessCard() {
  return (
    <Card icon={Briefcase} variant="business" number="07" title="Business" href="/business">
      <div className="hud-label text-[10px] text-muted-foreground">Active Projects</div>
      <div className="hud-label text-3xl text-primary hud-glow my-1">7</div>
      <div className="flex items-center gap-4 mt-3">
        <RingProgress value={80} size={72} label="80%" sublabel="On Track" />
        <div>
          <div className="hud-label text-[10px] text-muted-foreground">Revenue</div>
          <div className="hud-label text-sm text-primary">$42.8K</div>
          <div className="hud-label text-[10px] text-muted-foreground mt-1">This Quarter</div>
        </div>
      </div>
    </Card>
  );
}

export function HobbyCard() {
  const { data, mutate } = useEvolutionData();
  const hobbies: Hobby[] = ["Cars", "Guitar", "Travel"];

  return (
    <Card icon={Star} variant="hobby" number="08" title="Hobby" href="/hobby">
      <img
        src={hobbyHologram}
        alt=""
        aria-hidden="true"
        className="hobby-holo-img absolute right-0 top-0 h-full w-auto"
        style={{
          opacity: 0.85,
          maskImage: "linear-gradient(to left, black 30%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to left, black 30%, transparent 95%)",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
      <div className="hud-label text-[10px] text-muted-foreground">Current Focus</div>
      <div className="hud-label text-xl text-primary hud-glow my-1">{data.hobby.current}</div>
      <div className="hud-label text-[10px] text-muted-foreground mt-2">Time Invested</div>
      <div className="hud-label text-lg text-foreground">{data.hobby.hours.toFixed(1)} hrs</div>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, data.hobby.hours * 5)}%`, boxShadow: "0 0 8px var(--primary)" }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {hobbies.map((h) => (
          <button key={h} onClick={() => mutate({ hobby: { ...data.hobby, current: h } })}
                  className={`hud-label text-[10px] py-1.5 rounded border ${data.hobby.current === h ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
            {h}
          </button>
        ))}
      </div>
      <button onClick={() => mutate({ hobby: { ...data.hobby, hours: data.hobby.hours + 0.5 } })}
              className="mt-2 h-7 text-[10px] hud-label text-primary border border-primary/40 rounded hover:bg-primary/10">
        + 30 min
      </button>
    </Card>
  );
}
