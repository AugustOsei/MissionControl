import { notionQueryDatabase } from "@/lib/notion/client";

export type ProjectNode = {
  id: string;
  name: string;
  pillar?: string;
  level?: string;
  parentId?: string;
  children: ProjectNode[];
};

function plainTitle(prop: any): string {
  const t = prop?.title ?? [];
  return t.map((x: any) => x.plain_text).join("").trim();
}

function selectName(prop: any): string | undefined {
  return prop?.select?.name;
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
