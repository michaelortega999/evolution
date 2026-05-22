interface SparklineProps {
  data: number[];
  height?: number;
  labels?: string[];
  fill?: boolean;
  color?: string;
}

export function Sparkline({ data, height = 70, labels, fill = true, color = "var(--primary)" }: SparklineProps) {
  const width = 300;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const safeLen = Math.max(1, data.length - 1);
  const step = width / safeLen;

  const points = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4] as const);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const gid = `sparkFill-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height, color }}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {fill && <path d={area} fill={`url(#${gid})`} />}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
        />
      </svg>
      {labels && (
        <div className="flex justify-between mt-1 text-[9px] hud-label text-muted-foreground">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}
