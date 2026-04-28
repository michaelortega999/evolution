interface BarChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export function BarChart({ data, labels, height = 70 }: BarChartProps) {
  const max = Math.max(...data);
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bar-anim"
            style={{
              height: `${(v / max) * 100}%`,
              background: "linear-gradient(180deg, oklch(0.88 0.28 145), oklch(0.55 0.25 145))",
              minHeight: 4,
              animationDelay: `${i * 90}ms, ${i * 90 + 900}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[9px] hud-label text-muted-foreground">
        {labels.map((l) => <span key={l} className="flex-1 text-center">{l}</span>)}
      </div>
    </div>
  );
}
