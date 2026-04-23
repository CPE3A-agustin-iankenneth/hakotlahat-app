import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeatherAlertsClient } from "@/components/drv/weather-alerts-client";

// ── Open-Meteo weather code → human-readable label ──────────────────────────
function decodeWMO(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown conditions";
}

// ── Severity thresholds ──────────────────────────────────────────────────────
function classifyWeather(current: {
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  visibility: number;
}): WeatherWarning[] {
  const warnings: WeatherWarning[] = [];

  const { precipitation, wind_speed, weather_code, visibility } = current;

  // Thunderstorm
  if ([95, 96, 99].includes(weather_code)) {
    warnings.push({
      id: "thunderstorm",
      severity: "critical",
      category: "WEATHER • THUNDERSTORM",
      title: "Active thunderstorm in your area.",
      detail:
        "Lightning and heavy rain detected. Avoid elevated or open terrain. Use extreme caution while driving.",
    });
  } else if (precipitation >= 15) {
    // Heavy rain
    warnings.push({
      id: "heavy-rain",
      severity: "critical",
      category: "WEATHER • HEAVY RAIN",
      title: "Heavy rainfall detected — road flooding likely.",
      detail: `Current precipitation is ${precipitation.toFixed(1)} mm/h. Flood-prone routes may be impassable. Drive at reduced speed.`,
    });
  } else if (precipitation >= 5) {
    // Moderate rain
    warnings.push({
      id: "moderate-rain",
      severity: "warning",
      category: "WEATHER • RAIN",
      title: "Moderate rain — reduced road traction.",
      detail: `Rainfall rate: ${precipitation.toFixed(1)} mm/h. Increase following distance and reduce speed.`,
    });
  } else if (precipitation > 0) {
    // Light rain
    warnings.push({
      id: "light-rain",
      severity: "info",
      category: "WEATHER • DRIZZLE",
      title: "Light rain in your service area.",
      detail: `Precipitation: ${precipitation.toFixed(1)} mm/h. Conditions are manageable — remain alert.`,
    });
  }

  // High wind
  if (wind_speed >= 60) {
    warnings.push({
      id: "high-wind",
      severity: "critical",
      category: "WEATHER • WIND",
      title: "Dangerous wind speeds detected.",
      detail: `Wind speed: ${wind_speed.toFixed(0)} km/h. Risk of debris and vehicle instability. Avoid exposed elevated routes.`,
    });
  } else if (wind_speed >= 40) {
    warnings.push({
      id: "moderate-wind",
      severity: "warning",
      category: "WEATHER • WIND",
      title: "Strong winds — exercise caution.",
      detail: `Wind speed: ${wind_speed.toFixed(0)} km/h. Secure cargo before departure. Take care on open roads.`,
    });
  }

  // Low visibility (fog / heavy rain)
  if ([45, 48].includes(weather_code) || visibility < 500) {
    warnings.push({
      id: "low-visibility",
      severity: "warning",
      category: "WEATHER • VISIBILITY",
      title: "Low visibility conditions.",
      detail: `Estimated visibility: ${visibility < 1000 ? `${visibility} m` : `${(visibility / 1000).toFixed(1)} km`}. Use headlights and hazard lights as needed.`,
    });
  }

  return warnings;
}

export type WeatherWarning = {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  detail: string;
};

export type WeatherSnapshot = {
  temperature: number;
  feels_like: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  condition: string;
  humidity: number;
  // next-6-hour max precipitation (for trend)
  max_precip_6h: number;
  municipalityName: string;
  fetchedAt: string;
};

async function AlertsPageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch driver profile with municipality coordinates
  const { data: profile } = await supabase
    .from("users")
    .select("municipality_id")
    .eq("id", user.id)
    .single();

  if (!profile?.municipality_id) redirect("/onboarding");

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name, center_lat, center_lng")
    .eq("id", profile.municipality_id)
    .single();

  // Fallback coords (Metro Manila) if municipality has no coords yet
  const lat = municipality?.center_lat ?? 14.5995;
  const lng = municipality?.center_lng ?? 120.9842;
  const municipalityName = municipality?.name ?? "Your Area";

  // ── Call Open-Meteo ──────────────────────────────────────────────────────
  let weatherSnap: WeatherSnapshot | null = null;
  let warnings: WeatherWarning[] = [];
  let fetchError: string | null = null;

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: [
        "temperature_2m",
        "apparent_temperature",
        "precipitation",
        "wind_speed_10m",
        "weather_code",
        "relative_humidity_2m",
      ].join(","),
      hourly: "precipitation",
      forecast_hours: "6",
      timezone: "Asia/Manila",
      wind_speed_unit: "kmh",
    });

    // Also include a visibility field if available (current only)
    // Open-Meteo doesn't expose visibility in the free current tier directly.
    // We derive it from weather_code.

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min

    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);

    const data = await res.json();

    const c = data.current;
    const hourlyPrecip: number[] = data.hourly?.precipitation ?? [];

    const maxPrecip6h = hourlyPrecip.length
      ? Math.max(...hourlyPrecip.slice(0, 6))
      : 0;

    // Estimate visibility from weather_code (coarse)
    const wcode: number = c.weather_code;
    let visibility = 10000; // default clear
    if ([45, 48].includes(wcode)) visibility = 200;
    else if ([65, 82].includes(wcode)) visibility = 500;
    else if ([61, 63, 80, 81].includes(wcode)) visibility = 2000;

    weatherSnap = {
      temperature: c.temperature_2m,
      feels_like: c.apparent_temperature,
      precipitation: c.precipitation,
      wind_speed: c.wind_speed_10m,
      weather_code: wcode,
      condition: decodeWMO(wcode),
      humidity: c.relative_humidity_2m,
      max_precip_6h: maxPrecip6h,
      municipalityName,
      fetchedAt: new Date().toISOString(),
    };

    warnings = classifyWeather({
      precipitation: c.precipitation,
      wind_speed: c.wind_speed_10m,
      weather_code: wcode,
      visibility,
    });
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <WeatherAlertsClient
      weather={weatherSnap}
      warnings={warnings}
      fetchError={fetchError}
    />
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={null}>
      <AlertsPageContent />
    </Suspense>
  );
}
