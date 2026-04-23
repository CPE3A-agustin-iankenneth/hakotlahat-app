import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: municipalities, error } = await supabase
      .from("municipalities")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      municipalities: municipalities || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch municipalities" },
      { status: 500 }
    );
  }
}

