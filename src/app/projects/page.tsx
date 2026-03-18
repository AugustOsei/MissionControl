import { getProjectsTree } from "@/lib/notion/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const tree = await getProjectsTree();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="text-sm text-white/60">
          Parent → L1 → L2 hierarchy from Notion.
        </p>
      </div>

      <div className="space-y-4">
        {tree.parents.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{p.name}</div>
                <div className="text-xs text-white/60">{p.pillar ?? ""}</div>
              </div>
              <div className="text-xs text-white/60">{p.children.length} children</div>
            </div>

            {p.children.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {p.children.map((c) => (
                  <div key={c.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-white/60">
                      {c.pillar ?? ""} {c.level ? `· ${c.level}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
