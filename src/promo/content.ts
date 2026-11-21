import { TrendingUp, Utensils, Dumbbell, BookOpen, StickyNote, LineChart, Briefcase } from "lucide-react";
import businessPreview from "./business-demo.json";
import journalPreview from "./journal-demo.json";
import investingPreview from "./investing-demo.json";
import wealthPreview from "./wealth-demo.json";
const appScreenshots = [
  {
    title: "Business",
    src: businessPreview.url,
    caption: "Review projects, progress, and revenue in one workspace.",
    alt: "Evolution app guest Business screenshot with sample revenue, project progress cards, and a cumulative revenue chart",
  },
  {
    title: "Journal",
    src: journalPreview.url,
    caption: "Revisit entries, moods, and reflection tags.",
    alt: "Evolution app guest Journal screenshot with three fictional entries, mood labels, and reflection tags",
  },
  {
    title: "Investing",
    src: investingPreview.url,
    caption: "Inspect the trading calendar, P&L, accounts, and transaction history.",
    alt: "Evolution app guest Investing screenshot with a sample trading calendar, profit and loss, accounts, and transaction history",
  },
  {
    title: "Wealth",
    src: wealthPreview.url,
    caption: "Review manual financial records, net worth, and asset allocation.",
    alt: "Evolution app guest Wealth screenshot with fictional net worth, manual financial records, asset allocation, and recent transactions",
  },
];
const navigation = [
  { id: "features", label: "Philosophy" },
  { id: "system", label: "The system" },
  { id: "workflow", label: "Deep work" },
  { id: "access", label: "Access" },
  { id: "faq", label: "FAQ" },
];
const modules = [
  {
    id: "wealth",
    name: "Wealth",
    icon: TrendingUp,
    description: "Net worth, assets, and financial goals.",
    detail: "A dedicated place to bring your financial picture into focus.",
    topics: ["Net worth", "Assets", "Financial goals"],
    prompt: "What are you building toward?",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    icon: Utensils,
    description: "Daily calories, macros, and meal tracking with midnight reset.",
    detail: "Keep the day's nutrition in one view, with a fresh start at midnight.",
    topics: ["Daily calories", "Macros", "Meals"],
    prompt: "What does today look like?",
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: Dumbbell,
    description: "Workouts, PRs, and weekly sessions.",
    detail: "Bring your training sessions and personal records into the same picture.",
    topics: ["Workouts", "Personal records", "Weekly sessions"],
    prompt: "What are you working on?",
  },
  {
    id: "journal",
    name: "Journal",
    icon: BookOpen,
    description: "Daily reflection and mindset entries.",
    detail: "Make room to reflect on the day, not just move through it.",
    topics: ["Daily reflection", "Mindset entries"],
    prompt: "What is worth remembering?",
  },
  {
    id: "notes",
    name: "Notes",
    icon: StickyNote,
    description: "Capture ideas instantly.",
    detail: "A place for the ideas, plans, and insights that deserve your attention.",
    topics: ["Ideas", "Plans", "Insights"],
    prompt: "What is on your mind?",
  },
  {
    id: "investing",
    name: "Investing",
    icon: LineChart,
    description: "P&L tracking and equity curve.",
    detail: "Keep your investment results in view through P&L and your equity curve.",
    topics: ["Profit & loss", "Equity curve"],
    prompt: "What do the results tell you?",
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    description: "Projects, revenue, and business goals.",
    detail: "Keep the work you're building alongside the results you're reviewing.",
    topics: ["Projects", "Revenue", "Business goals"],
    prompt: "What deserves your focus next?",
  },
];
const faqs = [
  {
    question: "What is Evolution OS?",
    answer:
      "Evolution OS is a life operating system built around seven areas: Wealth, Nutrition, Fitness, Journal, Notes, Investing, and Business, alongside a Focus Mode for productive work. This website is a product overview, not the app itself.",
  },
  {
    question: "Can I use the dashboard on this website?",
    answer:
      "The dashboard shown here is the actual Evolution OS interface. You can enlarge the screenshot and explore the module descriptions, but this promotional website doesn't run the product or save your data.",
  },
  {
    question: "How can I get access, and what will it cost?",
    answer:
      "Access and pricing details have not yet been announced. There is no verified signup or purchase destination linked here, and no release or invitation date is promised.",
  },
  {
    question: "How do Notes and Focus Mode fit together?",
    answer:
      "The intent is a simple rhythm: capture ideas and plans in Notes, set aside time to execute in Focus Mode, then review your progress in the relevant module. It's a way to connect planning, focused effort, and reflection.",
  },
  {
    question: "What about privacy, syncing, and imports?",
    answer:
      "Verified details about product data storage, security, syncing, and supported imports are not available here yet. This website does not collect signup or contact information, and makes no guarantees about those product features.",
  },
];
const claudePromoAssets = {
  "assets/circuit-board.svg":
    "/evolution-promo/assets/original-1.svg",
  "assets/hero-reference.png":
    "/evolution-promo/assets/original-2.webp",
  "assets/m-home-scene.png":
    "/evolution-promo/assets/original-3.webp",
  "assets/m-icon-evolution.png":
    "/evolution-promo/assets/original-4.webp",
  "assets/m-icon-extremis.png":
    "/evolution-promo/assets/original-5.webp",
  "assets/dashboard-hero.jpg":
    "/evolution-promo/assets/original-6.webp",
  "assets/extremis-home.png":
    "/evolution-promo/assets/original-7.webp",
  "assets/bonsai-logo.png":
    "/evolution-promo/assets/original-8.webp",
  "assets/mountain-bg.png":
    "/evolution-promo/assets/original-9.webp",
  "public/showcase/business-demo.png":
    "/evolution-promo/assets/original-10.webp",
  "public/showcase/journal-demo.png":
    "/evolution-promo/assets/original-11.webp",
  "public/showcase/investing-demo.png":
    "/evolution-promo/assets/original-12.webp",
  "public/showcase/wealth-demo.png":
    "/evolution-promo/assets/original-13.webp",
  "assets/mobile-home.jpeg":
    "/evolution-promo/assets/original-14.webp",
  "assets/mobile-tasks.png":
    "/evolution-promo/assets/original-15.webp",
  "assets/mobile-stats.png":
    "/evolution-promo/assets/original-16.webp",
  "assets/mobile-business.png":
    "/evolution-promo/assets/original-17.webp",
  "assets/extremis-mountain.png":
    "/evolution-promo/assets/original-18.webp",
  "assets/about-bonsai.png":
    "/evolution-promo/assets/original-19.webp",
  "assets/about-icon-design.png":
    "/evolution-promo/assets/original-20.webp",
  "assets/about-icon-build.png":
    "/evolution-promo/assets/original-21.webp",
  "assets/about-icon-empower.png":
    "/evolution-promo/assets/original-22.webp",
  "assets/about-icon-evolve.png":
    "/evolution-promo/assets/original-23.webp",
  "assets/about-earth.png":
    "/evolution-promo/assets/original-24.webp",
  "assets/phil-hero.png":
    "/evolution-promo/assets/original-25.webp",
  "assets/phil-mountains.png":
    "/evolution-promo/assets/original-26.webp",
};
export { appScreenshots, claudePromoAssets, faqs, modules, navigation };

