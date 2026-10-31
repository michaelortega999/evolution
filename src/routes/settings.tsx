import { resolvePalette } from "@/lib/theme-palette";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Database,
  Palette,
  Trash2,
  Download,
  Timer,
  Check,
  Layers,
  Sparkles,
  ChevronRight,
  Cloud,
  Shield,
  CreditCard,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Globe,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/evolution/Sidebar";
import { BrandMark } from "@/components/evolution/BrandMark";
import { AppBrandBar } from "@/components/evolution/AppBrandBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEvolutionData, useCloudStatus, type ThemeKey } from "@/lib/evolution-data";
import {
  THEME_OPTIONS,
  applyTheme,
  CUSTOMIZATION_DEFAULTS,
  CUSTOMIZATION_PRESETS,
  BLACK_NEON_PRESET,
  effectiveCustomization,
  normalizeCustomization,
  customizationStyle,
  CUSTOMIZATION_CSS,
} from "@/lib/use-theme";
import customizeMountain from "@/assets/calendar-mountain.jpg";
import { cn, localISO, CARD_STYLES, normalizeCardStyle } from "@/lib/utils";
import { BankConnectionPanel } from "@/components/evolution/BankConnectionPanel";

type SettingsView = "profile" | "customize" | "settings";
export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): { view?: SettingsView } => ({
    view: search.view === "customize" || search.view === "settings" ? search.view : "profile",
  }),
  head: () => ({
    meta: [
      { title: "Settings — Evolution OS" },
      {
        name: "description",
        content: "Your profile, preferences and data controls in Evolution OS.",
      },
    ],
  }),
  component: SettingsPage,
});

