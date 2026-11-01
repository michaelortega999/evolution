import type { ReactNode } from "react";
import { Sidebar } from "@/components/evolution/Sidebar";
import { AppBrandBar } from "@/components/evolution/AppBrandBar";

/** Shared responsive desktop shell with Home; compact navigation and normal-size content. */
export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell balanced-shell min-h-screen p-4 md:p-6">
      <div className="dashboard-shell mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <div className="dashboard-sidebar hidden lg:block lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>
        <main className="flex flex-col gap-6 min-w-0">
          <AppBrandBar />
          {children}
        </main>
      </div>
    </div>
  );
}
