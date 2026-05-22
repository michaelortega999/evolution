interface GaugeProps {
  value: number; // 0..100
  size?: number;
  label?: string;
}

export function Gauge({ value, size = 180, label }: GaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = Math.PI * r; // half-circle length
  const dash = (v / 100) * c;
  const cx = size / 2;
  const cy = size / 2 + 10;

  return (
    <div className="relative inline-flex items-end justify-center" style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + 30}>
        <path
          d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          opacity={0.4}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: "drop-shadow(0 0 6px var(--primary))", transition: "stroke-dasharray 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className="hud-label text-primary hud-glow text-3xl tabular-nums leading-none">{Math.round(v)}<span className="text-xs text-muted-foreground">/100</span></div>
        {label && <div className="hud-label text-[10px] text-primary mt-1 tracking-widest">{label}</div>}
      </div>
    </div>
  );
}
