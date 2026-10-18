import { Link } from "@tanstack/react-router";
import { Sparkline } from "./Sparkline";
import { Donut } from "./Donut";
import { BarChart } from "./BarChart";

/**
 * Marketing System overview dashboard.
 * All figures below are DEMO SAMPLE data (no real ad-platform, CRM, or sales
 * integrations exist). Every panel is labeled so the numbers are never
 * mistaken for live metrics.
 */

const ACCENTS = {
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  yellow: "#eab308",
  red: "#ef4444",
};

const TRAFFIC_SOURCES = [
  { name: "Meta Ads", value: 24532, pct: 18, color: ACCENTS.cyan },
  { name: "Instagram", value: 18421, pct: 24, color: ACCENTS.pink },
  { name: "TikTok", value: 31208, pct: 37, color: ACCENTS.purple },
  { name: "Facebook", value: 12953, pct: 12, color: ACCENTS.blue },
  { name: "YouTube", value: 8714, pct: 29, color: ACCENTS.red },
  { name: "Store / Direct", value: 6302, pct: 41, color: ACCENTS.green },
];

const AI_AGENTS = ["ChatGPT", "Claude", "Grok", "Custom Agents"];

const AI_ACTIVITY = [
  { label: "Content", value: 124, color: ACCENTS.cyan },
  { label: "Research", value: 68, color: ACCENTS.purple },
  { label: "Outreach", value: 52, color: ACCENTS.green },
  { label: "Data Analysis", value: 46, color: ACCENTS.orange },
  { label: "Other", value: 36, color: ACCENTS.blue },
];

const KEY_METRICS = [
  { label: "Leads", value: "2,856", pct: 34, color: ACCENTS.cyan },
  { label: "Sales", value: "$38,755", pct: 41, color: ACCENTS.green },
  { label: "Conversion Rate", value: "3.7%", pct: 0.8, color: ACCENTS.purple },
  { label: "ROAS", value: "4.2x", pct: 26, color: ACCENTS.blue },
];

const SYSTEM_STATUS = [
  { label: "APIs Connected", value: "8/8" },
  { label: "Automations Active", value: "12/12" },
  { label: "Data Sync Live", value: "Real-time" },
  { label: "AI Agents Online", value: "4/4" },
];

const WORKFLOW = [
  { n: "01", title: "Research", items: ["Competitor Research", "Market Trends", "Audience Insights"], tasks: 42, color: ACCENTS.purple },
  { n: "02", title: "Ads", items: ["Create Campaigns", "Optimize Bids", "Scale Winners"], tasks: 35, color: ACCENTS.cyan },
  { n: "03", title: "Content", items: ["Generate Ideas", "Create Content", "Edit with AI"], tasks: 68, color: ACCENTS.pink },
  { n: "04", title: "Posting", items: ["Auto Schedule", "Cross Post", "Engage Audience"], tasks: 52, color: ACCENTS.purple },
  { n: "05", title: "Leads", items: ["Capture Leads", "Qualify with AI", "Add to CRM"], tasks: 49, color: ACCENTS.green },
  { n: "06", title: "Sales", items: ["Track Orders", "Analyze Revenue", "Send Invoices"], tasks: 38, color: ACCENTS.orange },
  { n: "07", title: "Follow-Ups", items: ["AI Email/SMS", "Nurture Sequences", "Convert Leads"], tasks: 44, color: ACCENTS.blue },
  { n: "08", title: "Booking", items: ["Schedule Calls", "Set Appointments", "Sync Calendar"], tasks: 27, color: ACCENTS.cyan },
];

const CAMPAIGNS = [
  { name: "Meta - ASC", spend: 2430, leads: 684, sales: 9842, roas: "4.1x", color: ACCENTS.cyan },
  { name: "IG - Reels", spend: 1280, leads: 412, sales: 5601, roas: "4.4x", color: ACCENTS.pink },
  { name: "TikTok - Broad", spend: 1950, leads: 892, sales: 13420, roas: "6.9x", color: ACCENTS.purple },
  { name: "Facebook - LAL", spend: 890, leads: 306, sales: 4125, roas: "4.6x", color: ACCENTS.blue },
  { name: "YouTube - Video", spend: 620, leads: 201, sales: 2987, roas: "4.8x", color: ACCENTS.red },
];

