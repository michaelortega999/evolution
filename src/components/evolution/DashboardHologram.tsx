import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { useEvolutionData } from "@/lib/evolution-data";
import { HOLOGRAMS, type HologramKey } from "@/lib/holograms";
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
            background: "linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 60%, transparent))",
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

  // Lazy-load status from localStorage on mount (avoid SSR mismatch)
  useEffect(() => { setStatus(loadStatus()); }, []);

  const updateStatus = (patch: Partial<Status>) => {
    const next = { ...status, ...patch };
    setStatus(next);
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const hologram: HologramKey = (data.profile.hologram as HologramKey) ?? "bonsai";

  return (
    <section className="h-auto lg:h-[380px]">
      {/* CENTER — Hologram */}
      <div className="hud-card hud-scan relative overflow-hidden flex items-center justify-center group h-full">
        {/* Choose Image button — visible only on hover */}
        <button
          onClick={() => setPickerOpen(true)}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/40 bg-background/60 backdrop-blur text-primary hud-label text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/15"
          style={{ boxShadow: "0 0 12px var(--primary)" }}
          title="Choose your hologram"
        >
          <ImageIcon className="h-3 w-3" /> Choose Image
        </button>

        {/* Atmospheric backdrop glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--glow) 14%, transparent) 0%, transparent 65%)",
          }}
        />

        {/* Floating particles */}
        <div className="holo-particles absolute inset-0 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="holo-particle"
              style={{
                left: `${(i * 7 + 8) % 96}%`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                animationDuration: `${5 + (i % 5)}s`,
                animationDelay: `${(i * 0.4) % 6}s`,
              }}
            />
          ))}
        </div>

        {/* Holographic emblem stage */}
        <div className="holo-stage relative" style={{ width: 320, height: 320 }}>
          {/* Vertical projector beam */}
          <div className="holo-beam" />

          {/* Ground projector rings */}
          <div className="holo-base">
            <div className="holo-base-ring" />
            <div className="holo-base-ring holo-base-ring--inner" />
          </div>

          {/* Concentric orbital rings */}
          <div className="holo-orbit holo-orbit--1" />
          <div className="holo-orbit holo-orbit--2" />
          <div className="holo-orbit holo-orbit--3" />

          {/* Centerpiece */}
          <div className="absolute inset-0 flex items-center justify-center">
            <HologramEmblem kind={hologram} size={220} />
          </div>

          {/* Scanning sweep */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: "50%" }}
          >
            <div className="holo-scan-sweep" />
          </div>
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
