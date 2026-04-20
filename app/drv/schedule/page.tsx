import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  MapPinned,
  Navigation,
  Package,
  Plus,
  Scale,
} from "lucide-react";

const itineraryStops = [
  {
    id: "13",
    eta: "08:15 AM",
    title: "Lakeside Retail Park",
    subtitle: "Unit 4, Sector B",
    status: "Delivered",
    done: true,
  },
  {
    id: "14",
    eta: "09:45 AM",
    title: "TechCorp Distribution Center",
    subtitle: "1242 Innovation Way, North Industrial District",
    items: 24,
    weight: 420,
    isCurrent: true,
    badges: ["Current Stop", "High Volume", "Priority"],
  },
  {
    id: "15",
    eta: "10:20 AM",
    title: "Oakwood Residential Complex",
    subtitle: "88 Silver Lane, Apartment Block C",
  },
  {
    id: "16",
    eta: "10:55 AM",
    title: "Green Grocers Co-op",
    subtitle: "Central Market Sq, Unit 12",
  },
  {
    id: "17",
    eta: "11:30 AM",
    title: "Harbor View Apartments",
    subtitle: "44 Waterfront Dr, Pier 7",
  },
] as const;

const badgeStyles: Record<string, string> = {
  "Current Stop": "bg-primary text-primary-foreground",
  "High Volume": "bg-destructive text-destructive-foreground",
  Priority: "bg-secondary text-secondary-foreground",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-card to-background shadow-2xl">
        <div className="border-b border-border px-5 pb-4 pt-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Today&apos;s Itinerary
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tuesday, Oct 24 • Route HL-402
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Shift Progress
              </p>
              <p className="mt-1 text-xl font-semibold text-muted-foreground">
                <span className="text-4xl font-black text-foreground">14</span> /
                45 Stops Completed
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-muted">
            <div className="h-full w-[31%] rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Depot Start: 06:00 AM</span>
            <span>Est. Finish: 04:30 PM</span>
          </div>
        </div>

        <div className="relative px-5 py-4 md:px-6">
          <div className="pointer-events-none absolute bottom-4 left-9 top-4 hidden w-px bg-gradient-to-b from-primary/60 via-border to-muted md:block" />

          <div className="space-y-4">
            {itineraryStops.map((stop) => (
              <article
                key={stop.id}
                className={`relative rounded-xl border px-4 py-3 transition-colors ${
                  stop.isCurrent
                    ? "border-primary/70 bg-card/90 shadow-md ring-1 ring-primary/25"
                    : "border-border bg-card/70"
                }`}
              >
                <span
                  className={`absolute -left-7 top-9 hidden h-3.5 w-3.5 rounded-full border md:block ${
                    stop.isCurrent
                      ? "border-primary-foreground bg-primary ring-4 ring-primary/20"
                      : stop.done
                        ? "border-secondary bg-secondary"
                        : "border-border bg-muted"
                  }`}
                />

                {stop.badges && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {stop.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[badge]}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Stop #{stop.id} • ETA {stop.eta}
                    </p>
                    <h2
                      className={`truncate text-2xl font-extrabold tracking-tight ${
                        stop.done
                          ? "text-muted-foreground/70 line-through"
                          : "text-foreground"
                      }`}
                    >
                      {stop.title}
                    </h2>
                    <p className="truncate text-base text-muted-foreground">
                      {stop.subtitle}
                      {stop.status ? ` • ${stop.status}` : ""}
                    </p>

                    {stop.isCurrent && (
                      <div className="mt-3 flex items-center gap-5 text-foreground">
                        <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                          <Package className="h-4 w-4 text-primary" />
                          {stop.items} Items
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                          <Scale className="h-4 w-4 text-primary" />
                          {stop.weight} kg
                        </span>
                      </div>
                    )}
                  </div>

                  {stop.isCurrent ? (
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xl font-black text-primary-foreground transition hover:brightness-110"
                    >
                      <Navigation className="h-5 w-5" />
                      Navigate
                    </button>
                  ) : stop.done ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-secondary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="fixed bottom-28 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:brightness-110 md:bottom-6"
            aria-label="Open map actions"
          >
            <Plus className="h-7 w-7" />
          </button>

          <button
            type="button"
            className="fixed right-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-lg transition hover:bg-muted bottom-[11.5rem] md:bottom-24"
            aria-label="Open stop map"
          >
            <MapPinned className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
