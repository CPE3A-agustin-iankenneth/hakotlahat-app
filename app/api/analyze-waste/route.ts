import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = [
  "Cardboard & Paper",
  "Plastics",
  "Electronics",
  "Bulk Waste",
  "Organic",
  "Hazardous",
  "Other",
] as const;

type WasteCategory = (typeof CATEGORIES)[number];

interface AnalysisResult {
  category: WasteCategory;
  priority_score: number;
  volume_estimate: number;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `Analyze this waste image. Return ONLY a valid JSON object with no markdown or extra text:
{
  "category": one of "Cardboard & Paper" | "Plastics" | "Electronics" | "Bulk Waste" | "Organic" | "Hazardous" | "Other",
  "priority_score": integer 1-5 (5 = most urgent or hazardous),
  "volume_estimate": number in cubic meters (e.g. 0.5)
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      { inlineData: { mimeType, data: base64 } },
      { text: prompt },
    ],
  });

  const raw = response.text ?? "";
  const jsonText = raw.replace(/```json|```/g, "").trim();

  let result: AnalysisResult;
  try {
    result = JSON.parse(jsonText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw },
      { status: 500 }
    );
  }

  result.priority_score = Math.max(1, Math.min(5, Math.round(result.priority_score)));
  if (!CATEGORIES.includes(result.category)) {
    result.category = "Other";
  }

  return NextResponse.json(result);
}
