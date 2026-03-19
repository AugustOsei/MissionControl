import { getActivityFeed } from "@/lib/activity/feed";
import { NextResponse } from "next/server";

export async function GET() {
  const feed = await getActivityFeed();
  return NextResponse.json(feed);
}
