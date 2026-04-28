import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";

interface ModuleLayoutProps {
  number: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function ModuleLayout({ number, title, subtitle, icon: Icon, children }: ModuleLayoutProps) {
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>

        <main className="flex flex-col gap-6 min-w-0">
          <div className="hud-card p-5 flex items-center gap-4 flex-wrap">
            <Link
              to="/"
              className="h-10 w-10 rounded-md border border-border flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div
              className="h-12 w-12 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: "oklch(0.65 0.28 310)",
                background: "radial-gradient(circle, oklch(0.65 0.28 310 / 0.15), transparent 70%)",
                boxShadow: "0 0 12px oklch(0.65 0.28 310 / 0.5)",
              }}
            >
              <Icon className="h-5 w-5" style={{ color: "oklch(0.78 0.28 310)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="hud-label text-xs text-muted-foreground">{number}</span>
                <h1 className="hud-label text-2xl text-primary hud-glow">{title}</h1>
              </div>
              {subtitle && <p className="text-sm text-muted-foreground mt-1 tracking-wide">{subtitle}</p>}
            </div>
            <div className="hud-label text-[10px] text-muted-foreground hidden md:block">
              Press 1–8 to jump · 0 for Dashboard
            </div>
          </div>

          {children}

          <footer className="text-center hud-label text-[10px] text-muted-foreground py-4">
            Evolution · Growing today, building forever
          </footer>
        </main>
      </div>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`hud-card hud-scan p-5 ${className}`}>
      <h2 className="hud-label text-xs text-muted-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}
