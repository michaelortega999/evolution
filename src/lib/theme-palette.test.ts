import { describe, expect, it } from "vitest";
import {
  BLACK_NEON_ACCENT,
  bridgePalette,
  contrastRatio,
  luminance,
  MIN_TEXT_CONTRAST,
  resolvePalette,
  sanitizeBridgePalette,
} from "./theme-palette";
import {
  BLACK_NEON_PRESET,
  CUSTOMIZATION_DEFAULTS,
  CUSTOMIZATION_PRESETS,
  customizationTokens,
  normalizeCustomization,
  resolvedCustomPalette,
} from "./use-theme";

const base = { glass: 0, dark: true };

describe("primary colours whole cards and the page", () => {
  it("card and page carry visible primary hue, page deeper than card", () => {
    const p = resolvePalette({ ...base, primary: "#b91c3c", secondary: "#ffe1e8" });
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(p.card.slice(i, i + 2), 16));
    expect(r).toBeGreaterThan(g * 3);
    expect(r).toBeGreaterThan(b * 2);
    expect(luminance(p.page)).toBeLessThan(luminance(p.card));
  });
  it("tokens feed card geometry fills, not just accents", () => {
    const t = customizationTokens({ ...CUSTOMIZATION_DEFAULTS, primary: "#146b49", glass: 0 });
    const p = resolvePalette({ ...base, primary: "#146b49", secondary: CUSTOMIZATION_DEFAULTS.secondary });
    expect(t["--card-fill"]).toBe(p.cardFill);
    expect(t["--hud-fill-a"]).toBe(p.cardFill);
    expect(t["--background"]).toBe(p.page);
    expect(t["--card"]).toBe(p.card);
  });
});

describe("secondary governs text and titles", () => {
  it("readable secondary is used exactly", () => {
    const t = customizationTokens({ ...CUSTOMIZATION_DEFAULTS, secondary: "#ffe6cf" });
    expect(t["--foreground"]).toBe("#ffe6cf");
    expect(t["--evo-title"]).toBe("#ffe6cf");
    expect(resolvePalette({ ...base, primary: "#0066ff", secondary: "#ffe6cf" }).secondaryAdjusted).toBe(false);
  });
  it("unsafe secondary is corrected and disclosed with the effective value", () => {
    const p = resolvePalette({ ...base, primary: "#0066ff", secondary: "#001133" });
    expect(p.secondaryAdjusted).toBe(true);
    expect(p.chosen.secondary).toBe("#001133");
    expect(p.text).not.toBe("#001133");
    for (const s of [p.card, p.cardAlt, p.page]) expect(contrastRatio(p.text, s)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(p.contrast).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });
});

describe("presets", () => {
  it("six distinct custom choices remain", () => {
    expect(CUSTOMIZATION_PRESETS).toHaveLength(6);
    const cards = new Set(CUSTOMIZATION_PRESETS.map((x) => resolvePalette({ ...base, ...x }).card));
    expect(cards.size).toBe(6);
  });
  it("Black Neon is genuinely near-black with blue neon accent and classic frames", () => {
    const p = resolvePalette({ ...base, ...BLACK_NEON_PRESET.customization });
    expect(luminance(p.card)).toBeLessThan(0.005);
    expect(luminance(p.page)).toBeLessThan(0.005);
    expect(p.accent).toBe(BLACK_NEON_ACCENT);
    expect(p.secondaryAdjusted).toBe(false);
    expect(BLACK_NEON_PRESET.cardStyle).toBe("classic");
    expect(BLACK_NEON_PRESET.customization.background).toBe("minimal");
  });
  it("palette does not depend on card geometry (no cardStyle input)", () => {
    const n = normalizeCustomization({ ...BLACK_NEON_PRESET.customization, cardStyle: "glass" });
    expect(resolvePalette(n)).toEqual(resolvePalette(normalizeCustomization(BLACK_NEON_PRESET.customization)));
  });
});

describe("legacy theme / reset transitions", () => {
  it("no saved preference resolves to null so legacy theme classes apply untouched", () => {
    expect(resolvedCustomPalette(undefined)).toBeNull();
    expect(resolvedCustomPalette(null)).toBeNull();
  });
  it("normalization keeps saved choices unchanged (no silent migration)", () => {
    const saved = { ...CUSTOMIZATION_DEFAULTS, primary: "#9f245f", secondary: "#ffdaee", background: "grid" as const };
    expect(normalizeCustomization(saved)).toEqual(saved);
  });
});

describe("phone bridge palette", () => {
  it("only allowlisted keys with hex values pass", () => {
    const p = bridgePalette(resolvePalette({ ...base, primary: "#0066ff", secondary: "#d9efff" }));
    expect(sanitizeBridgePalette(p)).toEqual(p);
    expect(
      sanitizeBridgePalette({ "--evo-text": "red;background:url(x)", "--evo-page": "#000000", "--other": "#ffffff" }),
    ).toEqual({ "--evo-page": "#000000" });
    expect(sanitizeBridgePalette("x")).toBeNull();
    expect(bridgePalette(null)).toBeNull();
  });
});
