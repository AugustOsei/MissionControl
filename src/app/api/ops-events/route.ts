import { getOpsEvents } from "@/lib/notion/opsEvents";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const source = (u.searchParams.get("source") ?? "").trim();
    const limit = Number(u.searchParams.get("limit") ?? "30") || 30;

    const events = await getOpsEvents(Math.min(100, Math.max(1, limit)));
    const filtered = source
      ? events.filter((e) => (e.source ?? "").toLowerCase() === source.toLowerCase())
      : events;

    return NextResponse.json({ events: filtered });
  } catch (e: any) {
    return NextResponse.json({ events: [], error: String(e) }, { status: 200 });
  }
}
