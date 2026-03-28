import { NewsList } from "@/components/news/NewsList";
import { getNewsFeed } from "@/lib/notion/news";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  let items = [] as Awaited<ReturnType<typeof getNewsFeed>>;
  let err: string | null = null;

  try {
    // Keep it reasonably small to avoid Notion rate limits; UI filters to last 7 days by default.
    items = await getNewsFeed(120);
  } catch (e: any) {
    err = String(e);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">News</h1>
        <p className="text-sm text-white/60">
          Link logs + intel feed (Notion-backed). Default: last 7 days.
        </p>
        {err && (
          <div className="mt-2 text-xs font-mono text-red-300">
            {err.includes("NOTION_CONTENT_DB")
              ? "Set NOTION_CONTENT_DB in Vercel env vars to enable the feed."
              : err}
          </div>
        )}
      </div>

      <NewsList items={items} />
    </div>
  );
}
