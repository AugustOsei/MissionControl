"use client";

import { useMemo, useState } from "react";
import type { ProjectNode } from "@/lib/notion/projects";
import { ProjectModal } from "@/components/projects/ProjectModal";

export type FlatProject = {
  id: string;
  name: string;
  pillar?: string;
  level?: string;
  parentId?: string;
};

function flatten(nodes: ProjectNode[]): FlatProject[] {
  const out: FlatProject[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift()!;
    out.push({
      id: n.id,
      name: n.name,
      pillar: n.pillar,
      level: n.level,
      parentId: n.parentId,
    });
    for (const c of n.children) stack.push(c);
  }
  return out;
}

export function ProjectExplorer({
  parents,
  dbLabel,
}: {
  parents: ProjectNode[];
  dbLabel: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const allProjects = useMemo(() => flatten(parents), [parents]);
  const selected = useMemo(
    () => allProjects.find((p) => p.id === openId) ?? null,
    [allProjects, openId],
  );

  const pillarOptions = useMemo(() => {
    const s = new Set<string>();
    for (const p of allProjects) if (p.pillar) s.add(p.pillar);
    return Array.from(s).sort();
  }, [allProjects]);

  const levelOptions = useMemo(() => {
    const s = new Set<string>();
    for (const p of allProjects) if (p.level) s.add(p.level);
    return Array.from(s).sort();
  }, [allProjects]);

  if (parents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/30 font-mono">
        No projects found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parents.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setOpenId(p.id)}
              className="text-left"
              title="Open project"
            >
              <div className="text-base font-semibold text-white/90 hover:text-white transition-colors">
                {p.name}
              </div>
              {p.pillar && (
                <div className="text-xs text-white/45 font-mono mt-0.5">
                  {p.pillar}
                </div>
              )}
            </button>
            <div className="text-xs text-white/35 font-mono">
              {p.children.length} sub
            </div>
          </div>

          {p.children.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {p.children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setOpenId(c.id)}
                  className="rounded-lg border border-white/8 bg-black/30 p-3 hover:border-white/20 transition-colors text-left"
                >
                  <div className="font-medium text-sm text-white/85">
                    {c.name}
                  </div>
                  <div className="text-xs text-white/40 font-mono mt-0.5">
                    {[c.pillar, c.level].filter(Boolean).join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {selected && (
        <ProjectModal
          project={selected}
          dbLabel={dbLabel}
          projects={allProjects}
          pillarOptions={pillarOptions}
          levelOptions={levelOptions}
          onClose={() => setOpenId(null)}
          onProjectPatched={(next) => {
            // Optimistic update in-memory: we can just close for now.
            // Future: mutate local list / refresh router.
            setOpenId(next.id);
          }}
        />
      )}
    </div>
  );
}
