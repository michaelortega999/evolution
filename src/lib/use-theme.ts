import { effectiveCardStyle } from "./utils";
import { useEffect, type CSSProperties } from "react";
import mountainBackground from "@/assets/calendar-mountain.jpg";
import { luminance, resolvePalette, type ResolvedPalette } from "./theme-palette";
import { useEvolutionData, type ThemeKey, type AppearanceCustomization } from "./evolution-data";

export const THEME_OPTIONS: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: "default", label: "Default", swatch: "oklch(0.78 0.22 240)" },
  { key: "gold", label: "Gold", swatch: "#c9a84c" },
  { key: "orange", label: "Orange", swatch: "#ff7a18" },
  { key: "green", label: "Green", swatch: "#4ade80" },
  { key: "red", label: "Red", swatch: "#ef4444" },
  { key: "purple", label: "Purple", swatch: "#a855f7" },
  { key: "white", label: "White (Light)", swatch: "#ffffff" },
  { key: "black", label: "Black", swatch: "#0a0a0a" },
];

export function applyTheme(theme: ThemeKey) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const themes: ThemeKey[] = ["default", "gold", "orange", "green", "red", "purple", "white", "black"];
  themes.forEach((t) => root.classList.remove(`theme-${t}`));
  root.classList.add(`theme-${theme}`);
}

export function useTheme() {
  const { data } = useEvolutionData();
  useEffect(() => {
    applyTheme(data.settings?.theme ?? "default");
  }, [data.settings?.theme]);
  const effective = JSON.stringify(effectiveCustomization(data.settings));
  useEffect(() => {
    applyCustomization(JSON.parse(effective));
    return () => applyCustomization(undefined);
  }, [effective]);
  const cardStyle = effectiveCardStyle(data.settings);
  useEffect(() => {
    document.documentElement.dataset.cardStyle = cardStyle;
  }, [cardStyle]);
}

/** Appearance preferences are optional: old accounts keep the existing theme exactly. */
export const CUSTOMIZATION_DEFAULTS: AppearanceCustomization = {
  primary: "#0066ff",
  secondary: "#d9efff",
  background: "glass",
  glass: 70,
  glow: 60,
  blur: 40,
  animations: true,
  dark: true,
};
export const DEFAULT_CUSTOMIZATION = CUSTOMIZATION_DEFAULTS;
export const CUSTOMIZATION_PRESETS = [
  { id: "blue", label: "Jarvis Blue", primary: "#0066ff", secondary: "#d9efff" },
  { id: "red", label: "Crimson Red", primary: "#b91c3c", secondary: "#ffe1e8" },
  { id: "green", label: "Dark Green", primary: "#146b49", secondary: "#d5ffec" },
  { id: "purple", label: "Dark Purple", primary: "#652c9e", secondary: "#f0ddff" },
  { id: "pink", label: "Dark Pink", primary: "#9f245f", secondary: "#ffdaee" },
  { id: "orange", label: "Dark Orange", primary: "#a34815", secondary: "#ffe6cf" },
] as const;
/** Restorable original look: near-black surfaces, cool pale text, blue neon accent, quiet canvas, classic frames. */
export const BLACK_NEON_PRESET = {
  id: "black-neon",
  label: "Black Neon",
  customization: {
    primary: "#05080d",
    secondary: "#dbe9f6",
    background: "minimal",
    glass: 0,
    glow: 25,
    blur: 0,
    dark: true,
  },
  cardStyle: "classic",
} as const;
const backgrounds = ["glass", "grid", "minimal", "gradient", "landscape"] as const;
const safeHex = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;
const percent = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.round(Math.max(0, Math.min(100, value))) : fallback;

