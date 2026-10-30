import { effectiveCardStyle } from "./utils";
import { useEffect, type CSSProperties } from "react";
import mountainBackground from "@/assets/calendar-mountain.jpg";
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
  useEffect(() => {
    applyCustomization(data.settings?.customization);
    return () => applyCustomization(undefined);
  }, [data.settings?.customization]);
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
function rgb(hex: string): number[] {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}
function mix(a: string, b: string, amount: number): string {
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
function luminance(hex: string): number {
  return rgb(hex)
    .map((v) => {
      const n = v / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function readable(color: string, background: string): string {
  const bg = luminance(background);
  const target = bg < 0.179 ? "#ffffff" : "#000000";
  for (let i = 0; i <= 20; i++) {
    const candidate = mix(color, target, i / 20);
    const fg = luminance(candidate);
    if ((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05) >= 7) return candidate;
  }
  return target;
}

export function customizationBackground(value: unknown): string {
  const v = normalizeCustomization(value);
  const base = mix(v.primary, v.dark ? "#030812" : "#f5f8ff", v.dark ? 0.92 : 0.94);
  const glow = v.primary + (v.dark ? "35" : "12");
  if (v.background === "minimal") return base;
  if (v.background === "grid")
    return `linear-gradient(${v.primary}18 1px,transparent 1px),linear-gradient(90deg,${v.primary}18 1px,transparent 1px),${base}`;
  if (v.background === "gradient") return `linear-gradient(135deg,${mix(v.primary, base, 0.55)},${base} 65%)`;
  if (v.background === "landscape")
    return `linear-gradient(${base}${v.dark ? "ac" : "cc"},${base}ee),url("${mountainBackground}"),${base}`;
  return `radial-gradient(ellipse at 85% 10%,${glow},transparent 55%),radial-gradient(ellipse at 10% 80%,${v.primary}20,transparent 45%),${base}`;
}

/** Both aliases are supported for the small inline preview and the app-wide theme. */
export function customizationTokens(value: unknown): Record<string, string> {
  const v = normalizeCustomization(value);
  const base = mix(v.primary, v.dark ? "#030812" : "#f5f8ff", v.dark ? 0.92 : 0.94);
  const surface = mix(v.primary, v.dark ? "#08121e" : "#ffffff", v.dark ? 0.88 : 0.94);
  const text = readable(v.secondary, surface);
  const muted = mix(text, surface, 0.2);
  const opacity = (1 - v.glass * 0.003).toFixed(2);
  const fill = `rgb(${rgb(surface).join(" ")} / ${opacity})`;
  const glow = `0 0 ${(v.glow * 0.3).toFixed(1)}px ${v.primary}${Math.round(v.glow * 0.8)
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
    "--evo-border": `${v.primary}80`,
    "--custom-primary": v.primary,
    "--custom-secondary": text,
    "--custom-text": text,
    "--custom-surface": fill,
    "--custom-background": image,
    "--custom-glow": glow,
    "--custom-blur": blur,
    "--es-blue": text,
    "--es-line": `${v.primary}80`,
    "--es-text": text,
    "--es-muted": muted,
    "--background": base,
    "--foreground": text,
    "--card": surface,
    "--card-foreground": text,
    "--popover": surface,
    "--popover-foreground": text,
    "--primary": v.primary,
    "--primary-foreground": readable("#ffffff", v.primary),
    "--secondary": surface,
    "--secondary-foreground": text,
    "--muted": surface,
    "--muted-foreground": muted,
    "--accent": v.primary,
    "--accent-foreground": text,
    "--border": `${v.primary}80`,
    "--input": surface,
    "--ring": v.primary,
    "--glow": v.primary,
    "--brand-ink": text,
    "color-scheme": v.dark ? "dark" : "light",
  };
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
