interface SparklineProps {
  data: number[];
  height?: number;
  labels?: string[];
  fill?: boolean;
}

export function Sparkline({ data, height = 70, labels, fill = true }: SparklineProps) {
  const width = 300;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4] as const);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {fill && <path d={area} fill="url(#sparkFill)" />}
        <path d={path} fill="none" stroke="oklch(0.78 0.13 85)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.2 85 / 0.6))" }} />
      </svg>
      {labels && (
        <div className="flex justify-between mt-1 text-[9px] hud-label text-muted-foreground">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}
