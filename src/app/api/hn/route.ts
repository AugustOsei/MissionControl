import { NextResponse } from "next/server";

type HNItem = {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  by: string;
  dead?: boolean;
  deleted?: boolean;
};

export async function GET() {
  try {
    const idsRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 300 } }
    );
    const ids: number[] = await idsRes.json();

    const top = ids.slice(0, 20);
    const items = await Promise.all(
      top.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 300 },
        }).then((r) => r.json() as Promise<HNItem>)
      )
    );

    const stories = items
      .filter((it) => it && !it.dead && !it.deleted && it.url && it.title)
      .slice(0, 8)
      .map((it) => ({
        id: it.id,
        title: it.title,
        url: it.url,
        score: it.score,
        by: it.by,
        ago: timeAgo(it.time),
      }));

    return NextResponse.json({ stories });
  } catch {
    return NextResponse.json({ stories: [] });
  }
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
