import { useEffect, useState } from "react";

const STATUS_KEY = "evolution:system-status:v1";
type Status = { focus: number; energy: number; discipline: number; execution: number };
const DEFAULT_STATUS: Status = { focus: 92, energy: 87, discipline: 94, execution: 91 };

function loadStatus(): Status {
  if (typeof window === "undefined") return DEFAULT_STATUS;
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    if (!raw) return DEFAULT_STATUS;
    return { ...DEFAULT_STATUS, ...JSON.parse(raw) };
  } catch { return DEFAULT_STATUS; }
}

function StatusBar({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = Math.max(0, Math.min(100, Math.round(Number(draft) || 0)));
    onChange(n);
    setEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center hud-label text-[10px]">
        <span className="text-muted-foreground tracking-[0.2em]">{label}</span>
        {editing ? (
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            className="w-12 bg-transparent border-b border-primary text-primary text-right text-xs outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-primary hover:text-primary/80 tabular-nums"
            title="Click to edit"
          >
            {value}%
          </button>
        )}
      </div>
      <div className="h-1.5 mt-1.5 rounded-full bg-primary/15 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background:
              "linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 60%, transparent))",
            boxShadow: "0 0 8px var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

export function SystemStatus() {
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  useEffect(() => { setStatus(loadStatus()); }, []);

  const updateStatus = (patch: Partial<Status>) => {
    const next = { ...status, ...patch };
    setStatus(next);
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  return (
    <div className="hud-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="hud-label text-[10px] text-primary tracking-[0.3em]">SYSTEM STATUS</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: "#22ff88", boxShadow: "0 0 8px #22ff88" }}
        />
        <span className="hud-label text-[11px] text-[#22ff88] tracking-[0.25em]">OPTIMAL</span>
      </div>
      <div className="flex flex-col gap-3 mt-1">
        <StatusBar label="FOCUS LEVEL"   value={status.focus}      onChange={(v) => updateStatus({ focus: v })} />
        <StatusBar label="MENTAL ENERGY" value={status.energy}     onChange={(v) => updateStatus({ energy: v })} />
        <StatusBar label="DISCIPLINE"    value={status.discipline} onChange={(v) => updateStatus({ discipline: v })} />
        <StatusBar label="EXECUTION"     value={status.execution}  onChange={(v) => updateStatus({ execution: v })} />
      </div>
    </div>
  );
}
