import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = process.env.CALENDAR_PROXY_URL;
  const token = process.env.CALENDAR_PROXY_TOKEN;
  const cfId = process.env.CF_ACCESS_CLIENT_ID;
  const cfSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  if (!url) {
    return NextResponse.json({ events: [], error: "CALENDAR_PROXY_URL not configured" }, { status: 200 });
  }

  const u = new URL(req.url);
  const start = u.searchParams.get("start");
  const end = u.searchParams.get("end");

  const target = new URL(url);
  target.searchParams.set("start", start ?? "");
  target.searchParams.set("end", end ?? "");

  try {
    const res = await fetch(target.toString(), {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cfId ? { "CF-Access-Client-Id": cfId } : {}),
        ...(cfSecret ? { "CF-Access-Client-Secret": cfSecret } : {}),
      },
      // Don’t cache calendar.
      cache: "no-store",
    });

    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: 200 });
    } catch {
      return NextResponse.json(
        {
          events: [],
          error: `non-json upstream response (${res.status})`,
          upstreamStatus: res.status,
          upstreamSnippet: text.slice(0, 300),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ events: [], error: String(e) }, { status: 200 });
  }
}
