import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import "../styles.css";
import { useTheme } from "@/lib/use-theme";
import { FocusNotification } from "@/components/evolution/FocusNotification";
import { MobileBottomNav } from "@/components/evolution/MobileBottomNav";
import { MobileApp, useIsPhone } from "@/components/evolution/MobileApp";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Evolution — Life Operating System" },
      { name: "description", content: "Discipline. Focus. Consistency. Freedom. Track wealth, fitness, nutrition, journaling, and investing in one HUD." },
      { name: "author", content: "Evolution" },
      { property: "og:title", content: "Evolution — Life Operating System" },
      { property: "og:description", content: "Track wealth, fitness, nutrition, journaling, investing, and habits in one HUD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useTheme();
  const isPhone = useIsPhone();
  if (isPhone) return <MobileApp />;
  return (
    <>
      <Outlet />
      <MobileBottomNav fixed />
      <FocusNotification />
      <Toaster theme="dark" position="top-right" />
    </>
  );
}
