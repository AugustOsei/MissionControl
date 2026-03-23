import { getNewsFeed } from "@/lib/notion/news";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export default async function NewsPage() {
  let items = [] as Awaited<ReturnType<typeof getNewsFeed>>;
  let err: string | null = null;

  try {
    items = await getNewsFeed(60);
  } catch (e: any) {
    err = String(e);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">News</h1>
        <p className="text-sm text-white/60">
          Link logs + intel feed (Notion-backed). Moltbook can be piped in next.
        </p>
        {err && (
          <div className="mt-2 text-xs font-mono text-red-300">
            {err.includes("NOTION_CONTENT_DB")
              ? "Set NOTION_CONTENT_DB in Vercel env vars to enable the feed."
              : err}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((x) => {
          const status = (x.status ?? "").toLowerCase();
          const badge =
            status === "ready"
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : status === "idea"
                ? "border-white/10 bg-white/5 text-white/60"
                : "border-white/10 bg-white/5 text-white/60";

          const chip = (tone: string) =>
            `rounded-full border px-2 py-1 text-[11px] font-mono ${tone}`;

          return (
            <div key={x.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-white/90 leading-snug line-clamp-2">
                    {x.title}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {x.source && (
                      <span className={chip("border-blue-500/25 bg-blue-500/10 text-blue-200")}>
                        {x.source}
                      </span>
                    )}
                    {x.pillar && (
                      <span className={chip("border-purple-500/25 bg-purple-500/10 text-purple-200")}>
                        {x.pillar}
                      </span>
                    )}
                    {x.businessValue && (
                      <span className={chip("border-amber-500/25 bg-amber-500/10 text-amber-200")}>
                        {x.businessValue}
                      </span>
                    )}
                    {x.type && (
                      <span className={chip("border-white/10 bg-white/5 text-white/55")}>
                        {x.type}
                      </span>
                    )}
                  </div>
                </div>
                <span className={"shrink-0 rounded-full border px-2 py-1 text-[11px] font-mono " + badge}>
                  {x.status ?? "—"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-white/35">{shortDate(x.submittedAt)}</div>
                {x.url ? (
                  <a
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-blue-300/80 hover:text-blue-200"
                  >
                    open ↗
                  </a>
                ) : (
                  <span className="text-[11px] font-mono text-white/25">no link</span>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && !err && (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35 font-mono md:col-span-2 xl:col-span-3">
            No items yet.
          </div>
        )}
      </div>
    </div>
  );
}
