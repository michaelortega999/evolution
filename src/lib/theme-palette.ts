/**
 * One resolved, validated palette for owner appearance preferences.
 * Pure (no DOM) so it can be tested and shared with the phone bridge.
 */
export type PaletteInput = {
  primary: string;
  secondary: string;
  glass: number;
  dark: boolean;
};

export type ResolvedPalette = {
  /** Chosen values exactly as saved. */
  chosen: { primary: string; secondary: string };
  /** Page background shades derived from primary. */
  page: string;
  pageAlt: string;
  /** Opaque card colours derived from primary (before glass opacity). */
  card: string;
  cardAlt: string;
  /** Card fills with the glass slider applied. */
  cardFill: string;
  cardFill2: string;
  /** Neon accent used for outlines/glow. Near-black primaries get the classic blue neon. */
  accent: string;
  line: string;
  /** Effective text colour actually rendered (secondary, contrast-corrected if needed). */
  text: string;
  muted: string;
  secondaryAdjusted: boolean;
  /** Contrast ratio of the effective text against the worst surface it sits on. */
  contrast: number;
};

export const MIN_TEXT_CONTRAST = 4.5;
export const BLACK_NEON_ACCENT = "#2f9bff";

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

export function rgb(hex: string): number[] {
  return [1, 3, 5].map((s) => parseInt(hex.slice(s, s + 2), 16));
}
export function mix(a: string, b: string, amount: number): string {
  const end = rgb(b);
  return (
    "#" +
    rgb(a)
      .map((v, i) =>
        Math.round(v + (end[i] - v) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function luminance(hex: string): number {
  return rgb(hex)
    .map((v) => {
      const n = v / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrastRatio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Smallest move toward white/black that reaches the target ratio against every surface. */
export function ensureContrast(color: string, surfaces: string[], min = MIN_TEXT_CONTRAST): string {
  const worst = (c: string) => Math.min(...surfaces.map((s) => contrastRatio(c, s)));
  if (worst(color) >= min) return color;
  const avg = surfaces.reduce((sum, s) => sum + luminance(s), 0) / surfaces.length;
  const target = avg < 0.179 ? "#ffffff" : "#000000";
  for (let i = 1; i <= 40; i++) {
    const candidate = mix(color, target, i / 40);
    if (worst(candidate) >= min) return candidate;
  }
  return target;
}

/** Luminous hologram version of a colour: same hue, lifted toward a bright neon. */
export function neon(hex: string): string {
  const c = rgb(hex);
  const max = Math.max(...c, 1);
  const scaled = "#" + c.map((v) => Math.round((v / max) * 255).toString(16).padStart(2, "0")).join("");
  return mix(scaled, "#ffffff", 0.3);
}

export function resolvePalette(v: PaletteInput): ResolvedPalette {
  const primary = isHex(v.primary) ? v.primary.toLowerCase() : "#0066ff";
  const secondary = isHex(v.secondary) ? v.secondary.toLowerCase() : "#d9efff";
  // The page is always near-pure black in every scheme. Primary tints the translucent card glass
  // and drives the neon edge/glow; "dark: false" only means lighter glass cards, never a white page.
  const nearBlack = luminance(primary) < 0.01;
  const accent = nearBlack ? BLACK_NEON_ACCENT : neon(primary);
  const page = mix(primary, "#000000", 0.97);
  const pageAlt = mix(primary, "#000000", 0.94);
  const card = mix(nearBlack ? primary : accent, "#000000", v.dark ? 0.9 : 0.78);
  const cardAlt = mix(nearBlack ? primary : accent, "#000000", v.dark ? 0.95 : 0.86);
  const opacity = Math.max(0.55, 0.9 - (Number.isFinite(v.glass) ? v.glass : 70) * 0.0035);
  const alpha = (hex: string) => `rgb(${rgb(hex).join(" ")} / ${opacity.toFixed(2)})`;
  const surfaces = [card, cardAlt, page];
  const text = ensureContrast(secondary, surfaces);
  const muted = ensureContrast(mix(text, card, 0.3), surfaces);
  return {
    chosen: { primary, secondary },
    page,
    pageAlt,
    card,
    cardAlt,
    cardFill: alpha(card),
    cardFill2: alpha(cardAlt),
    accent,
    line: accent + (nearBlack ? "66" : "80"),
    text,
    muted,
    secondaryAdjusted: text !== secondary,
    contrast: Math.round(Math.min(...surfaces.map((s) => contrastRatio(text, s))) * 100) / 100,
  };
}

/** Only these custom properties may cross into the same-origin phone frame. */
export const BRIDGE_TOKEN_KEYS = [
  "--evo-page",
  "--evo-page-alt",
  "--evo-card",
  "--evo-card-alt",
  "--evo-accent",
  "--evo-line",
  "--evo-text",
  "--evo-muted",
] as const;
export type BridgePalette = Partial<Record<(typeof BRIDGE_TOKEN_KEYS)[number], string>>;
const BRIDGE_VALUE = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

export function bridgePalette(p: ResolvedPalette | null): BridgePalette | null {
  if (!p) return null;
  return {
    "--evo-page": p.page,
    "--evo-page-alt": p.pageAlt,
    "--evo-card": p.card + "d9",
    "--evo-card-alt": p.cardAlt + "d9",
    "--evo-accent": p.accent,
    "--evo-line": p.line,
    "--evo-text": p.text,
    "--evo-muted": p.muted,
  };
}
/** Receiver-side validation, mirrored in public/evolution-mobile/index.html. */
export function sanitizeBridgePalette(value: unknown): BridgePalette | null {
  if (!value || typeof value !== "object") return null;
  const out: BridgePalette = {};
  for (const key of BRIDGE_TOKEN_KEYS) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === "string" && BRIDGE_VALUE.test(v)) out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Elements carrying profit/loss/success/warning/error meaning keep their own colours.
 * Mark explicitly with data-semantic, or rely on these class-name fragments.
 */
export const SEMANTIC_EXCLUDE =
  ":not([data-semantic]):not([class*=profit]):not([class*=loss]):not([class*=gain]):not([class*=-pos]):not([class*=-neg]):not([class*=-up]):not([class*=-down]):not([class*=success]):not([class*=warn]):not([class*=danger]):not([class*=error]):not([class*=green]):not([class*=red]):not([class*=emerald]):not([class*=rose]):not([class*=amber]):not([class*=destructive])";

/** Static stylesheet the phone frame installs; narrow card selectors only (no [class*=card]). */
export const FRAME_PALETTE_CSS =
  "html[data-evo-palette=custom],html[data-evo-palette=custom] body{background:var(--evo-page)!important;color:var(--evo-text)!important}" +
  `html[data-evo-palette=custom] :is(.evo-style-card,.st-card)${SEMANTIC_EXCLUDE}{background-color:var(--evo-card)!important;border-color:var(--evo-line)!important}` +
  `html[data-evo-palette=custom] :is(h1,h2,h3,h4)${SEMANTIC_EXCLUDE}{color:var(--evo-text)!important}`;
