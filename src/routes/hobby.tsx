import { localISO } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Star,
  Trash2,
  Plus,
  Plane,
  Car as CarIcon,
  Music,
  Play,
  Pause,
  RotateCcw,
  CalendarPlus,
  MapPin,
  Fuel,
  Activity,
  Search,
  Globe2,
  Heart,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Wallet,
  Compass,
  ExternalLink,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  CheckCircle2,
  Map,
  List,
  Download,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useEvolutionData,
  loadEvolutionData,
  todayDate,
  uid,
  type TripStatus,
  type Trip,
  type Car,
  type CarExpense,
  type CarExpenseType,
  CAR_EXPENSE_TYPES,
  type CarEvent,
  type CarEventRsvp,
  type GuitarSkill,
  type GuitarSong,
  type SkillLevel,
  SKILL_LEVELS,
  type CustomHobby,
  type CalendarEvent,
  type Transaction,
  type TodoItem,
  type GuitarSession,
  type FocusSession,
  guitarFocusOnly,
  guitarMirrorId,
  deleteGuitarSession,
} from "@/lib/evolution-data";
import { useFocusTimer, formatMmSs, modeLabel } from "@/lib/use-focus-timer";
import hobbyHologram from "@/assets/hobby-hologram.png";
import earthImg from "@/assets/earth.png";
import carImg from "@/assets/car.png";
import guitarImg from "@/assets/guitar.png";
import travelImg from "@/assets/travel.png";
import photographyImg from "@/assets/photography.png";
import videographyImg from "@/assets/videography.png";
import artImg from "@/assets/art.png";
import vehicleHud from "@/assets/vehicle-hud.png";
import { HoloFloat } from "@/components/evolution/HoloFloat";

export const Route = createFileRoute("/hobby")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Hobby — Evolution" },
      { property: "og:title", content: "Hobby — Evolution" },
      {
        property: "og:description",
        content: "Travel, Cars, Guitar — connected to wealth, focus, calendar, and to-do.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "description", content: "Travel, Cars, Guitar — connected to wealth, focus, calendar, and to-do." },
    ],
  }),
  component: HobbyPage,
});

const TRIP_STATUSES: TripStatus[] = ["Planning", "Booked", "In Progress", "Completed"];
const RSVP_STATES: CarEventRsvp[] = ["None", "Interested", "Going", "Attended"];
const HOBBY_HEROS = {
  Travel: earthImg,
  Cars: carImg,
  Guitar: guitarImg,
} as const;

// ---------- helpers ----------
function daysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr + "T00:00:00").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86400000);
}
function fmt$(n: number) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function weekStartISO() {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return localISO(d);
}
function isThisWeek(dateStr: string) {
  return dateStr >= weekStartISO();
}

