import { notionQueryDatabase, requireEnv } from "@/lib/notion/client";

export type NewsItem = {
  id: string;
  title: string;
  source?: string;
  status?: string;
  type?: string;
  url?: string;
  submittedAt?: string;
  pillar?: string;
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

function dateStart(prop: unknown): string | undefined {
  const p = prop as { date?: { start?: string } };
  return p?.date?.start;
}

function urlValue(prop: unknown): string | undefined {
  const p = prop as { url?: string };
  return p?.url;
}

export async function getNewsFeed(limit = 50): Promise<NewsItem[]> {
  const db = requireEnv("NOTION_CONTENT_DB");

  const res = await notionQueryDatabase(db, {
    page_size: Math.min(100, Math.max(1, limit)),
    sorts: [{ property: "Name", direction: "descending" }],
    filter: {
      and: [
        { property: "Type", select: { equals: "Link post" } },
        // optional: only show Ready + Idea
      ],
    },
  });

  return (res.results as Array<any>).map((page) => {
    const props = page.properties ?? {};
    return {
      id: page.id,
      title: plainTitle(props.Name) || "(untitled)",
      source: selectName(props.Source),
      status: selectName(props.Status),
      type: selectName(props.Type),
      url: urlValue(props["Canonical URL"]) ?? urlValue(props["Source URL"]) ?? urlValue(props["WordPress URL"]),
      submittedAt: dateStart(props["Submitted at"]) ?? dateStart(props["Publish date"]) ?? undefined,
      pillar: selectName(props.Pillar),
    };
  });
}
