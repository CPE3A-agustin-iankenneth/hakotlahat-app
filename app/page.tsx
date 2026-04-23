import Link from "next/link";
import {
  Truck,
  MapPin,
  Zap,
  Shield,
  Users,
  BarChart3,
  ArrowRight,
  Recycle,
  Camera,
  Route,
  CheckCircle2,
  Leaf,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <AboutUs />
      <Roles />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Recycle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            HakotLahat
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
          <a href="#roles" className="hover:text-foreground transition-colors">For You</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" />
            AI-Powered Waste Management
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
            Smarter Pickups.{" "}
            <span className="text-primary">Cleaner Cities.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            HakotLahat connects residents, drivers, and administrators in a
            unified platform — using AI and optimized routing to make municipal
            waste collection effortless.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Request a Pickup
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-card text-foreground border border-border px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Dashboard preview strip */}
        <div className="mt-20 relative">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent z-10" />
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-4 text-xs text-muted-foreground">hakotlahat.app / admin</span>
            </div>
            <div className="grid grid-cols-4 gap-px bg-border">
              {[
                { label: "Pending Requests", value: "24", icon: MapPin, color: "text-accent" },
                { label: "Active Routes", value: "6", icon: Route, color: "text-primary" },
                { label: "Trucks Deployed", value: "8", icon: Truck, color: "text-secondary" },
                { label: "Collected Today", value: "187", icon: CheckCircle2, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card p-6">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-card p-6 grid grid-cols-3 gap-4">
              {["Brgy. Poblacion", "Brgy. San Jose", "Brgy. Maliwalo"].map((name, i) => (
                <div key={name} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-accent"}`} />
                  <span className="text-xs text-foreground font-medium truncate">{name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{["On Route", "Scheduled", "Pending"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const data = [
    { value: "3×", label: "Faster route planning" },
    { value: "40%", label: "Fuel savings on average" },
    { value: "98%", label: "Request resolution rate" },
    { value: "< 2 min", label: "AI classification time" },
  ];

  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {data.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Camera,
      title: "AI Waste Classification",
      description:
        "Residents snap a photo — Gemini Vision instantly categorizes waste type, estimates volume, and assigns a priority score for faster dispatch.",
    },
    {
      icon: Route,
      title: "Optimized Routing",
      description:
        "OpenRouteService builds priority-weighted pickup sequences in seconds, cutting travel time and fuel costs across the municipality.",
    },
    {
      icon: MapPin,
      title: "Real-time Fleet Tracking",
      description:
        "Admins watch every truck move live on a MapLibre map. Drivers get turn-by-turn guidance without leaving the app.",
    },
    {
      icon: Zap,
      title: "Weather-Aware Alerts",
      description:
        "Open-Meteo integration surfaces rain and hazard warnings for drivers mid-route, keeping the team safe and informed.",
    },
    {
      icon: BarChart3,
      title: "Actionable Analytics",
      description:
        "Track collection rates, hotspot barangays, and vehicle utilization from a single dashboard — no spreadsheets needed.",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Residents, drivers, and admins each get a purpose-built interface with only the controls and data they need.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything your municipality needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            One platform built around the full waste collection lifecycle — from
            resident request to truck confirmation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Resident Requests a Pickup",
      description:
        "Open the app, drop a pin on your location, and snap a photo of the waste. Our AI does the rest — classifying type and volume instantly.",
    },
    {
      step: "02",
      title: "Admin Optimizes the Route",
      description:
        "The system groups nearby requests by priority and generates an efficient route for each driver with a single click.",
    },
    {
      step: "03",
      title: "Driver Collects and Confirms",
      description:
        "Drivers follow the in-app map, collect waste at each stop, and mark requests as complete — updating residents in real time.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How HakotLahat works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple steps connect your community from request to collection.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border" />

          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-6 shadow-md">
                {s.step}
              </div>
              <h3 className="font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    {
      icon: Users,
      role: "Residents",
      tagline: "Fast. Simple. Mobile-first.",
      description:
        "Submit pickup requests in under a minute. Track your request status live and get notified when the truck is on the way.",
      href: "/auth/sign-up",
      cta: "Sign up as Resident",
      highlight: false,
    },
    {
      icon: Truck,
      role: "Drivers",
      tagline: "Navigate. Collect. Earn points.",
      description:
        "A dark-mode map interface built for the road. Follow optimized routes, log pickups, and track your shift performance.",
      href: "/auth/sign-up",
      cta: "Join as Driver",
      highlight: true,
    },
    {
      icon: BarChart3,
      role: "Administrators",
      tagline: "Control. Analyze. Optimize.",
      description:
        "Full visibility over your fleet, requests, and routes from a desktop command center. Manage vehicles, override routes, and export reports.",
      href: "/auth/sign-up",
      cta: "Register Municipality",
      highlight: false,
    },
  ];

  return (
    <section id="roles" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Built for every role
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each user gets a tailored experience — no clutter, no confusion.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.role}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                r.highlight
                  ? "bg-primary border-primary text-primary-foreground shadow-xl scale-[1.02]"
                  : "bg-card border-border text-foreground"
              }`}
            >
              {r.highlight && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  r.highlight ? "bg-primary-foreground/20" : "bg-primary/10"
                }`}
              >
                <r.icon
                  className={`w-6 h-6 ${r.highlight ? "text-primary-foreground" : "text-primary"}`}
                />
              </div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                  r.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {r.role}
              </p>
              <h3 className="text-xl font-bold mb-3">{r.tagline}</h3>
              <p
                className={`text-sm leading-relaxed flex-1 mb-6 ${
                  r.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {r.description}
              </p>
              <Link
                href={r.href}
                className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 ${
                  r.highlight
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {r.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutUs() {
  return (
    <section id="about" className="py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="grid grid-cols-6 gap-4">
              {/* Row 1: 3 images */}
              <div className="col-span-2 aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
                <img src="/images/emman.png" alt="Emman" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
                <img src="/images/gils.jpg" alt="Gils" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
                <img src="/images/nino.jpg" alt="Nino" className="w-full h-full object-cover" />
              </div>
              {/* Row 2: 2 images centered */}
              <div className="col-start-2 col-span-2 aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
                <img src="/images/ian.png" alt="Ian" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 aspect-square rounded-2xl overflow-hidden border border-border shadow-md">
                <img src="/images/lorr.jpg" alt="Lorr" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-foreground leading-tight mb-6">
                Redefining Waste Collection for the Modern Era
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At HakotLahat, we believe that clean communities are the foundation of a sustainable future. Our team combines expertise in environmental science, software engineering, and urban planning to solve one of the most pressing challenges in Philippine municipalities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Our Vision</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To be the leading platform for intelligent waste management, empowering every barangay with technology that saves time and resources.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Our Core Values</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Transparency, efficiency, and community-driven innovation are at the heart of everything we build.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
                  >
                    <Users className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-bold font-sans">10+</span> Experts dedicated to your city's health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center bg-primary rounded-3xl px-8 py-16 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground rounded-full -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary-foreground rounded-full translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to clean up your municipality?
          </h2>
          <p className="text-primary-foreground/75 mb-8 leading-relaxed">
            Join the growing network of barangays using HakotLahat to make
            waste collection faster, smarter, and fairer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">HakotLahat</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs">
              Smart, unified waste collection for Philippine municipalities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm">
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </Link>
            <Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign Up
            </Link>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} HakotLahat. All rights reserved.</p>
          <p>Built with Next.js &amp; Supabase</p>
        </div>
      </div>
    </footer>
  );
}
