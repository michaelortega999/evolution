import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import mobileHud from "@/assets/evolution-mobile-hud-cropped.webp.asset.json";
import { formatMmSs, useFocusTimer } from "@/lib/use-focus-timer";

type Hotspot = {
  label: string;
  to: "/wealth" | "/fitness" | "/nutrition" | "/focus" | "/investing" | "/business" | "/journal";
  x: number;
  y: number;
  size: number;
};

const MODULE_HOTSPOTS: Hotspot[] = [
  { label: "Focus", to: "/focus", x: 50, y: 16.9, size: 17 },
  { label: "Nutrition", to: "/nutrition", x: 25.5, y: 20.9, size: 18 },
  { label: "Wealth", to: "/wealth", x: 74.6, y: 20.9, size: 18 },
  { label: "Fitness", to: "/fitness", x: 14.5, y: 31.9, size: 18 },
  { label: "Investing", to: "/investing", x: 85.9, y: 31.9, size: 18 },
  { label: "Journal", to: "/journal", x: 23.2, y: 41.6, size: 18 },
  { label: "Business", to: "/business", x: 76.8, y: 41.6, size: 18 },
];

const BOTTOM_LINKS = [
  { label: "Home", to: "/" as const, x: 11.2 },
  { label: "Stats", to: "/reports" as const, x: 29.6 },
  { label: "Tasks", to: "/notes" as const, x: 69 },
  { label: "Profile", to: "/settings" as const, x: 89 },
];

function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const weekday = now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase();
  const date = now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="mobile-image-date" aria-label={`${weekday}, ${date}, ${time}`}>
      <span>{weekday}</span>
      <strong>{date}</strong>
      <span>{time}</span>
    </div>
  );
}

function FocusTimerOverlay() {
  const timer = useFocusTimer();

  return (
    <>
      <Link
        to="/focus"
        aria-label="Open Focus"
        className="mobile-image-focus-link absolute"
      />
      <output className="mobile-image-timer" aria-live="polite">
        {formatMmSs(timer.remainingMs)}
      </output>
      <button
        type="button"
        aria-label="Restart focus timer"
        className="mobile-image-control mobile-image-control--reset"
        onClick={timer.reset}
      />
      <button
        type="button"
        aria-label="Start focus timer"
        className="mobile-image-control mobile-image-control--start"
        onClick={timer.start}
      />
      <button
        type="button"
        aria-label="Pause focus timer"
        className="mobile-image-control mobile-image-control--pause"
        onClick={timer.pause}
      />
    </>
  );
}

export function MobileDashboard() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="mobile-image-screen md:hidden">
      <main className="mobile-image-stage">
        <img
          src={mobileHud.url}
          alt="Evolution OS mobile dashboard"
          className="mobile-image-art"
          draggable={false}
        />

        <LiveDateTime />

        {MODULE_HOTSPOTS.map(({ label, to, x, y, size }, index) => (
          <Link
            key={label}
            to={to}
            aria-label={`Open ${label}`}
            className="mobile-image-module"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}%`,
              animationDelay: `${index * -1.35}s`,
            }}
          >
            <span className="mobile-image-module__ring" />
          </Link>
        ))}

        <button
          type="button"
          aria-label="Return to top"
          onClick={scrollToTop}
          className="mobile-image-bonsai"
        />

        <FocusTimerOverlay />

        {BOTTOM_LINKS.map(({ label, to, x }) => (
          <Link
            key={label}
            to={to}
            aria-label={label}
            className="mobile-image-bottom-link"
            style={{ left: `${x}%` }}
          />
        ))}
        <button
          type="button"
          aria-label="Home hub"
          onClick={scrollToTop}
          className="mobile-image-bottom-bonsai"
        />
      </main>
    </div>
  );
}