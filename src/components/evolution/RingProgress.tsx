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
      <svg width={size} height={size} className="-rotate-90 ring-orbit">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.5 0.2 240 / 0.25)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="oklch(0.78 0.22 240)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 6px oklch(0.78 0.22 240 / 0.7))",
            transition: "stroke-dasharray 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="hud-label text-primary hud-glow text-lg leading-none">{label ?? `${value}%`}</span>
        {sublabel && <span className="hud-label text-[9px] text-muted-foreground mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