const AUDIENCE = [
  { label: "18–24", value: 28, color: ACCENTS.cyan },
  { label: "25–34", value: 42, color: ACCENTS.purple },
  { label: "35–44", value: 20, color: ACCENTS.green },
  { label: "45–54", value: 8, color: ACCENTS.orange },
  { label: "55+", value: 2, color: ACCENTS.blue },
];

// Deterministic demo series
const series = (seed: number, len = 24, base = 100) =>
  Array.from({ length: len }, (_, i) => base + Math.round(60 * Math.sin((i + seed) / 2.4) + 40 * Math.cos((i + seed) / 5) + i * 2));

function DemoBadge() {
  return (
    <span className="hud-label text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/50 text-yellow-400 tracking-widest">
      DEMO
    </span>
  );
}

function Panel({ title, accent, className = "", children }: { title: string; accent?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`hud-card hud-scan p-4 flex flex-col min-w-0 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="hud-label text-[10px] tracking-[.25em]" style={{ color: accent ?? "var(--primary)", textShadow: `0 0 10px ${accent ?? "var(--primary)"}66` }}>
          {title}
        </h3>
        <DemoBadge />
      </div>
      {children}
    </section>
  );
}

export function MediaSystemDashboard() {
  const totalTraffic = TRAFFIC_SOURCES.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="hud-label text-[9px] tracking-[.3em] text-cyan-300/70">Evolution / Media System</div>
          <h2 className="hud-label text-xl text-cyan-100">Automated Marketing System</h2>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <span className="hud-label text-[9px] text-muted-foreground">Oct 1 – Oct 31, 2026</span>
          <Link to="/business" search={{ section: "social-media" }} className="hud-label text-[10px] text-primary hover:underline">
            Media Planner →
          </Link>
        </div>
      </div>

      {/* Traffic sources */}
      <Panel title="Traffic Sources" accent={ACCENTS.cyan}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TRAFFIC_SOURCES.map((s, i) => (
            <div key={s.name} className="evo-surface border border-border rounded p-2.5 min-w-0">
              <div className="hud-label text-[9px] text-muted-foreground truncate">{s.name}</div>
              <div className="hud-label text-base tabular-nums" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
              <div className="hud-label text-[9px] text-green-400">▲ {s.pct}%</div>
              <div className="mt-1"><Sparkline data={series(i)} height={28} color={s.color} /></div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between evo-surface border border-border rounded p-2.5">
          <span className="hud-label text-[10px] text-muted-foreground">Total Traffic</span>
          <span className="hud-label text-lg text-primary hud-glow tabular-nums">{totalTraffic.toLocaleString()} <span className="text-[10px] text-green-400">▲ 26%</span></span>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Agents */}
        <Panel title="AI Agents" accent={ACCENTS.green}>
          <ul className="space-y-2">
            {AI_AGENTS.map((a) => (
              <li key={a} className="flex items-center justify-between evo-surface border border-border rounded px-3 py-2">
                <span className="text-xs text-foreground/90">{a}</span>
                <span className="h-2 w-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #22c55e" }} />
              </li>
            ))}
          </ul>
        </Panel>

        {/* AI Activity */}
        <Panel title="AI Activity" accent={ACCENTS.purple}>
          <div className="flex items-center gap-4">
            <Donut data={AI_ACTIVITY} size={130} thickness={16} centerLabel="326" centerSub="Tasks Run" />
            <ul className="space-y-1.5 flex-1">
              {AI_ACTIVITY.map((a) => (
                <li key={a.label} className="flex items-center justify-between hud-label text-[10px]">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                    {a.label}
                  </span>
                  <span className="text-primary tabular-nums">{a.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* System status */}
        <Panel title="System Status" accent={ACCENTS.green}>
          <ul className="space-y-2">
            {SYSTEM_STATUS.map((s) => (
              <li key={s.label} className="flex items-center justify-between hud-label text-[10px] border-b border-border/40 pb-2 last:border-0">
                <span className="flex items-center gap-2 text-foreground/80">
                  <span className="text-green-400">✓</span> {s.label}
                </span>
                <span className="text-green-400 tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Key metrics */}
      <Panel title="Key Metrics" accent={ACCENTS.blue}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KEY_METRICS.map((m, i) => (
            <div key={m.label} className="evo-surface border border-border rounded p-3">
              <div className="hud-label text-[9px] text-muted-foreground">{m.label}</div>
              <div className="hud-label text-xl tabular-nums" style={{ color: m.color }}>{m.value}</div>
              <div className="hud-label text-[9px] text-green-400">▲ {m.pct}%</div>
              <div className="mt-1"><Sparkline data={series(i + 7)} height={30} color={m.color} /></div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Automated workflow */}
      <Panel title="Automated Workflow" accent={ACCENTS.cyan}>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          {WORKFLOW.map((w) => (
            <div key={w.n} className="evo-surface border border-border rounded p-2.5 flex flex-col min-w-0">
              <div className="hud-label text-[9px] text-muted-foreground">{w.n}</div>
              <div className="hud-label text-[10px] mt-0.5" style={{ color: w.color, textShadow: `0 0 8px ${w.color}66` }}>{w.title}</div>
              <ul className="mt-1.5 space-y-0.5 text-[9px] text-foreground/70 leading-snug">
                {w.items.map((it) => <li key={it}>— {it}</li>)}
              </ul>
              <div className="mt-auto pt-2">
                <div className="hud-label text-[8px] text-muted-foreground">{w.tasks} tasks</div>
                <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, w.tasks)}%`, background: w.color, boxShadow: `0 0 6px ${w.color}` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue analytics */}
        <Panel title="Revenue Analytics" accent={ACCENTS.green}>
          <div className="hud-label text-xl text-green-400 tabular-nums">$38,755 <span className="text-[10px]">▲ 41%</span></div>
          <div className="mt-2">
            <BarChart data={series(3, 14, 2000)} labels={["Oct 1", "Oct 7", "Oct 14", "Oct 21", "Oct 28"].slice(0, 5)} height={110} />
          </div>
        </Panel>

        {/* Lead analytics */}
        <Panel title="Lead Analytics" accent={ACCENTS.purple}>
          <div className="hud-label text-xl text-purple-400 tabular-nums">2,856 <span className="text-[10px]">▲ 34%</span></div>
          <div className="mt-2 space-y-1">
            {TRAFFIC_SOURCES.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 hud-label text-[9px]">
                <span className="w-16 truncate text-foreground/70">{s.name}</span>
                <div className="flex-1"><Sparkline data={series(i + 12, 20, 80)} height={20} fill={false} color={s.color} /></div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Campaign performance */}
        <Panel title="Campaign Performance" accent={ACCENTS.orange}>
          <div className="overflow-x-auto">
            <table className="w-full hud-label text-[10px]">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="pb-2 font-normal">Campaign</th>
                  <th className="pb-2 font-normal text-right">Spend</th>
                  <th className="pb-2 font-normal text-right">Leads</th>
                  <th className="pb-2 font-normal text-right">Sales</th>
                  <th className="pb-2 font-normal text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c) => (
                  <tr key={c.name} className="border-t border-border/40">
                    <td className="py-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="text-foreground/90">{c.name}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground/80">${c.spend.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums text-foreground/80">{c.leads}</td>
                    <td className="py-2 text-right tabular-nums text-foreground/80">${c.sales.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums text-green-400">{c.roas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Audience */}
        <Panel title="Audience & Demographics" accent={ACCENTS.pink}>
          <div className="flex items-center gap-6">
            <Donut data={AUDIENCE} size={150} thickness={20} centerLabel="2,856" centerSub="Leads" />
            <ul className="space-y-1.5">
              {AUDIENCE.map((a) => (
                <li key={a.label} className="flex items-center gap-2 hud-label text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                  <span className="text-foreground/80 w-10">{a.label}</span>
                  <span className="text-primary tabular-nums">{a.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}