function HobbyPage() {
  const { data, mutate } = useEvolutionData();

  // Tab state controlled so cards can navigate
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab = section || "overview";
  const setTab = (next: string) => {
    void navigate({ search: { section: next } });
  };

  // ---------- Weekly stats ----------
  const weeklyTravelHrs = data.trips.filter((t) => isThisWeek(t.startDate)).length * 6; // approx 6h prep per upcoming trip
  const weeklyCarsHrs = data.carMeets.filter((m) => isThisWeek(m.date)).length * 2;
  const weeklyGuitarMin =
    data.guitarSessions.filter((s) => isThisWeek(s.date)).reduce((a, s) => a + s.durationMin, 0) +
    guitarFocusOnly(data.focusSessions, data.guitarSessions)
      .filter((s) => isThisWeek(localISO(new Date(s.completedAt))))
      .reduce((a, s) => a + s.durationSec / 60, 0);
  const weeklyGuitarHrs = weeklyGuitarMin / 60;
  const totalWeekHrs = weeklyTravelHrs + weeklyCarsHrs + weeklyGuitarHrs;

  // ---------- Activity feed ----------
  const activity = useMemo(() => {
    const items: { date: string; kind: string; text: string; icon: typeof Plane }[] = [];
    data.trips.forEach((t) =>
      items.push({ date: t.startDate, kind: "Travel", text: `Trip: ${t.destination} (${t.status})`, icon: Plane }),
    );
    data.carMeets.forEach((m) =>
      items.push({ date: m.date, kind: "Cars", text: `Meet at ${m.location}`, icon: CarIcon }),
    );
    data.carExpenses.forEach((e) => {
      const car = data.cars.find((c) => c.id === e.carId);
      items.push({
        date: e.date,
        kind: "Cars",
        text: `${e.type} · ${fmt$(e.amount)}${car ? ` · ${car.make} ${car.model}` : ""}`,
        icon: CarIcon,
      });
    });
    data.guitarSessions.forEach((g) =>
      items.push({ date: g.date, kind: "Guitar", text: `Practice: ${g.practiced} (${g.durationMin}m)`, icon: Music }),
    );
    guitarFocusOnly(data.focusSessions, data.guitarSessions).forEach((s) => {
      const d = localISO(new Date(s.completedAt));
      items.push({ date: d, kind: "Guitar", text: `Focus session · ${Math.round(s.durationSec / 60)}m`, icon: Music });
    });
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  }, [data]);

  // ---------- Hobby modal ----------
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hName, setHName] = useState("");
  const [hIcon, setHIcon] = useState("✨");
  const [hTarget, setHTarget] = useState("3");
  const addCustomHobby = () => {
    if (!hName.trim()) return;
    const h: CustomHobby = {
      id: uid(),
      name: hName.trim(),
      icon: hIcon || "✨",
      weeklyHoursTarget: Number(hTarget) || 0,
      hours: 0,
    };
    mutate((p) => ({ customHobbies: [...p.customHobbies, h] }));
    setHName("");
    setHIcon("✨");
    setHTarget("3");
    setHobbyOpen(false);
  };

  return (
    <ModuleLayout number="08" title="Hobby" subtitle="Craft · Time · Mastery" icon={Star}>
      {/* Hero hologram */}
      {tab !== "travel" && (
        <div className="relative w-full h-[260px] overflow-hidden rounded-lg border border-border bg-black">
          <img
            src={hobbyHologram}
            alt=""
            aria-hidden
            className="hobby-holo-img absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.95 }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.15)" }} />
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border max-w-full overflow-x-auto overflow-y-hidden justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="photography">Photography</TabsTrigger>
          <TabsTrigger value="videography">Videography</TabsTrigger>
          <TabsTrigger value="guitar">Guitar</TabsTrigger>
          <TabsTrigger value="art">Art</TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW ============ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setHobbyOpen(true)} size="sm" className="hud-label text-[10px]">
              <Plus className="h-3 w-3 mr-1" /> Add Hobby
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <HobbyCard
              label="Cars"
              icon={CarIcon}
              hero={carImg}
              statValue={`${data.cars.length}`}
              statLabel="Cars in Garage"
              onOpen={() => setTab("cars")}
            />
            <HobbyCard
              label="Videography"
              icon={Music}
              hero={videographyImg}
              statValue="0"
              statLabel="Projects Completed"
              onOpen={() => setTab("videography")}
            />
            <HobbyCard
              label="Photography"
              icon={Music}
              hero={photographyImg}
              statValue="0"
              statLabel="Projects Completed"
              onOpen={() => setTab("photography")}
            />
            <HobbyCard
              label="Travel"
              icon={Plane}
              hero={travelImg}
              statValue={`${data.trips.length}`}
              statLabel="Trips Planned"
              onOpen={() => setTab("travel")}
            />
            <HobbyCard
              label="Guitar"
              icon={Music}
              hero={guitarImg}
              statValue={`${weeklyGuitarHrs.toFixed(1)} HRS`}
              statLabel="Practiced This Week"
              onOpen={() => setTab("guitar")}
            />
            <HobbyCard
              label="Art"
              icon={Star}
              hero={artImg}
              statValue="0"
              statLabel="Artworks Created"
              onOpen={() => setTab("art")}
            />
          </div>

          {data.customHobbies.length > 0 && (
            <Panel title="Custom Hobbies">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.customHobbies.map((h) => (
                  <div key={h.id} className="evo-surface border border-border rounded p-3 text-center group relative">
                    <div className="text-3xl">{h.icon}</div>
                    <div className="hud-label text-xs text-foreground mt-2">{h.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">
                      {h.hours.toFixed(1)} / {h.weeklyHoursTarget}h wk
                    </div>
                    <button
                      onClick={() => mutate((p) => ({ customHobbies: p.customHobbies.filter((x) => x.id !== h.id) }))}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Time Invested · This Week">
              <div className="hud-label text-3xl text-primary hud-glow">{totalWeekHrs.toFixed(1)} hrs</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">
                Travel {weeklyTravelHrs.toFixed(1)}h · Cars {weeklyCarsHrs.toFixed(1)}h · Guitar{" "}
                {weeklyGuitarHrs.toFixed(1)}h
              </div>
            </Panel>
            <Panel title="Weekly Goals">
              <ProgressBar label="Travel" current={weeklyTravelHrs} target={data.weeklyHobbyTargets.travel} />
              <ProgressBar label="Cars" current={weeklyCarsHrs} target={data.weeklyHobbyTargets.cars} />
              <ProgressBar label="Guitar" current={weeklyGuitarHrs} target={data.weeklyHobbyTargets.guitar} />
            </Panel>
            <Panel title="Mastery">
              <div className="hud-label text-3xl text-primary hud-glow">
                {Math.min(100, Math.round((weeklyGuitarHrs + weeklyCarsHrs + weeklyTravelHrs) * 5))}%
              </div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">Composite progress</div>
            </Panel>
          </div>

          <Panel title="Recent Activity">
            {activity.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                No activity yet — start logging in the tabs above.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((a, i) => (
                  <li key={i} className="py-2.5 flex items-center gap-3 text-xs">
                    <a.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="hud-label text-[10px] text-muted-foreground w-20 shrink-0">{a.date}</span>
                    <span className="hud-label text-[10px] text-accent w-14 shrink-0">{a.kind}</span>
                    <span className="text-foreground/85 truncate">{a.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        {/* ============ TRAVEL ============ */}
        <TabsContent value="travel" className="space-y-6">
          <TravelWorkspace />
        </TabsContent>

        {/* ============ CARS ============ */}
        <TabsContent value="cars" className="space-y-6">
          <CarsSection />
        </TabsContent>

        {/* ============ GUITAR ============ */}
        <TabsContent value="guitar" className="space-y-6">
          <GuitarSection weeklyGuitarHrs={weeklyGuitarHrs} />
        </TabsContent>

        {/* ============ PHOTOGRAPHY ============ */}
        <TabsContent value="photography" className="space-y-6">
          <ComingSoonSection label="Photography" hero={photographyImg} />
        </TabsContent>

        {/* ============ VIDEOGRAPHY ============ */}
        <TabsContent value="videography" className="space-y-6">
          <ComingSoonSection label="Videography" hero={videographyImg} />
        </TabsContent>

        {/* ============ ART ============ */}
        <TabsContent value="art" className="space-y-6">
          <ComingSoonSection label="Art" hero={artImg} />
        </TabsContent>
      </Tabs>

      {/* Add Hobby modal */}
      <Dialog open={hobbyOpen} onOpenChange={setHobbyOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">New Hobby</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Name (e.g. Photography)"
              value={hName}
              onChange={(e) => setHName(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              placeholder="Icon emoji"
              value={hIcon}
              onChange={(e) => setHIcon(e.target.value)}
              maxLength={2}
              className="h-9 text-xs"
            />
            <Input
              type="number"
              placeholder="Weekly hours target"
              value={hTarget}
              onChange={(e) => setHTarget(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHobbyOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={addCustomHobby} className="hud-label text-[10px]">
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

// ============ Shared small components ============

function HobbyCard({
  label,
  icon: Icon,
  hero,
  statValue,
  statLabel,
  onOpen,
}: {
  label: string;
  icon: typeof Plane;
  hero: string;
  statValue: string;
  statLabel: string;
  onOpen: () => void;
}) {
  const isCover = hero === earthImg; // Travel still uses the cover treatment
  return (
    <button
      onClick={onOpen}
      className="hud-card hud-scan p-0 overflow-hidden text-left group relative transition-transform hover:-translate-y-0.5"
    >
      {isCover ? (
        <div className="relative h-32 bg-black overflow-hidden">
          <img
            src={hero}
            alt=""
            aria-hidden
            className="hobby-holo-img absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.9 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 40%, var(--card))" }}
          />
          <Icon className="absolute top-3 right-3 h-5 w-5 text-primary hud-glow" />
        </div>
      ) : (
        <div className="relative h-32 bg-black overflow-hidden">
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{
              maskImage: "linear-gradient(to left, black 55%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, black 55%, transparent 100%)",
            }}
          >
            <HoloFloat src={hero} width={150} height={120} />
          </div>
          <Icon className="absolute top-3 left-3 h-5 w-5 text-primary hud-glow" />
        </div>
      )}
      <div className="p-4">
        <div className="hud-label text-lg text-primary hud-glow">{label}</div>
        <div className="hud-label text-2xl text-foreground mt-2 tabular-nums">{statValue}</div>
        <div className="hud-label text-[10px] text-muted-foreground mt-1">{statLabel}</div>
        <div className="hud-label text-[10px] text-primary mt-3 group-hover:underline">Open {label} →</div>
      </div>
    </button>
  );
}

function ComingSoonSection({ label, hero }: { label: string; hero: string }) {
  return (
    <Panel title={label}>
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <HoloFloat src={hero} width={220} height={180} />
        <div className="hud-label text-sm text-primary hud-glow">{label.toUpperCase()}</div>
        <div className="hud-label text-[10px] text-muted-foreground text-center max-w-xs">
          Tracking for {label} is coming soon. Set it as your current focus from the Dashboard hobby card.
        </div>
      </div>
    </Panel>
  );
}

function ProgressBar({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between hud-label text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary tabular-nums">
          {current.toFixed(1)} / {target}h
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${pct}%`, boxShadow: "0 0 6px var(--primary)" }}
        />
      </div>
    </div>
  );
}

// ============ TRAVEL ============

function TravelSection() {
  const { data, mutate } = useEvolutionData();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dest, setDest] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<TripStatus>("Planning");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setEditId(null);
    setDest("");
    setStart("");
    setEnd("");
    setBudget("");
    setStatus("Planning");
    setNotes("");
  };

  const submit = () => {
    if (!dest.trim()) return;
    const tripId = editId || uid();
    const trip: Trip = {
      ...(editId ? data.trips.find((t) => t.id === editId) : {}),
      id: tripId,
      destination: dest.trim(),
      startDate: start || todayDate(),
      endDate: end || start || todayDate(),
      budget: Number(budget) || 0,
      status,
      notes: notes.trim() || undefined,
      packing: editId ? (data.trips.find((t) => t.id === editId)?.packing ?? []) : [],
    };

    mutate((prev) => {
      // Remove any existing calendar events linked to this trip
      const cleaned = (prev.calendar ?? []).filter((e) => !e.id.startsWith(`trip-${tripId}-`));
      const newCal: CalendarEvent[] = [
        {
          id: `trip-${tripId}-dep`,
          date: trip.startDate,
          time: "08:00",
          endTime: "09:00",
          title: `✈ Depart: ${trip.destination}`,
          reminder: 1440,
        },
        {
          id: `trip-${tripId}-ret`,
          date: trip.endDate,
          time: "20:00",
          endTime: "21:00",
          title: `🏠 Return from ${trip.destination}`,
          reminder: 1440,
        },
      ];
      return {
        trips: editId ? prev.trips.map((t) => (t.id === editId ? trip : t)) : [...prev.trips, trip],
        calendar: [...cleaned, ...newCal],
      };
    });
    reset();
    setOpen(false);
  };

  const edit = (t: Trip) => {
    setEditId(t.id);
    setDest(t.destination);
    setStart(t.startDate);
    setEnd(t.endDate);
    setBudget(String(t.budget));
    setStatus(t.status);
    setNotes(t.notes ?? "");
    setOpen(true);
  };
  const del = (id: string) =>
    mutate((prev) => ({
      trips: prev.trips.filter((t) => t.id !== id),
      calendar: (prev.calendar ?? []).filter((e) => !e.id.startsWith(`trip-${id}-`)),
    }));

  const upcoming = [...data.trips]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2">
            <Plane className="h-4 w-4" /> Trip Planner
          </h2>
          <p className="hud-label text-[10px] text-muted-foreground">Auto-syncs to your Calendar.</p>
        </div>
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          size="sm"
          className="hud-label text-[10px]"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Trip
        </Button>
      </div>

      {upcoming.length > 0 && (
        <Panel title="Upcoming · Sorted by departure">
          <ul className="divide-y divide-border">
            {upcoming.map((t) => {
              const days = daysUntil(t.startDate);
              return (
                <li key={t.id} className="py-3 flex items-center gap-3 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="hud-label text-foreground">{t.destination}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">
                      {t.startDate} → {t.endDate}
                    </div>
                  </div>
                  <span className="hud-label text-primary text-[10px] tabular-nums">
                    {days > 0 ? `${days}d` : days === 0 ? "Today" : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onEdit={() => edit(trip)} onDelete={() => del(trip.id)} />
        ))}
        {!data.trips.length && (
          <div className="text-xs text-muted-foreground py-6 text-center col-span-full border border-dashed border-border rounded">
            No trips planned. Click <span className="text-primary">Add Trip</span> to start.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">{editId ? "Edit Trip" : "New Trip"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Destination"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="h-9 text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Departure</span>
                <Input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Return</span>
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-9 text-xs mt-1" />
              </label>
            </div>
            <Input
              type="number"
              placeholder="Budget $"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-9 text-xs"
            />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Status</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {TRIP_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`hud-label text-[10px] py-2 rounded border ${status === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-input border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={submit} className="hud-label text-[10px]">
              {editId ? "Save" : "Add Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TripCard({ trip, onEdit, onDelete }: { trip: Trip; onEdit: () => void; onDelete: () => void }) {
  const { mutate } = useEvolutionData();
  const [item, setItem] = useState("");
  const days = daysUntil(trip.startDate);
  const packed = trip.packing.filter((p) => p.done).length;
  const pct = trip.packing.length ? (packed / trip.packing.length) * 100 : 0;

  const updateTrip = (patch: Partial<Trip>) =>
    mutate((p) => ({ trips: p.trips.map((t) => (t.id === trip.id ? { ...t, ...patch } : t)) }));
  const addPack = () => {
    if (!item.trim()) return;
    updateTrip({ packing: [...trip.packing, { id: uid(), item: item.trim(), done: false }] });
    setItem("");
  };
  const togglePack = (pid: string) =>
    updateTrip({ packing: trip.packing.map((p) => (p.id === pid ? { ...p, done: !p.done } : p)) });
  const delPack = (pid: string) => updateTrip({ packing: trip.packing.filter((p) => p.id !== pid) });

  const statusColor =
    trip.status === "In Progress"
      ? "border-accent text-accent bg-accent/10"
      : trip.status === "Booked"
        ? "border-primary text-primary bg-primary/10"
        : trip.status === "Completed"
          ? "border-border text-muted-foreground"
          : "border-border text-foreground/70";

  return (
    <div className="hud-card p-4 group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="hud-label text-sm text-primary hud-glow truncate">{trip.destination}</div>
          <div className="hud-label text-[10px] text-muted-foreground">
            {trip.startDate} → {trip.endDate} · {fmt$(trip.budget)}
          </div>
          {days > 0 && trip.status !== "Completed" && (
            <div className="hud-label text-[10px] text-accent mt-1">
              ⏱ {days} day{days !== 1 ? "s" : ""} until departure
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="hud-label text-[10px] text-muted-foreground hover:text-primary px-2">
            Edit
          </button>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <span className={`inline-block mt-2 hud-label text-[9px] px-2 py-0.5 rounded border ${statusColor}`}>
        {trip.status}
      </span>
      {trip.notes && <p className="text-xs text-foreground/70 mt-2">{trip.notes}</p>}

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="hud-label text-[10px] text-muted-foreground">
            Packing ({packed}/{trip.packing.length})
          </span>
          <span className="hud-label text-[10px] text-primary">{Math.round(pct)}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPack()}
            placeholder="Add item…"
            className="h-8 text-xs"
          />
          <Button onClick={addPack} size="sm" className="hud-label text-[10px]">
            +
          </Button>
        </div>
        <ul className="space-y-1 max-h-32 overflow-y-auto">
          {trip.packing.map((p) => (
            <li key={p.id} className="flex items-center gap-2 group/p">
              <button
                onClick={() => togglePack(p.id)}
                className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${p.done ? "bg-primary border-primary" : "border-primary/50"}`}
              >
                {p.done && <span className="text-[8px] text-primary-foreground">✓</span>}
              </button>
              <span className={`flex-1 text-xs ${p.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {p.item}
              </span>
              <button
                onClick={() => delPack(p.id)}
                className="opacity-0 group-hover/p:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============ CARS ============

function CarsSection() {
  const { data, mutate } = useEvolutionData();

  // Add Car
  const [carOpen, setCarOpen] = useState(false);
  const [editCarId, setEditCarId] = useState<string | null>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearF, setYearF] = useState(String(new Date().getFullYear()));
  const [color, setColor] = useState("");
  const [purchase, setPurchase] = useState("");
  const [current, setCurrent] = useState("");
  const resetCar = () => {
    setEditCarId(null);
    setMake("");
    setModel("");
    setColor("");
    setPurchase("");
    setCurrent("");
    setYearF(String(new Date().getFullYear()));
  };
  const submitCar = () => {
    if (!make.trim() || !model.trim()) return;
    const car: Car = {
      id: editCarId || uid(),
      make: make.trim(),
      model: model.trim(),
      year: Number(yearF) || new Date().getFullYear(),
      color: color.trim(),
      purchasePrice: Number(purchase) || 0,
      currentValue: Number(current) || 0,
    };
    mutate((p) => ({ cars: editCarId ? p.cars.map((c) => (c.id === editCarId ? car : c)) : [...p.cars, car] }));
    resetCar();
    setCarOpen(false);
  };
  const editCar = (c: Car) => {
    setEditCarId(c.id);
    setMake(c.make);
    setModel(c.model);
    setYearF(String(c.year));
    setColor(c.color);
    setPurchase(String(c.purchasePrice));
    setCurrent(String(c.currentValue));
    setCarOpen(true);
  };
  const delCar = (id: string) =>
    mutate((p) => ({
      cars: p.cars.filter((c) => c.id !== id),
      carExpenses: p.carExpenses.filter((e) => e.carId !== id),
      transactions: p.transactions.filter((t) => !p.carExpenses.find((e) => e.carId === id && e.txId === t.id)),
    }));

  // Add Expense
  const [expOpen, setExpOpen] = useState(false);
  const [eCarId, setECarId] = useState("");
  const [eType, setEType] = useState<CarExpenseType>("Gas");
  const [eAmount, setEAmount] = useState("");
  const [eDate, setEDate] = useState(todayDate());
  const [eNotes, setENotes] = useState("");
  const [eGallons, setEGallons] = useState("");
  const [ePPG, setEPPG] = useState("");
  const [eMileage, setEMileage] = useState("");
  const openExp = (carId?: string) => {
    setECarId(carId || data.cars[0]?.id || "");
    setEType("Gas");
    setEAmount("");
    setEDate(todayDate());
    setENotes("");
    setEGallons("");
    setEPPG("");
    setEMileage("");
    setExpOpen(true);
  };
  const submitExp = () => {
    if (!eCarId || !Number(eAmount)) return;
    const car = data.cars.find((c) => c.id === eCarId);
    if (!car) return;
    const expId = uid();
    const txId = uid();
    const exp: CarExpense = {
      id: expId,
      carId: eCarId,
      date: eDate,
      type: eType,
      amount: Number(eAmount),
      notes: eNotes.trim() || undefined,
      gallons: eType === "Gas" ? Number(eGallons) || undefined : undefined,
      pricePerGallon: eType === "Gas" ? Number(ePPG) || undefined : undefined,
      mileage: eType === "Gas" ? Number(eMileage) || undefined : undefined,
      txId,
    };
    const tx: Transaction = {
      id: txId,
      date: eDate,
      description: `${eType} · ${car.make} ${car.model}`,
      amount: Number(eAmount),
      type: "expense",
      category: `Car: ${car.make} ${car.model}`,
    };
    mutate((p) => ({
      carExpenses: [...p.carExpenses, exp],
      transactions: [...p.transactions, tx],
    }));
    setExpOpen(false);
  };
  const delExp = (id: string) =>
    mutate((p) => {
      const exp = p.carExpenses.find((e) => e.id === id);
      return {
        carExpenses: p.carExpenses.filter((e) => e.id !== id),
        transactions: exp?.txId ? p.transactions.filter((t) => t.id !== exp.txId) : p.transactions,
      };
    });

  // Per-car aggregations
  const carStats = (carId: string) => {
    const expenses = data.carExpenses.filter((e) => e.carId === carId);
    const monthIso = localISO().slice(0, 7);
    const monthly = expenses.filter((e) => e.date.startsWith(monthIso)).reduce((a, e) => a + e.amount, 0);
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    const gas = expenses.filter((e) => e.type === "Gas" && e.gallons && e.mileage);
    let mpg = 0;
    if (gas.length >= 2) {
      const sorted = [...gas].sort((a, b) => a.mileage! - b.mileage!);
      const totalMiles = sorted[sorted.length - 1].mileage! - sorted[0].mileage!;
      const totalGal = sorted.slice(1).reduce((a, e) => a + (e.gallons || 0), 0);
      mpg = totalGal > 0 ? totalMiles / totalGal : 0;
    }
    return { monthly, total, mpg };
  };

  const breakdown = useMemo(() => {
    const by: Record<string, number> = {};
    data.carExpenses.forEach((e) => {
      by[e.type] = (by[e.type] || 0) + e.amount;
    });
    const total = Object.values(by).reduce((a, b) => a + b, 0);
    return { by, total };
  }, [data.carExpenses]);

  // Car Events
  const [evOpen, setEvOpen] = useState(false);
  const [evName, setEvName] = useState("");
  const [evDate, setEvDate] = useState(todayDate());
  const [evLoc, setEvLoc] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const submitEvent = () => {
    if (!evName.trim()) return;
    const ce: CarEvent = {
      id: uid(),
      name: evName.trim(),
      date: evDate,
      location: evLoc.trim(),
      description: evDesc.trim() || undefined,
      rsvp: "Interested",
    };
    mutate((p) => ({ carEvents: [...p.carEvents, ce] }));
    setEvName("");
    setEvLoc("");
    setEvDesc("");
    setEvOpen(false);
  };
  const setRsvp = (id: string, r: CarEventRsvp) =>
    mutate((p) => ({ carEvents: p.carEvents.map((e) => (e.id === id ? { ...e, rsvp: r } : e)) }));
  const delEvent = (id: string) =>
    mutate((p) => {
      const ev = p.carEvents.find((e) => e.id === id);
      return {
        carEvents: p.carEvents.filter((e) => e.id !== id),
        calendar: ev?.calendarId ? (p.calendar ?? []).filter((c) => c.id !== ev.calendarId) : p.calendar,
      };
    });
  const addEventToCalendar = (ev: CarEvent) => {
    if (ev.calendarId) return;
    const calId = `carevent-${ev.id}`;
    const cal: CalendarEvent = {
      id: calId,
      date: ev.date,
      time: "09:00",
      endTime: "12:00",
      title: `🚗 ${ev.name}`,
      reminder: 1440,
    };
    mutate((p) => ({
      calendar: [...(p.calendar ?? []), cal],
      carEvents: p.carEvents.map((e) => (e.id === ev.id ? { ...e, calendarId: calId } : e)),
    }));
  };

  return (
    <>
      {/* Vehicle HUD showcase — interactive */}
      <InteractiveVehicleHud
        onAddExpense={() => openExp()}
        onAddCar={() => {
          resetCar();
          setCarOpen(true);
        }}
        onAddEvent={() => setEvOpen(true)}
        garageCount={data.cars.length}
        monthlySpend={Object.values(breakdown.by).reduce((a, b) => a + b, 0)}
        upcomingEvents={data.carEvents.length}
      />

      {/* Hero */}
      <div className="evo-surface relative flex items-start justify-between gap-4 rounded-lg border border-border bg-black/40 p-5 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2">
            <CarIcon className="h-4 w-4" /> My Garage
          </h2>
          <p className="hud-label text-[10px] text-muted-foreground mt-1">
            Track value, expenses, gas mileage, and meets — synced to Wealth.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">Garage</div>
              <div className="hud-label text-lg text-primary tabular-nums">{data.cars.length}</div>
            </div>
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">Expenses</div>
              <div className="hud-label text-lg text-foreground tabular-nums">{data.carExpenses.length}</div>
            </div>
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">Events</div>
              <div className="hud-label text-lg text-foreground tabular-nums">{data.carEvents.length}</div>
            </div>
          </div>
        </div>
        <HoloFloat src={carImg} width={180} height={130} spin className="shrink-0 hidden sm:block" />
      </div>

      {/* My Cars */}
      <div className="flex items-center justify-between">
        <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2">
          <CarIcon className="h-4 w-4" /> My Garage
        </h2>
        <Button
          onClick={() => {
            resetCar();
            setCarOpen(true);
          }}
          size="sm"
          className="hud-label text-[10px]"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Car
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.cars.map((c) => {
          const s = carStats(c.id);
          return (
            <div key={c.id} className="hud-card p-0 overflow-hidden group relative">
              <div className="relative h-24 bg-black overflow-hidden">
                <img
                  src={carImg}
                  alt=""
                  aria-hidden
                  className="hobby-holo-img absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.6 }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 30%, var(--card))" }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="hud-label text-sm text-primary hud-glow truncate">
                      {c.year} {c.make} {c.model}
                    </div>
                    <div className="hud-label text-[10px] text-muted-foreground">{c.color}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => editCar(c)}
                      className="hud-label text-[10px] text-muted-foreground hover:text-primary px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => delCar(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div>
                    <div className="hud-label text-[9px] text-muted-foreground">Value</div>
                    <div className="hud-label text-xs text-primary">{fmt$(c.currentValue)}</div>
                  </div>
                  <div>
                    <div className="hud-label text-[9px] text-muted-foreground">Month</div>
                    <div className="hud-label text-xs text-destructive">{fmt$(s.monthly)}</div>
                  </div>
                  <div>
                    <div className="hud-label text-[9px] text-muted-foreground">{s.mpg ? "MPG" : "Total"}</div>
                    <div className="hud-label text-xs text-foreground">{s.mpg ? s.mpg.toFixed(1) : fmt$(s.total)}</div>
                  </div>
                </div>
                <Button
                  onClick={() => openExp(c.id)}
                  size="sm"
                  variant="outline"
                  className="w-full mt-3 hud-label text-[10px]"
                >
                  <Plus className="h-3 w-3 mr-1" /> Log Expense
                </Button>
              </div>
            </div>
          );
        })}
        {!data.cars.length && (
          <div className="text-xs text-muted-foreground py-6 text-center col-span-full border border-dashed border-border rounded">
            No cars yet. Click <span className="text-primary">Add Car</span>.
          </div>
        )}
      </div>

      {/* Expenses */}
      <Panel title={`Expenses · Auto-synced to Wealth (${data.carExpenses.length})`}>
        <div className="flex justify-end mb-3">
          <Button onClick={() => openExp()} size="sm" disabled={!data.cars.length} className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Log Expense
          </Button>
        </div>
        {breakdown.total > 0 && (
          <div className="mb-4">
            <div className="hud-label text-[10px] text-muted-foreground mb-2">
              Breakdown by category · {fmt$(breakdown.total)} total
            </div>
            <div className="flex h-3 rounded-full overflow-hidden border border-border">
              {Object.entries(breakdown.by).map(([type, amt]) => {
                const pct = (amt / breakdown.total) * 100;
                const colors: Record<string, string> = {
                  Gas: "var(--primary)",
                  Insurance: "var(--accent)",
                  Maintenance: "oklch(0.7 0.18 30)",
                  Modification: "oklch(0.7 0.2 280)",
                  Parking: "oklch(0.65 0.15 200)",
                  Registration: "oklch(0.6 0.15 100)",
                  Other: "oklch(0.5 0.05 0)",
                };
                return (
                  <div
                    key={type}
                    title={`${type}: ${fmt$(amt)}`}
                    style={{ width: `${pct}%`, background: colors[type] || "var(--muted)" }}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.entries(breakdown.by).map(([type, amt]) => (
                <span key={type} className="hud-label text-[10px] text-muted-foreground">
                  {type} <span className="text-foreground">{fmt$(amt)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
          {[...data.carExpenses]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e) => {
              const car = data.cars.find((c) => c.id === e.carId);
              return (
                <li key={e.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] gap-3 items-center text-xs group">
                  <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                  <div>
                    <div className="hud-label text-foreground">
                      {e.type}
                      {e.gallons && ` · ${e.gallons}gal`}
                    </div>
                    <div className="hud-label text-[10px] text-muted-foreground">
                      {car ? `${car.make} ${car.model}` : "Unknown"}
                      {e.notes && ` · ${e.notes}`}
                    </div>
                  </div>
                  <span className="hud-label text-destructive">−{fmt$(e.amount)}</span>
                  <button
                    onClick={() => delExp(e.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          {!data.carExpenses.length && (
            <li className="text-xs text-muted-foreground py-6 text-center">No expenses logged.</li>
          )}
        </ul>
      </Panel>

      {/* Car Events */}
      <Panel title="Car Shows & Coffee · Curated + Custom">
        <div className="flex justify-end mb-3">
          <Button onClick={() => setEvOpen(true)} size="sm" variant="outline" className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Add Event
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {[...data.carEvents]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((ev) => (
              <li key={ev.id} className="py-3 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="hud-label text-xs text-foreground">
                      {ev.name} {ev.seed && <span className="text-[9px] text-muted-foreground ml-1">curated</span>}
                    </div>
                    <div className="hud-label text-[10px] text-muted-foreground">
                      {ev.date} · {ev.location}
                    </div>
                    {ev.description && <p className="text-xs text-foreground/70 mt-1">{ev.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={ev.rsvp}
                      onChange={(e) => setRsvp(ev.id, e.target.value as CarEventRsvp)}
                      className="h-7 bg-input border border-border rounded px-2 text-[10px]"
                    >
                      {RSVP_STATES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addEventToCalendar(ev)}
                      disabled={!!ev.calendarId}
                      className="hud-label text-[10px] text-primary px-2 py-1 border border-primary/40 rounded hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      title={ev.calendarId ? "Already in calendar" : "Add to Calendar"}
                    >
                      <CalendarPlus className="h-3 w-3" /> {ev.calendarId ? "Added" : "Calendar"}
                    </button>
                    {!ev.seed && (
                      <button
                        onClick={() => delEvent(ev.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </Panel>

      {/* Add Car modal */}
      <Dialog open={carOpen} onOpenChange={setCarOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">{editCarId ? "Edit Car" : "Add Car"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} className="h-9 text-xs" />
            <Input
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              type="number"
              placeholder="Year"
              value={yearF}
              onChange={(e) => setYearF(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              type="number"
              placeholder="Purchase $"
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              type="number"
              placeholder="Current value $"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCarOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={submitCar} className="hud-label text-[10px]">
              {editCarId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense modal */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">Log Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Car</span>
              <select
                value={eCarId}
                onChange={(e) => setECarId(e.target.value)}
                className="w-full mt-1 h-9 bg-input border border-border rounded px-2 text-xs"
              >
                {data.cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.year} {c.make} {c.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Type</span>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {CAR_EXPENSE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEType(t)}
                    className={`hud-label text-[10px] py-2 rounded border ${eType === t ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Amount $"
                value={eAmount}
                onChange={(e) => setEAmount(e.target.value)}
                className="h-9 text-xs"
              />
              <Input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} className="h-9 text-xs" />
            </div>
            {eType === "Gas" && (
              <div className="grid grid-cols-3 gap-3 p-3 border border-primary/30 rounded bg-primary/5">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Gallons"
                  value={eGallons}
                  onChange={(e) => setEGallons(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="$/gallon"
                  value={ePPG}
                  onChange={(e) => setEPPG(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Mileage"
                  value={eMileage}
                  onChange={(e) => setEMileage(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}
            <Input
              placeholder="Notes"
              value={eNotes}
              onChange={(e) => setENotes(e.target.value)}
              className="h-9 text-xs"
            />
            <div className="hud-label text-[10px] text-muted-foreground flex items-center gap-1">
              <Fuel className="h-3 w-3" /> Auto-creates a transaction in Wealth.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={submitExp} className="hud-label text-[10px]">
              Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event modal */}
      <Dialog open={evOpen} onOpenChange={setEvOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">Add Car Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Event name"
              value={evName}
              onChange={(e) => setEvName(e.target.value)}
              className="h-9 text-xs"
            />
            <Input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="h-9 text-xs" />
            <Input
              placeholder="Location"
              value={evLoc}
              onChange={(e) => setEvLoc(e.target.value)}
              className="h-9 text-xs"
            />
            <textarea
              placeholder="Description"
              value={evDesc}
              onChange={(e) => setEvDesc(e.target.value)}
              rows={2}
              className="w-full bg-input border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={submitEvent} className="hud-label text-[10px]">
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ GUITAR ============

const GUITAR_TODO_PREFIX = "guitar-practice-";
const guitarTodoIdFor = (date: string) => `${GUITAR_TODO_PREFIX}${date}`;

function GuitarSection({ weeklyGuitarHrs }: { weeklyGuitarHrs: number }) {
  const { data, mutate } = useEvolutionData();
  const timer = useFocusTimer();

  // Auto-tag the focus timer as "Guitar" when started from this page
  const startGuitarSession = () => {
    timer.setMode("focus");
    timer.setTag("Guitar");
    if (!timer.task) timer.setTask("Guitar Practice");
    timer.start();

    // Ensure today's guitar to-do exists
    const todoId = guitarTodoIdFor(todayDate());
    mutate((p) => {
      if (p.notes.find((n) => n.id === todoId)) return {};
      const newTodo: TodoItem = { id: todoId, text: `🎸 Guitar Practice — ${todayDate()}`, done: false };
      return { notes: [...p.notes, newTodo] };
    });
  };

  // Listen for completed guitar focus sessions and mark today's to-do done
  // (we detect via the most recent focus session tagged Guitar today)
  const todayGuitarFocus = data.focusSessions.filter(
    (s) => s.tag === "Guitar" && localISO(new Date(s.completedAt)) === todayDate(),
  );
  const todoCompleted = data.notes.find((n) => n.id === guitarTodoIdFor(todayDate()))?.done;
  if (todayGuitarFocus.length > 0 && todoCompleted === false) {
    // Mark complete (effect-free state set is ok since mutate triggers re-render)
    setTimeout(
      () =>
        mutate((p) => ({
          notes: p.notes.map((n) => (n.id === guitarTodoIdFor(todayDate()) ? { ...n, done: true } : n)),
        })),
      0,
    );
  }

  // Manual practice log (kept for offline sessions)
  const [logOpen, setLogOpen] = useState(false);
  const [lDur, setLDur] = useState("30");
  const [lWhat, setLWhat] = useState("");
  const submitLog = () => {
    if (!lWhat.trim()) return;
    const session: GuitarSession = {
      id: uid(),
      date: todayDate(),
      durationMin: Number(lDur) || 0,
      practiced: lWhat.trim(),
    };
    const focusEntry: FocusSession = {
      id: guitarMirrorId(session.id),
      startedAt: Date.now() - session.durationMin * 60000,
      completedAt: Date.now(),
      durationSec: session.durationMin * 60,
      mode: "focus",
      task: `Guitar: ${session.practiced}`,
      tag: "Guitar",
    };
    mutate((p) => ({
      guitarSessions: [...p.guitarSessions, session],
      focusSessions: [...p.focusSessions, focusEntry],
    }));
    setLWhat("");
    setLogOpen(false);
  };
  const delSession = (id: string) => mutate((p) => deleteGuitarSession(p, id));

  // Skills
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const addSkill = () => {
    if (!skillName.trim()) return;
    const s: GuitarSkill = { id: uid(), name: skillName.trim(), level: skillLevel };
    mutate((p) => ({ guitarSkills: [...p.guitarSkills, s] }));
    setSkillName("");
    setSkillLevel("Beginner");
  };
  const updateSkill = (id: string, level: SkillLevel) =>
    mutate((p) => ({ guitarSkills: p.guitarSkills.map((s) => (s.id === id ? { ...s, level } : s)) }));
  const delSkill = (id: string) => mutate((p) => ({ guitarSkills: p.guitarSkills.filter((s) => s.id !== id) }));
  const skillPct = (lvl: SkillLevel) => (SKILL_LEVELS.indexOf(lvl) + 1) * 20;

  // Songs
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songProg, setSongProg] = useState("0");
  const [songDate, setSongDate] = useState("");
  const addSong = () => {
    if (!songTitle.trim()) return;
    const s: GuitarSong = {
      id: uid(),
      title: songTitle.trim(),
      artist: songArtist.trim(),
      progress: Number(songProg) || 0,
      targetDate: songDate || todayDate(),
    };
    mutate((p) => ({ guitarSongs: [...p.guitarSongs, s] }));
    setSongTitle("");
    setSongArtist("");
    setSongProg("0");
    setSongDate("");
  };
  const updateSong = (id: string, progress: number) =>
    mutate((p) => ({
      guitarSongs: p.guitarSongs.map((s) =>
        s.id === id ? { ...s, progress: Math.max(0, Math.min(100, progress)) } : s,
      ),
    }));
  const delSong = (id: string) => mutate((p) => ({ guitarSongs: p.guitarSongs.filter((s) => s.id !== id) }));

  // Streak
  const streak = useMemo(() => {
    const days = new Set<string>();
    data.guitarSessions.forEach((s) => days.add(s.date));
    data.focusSessions.filter((s) => s.tag === "Guitar").forEach((s) => days.add(localISO(new Date(s.completedAt))));
    let n = 0;
    const cursor = new Date();
    if (!days.has(localISO(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(localISO(cursor))) {
      n++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return n;
  }, [data.guitarSessions, data.focusSessions]);

  const ringPct = timer.totalMs > 0 ? (timer.remainingMs / timer.totalMs) * 100 : 0;
  const isGuitarSession = timer.tag === "Guitar";

  return (
    <>
      {/* Hero */}
      <div className="evo-surface relative flex items-start justify-between gap-4 rounded-lg border border-border bg-black/40 p-5 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2">
            <Music className="h-4 w-4" /> Guitar
          </h2>
          <p className="hud-label text-[10px] text-muted-foreground mt-1">
            Practice timer connects to Focus Mode and logs sessions tagged #Guitar.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">This Week</div>
              <div className="hud-label text-lg text-primary tabular-nums">{weeklyGuitarHrs.toFixed(1)}h</div>
            </div>
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">Skills</div>
              <div className="hud-label text-lg text-foreground tabular-nums">{data.guitarSkills.length}</div>
            </div>
            <div>
              <div className="hud-label text-[10px] text-muted-foreground">Songs</div>
              <div className="hud-label text-lg text-foreground tabular-nums">{data.guitarSongs.length}</div>
            </div>
          </div>
        </div>
        <HoloFloat src={guitarImg} width={220} height={320} className="shrink-0 hidden sm:block" />
      </div>

      {/* Practice Timer */}
      <Panel title="Practice Timer · Connected to Focus Mode">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="hud-label text-[10px] text-muted-foreground">
            {isGuitarSession ? (
              <span className="text-accent">▸ Guitar session active</span>
            ) : (
              "Tag will be set to #Guitar automatically"
            )}
          </div>

          <div className="relative" style={{ width: 240, height: 240 }}>
            <div className="absolute inset-0 holo-jarvis">
              <div className="holo-j-base" />
              <div className="holo-j-base holo-j-base--inner" />
              <div className="holo-j-orbit holo-j-orbit--1" />
              <div className="holo-j-orbit holo-j-orbit--2" />
              <div className="holo-j-orbit holo-j-orbit--3" />
              <div className="holo-j-scan" />
            </div>
            <RingSvg pct={ringPct} size={240} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="hud-label text-primary hud-glow text-4xl tabular-nums">
                {formatMmSs(timer.remainingMs)}
              </div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">
                {modeLabel(timer.mode).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!timer.running ? (
              <button
                onClick={startGuitarSession}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2 hud-glow"
              >
                <Play className="h-4 w-4" /> Start Practice
              </button>
            ) : (
              <button
                onClick={() => timer.pause()}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button
              onClick={() => timer.reset()}
              className="h-11 px-5 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <Link
              to="/focus"
              className="h-11 px-4 rounded-md border border-border text-muted-foreground hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center"
            >
              Focus settings →
            </Link>
          </div>
        </div>
      </Panel>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="This Week" value={`${weeklyGuitarHrs.toFixed(1)}h`} />
        <StatBox label="Weekly Goal" value={`${data.guitarWeeklyHoursTarget}h`} />
        <StatBox label="Streak" value={`${streak}d`} />
        <StatBox
          label="Sessions"
          value={`${data.guitarSessions.length + guitarFocusOnly(data.focusSessions, data.guitarSessions).length}`}
        />
      </div>

      <Panel title="Weekly Goal">
        <ProgressBar label="Practice hours" current={weeklyGuitarHrs} target={data.guitarWeeklyHoursTarget} />
        <div className="flex items-center gap-2 mt-3">
          <span className="hud-label text-[10px] text-muted-foreground">Set target:</span>
          <Input
            type="number"
            value={data.guitarWeeklyHoursTarget}
            onChange={(e) => mutate({ guitarWeeklyHoursTarget: Number(e.target.value) || 0 })}
            className="h-7 w-20 text-xs"
          />
          <span className="hud-label text-[10px] text-muted-foreground">hrs/week</span>
        </div>
      </Panel>

      {/* Skills */}
      <Panel title="Skills">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 mb-3">
          <Input
            placeholder="Skill name (e.g. Sweep picking)"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            className="h-9 text-xs"
          />
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
            className="h-9 bg-input border border-border rounded px-2 text-xs"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <Button onClick={addSkill} size="sm" className="hud-label text-[10px]">
            + Add
          </Button>
        </div>
        <ul className="space-y-3">
          {data.guitarSkills.map((s) => (
            <li key={s.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="hud-label text-xs text-foreground">{s.name}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={s.level}
                    onChange={(e) => updateSkill(s.id, e.target.value as SkillLevel)}
                    className="h-7 bg-input border border-border rounded px-1 text-[10px]"
                  >
                    {SKILL_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => delSkill(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${skillPct(s.level)}%`, boxShadow: "0 0 6px var(--primary)" }}
                />
              </div>
            </li>
          ))}
          {!data.guitarSkills.length && (
            <li className="text-xs text-muted-foreground py-4 text-center">No skills tracked yet.</li>
          )}
        </ul>
      </Panel>

      {/* Songs */}
      <Panel title="Songs · Learning">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_140px_auto] gap-2 mb-3">
          <Input
            placeholder="Title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="h-9 text-xs"
          />
          <Input
            placeholder="Artist"
            value={songArtist}
            onChange={(e) => setSongArtist(e.target.value)}
            className="h-9 text-xs"
          />
          <Input
            type="number"
            placeholder="% done"
            value={songProg}
            onChange={(e) => setSongProg(e.target.value)}
            className="h-9 text-xs"
          />
          <Input type="date" value={songDate} onChange={(e) => setSongDate(e.target.value)} className="h-9 text-xs" />
          <Button onClick={addSong} size="sm" className="hud-label text-[10px]">
            + Add
          </Button>
        </div>
        <ul className="space-y-3">
          {data.guitarSongs.map((s) => (
            <li key={s.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="hud-label text-xs text-foreground">{s.title}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">
                    {s.artist} · target {s.targetDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={s.progress}
                    onChange={(e) => updateSong(s.id, Number(e.target.value) || 0)}
                    className="h-7 w-16 text-xs"
                  />
                  <span className="hud-label text-[10px] text-primary">%</span>
                  <button
                    onClick={() => delSong(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
              </div>
            </li>
          ))}
          {!data.guitarSongs.length && (
            <li className="text-xs text-muted-foreground py-4 text-center">No songs in progress.</li>
          )}
        </ul>
      </Panel>

      {/* Session log */}
      <Panel title={`Session Log (${data.guitarSessions.length})`}>
        <div className="flex justify-end mb-3">
          <Button onClick={() => setLogOpen(true)} size="sm" variant="outline" className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Log Past Session
          </Button>
        </div>
        <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
          {[...data.guitarSessions].reverse().map((s) => (
            <li key={s.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 text-xs group">
              <span className="hud-label text-[10px] text-muted-foreground">{s.date}</span>
              <span className="text-foreground/85">{s.practiced}</span>
              <span className="hud-label text-primary">{s.durationMin}m</span>
              <button
                onClick={() => delSession(s.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {!data.guitarSessions.length && (
            <li className="text-xs text-muted-foreground py-4 text-center">No manual sessions logged.</li>
          )}
        </ul>
      </Panel>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3 text-primary" />
        Sessions auto-create a daily to-do; completing the timer marks it done.
      </div>

      {/* Log past session modal */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="hud-label text-primary hud-glow">Log Past Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Minutes"
              value={lDur}
              onChange={(e) => setLDur(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              placeholder="What did you practice?"
              value={lWhat}
              onChange={(e) => setLWhat(e.target.value)}
              className="h-9 text-xs"
            />
            <div className="hud-label text-[10px] text-muted-foreground">
              Also adds to Focus Mode history under #Guitar.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)} className="hud-label text-[10px]">
              Cancel
            </Button>
            <Button onClick={submitLog} className="hud-label text-[10px]">
              Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-card p-4 text-center">
      <div className="hud-label text-[10px] text-muted-foreground">{label}</div>
      <div className="hud-label text-2xl text-primary hud-glow mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function RingSvg({ pct, size }: { pct: number; size: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="color-mix(in oklab, var(--primary) 25%, transparent)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        style={{
          filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--glow) 80%, transparent))",
          transition: "stroke-dasharray 0.4s linear",
        }}
      />
    </svg>
  );
}

// ============= Interactive Vehicle HUD =============
type Hotspot = {
  id: string;
  label: string;
  detail: string;
  // % positions over the image
  x: number;
  y: number;
  action?: () => void;
  actionLabel?: string;
  value?: string;
};

function InteractiveVehicleHud({
  onAddExpense,
  onAddCar,
  onAddEvent,
  garageCount,
  monthlySpend,
  upcomingEvents,
}: {
  onAddExpense: () => void;
  onAddCar: () => void;
  onAddEvent: () => void;
  garageCount: number;
  monthlySpend: number;
  upcomingEvents: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const hotspots: Hotspot[] = [
    {
      id: "engine",
      label: "Powertrain",
      x: 28,
      y: 42,
      detail: "Engine telemetry & maintenance log.",
      value: `${garageCount} vehicle${garageCount === 1 ? "" : "s"}`,
      actionLabel: "Add Vehicle",
      action: onAddCar,
    },
    {
      id: "fuel",
      label: "Fuel / Expenses",
      x: 52,
      y: 58,
      detail: "Log gas, insurance, mods & maintenance.",
      value: `$${monthlySpend.toFixed(0)} / mo`,
      actionLabel: "Log Expense",
      action: onAddExpense,
    },
    {
      id: "events",
      label: "Meets & Events",
      x: 76,
      y: 38,
      detail: "Plan car meets, shows, track days.",
      value: `${upcomingEvents} scheduled`,
      actionLabel: "Add Event",
      action: onAddEvent,
    },
    {
      id: "wheels",
      label: "Performance",
      x: 18,
      y: 72,
      detail: "Mileage tracking & MPG analytics.",
      value: "Live",
    },
    {
      id: "cabin",
      label: "Cabin Systems",
      x: 62,
      y: 28,
      detail: "Interior, audio & comfort tracking.",
      value: "Online",
    },
  ];

  return (
    <div
      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-black select-none"
      onClick={() => setActive(null)}
    >
      <img
        src={vehicleHud}
        alt="Interactive Vehicle HUD profile"
        className="w-full h-auto block object-contain max-h-[320px] mx-auto"
        style={{ opacity: 0.95 }}
        draggable={false}
      />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, color-mix(in oklab, var(--glow) 8%, transparent) 3px 4px)",
        }}
      />

      {/* HUD corner readouts */}
      <div className="pointer-events-none absolute top-2 left-2 text-[10px] hud-label text-primary/80">
        ◢ SYS · ONLINE
      </div>
      <div className="pointer-events-none absolute top-2 right-2 text-[10px] hud-label text-primary/80 tabular-nums">
        VHX-{String(garageCount).padStart(2, "0")} · {localISO(new Date())}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] hud-label text-muted-foreground">
        Tap nodes to interact
      </div>

      {hotspots.map((h) => {
        const isActive = active === h.id;
        const isHover = hover === h.id;
        return (
          <div
            key={h.id}
            className="absolute"
            style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%,-50%)" }}
            onClick={(e) => {
              e.stopPropagation();
              setActive(isActive ? null : h.id);
            }}
            onMouseEnter={() => setHover(h.id)}
            onMouseLeave={() => setHover(null)}
          >
            {/* Pulsing ring */}
            <button
              type="button"
              aria-label={h.label}
              className="relative block h-4 w-4 sm:h-5 sm:w-5 rounded-full focus:outline-none"
              style={{
                background: "color-mix(in oklab, var(--glow) 80%, transparent)",
                boxShadow:
                  "0 0 0 2px color-mix(in oklab, var(--glow) 40%, transparent), 0 0 18px color-mix(in oklab, var(--glow) 70%, transparent)",
              }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "color-mix(in oklab, var(--glow) 50%, transparent)" }}
              />
            </button>

            {/* Label tag (hover) */}
            {isHover && !isActive && (
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap rounded border border-border bg-black/80 px-2 py-0.5 text-[10px] hud-label text-primary"
                style={{ boxShadow: "0 0 12px color-mix(in oklab, var(--glow) 40%, transparent)" }}
              >
                {h.label}
              </div>
            )}

            {/* Active popover */}
            {isActive && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-1/2 -translate-x-1/2 top-5 z-10 w-56 rounded-lg border border-border bg-black/90 p-3 backdrop-blur"
                style={{ boxShadow: "0 0 24px color-mix(in oklab, var(--glow) 50%, transparent)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="hud-label text-xs text-primary">{h.label}</div>
                  {h.value && <div className="hud-label text-[10px] text-muted-foreground tabular-nums">{h.value}</div>}
                </div>
                <p className="mt-1 text-[11px] text-foreground/80 leading-snug">{h.detail}</p>
                {h.action && h.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      h.action!();
                      setActive(null);
                    }}
                    className="mt-2 w-full rounded border border-primary/50 bg-primary/10 px-2 py-1 text-[11px] hud-label text-primary hover:bg-primary/20 transition-colors"
                  >
                    {h.actionLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Travel workspace: account-owned trip records, with a separate unsaved sample.

interface TravelActivity {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  category: string;
  estimatedCost: number;
  done: boolean;
}
interface TravelExpense {
  id: string;
  category: string;
  label: string;
  planned: number;
  /** Undefined/null means not recorded; never default an actual cost to its estimate. */
  actual?: number | null;
}
type TravelPlanTrip = Trip & {
  destinationId?: string;
  travelers?: number;
  itinerary?: TravelActivity[];
  expenses?: TravelExpense[];
};
type TripDraft = Pick<Trip, "destination" | "startDate" | "endDate" | "budget"> & { travelers?: number };

/** Strict Gregorian date-only parsing. UTC is used only as a calendar calculation,
 * never to convert the user's local timestamp into a date key. */
function validTravelDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function calendarDate(value: string): Date {
  if (!validTravelDate(value)) throw new RangeError("Use a valid YYYY-MM-DD date.");
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function dateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function shiftTravelDate(value: string, days: number): string {
  const date = calendarDate(value);
  date.setUTCDate(date.getUTCDate() + Math.trunc(days));
  return dateKey(date);
}
function travelWeek(value: string): string[] {
  const date = calendarDate(value);
  const monday = shiftTravelDate(value, -((date.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, day) => shiftTravelDate(monday, day));
}
function clampTripDate(value: string, start: string, end: string): string {
  if (!validTravelDate(start) || !validTravelDate(end) || end < start) return value;
  if (!validTravelDate(value) || value < start) return start;
  return value > end ? end : value;
}
function validateTripDraft(draft: TripDraft): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!draft.destination.trim()) errors.destination = "Enter a destination.";
  if (!validTravelDate(draft.startDate)) errors.startDate = "Choose a valid departure date.";
  if (!validTravelDate(draft.endDate)) errors.endDate = "Choose a valid return date.";
  if (!errors.startDate && !errors.endDate && draft.endDate < draft.startDate)
    errors.endDate = "Return must be on or after departure.";
  if (!Number.isFinite(draft.budget) || draft.budget < 0) errors.budget = "Budget must be zero or more.";
  const travelers = draft.travelers ?? 1;
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 99) errors.travelers = "Use 1–99 travelers.";
  return { valid: Object.keys(errors).length === 0, errors };
}
const validAmount = (amount: unknown): amount is number =>
  typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
function travelBudgetTotals(trip: Pick<TravelPlanTrip, "budget" | "expenses" | "itinerary">) {
  const expenses = trip.expenses ?? [];
  const planned = expenses.reduce((sum, item) => sum + (validAmount(item.planned) ? item.planned : 0), 0);
  const actualRows = expenses.filter((item) => validAmount(item.actual));
  const actual = actualRows.reduce((sum, item) => sum + (item.actual as number), 0);
  const itineraryEstimate = (trip.itinerary ?? []).reduce(
    (sum, item) => sum + (validAmount(item.estimatedCost) ? item.estimatedCost : 0),
    0,
  );
  // Itinerary estimates may already be covered by expense categories. Keep separate.
  const budget = validAmount(trip.budget) ? trip.budget : 0;
  return {
    planned,
    actual,
    actualEntries: actualRows.length,
    itineraryEstimate,
    remaining: budget - actual,
    plannedRemaining: budget - planned,
  };
}
function formatTravelUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}
function travelMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
}
function patchTravelTrip<T extends TravelPlanTrip>(trip: T, patch: Partial<TravelPlanTrip>): T {
  return { ...trip, ...patch, id: trip.id };
}

/** Only used for an explicitly labelled sample view. Never auto-insert into user data. */
function sampleJapanTrip(weekDate: string, id = "sample-japan"): TravelPlanTrip {
  const days = travelWeek(weekDate);
  const titles = [
    "Arrive in Tokyo",
    "Explore Shibuya",
    "Mount Fuji day trip",
    "Kyoto temples",
    "Osaka food walk",
    "Nara day trip",
    "Return from Tokyo",
  ];
  const places = [
    "Tokyo Station, Tokyo, Japan",
    "Shibuya Crossing, Tokyo, Japan",
    "Lake Kawaguchi, Japan",
    "Fushimi Inari Taisha, Kyoto, Japan",
    "Dotonbori, Osaka, Japan",
    "Nara Park, Japan",
    "Tokyo Station, Tokyo, Japan",
  ];
  const estimates = [80, 60, 100, 50, 70, 50, 40];
  return {
    id,
    destination: "Japan",
    destinationId: "japan",
    startDate: days[0],
    endDate: days[6],
    budget: 2400,
    status: "Planning",
    travelers: 1,
    notes: "SAMPLE ONLY. Illustrative schedule and USD planning figures, not a booking, live quote, or personal trip.",
    packing: [],
    itinerary: days.map((date, i) => ({
      id: `${id}-day-${i}`,
      date,
      time: i === 0 ? "15:00" : "09:00",
      title: titles[i],
      location: places[i],
      category: i === 0 || i === 6 ? "Transport" : "Experience",
      estimatedCost: estimates[i],
      done: false,
    })),
    expenses: [
      { id: `${id}-flight`, category: "Flights", label: "Illustrative flight allowance", planned: 900, actual: null },
      { id: `${id}-stay`, category: "Stay", label: "Illustrative accommodation allowance", planned: 700, actual: null },
      { id: `${id}-food`, category: "Food", label: "Illustrative food allowance", planned: 300, actual: null },
      {
        id: `${id}-transport`,
        category: "Transport",
        label: "Illustrative local transport",
        planned: 200,
        actual: null,
      },
      {
        id: `${id}-experiences`,
        category: "Experiences",
        label: "Illustrative activities",
        planned: 200,
        actual: null,
      },
    ],
  };
}

interface AtlasDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  image: string;
}
interface TravelAtlasProps {
  destinations: AtlasDestination[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

type AtlasCoordinate = [number, number]; // longitude, latitude
// Intentionally simplified coastlines, not political boundaries. City pins use geographic coordinates.
const ATLAS_LAND: AtlasCoordinate[][] = [
  [
    [-168, 66],
    [-156, 71],
    [-140, 70],
    [-130, 72],
    [-112, 73],
    [-95, 76],
    [-82, 73],
    [-62, 60],
    [-64, 47],
    [-53, 47],
    [-60, 43],
    [-72, 43],
    [-75, 35],
    [-81, 25],
    [-83, 29],
    [-90, 29],
    [-97, 26],
    [-97, 21],
    [-87, 21],
    [-87, 16],
    [-83, 10],
    [-78, 8],
    [-78, 6],
    [-84, 9],
    [-92, 15],
    [-105, 20],
    [-112, 28],
    [-115, 29],
    [-118, 34],
    [-124, 42],
    [-130, 52],
    [-139, 59],
    [-152, 59],
    [-165, 55],
    [-168, 60],
    [-168, 66],
  ],
  [
    [-73, 60],
    [-60, 60],
    [-43, 60],
    [-22, 70],
    [-20, 79],
    [-40, 84],
    [-59, 81],
    [-73, 73],
    [-73, 60],
  ],
  [
    [-81, 12],
    [-71, 11],
    [-62, 10],
    [-52, 4],
    [-50, 0],
    [-35, -5],
    [-35, -12],
    [-40, -22],
    [-49, -29],
    [-54, -36],
    [-63, -42],
    [-67, -55],
    [-74, -51],
    [-76, -37],
    [-72, -18],
    [-81, -5],
    [-81, 12],
  ],
  [
    [-10, 36],
    [-9, 43],
    [-2, 44],
    [-5, 48],
    [-1, 51],
    [5, 53],
    [8, 57],
    [6, 58],
    [6, 62],
    [15, 70],
    [29, 71],
    [32, 65],
    [45, 67],
    [60, 70],
    [90, 75],
    [110, 73],
    [135, 71],
    [160, 70],
    [179, 65],
    [174, 60],
    [164, 60],
    [157, 51],
    [146, 46],
    [140, 43],
    [135, 35],
    [129, 34],
    [127, 38],
    [121, 39],
    [118, 32],
    [122, 25],
    [116, 22],
    [110, 20],
    [108, 10],
    [104, 1],
    [100, 4],
    [98, 14],
    [91, 22],
    [86, 21],
    [80, 9],
    [77, 8],
    [73, 20],
    [68, 23],
    [62, 26],
    [57, 25],
    [51, 13],
    [43, 12],
    [42, 18],
    [36, 28],
    [32, 31],
    [35, 36],
    [29, 41],
    [26, 40],
    [23, 36],
    [20, 40],
    [17, 40],
    [16, 38],
    [12, 42],
    [9, 44],
    [7, 43],
    [3, 42],
    [0, 40],
    [-5, 36],
    [-10, 36],
  ],
  [
    [-17, 15],
    [-17, 22],
    [-12, 29],
    [-6, 36],
    [10, 37],
    [24, 32],
    [32, 31],
    [35, 23],
    [43, 12],
    [51, 11],
    [45, 2],
    [41, -2],
    [40, -12],
    [35, -20],
    [32, -26],
    [26, -34],
    [18, -35],
    [14, -23],
    [12, -17],
    [12, -5],
    [8, 4],
    [1, 6],
    [-8, 5],
    [-15, 10],
    [-17, 15],
  ],
  [
    [112, -11],
    [121, -14],
    [130, -12],
    [137, -12],
    [141, -10],
    [146, -17],
    [153, -25],
    [151, -33],
    [145, -39],
    [137, -36],
    [130, -32],
    [121, -34],
    [114, -27],
    [112, -21],
    [112, -11],
  ],
  [
    [45, -13],
    [50, -16],
    [49, -25],
    [45, -26],
    [43, -20],
    [45, -13],
  ],
  [
    [130, 31],
    [133, 34],
    [137, 35],
    [141, 41],
    [144, 44],
    [146, 44],
    [145, 42],
    [141, 40],
    [140, 36],
    [135, 33],
    [131, 31],
    [130, 31],
  ],
  [
    [95, 5],
    [103, -1],
    [106, -6],
    [104, -6],
    [98, 0],
    [95, 5],
  ],
  [
    [109, 7],
    [117, 7],
    [119, 1],
    [115, -4],
    [109, -3],
    [109, 7],
  ],
  [
    [106, -6],
    [115, -8],
    [122, -9],
    [119, -10],
    [110, -8],
    [106, -6],
  ],
  [
    [131, -1],
    [140, -3],
    [150, -6],
    [147, -10],
    [139, -8],
    [131, -4],
    [131, -1],
  ],
  [
    [120, 19],
    [123, 15],
    [125, 11],
    [126, 6],
    [122, 7],
    [120, 14],
    [120, 19],
  ],
  [
    [166, -35],
    [173, -40],
    [178, -39],
    [177, -37],
    [173, -35],
    [166, -35],
  ],
  [
    [166, -47],
    [171, -44],
    [174, -41],
    [170, -42],
    [166, -45],
    [166, -47],
  ],
  [
    [-8, 50],
    [-5, 50],
    [1, 52],
    [-2, 56],
    [-4, 59],
    [-7, 58],
    [-5, 54],
    [-8, 50],
  ],
  [
    [-10, 51],
    [-6, 51],
    [-6, 55],
    [-9, 55],
    [-10, 51],
  ],
  [
    [-25, 64],
    [-14, 64],
    [-14, 67],
    [-22, 67],
    [-25, 64],
  ],
  [
    [-85, 22],
    [-79, 23],
    [-74, 20],
    [-78, 20],
    [-85, 22],
  ],
];
const atlasRad = (n: number) => (n * Math.PI) / 180;
function atlasContains(lon: number, lat: number, polygon: AtlasCoordinate[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i],
      [xj, yj] = polygon[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const ATLAS_DOTS: AtlasCoordinate[] = [];
for (let lat = -55; lat <= 80; lat += 3)
  for (let lon = -177; lon <= 180; lon += 3) {
    if (ATLAS_LAND.some((p) => atlasContains(lon, lat, p))) ATLAS_DOTS.push([lon, lat]);
  }

function TravelAtlas({ destinations, selectedId, onSelect, compact = false }: TravelAtlasProps) {
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const selected = destinations.find((d) => d.id === selectedId) ?? destinations[0];
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState({ id: selectedId, offset: 0 });
  const offset = view.id === selectedId ? view.offset : 0;
  const centerLon = (selected?.lon ?? 20) - 12 + offset;
  const centerLat = Math.max(-25, Math.min(40, (selected?.lat ?? 25) * 0.65));
  const geometry = useMemo(() => {
    const r = 220 * zoom,
      lat0 = atlasRad(centerLat),
      lon0 = atlasRad(centerLon);
    const project = ([lon, lat]: AtlasCoordinate) => {
      const la = atlasRad(lat),
        dl = atlasRad(lon) - lon0;
      const depth = Math.sin(lat0) * Math.sin(la) + Math.cos(lat0) * Math.cos(la) * Math.cos(dl);
      return {
        x: 320 + r * Math.cos(la) * Math.sin(dl),
        y: 272 - r * (Math.cos(lat0) * Math.sin(la) - Math.sin(lat0) * Math.cos(la) * Math.cos(dl)),
        visible: depth >= 0.015,
      };
    };
    const line = (points: AtlasCoordinate[]) => {
      let drawing = false,
        path = "";
      for (const point of points) {
        const p = project(point);
        if (!p.visible) {
          drawing = false;
          continue;
        }
        path += `${drawing ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)} `;
        drawing = true;
      }
      return path;
    };
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 20)
      grid.push(line(Array.from({ length: 181 }, (_, i) => [i * 2 - 180, lat] as AtlasCoordinate)));
    for (let lon = -180; lon < 180; lon += 30)
      grid.push(line(Array.from({ length: 91 }, (_, i) => [lon, i * 2 - 90] as AtlasCoordinate)));
    const coasts = ATLAS_LAND.map((poly) => {
      const fine: AtlasCoordinate[] = [];
      for (let i = 1; i < poly.length; i++) {
        const a = poly[i - 1],
          b = poly[i];
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 2));
        for (let s = 0; s < steps; s++)
          fine.push([a[0] + ((b[0] - a[0]) * s) / steps, a[1] + ((b[1] - a[1]) * s) / steps]);
      }
      fine.push(poly[poly.length - 1]);
      return line(fine);
    });
    const dots = ATLAS_DOTS.map(project)
      .filter((p) => p.visible)
      .map((p) => `M${p.x.toFixed(1)},${p.y.toFixed(1)}h.15`)
      .join(" ");
    return { r, grid, coasts, dots, pins: destinations.map((d) => ({ ...d, ...project([d.lon, d.lat]) })) };
  }, [destinations, centerLat, centerLon, zoom]);
  const rotate = (direction: number) => setView({ id: selectedId, offset: offset + direction * 40 });
  return (
    <section
      className={`travel-atlas ${compact ? "travel-atlas--compact" : ""}`}
      aria-label="Interactive destination globe"
    >
      <style>{ATLAS_STYLE}</style>
      <div className="travel-atlas__top">
        <span>THE WORLD IS OPEN</span>
        <span className="travel-atlas__signal">EXPLORE</span>
      </div>
      <div className="travel-atlas__stage">
        <svg
          viewBox="0 0 640 565"
          className="travel-atlas__globe"
          aria-label="Geographic destination globe. Use destination buttons below to select a place."
          role="img"
        >
          <defs>
            <radialGradient id={`${safeId}sea`} cx="37%" cy="30%">
              <stop offset="0" stopColor="#123d5d" />
              <stop offset=".55" stopColor="#041b30" />
              <stop offset="1" stopColor="#01080f" />
            </radialGradient>
            <radialGradient id={`${safeId}aura`}>
              <stop offset=".7" stopColor="#009cff" stopOpacity="0" />
              <stop offset=".86" stopColor="#12baff" stopOpacity=".17" />
              <stop offset="1" stopColor="#12baff" stopOpacity="0" />
            </radialGradient>
            <filter id={`${safeId}glow`} x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <clipPath id={`${safeId}bounds`}>
              <rect width="640" height="535" rx="16" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${safeId}bounds)`}>
            <circle cx="320" cy="272" r={geometry.r + 43} fill={`url(#${safeId}aura)`} />
            <ellipse cx="320" cy="499" rx="204" ry="24" fill="none" stroke="#1ba6e8" strokeOpacity=".24" />
            <ellipse cx="320" cy="499" rx="237" ry="38" fill="none" stroke="#1ba6e8" strokeOpacity=".12" />
            <circle cx="320" cy="272" r={geometry.r} fill={`url(#${safeId}sea)`} stroke="#35bbf4" strokeWidth="1.6" />
            {geometry.grid.map((d, i) => (
              <path key={`grid${i}`} d={d} fill="none" stroke="#2793c0" strokeWidth=".6" opacity=".24" />
            ))}
            <path d={geometry.dots} stroke="#50c9ed" strokeWidth="2.1" strokeLinecap="round" opacity=".55" />
            {geometry.coasts.map((d, i) => (
              <path key={`coast${i}`} d={d} fill="none" stroke="#7bdef5" strokeWidth="1.1" opacity=".65" />
            ))}
            <circle
              cx="320"
              cy="272"
              r={geometry.r + 6}
              fill="none"
              stroke="#48cfff"
              strokeOpacity=".3"
              strokeDasharray="1 9"
            />
            {geometry.pins
              .filter((d) => d.visible)
              .map((d) => (
                <g
                  key={d.id}
                  transform={`translate(${d.x},${d.y})`}
                  className="travel-atlas__pin"
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${d.name}, ${d.country}`}
                  aria-pressed={d.id === selectedId}
                  onClick={() => onSelect(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(d.id);
                    }
                  }}
                >
                  <title>
                    {d.name}, {d.country}
                  </title>
                  <circle r="20" fill="#041828" fillOpacity=".01" />
                  <circle r={d.id === selectedId ? 15 : 8} fill="#23c7ff" opacity=".5" filter={`url(#${safeId}glow)`} />
                  <circle r={d.id === selectedId ? 12 : 7} fill="#05243b" stroke="#58dcff" strokeWidth="1.5" />
                  <circle r={d.id === selectedId ? 5 : 3} fill="#defaff" />
                  {d.id === selectedId && (
                    <circle r="20" fill="none" stroke="#39c8ff" strokeOpacity=".5" strokeWidth="1" />
                  )}
                </g>
              ))}
          </g>
          <text x="320" y="551" textAnchor="middle" fill="#597d93" fontSize="9" letterSpacing="2">
            SIMPLIFIED GEOGRAPHIC VIEW · NOT FOR NAVIGATION
          </text>
        </svg>
        <div className="travel-atlas__headline">
          <span>Find your next</span>
          <strong>somewhere.</strong>
        </div>
        <div className="travel-atlas__controls" aria-label="Globe view controls">
          <button type="button" onClick={() => rotate(-1)} aria-label="Rotate globe west">
            ←
          </button>
          <button type="button" onClick={() => rotate(1)} aria-label="Rotate globe east">
            →
          </button>
          <span aria-hidden="true" />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.45, +(z + 0.15).toFixed(2)))}
            disabled={zoom >= 1.45}
            aria-label="Zoom in globe"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
            disabled={zoom <= 0.85}
            aria-label="Zoom out globe"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setView({ id: selectedId, offset: 0 });
            }}
            aria-label="Recenter globe on selected destination"
          >
            ◎
          </button>
        </div>
        {selected && (
          <div className="travel-atlas__readout">
            <span>DESTINATION IN FOCUS</span>
            <strong>{selected.name}</strong>
            <small>
              {selected.country} · {Math.abs(selected.lat).toFixed(2)}° {selected.lat < 0 ? "S" : "N"} /{" "}
              {Math.abs(selected.lon).toFixed(2)}° {selected.lon < 0 ? "W" : "E"}
            </small>
          </div>
        )}
      </div>
      <div className="travel-atlas__destinations" aria-label="Choose destination">
        {destinations.map((d) => (
          <button
            type="button"
            key={d.id}
            className={d.id === selectedId ? "is-active" : ""}
            onClick={() => {
              setView({ id: d.id, offset: 0 });
              onSelect(d.id);
            }}
            aria-pressed={d.id === selectedId}
          >
            <img src={d.image} alt="" loading="lazy" />
            <span>
              <strong>{d.name}</strong>
              <small>{d.country}</small>
            </span>
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
    </section>
  );
}

const ATLAS_STYLE = `
.travel-atlas{position:relative;min-width:0;overflow:hidden;border:1px solid #16455d;border-radius:14px;background:radial-gradient(ellipse at 48% 47%,#09263b 0%,#030d17 53%,#03080f 85%);color:#e6f5ff;isolation:isolate}.travel-atlas::after{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(#1a638715 1px,transparent 1px),linear-gradient(90deg,#1a638715 1px,transparent 1px);background-size:40px 40px;mask-image:linear-gradient(black,transparent)}.travel-atlas__top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:18px 22px 0;font-size:9px;letter-spacing:.2em;color:#77a7c1}.travel-atlas__signal{color:#4bd7ff;display:flex;gap:6px;align-items:center}.travel-atlas__signal::before{content:'';width:5px;height:5px;border-radius:50%;background:#4bd7ff;box-shadow:0 0 10px #4bd7ff}.travel-atlas__stage{position:relative;min-width:0}.travel-atlas__globe{display:block;width:100%;height:auto;min-height:280px;max-height:650px;overflow:hidden}.travel-atlas__headline{position:absolute;top:25px;left:24px;pointer-events:none;display:grid;text-shadow:0 2px 18px #010b13}.travel-atlas__headline span{font-size:clamp(13px,1.5vw,20px);color:#a2becd}.travel-atlas__headline strong{font-size:clamp(26px,3vw,42px);font-weight:500;letter-spacing:-.045em;line-height:1.1}.travel-atlas__readout{position:absolute;bottom:47px;left:24px;display:grid;gap:3px;padding:12px 15px;background:#03111de8;border-left:2px solid #31c8ff;border-radius:0 6px 6px 0;max-width:calc(100% - 90px)}.travel-atlas__readout>span{font-size:8px;letter-spacing:.17em;color:#54bde3}.travel-atlas__readout strong{font-size:20px;font-weight:500;line-height:1.2}.travel-atlas__readout small{font-size:9px;color:#87a8bc}.travel-atlas__controls{position:absolute;right:16px;bottom:45px;display:flex;flex-direction:column;gap:3px;padding:4px;border:1px solid #25516b;border-radius:7px;background:#03101de8}.travel-atlas__controls button{width:28px;height:27px;display:grid;place-items:center;color:#78dfff;background:transparent;border:0;font-size:18px;cursor:pointer;line-height:1}.travel-atlas__controls span{height:1px;background:#23445c;margin:2px}.travel-atlas__controls button:disabled{opacity:.3;cursor:default}.travel-atlas__controls button:hover:not(:disabled){background:#0e3850;border-radius:4px}.travel-atlas__controls button:focus-visible,.travel-atlas__destinations button:focus-visible{outline:2px solid #74e6ff;outline-offset:2px}.travel-atlas__pin{cursor:pointer;outline:none}.travel-atlas__pin:focus-visible>circle{stroke:#fff;stroke-width:3}.travel-atlas__destinations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 18px 18px}.travel-atlas__destinations button{display:flex;align-items:center;gap:8px;min-width:0;padding:7px;border:1px solid #17384c;border-radius:7px;background:#05121f;color:#d5e8f3;cursor:pointer;text-align:left;transition:border-color .15s,background .15s}.travel-atlas__destinations button.is-active{border-color:#24b7ef;background:#0b2940;box-shadow:inset 0 0 16px #006fab20}.travel-atlas__destinations button:hover{border-color:#42b8e0}.travel-atlas__destinations img{width:35px;height:37px;object-fit:cover;border-radius:4px;background:#102737}.travel-atlas__destinations span{display:grid;min-width:0;gap:2px}.travel-atlas__destinations strong{font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.travel-atlas__destinations small{font-size:9px;color:#7c9caf;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.travel-atlas__destinations b{color:#41c5ee;margin-left:auto;font-weight:400;font-size:13px}.travel-atlas--compact .travel-atlas__globe{max-height:390px}.travel-atlas--compact .travel-atlas__destinations{grid-template-columns:repeat(2,minmax(0,1fr))}.travel-atlas--compact .travel-atlas__headline strong{font-size:30px}@media(max-width:600px){.travel-atlas__top{padding:14px 14px 0;font-size:8px}.travel-atlas__headline{left:17px;top:17px}.travel-atlas__headline span{font-size:12px}.travel-atlas__headline strong{font-size:27px}.travel-atlas__destinations{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0 12px 12px}.travel-atlas__readout{bottom:35px;left:14px;padding:8px 10px}.travel-atlas__readout strong{font-size:17px}.travel-atlas__readout small{font-size:8px}.travel-atlas__controls{right:10px;bottom:29px;gap:1px}.travel-atlas__controls button{width:25px;height:24px}.travel-atlas__globe{min-height:300px}.travel-atlas__destinations img{width:30px;height:32px}}@media(prefers-reduced-motion:reduce){.travel-atlas *{transition:none!important}}
`;

const travelPhoto = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const TRAVEL_DESTINATIONS = [
  {
    id: "japan",
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    region: "Asia",
    image: travelPhoto("photo-1749916883702-3ec86fe13f2e"),
    subtitle: "Tradition meets tomorrow",
    description:
      "Temple paths, neighborhood food stops, and luminous city nights. Build your own route through Tokyo, Kyoto, Osaka, and beyond.",
    tags: ["Culture", "Food", "Nature"],
    places: ["Shibuya Crossing, Tokyo, Japan", "Fushimi Inari Taisha, Kyoto, Japan", "Lake Kawaguchi, Japan"],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lon: 2.3522,
    region: "Europe",
    image: travelPhoto("photo-1502602898657-3e91760cbb34"),
    subtitle: "Art. Architecture. Slow mornings.",
    description:
      "Make room for neighborhood walks, galleries, cafés, and time beside the Seine. Save the places you want to explore.",
    tags: ["Art", "Culture", "City"],
    places: ["Eiffel Tower, Paris, France", "Louvre Museum, Paris, France", "Montmartre, Paris, France"],
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
    region: "Europe",
    image: travelPhoto("photo-1513635269975-59663e0ac1ad"),
    subtitle: "Old stories. New perspectives.",
    description:
      "Historic landmarks, museum afternoons, and contrasting neighborhoods. Turn a list of ideas into an intentional week.",
    tags: ["History", "Museums", "City"],
    places: ["Westminster, London, UK", "British Museum, London, UK", "South Bank, London, UK"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    lat: -8.5069,
    lon: 115.2625,
    region: "Asia",
    image: travelPhoto("photo-1537996194471-e657df975ab4"),
    subtitle: "Find a slower rhythm",
    description: "Rice terraces, coastlines, and quiet time. Plan travel days and rest days with equal care.",
    tags: ["Nature", "Coast", "Rest"],
    places: ["Ubud, Bali, Indonesia", "Uluwatu, Bali, Indonesia", "Sanur, Bali, Indonesia"],
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    region: "Americas",
    image: travelPhoto("photo-1485871981521-5b1fd3805eee"),
    subtitle: "A city of possibilities",
    description:
      "Street photography, skyline views, and neighborhood discoveries. Keep your plans flexible and your favorites together.",
    tags: ["City", "Photography", "Food"],
    places: ["Central Park, New York, USA", "Brooklyn Bridge, New York, USA", "The High Line, New York, USA"],
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lon: 55.2708,
    region: "Middle East",
    image: travelPhoto("photo-1512453979798-5ea266f8880c"),
    subtitle: "Desert meets the skyline",
    description:
      "Modern architecture, old-town markets, and desert landscapes. Shape a trip around the experiences that matter to you.",
    tags: ["Architecture", "Desert", "City"],
    places: ["Dubai Creek, Dubai, UAE", "Downtown Dubai, UAE", "Jumeirah, Dubai, UAE"],
  },
];
const TRAVEL_CATEGORIES = ["Flights", "Stay", "Food", "Transport", "Experiences", "Shopping", "Other"];
const TRAVEL_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const travelShortDate = (date: string) =>
  validTravelDate(date)
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Dates not set";
const travelStatusList: TripStatus[] = ["Planning", "Booked", "In Progress", "Completed"];

function applyTravelTripEdit(
  trips: TravelPlanTrip[],
  draft: TravelPlanTrip,
  editing: boolean,
): { next: TravelPlanTrip | null; error: string | null } {
  const current = trips.find((trip) => trip.id === draft.id);
  if (editing && !current)
    return { next: null, error: "This trip was removed elsewhere. Close this editor and create a new trip if needed." };
  if (
    editing &&
    (current?.itinerary ?? []).some((activity) => activity.date < draft.startDate || activity.date > draft.endDate)
  )
    return {
      next: null,
      error:
        "These dates exclude existing activities. Reschedule or remove those activities before shortening the trip.",
    };
  // Only the fields exposed in this dialog are applied. Preserve fresh nested records.
  const next =
    editing && current
      ? {
          ...current,
          destination: draft.destination.trim(),
          startDate: draft.startDate,
          endDate: draft.endDate,
          budget: draft.budget,
          travelers: draft.travelers,
          status: draft.status,
          notes: draft.notes,
        }
      : { ...draft, destination: draft.destination.trim() };
  return { next, error: null };
}

function TravelWorkspace() {
  const { data, mutate } = useEvolutionData();
  const [view, setView] = useState<"explore" | "destination" | "plan" | "budget">("explore");
  const [destinationId, setDestinationId] = useState("japan");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [tripFilter, setTripFilter] = useState("Upcoming");
  const [tripId, setTripId] = useState("");
  const [sample, setSample] = useState<TravelPlanTrip>(() => sampleJapanTrip(todayDate()));
  const [sampleMode, setSampleMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayDate());
  const [planMode, setPlanMode] = useState<"schedule" | "map">("schedule");
  const [notice, setNotice] = useState("");
  const [tripEditor, setTripEditor] = useState<TravelPlanTrip | null>(null);
  const [editingExistingTrip, setEditingExistingTrip] = useState(false);
  const [activityEditor, setActivityEditor] = useState<TravelActivity | null>(null);
  const [expenseEditor, setExpenseEditor] = useState<TravelExpense | null>(null);
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [goalText, setGoalText] = useState("");
  const [packText, setPackText] = useState("");
  const trips = data.trips as TravelPlanTrip[];
  const destination = TRAVEL_DESTINATIONS.find((d) => d.id === destinationId) ?? TRAVEL_DESTINATIONS[0];
  const activeTrip = sampleMode ? sample : (trips.find((t) => t.id === tripId) ?? null);
  const goals = data.goals.filter((g) => g.id.startsWith("travel-goal-"));
  const saved = (id: string) => goals.some((g) => g.id === `travel-goal-${id}`);
  const filteredDestinations = TRAVEL_DESTINATIONS.filter(
    (d) =>
      (region === "All regions" || d.region === region) &&
      `${d.name} ${d.country} ${d.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shownTrips = trips.filter((t) => (tripFilter === "Past" ? t.status === "Completed" : t.status !== "Completed"));
  const totals = activeTrip ? travelBudgetTotals(activeTrip) : null;
  const week = travelWeek(validTravelDate(selectedDay) ? selectedDay : todayDate());
  const dayItems = [...(activeTrip?.itinerary ?? [])]
    .filter((a) => a.date === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  useEffect(() => {
    const clear = () => {
      setTripId("");
      setSampleMode(false);
      setTripEditor(null);
      setEditingExistingTrip(false);
      setGoalText("");
      setPackText("");
      setQuery("");
      setSample(sampleJapanTrip(todayDate()));
      setActivityEditor(null);
      setExpenseEditor(null);
      setDeleteTripId(null);
      setNotice("");
    };
    window.addEventListener("evolution:owner-changing", clear);
    return () => window.removeEventListener("evolution:owner-changing", clear);
  }, []);
  useEffect(() => {
    if (tripId && !trips.some((t) => t.id === tripId)) setTripId("");
  }, [trips, tripId]);
  const chooseDestination = (id: string) => {
    setDestinationId(id);
    setView("destination");
  };
  const chooseTrip = (trip: TravelPlanTrip, demo = false) => {
    setSampleMode(demo);
    setTripId(demo ? "" : trip.id);
    setDestinationId(trip.destinationId ?? "japan");
    setSelectedDay(validTravelDate(trip.startDate) ? trip.startDate : todayDate());
    setView("plan");
    setNotice("");
  };
  const patchActive = (patch: Partial<TravelPlanTrip> | ((current: TravelPlanTrip) => Partial<TravelPlanTrip>)) => {
    if (!activeTrip) return;
    if (sampleMode) {
      setSample((p) => ({ ...p, ...(typeof patch === "function" ? patch(p) : patch) }));
      setNotice("Sample changed for this preview only. Your trips were not changed.");
    } else
      mutate((p) => ({
        trips: p.trips.map((t) =>
          t.id === activeTrip.id ? { ...t, ...(typeof patch === "function" ? patch(t as TravelPlanTrip) : patch) } : t,
        ),
      }));
  };
  const toggleSave = (id: string) => {
    const d = TRAVEL_DESTINATIONS.find((item) => item.id === id)!;
    if (saved(id)) {
      setNotice(`${d.country} is already in your travel goals.`);
      return;
    }
    mutate((p) => ({
      goals: [
        ...p.goals,
        {
          id: `travel-goal-${id}`,
          title: `Visit ${d.country}`,
          category: "Hobby",
          target: 1,
          current: 0,
          deadline: "",
          unit: "trip",
          completed: false,
        },
      ],
    }));
    setNotice(`${d.country} saved to Travel goals.`);
  };
  const newTrip = () => {
    setEditingExistingTrip(false);
    setErrors([]);
    setTripEditor({
      id: uid(),
      destination: destination.country === "United States" ? destination.name : destination.country,
      destinationId: destination.id,
      startDate: todayDate(),
      endDate: shiftTravelDate(todayDate(), 6),
      budget: 0,
      status: "Planning",
      packing: [],
      travelers: 1,
      itinerary: [],
      expenses: [],
    });
  };
  const saveTrip = () => {
    if (!tripEditor) return;
    const result = validateTripDraft(tripEditor);
    if (!result.valid) {
      setErrors(Object.values(result.errors));
      return;
    }
    const applied = applyTravelTripEdit(loadEvolutionData().trips as TravelPlanTrip[], tripEditor, editingExistingTrip);
    if (!applied.next) {
      setErrors([applied.error ?? "This trip could not be saved."]);
      return;
    }
    const next = applied.next;
    const existing = editingExistingTrip;
    mutate((p) => ({
      trips: existing ? p.trips.map((t) => (t.id === next.id ? next : t)) : [...p.trips, next],
      calendar: p.calendar.map((e) =>
        e.id === `trip-${next.id}-dep`
          ? { ...e, date: next.startDate }
          : e.id === `trip-${next.id}-ret`
            ? { ...e, date: next.endDate }
            : e,
      ),
    }));
    setTripEditor(null);
    chooseTrip(next);
    setNotice(existing ? "Trip details saved." : "Trip created. No bookings or calendar events were made.");
  };
  const saveActivity = () => {
    if (!activityEditor || !activeTrip) return;
    if (
      !activityEditor.title.trim() ||
      !validTravelDate(activityEditor.date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(activityEditor.time) ||
      !Number.isFinite(activityEditor.estimatedCost) ||
      activityEditor.estimatedCost < 0
    ) {
      setErrors(["Enter a title, valid date/time, and a nonnegative estimate."]);
      return;
    }
    if (activityEditor.date < activeTrip.startDate || activityEditor.date > activeTrip.endDate) {
      setErrors(["Activity date must be within this trip's dates. Edit the trip first to extend it."]);
      return;
    }
    patchActive((current) => {
      const items = current.itinerary ?? [];
      return {
        itinerary: items.some((a) => a.id === activityEditor.id)
          ? items.map((a) => (a.id === activityEditor.id ? activityEditor : a))
          : [...items, activityEditor],
      };
    });
    setSelectedDay(activityEditor.date);
    setActivityEditor(null);
  };
  const saveExpense = () => {
    if (!expenseEditor || !activeTrip) return;
    if (
      !expenseEditor.label.trim() ||
      !Number.isFinite(expenseEditor.planned) ||
      expenseEditor.planned < 0 ||
      (expenseEditor.actual != null && (!Number.isFinite(expenseEditor.actual) || expenseEditor.actual < 0))
    ) {
      setErrors(["Enter a label and nonnegative amounts. Leave actual blank if not recorded."]);
      return;
    }
    patchActive((current) => {
      const items = current.expenses ?? [];
      return {
        expenses: items.some((a) => a.id === expenseEditor.id)
          ? items.map((a) => (a.id === expenseEditor.id ? expenseEditor : a))
          : [...items, expenseEditor],
      };
    });
    setExpenseEditor(null);
  };
  const addGoal = () => {
    if (!goalText.trim()) return;
    mutate((p) => ({
      goals: [
        ...p.goals,
        {
          id: `travel-goal-${uid()}`,
          title: goalText.trim(),
          category: "Hobby",
          target: 1,
          current: 0,
          deadline: "",
          completed: false,
        },
      ],
    }));
    setGoalText("");
  };
  const openActivity = () => {
    setErrors([]);
    const start = activeTrip && validTravelDate(activeTrip.startDate) ? activeTrip.startDate : todayDate();
    setActivityEditor({
      id: uid(),
      date:
        activeTrip && selectedDay >= activeTrip.startDate && selectedDay <= activeTrip.endDate ? selectedDay : start,
      time: "09:00",
      title: "",
      location: "",
      category: "Experiences",
      estimatedCost: 0,
      done: false,
    });
  };
  const openExpense = () => {
    setErrors([]);
    setExpenseEditor({ id: uid(), category: "Flights", label: "", planned: 0, actual: null });
  };

  return (
    <section className="travel-os" aria-label="Travel workspace">
      <style>{TRAVEL_STYLES}</style>
      <div className="travel-toolbar">
        <div>
          <span className="travel-eyebrow">HOBBY / TRAVEL</span>
          <h2>Explore. Plan. Experience.</h2>
        </div>
        <div className="travel-toolbar-actions">
          <button
            className="travel-button"
            onClick={() => {
              setSample(sampleJapanTrip(todayDate()));
              chooseTrip(sampleJapanTrip(todayDate()), true);
            }}
          >
            View Japan sample
          </button>
          <button className="travel-button primary" onClick={newTrip}>
            <Plus size={15} /> New trip
          </button>
        </div>
      </div>
      <nav className="travel-nav" aria-label="Travel sections">
        {(
          [
            ["explore", "Explore", Globe2],
            ["destination", "Destination", MapPin],
            ["plan", "Plan", CalendarDays],
            ["budget", "Budget", Wallet],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            aria-current={view === key ? "page" : undefined}
            className={view === key ? "active" : ""}
            onClick={() => setView(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      {notice && (
        <div className="travel-notice" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {view === "explore" && (
        <>
          <div className="travel-explore-grid">
            <div className="travel-panel travel-atlas-panel">
              <div className="travel-atlas-title">
                <span className="travel-eyebrow">YOUR NEXT CHAPTER</span>
                <h3>
                  EXPLORE
                  <br />
                  THE WORLD.
                </h3>
                <p>Follow your curiosity.</p>
              </div>
              <TravelAtlas destinations={TRAVEL_DESTINATIONS} selectedId={destinationId} onSelect={chooseDestination} />
            </div>
            <aside className="travel-side">
              <div className="travel-panel">
                <div className="travel-panel-heading">
                  <h3>Your trips</h3>
                  <span>{trips.length} saved</span>
                </div>
                <div className="travel-segments">
                  {["Upcoming", "Past", "Saved"].map((t) => (
                    <button key={t} className={tripFilter === t ? "active" : ""} onClick={() => setTripFilter(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                {tripFilter === "Saved" ? (
                  <div className="travel-trip-list">
                    {TRAVEL_DESTINATIONS.filter((d) => saved(d.id)).map((d) => (
                      <button key={d.id} className="travel-mini-card" onClick={() => chooseDestination(d.id)}>
                        <TravelImage src={d.image} alt={d.country} />
                        <span>
                          <strong>{d.name}</strong>
                          <small>{d.country}</small>
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    ))}
                    {!TRAVEL_DESTINATIONS.some((d) => saved(d.id)) && (
                      <TravelEmpty title="Keep your favorites close" text="Save a destination to find it here." />
                    )}
                  </div>
                ) : (
                  <div className="travel-trip-list">
                    {shownTrips.map((t) => (
                      <button key={t.id} className="travel-mini-card" onClick={() => chooseTrip(t)}>
                        <span className="travel-mini-icon">
                          <Plane size={20} />
                        </span>
                        <span>
                          <strong>{t.destination}</strong>
                          <small>
                            {travelShortDate(t.startDate)} · {t.status}
                          </small>
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    ))}
                    {!shownTrips.length && (
                      <TravelEmpty
                        title={tripFilter === "Past" ? "The story is still ahead" : "Where will you go next?"}
                        text={
                          tripFilter === "Past"
                            ? "Completed trips will appear here."
                            : "Create a trip. Build the details at your pace."
                        }
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="travel-panel">
                <div className="travel-panel-heading">
                  <h3>Travel goals</h3>
                  <Compass size={17} />
                </div>
                <div className="travel-goals">
                  {goals.map((g) => (
                    <label key={g.id}>
                      <input
                        type="checkbox"
                        checked={g.completed}
                        onChange={(e) =>
                          mutate((p) => ({
                            goals: p.goals.map((v) =>
                              v.id === g.id
                                ? { ...v, completed: e.target.checked, current: e.target.checked ? v.target : 0 }
                                : v,
                            ),
                          }))
                        }
                      />
                      <span className={g.completed ? "complete" : ""}>{g.title}</span>
                    </label>
                  ))}
                  {!goals.length && <p className="travel-muted">Save a destination or set your first travel goal.</p>}
                </div>
                <form
                  className="travel-inline-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addGoal();
                  }}
                >
                  <input
                    aria-label="New travel goal"
                    placeholder="Visit somewhere new…"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    maxLength={120}
                  />
                  <button aria-label="Add travel goal">
                    <Plus size={17} />
                  </button>
                </form>
              </div>
            </aside>
          </div>
          <div className="travel-search-row">
            <label className="travel-search">
              <Search size={17} />
              <input
                aria-label="Search destinations"
                placeholder="Find a city, country, or experience…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Filter destinations by region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {["All regions", "Asia", "Europe", "Americas", "Middle East"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="travel-destinations">
            {filteredDestinations.map((d) => (
              <article className="travel-destination-card" key={d.id}>
                <button className="travel-card-main" onClick={() => chooseDestination(d.id)}>
                  <TravelImage src={d.image} alt={`${d.name}, ${d.country}`} />
                  <span>
                    <small>{d.region}</small>
                    <strong>{d.name}</strong>
                    <em>{d.country}</em>
                  </span>
                  <ArrowRight size={18} />
                </button>
                <button
                  className={`travel-save ${saved(d.id) ? "saved" : ""}`}
                  aria-label={saved(d.id) ? `${d.country} saved` : `Save ${d.country}`}
                  onClick={() => toggleSave(d.id)}
                >
                  <Heart size={16} fill={saved(d.id) ? "currentColor" : "none"} />
                </button>
              </article>
            ))}
            {!filteredDestinations.length && (
              <TravelEmpty title="No destinations match" text="Try another city, country, or region." />
            )}
          </div>
          <div className="travel-stats">
            <div>
              <Globe2 />
              <strong>
                {new Set(trips.filter((t) => t.status === "Completed").map((t) => t.destination.toLowerCase())).size}
              </strong>
              <span>Completed destinations</span>
            </div>
            <div>
              <Plane />
              <strong>{trips.length}</strong>
              <span>Saved trips</span>
            </div>
            <div>
              <Compass />
              <strong>
                {goals.filter((g) => g.completed).length}/{goals.length}
              </strong>
              <span>Travel goals reached</span>
            </div>
          </div>
        </>
      )}
      {view === "destination" && (
        <>
          <div className="travel-destination-grid">
            <div className="travel-destination-hero">
              <TravelImage src={destination.image} alt={`${destination.country} travel inspiration`} />
              <div className="travel-hero-shade" />
              <div className="travel-hero-content">
                <button className="travel-back" onClick={() => setView("explore")}>
                  <ArrowLeft size={15} /> Destinations
                </button>
                <span className="travel-eyebrow">{destination.region}</span>
                <h3>{destination.country}</h3>
                <p className="travel-destination-tagline">{destination.subtitle}</p>
                <p>{destination.description}</p>
                <div className="travel-tags">
                  {destination.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <aside className="travel-panel travel-destination-aside">
              <div className="travel-toolbar-actions">
                <button className="travel-button" onClick={() => toggleSave(destination.id)}>
                  <Heart size={16} fill={saved(destination.id) ? "currentColor" : "none"} />
                  {saved(destination.id) ? "Saved" : "Save"}
                </button>
                <button className="travel-button primary" onClick={newTrip}>
                  Plan this trip <ArrowRight size={16} />
                </button>
              </div>
              <TravelAtlas
                compact
                destinations={TRAVEL_DESTINATIONS}
                selectedId={destination.id}
                onSelect={setDestinationId}
              />
              <a
                className="travel-map-link"
                href={travelMapsUrl(`${destination.name}, ${destination.country}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={17} />
                {destination.name}, {destination.country}
                <ExternalLink size={14} />
              </a>
              <p className="travel-muted">
                Inspiration, not a booking service. Check opening hours, travel requirements, and current prices before
                you go.
              </p>
            </aside>
          </div>
          <div className="travel-overview-grid">
            <div className="travel-panel">
              <div className="travel-panel-heading">
                <h3>Make it your own</h3>
                <Compass size={18} />
              </div>
              <p className="travel-muted">
                Choose your dates and budget, then build a daily schedule. Saved plans are separate from the example
                itinerary.
              </p>
              <div className="travel-feature-list">
                <span>
                  <CalendarDays /> A full Monday–Sunday planner
                </span>
                <span>
                  <Wallet /> Planned and recorded costs
                </span>
                <span>
                  <MapPin /> Place links beside every activity
                </span>
              </div>
              <button className="travel-button primary" onClick={newTrip}>
                <Plus size={15} /> Create my trip
              </button>
            </div>
            <div className="travel-panel">
              <div className="travel-panel-heading">
                <h3>Places to explore</h3>
                <MapPin size={18} />
              </div>
              {destination.places.map((p, i) => (
                <a
                  className="travel-place-row"
                  href={travelMapsUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={p}
                >
                  <span className="travel-place-number">0{i + 1}</span>
                  <span>{p}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
            <div className="travel-panel">
              <span className="travel-eyebrow">TRY THE WORKSPACE</span>
              <h3 className="travel-sample-title">One week in Japan.</h3>
              <p className="travel-muted">
                Explore an editable sample week before creating your own trip. Sample figures are illustrative, not
                quotes.
              </p>
              <button className="travel-button" onClick={() => chooseTrip(sample, true)}>
                Open sample itinerary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
      {(view === "plan" || view === "budget") && (
        <>
          <div className="travel-plan-picker">
            <label>
              Working trip
              <select
                aria-label="Choose working trip"
                value={sampleMode ? "sample" : tripId}
                onChange={(e) => {
                  if (e.target.value === "sample") chooseTrip(sample, true);
                  else {
                    const t = trips.find((t) => t.id === e.target.value);
                    if (t) {
                      const prev = view;
                      chooseTrip(t);
                      setView(prev);
                    } else {
                      setTripId("");
                      setSampleMode(false);
                    }
                  }
                }}
              >
                <option value="">Select a saved trip</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destination} · {t.startDate}
                  </option>
                ))}
                <option value="sample">Japan sample · not a saved trip</option>
              </select>
            </label>
            {activeTrip && (
              <span className={`travel-status ${sampleMode ? "sample" : ""}`}>
                {sampleMode ? "SAMPLE / NOT YOUR TRIP" : activeTrip.status}
              </span>
            )}
          </div>
          {!activeTrip ? (
            <div className="travel-panel travel-no-plan">
              <TravelEmpty
                title="Give your next adventure a plan"
                text="Select a saved trip, create one, or explore the clearly labeled Japan sample."
              />
              <div className="travel-toolbar-actions">
                <button className="travel-button primary" onClick={newTrip}>
                  Create trip
                </button>
                <button className="travel-button" onClick={() => chooseTrip(sample, true)}>
                  View sample
                </button>
              </div>
            </div>
          ) : (
            <>
              {sampleMode && (
                <div className="travel-sample-banner">
                  Sample itinerary and illustrative USD estimates. Edits stay in this preview and are not saved as your
                  trip. No reservations or payments.
                </div>
              )}
              <div className="travel-trip-banner">
                <TravelImage
                  src={(TRAVEL_DESTINATIONS.find((d) => d.id === activeTrip.destinationId) ?? destination).image}
                  alt="Destination inspiration"
                />
                <div className="travel-hero-shade" />
                <div>
                  <span className="travel-eyebrow">{view === "plan" ? "YOUR ITINERARY" : "TRIP BUDGET"}</span>
                  <h3>{activeTrip.destination}</h3>
                  <p>
                    {travelShortDate(activeTrip.startDate)} – {travelShortDate(activeTrip.endDate)} ·{" "}
                    {activeTrip.travelers ?? 1} traveler{(activeTrip.travelers ?? 1) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="travel-trip-actions">
                  <span>
                    Budget limit<strong>{formatTravelUSD(activeTrip.budget)}</strong>
                  </span>
                  {!sampleMode && (
                    <button
                      className="travel-button"
                      onClick={() => {
                        setErrors([]);
                        setEditingExistingTrip(true);
                        setTripEditor({ ...activeTrip });
                      }}
                    >
                      <Pencil size={14} /> Edit trip
                    </button>
                  )}
                </div>
              </div>
              {view === "plan" && (
                <div className="travel-planner-grid">
                  <div className="travel-panel travel-schedule">
                    <div className="travel-panel-heading">
                      <div>
                        <h3>Weekly schedule</h3>
                        <span>
                          {travelShortDate(week[0])} – {travelShortDate(week[6])}
                        </span>
                      </div>
                      <div className="travel-week-arrows">
                        <button
                          aria-label="Previous week"
                          onClick={() => setSelectedDay(shiftTravelDate(selectedDay, -7))}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button aria-label="Next week" onClick={() => setSelectedDay(shiftTravelDate(selectedDay, 7))}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="travel-week">
                      {week.map((day, i) => (
                        <button
                          key={day}
                          className={selectedDay === day ? "active" : ""}
                          onClick={() => setSelectedDay(day)}
                          aria-pressed={selectedDay === day}
                        >
                          <span>{TRAVEL_DAY_NAMES[i]}</span>
                          <strong>{Number(day.slice(-2))}</strong>
                          <i className={(activeTrip.itinerary ?? []).some((a) => a.date === day) ? "has-items" : ""} />
                        </button>
                      ))}
                    </div>
                    <div className="travel-schedule-toolbar">
                      <div className="travel-segments">
                        <button
                          className={planMode === "schedule" ? "active" : ""}
                          onClick={() => setPlanMode("schedule")}
                        >
                          <List size={14} /> Schedule
                        </button>
                        <button className={planMode === "map" ? "active" : ""} onClick={() => setPlanMode("map")}>
                          <Map size={14} /> Places
                        </button>
                      </div>
                      <button className="travel-button" onClick={openActivity}>
                        <Plus size={14} /> Activity
                      </button>
                    </div>
                    {planMode === "schedule" ? (
                      <div className="travel-timeline">
                        {dayItems.map((a) => (
                          <article key={a.id} className="travel-timeline-item">
                            <time>{a.time}</time>
                            <div className="travel-timeline-dot" />
                            <div className="travel-activity">
                              <div className="travel-activity-title">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={a.done}
                                    onChange={(e) =>
                                      patchActive((current) => ({
                                        itinerary: (current.itinerary ?? []).map((v) =>
                                          v.id === a.id ? { ...v, done: e.target.checked } : v,
                                        ),
                                      }))
                                    }
                                  />
                                  <strong className={a.done ? "complete" : ""}>{a.title}</strong>
                                </label>
                                <button
                                  aria-label={`Edit ${a.title}`}
                                  onClick={() => {
                                    setErrors([]);
                                    setActivityEditor({ ...a });
                                  }}
                                >
                                  <Pencil size={14} />
                                </button>
                              </div>
                              <span className="travel-muted">
                                {a.category} · Estimate {formatTravelUSD(a.estimatedCost)}
                              </span>
                              {a.location && (
                                <a
                                  className="travel-map-link"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={travelMapsUrl(a.location)}
                                >
                                  <MapPin size={13} />
                                  {a.location}
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </article>
                        ))}
                        {!dayItems.length && (
                          <TravelEmpty
                            title={
                              selectedDay < activeTrip.startDate || selectedDay > activeTrip.endDate
                                ? "Outside this trip's dates"
                                : "Leave room for discovery"
                            }
                            text={
                              selectedDay < activeTrip.startDate || selectedDay > activeTrip.endDate
                                ? "Choose a day within your trip, or edit its dates."
                                : "No activities yet. Add a place, time, and optional estimate."
                            }
                          />
                        )}
                      </div>
                    ) : (
                      <div className="travel-day-places">
                        <TravelAtlas
                          compact
                          destinations={TRAVEL_DESTINATIONS}
                          selectedId={activeTrip.destinationId ?? destinationId}
                          onSelect={setDestinationId}
                        />
                        <p className="travel-muted">
                          Destination overview. Open each address for a precise map; this is not a live navigation map.
                        </p>
                        {dayItems
                          .filter((a) => a.location)
                          .map((a) => (
                            <a
                              key={a.id}
                              className="travel-place-row"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={travelMapsUrl(a.location)}
                            >
                              <MapPin size={16} />
                              <span>{a.location}</span>
                              <ExternalLink size={14} />
                            </a>
                          ))}
                        {!dayItems.some((a) => a.location) && (
                          <p className="travel-muted">Add an activity address to see its map link here.</p>
                        )}
                      </div>
                    )}
                  </div>
                  <aside className="travel-side">
                    <div className="travel-panel">
                      <div className="travel-panel-heading">
                        <h3>
                          {TRAVEL_DAY_NAMES[week.indexOf(selectedDay)]} · {travelShortDate(selectedDay)}
                        </h3>
                        <CalendarDays size={17} />
                      </div>
                      <div className="travel-day-total">
                        <span>Day activity estimates</span>
                        <strong>{formatTravelUSD(dayItems.reduce((s, a) => s + a.estimatedCost, 0))}</strong>
                      </div>
                      <p className="travel-muted">Planning figures only. Not added again to your expense plan.</p>
                      <div className="travel-summary-row">
                        <span>Activities</span>
                        <strong>{dayItems.length}</strong>
                      </div>
                      <div className="travel-summary-row">
                        <span>Completed</span>
                        <strong>{dayItems.filter((a) => a.done).length}</strong>
                      </div>
                      <button className="travel-button full" onClick={() => setView("budget")}>
                        Open budget <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="travel-panel">
                      <div className="travel-panel-heading">
                        <h3>Packing checklist</h3>
                        <CheckCircle2 size={17} />
                      </div>
                      <div className="travel-goals">
                        {(activeTrip.packing ?? []).map((p) => (
                          <label key={p.id}>
                            <input
                              type="checkbox"
                              checked={p.done}
                              onChange={(e) =>
                                patchActive((current) => ({
                                  packing: (current.packing ?? []).map((v) =>
                                    v.id === p.id ? { ...v, done: e.target.checked } : v,
                                  ),
                                }))
                              }
                            />
                            <span className={p.done ? "complete" : ""}>{p.item}</span>
                            <button
                              aria-label={`Remove packing item ${p.item}`}
                              onClick={() =>
                                patchActive((current) => ({
                                  packing: (current.packing ?? []).filter((v) => v.id !== p.id),
                                }))
                              }
                            >
                              <X size={12} />
                            </button>
                          </label>
                        ))}
                      </div>
                      <form
                        className="travel-inline-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (packText.trim()) {
                            patchActive((current) => ({
                              packing: [...(current.packing ?? []), { id: uid(), item: packText.trim(), done: false }],
                            }));
                            setPackText("");
                          }
                        }}
                      >
                        <input
                          aria-label="New packing item"
                          placeholder="Add an essential…"
                          value={packText}
                          onChange={(e) => setPackText(e.target.value)}
                          maxLength={120}
                        />
                        <button aria-label="Add packing item">
                          <Plus size={16} />
                        </button>
                      </form>
                    </div>
                  </aside>
                </div>
              )}
              {view === "budget" && totals && (
                <>
                  <div className="travel-budget-stats">
                    <div>
                      <span>Budget limit</span>
                      <strong>{formatTravelUSD(activeTrip.budget)}</strong>
                    </div>
                    <div>
                      <span>Planned expenses</span>
                      <strong>{formatTravelUSD(totals.planned)}</strong>
                    </div>
                    <div>
                      <span>Actual recorded</span>
                      <strong>{totals.actualEntries ? formatTravelUSD(totals.actual) : "Not recorded"}</strong>
                    </div>
                    <div>
                      <span>Budget less recorded</span>
                      <strong className={totals.remaining < 0 ? "travel-over" : ""}>
                        {formatTravelUSD(totals.remaining)}
                      </strong>
                    </div>
                  </div>
                  <div className="travel-budget-grid">
                    <div className="travel-panel">
                      <div className="travel-panel-heading">
                        <h3>Expense plan</h3>
                        <button className="travel-button" onClick={openExpense}>
                          <Plus size={14} /> Expense
                        </button>
                      </div>
                      <p className="travel-muted">
                        All figures in USD. Actual amounts are entered manually, not bank transactions. Blank means
                        unrecorded.
                      </p>
                      <div className="travel-expenses">
                        {(activeTrip.expenses ?? []).map((e) => (
                          <article key={e.id}>
                            <div className="travel-expense-title">
                              <span className="travel-category">{e.category}</span>
                              <strong>{e.label}</strong>
                              <button
                                aria-label={`Edit expense ${e.label}`}
                                onClick={() => {
                                  setErrors([]);
                                  setExpenseEditor({ ...e });
                                }}
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                            <div className="travel-expense-values">
                              <span>
                                Planned <strong>{formatTravelUSD(e.planned)}</strong>
                              </span>
                              <span>
                                Actual <strong>{e.actual == null ? "Not recorded" : formatTravelUSD(e.actual)}</strong>
                              </span>
                            </div>
                            <div className="travel-cost-bar">
                              <i
                                style={{
                                  width: `${Math.min(100, activeTrip.budget > 0 ? (e.planned / activeTrip.budget) * 100 : 0)}%`,
                                }}
                              />
                            </div>
                          </article>
                        ))}
                        {!(activeTrip.expenses ?? []).length && (
                          <TravelEmpty
                            title="Plan the practical details"
                            text="Add flights, accommodation, food, transport, or your own categories."
                          />
                        )}
                      </div>
                    </div>
                    <aside className="travel-panel">
                      <div className="travel-panel-heading">
                        <h3>Trip summary</h3>
                        <Wallet size={18} />
                      </div>
                      <div className="travel-summary-row">
                        <span>Travelers</span>
                        <strong>{activeTrip.travelers ?? 1}</strong>
                      </div>
                      <div className="travel-summary-row">
                        <span>Plan per traveler</span>
                        <strong>{formatTravelUSD(totals.planned / Math.max(1, activeTrip.travelers ?? 1))}</strong>
                      </div>
                      <div className="travel-summary-row">
                        <span>Unallocated budget</span>
                        <strong className={totals.plannedRemaining < 0 ? "travel-over" : ""}>
                          {formatTravelUSD(totals.plannedRemaining)}
                        </strong>
                      </div>
                      <div className="travel-summary-row">
                        <span>Activities subtotal</span>
                        <strong>{formatTravelUSD(totals.itineraryEstimate)}</strong>
                      </div>
                      <p className="travel-muted">
                        Activity estimates are shown separately to avoid counting costs twice. Recorded costs may be
                        incomplete; remaining budget is not a verified balance.
                      </p>
                      {totals.plannedRemaining < 0 && (
                        <p className="travel-over">Your planned expenses exceed the budget limit.</p>
                      )}
                      <button className="travel-button full" onClick={() => setView("plan")}>
                        Back to itinerary <ArrowRight size={15} />
                      </button>
                    </aside>
                  </div>
                </>
              )}
              {!sampleMode && (
                <div className="travel-trip-footer">
                  <p className="travel-muted">
                    {activeTrip.notes || "Your plans, in one place. No reservations have been made by this app."}
                  </p>
                  <button className="travel-button danger" onClick={() => setDeleteTripId(activeTrip.id)}>
                    <Trash2 size={14} /> Delete trip
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      <p className="travel-fineprint">
        Travel workspace · No booking, paid map, or AI service connected. Destination photos: Unsplash. External map
        links open only when selected.
      </p>
      <Dialog
        open={!!tripEditor}
        onOpenChange={(v) => {
          if (!v) setTripEditor(null);
        }}
      >
        <DialogContent className="travel-dialog">
          <DialogHeader>
            <DialogTitle>
              {tripEditor && trips.some((t) => t.id === tripEditor.id) ? "Edit trip" : "Plan a trip"}
            </DialogTitle>
            <DialogDescription>
              Save your own dates and planning budget. This does not book travel or create calendar events.
            </DialogDescription>
          </DialogHeader>
          {tripEditor && (
            <>
              <div className="travel-form">
                <label>
                  Destination
                  <Input
                    value={tripEditor.destination}
                    onChange={(e) => setTripEditor({ ...tripEditor, destination: e.target.value })}
                    maxLength={120}
                  />
                </label>
                <div className="travel-form-columns">
                  <label>
                    Departure
                    <Input
                      type="date"
                      value={tripEditor.startDate}
                      onChange={(e) => setTripEditor({ ...tripEditor, startDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Return
                    <Input
                      type="date"
                      value={tripEditor.endDate}
                      onChange={(e) => setTripEditor({ ...tripEditor, endDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Budget limit (USD)
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tripEditor.budget}
                      onChange={(e) =>
                        setTripEditor({ ...tripEditor, budget: e.target.value === "" ? 0 : Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Travelers
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={tripEditor.travelers ?? 1}
                      onChange={(e) => setTripEditor({ ...tripEditor, travelers: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <label>
                  Status
                  <select
                    value={tripEditor.status}
                    onChange={(e) => setTripEditor({ ...tripEditor, status: e.target.value as TripStatus })}
                  >
                    {travelStatusList.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    value={tripEditor.notes ?? ""}
                    onChange={(e) => setTripEditor({ ...tripEditor, notes: e.target.value })}
                    rows={3}
                  />
                </label>
                {errors.map((e) => (
                  <p key={e} role="alert" className="travel-over">
                    {e}
                  </p>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTripEditor(null)}>
                  Cancel
                </Button>
                <Button onClick={saveTrip}>Save trip</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!activityEditor}
        onOpenChange={(v) => {
          if (!v) setActivityEditor(null);
        }}
      >
        <DialogContent className="travel-dialog">
          <DialogHeader>
            <DialogTitle>Itinerary activity</DialogTitle>
            <DialogDescription>
              {sampleMode
                ? "You are editing a sample, not a saved trip."
                : "Times are local to your destination. Add an address for a map link."}
            </DialogDescription>
          </DialogHeader>
          {activityEditor && (
            <>
              <div className="travel-form">
                <label>
                  Activity title
                  <Input
                    value={activityEditor.title}
                    onChange={(e) => setActivityEditor({ ...activityEditor, title: e.target.value })}
                    maxLength={140}
                  />
                </label>
                <div className="travel-form-columns">
                  <label>
                    Date
                    <Input
                      type="date"
                      value={activityEditor.date}
                      onChange={(e) => setActivityEditor({ ...activityEditor, date: e.target.value })}
                    />
                  </label>
                  <label>
                    Local time
                    <Input
                      type="time"
                      value={activityEditor.time}
                      onChange={(e) => setActivityEditor({ ...activityEditor, time: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  Location / address
                  <Input
                    value={activityEditor.location}
                    onChange={(e) => setActivityEditor({ ...activityEditor, location: e.target.value })}
                    maxLength={250}
                  />
                </label>
                <div className="travel-form-columns">
                  <label>
                    Category
                    <select
                      value={activityEditor.category}
                      onChange={(e) => setActivityEditor({ ...activityEditor, category: e.target.value })}
                    >
                      {[...new Set([...TRAVEL_CATEGORIES, activityEditor.category])].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Estimate (USD)
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={activityEditor.estimatedCost}
                      onChange={(e) => setActivityEditor({ ...activityEditor, estimatedCost: Number(e.target.value) })}
                    />
                  </label>
                </div>
                {errors.map((e) => (
                  <p key={e} role="alert" className="travel-over">
                    {e}
                  </p>
                ))}
              </div>
              <DialogFooter>
                {activeTrip?.itinerary?.some((a) => a.id === activityEditor.id) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      patchActive((current) => ({
                        itinerary: (current.itinerary ?? []).filter((a) => a.id !== activityEditor.id),
                      }));
                      setActivityEditor(null);
                    }}
                  >
                    Remove activity
                  </Button>
                )}
                <Button variant="outline" onClick={() => setActivityEditor(null)}>
                  Cancel
                </Button>
                <Button onClick={saveActivity}>Save activity</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!expenseEditor}
        onOpenChange={(v) => {
          if (!v) setExpenseEditor(null);
        }}
      >
        <DialogContent className="travel-dialog">
          <DialogHeader>
            <DialogTitle>Expense details</DialogTitle>
            <DialogDescription>Planning records only. No payment or bank account changes.</DialogDescription>
          </DialogHeader>
          {expenseEditor && (
            <>
              <div className="travel-form">
                <label>
                  Expense label
                  <Input
                    value={expenseEditor.label}
                    onChange={(e) => setExpenseEditor({ ...expenseEditor, label: e.target.value })}
                    maxLength={140}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={expenseEditor.category}
                    onChange={(e) => setExpenseEditor({ ...expenseEditor, category: e.target.value })}
                  >
                    {TRAVEL_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <div className="travel-form-columns">
                  <label>
                    Planned (USD)
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseEditor.planned}
                      onChange={(e) => setExpenseEditor({ ...expenseEditor, planned: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Actual (USD, optional)
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Not recorded"
                      value={expenseEditor.actual ?? ""}
                      onChange={(e) =>
                        setExpenseEditor({
                          ...expenseEditor,
                          actual: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                {errors.map((e) => (
                  <p key={e} role="alert" className="travel-over">
                    {e}
                  </p>
                ))}
              </div>
              <DialogFooter>
                {activeTrip?.expenses?.some((a) => a.id === expenseEditor.id) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      patchActive((current) => ({
                        expenses: (current.expenses ?? []).filter((a) => a.id !== expenseEditor.id),
                      }));
                      setExpenseEditor(null);
                    }}
                  >
                    Remove expense
                  </Button>
                )}
                <Button variant="outline" onClick={() => setExpenseEditor(null)}>
                  Cancel
                </Button>
                <Button onClick={saveExpense}>Save expense</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteTripId}
        onOpenChange={(v) => {
          if (!v) setDeleteTripId(null);
        }}
      >
        <DialogContent className="travel-dialog">
          <DialogHeader>
            <DialogTitle>Delete this trip?</DialogTitle>
            <DialogDescription>
              This removes its itinerary, expense plan, and packing list. It does not cancel any real bookings. Existing
              linked calendar events are also removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTripId(null)}>
              Keep trip
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                mutate((p) => ({
                  trips: p.trips.filter((t) => t.id !== deleteTripId),
                  calendar: p.calendar.filter((e) => !e.id.startsWith(`trip-${deleteTripId}-`)),
                }));
                setDeleteTripId(null);
                setTripId("");
                setView("explore");
                setNotice("Trip removed from your planner.");
              }}
            >
              Delete trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
function TravelImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? (
    <div className="travel-image-fallback" role="img" aria-label={alt}>
      <Globe2 size={42} />
    </div>
  ) : (
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  );
}
function TravelEmpty({ title, text }: { title: string; text: string }) {
  return (
    <div className="travel-empty">
      <Compass size={25} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
const TRAVEL_STYLES = `
.travel-os{--tblue:#36baff;--tline:rgba(54,186,255,.24);--tmuted:#8ba4ba;color:#e7f4ff;min-width:0;font-family:Rajdhani,system-ui,sans-serif;font-size:15px;display:flex;flex-direction:column;gap:20px;padding-bottom:28px}.travel-os *{box-sizing:border-box}.travel-os button,.travel-os a,.travel-os input,.travel-os select{touch-action:manipulation}.travel-os button{cursor:pointer}.travel-os button:focus-visible,.travel-os a:focus-visible,.travel-os input:focus-visible,.travel-os select:focus-visible{outline:2px solid #58ceff;outline-offset:3px}.travel-os button:disabled{opacity:.4;cursor:not-allowed}.travel-eyebrow{font-size:10px;letter-spacing:.24em;color:#7bd5ff;font-weight:600;display:block}.travel-toolbar,.travel-panel-heading,.travel-search-row,.travel-schedule-toolbar,.travel-trip-footer{display:flex;align-items:center;justify-content:space-between;gap:14px}.travel-toolbar h2{font-size:clamp(20px,2vw,29px);font-weight:500;letter-spacing:.03em;margin:5px 0 0}.travel-toolbar-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.travel-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 13px;border:1px solid var(--tline);background:rgba(9,32,51,.8);color:#d9f1ff;border-radius:5px;font-size:13px;min-height:38px;transition:background .2s,border-color .2s}.travel-button:hover{background:#10334c;border-color:#36baff}.travel-button.primary{background:linear-gradient(135deg,#087eec,#07509c);border-color:#37bdff;color:white;box-shadow:inset 0 0 13px #39b6ff33,0 0 14px #078cff20}.travel-button.full{width:100%;margin-top:18px}.travel-button.danger{color:#ffaaa8;border-color:#a6444455}.travel-nav{display:flex;border:1px solid var(--tline);background:#06111d;border-radius:7px;padding:5px;gap:5px;overflow-x:auto}.travel-nav button{display:flex;align-items:center;justify-content:center;gap:9px;flex:1;min-width:100px;padding:12px;color:#8caac0;border-radius:4px;font-size:13px;border:1px solid transparent}.travel-nav button.active{background:linear-gradient(180deg,#125c9d,#0a294c);border-color:#219ee8;color:#e8f7ff;box-shadow:inset 0 0 12px #2fa4ee25}.travel-panel{position:relative;min-width:0;padding:20px;border:1px solid var(--tline);border-radius:9px;background:linear-gradient(135deg,rgba(8,22,37,.96),rgba(3,11,21,.98));box-shadow:inset 0 1px 0 #8ad5ff0a}.travel-panel:before{content:"";position:absolute;top:-1px;left:18px;width:43px;height:1px;background:#4bc9ff;box-shadow:0 0 9px #31b8ff;pointer-events:none}.travel-panel-heading{margin-bottom:17px}.travel-panel-heading h3{font-size:14px;text-transform:uppercase;letter-spacing:.14em;font-weight:600;margin:0}.travel-panel-heading>span,.travel-panel-heading div>span{color:var(--tmuted);font-size:12px}.travel-panel-heading svg{color:var(--tblue);flex-shrink:0}.travel-explore-grid{display:grid;grid-template-columns:minmax(0,1.85fr) minmax(250px,1fr);gap:18px}.travel-atlas-panel{padding:0;overflow:hidden;min-height:530px;display:flex;align-items:center;background:radial-gradient(ellipse at 52% 65%,#092746,#020710 70%)}.travel-atlas-panel>.travel-atlas{width:100%;border:0;border-radius:0}.travel-atlas-panel .travel-atlas__headline{display:none}.travel-atlas-panel .travel-atlas__top{visibility:hidden}.travel-atlas-title{position:absolute;left:24px;top:22px;z-index:2;pointer-events:none}.travel-atlas-title h3{font-family:Orbitron,sans-serif;font-weight:400;font-size:clamp(22px,2.1vw,34px);line-height:1.45;letter-spacing:.16em;margin:13px 0;color:#e5f7ff}.travel-atlas-title p{font-size:12px;letter-spacing:.12em;color:#78bddc;margin-top:7px}.travel-side{display:flex;flex-direction:column;gap:18px;min-width:0}.travel-segments{display:flex;border:1px solid #1e3d55;border-radius:5px;overflow:hidden;margin-bottom:12px}.travel-segments button{display:flex;align-items:center;justify-content:center;gap:5px;flex:1;padding:8px 10px;color:#89a7be;font-size:12px;min-height:35px;white-space:nowrap}.travel-segments button.active{background:#0f456c;color:#e9faff;box-shadow:inset 0 0 12px #168edc22}.travel-trip-list{display:flex;flex-direction:column;gap:9px;max-height:235px;overflow:auto}.travel-mini-card{display:flex;align-items:center;gap:12px;text-align:left;padding:9px 0;border-bottom:1px solid #1d3446;width:100%}.travel-mini-card>img,.travel-mini-card>.travel-image-fallback{width:56px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0}.travel-mini-card>span:nth-child(2){flex:1;min-width:0}.travel-mini-card strong{display:block;font-size:14px;overflow-wrap:anywhere}.travel-mini-card small{display:block;font-size:11px;color:#89a7be;margin-top:3px}.travel-mini-card>svg{color:#38baff}.travel-mini-icon{width:45px;height:45px;display:grid;place-items:center;background:#0c2940;border-radius:6px;color:#42c3ff}.travel-empty{padding:25px 8px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}.travel-empty>svg{color:#2cb8f8;opacity:.8}.travel-empty strong{font-size:15px;font-weight:500}.travel-empty p{font-size:12px;line-height:1.5;color:var(--tmuted);max-width:330px;margin:0}.travel-goals{display:flex;flex-direction:column;gap:13px;margin:9px 0 18px;max-height:210px;overflow:auto}.travel-goals label{display:flex;align-items:center;gap:10px;font-size:13px}.travel-goals label>span{flex:1;overflow-wrap:anywhere}.travel-os input[type=checkbox]{accent-color:#22b9ff;width:16px;height:16px;flex-shrink:0}.complete{text-decoration:line-through;opacity:.55}.travel-inline-form{display:flex;border:1px solid #24435a;border-radius:5px;min-width:0}.travel-inline-form input{min-width:0;width:100%;padding:8px 9px;background:transparent;outline:none;font-size:12px}.travel-inline-form button{padding:7px 10px;color:#33beff}.travel-search{display:flex;align-items:center;gap:10px;border:1px solid var(--tline);background:#06111e;padding:10px 13px;border-radius:5px;flex:1;min-width:0;color:#36baff}.travel-search input{background:transparent;outline:none;width:100%;min-width:0;font-size:13px;color:#e2f3ff}.travel-os select{border:1px solid var(--tline);border-radius:5px;background:#081624;padding:10px 12px;color:#c7deef;font-size:13px;max-width:100%}.travel-destinations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.travel-destination-card{position:relative;min-width:0;border:1px solid var(--tline);border-radius:8px;overflow:hidden;background:#07131f}.travel-card-main{display:block;width:100%;text-align:left;position:relative;min-height:170px}.travel-card-main>img,.travel-card-main>.travel-image-fallback{width:100%;height:180px;object-fit:cover;filter:brightness(.67) saturate(.8);transition:transform .4s}.travel-card-main:hover>img{transform:scale(1.04)}.travel-card-main:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,#020a13e8,transparent 85%);pointer-events:none}.travel-card-main>span{position:absolute;left:16px;bottom:16px;z-index:1}.travel-card-main small{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#80dcff}.travel-card-main strong{display:block;font-size:24px;font-weight:500;margin:1px 0}.travel-card-main em{display:block;font-size:12px;color:#a7bed0;font-style:normal}.travel-card-main>svg{position:absolute;bottom:20px;right:17px;z-index:1;color:#6ed5ff}.travel-save{position:absolute;top:12px;right:12px;padding:7px;background:#031422b8;color:#96cbe6;border:1px solid #6195b566;border-radius:50%;z-index:2}.travel-save.saved{color:#48c8ff}.travel-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--tline);border-radius:7px;background:#06121f;padding:18px}.travel-stats>div{display:grid;grid-template-columns:28px 1fr;column-gap:14px;padding:0 18px;border-right:1px solid #214057}.travel-stats>div:last-child{border:0}.travel-stats svg{color:#28bbff;grid-row:span 2;align-self:center}.travel-stats strong{font-size:24px;font-weight:500}.travel-stats span{font-size:11px;color:#97b0c2}.travel-destination-grid{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(260px,1fr);gap:18px}.travel-destination-hero{position:relative;min-height:400px;border:1px solid var(--tline);border-radius:9px;overflow:hidden}.travel-destination-hero>img,.travel-destination-hero>.travel-image-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.travel-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,#020a14e6,#04132620),linear-gradient(0deg,#020a14ed,transparent 90%)}.travel-hero-content{position:relative;padding:24px;max-width:610px;height:100%;display:flex;flex-direction:column;justify-content:flex-end}.travel-back{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;margin-bottom:45px;font-size:12px;color:#b5d5eb}.travel-hero-content h3{font-size:clamp(30px,3.5vw,50px);font-weight:600;text-transform:uppercase;letter-spacing:.06em;line-height:1.1;margin:9px 0}.travel-hero-content p{font-size:14px;line-height:1.6;max-width:440px;color:#a9c7de}.travel-hero-content .travel-destination-tagline{color:#61ccff;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:3px 0 11px}.travel-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.travel-tags span{border:1px solid #4e8caf66;border-radius:30px;padding:4px 11px;font-size:11px;background:#03101b80}.travel-destination-aside{display:flex;flex-direction:column;gap:12px}.travel-destination-aside>.travel-toolbar-actions{justify-content:space-between}.travel-destination-aside .travel-muted{margin:0}.travel-map-link{display:flex;align-items:center;gap:7px;color:#5acaff;font-size:12px;line-height:1.4;overflow-wrap:anywhere;margin-top:6px}.travel-map-link svg{flex-shrink:0}.travel-overview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.travel-muted{color:var(--tmuted);font-size:12px;line-height:1.6}.travel-feature-list{display:flex;flex-direction:column;gap:12px;margin:18px 0}.travel-feature-list span{display:flex;align-items:center;gap:10px;font-size:12px;color:#c3dced}.travel-feature-list svg{width:16px;height:16px;color:#30bdff}.travel-place-row{display:flex;align-items:center;gap:11px;padding:15px 0;border-bottom:1px solid #173348;font-size:12px;color:#c0d7e7}.travel-place-row>span:not(.travel-place-number){flex:1}.travel-place-row svg{color:#48c6ff;flex-shrink:0}.travel-place-number{color:#4ebce8;font-size:11px}.travel-sample-title{font-size:25px;font-weight:500;line-height:1.3;margin:14px 0}.travel-plan-picker{display:flex;align-items:center;justify-content:space-between;gap:16px}.travel-plan-picker label{display:flex;align-items:center;gap:13px;font-size:12px;color:var(--tmuted);min-width:0}.travel-plan-picker select{min-width:0;max-width:400px}.travel-status{font-size:10px;color:#68dcff;border:1px solid #2a7898;padding:5px 9px;border-radius:4px;letter-spacing:.06em;white-space:nowrap}.travel-status.sample{color:#f4cc87;border-color:#8e743e}.travel-sample-banner{color:#debc7b;background:#30281760;border:1px solid #876d354f;padding:10px 14px;border-radius:5px;font-size:12px}.travel-trip-banner{position:relative;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:180px;padding:27px;border:1px solid var(--tline);border-radius:8px;overflow:hidden}.travel-trip-banner>img,.travel-trip-banner>.travel-image-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 55%}.travel-trip-banner>div:not(.travel-hero-shade):not(.travel-image-fallback){position:relative;z-index:1}.travel-trip-banner h3{font-size:34px;font-weight:500;letter-spacing:.06em;margin:8px 0}.travel-trip-banner p{font-size:12px;color:#b2ccdf}.travel-trip-actions{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:13px}.travel-trip-actions>span{font-size:10px;color:#a1c5dd}.travel-trip-actions strong{font-size:26px;display:block;color:#e4f6ff;font-weight:500}.travel-planner-grid{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(250px,1fr);gap:18px}.travel-week-arrows{display:flex;gap:9px}.travel-week-arrows button{border:1px solid #234e6a;padding:6px;border-radius:4px;color:#66cdff}.travel-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:1px solid #21425b;border-radius:5px;overflow:hidden;margin:18px 0}.travel-week button{display:flex;flex-direction:column;align-items:center;gap:5px;padding:11px 2px;border-right:1px solid #18374c;color:#91b2ca;font-size:11px}.travel-week button:last-child{border:0}.travel-week button.active{background:linear-gradient(#1167a4,#103450);color:white;box-shadow:inset 0 0 14px #3bb9ff44}.travel-week strong{font-size:17px;font-weight:500}.travel-week i{display:block;width:3px;height:3px;border-radius:50%;background:transparent}.travel-week i.has-items{background:#47cbff;box-shadow:0 0 5px #2dbfff}.travel-schedule-toolbar .travel-segments{margin:0}.travel-timeline{margin-top:23px}.travel-timeline-item{position:relative;display:grid;grid-template-columns:43px 12px minmax(0,1fr);gap:10px;margin-bottom:17px}.travel-timeline-item>time{font-size:12px;color:#a8c9df;padding-top:16px}.travel-timeline-dot{position:relative;padding-top:20px}.travel-timeline-dot:before{content:"";position:absolute;top:18px;left:2px;width:7px;height:7px;border-radius:50%;background:#5bd3ff;box-shadow:0 0 0 4px #096c9d55}.travel-timeline-dot:after{content:"";position:absolute;left:5px;top:28px;bottom:-30px;width:1px;background:#1e729b}.travel-timeline-item:last-child .travel-timeline-dot:after{display:none}.travel-activity{padding:14px;border:1px solid #1b3e56;border-radius:6px;background:#091c2b}.travel-activity-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px}.travel-activity-title label{display:flex;align-items:center;gap:9px;min-width:0}.travel-activity-title strong{font-size:14px;font-weight:500;overflow-wrap:anywhere}.travel-activity-title button{color:#6da9cc;padding:3px}.travel-day-total{display:flex;flex-direction:column;gap:7px;margin:20px 0 12px}.travel-day-total span{font-size:12px;color:var(--tmuted)}.travel-day-total strong{font-size:28px;font-weight:500}.travel-summary-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid #19364b;font-size:12px;color:#91aec4}.travel-summary-row strong{color:#d2ebfc;font-weight:500}.travel-budget-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.travel-budget-stats>div{border:1px solid var(--tline);background:#071624;padding:18px;border-radius:6px}.travel-budget-stats span{display:block;font-size:11px;color:#89afc7;margin-bottom:8px}.travel-budget-stats strong{display:block;font-size:23px;font-weight:500;overflow-wrap:anywhere}.travel-budget-grid{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(260px,1fr);gap:18px}.travel-expenses article{padding:18px 0;border-bottom:1px solid #19374b}.travel-expense-title{display:flex;align-items:center;gap:10px}.travel-expense-title>strong{flex:1;font-size:14px;font-weight:500;min-width:0;overflow-wrap:anywhere}.travel-category{font-size:10px;color:#6ed2ff;border:1px solid #205578;background:#0b2940;padding:3px 7px;border-radius:4px;white-space:nowrap}.travel-expense-title button{color:#74b3d7}.travel-expense-values{display:flex;justify-content:space-between;gap:14px;margin:12px 0;font-size:11px;color:#88a7bc}.travel-expense-values strong{color:#d9efff;font-weight:500;margin-left:7px}.travel-cost-bar{height:3px;background:#173248;border-radius:5px;overflow:hidden}.travel-cost-bar i{height:100%;display:block;background:linear-gradient(90deg,#057ece,#49d7ff);border-radius:5px}.travel-over{color:#ffa49e!important;font-size:12px}.travel-trip-footer{align-items:flex-start}.travel-trip-footer>p{flex:1;min-width:0}.travel-fineprint{font-size:10px;color:#648298;line-height:1.6;margin-top:4px}.travel-notice{display:flex;justify-content:space-between;gap:15px;padding:10px 14px;border:1px solid #29749c;background:#082235;color:#a6ddf6;font-size:12px;border-radius:5px}.travel-notice button{align-self:flex-start}.travel-no-plan{padding:35px}.travel-no-plan .travel-toolbar-actions{justify-content:center}.travel-image-fallback{display:grid;place-items:center;background:radial-gradient(circle,#124266,#071423);color:#42b9e8;min-height:120px}.travel-dialog{border-color:#234e69;background:#071421;color:#dcefff;max-height:90dvh;overflow:auto}.travel-form{display:flex;flex-direction:column;gap:15px;margin:12px 0}.travel-form label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#9fbcd1}.travel-form input,.travel-form textarea,.travel-form select{background:#06101c;color:#dfedfa;border:1px solid #24475f;border-radius:5px;padding:9px 11px;width:100%;min-width:0;font-size:14px}.travel-form-columns{display:grid;grid-template-columns:1fr 1fr;gap:14px}.travel-day-places{margin-top:17px}.travel-day-places .travel-muted{margin:12px 0}
@media(min-width:1500px){.travel-atlas-panel{min-height:580px}.travel-destinations{grid-template-columns:repeat(6,minmax(0,1fr))}.travel-card-main>img{height:175px}}
@media(max-width:1200px){.travel-explore-grid,.travel-planner-grid,.travel-budget-grid,.travel-destination-grid{grid-template-columns:minmax(0,1fr)}.travel-side{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.travel-atlas-panel{min-height:500px}.travel-destination-aside{display:grid;grid-template-columns:1fr 1fr}.travel-destination-aside>.travel-toolbar-actions{grid-column:1/-1}.travel-overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.travel-overview-grid>div:last-child{grid-column:1/-1}.travel-destination-aside>.travel-muted{align-self:center}.travel-budget-grid>aside{max-width:none}.travel-budget-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.travel-os{gap:14px;font-size:14px}.travel-toolbar{align-items:flex-start;flex-direction:column;gap:13px}.travel-toolbar h2{font-size:22px}.travel-toolbar-actions{width:100%}.travel-toolbar-actions>.travel-button{flex:1}.travel-nav{gap:2px;padding:3px}.travel-nav button{min-width:0;font-size:10px;padding:10px 4px;gap:4px;flex-direction:column}.travel-nav svg{width:16px;height:16px}.travel-panel{padding:15px}.travel-explore-grid,.travel-planner-grid,.travel-destination-grid,.travel-budget-grid{gap:13px}.travel-atlas-panel{padding:0;min-height:370px}.travel-atlas-title{left:16px;top:15px}.travel-atlas-title h3{font-size:20px;margin:8px 0}.travel-atlas-title .travel-eyebrow{font-size:8px}.travel-atlas-title p{font-size:10px}.travel-side{display:flex;gap:13px}.travel-destinations{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.travel-card-main>img,.travel-card-main>.travel-image-fallback{height:165px}.travel-card-main strong{font-size:22px}.travel-card-main>span{left:12px;bottom:12px}.travel-save{top:9px;right:9px}.travel-search-row{flex-direction:column;gap:8px;align-items:stretch}.travel-search-row select{font-size:12px}.travel-stats{padding:12px 4px}.travel-stats>div{padding:0 9px;grid-template-columns:1fr;gap:5px;text-align:center}.travel-stats svg{display:none}.travel-stats strong{font-size:21px}.travel-stats span{font-size:9px;line-height:1.4}.travel-destination-hero{min-height:365px}.travel-hero-content{padding:20px}.travel-hero-content h3{font-size:33px}.travel-hero-content p{font-size:13px}.travel-back{margin-bottom:38px}.travel-destination-aside{display:flex}.travel-overview-grid{grid-template-columns:1fr;gap:13px}.travel-plan-picker{flex-wrap:wrap;gap:10px}.travel-plan-picker label{width:100%;display:flex;flex-direction:column;align-items:flex-start;gap:6px}.travel-plan-picker select{max-width:100%;width:100%}.travel-trip-banner{padding:19px;gap:13px;min-height:200px;align-items:flex-start;flex-direction:column}.travel-trip-banner h3{font-size:28px}.travel-trip-actions{flex-direction:row;align-items:center;justify-content:space-between;width:100%;text-align:left}.travel-trip-actions strong{font-size:21px}.travel-week button{padding:9px 1px;font-size:10px}.travel-week strong{font-size:16px}.travel-schedule-toolbar{gap:7px;flex-wrap:wrap}.travel-schedule-toolbar .travel-button{padding:7px 9px;font-size:11px}.travel-segments button{padding:8px 10px;font-size:11px}.travel-timeline-item{grid-template-columns:34px 7px minmax(0,1fr);gap:7px}.travel-timeline-item>time{font-size:10px}.travel-timeline-dot:before{left:0;width:6px;height:6px}.travel-timeline-dot:after{left:2px}.travel-activity{padding:11px 10px}.travel-activity-title strong{font-size:13px}.travel-activity-title label{gap:6px}.travel-activity .travel-muted,.travel-activity .travel-map-link{font-size:11px}.travel-budget-stats{gap:9px}.travel-budget-stats>div{padding:13px}.travel-budget-stats strong{font-size:20px}.travel-budget-stats span{font-size:10px}.travel-expense-title{flex-wrap:wrap;gap:7px}.travel-expense-title>strong{font-size:13px}.travel-expense-values{font-size:10px}.travel-expense-values strong{display:block;margin:4px 0 0;font-size:13px}.travel-trip-footer{flex-direction:column}.travel-trip-footer .travel-button{align-self:flex-end}.travel-form-columns{gap:10px}.travel-form input{font-size:16px}.travel-sample-banner{font-size:11px}.travel-no-plan{padding:18px}.travel-panel-heading h3{font-size:12px;letter-spacing:.1em}}
@media(prefers-reduced-motion:reduce){.travel-os *{transition:none!important;animation:none!important}}
`;
