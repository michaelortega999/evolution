import { localISO } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Star, Trash2, Plus, Plane, Car as CarIcon, Music, Play, Pause, RotateCcw,
  CalendarPlus, MapPin, Fuel, Activity,
} from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useEvolutionData, todayDate, uid,
  type TripStatus, type Trip,
  type Car, type CarExpense, type CarExpenseType, CAR_EXPENSE_TYPES,
  type CarEvent, type CarEventRsvp,
  type GuitarSkill, type GuitarSong, type SkillLevel, SKILL_LEVELS,
  type CustomHobby, type CalendarEvent, type Transaction, type TodoItem,
  type GuitarSession, type FocusSession,
  guitarFocusOnly, guitarMirrorId, deleteGuitarSession,
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
  head: () => ({
    meta: [
      { title: "Hobby — Evolution" }, { property: "og:title", content: "Hobby — Evolution" }, { property: "og:description", content: "Travel, Cars, Guitar — connected to wealth, focus, calendar, and to-do." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
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
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86400000);
}
function fmt$(n: number) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function weekStartISO() {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff); d.setHours(0, 0, 0, 0);
  return localISO(d);
}
function isThisWeek(dateStr: string) {
  return dateStr >= weekStartISO();
}

function HobbyPage() {
  const { data, mutate } = useEvolutionData();

  // Tab state controlled so cards can navigate
  const [tab, setTab] = useState<string>("overview");

  // ---------- Weekly stats ----------
  const weeklyTravelHrs = data.trips.filter((t) => isThisWeek(t.startDate)).length * 6; // approx 6h prep per upcoming trip
  const weeklyCarsHrs = data.carMeets.filter((m) => isThisWeek(m.date)).length * 2;
  const weeklyGuitarMin = data.guitarSessions.filter((s) => isThisWeek(s.date)).reduce((a, s) => a + s.durationMin, 0)
    + guitarFocusOnly(data.focusSessions, data.guitarSessions).filter((s) => isThisWeek(localISO(new Date(s.completedAt)))).reduce((a, s) => a + s.durationSec / 60, 0);
  const weeklyGuitarHrs = weeklyGuitarMin / 60;
  const totalWeekHrs = weeklyTravelHrs + weeklyCarsHrs + weeklyGuitarHrs;

  // ---------- Activity feed ----------
  const activity = useMemo(() => {
    const items: { date: string; kind: string; text: string; icon: typeof Plane }[] = [];
    data.trips.forEach((t) => items.push({ date: t.startDate, kind: "Travel", text: `Trip: ${t.destination} (${t.status})`, icon: Plane }));
    data.carMeets.forEach((m) => items.push({ date: m.date, kind: "Cars", text: `Meet at ${m.location}`, icon: CarIcon }));
    data.carExpenses.forEach((e) => {
      const car = data.cars.find((c) => c.id === e.carId);
      items.push({ date: e.date, kind: "Cars", text: `${e.type} · ${fmt$(e.amount)}${car ? ` · ${car.make} ${car.model}` : ""}`, icon: CarIcon });
    });
    data.guitarSessions.forEach((g) => items.push({ date: g.date, kind: "Guitar", text: `Practice: ${g.practiced} (${g.durationMin}m)`, icon: Music }));
    guitarFocusOnly(data.focusSessions, data.guitarSessions).forEach((s) => {
      const d = localISO(new Date(s.completedAt));
      items.push({ date: d, kind: "Guitar", text: `Focus session · ${Math.round(s.durationSec / 60)}m`, icon: Music });
    });
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  }, [data]);

  // ---------- Hobby modal ----------
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hName, setHName] = useState(""); const [hIcon, setHIcon] = useState("✨"); const [hTarget, setHTarget] = useState("3");
  const addCustomHobby = () => {
    if (!hName.trim()) return;
    const h: CustomHobby = { id: uid(), name: hName.trim(), icon: hIcon || "✨", weeklyHoursTarget: Number(hTarget) || 0, hours: 0 };
    mutate((p) => ({ customHobbies: [...p.customHobbies, h] }));
    setHName(""); setHIcon("✨"); setHTarget("3"); setHobbyOpen(false);
  };

  return (
    <ModuleLayout number="08" title="Hobby" subtitle="Craft · Time · Mastery" icon={Star}>
      {/* Hero hologram */}
      <div className="relative w-full h-[260px] overflow-hidden rounded-lg border border-border bg-black">
        <img src={hobbyHologram} alt="" aria-hidden className="hobby-holo-img absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.95 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.15)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border">
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
            <HobbyCard label="Cars" icon={CarIcon} hero={carImg}
              statValue={`${data.cars.length}`} statLabel="Cars in Garage"
              onOpen={() => setTab("cars")} />
            <HobbyCard label="Videography" icon={Music} hero={videographyImg}
              statValue="0" statLabel="Projects Completed"
              onOpen={() => setTab("videography")} />
            <HobbyCard label="Photography" icon={Music} hero={photographyImg}
              statValue="0" statLabel="Projects Completed"
              onOpen={() => setTab("photography")} />
            <HobbyCard label="Travel" icon={Plane} hero={travelImg}
              statValue={`${data.trips.length}`} statLabel="Trips Planned"
              onOpen={() => setTab("travel")} />
            <HobbyCard label="Guitar" icon={Music} hero={guitarImg}
              statValue={`${weeklyGuitarHrs.toFixed(1)} HRS`} statLabel="Practiced This Week"
              onOpen={() => setTab("guitar")} />
            <HobbyCard label="Art" icon={Star} hero={artImg}
              statValue="0" statLabel="Artworks Created"
              onOpen={() => setTab("art")} />
          </div>

          {data.customHobbies.length > 0 && (
            <Panel title="Custom Hobbies">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.customHobbies.map((h) => (
                  <div key={h.id} className="border border-border rounded p-3 text-center group relative">
                    <div className="text-3xl">{h.icon}</div>
                    <div className="hud-label text-xs text-foreground mt-2">{h.name}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">{h.hours.toFixed(1)} / {h.weeklyHoursTarget}h wk</div>
                    <button onClick={() => mutate((p) => ({ customHobbies: p.customHobbies.filter((x) => x.id !== h.id) }))}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
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
                Travel {weeklyTravelHrs.toFixed(1)}h · Cars {weeklyCarsHrs.toFixed(1)}h · Guitar {weeklyGuitarHrs.toFixed(1)}h
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
              <div className="text-xs text-muted-foreground text-center py-6">No activity yet — start logging in the tabs above.</div>
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
          <TravelSection />
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
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">New Hobby</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name (e.g. Photography)" value={hName} onChange={(e) => setHName(e.target.value)} className="h-9 text-xs" />
            <Input placeholder="Icon emoji" value={hIcon} onChange={(e) => setHIcon(e.target.value)} maxLength={2} className="h-9 text-xs" />
            <Input type="number" placeholder="Weekly hours target" value={hTarget} onChange={(e) => setHTarget(e.target.value)} className="h-9 text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHobbyOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={addCustomHobby} className="hud-label text-[10px]">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

// ============ Shared small components ============

function HobbyCard({ label, icon: Icon, hero, statValue, statLabel, onOpen }: {
  label: string; icon: typeof Plane; hero: string; statValue: string; statLabel: string; onOpen: () => void;
}) {
  const isCover = hero === earthImg; // Travel still uses the cover treatment
  return (
    <button onClick={onOpen}
      className="hud-card hud-scan p-0 overflow-hidden text-left group relative transition-transform hover:-translate-y-0.5">
      {isCover ? (
        <div className="relative h-32 bg-black overflow-hidden">
          <img src={hero} alt="" aria-hidden className="hobby-holo-img absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.9 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--card))" }} />
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
        <span className="text-primary tabular-nums">{current.toFixed(1)} / {target}h</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 6px var(--primary)" }} />
      </div>
    </div>
  );
}

// ============ TRAVEL ============

function TravelSection() {
  const { data, mutate } = useEvolutionData();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dest, setDest] = useState(""); const [start, setStart] = useState(""); const [end, setEnd] = useState("");
  const [budget, setBudget] = useState(""); const [status, setStatus] = useState<TripStatus>("Planning"); const [notes, setNotes] = useState("");

  const reset = () => { setEditId(null); setDest(""); setStart(""); setEnd(""); setBudget(""); setStatus("Planning"); setNotes(""); };

  const submit = () => {
    if (!dest.trim()) return;
    const tripId = editId || uid();
    const trip: Trip = {
      id: tripId, destination: dest.trim(),
      startDate: start || todayDate(), endDate: end || start || todayDate(),
      budget: Number(budget) || 0, status, notes: notes.trim() || undefined,
      packing: editId ? (data.trips.find((t) => t.id === editId)?.packing ?? []) : [],
    };

    mutate((prev) => {
      // Remove any existing calendar events linked to this trip
      const cleaned = (prev.calendar ?? []).filter((e) => !e.id.startsWith(`trip-${tripId}-`));
      const newCal: CalendarEvent[] = [
        { id: `trip-${tripId}-dep`, date: trip.startDate, time: "08:00", endTime: "09:00", title: `✈ Depart: ${trip.destination}`, reminder: 1440 },
        { id: `trip-${tripId}-ret`, date: trip.endDate, time: "20:00", endTime: "21:00", title: `🏠 Return from ${trip.destination}`, reminder: 1440 },
      ];
      return {
        trips: editId ? prev.trips.map((t) => t.id === editId ? trip : t) : [...prev.trips, trip],
        calendar: [...cleaned, ...newCal],
      };
    });
    reset(); setOpen(false);
  };

  const edit = (t: Trip) => {
    setEditId(t.id); setDest(t.destination); setStart(t.startDate); setEnd(t.endDate);
    setBudget(String(t.budget)); setStatus(t.status); setNotes(t.notes ?? ""); setOpen(true);
  };
  const del = (id: string) => mutate((prev) => ({
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
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2"><Plane className="h-4 w-4" /> Trip Planner</h2>
          <p className="hud-label text-[10px] text-muted-foreground">Auto-syncs to your Calendar.</p>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }} size="sm" className="hud-label text-[10px]">
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
                    <div className="hud-label text-[10px] text-muted-foreground">{t.startDate} → {t.endDate}</div>
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
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">{editId ? "Edit Trip" : "New Trip"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Destination" value={dest} onChange={(e) => setDest(e.target.value)} className="h-9 text-xs" />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Departure</span>
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 text-xs mt-1" />
              </label>
              <label className="block">
                <span className="hud-label text-[10px] text-muted-foreground">Return</span>
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-9 text-xs mt-1" />
              </label>
            </div>
            <Input type="number" placeholder="Budget $" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-9 text-xs" />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Status</span>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {TRIP_STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`hud-label text-[10px] py-2 rounded border ${status === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full bg-input border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submit} className="hud-label text-[10px]">{editId ? "Save" : "Add Trip"}</Button>
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
    mutate((p) => ({ trips: p.trips.map((t) => t.id === trip.id ? { ...t, ...patch } : t) }));
  const addPack = () => {
    if (!item.trim()) return;
    updateTrip({ packing: [...trip.packing, { id: uid(), item: item.trim(), done: false }] });
    setItem("");
  };
  const togglePack = (pid: string) => updateTrip({ packing: trip.packing.map((p) => p.id === pid ? { ...p, done: !p.done } : p) });
  const delPack = (pid: string) => updateTrip({ packing: trip.packing.filter((p) => p.id !== pid) });

  const statusColor =
    trip.status === "In Progress" ? "border-accent text-accent bg-accent/10" :
    trip.status === "Booked" ? "border-primary text-primary bg-primary/10" :
    trip.status === "Completed" ? "border-border text-muted-foreground" :
    "border-border text-foreground/70";

  return (
    <div className="hud-card p-4 group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="hud-label text-sm text-primary hud-glow truncate">{trip.destination}</div>
          <div className="hud-label text-[10px] text-muted-foreground">
            {trip.startDate} → {trip.endDate} · {fmt$(trip.budget)}
          </div>
          {days > 0 && trip.status !== "Completed" && (
            <div className="hud-label text-[10px] text-accent mt-1">⏱ {days} day{days !== 1 ? "s" : ""} until departure</div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="hud-label text-[10px] text-muted-foreground hover:text-primary px-2">Edit</button>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <span className={`inline-block mt-2 hud-label text-[9px] px-2 py-0.5 rounded border ${statusColor}`}>{trip.status}</span>
      {trip.notes && <p className="text-xs text-foreground/70 mt-2">{trip.notes}</p>}

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="hud-label text-[10px] text-muted-foreground">Packing ({packed}/{trip.packing.length})</span>
          <span className="hud-label text-[10px] text-primary">{Math.round(pct)}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 mb-2">
          <Input value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPack()} placeholder="Add item…" className="h-8 text-xs" />
          <Button onClick={addPack} size="sm" className="hud-label text-[10px]">+</Button>
        </div>
        <ul className="space-y-1 max-h-32 overflow-y-auto">
          {trip.packing.map((p) => (
            <li key={p.id} className="flex items-center gap-2 group/p">
              <button onClick={() => togglePack(p.id)}
                className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${p.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                {p.done && <span className="text-[8px] text-primary-foreground">✓</span>}
              </button>
              <span className={`flex-1 text-xs ${p.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{p.item}</span>
              <button onClick={() => delPack(p.id)} className="opacity-0 group-hover/p:opacity-100 text-muted-foreground hover:text-destructive">
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
  const [make, setMake] = useState(""); const [model, setModel] = useState(""); const [yearF, setYearF] = useState(String(new Date().getFullYear()));
  const [color, setColor] = useState(""); const [purchase, setPurchase] = useState(""); const [current, setCurrent] = useState("");
  const resetCar = () => { setEditCarId(null); setMake(""); setModel(""); setColor(""); setPurchase(""); setCurrent(""); setYearF(String(new Date().getFullYear())); };
  const submitCar = () => {
    if (!make.trim() || !model.trim()) return;
    const car: Car = {
      id: editCarId || uid(),
      make: make.trim(), model: model.trim(),
      year: Number(yearF) || new Date().getFullYear(),
      color: color.trim(), purchasePrice: Number(purchase) || 0, currentValue: Number(current) || 0,
    };
    mutate((p) => ({ cars: editCarId ? p.cars.map((c) => c.id === editCarId ? car : c) : [...p.cars, car] }));
    resetCar(); setCarOpen(false);
  };
  const editCar = (c: Car) => {
    setEditCarId(c.id); setMake(c.make); setModel(c.model); setYearF(String(c.year));
    setColor(c.color); setPurchase(String(c.purchasePrice)); setCurrent(String(c.currentValue)); setCarOpen(true);
  };
  const delCar = (id: string) => mutate((p) => ({
    cars: p.cars.filter((c) => c.id !== id),
    carExpenses: p.carExpenses.filter((e) => e.carId !== id),
    transactions: p.transactions.filter((t) => !p.carExpenses.find((e) => e.carId === id && e.txId === t.id)),
  }));

  // Add Expense
  const [expOpen, setExpOpen] = useState(false);
  const [eCarId, setECarId] = useState(""); const [eType, setEType] = useState<CarExpenseType>("Gas");
  const [eAmount, setEAmount] = useState(""); const [eDate, setEDate] = useState(todayDate()); const [eNotes, setENotes] = useState("");
  const [eGallons, setEGallons] = useState(""); const [ePPG, setEPPG] = useState(""); const [eMileage, setEMileage] = useState("");
  const openExp = (carId?: string) => {
    setECarId(carId || data.cars[0]?.id || "");
    setEType("Gas"); setEAmount(""); setEDate(todayDate()); setENotes("");
    setEGallons(""); setEPPG(""); setEMileage("");
    setExpOpen(true);
  };
  const submitExp = () => {
    if (!eCarId || !Number(eAmount)) return;
    const car = data.cars.find((c) => c.id === eCarId);
    if (!car) return;
    const expId = uid(); const txId = uid();
    const exp: CarExpense = {
      id: expId, carId: eCarId, date: eDate, type: eType,
      amount: Number(eAmount), notes: eNotes.trim() || undefined,
      gallons: eType === "Gas" ? Number(eGallons) || undefined : undefined,
      pricePerGallon: eType === "Gas" ? Number(ePPG) || undefined : undefined,
      mileage: eType === "Gas" ? Number(eMileage) || undefined : undefined,
      txId,
    };
    const tx: Transaction = {
      id: txId, date: eDate, description: `${eType} · ${car.make} ${car.model}`,
      amount: Number(eAmount), type: "expense", category: `Car: ${car.make} ${car.model}`,
    };
    mutate((p) => ({
      carExpenses: [...p.carExpenses, exp],
      transactions: [...p.transactions, tx],
    }));
    setExpOpen(false);
  };
  const delExp = (id: string) => mutate((p) => {
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
      const sorted = [...gas].sort((a, b) => (a.mileage! - b.mileage!));
      const totalMiles = sorted[sorted.length - 1].mileage! - sorted[0].mileage!;
      const totalGal = sorted.slice(1).reduce((a, e) => a + (e.gallons || 0), 0);
      mpg = totalGal > 0 ? totalMiles / totalGal : 0;
    }
    return { monthly, total, mpg };
  };

  const breakdown = useMemo(() => {
    const by: Record<string, number> = {};
    data.carExpenses.forEach((e) => { by[e.type] = (by[e.type] || 0) + e.amount; });
    const total = Object.values(by).reduce((a, b) => a + b, 0);
    return { by, total };
  }, [data.carExpenses]);

  // Car Events
  const [evOpen, setEvOpen] = useState(false);
  const [evName, setEvName] = useState(""); const [evDate, setEvDate] = useState(todayDate());
  const [evLoc, setEvLoc] = useState(""); const [evDesc, setEvDesc] = useState("");
  const submitEvent = () => {
    if (!evName.trim()) return;
    const ce: CarEvent = { id: uid(), name: evName.trim(), date: evDate, location: evLoc.trim(), description: evDesc.trim() || undefined, rsvp: "Interested" };
    mutate((p) => ({ carEvents: [...p.carEvents, ce] }));
    setEvName(""); setEvLoc(""); setEvDesc(""); setEvOpen(false);
  };
  const setRsvp = (id: string, r: CarEventRsvp) =>
    mutate((p) => ({ carEvents: p.carEvents.map((e) => e.id === id ? { ...e, rsvp: r } : e) }));
  const delEvent = (id: string) => mutate((p) => {
    const ev = p.carEvents.find((e) => e.id === id);
    return {
      carEvents: p.carEvents.filter((e) => e.id !== id),
      calendar: ev?.calendarId ? (p.calendar ?? []).filter((c) => c.id !== ev.calendarId) : p.calendar,
    };
  });
  const addEventToCalendar = (ev: CarEvent) => {
    if (ev.calendarId) return;
    const calId = `carevent-${ev.id}`;
    const cal: CalendarEvent = { id: calId, date: ev.date, time: "09:00", endTime: "12:00", title: `🚗 ${ev.name}`, reminder: 1440 };
    mutate((p) => ({
      calendar: [...(p.calendar ?? []), cal],
      carEvents: p.carEvents.map((e) => e.id === ev.id ? { ...e, calendarId: calId } : e),
    }));
  };

  return (
    <>
      {/* Vehicle HUD showcase — interactive */}
      <InteractiveVehicleHud
        onAddExpense={() => openExp()}
        onAddCar={() => { resetCar(); setCarOpen(true); }}
        onAddEvent={() => setEvOpen(true)}
        garageCount={data.cars.length}
        monthlySpend={Object.values(breakdown.by).reduce((a, b) => a + b, 0)}
        upcomingEvents={data.carEvents.length}
      />

      {/* Hero */}
      <div className="relative flex items-start justify-between gap-4 rounded-lg border border-border bg-black/40 p-5 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2"><CarIcon className="h-4 w-4" /> My Garage</h2>
          <p className="hud-label text-[10px] text-muted-foreground mt-1">Track value, expenses, gas mileage, and meets — synced to Wealth.</p>
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <div><div className="hud-label text-[10px] text-muted-foreground">Garage</div><div className="hud-label text-lg text-primary tabular-nums">{data.cars.length}</div></div>
            <div><div className="hud-label text-[10px] text-muted-foreground">Expenses</div><div className="hud-label text-lg text-foreground tabular-nums">{data.carExpenses.length}</div></div>
            <div><div className="hud-label text-[10px] text-muted-foreground">Events</div><div className="hud-label text-lg text-foreground tabular-nums">{data.carEvents.length}</div></div>
          </div>
        </div>
        <HoloFloat src={carImg} width={180} height={130} spin className="shrink-0 hidden sm:block" />
      </div>

      {/* My Cars */}
      <div className="flex items-center justify-between">
        <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2"><CarIcon className="h-4 w-4" /> My Garage</h2>
        <Button onClick={() => { resetCar(); setCarOpen(true); }} size="sm" className="hud-label text-[10px]">
          <Plus className="h-3 w-3 mr-1" /> Add Car
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.cars.map((c) => {
          const s = carStats(c.id);
          return (
            <div key={c.id} className="hud-card p-0 overflow-hidden group relative">
              <div className="relative h-24 bg-black overflow-hidden">
                <img src={carImg} alt="" aria-hidden className="hobby-holo-img absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.6 }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--card))" }} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="hud-label text-sm text-primary hud-glow truncate">{c.year} {c.make} {c.model}</div>
                    <div className="hud-label text-[10px] text-muted-foreground">{c.color}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => editCar(c)} className="hud-label text-[10px] text-muted-foreground hover:text-primary px-1">Edit</button>
                    <button onClick={() => delCar(c.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div><div className="hud-label text-[9px] text-muted-foreground">Value</div><div className="hud-label text-xs text-primary">{fmt$(c.currentValue)}</div></div>
                  <div><div className="hud-label text-[9px] text-muted-foreground">Month</div><div className="hud-label text-xs text-destructive">{fmt$(s.monthly)}</div></div>
                  <div><div className="hud-label text-[9px] text-muted-foreground">{s.mpg ? "MPG" : "Total"}</div><div className="hud-label text-xs text-foreground">{s.mpg ? s.mpg.toFixed(1) : fmt$(s.total)}</div></div>
                </div>
                <Button onClick={() => openExp(c.id)} size="sm" variant="outline" className="w-full mt-3 hud-label text-[10px]">
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
            <div className="hud-label text-[10px] text-muted-foreground mb-2">Breakdown by category · {fmt$(breakdown.total)} total</div>
            <div className="flex h-3 rounded-full overflow-hidden border border-border">
              {Object.entries(breakdown.by).map(([type, amt]) => {
                const pct = (amt / breakdown.total) * 100;
                const colors: Record<string, string> = {
                  Gas: "var(--primary)", Insurance: "var(--accent)", Maintenance: "oklch(0.7 0.18 30)",
                  Modification: "oklch(0.7 0.2 280)", Parking: "oklch(0.65 0.15 200)",
                  Registration: "oklch(0.6 0.15 100)", Other: "oklch(0.5 0.05 0)",
                };
                return <div key={type} title={`${type}: ${fmt$(amt)}`} style={{ width: `${pct}%`, background: colors[type] || "var(--muted)" }} />;
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
          {[...data.carExpenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
            const car = data.cars.find((c) => c.id === e.carId);
            return (
              <li key={e.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] gap-3 items-center text-xs group">
                <span className="hud-label text-[10px] text-muted-foreground">{e.date}</span>
                <div>
                  <div className="hud-label text-foreground">{e.type}{e.gallons && ` · ${e.gallons}gal`}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">{car ? `${car.make} ${car.model}` : "Unknown"}{e.notes && ` · ${e.notes}`}</div>
                </div>
                <span className="hud-label text-destructive">−{fmt$(e.amount)}</span>
                <button onClick={() => delExp(e.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
          {!data.carExpenses.length && <li className="text-xs text-muted-foreground py-6 text-center">No expenses logged.</li>}
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
          {[...data.carEvents].sort((a, b) => a.date.localeCompare(b.date)).map((ev) => (
            <li key={ev.id} className="py-3 group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="hud-label text-xs text-foreground">{ev.name} {ev.seed && <span className="text-[9px] text-muted-foreground ml-1">curated</span>}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">{ev.date} · {ev.location}</div>
                  {ev.description && <p className="text-xs text-foreground/70 mt-1">{ev.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <select value={ev.rsvp} onChange={(e) => setRsvp(ev.id, e.target.value as CarEventRsvp)}
                    className="h-7 bg-input border border-border rounded px-2 text-[10px]">
                    {RSVP_STATES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => addEventToCalendar(ev)}
                    disabled={!!ev.calendarId}
                    className="hud-label text-[10px] text-primary px-2 py-1 border border-primary/40 rounded hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    title={ev.calendarId ? "Already in calendar" : "Add to Calendar"}>
                    <CalendarPlus className="h-3 w-3" /> {ev.calendarId ? "Added" : "Calendar"}
                  </button>
                  {!ev.seed && (
                    <button onClick={() => delEvent(ev.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
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
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">{editCarId ? "Edit Car" : "Add Car"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} className="h-9 text-xs" />
            <Input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} className="h-9 text-xs" />
            <Input type="number" placeholder="Year" value={yearF} onChange={(e) => setYearF(e.target.value)} className="h-9 text-xs" />
            <Input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 text-xs" />
            <Input type="number" placeholder="Purchase $" value={purchase} onChange={(e) => setPurchase(e.target.value)} className="h-9 text-xs" />
            <Input type="number" placeholder="Current value $" value={current} onChange={(e) => setCurrent(e.target.value)} className="h-9 text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCarOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitCar} className="hud-label text-[10px]">{editCarId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense modal */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Log Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Car</span>
              <select value={eCarId} onChange={(e) => setECarId(e.target.value)}
                className="w-full mt-1 h-9 bg-input border border-border rounded px-2 text-xs">
                {data.cars.map((c) => <option key={c.id} value={c.id}>{c.year} {c.make} {c.model}</option>)}
              </select>
            </div>
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Type</span>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {CAR_EXPENSE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setEType(t)}
                    className={`hud-label text-[10px] py-2 rounded border ${eType === t ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Amount $" value={eAmount} onChange={(e) => setEAmount(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} className="h-9 text-xs" />
            </div>
            {eType === "Gas" && (
              <div className="grid grid-cols-3 gap-3 p-3 border border-primary/30 rounded bg-primary/5">
                <Input type="number" step="0.01" placeholder="Gallons" value={eGallons} onChange={(e) => setEGallons(e.target.value)} className="h-9 text-xs" />
                <Input type="number" step="0.01" placeholder="$/gallon" value={ePPG} onChange={(e) => setEPPG(e.target.value)} className="h-9 text-xs" />
                <Input type="number" placeholder="Mileage" value={eMileage} onChange={(e) => setEMileage(e.target.value)} className="h-9 text-xs" />
              </div>
            )}
            <Input placeholder="Notes" value={eNotes} onChange={(e) => setENotes(e.target.value)} className="h-9 text-xs" />
            <div className="hud-label text-[10px] text-muted-foreground flex items-center gap-1">
              <Fuel className="h-3 w-3" /> Auto-creates a transaction in Wealth.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitExp} className="hud-label text-[10px]">Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event modal */}
      <Dialog open={evOpen} onOpenChange={setEvOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Add Car Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Event name" value={evName} onChange={(e) => setEvName(e.target.value)} className="h-9 text-xs" />
            <Input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="h-9 text-xs" />
            <Input placeholder="Location" value={evLoc} onChange={(e) => setEvLoc(e.target.value)} className="h-9 text-xs" />
            <textarea placeholder="Description" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={2}
              className="w-full bg-input border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitEvent} className="hud-label text-[10px]">Add</Button>
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
    (s) => s.tag === "Guitar" && localISO(new Date(s.completedAt)) === todayDate()
  );
  const todoCompleted = data.notes.find((n) => n.id === guitarTodoIdFor(todayDate()))?.done;
  if (todayGuitarFocus.length > 0 && todoCompleted === false) {
    // Mark complete (effect-free state set is ok since mutate triggers re-render)
    setTimeout(() => mutate((p) => ({
      notes: p.notes.map((n) => n.id === guitarTodoIdFor(todayDate()) ? { ...n, done: true } : n),
    })), 0);
  }

  // Manual practice log (kept for offline sessions)
  const [logOpen, setLogOpen] = useState(false);
  const [lDur, setLDur] = useState("30"); const [lWhat, setLWhat] = useState("");
  const submitLog = () => {
    if (!lWhat.trim()) return;
    const session: GuitarSession = { id: uid(), date: todayDate(), durationMin: Number(lDur) || 0, practiced: lWhat.trim() };
    const focusEntry: FocusSession = {
      id: guitarMirrorId(session.id), startedAt: Date.now() - (session.durationMin * 60000), completedAt: Date.now(),
      durationSec: session.durationMin * 60, mode: "focus", task: `Guitar: ${session.practiced}`, tag: "Guitar",
    };
    mutate((p) => ({
      guitarSessions: [...p.guitarSessions, session],
      focusSessions: [...p.focusSessions, focusEntry],
    }));
    setLWhat(""); setLogOpen(false);
  };
  const delSession = (id: string) => mutate((p) => deleteGuitarSession(p, id));

  // Skills
  const [skillName, setSkillName] = useState(""); const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const addSkill = () => {
    if (!skillName.trim()) return;
    const s: GuitarSkill = { id: uid(), name: skillName.trim(), level: skillLevel };
    mutate((p) => ({ guitarSkills: [...p.guitarSkills, s] }));
    setSkillName(""); setSkillLevel("Beginner");
  };
  const updateSkill = (id: string, level: SkillLevel) =>
    mutate((p) => ({ guitarSkills: p.guitarSkills.map((s) => s.id === id ? { ...s, level } : s) }));
  const delSkill = (id: string) => mutate((p) => ({ guitarSkills: p.guitarSkills.filter((s) => s.id !== id) }));
  const skillPct = (lvl: SkillLevel) => (SKILL_LEVELS.indexOf(lvl) + 1) * 20;

  // Songs
  const [songTitle, setSongTitle] = useState(""); const [songArtist, setSongArtist] = useState("");
  const [songProg, setSongProg] = useState("0"); const [songDate, setSongDate] = useState("");
  const addSong = () => {
    if (!songTitle.trim()) return;
    const s: GuitarSong = { id: uid(), title: songTitle.trim(), artist: songArtist.trim(), progress: Number(songProg) || 0, targetDate: songDate || todayDate() };
    mutate((p) => ({ guitarSongs: [...p.guitarSongs, s] }));
    setSongTitle(""); setSongArtist(""); setSongProg("0"); setSongDate("");
  };
  const updateSong = (id: string, progress: number) =>
    mutate((p) => ({ guitarSongs: p.guitarSongs.map((s) => s.id === id ? { ...s, progress: Math.max(0, Math.min(100, progress)) } : s) }));
  const delSong = (id: string) => mutate((p) => ({ guitarSongs: p.guitarSongs.filter((s) => s.id !== id) }));

  // Streak
  const streak = useMemo(() => {
    const days = new Set<string>();
    data.guitarSessions.forEach((s) => days.add(s.date));
    data.focusSessions.filter((s) => s.tag === "Guitar").forEach((s) =>
      days.add(localISO(new Date(s.completedAt)))
    );
    let n = 0;
    const cursor = new Date();
    if (!days.has(localISO(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(localISO(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
    return n;
  }, [data.guitarSessions, data.focusSessions]);

  const ringPct = timer.totalMs > 0 ? (timer.remainingMs / timer.totalMs) * 100 : 0;
  const isGuitarSession = timer.tag === "Guitar";

  return (
    <>
      {/* Hero */}
      <div className="relative flex items-start justify-between gap-4 rounded-lg border border-border bg-black/40 p-5 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h2 className="hud-label text-lg text-primary hud-glow flex items-center gap-2"><Music className="h-4 w-4" /> Guitar</h2>
          <p className="hud-label text-[10px] text-muted-foreground mt-1">Practice timer connects to Focus Mode and logs sessions tagged #Guitar.</p>
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <div><div className="hud-label text-[10px] text-muted-foreground">This Week</div><div className="hud-label text-lg text-primary tabular-nums">{weeklyGuitarHrs.toFixed(1)}h</div></div>
            <div><div className="hud-label text-[10px] text-muted-foreground">Skills</div><div className="hud-label text-lg text-foreground tabular-nums">{data.guitarSkills.length}</div></div>
            <div><div className="hud-label text-[10px] text-muted-foreground">Songs</div><div className="hud-label text-lg text-foreground tabular-nums">{data.guitarSongs.length}</div></div>
          </div>
        </div>
        <HoloFloat src={guitarImg} width={220} height={320} className="shrink-0 hidden sm:block" />
      </div>

      {/* Practice Timer */}
      <Panel title="Practice Timer · Connected to Focus Mode">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="hud-label text-[10px] text-muted-foreground">
            {isGuitarSession ? <span className="text-accent">▸ Guitar session active</span> : "Tag will be set to #Guitar automatically"}
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
              <div className="hud-label text-primary hud-glow text-4xl tabular-nums">{formatMmSs(timer.remainingMs)}</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-1">{modeLabel(timer.mode).toUpperCase()}</div>
            </div>
          </div>

          <div className="flex gap-3">
            {!timer.running ? (
              <button onClick={startGuitarSession}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2 hud-glow">
                <Play className="h-4 w-4" /> Start Practice
              </button>
            ) : (
              <button onClick={() => timer.pause()}
                className="h-11 px-6 rounded-md border border-primary/60 bg-primary/15 text-primary hud-label text-xs hover:bg-primary/25 flex items-center gap-2">
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button onClick={() => timer.reset()}
              className="h-11 px-5 rounded-md border border-border text-foreground/80 hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <Link to="/focus" className="h-11 px-4 rounded-md border border-border text-muted-foreground hud-label text-xs hover:text-primary hover:border-primary/40 flex items-center">
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
        <StatBox label="Sessions" value={`${data.guitarSessions.length + guitarFocusOnly(data.focusSessions, data.guitarSessions).length}`} />
      </div>

      <Panel title="Weekly Goal">
        <ProgressBar label="Practice hours" current={weeklyGuitarHrs} target={data.guitarWeeklyHoursTarget} />
        <div className="flex items-center gap-2 mt-3">
          <span className="hud-label text-[10px] text-muted-foreground">Set target:</span>
          <Input type="number" value={data.guitarWeeklyHoursTarget}
            onChange={(e) => mutate({ guitarWeeklyHoursTarget: Number(e.target.value) || 0 })}
            className="h-7 w-20 text-xs" />
          <span className="hud-label text-[10px] text-muted-foreground">hrs/week</span>
        </div>
      </Panel>

      {/* Skills */}
      <Panel title="Skills">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 mb-3">
          <Input placeholder="Skill name (e.g. Sweep picking)" value={skillName} onChange={(e) => setSkillName(e.target.value)} className="h-9 text-xs" />
          <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
            className="h-9 bg-input border border-border rounded px-2 text-xs">
            {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Button onClick={addSkill} size="sm" className="hud-label text-[10px]">+ Add</Button>
        </div>
        <ul className="space-y-3">
          {data.guitarSkills.map((s) => (
            <li key={s.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="hud-label text-xs text-foreground">{s.name}</span>
                <div className="flex items-center gap-2">
                  <select value={s.level} onChange={(e) => updateSkill(s.id, e.target.value as SkillLevel)}
                    className="h-7 bg-input border border-border rounded px-1 text-[10px]">
                    {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button onClick={() => delSkill(s.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${skillPct(s.level)}%`, boxShadow: "0 0 6px var(--primary)" }} />
              </div>
            </li>
          ))}
          {!data.guitarSkills.length && <li className="text-xs text-muted-foreground py-4 text-center">No skills tracked yet.</li>}
        </ul>
      </Panel>

      {/* Songs */}
      <Panel title="Songs · Learning">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_140px_auto] gap-2 mb-3">
          <Input placeholder="Title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} className="h-9 text-xs" />
          <Input placeholder="Artist" value={songArtist} onChange={(e) => setSongArtist(e.target.value)} className="h-9 text-xs" />
          <Input type="number" placeholder="% done" value={songProg} onChange={(e) => setSongProg(e.target.value)} className="h-9 text-xs" />
          <Input type="date" value={songDate} onChange={(e) => setSongDate(e.target.value)} className="h-9 text-xs" />
          <Button onClick={addSong} size="sm" className="hud-label text-[10px]">+ Add</Button>
        </div>
        <ul className="space-y-3">
          {data.guitarSongs.map((s) => (
            <li key={s.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="hud-label text-xs text-foreground">{s.title}</div>
                  <div className="hud-label text-[10px] text-muted-foreground">{s.artist} · target {s.targetDate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" value={s.progress} onChange={(e) => updateSong(s.id, Number(e.target.value) || 0)}
                    className="h-7 w-16 text-xs" />
                  <span className="hud-label text-[10px] text-primary">%</span>
                  <button onClick={() => delSong(s.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
              </div>
            </li>
          ))}
          {!data.guitarSongs.length && <li className="text-xs text-muted-foreground py-4 text-center">No songs in progress.</li>}
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
              <button onClick={() => delSession(s.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {!data.guitarSessions.length && <li className="text-xs text-muted-foreground py-4 text-center">No manual sessions logged.</li>}
        </ul>
      </Panel>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3 text-primary" />
        Sessions auto-create a daily to-do; completing the timer marks it done.
      </div>

      {/* Log past session modal */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Log Past Session</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="Minutes" value={lDur} onChange={(e) => setLDur(e.target.value)} className="h-9 text-xs" />
            <Input placeholder="What did you practice?" value={lWhat} onChange={(e) => setLWhat(e.target.value)} className="h-9 text-xs" />
            <div className="hud-label text-[10px] text-muted-foreground">Also adds to Focus Mode history under #Guitar.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitLog} className="hud-label text-[10px]">Log</Button>
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in oklab, var(--primary) 25%, transparent)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--glow) 80%, transparent))", transition: "stroke-dasharray 0.4s linear" }} />
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
  onAddExpense, onAddCar, onAddEvent,
  garageCount, monthlySpend, upcomingEvents,
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
      id: "engine", label: "Powertrain", x: 28, y: 42,
      detail: "Engine telemetry & maintenance log.",
      value: `${garageCount} vehicle${garageCount === 1 ? "" : "s"}`,
      actionLabel: "Add Vehicle", action: onAddCar,
    },
    {
      id: "fuel", label: "Fuel / Expenses", x: 52, y: 58,
      detail: "Log gas, insurance, mods & maintenance.",
      value: `$${monthlySpend.toFixed(0)} / mo`,
      actionLabel: "Log Expense", action: onAddExpense,
    },
    {
      id: "events", label: "Meets & Events", x: 76, y: 38,
      detail: "Plan car meets, shows, track days.",
      value: `${upcomingEvents} scheduled`,
      actionLabel: "Add Event", action: onAddEvent,
    },
    {
      id: "wheels", label: "Performance", x: 18, y: 72,
      detail: "Mileage tracking & MPG analytics.",
      value: "Live",
    },
    {
      id: "cabin", label: "Cabin Systems", x: 62, y: 28,
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
            onClick={(e) => { e.stopPropagation(); setActive(isActive ? null : h.id); }}
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
            {(isHover && !isActive) && (
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
                    onClick={() => { h.action!(); setActive(null); }}
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
