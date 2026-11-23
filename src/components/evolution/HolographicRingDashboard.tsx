import { Link } from "@tanstack/react-router";
import ringReference from "@/assets/holographic-ring-layout.jpeg";

/** Exact visual layout with transparent, keyboard-accessible module controls. */
export function HolographicRingDashboard() {
  const controls = [
    ["Fitness", "/fitness"], ["Wealth", "/wealth"], ["Business", "/business"], ["Nutrition", "/nutrition"],
    ["Investing", "/investing"], ["Journal", "/journal"], ["Travel", "/hobby"], ["Calendar", "/calendar"],
    ["Today's schedule", "/calendar"], ["Accounts snapshot", "/wealth"], ["System status", "/reports"],
  ] as const;
  return <section className="ring-home" aria-label="Holographic Ring dashboard">
    <img className="ring-home-reference" src={ringReference} alt="Holographic Ring Evolution OS dashboard" draggable={false} />
    {controls.map(([label, to]) => <Link key={label} to={to} className={`ring-hotspot ring-hotspot--${label.toLowerCase().replaceAll("'", "").replaceAll(" ", "-")}`}>
      <span>{label}</span>
    </Link>)}
  </section>;
}
