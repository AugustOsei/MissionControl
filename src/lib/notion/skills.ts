import { notionQueryDatabase } from "@/lib/notion/client";

export type SkillItem = {
  id: string;
  name: string;
};

function plainTitle(prop: unknown): string {
  const p = prop as { title?: Array<{ plain_text?: string }> };
  const t = p?.title ?? [];
  return t.map((x) => x.plain_text ?? "").join("").trim();
}

export async function getSkillsInventory(limit = 50): Promise<SkillItem[]> {
  // Hard-coded DB id (public-safe): Skills Inventory
  const db = "f6fba8d0-e5af-4cb4-9068-06f02a7f3a31";
  const res = await notionQueryDatabase(db, {
    page_size: Math.min(100, Math.max(1, limit)),
    sorts: [{ property: "Name", direction: "ascending" }],
  });

  return (res.results as Array<any>).map((page) => {
    const props = page.properties ?? {};
    return { id: page.id, name: plainTitle(props.Name) || "(unnamed)" };
  });
}
