import { getOpsEvents } from "@/lib/notion/opsEvents";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await getOpsEvents(30);
    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ events: [], error: String(e) }, { status: 200 });
  }
}
