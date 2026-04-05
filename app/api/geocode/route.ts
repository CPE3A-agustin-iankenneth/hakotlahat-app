import { NextRequest, NextResponse } from "next/server";

const ORS_BASE = "https://api.openrouteservice.org/geocode";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ORS API key not configured" }, { status: 500 });
  }

  try {
    let orsUrl: string;

    if (type === "search") {
      const q = searchParams.get("q");
      if (!q) return NextResponse.json({ features: [] });
      orsUrl = `${ORS_BASE}/search?api_key=${apiKey}&text=${encodeURIComponent(q)}&size=5&boundary.country=PH`;
    } else if (type === "reverse") {
      const lng = searchParams.get("lng");
      const lat = searchParams.get("lat");
      if (!lng || !lat) return NextResponse.json({ features: [] });
      orsUrl = `${ORS_BASE}/reverse?api_key=${apiKey}&point.lon=${lng}&point.lat=${lat}&size=1`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const res = await fetch(orsUrl);
    if (!res.ok) {
      return NextResponse.json({ features: [] }, { status: res.status });
    }

    const data = await res.json();

    const features = (data.features ?? []).map(
      (f: { properties: { label: string }; geometry: { coordinates: [number, number] } }) => ({
        label: f.properties.label,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })
    );

    return NextResponse.json({ features });
  } catch {
    return NextResponse.json({ features: [] }, { status: 500 });
  }
}
