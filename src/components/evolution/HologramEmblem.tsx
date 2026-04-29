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
  // Wireframe brain: two hemispheres + nodes + scanning sweep + pulses on synapses
  return (
    <div className="holo-svg-stack">
      <svg viewBox="0 0 200 200" className="holo-emblem-spin holo-svg">
        {/* outer ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--glow)" strokeOpacity="0.3" strokeWidth="0.8" />

        {/* left hemisphere */}
        <path
          d="M100 50 C70 50 50 75 50 105 C50 130 65 150 90 155 C95 158 100 158 100 150 Z"
          fill="none"
          stroke="var(--glow)"
          strokeWidth="1.4"
          strokeOpacity="0.9"
        />
        {/* right hemisphere */}
        <path
          d="M100 50 C130 50 150 75 150 105 C150 130 135 150 110 155 C105 158 100 158 100 150 Z"
          fill="none"
          stroke="var(--glow)"
          strokeWidth="1.4"
          strokeOpacity="0.9"
        />
        {/* central fissure */}
        <line x1="100" y1="50" x2="100" y2="158" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="0.8" />

        {/* gyri folds left */}
        <path d="M62 78 Q72 84 64 96 Q74 102 66 116 Q76 122 68 134" fill="none" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d="M78 64 Q86 72 80 84 Q88 90 82 102 Q90 108 84 120" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />
        {/* gyri folds right */}
        <path d="M138 78 Q128 84 136 96 Q126 102 134 116 Q124 122 132 134" fill="none" stroke="var(--glow)" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d="M122 64 Q114 72 120 84 Q112 90 118 102 Q110 108 116 120" fill="none" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="0.8" />

        {/* brain stem */}
        <path d="M94 156 L94 172 Q100 178 106 172 L106 156" fill="none" stroke="var(--glow)" strokeOpacity="0.8" strokeWidth="1.2" />

        {/* synapse nodes with pulse */}
        {[
          [70, 90], [82, 110], [120, 88], [128, 116], [100, 75], [92, 130], [110, 140],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="var(--glow)" />
            <circle cx={cx} cy={cy} r="4" fill="none" stroke="var(--glow)" strokeWidth="0.6" opacity="0.6">
              <animate attributeName="r" values="2;7;2" dur={`${1.4 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur={`${1.4 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
      {/* scan sweep overlay */}
      <div className="holo-scan-sweep" />
    </div>
  );
}
