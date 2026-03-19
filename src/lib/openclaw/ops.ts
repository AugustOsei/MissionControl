export type OpsSnapshot = {
  gatewayStatus: "Unknown" | "Online" | "Offline";
  gatewayUrl?: string;
  cronJobs: number;
  costWeek: string;
  raw?: unknown;
};

export async function getOpenClawOpsSnapshot(): Promise<OpsSnapshot> {
  // MVP: placeholder until we wire gateway.taskcocoon.com
  const url = process.env.OPENCLAW_GATEWAY_URL;

  if (!url) {
    return {
      gatewayStatus: "Unknown",
      gatewayUrl: undefined,
      cronJobs: 0,
      costWeek: "$0.00",
      raw: { note: "Set OPENCLAW_GATEWAY_URL in Vercel env vars" },
    };
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/status`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));

    return {
      gatewayStatus: res.ok ? "Online" : "Offline",
      gatewayUrl: url,
      cronJobs: 0,
      costWeek: "$0.00",
      raw: json,
    };
  } catch (e: any) {
    return {
      gatewayStatus: "Offline",
      gatewayUrl: url,
      cronJobs: 0,
      costWeek: "$0.00",
      raw: { error: String(e) },
    };
  }
}