const syncLabels = {
  "signed-out": "Device only",
  loading: "Loading saved data…",
  synced: "Account data synced",
  saving: "Saving changes…",
  error: "Sync unavailable",
};
function GlassPanel({
  title,
  icon,
  children,
  className = "",
  id,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`es-panel ${className}`}>
      <h2>
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
function SettingsPage() {
  const { data, mutate, updateProfile, reset } = useEvolutionData();
  const cloud = useCloudStatus();
  const loading = cloud === "loading";
  const { view = "profile" } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [name, setName] = useState(data.profile.name);
  const nameTouched = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const focusNameAfterNavigation = useRef(false);
  useEffect(() => {
    if (focusNameAfterNavigation.current && nameInput.current) {
      nameInput.current.focus();
      focusNameAfterNavigation.current = false;
    }
  }, [query, view]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [zone, setZone] = useState("Detecting device time zone…");
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable");
  }, []);
  useEffect(() => {
    if (!nameTouched.current) setName(data.profile.name);
  }, [data.profile.name]);
  useEffect(() => {
    setConfirmClear(false);
  }, [view]);
  useEffect(() => {
    const clear = () => {
      nameTouched.current = false;
      setName("");
      setConfirmClear(false);
    };
    window.addEventListener("evolution:owner-changing", clear);
    return () => window.removeEventListener("evolution:owner-changing", clear);
  }, []);
  const settings = data.settings;
  const fs = data.focusSettings;
  const setTheme = (theme: ThemeKey) => {
    if (loading) return;
    applyTheme(theme);
    mutate((p) => ({ settings: { ...p.settings, theme, customization: null } }));
  };
  const toggleNotif = (key: keyof typeof settings.notifications) =>
    mutate((p) => ({
      settings: {
        ...p.settings,
        notifications: { ...p.settings.notifications, [key]: !p.settings.notifications[key] },
      },
    }));
  const updateFocusSettings = (patch: Partial<typeof fs>) =>
    mutate((p) => ({ focusSettings: { ...p.focusSettings, ...patch } }));
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-data-${localISO(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Export downloaded.");
  };
  const matches = (terms: string) => !query.trim() || terms.toLowerCase().includes(query.trim().toLowerCase());
  const show = (section: SettingsView, terms: string) =>
    matches(terms) && (query.trim() || view === "profile" || view === section);
  const hasResults = [
    "profile overview name edit member",
    "workspace account sync preferences theme accent focus timer",
    "quick actions billing privacy security support",
    "preferences language time zone theme accent",
    "integrations bank connection google calendar notion tradingview strava ai services",
    "data management export clear reset backup history import",
    "notifications reminders alerts",
    "card appearance customize design",
    "focus timer short long break durations rounds",
    "customize theme colors primary secondary preset background glass grid minimal gradient mountain glow blur animations dark live preview",
  ].some(matches);
  return (
    <div className="es-shell">
      <style>{settingsCss}</style>
      <div className="es-frame">
        <aside className="es-sidebar">
          <Sidebar />
        </aside>
        <main className="es-main">
          <div className="es-brandbar">
            <BrandMark />
            <span className="es-brand-context">PERSONAL OPERATING SYSTEM</span>
            <AppBrandBar />
          </div>
          <header className="es-toolbar">
            <div className="es-title">
              <SettingsIcon aria-hidden="true" />
              <div>
                <h1>SETTINGS</h1>
                <p>PERSONALIZE. OPTIMIZE. CONTROL.</p>
              </div>
            </div>
            <nav className="es-tabs" aria-label="Settings views">
              {(
                [
                  ["profile", User, "Profile"],
                  ["customize", Palette, "Customize"],
                  ["settings", SettingsIcon, "Settings"],
                ] as const
              ).map(([tab, Icon, label]) => (
                <Link
                  key={tab}
                  to="/settings"
                  search={{ view: tab }}
                  aria-current={view === tab ? "page" : undefined}
                  onClick={() => setQuery("")}
                >
                  <Icon size={21} />
                  {label}
                </Link>
              ))}
            </nav>
            <label className="es-search">
              <Search size={18} />
              <input
                aria-label="Search settings"
                placeholder="Search settings…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  ×
                </button>
              )}
            </label>
          </header>
          <div className="es-status" role="status">
            <span className={`es-dot ${cloud === "error" ? "es-dot-error" : ""}`} />
            {syncLabels[cloud]}
            <span>YOUR SPACE. YOUR WAY.</span>
          </div>
          {query && <p className="es-search-note">Results for “{query}” across all settings.</p>}
          {!hasResults && (
            <GlassPanel title="No matching settings">
              <p>Try profile, theme, timer, notifications or data.</p>
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </GlassPanel>
          )}
          <div className="es-grid">
            {(view === "customize" || !!query) &&
              matches(
                "customize theme colors primary secondary preset background glass grid minimal gradient mountain glow blur animations dark live preview",
              ) && <CustomizeWorkspace />}
            {(view === "profile" || !!query) && matches("profile overview name edit member") && (
              <GlassPanel title="Profile Overview" className="es-profile">
                <div className="es-person">
                  <div className="es-avatar">
                    <User size={42} />
                    <span>
                      <Sparkles size={13} />
                    </span>
                  </div>
                  <div>
                    <h3>{loading ? "Loading profile…" : data.profile.name || "Your profile"}</h3>
                    <p>Evolution OS member</p>
                    <span className="es-tag">PERSONAL WORKSPACE</span>
                  </div>
                </div>
                <blockquote>“Higher standards. Brighter days.”</blockquote>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (loading) return;
                    if (!name.trim()) {
                      toast.error("Name can't be empty.");
                      return;
                    }
                    updateProfile({ name: name.trim() });
                    nameTouched.current = false;
                    toast.success("Profile saved.");
                  }}
                >
                  <label htmlFor="es-name">Display name</label>
                  <div className="es-name-edit">
                    <Input
                      id="es-name"
                      ref={nameInput}
                      value={name}
                      disabled={loading}
                      maxLength={60}
                      onChange={(e) => {
                        nameTouched.current = true;
                        setName(e.target.value);
                      }}
                    />
                    <Button disabled={loading} type="submit">
                      Save
                    </Button>
                  </div>
                </form>
                <dl className="es-details">
                  <div>
                    <dt>Time zone</dt>
                    <dd>
                      {zone}
                      <small>From this device</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Profile details</dt>
                    <dd>
                      Display name only
                      <small>Email and account changes are not managed here.</small>
                    </dd>
                  </div>
                </dl>
              </GlassPanel>
            )}
            {(view === "profile" || !!query) &&
              matches("workspace account sync preferences theme accent focus timer") && (
                <GlassPanel title="Workspace Overview" className="es-overview">
                  <div className="es-facts">
                    <div>
                      <Palette />
                      <span>
                        Accent
                        <strong>{THEME_OPTIONS.find((t) => t.key === settings.theme)?.label || "Default"}</strong>
                      </span>
                    </div>
                    <div>
                      <Timer />
                      <span>
                        Focus session
                        <strong>
                          {fs.focusMin} <small>min</small>
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Layers />
                      <span>
                        Card design
                        <strong>
                          {CARD_STYLES.find((s) => s.id === normalizeCardStyle(settings.cardStyle))?.name || "Default"}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Cloud />
                      <span>
                        Data status<strong>{syncLabels[cloud]}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="es-sync-box">
                    <Cloud size={28} />
                    <div>
                      <h3>Your system, connected</h3>
                      <p>
                        {cloud === "synced"
                          ? "Your app data is synced to your signed-in account."
                          : cloud === "error"
                            ? "Changes are kept on this device while account sync is unavailable."
                            : cloud === "signed-out"
                              ? "Changes stay on this device until you sign in."
                              : "Your account sync is in progress."}
                      </p>
                    </div>
                  </div>
                  <p className="es-footnote">
                    Sync is not a versioned backup. Export a copy of your data when you need one.
                  </p>
                </GlassPanel>
              )}
            {(view === "profile" || !!query) && matches("quick actions billing privacy security support") && (
              <GlassPanel title="Quick Actions" className="es-quick">
                <Link
                  className="es-action"
                  to="/settings"
                  search={{ view: "profile" }}
                  hash="es-name"
                  onClick={() => {
                    focusNameAfterNavigation.current = true;
                    setQuery("");
                    if (nameInput.current) {
                      nameInput.current.focus();
                      focusNameAfterNavigation.current = false;
                    }
                  }}
                >
                  <User />
                  <span>Edit Profile</span>
                  <ChevronRight />
                </Link>
                <Link className="es-action" to="/settings" search={{ view: "customize" }} onClick={() => setQuery("")}>
                  <Palette />
                  <span>Customize Workspace</span>
                  <ChevronRight />
                </Link>
                <Link
                  className="es-action"
                  to="/settings"
                  search={{ view: "settings" }}
                  hash="es-notifications"
                  onClick={() => setQuery("")}
                >
                  <Bell />
                  <span>Notifications</span>
                  <ChevronRight />
                </Link>
                <Link
                  className="es-action"
                  to="/settings"
                  search={{ view: "settings" }}
                  hash="es-data"
                  onClick={() => setQuery("")}
                >
                  <Cloud />
                  <span>Data & Sync</span>
                  <ChevronRight />
                </Link>
                <div className="es-unavailable">
                  <CreditCard />
                  <span>
                    Payment & Billing<small>Not available in this app</small>
                  </span>
                </div>
                <div className="es-unavailable">
                  <Shield />
                  <span>
                    Privacy & Security<small>Account controls are not available here</small>
                  </span>
                </div>
              </GlassPanel>
            )}
            {view !== "customize" && show("customize", "preferences language time zone theme accent") && (
              <GlassPanel title="Preferences" icon={<SlidersHorizontal size={18} />} className="es-preferences">
                <div className="es-pref-line">
                  <Globe />
                  <span>Language</span>
                  <strong>
                    English<small>App interface</small>
                  </strong>
                </div>
                <div className="es-pref-line">
                  <Palette />
                  <span>Color accent</span>
                  <strong>{THEME_OPTIONS.find((t) => t.key === settings.theme)?.label}</strong>
                </div>
                <div className="es-swatches" role="group" aria-label="Accent color">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      title={opt.label}
                      aria-label={opt.label}
                      aria-pressed={settings.theme === opt.key}
                      disabled={loading}
                      onClick={() => setTheme(opt.key)}
                    >
                      <span style={{ background: opt.swatch }}>
                        {settings.theme === opt.key && <Check size={16} className="es-swatch-check" />}
                      </span>
                      <small>{opt.label}</small>
                    </button>
                  ))}
                </div>
                <div className="es-pref-line">
                  <Timer />
                  <span>Time zone</span>
                  <strong>
                    {zone}
                    <small>Device setting</small>
                  </strong>
                </div>
                <p className="es-footnote" role="note">
                  {settings.customization
                    ? "Your Customize colours are active and take priority over this accent everywhere, including the phone view. "
                    : "This accent sets the card glass, neon edges and text on a black page, including the phone view. "}
                  <Link to="/settings" search={{ view: "customize" }}>
                    Change colours in Customize
                  </Link>
                  . Saved automatically.
                </p>
              </GlassPanel>
            )}
            {show("settings", "integrations bank connection google calendar notion tradingview strava ai services") && (
              <GlassPanel title="Integrations" className="es-integrations">
                <p className="es-footnote">External service connections are not configured in this settings page.</p>
                {[
                  ["GC", "Google Calendar"],
                  ["N", "Notion"],
                  ["TV", "TradingView"],
                  ["S", "Strava"],
                  ["AI", "AI services"],
                ].map(([mark, label]) => (
                  <div className="es-integration" key={label}>
                    <span className="es-service">{mark}</span>
                    <span>{label}</span>
                    <small>Not configured here</small>
                  </div>
                ))}
                <Link
                  className="es-inline-link"
                  to="/settings"
                  search={{ view: "settings" }}
                  hash="es-bank"
                  onClick={() => setQuery("")}
                >
                  Bank connection settings <ArrowUpRight size={15} />
                </Link>
              </GlassPanel>
            )}
            {show("settings", "data management export clear reset backup history import") && (
              <GlassPanel title="Data Management" id="es-data" className="es-data">
                <button className="es-action" disabled={loading} onClick={exportData}>
                  <Download />
                  <span>
                    Export Data<small>Download your app data as JSON</small>
                  </span>
                  <ChevronRight />
                </button>
                <div className="es-unavailable">
                  <Cloud />
                  <span>
                    Backup history<small>No versioned backup service is available</small>
                  </span>
                </div>
                <div className="es-unavailable">
                  <Database />
                  <span>
                    Import Data<small>Import is not implemented</small>
                  </span>
                </div>
                <div className="es-danger">
                  <h3>
                    <Trash2 size={17} />
                    Reset app data
                  </h3>
                  <p>
                    Clears cloud-synced app data, including phone tasks and calendar. This does not delete your account.
                  </p>
                  {confirmClear ? (
                    <div role="alert">
                      <strong>This cannot be undone. Export a copy first.</strong>
                      <div className="es-reset-buttons">
                        <Button variant="outline" onClick={() => setConfirmClear(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={loading}
                          onClick={() => {
                            reset();
                            nameTouched.current = false;
                            setConfirmClear(false);
                            toast.success("All data cleared, including phone tasks and calendar.");
                          }}
                        >
                          Confirm Clear All Data
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button disabled={loading} onClick={() => setConfirmClear(true)}>
                      Clear All Data <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </GlassPanel>
            )}
            {show("settings", "notifications reminders alerts") && (
              <GlassPanel
                title="Notifications"
                icon={<Bell size={18} />}
                id="es-notifications"
                className="es-notifications"
              >
                <p className="es-footnote">
                  Your choices are saved. Reminder delivery isn't set up yet, so no alerts are sent.
                </p>
                {(
                  [
                    ["daily", "Daily progress reminders"],
                    ["goals", "Goal milestone alerts"],
                    ["journal", "Journal prompts"],
                  ] as const
                ).map(([key, label]) => (
                  <div className="es-toggle-row" key={key}>
                    <span>{label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-label={label}
                      aria-checked={settings.notifications[key]}
                      disabled={loading}
                      onClick={() => toggleNotif(key)}
                      className="es-switch"
                    >
                      <span />
                    </button>
                  </div>
                ))}
              </GlassPanel>
            )}
            {show("customize", "focus timer short long break durations rounds") && (
              <GlassPanel title="Focus Timer" icon={<Timer size={18} />} className="es-timer">
                <p className="es-footnote">Build a rhythm that works for you.</p>
                <div className="es-timer-grid">
                  {(
                    [
                      ["focusMin", "Focus (min)"],
                      ["shortMin", "Short break (min)"],
                      ["longMin", "Long break (min)"],
                      ["longEvery", "Long every (rounds)"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <Input
                        type="number"
                        min={1}
                        disabled={loading}
                        value={fs[key]}
                        onChange={(e) => updateFocusSettings({ [key]: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </label>
                  ))}
                </div>
              </GlassPanel>
            )}
            {(view !== "profile" || !!query) && show("customize", "card appearance customize design") && (
              <div className="es-appearance">
                <CardAppearance />
              </div>
            )}
            {(view === "settings" || !!query) && matches("bank connection integrations") && (
              <div className="es-bank" id="es-bank">
                <BankConnectionPanel />
              </div>
            )}
          </div>
          {view === "profile" && !query && (
            <div id="es-bank" className="es-bank">
              <BankConnectionPanel />
            </div>
          )}
          <footer className="es-footer">
            <span>EVOLUTION OS</span>
            <span>Higher standards. Brighter days.</span>
            <Link to="/">
              Back to Dashboard <ChevronRight size={14} />
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

function CustomizeWorkspace() {
  const { data, mutate } = useEvolutionData();
  const cloud = useCloudStatus();
  const disabled = cloud === "loading";
  const appearance = effectiveCustomization(data.settings);
  const palette = resolvePalette(appearance);
  const blackNeonActive =
    appearance.primary === BLACK_NEON_PRESET.customization.primary &&
    appearance.secondary === BLACK_NEON_PRESET.customization.secondary &&
    appearance.background === BLACK_NEON_PRESET.customization.background;
  const restoreBlackNeon = () => {
    if (disabled) return;
    mutate((previous) => ({
      settings: {
        ...previous.settings,
        cardStyle: BLACK_NEON_PRESET.cardStyle,
        customization: {
          ...effectiveCustomization(previous.settings),
          ...BLACK_NEON_PRESET.customization,
        },
      },
    }));
  };
  const update = (patch: Partial<typeof appearance> | ((current: typeof appearance) => Partial<typeof appearance>)) => {
    if (disabled) return;
    mutate((previous) => ({
      settings: {
        ...previous.settings,
        customization: {
          ...effectiveCustomization(previous.settings),
          ...(typeof patch === "function" ? patch(effectiveCustomization(previous.settings)) : patch),
        },
      },
    }));
  };
  const backgrounds = [
    ["glass", "Glass", "Layered blue glass"],
    ["grid", "Tech Grid", "Precision grid"],
    ["minimal", "Minimal", "A quiet, solid canvas"],
    ["gradient", "Gradient", "Soft color atmosphere"],
    ["landscape", "Mountain", "Black canvas has priority: the page stays black"],
  ] as const;
  return (
    <section className="ec-workspace" aria-label="Customize workspace">
      <style>
        {customizeCss}
        {CUSTOMIZATION_CSS}
      </style>
      <GlassPanel title="THEME & COLORS" icon={<Palette size={20} />} className="ec-controls">
        <p className="ec-subtitle">Choose your visual identity.</p>
        <div className="ec-color-grid">
          {(
            [
              ["primary", "Primary Color", "Tints the translucent card glass, neon edges and glow. The page behind cards stays black in every scheme."],
              [
                "secondary",
                "Secondary Color",
                "Text, titles, icons and highlights. Contrast is protected automatically.",
              ],
            ] as const
          ).map(([key, title, description]) => (
            <div className="ec-color-box" key={key}>
              <h3>{title}</h3>
              <p>{description}</p>
              <label className="ec-color-picker" style={{ background: appearance[key] }}>
                <span className="sr-only">{title}</span>
                <input
                  aria-label={title}
                  type="color"
                  value={appearance[key]}
                  disabled={disabled}
                  onChange={(e) => update({ [key]: e.target.value })}
                />
                <span aria-hidden="true" style={{ background: appearance[key] }} />
              </label>
              <div className="ec-color-swatches" role="group" aria-label={`${title} choices`}>
                {CUSTOMIZATION_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    aria-label={`${title}: ${preset.label}`}
                    aria-pressed={appearance[key] === preset.primary}
                    disabled={disabled}
                    style={{ background: preset.primary }}
                    onClick={() => update({ [key]: preset.primary })}
                  >
                    {appearance[key] === preset.primary && <Check size={18} className="es-swatch-check" />}
                  </button>
                ))}
                {key === "secondary" && (
                  <button
                    type="button"
                    aria-label="Secondary Color: readable neutral"
                    disabled={disabled}
                    aria-pressed={appearance.secondary === CUSTOMIZATION_DEFAULTS.secondary}
                    style={{ background: CUSTOMIZATION_DEFAULTS.secondary }}
                    onClick={() => update({ secondary: CUSTOMIZATION_DEFAULTS.secondary })}
                  >
                    {appearance.secondary === CUSTOMIZATION_DEFAULTS.secondary && (
                      <Check size={18} className="es-swatch-check" />
                    )}
                  </button>
                )}
              </div>
              <div className="ec-color-value">
                <span style={{ background: appearance[key] }} />
                <code>{appearance[key].toUpperCase()}</code>
                <Palette size={14} />
              </div>
              {key === "secondary" && palette.secondaryAdjusted && (
                <p className="ec-adjusted" role="status">
                  Chosen {appearance.secondary.toUpperCase()} is too faint on these cards, so text is shown as{" "}
                  <code>{palette.text.toUpperCase()}</code> (contrast {palette.contrast}:1).
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="ec-section-heading">
          <h3>PRESET THEMES</h3>
          <p>Apply a coordinated pair of colors.</p>
        </div>
        <div className="ec-presets" role="group" aria-label="Preset themes">
          {CUSTOMIZATION_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              disabled={disabled}
              aria-pressed={appearance.primary === preset.primary && appearance.secondary === preset.secondary}
              onClick={() => update({ primary: preset.primary, secondary: preset.secondary })}
              style={{ "--ec-preset": preset.primary } as React.CSSProperties}
            >
              <span className="ec-preset-art">
                <i />
                <i />
                <i />
              </span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
        <div className="ec-black-neon">
          <div>
            <strong>Black Neon</strong>
            <span>Original look: near-black cards, pale text, blue neon outlines, minimal background, classic frames.</span>
          </div>
          <button type="button" disabled={disabled} aria-pressed={blackNeonActive} onClick={restoreBlackNeon}>
            {blackNeonActive ? "Black Neon active" : "Restore Black Neon"}
          </button>
        </div>
        <div className="ec-section-heading">
          <h3>BACKGROUND STYLE</h3>
          <p>Set the canvas behind your workspace.</p>
        </div>
        <div className="ec-backgrounds" role="group" aria-label="Background style">
          {backgrounds.map(([id, label, description]) => (
            <button
              type="button"
              key={id}
              title={description}
              aria-pressed={appearance.background === id}
              disabled={disabled}
              onClick={() => update({ background: id })}
            >
              <span
                className={`ec-background-thumb ec-bg-${id}`}
                style={id === "landscape" ? { backgroundImage: `url(${customizeMountain})` } : undefined}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="ec-note">
          No image upload or external image service is needed. The page is always pure black. Glass, Tech Grid and Gradient add a barely visible grey texture; Minimal and Mountain keep it plain black.
        </p>
      </GlassPanel>
      <div className="ec-right">
        <GlassPanel title="LIVE PREVIEW" className="ec-preview-panel">
          <div className="ec-preview-intro">
            <p>See your style change in real time.</p>
            <button type="button" disabled={disabled} onClick={() => update({ ...CUSTOMIZATION_DEFAULTS })}>
              <RotateCcw size={14} />
              Reset appearance
            </button>
          </div>
          <div
            className="ec-live evo-customized"
            style={customizationStyle(appearance)}
            data-evo-background={appearance.background}
            data-evo-dark={String(appearance.dark)}
            data-evo-animations={String(appearance.animations)}
          >
            <div className="ec-live-header">
              <BrandMark compact />
              <span>
                <Search size={15} />
                <Bell size={15} />
                <User size={15} />
              </span>
            </div>
            <p className="ec-sample-label">STYLE SAMPLE · NOT ACCOUNT DATA</p>
            <div
              className="ec-hero"
              style={{
                backgroundImage: `linear-gradient(0deg,rgba(0,8,20,.8),transparent 70%), url(${customizeMountain})`,
              }}
            >
              <div>
                <span>YOUR NEXT CHAPTER</span>
                <strong>Built around you.</strong>
                <p>Plan. Focus. Evolve.</p>
              </div>
            </div>
            <div className="ec-sample-cards">
              {(
                [
                  [Timer, "Focus"],
                  [Sparkles, "Create"],
                  [Layers, "Organize"],
                  [Globe, "Explore"],
                ] as const
              ).map(([Icon, label]) => (
                <div key={label} className="ec-sample-card">
                  <Icon size={29} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="ec-preview-line">
              <span />
              Make space for what matters.
            </div>
          </div>
          <p className="ec-note">
            The sample shows appearance only. No activity, progress or financial figures are simulated.
          </p>
        </GlassPanel>
        <GlassPanel title="ADVANCED OPTIONS" icon={<SlidersHorizontal size={18} />} className="ec-advanced">
          {(
            [
              ["glass", "Glass Effect Intensity"],
              ["glow", "Card Border Glow"],
              ["blur", "Global Blur"],
            ] as const
          ).map(([key, label]) => (
            <label className="ec-slider-row" key={key}>
              <span>{label}</span>
              <input
                aria-label={label}
                type="range"
                min="0"
                max="100"
                step="1"
                value={appearance[key]}
                disabled={disabled}
                onChange={(e) => update({ [key]: Number(e.target.value) })}
              />
              <output>{appearance[key]}%</output>
            </label>
          ))}
          {(
            [
              ["animations", "Animations"],
              ["dark", "Deep glass cards (off = lighter glass; page stays black)"],
            ] as const
          ).map(([key, label]) => (
            <div className="ec-toggle-row" key={key}>
              <span>{label}</span>
              <button
                type="button"
                role="switch"
                aria-label={label}
                aria-checked={appearance[key]}
                className="es-switch"
                disabled={disabled}
                onClick={() => update((current) => ({ [key]: !current[key] }))}
              >
                <span />
              </button>
            </div>
          ))}
          <p className="ec-note">
            System reduced-motion preferences take priority. Styles apply to native app surfaces; the separate legacy
            phone screens and embedded artwork keep their own styling.
          </p>
          <p className="ec-save" role="status">
            {cloud === "loading"
              ? "Loading your saved appearance…"
              : cloud === "saving"
                ? "Saving appearance…"
                : cloud === "error"
                  ? "Saved on this device. Account sync is unavailable."
                  : cloud === "signed-out"
                    ? "Saved on this device only."
                    : "Appearance saves automatically to your account."}
          </p>
        </GlassPanel>
      </div>
    </section>
  );
}

const customizeCss = `
.ec-workspace{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:16px;align-items:start}.ec-workspace .es-panel h2{font-size:16px;letter-spacing:.05em;margin-bottom:5px;color:var(--es-text)}.ec-subtitle{margin:0 0 18px;font-size:12px}.ec-color-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ec-color-box{padding:14px;border:1px solid var(--es-line);border-radius:7px;background:#04132280}.ec-color-box h3{font-size:13px}.ec-color-box p{font-size:11px;min-height:52px;margin:8px 0 12px;line-height:1.6}.ec-color-picker{display:flex;height:39px;position:relative;border:1px solid #6ec3ff50;border-radius:5px;overflow:hidden;box-shadow:0 0 13px #008cff25}.ec-color-picker input{opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer;z-index:1}.ec-color-picker:focus-within{outline:2px solid #a6dfff;outline-offset:3px}.ec-color-picker>span:last-child{width:19px;height:19px;border:2px solid #ffffff80;border-radius:50%;margin:auto 11px auto auto;box-shadow:0 0 0 8px #0004}.ec-color-swatches{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:12px 0}.ec-color-swatches button{height:26px;border-radius:4px;border:1px solid #ffffff25;display:grid;place-items:center}.ec-color-swatches button[aria-pressed=true]{outline:2px solid #afe5ff;outline-offset:2px}.ec-color-value{display:flex;align-items:center;gap:8px;border:1px solid var(--es-line);border-radius:4px;padding:7px 9px;background:#020b1480}.ec-color-value>span{width:15px;height:15px;border-radius:50%;border:1px solid #ffffff50}.ec-color-value code{font-size:11px;color:var(--es-text)}.ec-color-value svg{margin-left:auto;color:var(--es-blue)}.ec-section-heading{padding-top:21px;margin-top:18px;border-top:1px solid var(--es-line)}.ec-section-heading h3{font-size:12px;letter-spacing:.04em}.ec-section-heading p{font-size:11px;margin:5px 0 12px}.ec-presets{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}.ec-presets button,.ec-backgrounds button{padding:5px;border:1px solid var(--es-line);border-radius:5px;background:#030e1990;min-width:0;color:var(--es-text)}.ec-presets button[aria-pressed=true],.ec-backgrounds button[aria-pressed=true]{border-color:#65c5ff;box-shadow:0 0 12px #009eff55,inset 0 0 10px #009eff25}.ec-presets button>span:last-child{font-size:9px;display:block;line-height:1.4;padding:7px 0 3px}.ec-preset-art{height:54px;display:flex;align-items:end;gap:4px;padding:8px;background:radial-gradient(ellipse at 50% 20%,var(--ec-preset),#030811 80%);border:1px solid color-mix(in srgb,var(--ec-preset),transparent 40%);overflow:hidden;position:relative}.ec-preset-art:before{content:'';position:absolute;width:55px;height:45px;border:1px solid var(--ec-preset);transform:rotate(45deg);left:25%;top:30px;box-shadow:0 0 12px var(--ec-preset)}.ec-preset-art i{display:block;height:9px;flex:1;border:1px solid var(--ec-preset);z-index:1}.ec-backgrounds{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}.ec-backgrounds button>span:last-child{display:block;font-size:10px;padding:8px 0 3px}.ec-background-thumb{display:block;height:76px;border-radius:2px;background:#050d17;background-size:cover;background-position:center;border:1px solid #ffffff15}.ec-bg-glass{background:linear-gradient(70deg,transparent 25%,#4bb5ff25 26%,transparent 28%,transparent 65%,#64c9ff30 66%,transparent 68%),linear-gradient(140deg,#020b15,#13507880,#050c18)}.ec-bg-grid{background-image:linear-gradient(#21628d55 1px,transparent 1px),linear-gradient(90deg,#21628d55 1px,transparent 1px);background-size:12px 12px}.ec-bg-gradient{background:linear-gradient(145deg,#02143e,#096fc5)}.ec-adjusted{font-size:10px!important;line-height:1.5;margin:8px 0 0!important;color:var(--es-text)!important}.ec-adjusted code{font-size:10px}.ec-black-neon{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;border:1px solid var(--card-line);border-radius:5px;background:var(--card-fill)}.ec-black-neon strong{display:block;font-size:12px;color:var(--evo-title)}.ec-black-neon span{display:block;font-size:10px;color:var(--evo-muted);line-height:1.5}.ec-black-neon button{flex:none;font-size:10px;padding:7px 10px;border:1px solid var(--card-accent);border-radius:4px;color:var(--evo-text);background:var(--card-fill-2)}.ec-black-neon button[aria-pressed=true]{background:var(--card-accent);color:var(--primary-foreground)}.ec-note{font-size:10px!important;color:var(--es-muted);line-height:1.6;margin:14px 0 0}.ec-right{display:flex;flex-direction:column;gap:16px;min-width:0}.ec-preview-intro{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}.ec-preview-intro p{font-size:11px;margin:0}.ec-preview-intro button{display:flex;gap:6px;align-items:center;border:1px solid var(--es-line);padding:6px 8px;border-radius:5px;font-size:10px;color:var(--es-text);background:#08213980}.ec-live{padding:14px;border:1px solid var(--evo-primary);border-radius:8px;background:var(--evo-background-image);background-size:var(--evo-background-size);color:var(--evo-secondary);box-shadow:var(--evo-glow);overflow:hidden;position:relative}.ec-live-header{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid color-mix(in srgb,var(--evo-primary),transparent 60%);padding-bottom:10px}.ec-live-header>span{display:flex;gap:12px}.ec-live .evo-brand__word,.ec-live .evo-brand__tag{color:var(--evo-secondary)!important}.ec-sample-label{font-size:8px!important;letter-spacing:.1em;color:var(--evo-secondary)!important;opacity:.75;margin:10px 0!important}.ec-hero{height:180px;border:1px solid color-mix(in srgb,var(--evo-primary),transparent 45%);border-radius:5px;background-size:cover;background-position:center;position:relative;overflow:hidden;color:white}.ec-hero>div{position:absolute;bottom:18px;left:18px}.ec-hero span{font-size:8px;letter-spacing:.18em;color:#d3edff}.ec-hero strong{display:block;font-size:22px;font-weight:500;line-height:1.5}.ec-workspace .ec-live .ec-hero p{color:#cfdeec!important;font-size:10px;margin:2px 0}.ec-sample-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}.ec-sample-card{display:flex;flex-direction:column;gap:12px;align-items:center;padding:17px 6px;border:1px solid var(--evo-primary);border-radius:5px;background:var(--evo-surface);backdrop-filter:blur(var(--evo-blur));box-shadow:var(--evo-glow);color:var(--evo-secondary);font-size:10px}.ec-preview-line{font-size:9px;opacity:.8;display:flex;align-items:center;gap:8px;margin-top:14px}.ec-preview-line>span{height:4px;width:4px;background:var(--evo-primary);border-radius:50%;box-shadow:0 0 6px var(--evo-primary)}.ec-slider-row{display:grid;grid-template-columns:1fr 1fr 34px;gap:12px;align-items:center;border-bottom:1px solid var(--es-line);padding:13px 0;font-size:11px}.ec-slider-row input{width:100%;height:5px;accent-color:var(--es-blue);cursor:pointer}.ec-slider-row output{text-align:right;font-size:11px;color:var(--es-blue)}.ec-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--es-line);font-size:11px}.ec-save{font-size:10px!important;color:var(--es-blue)!important;border:1px solid var(--es-line);border-radius:5px;padding:9px 10px;margin:14px 0 0}.ec-live[data-evo-animations=true] .ec-preview-line>span{animation:ec-pulse 3s ease-in-out infinite}@keyframes ec-pulse{50%{opacity:.35;box-shadow:0 0 12px var(--evo-primary)}}
@media(max-width:1200px){.ec-workspace{grid-template-columns:1fr}.ec-right{display:grid;grid-template-columns:1.15fr .85fr;align-items:start}.ec-presets button>span:last-child{font-size:10px}.ec-color-box p{min-height:34px}}
@media(max-width:700px){.ec-right{display:flex}.ec-color-grid{gap:10px}.ec-color-box{padding:11px}.ec-color-box p{font-size:10px;min-height:64px}.ec-presets{grid-template-columns:repeat(3,1fr)}.ec-backgrounds{gap:5px}.ec-background-thumb{height:57px}.ec-backgrounds button>span:last-child{font-size:9px}.ec-color-swatches{grid-template-columns:repeat(3,1fr);gap:7px}.ec-live{padding:10px}.ec-sample-card{padding:15px 4px;gap:9px}.ec-sample-cards{gap:6px}.ec-hero{height:170px}.ec-slider-row{grid-template-columns:1.1fr 1fr 30px;gap:8px}.ec-preview-intro{align-items:start}.ec-preview-intro button{font-size:9px;white-space:nowrap}.ec-live-header .evo-brand__word{font-size:10px}.ec-live-header .evo-brand__tag{font-size:6px}.ec-live-header>span{gap:8px}}
@media(prefers-reduced-motion:reduce){.ec-workspace *{animation:none!important;transition:none!important}}
`;

function CardAppearance() {
  const { data, mutate } = useEvolutionData();
  const cloud = useCloudStatus();
  const selected = normalizeCardStyle(data.settings.cardStyle);
  const all = data.settings.applyCardStyleGlobally !== false;
  return (
    <section id="appearance" className="appearance-section" aria-labelledby="appearance-heading">
      <div className="appearance-heading">
        <div>
          <p className="hud-label text-xs text-primary">SETTINGS / APPEARANCE</p>
          <h2 id="appearance-heading">Design Cards</h2>
          <p>Choose the look and feel of your cards. Change it anytime.</p>
        </div>
        <span className="appearance-motto">
          SAME GOALS.
          <br />
          DIFFERENT STYLE.
          <br />
          MAKE IT YOURS.
        </span>
      </div>
      <div className="appearance-options" role="group" aria-label="Card style">
        {CARD_STYLES.map((style, i) => (
          <button
            key={style.id}
            type="button"
            aria-pressed={selected === style.id}
            disabled={cloud === "loading"}
            className={`appearance-choice ${selected === style.id ? "is-selected" : ""}`}
            onClick={() => mutate((p) => ({ settings: { ...p.settings, cardStyle: style.id } }))}
          >
            <div className={`appearance-preview card-surface card-style-${style.id}`} aria-hidden="true">
              <div className="appearance-preview-title">
                <Sparkles size={22} />
                <span>
                  FOCUS<small>Deep work</small>
                </span>
              </div>
              <div className="appearance-ring">
                <span>
                  YOUR
                  <br />
                  SPACE
                </span>
              </div>
              <div className="appearance-preview-footer">
                PLAN <span>•</span> BUILD <span>•</span> EVOLVE
              </div>
            </div>
            <span className="appearance-choice-title">
              <span>{String(i + 1).padStart(2, "0")}</span>
              {style.name}
            </span>
            <span className="appearance-description">{style.description}</span>
            <span className="appearance-select">
              {selected === style.id && <Check size={17} />} {selected === style.id ? "Selected" : "Select"}
            </span>
          </button>
        ))}
      </div>
      <label className="appearance-apply">
        <Layers aria-hidden="true" />
        <span>
          <strong>Apply to All Pages</strong>
          <small>
            {all
              ? "Your selected style is used across app card panels."
              : "Preview only. App cards keep the signature Jarvis style."}
          </small>
        </span>
        <input
          type="checkbox"
          checked={all}
          disabled={cloud === "loading"}
          onChange={(e) =>
            mutate((p) => ({
              settings: { ...p.settings, applyCardStyleGlobally: e.target.checked },
            }))
          }
        />
      </label>
      <p className="appearance-save-note" role="status">
        {cloud === "loading"
          ? "Loading your saved appearance…"
          : cloud === "error"
            ? "Saved on this device. Account sync is currently unavailable."
            : "Saved automatically with your app preferences."}{" "}
        Card style changes borders and surfaces; artwork and charts keep their original design.
      </p>
    </section>
  );
}

const settingsCss = `
.es-shell{--es-blue:#49bfff;--es-line:rgba(76,177,231,.3);--es-text:#e9f4ff;--es-muted:#9db4ca;min-height:100vh;color:var(--es-text);background:radial-gradient(ellipse at 90% 0%,#12345090,transparent 45%),radial-gradient(ellipse at 5% 80%,#07588630,transparent 38%),linear-gradient(130deg,#030a12ec,#081725ef 60%,#030a12);padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:13px;line-height:1.5}
.es-brandbar{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--es-line);padding:5px 0 18px}.es-brand-context{font-size:9px;letter-spacing:.2em;color:#789cb5;margin-left:auto}.es-brandbar [data-compact-navigation]{align-self:center}.es-frame{max-width:1740px;margin:auto;display:grid;grid-template-columns:202px minmax(0,1fr);gap:24px}.es-sidebar{position:sticky;top:24px;align-self:start;max-height:calc(100vh - 48px);overflow:auto}.es-sidebar>div{background:#03111ee8}.es-main{min-width:0;display:flex;flex-direction:column;gap:18px}.es-main>header:first-child{border-color:var(--es-line)}
.es-toolbar{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:18px 0 4px}.es-title{display:flex;align-items:center;gap:14px;flex:1}.es-title>svg{width:44px;height:44px;color:var(--es-blue);filter:drop-shadow(0 0 9px #00aaff60)}.es-title h1{font-family:Orbitron,ui-sans-serif,sans-serif;font-size:25px;letter-spacing:.1em;margin:0;font-weight:500}.es-title p{margin:3px 0 0;color:#a8d8f5;font-size:9px;letter-spacing:.2em}.es-tabs{display:flex;border:1px solid var(--es-line);border-radius:7px;background:#020c16c9;overflow:hidden}.es-tabs a{display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 21px;color:#bcd6e9;border-right:1px solid #18415b70;text-decoration:none}.es-tabs a:last-child{border:0}.es-tabs svg{color:var(--es-blue)}.es-tabs a[aria-current]{background:linear-gradient(180deg,#0c659b95,#063362);box-shadow:inset 0 0 13px #1395ff75,0 0 13px #1395ff50;color:white;outline:1px solid #4bb6ff;outline-offset:-1px}
.es-search{display:flex;align-items:center;gap:10px;background:#010d1bc4;border:1px solid var(--es-line);border-radius:6px;padding:11px 13px;width:230px;color:var(--es-blue)}.es-search input{min-width:0;width:100%;background:transparent;border:0;color:var(--es-text);outline:0;font-size:12px}.es-search button{font-size:22px;line-height:1}.es-search:focus-within{outline:2px solid var(--es-blue)}.es-status{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--es-muted);letter-spacing:.03em;margin-top:-4px}.es-status>span:last-child{margin-left:auto;letter-spacing:.16em;font-size:9px}.es-dot{width:6px;height:6px;border-radius:50%;background:#52bdf0;box-shadow:0 0 9px #239de5}.es-dot-error{background:#ffb855}.es-search-note{margin:0;color:var(--es-muted)}
.es-grid{display:grid;grid-template-columns:1.12fr 1.12fr .94fr;gap:16px;align-items:start}.es-panel{position:relative;min-width:0;padding:20px;border:1px solid var(--es-line);border-radius:9px;background:linear-gradient(135deg,#071c2bcc,#020a13ed 65%);box-shadow:inset 0 1px 0 #6ac7f317,0 5px 25px #0005;backdrop-filter:blur(14px)}.es-panel:before{content:'';position:absolute;top:-1px;left:18px;width:70px;height:1px;background:#52c6ff;box-shadow:0 0 9px #35b9ff}.es-panel h2{font-size:16px;font-weight:550;margin:0 0 18px;display:flex;align-items:center;gap:9px;letter-spacing:-.02em}.es-panel h2 svg{color:var(--es-blue)}.es-panel h3{font-size:14px;font-weight:550;margin:0}.es-panel p{color:var(--es-muted)}.es-panel button,.es-panel a{transition:background .15s,border-color .15s,box-shadow .15s}.es-shell button:focus-visible,.es-shell a:focus-visible,.es-shell input:focus-visible{outline:2px solid #77d6ff;outline-offset:3px}.es-shell button:disabled{opacity:.5;cursor:not-allowed}.es-panel input{background:#020c18;border:1px solid var(--es-line);color:var(--es-text);min-width:0}.es-panel input:focus{border-color:var(--es-blue)}.es-profile,.es-overview,.es-quick{min-height:355px}.es-person{display:flex;align-items:center;gap:17px}.es-person h3{font-size:20px;overflow-wrap:anywhere}.es-person p{font-size:12px;margin:4px 0 8px}.es-avatar{width:82px;height:82px;flex-shrink:0;display:grid;place-items:center;border:1px solid #46bfff9a;border-radius:50%;background:radial-gradient(circle at 35% 20%,#1b658c80,#020c18 70%);color:#56beff;box-shadow:0 0 24px #008cff20;position:relative}.es-avatar span{position:absolute;bottom:0;right:0;width:26px;height:26px;border:1px solid #3489b7;background:#061b2d;border-radius:50%;display:grid;place-items:center}.es-tag{font-size:8px;color:#9dd9fc;letter-spacing:.12em;border:1px solid #2e668c;padding:3px 6px;border-radius:4px;background:#07335860}.es-profile blockquote{color:#b6cadb;font-size:12px;margin:20px 0}.es-profile label{color:var(--es-muted);font-size:11px;display:block;margin-bottom:6px}.es-name-edit{display:flex;gap:8px}.es-name-edit button{background:linear-gradient(#155884,#0a3456);color:white;border:1px solid #328ac3}.es-details{margin:14px 0 0}.es-details>div{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #23415960;padding:11px 0 0;margin-top:11px}.es-details dt{color:var(--es-muted);font-size:11px}.es-details dd{text-align:right;font-size:11px;overflow-wrap:anywhere;max-width:70%}.es-details small,.es-pref-line small{display:block;font-size:10px;color:#7e9bb2;margin-top:3px}.es-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.es-facts>div{display:flex;align-items:center;gap:12px;border:1px solid #22567a;background:linear-gradient(115deg,#0c2d4390,#08142180);border-radius:5px;min-height:79px;padding:12px}.es-facts svg{color:var(--es-blue);width:28px;height:28px;flex-shrink:0}.es-facts span{color:var(--es-muted);font-size:10px}.es-facts strong{font-size:16px;font-weight:450;display:block;color:var(--es-text);margin-top:3px;line-height:1.2}.es-facts strong small{font-size:11px}.es-sync-box{display:flex;align-items:center;gap:13px;padding:17px 0 4px;margin-top:10px;border-top:1px solid #22567a}.es-sync-box>svg{color:#49bfff;flex-shrink:0}.es-sync-box p{font-size:11px;margin:5px 0}.es-footnote{font-size:11px;line-height:1.65;margin:0 0 13px}.es-overview>.es-footnote{font-size:10px;margin:10px 0 0}
.es-action{display:flex;align-items:center;gap:11px;width:100%;text-align:left;min-height:44px;padding:10px 12px;margin-bottom:8px;background:linear-gradient(110deg,#0a2236a0,#06121db0);border:1px solid #245476;border-radius:5px;color:var(--es-text);text-decoration:none}.es-action:hover{background:#0e3650;border-color:#48aeeb}.es-action>svg{width:21px;height:21px;color:var(--es-blue);flex-shrink:0}.es-action>svg:last-child{width:14px;margin-left:auto}.es-action small,.es-unavailable small{display:block;font-size:10px;margin-top:2px;color:var(--es-muted)}.es-unavailable{display:flex;align-items:center;gap:11px;padding:10px 8px;color:#a7bdce;font-size:12px}.es-unavailable>svg{width:20px;height:20px;color:#659bbd;flex-shrink:0}.es-quick .es-action{margin-bottom:7px}.es-quick .es-unavailable{padding:8px}.es-pref-line{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid #1a3c5360}.es-pref-line>svg{color:var(--es-blue);width:21px;height:21px;flex-shrink:0}.es-pref-line>span{font-size:12px}.es-pref-line>strong{margin-left:auto;text-align:right;font-size:11px;font-weight:400;max-width:55%;overflow-wrap:anywhere}.es-swatches{display:flex;gap:8px;flex-wrap:wrap;padding:16px 0 8px}.es-swatches button{flex:1;min-width:38px;display:flex;align-items:center;flex-direction:column;gap:5px;padding:4px;border-radius:5px;border:1px solid transparent}.es-swatches button[aria-pressed=true]{border-color:#2d759d;background:#163d5860}.es-swatches button>span{height:26px;width:26px;border-radius:50%;display:grid;place-items:center;color:white;box-shadow:inset 0 0 0 2px #ffffff30}.es-swatch-check{color:#071525;filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff);stroke-width:3}.es-swatches small{font-size:8px;color:var(--es-muted)}.es-preferences>.es-footnote{margin:16px 0 0}.es-integration{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #1e435d60;font-size:12px}.es-service{width:26px;height:26px;border:1px solid #2b7196;border-radius:6px;display:grid;place-items:center;font-size:10px;font-weight:650;color:#aaddff;background:#092a3e}.es-integration>small{margin-left:auto;font-size:9px;color:#8ba7bd;text-align:right}.es-inline-link{display:flex;align-items:center;justify-content:space-between;color:#60c5fa;margin-top:18px;font-size:11px}.es-danger{margin-top:15px;padding-top:14px;border-top:1px solid #6e2836}.es-danger h3{display:flex;gap:8px;color:#ff8c99;font-size:12px}.es-danger p{font-size:10px;margin:7px 0 12px}.es-danger>button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px;border:1px solid #9c3e51;color:#ffa0ae;border-radius:5px;background:#4e101b30;font-size:11px}.es-danger>div>strong{font-size:11px;color:#ffb2bc}.es-reset-buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.es-reset-buttons button{font-size:10px}
.es-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-top:1px solid #21405780;font-size:12px}.es-switch{width:36px;height:21px;border-radius:20px;background:#1c3347;flex-shrink:0;border:1px solid #426179;padding:2px;display:flex}.es-switch span{width:15px;height:15px;background:#93adc1;border-radius:50%;transition:transform .15s}.es-switch[aria-checked=true]{background:#0679bd;border-color:#39b9ff}.es-switch[aria-checked=true] span{transform:translateX(14px);background:#e5f8ff}.es-timer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.es-timer-grid label{color:var(--es-muted);font-size:11px}.es-timer-grid input{margin-top:6px;height:36px}.es-appearance{grid-column:1/-1;min-width:0}.es-appearance .appearance-section{background:#06111ce8;border-color:var(--es-line);color:var(--es-text)}.es-bank{grid-column:1/-1;min-width:0;scroll-margin-top:20px}.es-bank:empty{display:none}.es-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#6f94ae;font-size:10px;padding:10px 0 24px}.es-footer>span:first-child{letter-spacing:.2em;color:#6fbee7}.es-footer a{display:flex;align-items:center;color:#a7c9e0}.es-panel[id]{scroll-margin-top:20px}
@media(min-width:1450px){.es-toolbar{flex-wrap:nowrap}.es-title{min-width:290px}.es-search{margin-left:auto}.es-panel{padding:22px}.es-profile,.es-overview,.es-quick{min-height:374px}}
@media(max-width:1250px){.es-brandbar{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--es-line);padding:5px 0 18px}.es-brand-context{font-size:9px;letter-spacing:.2em;color:#789cb5;margin-left:auto}.es-brandbar [data-compact-navigation]{align-self:center}.es-frame{grid-template-columns:174px minmax(0,1fr);gap:18px}.es-grid{grid-template-columns:1fr 1fr}.es-quick{grid-column:1/-1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}.es-quick h2{grid-column:1/-1;margin-bottom:9px}.es-title{min-width:250px}.es-search{flex:1;min-width:180px}.es-shell{padding:18px}.es-tabs a{padding:12px 16px}}
@media(max-width:900px){.es-brandbar{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--es-line);padding:5px 0 18px}.es-brand-context{font-size:9px;letter-spacing:.2em;color:#789cb5;margin-left:auto}.es-brandbar [data-compact-navigation]{align-self:center}.es-frame{display:flex;flex-direction:column}.es-sidebar{position:static;order:2;max-height:none}.es-main{order:1}.es-toolbar{gap:14px}.es-title{flex-basis:100%}.es-search{flex:1}.es-footer>span:nth-child(2){display:none}}
@media(max-width:600px){.es-brand-context{display:none}.es-brandbar{padding:8px 0 14px}.es-shell{padding:12px 12px 90px}.es-grid{grid-template-columns:1fr;gap:13px}.es-panel{padding:18px}.es-main{gap:14px}.es-profile,.es-overview{min-height:0}.es-quick{display:block}.es-title h1{font-size:23px}.es-title>svg{width:36px;height:36px}.es-title p{font-size:8px}.es-tabs{width:100%}.es-tabs a{flex:1;font-size:12px;padding:12px 7px;gap:6px}.es-tabs svg{width:18px}.es-search{width:100%;flex-basis:100%;padding:12px}.es-status>span:last-child{display:none}.es-person h3{font-size:19px}.es-person{gap:14px}.es-avatar{width:72px;height:72px}.es-facts strong{font-size:15px}.es-facts>div{padding:12px 10px;gap:9px}.es-facts svg{width:24px}.es-sidebar{display:none}.es-footer{font-size:9px}.es-appearance .appearance-options{grid-template-columns:1fr}.es-reset-buttons button{white-space:normal;height:auto;min-height:38px}}
@media(prefers-reduced-motion:reduce){.es-shell *{transition:none!important;animation:none!important}}
`;
