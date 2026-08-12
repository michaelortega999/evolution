import type { EvoHabit } from "@/lib/evolution-data";

export const DEFAULT_HABITS: EvoHabit[] = [
  { id: "workout",   name: "Work Out",         category: "Fitness",   emoji: "🏋️", timeFactor: { minutes: 60, module: "Fitness" } },
  { id: "deficit",   name: "Eat in a Deficit", category: "Nutrition", emoji: "🍎" },
  { id: "wealthadv", name: "Do 1 Wealth Advancing Activity", category: "Wealth", emoji: "💵", timeFactor: { minutes: 20, module: "Wealth" } },
  { id: "bible",     name: "Bible Study",      category: "Hobby",     emoji: "📖" },
  { id: "trade",     name: "Trade Futures",    category: "Investing", emoji: "📈", timeFactor: { minutes: 30, module: "Investing" } },
  { id: "coldcall",  name: "Cold Calls",       category: "Business",  emoji: "💰" },
  { id: "evolution", name: "Build Evolution",  category: "Business",  emoji: "💻", timeFactor: { minutes: 90, module: "Business" } },
  { id: "journal",   name: "Journal",          category: "Journal",   emoji: "✍️" },
];

/** Visible habits, ordered by habitOrder then the rest. */
export function resolveHabits(
  customHabits: EvoHabit[] = [],
  habitOrder: string[] = [],
  hiddenHabits: string[] = [],
): EvoHabit[] {
  const combined = [...DEFAULT_HABITS, ...customHabits].filter((h) => !hiddenHabits.includes(h.id));
  const map = new Map(combined.map((h) => [h.id, h]));
  const out: EvoHabit[] = [];
  for (const id of habitOrder) {
    const h = map.get(id);
    if (h) { out.push(h); map.delete(id); }
  }
  return [...out, ...map.values()];
}
