import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { useEvolutionData } from "@/lib/evolution-data";
import { type HologramKey } from "@/lib/holograms";
import { HologramEmblem } from "./HologramEmblem";
import { HologramPicker } from "./HologramPicker";
import { Sparkline } from "./Sparkline";

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

export function DashboardHologram() {
  const { data, updateProfile } = useEvolutionData();
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => { setStatus(loadStatus()); }, []);

  const updateStatus = (patch: Partial<Status>) => {
    const next = { ...status, ...patch };
    setStatus(next);
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const hologram: HologramKey = (data.profile.hologram as HologramKey) ?? "bonsai";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 h-auto lg:h-[280px] lg:items-stretch">
      {/* LEFT — Core Mindset */}
      <div className="hud-card p-5 flex flex-col gap-4">
        <span className="hud-label text-[10px] text-primary tracking-[0.3em]">CORE MINDSET</span>
        <p className="italic text-foreground/90 text-sm leading-relaxed">
          “You are the sum of your decisions. Today, you stop drifting. Today, you evolve.”
        </p>
        <div className="hud-label text-[10px] text-muted-foreground tracking-[0.3em]">
          DISCIPLINE · FOCUS · FREEDOM
        </div>
        <div className="mt-auto">
          <Sparkline data={[12, 18, 15, 22, 28, 24, 31, 29, 36, 34, 42, 48]} height={56} />
        </div>
      </div>

      {/* CENTER — Hologram */}
      <div className="hud-card hud-scan relative overflow-hidden flex items-center justify-center group h-full">
        <button
          onClick={() => setPickerOpen(true)}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/40 bg-background/60 backdrop-blur text-primary hud-label text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/15"
          style={{ boxShadow: "0 0 12px var(--primary)" }}
          title="Choose your hologram"
        >
          <ImageIcon className="h-3 w-3" /> Choose Image
        </button>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--glow) 14%, transparent) 0%, transparent 65%)",
          }}
        />

        <HologramEmblem kind={hologram} size={250} />
      </div>

      {/* RIGHT — System Status */}
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

      <HologramPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={hologram}
        onSelect={(key) => updateProfile({ hologram: key })}
      />
    </section>
  );
}
