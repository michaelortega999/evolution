/**
 * Jarvis-style holographic projections for module cards.
 * Each variant builds layered SVG geometry: orbital rings, pulsing data
 * nodes, scanlines, blueprint grid, and a unique central figure.
 */

export type HoloVariant =
  | "wealth"
  | "nutrition"
  | "fitness"
  | "journal"
  | "notes"
  | "investing"
  | "business"
  | "hobby";

interface HoloIconProps {
  variant: HoloVariant;
}

export function HoloIcon({ variant }: HoloIconProps) {
  return (
    <div className="holo-jarvis" aria-hidden="true">
      {/* projector base */}
      <div className="holo-j-base" />
      <div className="holo-j-base holo-j-base--inner" />

      {/* blueprint grid background */}
      <svg className="holo-j-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="hgrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 H0 V10" fill="none" stroke="currentColor" strokeWidth="0.3" />
          </pattern>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#hgrid)" opacity="0.35" />
      </svg>

      {/* orbital rings */}
      <div className="holo-j-orbit holo-j-orbit--1">
        <span className="holo-j-node" style={{ top: "50%", left: "0%" }} />
        <span className="holo-j-node" style={{ top: "50%", left: "100%" }} />
      </div>
      <div className="holo-j-orbit holo-j-orbit--2">
        <span className="holo-j-node" style={{ top: "0%", left: "50%" }} />
      </div>
      <div className="holo-j-orbit holo-j-orbit--3">
        <span className="holo-j-node" style={{ top: "100%", left: "50%" }} />
      </div>

      {/* central rotating figure */}
      <div className="holo-j-spin">
        <HoloFigure variant={variant} />
      </div>

      {/* scanline sweep */}
      <div className="holo-j-scan" />
    </div>
  );
}

