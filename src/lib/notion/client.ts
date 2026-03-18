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

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
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
