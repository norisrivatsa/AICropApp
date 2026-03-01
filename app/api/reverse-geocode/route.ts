import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/aws/location";
import { isMockMode } from "@/lib/mock/mockMode";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    if (isMockMode()) {
      return NextResponse.json({ district: "Lucknow", state: "Uttar Pradesh", country: "India" });
    }

    const result = await reverseGeocode(lat, lng);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
