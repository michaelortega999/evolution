import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Trash2, Plus } from "lucide-react";
import { ModuleLayout, Panel } from "@/components/evolution/ModuleLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEvolutionData, todayDate, uid, type Hobby, type TripStatus } from "@/lib/evolution-data";

export const Route = createFileRoute("/hobby")({
  head: () => ({ meta: [{ title: "Hobby — Evolution" }, { name: "description", content: "Cars, guitar, travel — track time invested in your craft." }] }),
  component: HobbyPage,
});

const HOBBIES: Hobby[] = ["Cars", "Guitar", "Travel"];
const TRIP_STATUSES: TripStatus[] = ["Planning", "Booked", "Completed"];

function HobbyPage() {
  const { data, mutate } = useEvolutionData();

  // Time log modal
  const [logOpen, setLogOpen] = useState(false);
  const [logHrs, setLogHrs] = useState("0.5");
  const submitTime = () => {
    const h = Number(logHrs); if (!h) return;
    mutate({ hobby: { ...data.hobby, hours: Math.max(0, data.hobby.hours + h) } });
    setLogOpen(false);
  };

  // Cars
  const [cmDate, setCmDate] = useState(todayDate()); const [cmLoc, setCmLoc] = useState(""); const [cmCars, setCmCars] = useState(""); const [cmNotes, setCmNotes] = useState("");
  const addMeet = () => {
    if (!cmLoc.trim()) return;
    mutate((prev) => ({ carMeets: [...prev.carMeets, { id: uid(), date: cmDate, location: cmLoc.trim(), cars: cmCars, notes: cmNotes.trim() || undefined }] }));
    setCmLoc(""); setCmCars(""); setCmNotes("");
  };
  const delMeet = (id: string) => mutate((prev) => ({ carMeets: prev.carMeets.filter((m) => m.id !== id) }));

  // Guitar
  const [gDur, setGDur] = useState("30"); const [gPracticed, setGPracticed] = useState("");
  const addGuitar = () => {
    if (!gPracticed.trim()) return;
    mutate((prev) => ({ guitarSessions: [...prev.guitarSessions, { id: uid(), date: todayDate(), durationMin: Number(gDur) || 0, practiced: gPracticed.trim() }] }));
    setGPracticed("");
  };
  const delGuitar = (id: string) => mutate((prev) => ({ guitarSessions: prev.guitarSessions.filter((g) => g.id !== id) }));
  const totalGuitarMin = data.guitarSessions.reduce((a, s) => a + s.durationMin, 0);

  // Travel
  const [trOpen, setTrOpen] = useState(false);
  const [trDest, setTrDest] = useState(""); const [trStart, setTrStart] = useState(""); const [trEnd, setTrEnd] = useState("");
  const [trBudget, setTrBudget] = useState(""); const [trStatus, setTrStatus] = useState<TripStatus>("Planning");
  const addTrip = () => {
    if (!trDest.trim()) return;
    mutate((prev) => ({
      trips: [...prev.trips, { id: uid(), destination: trDest.trim(), startDate: trStart || todayDate(), endDate: trEnd || todayDate(), budget: Number(trBudget) || 0, status: trStatus, packing: [] }],
    }));
    setTrDest(""); setTrStart(""); setTrEnd(""); setTrBudget("");
    setTrOpen(false);
  };
  const delTrip = (id: string) => mutate((prev) => ({ trips: prev.trips.filter((t) => t.id !== id) }));
  const updateTripStatus = (id: string, s: TripStatus) =>
    mutate((prev) => ({ trips: prev.trips.map((t) => t.id === id ? { ...t, status: s } : t) }));
  const addPacking = (id: string, item: string) => {
    if (!item.trim()) return;
    mutate((prev) => ({
      trips: prev.trips.map((t) => t.id === id ? { ...t, packing: [...t.packing, { id: uid(), item: item.trim(), done: false }] } : t),
    }));
  };
  const togglePacking = (tripId: string, packId: string) =>
    mutate((prev) => ({
      trips: prev.trips.map((t) => t.id === tripId ? { ...t, packing: t.packing.map((p) => p.id === packId ? { ...p, done: !p.done } : p) } : t),
    }));
  const delPacking = (tripId: string, packId: string) =>
    mutate((prev) => ({
      trips: prev.trips.map((t) => t.id === tripId ? { ...t, packing: t.packing.filter((p) => p.id !== packId) } : t),
    }));

  return (
    <ModuleLayout number="08" title="Hobby" subtitle="Craft · Time · Mastery" icon={Star}>
      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cars">Cars</TabsTrigger>
          <TabsTrigger value="guitar">Guitar</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="Current Focus">
              <div className="hud-label text-3xl text-primary hud-glow">{data.hobby.current}</div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {HOBBIES.map((h) => (
                  <button key={h} onClick={() => mutate({ hobby: { ...data.hobby, current: h } })}
                    className={`hud-label text-[10px] py-2 rounded border ${data.hobby.current === h ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}>
                    {h}
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="Time Invested">
              <div className="hud-label text-3xl text-primary hud-glow">{data.hobby.hours.toFixed(1)} hrs</div>
              <Button onClick={() => setLogOpen(true)} className="w-full mt-4 hud-label text-[10px]">+ Log Time</Button>
            </Panel>
            <Panel title="Satisfaction">
              <div className="hud-label text-3xl text-primary hud-glow">{Math.min(100, Math.round(data.hobby.hours * 5))}%</div>
              <div className="hud-label text-[10px] text-muted-foreground mt-2">Progress to mastery</div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <Panel title="Log Car Meet">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input type="date" value={cmDate} onChange={(e) => setCmDate(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Location" value={cmLoc} onChange={(e) => setCmLoc(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="Cars seen" value={cmCars} onChange={(e) => setCmCars(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addMeet} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
            <textarea placeholder="Notes" value={cmNotes} onChange={(e) => setCmNotes(e.target.value)} rows={2}
              className="w-full mt-3 bg-transparent border border-border rounded p-2 text-xs resize-none focus:outline-none focus:border-primary/50" />
          </Panel>
          <Panel title={`Meet History (${data.carMeets.length})`}>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {[...data.carMeets].reverse().map((m) => (
                <li key={m.id} className="py-3 group">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="hud-label text-xs text-foreground">{m.location}</div>
                      <div className="hud-label text-[10px] text-muted-foreground">{m.date} · {m.cars}</div>
                    </div>
                    <button onClick={() => delMeet(m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {m.notes && <p className="text-xs text-foreground/70 mt-1">{m.notes}</p>}
                </li>
              ))}
              {!data.carMeets.length && <li className="text-xs text-muted-foreground py-6 text-center">No meets logged.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="guitar" className="space-y-6">
          <Panel title="Log Practice">
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3">
              <Input type="number" placeholder="Min" value={gDur} onChange={(e) => setGDur(e.target.value)} className="h-9 text-xs" />
              <Input placeholder="What did you practice?" value={gPracticed} onChange={(e) => setGPracticed(e.target.value)} className="h-9 text-xs" />
              <Button onClick={addGuitar} size="sm" className="hud-label text-[10px]">+ Add</Button>
            </div>
          </Panel>
          <Panel title="Skill Progress">
            {[
              ["Rhythm", Math.min(100, totalGuitarMin / 6)],
              ["Lead", Math.min(100, totalGuitarMin / 10)],
              ["Theory", Math.min(100, totalGuitarMin / 15)],
            ].map(([label, pct]) => (
              <div key={label as string} className="mb-3">
                <div className="flex justify-between hud-label text-[10px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-primary">{Math.round(pct as number)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%`, boxShadow: "0 0 6px var(--primary)" }} />
                </div>
              </div>
            ))}
            <div className="hud-label text-[10px] text-muted-foreground mt-3">Total: {totalGuitarMin} min · {data.guitarSessions.length} sessions</div>
          </Panel>
          <Panel title={`Practice History (${data.guitarSessions.length})`}>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {[...data.guitarSessions].reverse().map((s) => (
                <li key={s.id} className="py-2 grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 group text-xs">
                  <span className="hud-label text-[10px] text-muted-foreground">{s.date}</span>
                  <span className="text-foreground/85">{s.practiced}</span>
                  <span className="hud-label text-primary">{s.durationMin}m</span>
                  <button onClick={() => delGuitar(s.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!data.guitarSessions.length && <li className="text-xs text-muted-foreground py-6 text-center">No sessions yet.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="travel" className="space-y-6">
          <Button onClick={() => setTrOpen(true)} size="sm" className="hud-label text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Add Trip
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.trips.map((trip) => (
              <TripCard key={trip.id} trip={trip}
                onDelete={() => delTrip(trip.id)}
                onStatus={(s) => updateTripStatus(trip.id, s)}
                onAddPack={(item) => addPacking(trip.id, item)}
                onTogglePack={(pid) => togglePacking(trip.id, pid)}
                onDelPack={(pid) => delPacking(trip.id, pid)}
              />
            ))}
            {!data.trips.length && <div className="text-xs text-muted-foreground py-6 text-center col-span-full">No trips planned.</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">Log {data.hobby.current} Time</DialogTitle></DialogHeader>
          <label className="block">
            <span className="hud-label text-[10px] text-muted-foreground">Hours</span>
            <Input type="number" step="0.25" value={logHrs} onChange={(e) => setLogHrs(e.target.value)} className="h-9 text-xs mt-1" />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={submitTime} className="hud-label text-[10px]">Add Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trOpen} onOpenChange={setTrOpen}>
        <DialogContent className="hud-card border-primary/40">
          <DialogHeader><DialogTitle className="hud-label text-primary hud-glow">New Trip</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Destination" value={trDest} onChange={(e) => setTrDest(e.target.value)} className="h-9 text-xs" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={trStart} onChange={(e) => setTrStart(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={trEnd} onChange={(e) => setTrEnd(e.target.value)} className="h-9 text-xs" />
            </div>
            <Input type="number" placeholder="Budget" value={trBudget} onChange={(e) => setTrBudget(e.target.value)} className="h-9 text-xs" />
            <div>
              <span className="hud-label text-[10px] text-muted-foreground">Status</span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {TRIP_STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setTrStatus(s)}
                    className={`hud-label text-[10px] py-2 rounded border ${trStatus === s ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrOpen(false)} className="hud-label text-[10px]">Cancel</Button>
            <Button onClick={addTrip} className="hud-label text-[10px]">Add Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

function TripCard({
  trip, onDelete, onStatus, onAddPack, onTogglePack, onDelPack,
}: {
  trip: import("@/lib/evolution-data").Trip;
  onDelete: () => void;
  onStatus: (s: TripStatus) => void;
  onAddPack: (item: string) => void;
  onTogglePack: (pid: string) => void;
  onDelPack: (pid: string) => void;
}) {
  const [item, setItem] = useState("");
  const submit = () => { onAddPack(item); setItem(""); };
  return (
    <div className="hud-card p-4 group relative">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="hud-label text-sm text-primary hud-glow">{trip.destination}</div>
          <div className="hud-label text-[10px] text-muted-foreground">{trip.startDate} → {trip.endDate} · ${trip.budget}</div>
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        {TRIP_STATUSES.map((s) => (
          <button key={s} onClick={() => onStatus(s)}
            className={`hud-label text-[9px] px-2 py-1 rounded border ${trip.status === s ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="hud-label text-[10px] text-muted-foreground mb-2">Packing ({trip.packing.filter((p) => p.done).length}/{trip.packing.length})</div>
        <div className="flex gap-2 mb-2">
          <Input value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Add item…" className="h-8 text-xs" />
          <Button onClick={submit} size="sm" className="hud-label text-[10px]">+</Button>
        </div>
        <ul className="space-y-1 max-h-32 overflow-y-auto">
          {trip.packing.map((p) => (
            <li key={p.id} className="flex items-center gap-2 group/p">
              <button onClick={() => onTogglePack(p.id)}
                className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${p.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                {p.done && <span className="text-[8px] text-primary-foreground">✓</span>}
              </button>
              <span className={`flex-1 text-xs ${p.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{p.item}</span>
              <button onClick={() => onDelPack(p.id)} className="opacity-0 group-hover/p:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
