import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, CalendarDays, Dumbbell, HeartPulse, LineChart, NotebookPen, Plane, Wallet } from "lucide-react";

const modules = [
  { label: "Fitness", detail: "Train · Track · Progress", to: "/fitness", Icon: Dumbbell, className: "ring-panel--fitness" },
  { label: "Wealth", detail: "Net worth · Finances · Growth", to: "/wealth", Icon: Wallet, className: "ring-panel--wealth" },
  { label: "Business", detail: "Projects · Systems · Income", to: "/business", Icon: BriefcaseBusiness, className: "ring-panel--business" },
  { label: "Nutrition", detail: "Meals · Energy · Health", to: "/nutrition", Icon: HeartPulse, className: "ring-panel--nutrition" },
  { label: "Investing", detail: "Portfolio · Markets · Analytics", to: "/investing", Icon: LineChart, className: "ring-panel--investing" },
  { label: "Journal", detail: "Notes · Reflection · Growth", to: "/journal", Icon: NotebookPen, className: "ring-panel--journal" },
  { label: "Travel", detail: "Explore · Plan · Experience", to: "/hobby", Icon: Plane, className: "ring-panel--travel" },
] as const;

/** Crisp, responsive reconstruction of the supplied reference artwork. */
export function HolographicRingDashboard() {
  return <section className="ring-home" aria-label="Holographic Ring dashboard">
    <header className="ring-topbar"><div className="ring-wordmark">EVOLUTION <span>OS</span><small>HIGHER STANDARDS · BRIGHTER DAYS</small></div><div className="ring-date">OCT 11, 2026<br/><b>01:38 AM</b></div><div className="ring-world">NEW YORK&nbsp; 01:38 AM　 LONDON&nbsp; 06:38 AM　 TOKYO&nbsp; 02:38 PM</div></header>
    <aside className="ring-rail"><Link to="/" className="is-active">Home</Link><Link to="/calendar">Calendar</Link><Link to="/focus">Focus</Link><Link to="/nutrition">Nutrition</Link><Link to="/fitness">Fitness</Link><Link to="/wealth">Wealth</Link><Link to="/investing">Investing</Link><Link to="/business">Business</Link><Link to="/hobby" search={{ section: undefined }}>Hobby</Link><Link to="/journal">Journal</Link><Link to="/notes">Notes</Link><Link to="/settings">Settings</Link><strong>DISCIPLINE<br/>CREATES<br/>FREEDOM.</strong></aside>
    <main className="ring-stage">
      <div className="ring-core" aria-hidden="true"><i/><i/><i/><b>EVOLUTION CO</b><small>LIFE · EXPERIENCE · GROWTH</small></div>
      {modules.map(({ label, detail, to, Icon, className }) => <Link key={label} to={to} className={`ring-panel ${className}`}><Icon/><span><b>{label}</b><small>{detail}</small></span></Link>)}
      <Link to="/calendar" className="ring-schedule"><b>Today’s schedule</b><span>06:30 AM　Asia session prep</span><span>08:30 AM　Market prep</span><span>12:00 PM　Gym · Push</span><span>08:00 PM　Plan & journal</span></Link>
      <Link to="/wealth" className="ring-accounts"><b>Accounts snapshot</b><strong>$12,430.28</strong><span>Trading　$3,842.21　·　Banking　$1,920.14</span></Link>
      <Link to="/reports" className="ring-status"><b>System status</b><div><strong>CPU<br/><em>24%</em></strong><strong>Memory<br/><em>52%</em></strong><strong>Agents<br/><em>12/12</em></strong></div></Link>
    </main>
  </section>;
}
