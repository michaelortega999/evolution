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
  customizationBackground,
  normalizeCustomization,
  resolvedCustomPalette,
} from "./use-theme";

const base = { glass: 0, dark: true };

describe("primary tints the whole card glass", () => {
  it("card and page carry visible primary hue, page deeper than card", () => {
    const p = resolvePalette({ ...base, primary: "#b91c3c", secondary: "#ffe1e8" });
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(p.card.slice(i, i + 2), 16));
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
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

describe("black canvas in every scheme", () => {
  it("page is near-pure black for all six choices, Black Neon and the lighter-glass option", () => {
    const all = [...CUSTOMIZATION_PRESETS, BLACK_NEON_PRESET.customization];
    for (const x of all)
      for (const dark of [true, false]) {
        const p = resolvePalette({ glass: 70, dark, primary: x.primary, secondary: x.secondary });
        expect(luminance(p.page)).toBeLessThan(0.003);
      }
  });
  it("cards are translucent dark glass tinted by primary, with neon edges (green example)", () => {
    const p = resolvePalette({ glass: 70, dark: true, primary: "#146b49", secondary: "#d5ffec" });
    expect(p.cardFill).toMatch(/\/ 0\.\d+\)$/);
    expect(luminance(p.card)).toBeLessThan(0.02);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(p.card.slice(i, i + 2), 16));
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
    expect(luminance(p.accent)).toBeGreaterThan(0.3);
  });
  it("every background mode ends on the black base", () => {
    for (const background of ["glass", "grid", "minimal", "gradient", "landscape"] as const)
      expect(customizationBackground({ ...CUSTOMIZATION_DEFAULTS, background }).endsWith(resolvePalette({ ...CUSTOMIZATION_DEFAULTS }).page)).toBe(true);
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
    ).toBeNull();
    expect(sanitizeBridgePalette("x")).toBeNull();
    expect(bridgePalette(null)).toBeNull();
  });
});

import { readFileSync } from "node:fs";
import { FRAME_PALETTE_CSS, SEMANTIC_EXCLUDE } from "./theme-palette";
import { CUSTOMIZATION_CSS, LEGACY_THEME_SEEDS, effectiveCustomization, resolvedAppPalette } from "./use-theme";

