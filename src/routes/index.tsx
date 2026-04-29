import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/evolution/Sidebar";
import { TopBar } from "@/components/evolution/TopBar";
import { BottomBar } from "@/components/evolution/BottomBar";
import { Onboarding } from "@/components/evolution/Onboarding";
import { DashboardHologram } from "@/components/evolution/DashboardHologram";
import {
  WealthCard, NutritionCard, FitnessCard, JournalCard,
  NotesCard, InvestingCard, BusinessCard, HobbyCard,
} from "@/components/evolution/ModuleCards";
import { useEvolutionData } from "@/lib/evolution-data";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evolution — Life Operating System" },
      { name: "description", content: "Discipline. Focus. Consistency. Freedom. Track wealth, fitness, nutrition, journaling, and investing in one HUD." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useEvolutionData();
  useKeyboardShortcuts();

  if (!data.profile.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>

        <main className="flex flex-col gap-6 min-w-0">
          <TopBar />

          <DashboardHologram />

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <WealthCard />
            <NutritionCard />
            <NotesCard />
            <JournalCard />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <FitnessCard />
            <InvestingCard />
            <BusinessCard />
            <HobbyCard />
          </section>

          <BottomBar />

          <footer className="text-center hud-label text-[10px] text-muted-foreground py-4">
            Evolution · Growing today, building forever
          </footer>
        </main>
      </div>
    </div>
  );
}