/** No arbitrary URL, CSS, non-finite slider value, or unknown enum reaches the stylesheet. */
export function normalizeCustomization(value: unknown): AppearanceCustomization {
  const v = value && typeof value === "object" ? (value as Partial<AppearanceCustomization>) : {};
  return {
    primary: safeHex(v.primary, CUSTOMIZATION_DEFAULTS.primary),
    secondary: safeHex(v.secondary, CUSTOMIZATION_DEFAULTS.secondary),
    background: backgrounds.includes(v.background!) ? v.background! : CUSTOMIZATION_DEFAULTS.background,
    glass: percent(v.glass, CUSTOMIZATION_DEFAULTS.glass),
    glow: percent(v.glow, CUSTOMIZATION_DEFAULTS.glow),
    blur: percent(v.blur, CUSTOMIZATION_DEFAULTS.blur),
    animations: typeof v.animations === "boolean" ? v.animations : CUSTOMIZATION_DEFAULTS.animations,
    dark: typeof v.dark === "boolean" ? v.dark : CUSTOMIZATION_DEFAULTS.dark,
  };
}
/** Every mode is a subtle texture over a black canvas; the black backdrop always wins. */
export function customizationBackground(value: unknown): string {
  const v = normalizeCustomization(value);
  const p = resolvePalette(v);
  const base = p.page;
  if (v.background === "minimal") return base;
  if (v.background === "grid")
    return `linear-gradient(${p.accent}0f 1px,transparent 1px),linear-gradient(90deg,${p.accent}0f 1px,transparent 1px),${base}`;
  if (v.background === "gradient") return `radial-gradient(ellipse at 50% 0%,${p.accent}14,transparent 60%),${base}`;
  if (v.background === "landscape")
    return `linear-gradient(${base}e6,${base}f2),url("${mountainBackground}"),${base}`;
  return `radial-gradient(ellipse at 85% 10%,${p.accent}12,transparent 55%),radial-gradient(ellipse at 10% 80%,${p.accent}0c,transparent 45%),${base}`;
}

/** Both aliases are supported for the small inline preview and the app-wide theme. */
export function customizationTokens(value: unknown): Record<string, string> {
  const v = normalizeCustomization(value);
  const p = resolvePalette(v);
  const base = p.page;
  const surface = p.card;
  const text = p.text;
  const muted = p.muted;
  const fill = p.cardFill;
  const glow = `0 0 ${(v.glow * 0.3).toFixed(1)}px ${p.accent}${Math.round(v.glow * 0.8)
    .toString(16)
    .padStart(2, "0")}`;
  const blur = `${(v.blur * 0.24).toFixed(1)}px`;
  const image = customizationBackground(v);
  return {
    "--evo-primary": v.primary,
    "--evo-secondary": text,
    "--evo-text": text,
    "--evo-muted": muted,
    "--evo-surface": fill,
    "--evo-solid-surface": surface,
    "--evo-background-image": image,
    "--evo-background-size": v.background === "grid" ? "28px 28px,28px 28px,auto" : "cover",
    "--evo-glow": glow,
    "--evo-blur": blur,
    "--evo-border": p.line,
    "--evo-accent": p.accent,
    "--evo-title": text,
    "--evo-page": p.page,
    "--evo-card": p.card,
    "--card-fill": p.cardFill,
    "--card-fill-2": p.cardFill2,
    "--card-line": p.line,
    "--card-accent": p.accent,
    "--hud-fill-a": p.cardFill,
    "--hud-fill-b": p.cardFill2,
    "--hud-border": p.accent,
    "--hud-border-mid": p.line,
    "--hud-border-soft": p.line,
    "--custom-primary": v.primary,
    "--custom-secondary": text,
    "--custom-text": text,
    "--custom-surface": fill,
    "--custom-background": image,
    "--custom-glow": glow,
    "--custom-blur": blur,
    "--es-blue": text,
    "--es-line": p.line,
    "--es-text": text,
    "--es-muted": muted,
    "--background": base,
    "--foreground": text,
    "--card": surface,
    "--card-foreground": text,
    "--popover": surface,
    "--popover-foreground": text,
    "--primary": p.accent,
    "--primary-foreground": readableOn(p.accent),
    "--secondary": surface,
    "--secondary-foreground": text,
    "--muted": surface,
    "--muted-foreground": muted,
    "--accent": p.accent,
    "--accent-foreground": text,
    "--border": p.line,
    "--input": surface,
    "--ring": p.accent,
    "--glow": p.accent,
    "--grid-line": p.accent + "1f",
    "--brand-ink": text,
    "color-scheme": "dark",
  };
}
function readableOn(bg: string): string {
  return luminance(bg) > 0.18 ? "#04070c" : "#ffffff";
}
/** Each legacy accent theme expressed in the same palette model (black page, tinted neon glass). */
export const LEGACY_THEME_SEEDS: Record<ThemeKey, { primary: string; secondary: string; dark: boolean }> = {
  default: { primary: "#0066ff", secondary: "#d9efff", dark: true },
  gold: { primary: "#c9a84c", secondary: "#fff1cf", dark: true },
  orange: { primary: "#ff7a18", secondary: "#ffe6cf", dark: true },
  green: { primary: "#4ade80", secondary: "#d5ffec", dark: true },
  red: { primary: "#ef4444", secondary: "#ffe1e8", dark: true },
  purple: { primary: "#a855f7", secondary: "#f0ddff", dark: true },
  // "White" is a light-glass card option; the page stays black.
  white: { primary: "#dfe8f2", secondary: "#ffffff", dark: false },
  black: { primary: "#05080d", secondary: "#dbe9f6", dark: true },
};
/** Saved custom colours win; otherwise the legacy theme's seed. Read-only: nothing is written back. */
export function effectiveCustomization(
  settings: { theme?: unknown; customization?: unknown } | undefined,
): AppearanceCustomization {
  if (settings?.customization && typeof settings.customization === "object")
    return normalizeCustomization(settings.customization);
  const key = (typeof settings?.theme === "string" && settings.theme in LEGACY_THEME_SEEDS ? settings.theme : "default") as ThemeKey;
  const seed = LEGACY_THEME_SEEDS[key];
  return normalizeCustomization({ ...CUSTOMIZATION_DEFAULTS, ...seed, background: key === "black" ? "minimal" : "glass" });
}
/** Canonical palette for every owner state (custom, legacy theme or none). */
export function resolvedAppPalette(settings: { theme?: unknown; customization?: unknown } | undefined): ResolvedPalette {
  return resolvePalette(effectiveCustomization(settings));
}
/** Resolved palette for the owner's saved preference, or null when legacy theme classes apply. */
export function resolvedCustomPalette(value: unknown): ResolvedPalette | null {
  return value && typeof value === "object" ? resolvePalette(normalizeCustomization(value)) : null;
}
export const customizationStyle = (value: unknown): CSSProperties => customizationTokens(value) as CSSProperties;

