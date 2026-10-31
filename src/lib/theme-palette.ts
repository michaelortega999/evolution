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

export function resolvePalette(v: PaletteInput): ResolvedPalette {
  const primary = isHex(v.primary) ? v.primary.toLowerCase() : "#0066ff";
  const secondary = isHex(v.secondary) ? v.secondary.toLowerCase() : "#d9efff";
  const ink = v.dark ? "#000000" : "#ffffff";
  // Primary stays clearly visible across the whole card; the page is a deeper coordinated shade.
  const card = mix(primary, ink, v.dark ? 0.6 : 0.78);
  const cardAlt = mix(primary, ink, v.dark ? 0.72 : 0.86);
  const page = mix(primary, ink, v.dark ? 0.8 : 0.9);
  const pageAlt = mix(primary, ink, v.dark ? 0.7 : 0.84);
  const nearBlack = luminance(primary) < 0.01;
  const accent = nearBlack ? BLACK_NEON_ACCENT : v.dark ? mix(primary, "#ffffff", 0.25) : primary;
  const opacity = Math.max(0.55, 1 - (Number.isFinite(v.glass) ? v.glass : 70) * 0.004);
  const alpha = (hex: string) => `rgb(${rgb(hex).join(" ")} / ${opacity.toFixed(2)})`;
  // Glass fills can show the page through, so check text against both the card and page shades.
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
    line: accent + (nearBlack ? "66" : "99"),
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
    "--evo-card": p.card,
    "--evo-card-alt": p.cardAlt,
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
