import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ count: 0 });

    const { data: profile } = await supabase
      .from("users")
      .select("municipality_id")
      .eq("id", user.id)
      .single();

    if (!profile?.municipality_id) return NextResponse.json({ count: 0 });

    const { data: municipality } = await supabase
      .from("municipalities")
      .select("center_lat, center_lng")
      .eq("id", profile.municipality_id)
      .single();

    const lat = municipality?.center_lat ?? 14.5995;
    const lng = municipality?.center_lng ?? 120.9842;

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: "precipitation,wind_speed_10m,weather_code",
      timezone: "Asia/Manila",
      wind_speed_unit: "kmh",
    });

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) return NextResponse.json({ count: 0 });

    const data = await res.json();
    const c = data.current;

    const weatherCode: number = c.weather_code;
    const precipitation: number = c.precipitation;
    const windSpeed: number = c.wind_speed_10m;

    // Estimate visibility from weather code
    let visibility = 10_000;
    if ([45, 48].includes(weatherCode)) visibility = 200;
    else if ([65, 82].includes(weatherCode)) visibility = 500;
    else if ([61, 63, 80, 81].includes(weatherCode)) visibility = 2000;

    // Count warnings using same thresholds as alerts page classifyWeather
    let count = 0;
    if ([95, 96, 99].includes(weatherCode)) count++;
    else if (precipitation > 0) count++;
    if (windSpeed >= 40) count++;
    if ([45, 48].includes(weatherCode) || visibility < 500) count++;

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
