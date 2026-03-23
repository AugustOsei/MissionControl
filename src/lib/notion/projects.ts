import { notionQueryDatabase } from "@/lib/notion/client";

export type ProjectNode = {
  id: string;
  name: string;
  pillar?: string;
  level?: string;
  parentId?: string;
  quickSummary?: string;
  appUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  url?: string; // Notion page URL
  children: ProjectNode[];
};

function plainTitle(prop: any): string {
  const t = prop?.title ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function selectName(prop: any): string | undefined {
  return prop?.select?.name;
}

function richTextPlain(prop: any): string | undefined {
  const t = prop?.rich_text ?? [];
  const s = t.map((x: any) => x.plain_text).join("").trim();
  return s || undefined;
}

function urlValue(prop: any): string | undefined {
  return prop?.url || undefined;
}

function relationFirstId(prop: any): string | undefined {
  return (prop?.relation ?? [])[0]?.id;
}

export async function getProjectsTreeForDb(
  databaseId: string
): Promise<{ parents: ProjectNode[] }> {
  const res = await notionQueryDatabase(databaseId, {
    page_size: 100,
    sorts: [{ property: "Name", direction: "ascending" }],
  });

  const nodes: ProjectNode[] = res.results.map((page: any) => {
    const props = page.properties ?? {};
    return {
      id: page.id,
      name: plainTitle(props.Name) || "(untitled)",
      pillar: selectName(props.Pillar),
      level: selectName(props.Level),
      parentId: relationFirstId(props["Parent Project"]),
      quickSummary: richTextPlain(props["Quick Summary"]) ?? richTextPlain(props.Notes),
      appUrl: urlValue(props["App URL"]) ?? urlValue(props.URL),
      repoUrl: urlValue(props["Repo URL"]),
      docsUrl: urlValue(props["Docs URL"]) ?? urlValue(props["Strategy Doc"]),
      url: page.url,
      children: [],
    };
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const roots: ProjectNode[] = [];

  for (const n of nodes) {
    if (n.parentId && byId.has(n.parentId)) byId.get(n.parentId)!.children.push(n);
    else roots.push(n);
  }

  const parents = roots
    .filter((r) => r.level === "Parent")
    .concat(roots.filter((r) => r.level !== "Parent"));

  return { parents };
}

// Keep for backwards compat
export async function getProjectsTree() {
  const { requireEnv } = await import("@/lib/notion/client");
  const db = requireEnv("NOTION_PROJECTS_DB");
  return getProjectsTreeForDb(db);
}
