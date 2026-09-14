import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import hudArtwork from "@/assets/evolution-mobile-reference.jpeg.asset.json";
import { formatMmSs, useFocusTimer } from "@/lib/use-focus-timer";

type ModuleHotspot = {
  label: string;
  to: "/wealth" | "/fitness" | "/nutrition" | "/focus" | "/investing" | "/business" | "/journal";
  x: number;
  y: number;
  size: number;
};

const MODULE_HOTSPOTS: ModuleHotspot[] = [
  { label: "Focus", to: "/focus", x: 50, y: 19.8, size: 22 },
  { label: "Nutrition", to: "/nutrition", x: 25.8, y: 23.2, size: 22 },
  { label: "Wealth", to: "/wealth", x: 74.5, y: 23.2, size: 22 },
  { label: "Fitness", to: "/fitness", x: 15.1, y: 33.5, size: 22 },
  { label: "Investing", to: "/investing", x: 84.8, y: 33.5, size: 22 },
  { label: "Journal", to: "/journal", x: 23.2, y: 44.9, size: 22 },
  { label: "Business", to: "/business", x: 76.8, y: 44.9, size: 22 },
];

const BOTTOM_LINKS = [
  { label: "Home", to: "/" as const, x: 11.4 },
  { label: "Stats", to: "/reports" as const, x: 29.8 },
  { label: "Tasks", to: "/notes" as const, x: 69.8 },
  { label: "Profile", to: "/settings" as const, x: 88 },
];

function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return (
    <div className="image-hud-date" aria-label={now.toLocaleString()}>
      <CalendarDays aria-hidden="true" />
      <div>
        <b>{now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase()}</b>
        <strong>{now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</strong>
        <span>{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

function FocusOverlay() {
  const timer = useFocusTimer();

  return (
    <>
      <Link to="/focus" className="image-hud-focus-link" aria-label="Open Focus page" />
      <output className="image-hud-timer" aria-live="polite">{formatMmSs(timer.remainingMs)}</output>
      <Button type="button" variant="ghost" className="image-hud-control image-hud-control--reset" onClick={timer.reset} aria-label="Restart focus timer" />
      <Button type="button" variant="ghost" className="image-hud-control image-hud-control--start" onClick={timer.start} aria-label="Start focus timer" />
      <Button type="button" variant="ghost" className="image-hud-control image-hud-control--pause" onClick={timer.pause} aria-label="Pause focus timer" />
    </>
  );
}

export function MobileDashboard() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="image-hud-screen md:hidden">
      <main className="image-hud-stage">
        <img className="image-hud-artwork" src={hudArtwork.url} alt="Evolution OS mobile dashboard" draggable={false} />

        <LiveDateTime />

        {MODULE_HOTSPOTS.map((module, index) => (
          <Link
            key={module.label}
            to={module.to}
            className="image-hud-module"
            aria-label={`Open ${module.label}`}
            style={{ left: `${module.x}%`, top: `${module.y}%`, width: `${module.size}%`, animationDelay: `${index * -1.4}s` }}
          >
            <span aria-hidden="true" />
          </Link>
        ))}

        <Button type="button" variant="ghost" className="image-hud-center-bonsai" onClick={scrollToTop} aria-label="Return to top" />
        <FocusOverlay />

        {BOTTOM_LINKS.map((item) => (
          <Link key={item.label} to={item.to} className="image-hud-bottom-link" style={{ left: `${item.x}%` }} aria-label={item.label} />
        ))}
        <Button type="button" variant="ghost" className="image-hud-bottom-bonsai" onClick={scrollToTop} aria-label="Return to home dashboard" />
      </main>
    </div>
  );
}