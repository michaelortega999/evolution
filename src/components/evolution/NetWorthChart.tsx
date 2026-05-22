import { useId, useMemo, useState } from "react";

interface NetWorthChartProps {
  data: number[];
  height?: number;
  labels?: string[];
}

const RANGES = [
  { key: "1M", months: 1 },
  { key: "3M", months: 3 },
  { key: "6M", months: 6 },
  { key: "1Y", months: 12 },
  { key: "ALL", months: 0 },
] as const;

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function fmtCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function NetWorthChart({ data, height = 280, labels }: NetWorthChartProps) {
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("1Y");
  const [hover, setHover] = useState<number | null>(null);

  const { series, seriesLabels } = useMemo(() => {
    const r = RANGES.find((x) => x.key === range)!;
    if (!r.months || data.length <= r.months) {
      return { series: data, seriesLabels: labels };
    }
    const sliceN = Math.max(2, r.months);
    return {
      series: data.slice(-sliceN),
      seriesLabels: labels ? labels.slice(-sliceN) : undefined,
    };
  }, [data, range, labels]);


  const width = 800;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const max = Math.max(...series);
  const min = Math.min(...series);
  const range01 = max - min || Math.max(1, max * 0.1);
  const yMax = max + range01 * 0.1;
  const yMin = Math.max(0, min - range01 * 0.1);
  const yRange = yMax - yMin || 1;

  const step = innerW / Math.max(1, series.length - 1);
  const points = series.map((v, i) => {
    const x = padL + i * step;
    const y = padT + innerH - ((v - yMin) / yRange) * innerH;
    return { x, y, v };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${padT + innerH} L${points[0].x},${padT + innerH} Z`;

  // Y-axis ticks
  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => yMin + (yRange * i) / (ticks - 1));

  // X-axis month labels
  const monthLabels = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const count = series.length;
    const stepIdx = Math.max(1, Math.ceil(count / 12));
    const now = new Date();
    for (let i = 0; i < count; i += stepIdx) {
      let label: string;
      if (seriesLabels && seriesLabels[i]) {
        const [y, m] = seriesLabels[i].split("-").map(Number);
        label = MONTH_LABELS[Math.max(0, Math.min(11, (m || 1) - 1))];
      } else {
        const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
        label = MONTH_LABELS[d.getMonth()];
      }
      out.push({ x: padL + i * step, label });
    }
    return out;
  }, [series, step, seriesLabels, padL]);


  const last = points[points.length - 1];
  const first = points[0];
  const delta = last.v - first.v;
  const deltaPct = first.v !== 0 ? (delta / Math.abs(first.v)) * 100 : 0;
  const positive = delta >= 0;

  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div className="relative w-full">
      {/* Header summary + range tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <div className="hud-label text-[10px] text-muted-foreground tracking-widest">CURRENT VALUE</div>
          <div className="flex items-baseline gap-3">
            <span className="hud-label text-3xl text-primary hud-glow tabular-nums">{fmtCompact(last.v)}</span>
            <span className={`hud-label text-xs tabular-nums ${positive ? "text-primary" : "text-destructive"}`}>
              {positive ? "▲" : "▼"} {fmtCompact(Math.abs(delta))} ({deltaPct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-md border border-border bg-card/60">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`hud-label text-[10px] px-2.5 py-1 rounded transition-colors ${
                range === r.key
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * width;
            const rel = Math.max(0, Math.min(innerW, x - padL));
            const idx = Math.round(rel / step);
            setHover(Math.max(0, Math.min(series.length - 1, idx)));
          }}
        >
          <defs>
            <linearGradient id={`fill-${gid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`line-${gid}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
            <radialGradient id={`pulse-${gid}`}>
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="60%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <filter id={`glow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid + Y labels */}
          <g style={{ color: "var(--primary)" }}>
            {yTicks.map((t, i) => {
              const y = padT + innerH - ((t - yMin) / yRange) * innerH;
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    x2={width - padR}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeDasharray="2 4"
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="hud-label"
                    fontSize="9"
                    fill="var(--muted-foreground)"
                  >
                    {fmtCompact(t)}
                  </text>
                </g>
              );
            })}
            {/* baseline */}
            <line
              x1={padL}
              x2={width - padR}
              y1={padT + innerH}
              y2={padT + innerH}
              stroke="currentColor"
              strokeOpacity={0.25}
            />
          </g>

          {/* X-axis month labels */}
          <g>
            {monthLabels.map((m, i) => (
              <text
                key={i}
                x={m.x}
                y={height - 10}
                textAnchor="middle"
                className="hud-label"
                fontSize="9"
                fill="var(--muted-foreground)"
              >
                {m.label}
              </text>
            ))}
          </g>

          {/* Area + line in primary color */}
          <g style={{ color: "var(--primary)" }}>
            <path d={area} fill={`url(#fill-${gid})`} />
            <path
              d={line}
              fill="none"
              stroke={`url(#line-${gid})`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${gid})`}
            />

            {/* Last-point pulse */}
            <circle cx={last.x} cy={last.y} r="14" fill={`url(#pulse-${gid})`}>
              <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={last.x} cy={last.y} r="4" fill="currentColor" style={{ filter: "drop-shadow(0 0 6px currentColor)" }} />

            {/* Hover guide */}
            {hoverPoint && (
              <>
                <line
                  x1={hoverPoint.x}
                  x2={hoverPoint.x}
                  y1={padT}
                  y2={padT + innerH}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeDasharray="2 3"
                />
                <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
              </>
            )}
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoverPoint && (
          <div
            className="absolute pointer-events-none hud-card px-2.5 py-1.5 border border-primary/40"
            style={{
              left: `${(hoverPoint.x / width) * 100}%`,
              top: `${(hoverPoint.y / height) * 100}%`,
              transform: "translate(-50%, calc(-100% - 12px))",
              boxShadow: "0 0 12px color-mix(in oklab, var(--primary) 50%, transparent)",
            }}
          >
            <div className="hud-label text-[9px] text-muted-foreground tracking-widest">VALUE</div>
            <div className="hud-label text-sm text-primary hud-glow tabular-nums whitespace-nowrap">{fmtCompact(hoverPoint.v)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
