import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const MODULE_ROUTES = [
  { key: "1", to: "/wealth" as const, label: "Wealth" },
  { key: "2", to: "/nutrition" as const, label: "Nutrition" },
  { key: "3", to: "/fitness" as const, label: "Fitness" },
  { key: "4", to: "/journal" as const, label: "Journal" },
  { key: "5", to: "/notes" as const, label: "Notes" },
  { key: "6", to: "/investing" as const, label: "Investing" },
  { key: "7", to: "/business" as const, label: "Business" },
  { key: "8", to: "/hobby" as const, label: "Hobby" },
];

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "0") {
        navigate({ to: "/" });
        return;
      }
      const match = MODULE_ROUTES.find((m) => m.key === e.key);
      if (match) {
        e.preventDefault();
        navigate({ to: match.to });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
}
