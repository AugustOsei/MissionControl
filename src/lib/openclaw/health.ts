export type GatewayHealth = {
  ok: boolean;
  status?: string;
  url?: string;
  raw?: unknown;
};

export async function getGatewayHealth(): Promise<GatewayHealth> {
  const url = process.env.OPENCLAW_GATEWAY_URL;
  if (!url) return { ok: false, status: "not_configured", url: undefined };

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/health`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    return { ok: Boolean(json.ok), status: json.status ?? (res.ok ? "live" : "down"), url, raw: json };
  } catch (e) {
    return { ok: false, status: "offline", url, raw: { error: String(e) } };
  }
}
