/**
 * Pure CSS/SVG holographic emblems for Earth, Brain, and Bonsai.
 * Used in onboarding and sidebar. All animations are CSS-driven.
 */
import type { HologramKey } from "@/lib/holograms";
import bonsaiImg from "@/assets/bonsai.png";

interface Props {
  kind: HologramKey;
  size?: number;
}

export function HologramEmblem({ kind, size = 192 }: Props) {
  return (
    <div
      className="holo-emblem"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {kind === "earth" && <EarthSvg />}
      {kind === "brain" && <BrainSvg />}
      {kind === "bonsai" && <BonsaiImg />}
    </div>
  );
}

function BonsaiImg() {
  return (
    <img
      src={bonsaiImg}
      alt=""
      className="holo-emblem-spin"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        filter:
          "drop-shadow(0 0 8px color-mix(in oklab, var(--glow) 80%, transparent)) drop-shadow(0 0 18px color-mix(in oklab, var(--glow) 55%, transparent))",
      }}
    />
  );
}

function EarthSvg() {
  // Wireframe globe: longitude/latitude lines + atmosphere + orbital rings
  return (
    <svg viewBox="0 0 200 200" className="holo-emblem-spin holo-svg">
      {/* atmosphere glow */}
      <defs>
        <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="var(--glow)" stopOpacity="0" />
          <stop offset="85%" stopColor="var(--glow)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#atmo)" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="1.2" />

      {/* latitude lines (ellipses) */}
      {[18, 36, 54, 70].map((r, i) => (
        <ellipse key={`lat-${i}`} cx="100" cy="100" rx="70" ry={r} fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.9" />
      ))}
      {/* equator brighter */}
      <line x1="30" y1="100" x2="170" y2="100" stroke="var(--glow)" strokeOpacity="0.85" strokeWidth="1.2" />

      {/* longitude lines (vertical ellipses) */}
      {[10, 28, 46, 60, 70].map((r, i) => (
        <ellipse key={`lon-${i}`} cx="100" cy="100" rx={r} ry="70" fill="none" stroke="var(--glow)" strokeOpacity="0.5" strokeWidth="0.9" />
      ))}

      {/* continent dots (decorative) */}
      {[
        [82, 70], [110, 78], [120, 96], [90, 112], [70, 92], [130, 120], [98, 134], [108, 60],
      ].map(([cx, cy], i) => (
        <circle key={`dot-${i}`} cx={cx} cy={cy} r="2.2" fill="var(--glow)" opacity="0.85" />
      ))}
    </svg>
  );
}

function BrainSvg() {
  // Highly detailed wireframe brain: layered gyri/sulci, hemispheres, cerebellum, brainstem,
  // dense synapse network with animated pulses, neural connection lines.
  return (
    <div className="holo-svg-stack">
      <svg viewBox="0 0 200 200" className="holo-emblem-spin holo-svg">
        <defs>
          <radialGradient id="brain-glow" cx="50%" cy="50%" r="55%">
            <stop offset="50%" stopColor="var(--glow)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo */}
        <circle cx="100" cy="100" r="92" fill="url(#brain-glow)" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--glow)" strokeOpacity="0.25" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="var(--glow)" strokeOpacity="0.18" strokeWidth="0.5" strokeDasharray="2 4" />

        {/* outer cortex outline (left hemisphere) */}
        <path
          d="M100 42 C72 42 50 64 46 92 C42 118 56 144 84 154 C92 158 100 158 100 150 Z"
          fill="none" stroke="var(--glow)" strokeWidth="1.5" strokeOpacity="0.95"
        />
        {/* outer cortex outline (right hemisphere) */}
        <path
          d="M100 42 C128 42 150 64 154 92 C158 118 144 144 116 154 C108 158 100 158 100 150 Z"
          fill="none" stroke="var(--glow)" strokeWidth="1.5" strokeOpacity="0.95"
        />
        {/* central fissure */}
        <line x1="100" y1="42" x2="100" y2="158" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.7" />

        {/* LEFT HEMISPHERE — layered gyri/sulci */}
        <path d="M58 80 Q70 86 60 98 Q72 104 62 118 Q74 124 64 138" fill="none" stroke="var(--glow)" strokeOpacity="0.7" strokeWidth="1" />
        <path d="M70 66 Q80 74 72 88 Q82 94 74 108 Q84 114 76 128" fill="none" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d="M84 54 Q92 62 86 76 Q94 82 88 96 Q96 102 90 116" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M52 100 Q60 104 54 114" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M62 70 Q72 68 78 60" fill="none" stroke="var(--glow)" strokeOpacity="0.5" strokeWidth="0.7" />
        <path d="M68 142 Q78 146 86 142" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />

        {/* RIGHT HEMISPHERE — mirrored */}
        <path d="M142 80 Q130 86 140 98 Q128 104 138 118 Q126 124 136 138" fill="none" stroke="var(--glow)" strokeOpacity="0.7" strokeWidth="1" />
        <path d="M130 66 Q120 74 128 88 Q118 94 126 108 Q116 114 124 128" fill="none" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d="M116 54 Q108 62 114 76 Q106 82 112 96 Q104 102 110 116" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M148 100 Q140 104 146 114" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M138 70 Q128 68 122 60" fill="none" stroke="var(--glow)" strokeOpacity="0.5" strokeWidth="0.7" />
        <path d="M132 142 Q122 146 114 142" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />

        {/* Cerebellum (lower back) */}
        <path d="M76 150 Q88 162 100 160 Q112 162 124 150" fill="none" stroke="var(--glow)" strokeOpacity="0.85" strokeWidth="1.1" />
        <path d="M80 154 Q90 160 100 158 Q110 160 120 154" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.7" />
        <path d="M84 158 Q92 162 100 161 Q108 162 116 158" fill="none" stroke="var(--glow)" strokeOpacity="0.4" strokeWidth="0.6" />

        {/* Brain stem */}
        <path d="M94 160 L94 178 Q100 184 106 178 L106 160" fill="none" stroke="var(--glow)" strokeOpacity="0.85" strokeWidth="1.2" />
        <line x1="100" y1="162" x2="100" y2="180" stroke="var(--glow)" strokeOpacity="0.5" strokeWidth="0.6" />

        {/* Neural connection lines (synapse network) */}
        {[
          ["68,92","100,76"], ["100,76","132,92"], ["68,92","82,118"],
          ["132,92","118,118"], ["82,118","100,130"], ["100,130","118,118"],
          ["82,118","118,118"], ["100,76","100,130"], ["72,108","128,108"],
        ].map(([p1, p2], i) => {
          const [x1, y1] = p1.split(",").map(Number);
          const [x2, y2] = p2.split(",").map(Number);
          return (
            <line key={`con-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--glow)" strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="1.5 2.5" />
          );
        })}

        {/* Synapse nodes with pulse */}
        {[
          [68, 92], [82, 118], [100, 76], [100, 130], [118, 118], [132, 92],
          [72, 108], [128, 108], [90, 100], [110, 100], [100, 105], [86, 138], [114, 138],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.6" fill="var(--glow)" />
            <circle cx={cx} cy={cy} r="3" fill="none" stroke="var(--glow)" strokeWidth="0.5" opacity="0.6">
              <animate attributeName="r" values="2;7;2" dur={`${1.4 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0;0.85" dur={`${1.4 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
      {/* scan sweep overlay */}
      <div className="holo-scan-sweep" />
    </div>
  );
}