describe("legacy themes and empty preferences share the canonical palette", () => {
  it("every legacy theme (incl. white and black) resolves to a black page and readable text", () => {
    for (const theme of Object.keys(LEGACY_THEME_SEEDS)) {
      const p = resolvedAppPalette({ theme, customization: null });
      expect(luminance(p.page)).toBeLessThan(0.003);
      expect(p.contrast).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });
  it("theme-black without custom colours still gives the phone a palette (Black Neon look)", () => {
    const tokens = bridgePalette(resolvedAppPalette({ theme: "black" }));
    expect(tokens?.["--evo-accent"]).toBe(BLACK_NEON_ACCENT);
    expect(sanitizeBridgePalette(tokens)).toEqual(tokens);
  });
  it("saved custom colours win over the legacy theme; nothing missing falls back to default", () => {
    expect(effectiveCustomization({ theme: "gold", customization: { primary: "#146b49" } }).primary).toBe("#146b49");
    expect(resolvedAppPalette(undefined).accent).toBe(resolvedAppPalette({ theme: "default" }).accent);
  });
});

describe("semantic profit/loss/warning colours are protected", () => {
  const frameHtml = readFileSync("public/evolution-mobile/index.html", "utf8");
  it("phone frame installs exactly the shared stylesheet and never a broad [class*=card] override", () => {
    expect(frameHtml).toContain(FRAME_PALETTE_CSS);
    expect(FRAME_PALETTE_CSS).not.toMatch(/\[class\*=["']?card/);
    expect(frameHtml).not.toMatch(/\[class\*=card\]/);
  });
  it("every recolouring frame rule excludes semantic markers", () => {
    const rules = FRAME_PALETTE_CSS.split("}").filter((r) => r.includes(":is("));
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) expect(r).toContain(SEMANTIC_EXCLUDE);
  });
  it("exclusion covers explicit marker and profit/loss/warning/error fragments", () => {
    for (const k of ["data-semantic", "profit", "loss", "warn", "danger", "error", "success", "destructive"])
      expect(SEMANTIC_EXCLUDE).toContain(k);
  });
  it("app adapters for Calendar/Goals/bespoke routes apply the exclusion to recolouring rules", () => {
    const lines = CUSTOMIZATION_CSS.split("\n").filter((l) => /data-planning-calendar|data-goals-planner|\.cw-shell/.test(l) && /\(p,span|bg-slate|text-slate|border-sky/.test(l));
    expect(lines.length).toBeGreaterThanOrEqual(4);
    for (const l of lines) expect(l).toContain(SEMANTIC_EXCLUDE);
    expect(CUSTOMIZATION_CSS).not.toContain("${");
  });
});

import { bestForeground } from "./theme-palette";

const ALL_SEEDS = [
  ...CUSTOMIZATION_PRESETS.map((x) => ({ primary: x.primary, secondary: x.secondary })),
  BLACK_NEON_PRESET.customization,
  ...Object.values(LEGACY_THEME_SEEDS),
];

describe("universal black canvas", () => {
  const modes = ["glass", "grid", "minimal", "gradient", "landscape"] as const;
  it("page token and every background mode are pure black with only neutral grey texture", () => {
    for (const seed of ALL_SEEDS)
      for (const background of modes) {
        const v = { ...CUSTOMIZATION_DEFAULTS, ...seed, background };
        const t = customizationTokens(v);
        expect(t["--background"]).toBe("#000000");
        const bg = customizationBackground(v);
        expect(bg.endsWith("#000000")).toBe(true);
        expect(bg).not.toMatch(/url\(/);
        for (const hex of bg.match(/#[0-9a-f]{6,8}/gi) ?? []) {
          const [r, g, b] = [1, 3, 5].map((i) => hex.slice(i, i + 2));
          expect(r === g && g === b).toBe(true); // grayscale only
        }
      }
  });
});

describe("solid accent foregrounds are readable (selected tabs, pressed buttons, menus)", () => {
  it("--primary-foreground and --accent-foreground pass 4.5:1 on the resolved accent for every scheme", () => {
    for (const seed of ALL_SEEDS) {
      const t = customizationTokens({ ...CUSTOMIZATION_DEFAULTS, ...seed });
      expect(contrastRatio(t["--primary-foreground"], t["--primary"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t["--accent-foreground"], t["--accent"])).toBeGreaterThanOrEqual(4.5);
      expect(t["--evo-primary"]).toBe(t["--primary"]);
    }
  });
  it("picks the best of white/black when the preferred colour fails", () => {
    expect(bestForeground("#767676", "#7a7a7a")).toBe("#000000");
    expect(contrastRatio(bestForeground(BLACK_NEON_ACCENT, "#dbe9f6"), BLACK_NEON_ACCENT)).toBeGreaterThanOrEqual(4.5);
  });
  it("hud cards use the resolved accent and distinct fill layers, not raw primary", () => {
    expect(CUSTOMIZATION_CSS).not.toContain("--hud-border:var(--evo-primary)");
    expect(CUSTOMIZATION_CSS).not.toContain("--hud-fill-b:var(--evo-surface)");
    const t = customizationTokens({ ...CUSTOMIZATION_DEFAULTS, ...BLACK_NEON_PRESET.customization });
    expect(t["--hud-border"]).toBe(BLACK_NEON_ACCENT);
  });
  it("bespoke text rule never recolours text inside solid primary/accent/pressed controls", () => {
    const line = CUSTOMIZATION_CSS.split("\n").find((l) => l.includes(":is(p,span,label"))!;
    expect(line).not.toMatch(/,a,button\)/);
    expect(line).toContain('[class*="bg-primary"]');
    expect(line).toContain('[aria-pressed="true"]');
  });
});

describe("Customize seeds from the effective (legacy) palette", () => {
  it("legacy green/black show their colours and a slider change keeps them", () => {
    const green = effectiveCustomization({ theme: "green", customization: null });
    expect(green.primary).toBe(LEGACY_THEME_SEEDS.green.primary);
    const afterSlider = { ...effectiveCustomization({ theme: "black" }), glass: 10 };
    expect(afterSlider.primary).toBe(LEGACY_THEME_SEEDS.black.primary);
    expect(afterSlider.secondary).toBe(LEGACY_THEME_SEEDS.black.secondary);
  });
});

describe("bridge rejects incomplete palettes", () => {
  it("one missing or invalid key clears the whole palette", () => {
    const full = bridgePalette(resolvedAppPalette({ theme: "green" }))!;
    const missing = { ...full };
    delete missing["--evo-text"];
    expect(sanitizeBridgePalette(missing)).toBeNull();
    expect(sanitizeBridgePalette({ ...full, "--evo-line": "blue" })).toBeNull();
    expect(sanitizeBridgePalette(full)).toEqual(full);
    const html = readFileSync("public/evolution-mobile/index.html", "utf8");
    expect(html).toContain("keys.every(");
    expect(html).toContain("event.source !== window.parent || event.origin !== window.location.origin");
  });
});

import { FRAME_MUTED_COLORS, FRAME_SURFACE_COLORS, FRAME_TEXT_COLORS, FRAME_TITLE_COLORS } from "./theme-palette";

describe("phone design source is actually covered", () => {
  const html = readFileSync("public/evolution-mobile/index.html", "utf8");
  it("canvas and route wrappers are pure black (no #04080d / #02070c backings left)", () => {
    expect(html).not.toMatch(/background: ?["']?#04080d/i);
    expect(html).not.toMatch(/background: ?["']?#02070c/i);
    expect(html).toMatch(/mobileCanvasStyle:\s*\{[\s\S]{0,300}background: "#000000"/);
  });
  it("cards get a full background (overrides card-style gradient images), shape untouched", () => {
    const rule = FRAME_PALETTE_CSS.split("}").find((r) => r.includes(".evo-style-card,.st-card"))!;
    expect(rule).toMatch(/\{background:linear-gradient/);
    expect(rule).not.toMatch(/border-radius|clip-path/);
  });
  it("every inline title/text/muted/surface literal still used in the phone source is themed", () => {
    for (const c of [...FRAME_TEXT_COLORS, ...FRAME_TITLE_COLORS, ...FRAME_MUTED_COLORS])
      expect(FRAME_PALETTE_CSS).toContain(`color:${c}`);
    for (const c of FRAME_SURFACE_COLORS) expect(FRAME_PALETTE_CSS).toContain(`background:${c}`);
    // Real titles from the source (Focus / Investing headers) are matched.
    for (const c of ["#eafaff", "#06d9f3"]) {
      expect(html.toLowerCase()).toContain(c);
      expect(FRAME_PALETTE_CSS).toContain(`[style^="color:${c};" i]`);
    }
  });
  it("profit/loss/warning inline colours are never recoloured", () => {
    for (const c of ["#ff9bad", "#ff9fb4", "#5fe08a", "#4fe0b0", "#f5c04a", "#ffb765", "#ff8fa5"])
      expect(FRAME_PALETTE_CSS.toLowerCase()).not.toContain(c);
  });
  it("no global image filter is installed", () => {
    expect(FRAME_PALETTE_CSS).not.toMatch(/img|filter/);
  });
});

describe("final closure: gradient cards, headings, invalid customization", () => {
  const lines = CUSTOMIZATION_CSS.split("\n");
  it("Calendar/Goals gradient card utilities (from-[#071623], from-[#081521]) get translucent palette fill + edge", () => {
    const rule = lines.find((l) => l.includes('[class*="from-[#0"]'))!;
    expect(rule).toContain("[data-planning-calendar]");
    expect(rule).toContain("[data-goals-planner]");
    expect(rule).toContain("var(--card-fill)");
    expect(rule).toContain("var(--card-line)");
    expect(rule).toContain(':not([class*="to-transparent"])');
    expect(rule).toContain(SEMANTIC_EXCLUDE);
    for (const [file, cls] of [["src/routes/calendar.tsx", "from-[#071623]"], ["src/routes/goals.tsx", "from-[#081521]"]])
      expect(readFileSync(file, "utf8")).toContain(cls);
  });
  it("ordinary headings everywhere (e.g. Business text-cyan-50 h2) follow secondary, semantic excluded", () => {
    const rule = lines.find((l) => l.startsWith("html.evo-customized :is(h1,h2,h3,h4)"))!;
    expect(rule).toContain("var(--evo-title)!important");
    expect(rule).toContain(SEMANTIC_EXCLUDE);
    expect(readFileSync("src/routes/business.tsx", "utf8")).toMatch(/<h2 className="[^"]*text-cyan-50/);
  });
  it("customization: [] is treated as absent, so the legacy seed is kept", () => {
    expect(effectiveCustomization({ theme: "green", customization: [] }).primary).toBe(LEGACY_THEME_SEEDS.green.primary);
    expect(resolvedCustomPalette([])).toBeNull();
  });
});

describe("phone closure: exact declarations, white text, planner header", () => {
  it("border-color alone never matches a text-colour selector", () => {
    expect(FRAME_PALETTE_CSS).not.toMatch(/\[style\*="color:/);
    expect(FRAME_PALETTE_CSS).toContain('[style*=";color:#4fb8ff;" i]');
    expect(FRAME_PALETTE_CSS).toContain('[style*="; color: #4fb8ff;" i]');
  });
  it("ordinary white inline text follows secondary, solid buttons excluded", () => {
    const rule = FRAME_PALETTE_CSS.split("}").find((r) => r.includes('[style^="color:#fff;" i]'))!;
    expect(rule).toContain("rgb(255, 255, 255)");
    expect(rule).toContain(":not(button)");
    expect(rule).toContain(':not([style*="background" i])');
    expect(rule).toContain(SEMANTIC_EXCLUDE);
  });
  it("phone Planner header pushes the menu to the right edge", () => {
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toMatch(/:where\(\.evo-phone-brand\) \[data-compact-navigation\] \{[^}]*margin-left: auto/);
  });
});
