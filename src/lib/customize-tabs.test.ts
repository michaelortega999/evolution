import { describe, expect, it } from "vitest";
import { CUSTOMIZE_TABS, normalizeCustomizeTab } from "./customize-tabs";

describe("customization navigation", () => {
  it("offers no Layout control", () => {
    expect(CUSTOMIZE_TABS.map(([id]) => id)).not.toContain("layout");
    expect(CUSTOMIZE_TABS.map(([, label]) => label)).not.toContain("Layout");
  });

  it("keeps the remaining sections", () => {
    expect(CUSTOMIZE_TABS.map(([id]) => id)).toEqual([
      "appearance",
      "cards",
      "themes",
      "advanced",
    ]);
  });

  it("refuses a stale layout link but keeps real tabs", () => {
    expect(normalizeCustomizeTab("layout")).toBeUndefined();
    expect(normalizeCustomizeTab("cards")).toBe("cards");
    expect(normalizeCustomizeTab(undefined)).toBeUndefined();
  });
});
