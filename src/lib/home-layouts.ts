export const layoutFilters = ["All", "Productivity", "Focused", "Data", "Minimal", "Cinematic"] as const;
type Category = (typeof layoutFilters)[number];
type Lead = "hologram" | "timer" | "week" | "modules";

function preset(id: string, name: string, category: Category, tags: string, lead: Lead, first: string[], columns: number) {
  return { id, name, category, tags, lead, first, columns };
}

export const homeLayouts = [
  preset("command", "Command Center", "Productivity", "Immersive · Modular · Control Hub", "hologram", ["Calendar", "Nutrition"], 4),
  preset("focus", "Focus Dashboard", "Focused", "Productivity · Timer · Minimal", "timer", ["Calendar", "Journal"], 3),
  preset("core", "Evolution Core", "Cinematic", "Centered · Balanced · Insight", "hologram", ["Fitness", "Wealth"], 3),
  preset("executive", "Executive Layout", "Data", "Business · Strategy · High-Level", "modules", ["Business", "Wealth", "Investing"], 3),
  preset("ring", "Holographic Ring", "Cinematic", "Orbital · Dynamic · Visual", "hologram", ["Investing", "Business"], 4),
  preset("minimal", "Minimal Focus", "Minimal", "Clean · Distraction-Free · Efficient", "timer", ["Journal", "Calendar"], 2),
  preset("growth", "Growth Dashboard", "Productivity", "Goals · Progress · All-in-One", "week", ["Fitness", "Nutrition", "Wealth"], 3),
  preset("grid", "Grid Overview", "Data", "Structured · Data-Focused · Organized", "modules", ["Wealth", "Investing", "Business"], 4),
  preset("workflow", "Workflow Hub", "Productivity", "Project · Content · Execution", "week", ["Business", "Calendar", "Journal"], 3),
  preset("analytics", "Analytics View", "Data", "Data · Performance · Tracking", "modules", ["Investing", "Wealth"], 2),
  preset("life", "Life OS", "Productivity", "Balanced · Daily Life · Planning", "week", ["Calendar", "Nutrition", "Fitness"], 4),
  preset("strategic", "Strategic Console", "Data", "Strategy · Finance · Expansion", "modules", ["Business", "Investing"], 2),
  preset("daily", "Daily Operating System", "Focused", "Routine · Habits · Consistency", "week", ["Journal", "Fitness", "Nutrition"], 3),
  preset("cinematic", "Cinematic Hub", "Cinematic", "Visual · Immersive · Focused", "hologram", ["Hobby", "Journal"], 2),
  preset("modular", "Modular Workspace", "Productivity", "Flexible · Modular · Custom", "modules", ["Calendar", "Business", "Hobby"], 3),
  preset("classic", "Classic Grid", "Minimal", "Clean · Balanced · Productive", "modules", ["Fitness", "Nutrition", "Journal"], 4),
];

export function getHomeLayout(id?: string) {
  return homeLayouts.find(layout => layout.id === id) ?? homeLayouts[0];
}
