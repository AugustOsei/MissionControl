import { getOpenClawOpsSnapshot } from "@/lib/openclaw/ops";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const ops = await getOpenClawOpsSnapshot();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Ops</h1>
        <p className="text-sm text-white/60">
          OpenClaw operational snapshot. This will become live once we wire the
          gateway subdomain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{ops.gatewayStatus}</div>
          <div className="cardSub">{ops.gatewayUrl ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Cron jobs</div>
          <div className="cardValue">{ops.cronJobs}</div>
          <div className="cardSub">tracked</div>
        </div>
        <div className="card">
          <div className="cardTitle">Cost (week)</div>
          <div className="cardValue">{ops.costWeek}</div>
          <div className="cardSub">placeholder</div>
        </div>
      </div>

      <pre className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/70 overflow-auto">
{JSON.stringify(ops, null, 2)}
      </pre>
    </div>
  );
}
