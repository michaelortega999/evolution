interface RingProgressProps {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function RingProgress({ value, size = 90, label, sublabel }: RingProgressProps) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.4 0.1 142 / 0.25)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="oklch(0.85 0.2 142)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px oklch(0.85 0.2 142 / 0.7))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="hud-label text-primary hud-glow text-lg leading-none">{label ?? `${value}%`}</span>
        {sublabel && <span className="hud-label text-[9px] text-muted-foreground mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
