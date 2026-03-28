export type PulseItem = {
  id: string;
  title: string;
  url: string;
  source: "hn";
  points?: number;
  comments?: number;
  author?: string;
  createdAt?: string;
  tags: string[];
  score: number;
};

type HNHit = {
  objectID: string;
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at?: string;
};

function safeUrl(hit: HNHit): string {
  // Some HN stories are "Ask HN" with no url; fall back to item page.
  if (hit.url && hit.url.startsWith("http")) return hit.url;
  return `https://news.ycombinator.com/item?id=${hit.objectID}`;
}

function toTags(title: string): string[] {
  const t = title.toLowerCase();
  const tags: string[] = [];

  const push = (x: string) => {
    if (!tags.includes(x)) tags.push(x);
  };

  if (/(agent|agents|agentic|autonomous|workflow|orchestration)/.test(t)) push("agents");
  if (/(robot|robots|robotic|humanoid|drone|quadruped)/.test(t)) push("robotics");
  if (/(automation|automate|rpa|zapier|n8n)/.test(t)) push("automation");
  if (/(llm|gpt|claude|gemini|openai|anthropic|mistral|llama)/.test(t)) push("llms");
  if (/(model|benchmark|eval|evaluation|leaderboard)/.test(t)) push("evals");
  if (/(startup|funding|seed|series|acquisition)/.test(t)) push("biz");
  if (/(policy|regulation|copyright|lawsuit|eu ai act)/.test(t)) push("policy");
  if (/(hardware|chip|gpu|nvidia|amd|tpu)/.test(t)) push("hardware");

  if (tags.length === 0) push("ai");
  return tags;
}

function score(points?: number, comments?: number): number {
  const p = points ?? 0;
  const c = comments ?? 0;
  // Simple "heat" heuristic: points dominate, comments add a bit.
  return p + c * 0.6;
}

export async function getHNPulse({
  hours = 72,
  perQuery = 20,
}: {
  hours?: number;
  perQuery?: number;
} = {}): Promise<PulseItem[]> {
  const queries = [
    "ai",
    "agent",
    "automation",
    "robot",
    "humanoid",
    "openai",
    "anthropic",
    "llm",
  ];

  const nowSec = Math.floor(Date.now() / 1000);
  const since = nowSec - hours * 60 * 60;

  const hits: HNHit[] = [];

  // Serial fetch on purpose (small N, keeps us polite).
  for (const q of queries) {
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", q);
    url.searchParams.set("tags", "story");
    url.searchParams.set("hitsPerPage", String(perQuery));
    url.searchParams.set("numericFilters", `created_at_i>${since}`);

    const res = await fetch(url.toString(), {
      // Cache at the page level; this is just a hint.
      next: { revalidate: 1800 },
    });

    if (!res.ok) continue;
    const data = (await res.json()) as { hits?: HNHit[] };
    hits.push(...(data.hits ?? []));
  }

  // Dedupe by objectID.
  const map = new Map<string, HNHit>();
  for (const h of hits) {
    if (!h?.objectID) continue;
    const prev = map.get(h.objectID);
    // Keep the one with higher points if duplicates show up.
    if (!prev || (h.points ?? 0) > (prev.points ?? 0)) map.set(h.objectID, h);
  }

  const items: PulseItem[] = Array.from(map.values())
    .filter((h) => (h.title ?? "").trim().length > 0)
    .map((h) => {
      const title = (h.title ?? "").trim();
      const tags = toTags(title);
      return {
        id: `hn:${h.objectID}`,
        title,
        url: safeUrl(h),
        source: "hn" as const,
        points: h.points,
        comments: h.num_comments,
        author: h.author,
        createdAt: h.created_at,
        tags,
        score: score(h.points, h.num_comments),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);

  return items;
}

export function summarizeThemes(items: PulseItem[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const t of it.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
