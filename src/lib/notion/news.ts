import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";

export type NewsItem = {
  id: string;
  title: string;
  source?: string;
  status?: string;
  type?: string;

  // URLs
  canonicalUrl?: string;
  sourceUrl?: string;
  wordpressUrl?: string;

  submittedAt?: string;
  createdAt?: string;
  pillar?: string;
  businessValue?: string;
  approved?: boolean;

  notes?: string;
};

function plainTitle(prop: unknown): string {
  const p = prop as { title?: Array<{ plain_text?: string }> };
  const t = p?.title ?? [];
  return t.map((x) => x.plain_text ?? "").join("").trim();
}

function selectName(prop: unknown): string | undefined {
  const p = prop as { select?: { name?: string } };
  return p?.select?.name;
}

function richTextPlain(prop: unknown): string | undefined {
  const p = prop as { rich_text?: Array<{ plain_text?: string }> };
  const t = p?.rich_text ?? [];
  const s = t.map((x) => x.plain_text ?? "").join("").trim();
  return s || undefined;
}

function dateStart(prop: unknown): string | undefined {
  const p = prop as { date?: { start?: string } };
  return p?.date?.start;
}

function urlValue(prop: unknown): string | undefined {
  const p = prop as { url?: string };
  return p?.url;
}

function checkboxValue(prop: unknown): boolean | undefined {
  const p = prop as { checkbox?: boolean };
  return p?.checkbox;
}

export async function getNewsFeed(limit = 50): Promise<NewsItem[]> {
  const db = requireEnv("NOTION_CONTENT_DB");

  const res = await notionQueryDatabase(db, {
    page_size: Math.min(100, Math.max(1, limit)),
    // Prefer Submitted at (desc). If it's empty for some rows, Notion will push them down.
    sorts: [{ property: "Submitted at", direction: "descending" }],
    filter: {
      and: [{ property: "Type", select: { equals: "Link post" } }],
    },
  });

  return (res.results as Array<any>).map((page) => {
    const props = page.properties ?? {};
    const submittedAt =
      dateStart(props["Submitted at"]) ??
      dateStart(props["Publish date"]) ??
      undefined;

    return {
      id: page.id,
      title: plainTitle(props.Name) || "(untitled)",
      source: selectName(props.Source),
      status: selectName(props.Status),
      type: selectName(props.Type),

      canonicalUrl: urlValue(props["Canonical URL"]),
      sourceUrl: urlValue(props["Source URL"]),
      wordpressUrl: urlValue(props["WordPress URL"]),

      submittedAt,
      createdAt: page.created_time,
      pillar: selectName(props.Pillar),
      businessValue: selectName(props["Business Value"]),
      approved: checkboxValue(props.Approved),
      notes: richTextPlain(props.Notes),
    };
  });
}
