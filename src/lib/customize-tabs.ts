// Customization navigation shared by the Settings route and its search validator.
//
// "layout" stays in the type and in the CustomizeWorkspace branch so the Home
// Layouts feature can be restored later, but it is deliberately NOT offered in
// CUSTOMIZE_TABS, so no in-app control can reach it and a stale ?tab=layout
// link resolves to no tab at all (the safe Appearance view).
export type CustomizeTab = "appearance" | "layout" | "cards" | "themes" | "advanced";

export const CUSTOMIZE_TABS: [CustomizeTab, string][] = [
  ["appearance", "Appearance"],
  ["cards", "Cards"],
  ["themes", "Themes"],
  ["advanced", "Advanced"],
];

/** Turns a raw URL value into an offered tab, or undefined for anything else. */
export function normalizeCustomizeTab(raw: unknown): CustomizeTab | undefined {
  return CUSTOMIZE_TABS.find(([id]) => id === raw)?.[0];
}