function HoloFigure({ variant }: { variant: HoloVariant }) {
  const common = {
    viewBox: "0 0 100 100",
    className: "holo-j-svg",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (variant) {
    case "wealth":
      // Vault / safe with circuit dollar lines
      return (
        <svg {...common}>
          <rect x="22" y="26" width="56" height="48" rx="3" />
          <rect x="28" y="32" width="44" height="36" rx="2" opacity="0.6" />
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="50" r="6" opacity="0.7" />
          <line x1="50" y1="36" x2="50" y2="42" />
          <line x1="50" y1="58" x2="50" y2="64" />
          <line x1="36" y1="50" x2="42" y2="50" />
          <line x1="58" y1="50" x2="64" y2="50" />
          <text x="50" y="54" textAnchor="middle" fontSize="10" fontFamily="monospace" stroke="none" fill="currentColor">$</text>
          {/* circuit traces */}
          <path d="M22 40 H16 V20 H40" opacity="0.5" />
          <path d="M78 60 H84 V80 H60" opacity="0.5" />
          <circle cx="16" cy="20" r="1.2" fill="currentColor" />
          <circle cx="84" cy="80" r="1.2" fill="currentColor" />
        </svg>
      );

    case "nutrition":
      // DNA double helix
      return (
        <svg {...common}>
          {Array.from({ length: 7 }).map((_, i) => {
            const y = 18 + i * 10;
            const phase = (i / 7) * Math.PI * 2;
            const x1 = 50 + Math.sin(phase) * 18;
            const x2 = 50 - Math.sin(phase) * 18;
            return (
              <g key={i}>
                <line x1={x1} y1={y} x2={x2} y2={y} opacity="0.6" />
                <circle cx={x1} cy={y} r="1.8" fill="currentColor" />
                <circle cx={x2} cy={y} r="1.8" fill="currentColor" />
              </g>
            );
          })}
          <path d="M32 18 Q50 35 68 50 Q50 65 32 82" />
          <path d="M68 18 Q50 35 32 50 Q50 65 68 82" opacity="0.7" />
        </svg>
      );

    case "fitness":
      // Bold side-view flexing bicep (matches reference logo)
      return (
        <svg {...common}>
          {/* main arm silhouette: shoulder → bicep peak → forearm → fist on top */}
          <path
            d="
              M 18 84
              Q 14 78 16 70
              Q 18 62 24 58
              Q 30 54 36 56
              Q 40 48 46 44
              Q 54 36 60 38
              Q 64 30 60 24
              Q 56 18 50 18
              Q 44 18 42 24
              Q 40 30 44 36
              Q 38 42 36 50
              Q 32 56 30 64
              Q 28 72 32 80
              Q 30 84 26 84
              Z
            "
            fill="currentColor"
            fillOpacity="0.18"
          />
          {/* outline pass for crisp edges */}
          <path
            d="
              M 18 84
              Q 14 78 16 70
              Q 18 62 24 58
              Q 30 54 36 56
              Q 40 48 46 44
              Q 54 36 60 38
              Q 64 30 60 24
              Q 56 18 50 18
              Q 44 18 42 24
              Q 40 30 44 36
            "
          />
          {/* bicep peak crease (top curve of the bulge) */}
          <path d="M30 60 Q42 40 60 38" opacity="0.85" />
          {/* inner forearm definition (between bicep and forearm) */}
          <path d="M44 36 Q40 48 42 58" opacity="0.7" />
          {/* fist top — knuckles */}
          <path d="M42 24 Q46 20 50 20 Q54 20 56 24" opacity="0.85" />
          <line x1="44" y1="22" x2="56" y2="22" opacity="0.5" />
          {/* thumb on front of fist */}
          <path d="M58 26 Q62 26 62 30" opacity="0.7" />
          {/* tricep shadow underneath */}
          <path d="M22 78 Q30 74 36 76" opacity="0.5" />
          {/* glowing bicep peak highlight */}
          <circle cx="44" cy="44" r="3" fill="currentColor" />
          <circle cx="44" cy="44" r="7" fill="currentColor" opacity="0.2" />
        </svg>
      );





    case "journal":
      // Open book with text lines
      return (
        <svg {...common}>
          <path d="M20 30 Q50 22 50 30 V78 Q50 70 20 78 Z" />
          <path d="M80 30 Q50 22 50 30 V78 Q50 70 80 78 Z" />
          <line x1="50" y1="30" x2="50" y2="78" opacity="0.7" />
          {/* text lines left */}
          <line x1="26" y1="40" x2="44" y2="38" opacity="0.7" />
          <line x1="26" y1="46" x2="44" y2="44" opacity="0.6" />
          <line x1="26" y1="52" x2="42" y2="50" opacity="0.5" />
          <line x1="26" y1="58" x2="44" y2="56" opacity="0.6" />
          <line x1="26" y1="64" x2="40" y2="62" opacity="0.4" />
          {/* text lines right */}
          <line x1="56" y1="38" x2="74" y2="40" opacity="0.7" />
          <line x1="56" y1="44" x2="74" y2="46" opacity="0.6" />
          <line x1="56" y1="50" x2="72" y2="52" opacity="0.5" />
          <line x1="56" y1="56" x2="74" y2="58" opacity="0.6" />
          <line x1="56" y1="62" x2="70" y2="64" opacity="0.4" />
        </svg>
      );

    case "notes":
      // Thought bubble with idea dots
      return (
        <svg {...common}>
          {/* main bubble */}
          <path d="M30 26 Q22 26 22 36 Q16 40 20 48 Q16 56 26 58 Q30 66 40 62 Q48 70 58 62 Q70 66 74 58 Q84 56 78 46 Q84 38 76 32 Q72 22 60 26 Q50 18 40 24 Q34 22 30 26 Z" />
          {/* trailing small bubbles */}
          <circle cx="34" cy="74" r="3.5" />
          <circle cx="26" cy="82" r="2.2" />
          <circle cx="20" cy="88" r="1.4" />
          {/* idea content lines */}
          <line x1="32" y1="40" x2="60" y2="40" opacity="0.6" />
          <line x1="32" y1="46" x2="68" y2="46" opacity="0.5" />
          <line x1="32" y1="52" x2="56" y2="52" opacity="0.4" />
          {/* glowing idea node */}
          <circle cx="50" cy="44" r="2.4" fill="currentColor" opacity="0.9" />
        </svg>
      );


    case "investing":
      // 3D candlestick chart
      return (
        <svg {...common}>
          {/* axes */}
          <line x1="20" y1="80" x2="80" y2="80" opacity="0.5" />
          <line x1="20" y1="20" x2="20" y2="80" opacity="0.5" />
          {/* candles */}
          <line x1="30" y1="40" x2="30" y2="68" />
          <rect x="27" y="48" width="6" height="14" />
          <line x1="44" y1="32" x2="44" y2="60" />
          <rect x="41" y="36" width="6" height="18" />
          <line x1="58" y1="44" x2="58" y2="72" />
          <rect x="55" y="50" width="6" height="16" opacity="0.6" />
          <line x1="72" y1="26" x2="72" y2="58" />
          <rect x="69" y="30" width="6" height="20" />
          {/* trend arrow */}
          <path d="M24 70 L40 56 L54 62 L76 32" opacity="0.7" strokeDasharray="2 2" />
          <path d="M70 32 L76 32 L76 38" />
        </svg>
      );

    case "business":
      // City skyline blueprint
      return (
        <svg {...common}>
          <line x1="14" y1="80" x2="86" y2="80" opacity="0.6" />
          <rect x="22" y="48" width="12" height="32" />
          <rect x="36" y="36" width="14" height="44" />
          <rect x="52" y="42" width="10" height="38" />
          <rect x="64" y="30" width="14" height="50" />
          {/* glowing windows */}
          {[
            [25, 54], [25, 60], [25, 66], [25, 72],
            [39, 42], [39, 48], [39, 54], [39, 60], [39, 66], [39, 72],
            [44, 42], [44, 48], [44, 54], [44, 60], [44, 66], [44, 72],
            [55, 48], [55, 54], [55, 60], [55, 66], [55, 72],
            [67, 36], [67, 42], [67, 48], [67, 54], [67, 60], [67, 66], [67, 72],
            [72, 36], [72, 42], [72, 48], [72, 54], [72, 60], [72, 66], [72, 72],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="2" height="2" fill="currentColor" opacity={0.5 + (i % 3) * 0.2} />
          ))}
          {/* construction marks */}
          <line x1="14" y1="80" x2="14" y2="76" opacity="0.4" />
          <line x1="86" y1="80" x2="86" y2="76" opacity="0.4" />
        </svg>
      );

    case "hobby":
      // Mountain range, vertically centered in the viewBox
      return (
        <svg {...common}>
          {/* sun/moon (upper area) */}
          <circle cx="72" cy="28" r="4" opacity="0.6" />
          <circle cx="72" cy="28" r="6" opacity="0.25" />
          {/* small stars */}
          <circle cx="20" cy="24" r="0.7" fill="currentColor" />
          <circle cx="84" cy="42" r="0.6" fill="currentColor" />
          <circle cx="34" cy="32" r="0.5" fill="currentColor" opacity="0.8" />
          {/* back ridge */}
          <path d="M10 66 L28 42 L40 54 L54 30 L70 48 L90 66 Z" opacity="0.45" />
          <path d="M10 66 L28 42 L40 54 L54 30 L70 48 L90 66" opacity="0.7" />
          {/* front ridge */}
          <path d="M14 70 L34 52 L46 62 L62 46 L82 66 L90 70 Z" opacity="0.6" />
          <path d="M14 70 L34 52 L46 62 L62 46 L82 66" opacity="0.9" />
          {/* snow caps */}
          <path d="M50 36 L54 30 L58 36" opacity="0.95" />
          <path d="M24 48 L28 42 L32 48" opacity="0.85" />
          <path d="M58 52 L62 46 L66 52" opacity="0.85" />
          {/* ground line */}
          <line x1="10" y1="70" x2="90" y2="70" opacity="0.5" />
        </svg>
      );
  }
}