export const CUSTOMIZATION_CSS = `
html.evo-customized,html.evo-customized body{background:var(--evo-background-image)!important;background-size:var(--evo-background-size)!important;background-attachment:fixed;color:var(--evo-text)}
.evo-customized .es-shell,.evo-customized.es-shell{--es-blue:var(--evo-secondary);--es-line:var(--evo-border);--es-text:var(--evo-text);--es-muted:var(--evo-muted);background:var(--evo-background-image)!important;background-size:var(--evo-background-size)!important;color:var(--evo-text)}
html.evo-customized .hud-card{--hud-border:var(--evo-primary);--hud-border-mid:var(--evo-border);--hud-border-soft:var(--evo-border);--hud-fill-a:var(--evo-surface);--hud-fill-b:var(--evo-surface);filter:drop-shadow(var(--evo-glow));backdrop-filter:blur(var(--evo-blur))}
html.evo-customized .hud-card::before{background:var(--evo-surface)!important}
html.evo-customized .card-surface,.evo-customized .es-panel,.evo-customized .es-action,.evo-customized .es-search,.evo-customized .es-tabs,.evo-customized .es-facts>div,.evo-customized .appearance-section,.evo-customized .ec-color-box,.evo-customized .ec-color-value,.evo-customized .ec-presets button,.evo-customized .ec-backgrounds button,.evo-customized .ec-preview-intro button,.evo-customized .ec-sample-card{background:var(--evo-surface)!important;color:var(--evo-text);border-color:var(--evo-border)!important;box-shadow:var(--evo-glow);backdrop-filter:blur(var(--evo-blur))}
.evo-customized .es-tabs a[aria-current],.evo-customized .es-name-edit button{background:var(--evo-primary)!important;color:var(--primary-foreground)!important}
.evo-customized .es-title p,.evo-customized .es-person p,.evo-customized .es-panel p,.evo-customized .es-profile blockquote,.evo-customized .es-unavailable,.evo-customized .es-details small,.evo-customized .es-pref-line small,.evo-customized .es-tabs a,.evo-customized .es-footer{color:var(--evo-muted)!important}
.evo-customized .text-primary,.evo-customized .es-sidebar nav svg,.evo-customized .es-title svg,.evo-customized .es-panel h2,.evo-customized .es-action svg,.evo-customized .es-tabs svg,.evo-customized .es-inline-link,.evo-customized .es-brand-context,.evo-customized .ec-sample-card svg{color:var(--evo-secondary)!important}
.evo-customized .es-panel input,.evo-customized .es-avatar,.evo-customized .es-service{background:var(--evo-solid-surface)!important;color:var(--evo-text)!important;border-color:var(--evo-border)!important}
.evo-customized .es-panel:before{background:var(--evo-primary);box-shadow:var(--evo-glow)}
/* Scoped palette adapters for routes with bespoke literal colours. Semantic profit/loss/warning colours are left alone. */
html.evo-customized :is(.cw-shell,.f-shell,.media-dashboard,.media-workspace,.travel-os,.evo-workspace,.hobby-shell,.live-hud-screen){background:var(--evo-background-image)!important;background-size:var(--evo-background-size)!important;color:var(--evo-text)!important;--blue:var(--evo-accent);--cyan:var(--evo-accent);--md-cyan:var(--evo-accent);--md-text:var(--evo-text);--evo-blue:var(--evo-accent);--evo-line:var(--evo-border);--evo-dim:var(--evo-muted)}
html.evo-customized .wf-app{color:var(--evo-text)!important;--wf-color:var(--evo-accent);--wf-line:var(--evo-border);background:transparent!important}
html.evo-customized :is(.cw-frame,.f-frame,.f-panel,.md-panel,.media-panel,.bo-panel,.bo-card,.travel-panel){background:var(--card-fill)!important;border-color:var(--card-line)!important;color:var(--evo-text)}
html.evo-customized :is(.cw-shell,.f-shell,.media-dashboard,.media-workspace,.travel-os,.evo-workspace,.wf-app,.hud-card,.card-surface,[data-goals-planner]) :is(h1,h2,h3,h4,.hud-label,.evo-module-title,.cw-title h1){color:var(--evo-title)}
html.evo-customized [data-goals-planner]{color:var(--evo-text)!important}
html.evo-customized [role=dialog]{background:var(--card-fill-2);border-color:var(--card-line);color:var(--evo-text)}
html.evo-customized :is(.text-muted-foreground){color:var(--evo-muted)!important}
.evo-customized[data-evo-animations="false"] *,.evo-customized[data-evo-animations="false"] *::before,.evo-customized[data-evo-animations="false"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){.evo-customized *,.evo-customized *::before,.evo-customized *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

let previousCustomizationStyles: Map<string, string> | undefined;
export function applyCustomization(value: unknown) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  document.getElementById("evolution-customization-style")?.remove();
  if (previousCustomizationStyles) {
    previousCustomizationStyles.forEach((previous, key) => {
      if (previous) root.style.setProperty(key, previous);
      else root.style.removeProperty(key);
    });
    previousCustomizationStyles = undefined;
  }
  root.classList.remove("evo-customized");
  delete root.dataset.evoBackground;
  delete root.dataset.evoDark;
  delete root.dataset.evoAnimations;
  if (!value || typeof value !== "object") return;
  const v = normalizeCustomization(value);
  const tokens = customizationTokens(v);
  previousCustomizationStyles = new Map(Object.keys(tokens).map((key) => [key, root.style.getPropertyValue(key)]));
  Object.entries(tokens).forEach(([key, token]) => root.style.setProperty(key, token));
  root.classList.add("evo-customized");
  root.dataset.evoBackground = v.background;
  root.dataset.evoDark = String(v.dark);
  root.dataset.evoAnimations = String(v.animations);
  const style = document.createElement("style");
  style.id = "evolution-customization-style";
  style.textContent = CUSTOMIZATION_CSS;
  document.head.appendChild(style);
}
