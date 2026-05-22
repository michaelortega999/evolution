interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export function Donut({ data, size = 180, thickness = 22, centerLabel, centerSub }: DonutProps) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} opacity={0.35} />
        {data.map((s, i) => {
          const len = (s.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ filter: `drop-shadow(0 0 4px ${s.color})`, transition: "stroke-dasharray 0.6s ease" }}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerLabel && <div className="hud-label text-primary hud-glow text-xl tabular-nums">{centerLabel}</div>}
        {centerSub && <div className="hud-label text-[9px] text-muted-foreground mt-0.5">{centerSub}</div>}
      </div>
    </div>
  );
}
