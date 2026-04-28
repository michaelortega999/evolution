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
      // Big bold dollar sign with holo glow
      return (
        <svg {...common}>
          {/* outer glow ring */}
          <circle cx="50" cy="50" r="32" opacity="0.25" />
          <circle cx="50" cy="50" r="26" opacity="0.4" />

          {/* vertical bar through the S */}
          <line x1="50" y1="18" x2="50" y2="82" strokeWidth={2.5} />

          {/* the S curve of the dollar sign */}
          <path
            d="M 64 32 Q 58 24 48 24 Q 36 24 36 34 Q 36 42 48 46 Q 64 50 64 60 Q 64 72 50 72 Q 38 72 32 64"
            strokeWidth={3}
            fill="none"
          />

          {/* subtle inner fill highlight */}
          <path
            d="M 64 32 Q 58 24 48 24 Q 36 24 36 34 Q 36 42 48 46 Q 64 50 64 60 Q 64 72 50 72 Q 38 72 32 64"
            strokeWidth={1}
            opacity="0.5"
          />

          {/* glowing center node */}
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
          <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.2" />

          {/* circuit traces */}
          <path d="M18 30 H10 V14 H30" opacity="0.5" />
          <path d="M82 70 H90 V86 H70" opacity="0.5" />
          <circle cx="10" cy="14" r="1.2" fill="currentColor" />
          <circle cx="90" cy="86" r="1.2" fill="currentColor" />
        </svg>
      );

    case "nutrition":
      // Apple with leaf and stem
      return (
        <svg {...common}>
          {/* outer glow ring */}
          <circle cx="50" cy="56" r="32" opacity="0.2" />

          {/* apple body — two lobes meeting at top dimple */}
          <path
            d="M 50 30
               C 38 26 24 32 24 50
               C 24 68 36 82 50 82
               C 64 82 76 68 76 50
               C 76 32 62 26 50 30 Z"
            strokeWidth={1.5}
            fill="currentColor"
            fillOpacity="0.15"
          />
          {/* top dimple where stem meets */}
          <path d="M 42 32 Q 50 28 58 32" opacity="0.8" />

          {/* stem */}
          <path d="M 50 30 Q 52 22 56 18" strokeWidth={2} />

          {/* leaf */}
          <path
            d="M 56 22 Q 66 18 70 26 Q 64 30 56 26 Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path d="M 58 24 Q 64 25 68 26" opacity="0.6" />

          {/* highlight shine on apple */}
          <path d="M 34 44 Q 32 52 36 60" opacity="0.6" />

          {/* glowing core node */}
          <circle cx="50" cy="56" r="2.5" fill="currentColor" />
          <circle cx="50" cy="56" r="6" fill="currentColor" opacity="0.2" />
        </svg>
      );

    case "fitness":
      // Dumbbell: center bar with two weight stacks on each end
      return (
        <svg {...common}>
          {/* center bar */}
          <line x1="32" y1="50" x2="68" y2="50" strokeWidth={3} />
          <line x1="32" y1="50" x2="68" y2="50" strokeWidth={1} opacity="0.6" />

          {/* left inner plate */}
          <rect x="24" y="38" width="8" height="24" rx="1.5" fill="currentColor" fillOpacity="0.18" />
          {/* left outer plate (larger) */}
          <rect x="14" y="30" width="10" height="40" rx="2" fill="currentColor" fillOpacity="0.22" />
          {/* left end cap */}
          <line x1="12" y1="36" x2="12" y2="64" strokeWidth={2} />

          {/* right inner plate */}
          <rect x="68" y="38" width="8" height="24" rx="1.5" fill="currentColor" fillOpacity="0.18" />
          {/* right outer plate (larger) */}
          <rect x="76" y="30" width="10" height="40" rx="2" fill="currentColor" fillOpacity="0.22" />
          {/* right end cap */}
          <line x1="88" y1="36" x2="88" y2="64" strokeWidth={2} />

          {/* grip texture on bar */}
          <line x1="44" y1="47" x2="44" y2="53" opacity="0.5" />
          <line x1="48" y1="47" x2="48" y2="53" opacity="0.5" />
          <line x1="52" y1="47" x2="52" y2="53" opacity="0.5" />
          <line x1="56" y1="47" x2="56" y2="53" opacity="0.5" />

          {/* glowing center node */}
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
          <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.2" />
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
      // To-do checklist: stack of square checkboxes (some checked, some unchecked)
      return (
        <svg {...common}>
          {/* outer holo glow */}
          <rect x="14" y="14" width="72" height="72" rx="6" opacity="0.15" />

          {/* row 1 — checked */}
          <rect x="22" y="24" width="14" height="14" rx="2" />
          <path d="M25 31 L29 35 L34 27" strokeWidth={2} />
          <line x1="42" y1="31" x2="76" y2="31" opacity="0.7" />

          {/* row 2 — checked */}
          <rect x="22" y="44" width="14" height="14" rx="2" />
          <path d="M25 51 L29 55 L34 47" strokeWidth={2} />
          <line x1="42" y1="51" x2="72" y2="51" opacity="0.7" />

          {/* row 3 — unchecked */}
          <rect x="22" y="64" width="14" height="14" rx="2" opacity="0.85" />
          <line x1="42" y1="71" x2="68" y2="71" opacity="0.5" strokeDasharray="2 2" />

          {/* glowing accent on first checkbox */}
          <circle cx="29" cy="31" r="9" fill="currentColor" opacity="0.12" />
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
