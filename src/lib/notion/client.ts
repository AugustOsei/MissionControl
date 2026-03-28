type NotionQueryResponse = {
  results: any[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function notionFetch(path: string, init?: RequestInit) {
  const key = requireEnv("NOTION_API_KEY");

  // Default: keep Notion reads reasonably fresh without hammering the API.
  // Override via NOTION_REVALIDATE_SECONDS (set 0 to disable caching).
  const revalidateSeconds = Number(process.env.NOTION_REVALIDATE_SECONDS ?? "120");
  const useCache = Number.isFinite(revalidateSeconds) && revalidateSeconds > 0;

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...(useCache ? { next: { revalidate: revalidateSeconds } } : { cache: "no-store" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function notionQueryDatabase(
  databaseId: string,
  body: any,
): Promise<NotionQueryResponse> {
  return notionFetch(`/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
