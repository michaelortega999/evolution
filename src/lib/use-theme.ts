import { useEffect } from "react";
import { useEvolutionData, type ThemeKey } from "./evolution-data";

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
}
