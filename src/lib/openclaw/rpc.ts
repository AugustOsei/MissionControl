import "server-only";

import WebSocket from "ws";

export type OpenClawRpcOptions = {
  wsUrl: string; // e.g. wss://gateway.example.com
  token?: string;
  origin?: string; // must be allowed by gateway.controlUi.allowedOrigins
  timeoutMs?: number;
};

type RpcReq = { type: "req"; id: string; method: string; params?: unknown };
type RpcRes = { type: "res"; id: string; ok: boolean; payload?: unknown; error?: unknown };

type Pending = {
  resolve: (x: unknown) => void;
  reject: (e: unknown) => void;
};

function uuid(): string {
  // Node 20+ has crypto.randomUUID
  return crypto.randomUUID();
}

export async function openclawRpc<T = unknown>(
  method: string,
  params: unknown,
  opts: OpenClawRpcOptions
): Promise<T> {
  const timeoutMs = Math.max(500, opts.timeoutMs ?? 6000);

  return await new Promise<T>((resolve, reject) => {
    const pending = new Map<string, Pending>();
    let done = false;

    const finish = (err?: unknown, value?: T) => {
      if (done) return;
      done = true;
      try {
        ws.close();
      } catch {
        // ignore
      }
      pending.clear();
      if (err) reject(err);
      else resolve(value as T);
    };

    const ws = new WebSocket(opts.wsUrl, {
      handshakeTimeout: timeoutMs,
      headers: {
        ...(opts.origin ? { Origin: opts.origin } : {}),
      },
    });

    const timer = setTimeout(() => finish(new Error(`openclaw rpc timeout (${method})`)), timeoutMs);

    ws.on("error", (e) => {
      clearTimeout(timer);
      finish(e);
    });

    ws.on("close", () => {
      clearTimeout(timer);
      if (!done) finish(new Error("gateway websocket closed"));
    });

    ws.on("message", (buf) => {
      let msg: any;
      try {
        msg = JSON.parse(String(buf ?? ""));
      } catch {
        return;
      }

      if (msg?.type === "res") {
        const res = msg as RpcRes;
        const p = pending.get(res.id);
        if (!p) return;
        pending.delete(res.id);
        if (res.ok) p.resolve(res.payload);
        else p.reject(res.error);
        return;
      }

      // Ignore events; we run request/response only.
    });

    ws.on("open", async () => {
      try {
        // 1) connect
        const connectId = uuid();
        const connectReq: RpcReq = {
          type: "req",
          id: connectId,
          method: "connect",
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: "openclaw-control-ui",
              version: "mission-control",
              platform: "mission-control",
              mode: "webchat",
              instanceId: uuid(),
            },
            role: "operator",
            scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
            caps: ["tool-events"],
            ...(opts.token ? { auth: { token: opts.token } } : {}),
          },
        };

        await new Promise<void>((r, j) => {
          pending.set(connectId, {
            resolve: () => r(),
            reject: (e) => j(e),
          });
          ws.send(JSON.stringify(connectReq));
        });

        // 2) request
        const id = uuid();
        const req: RpcReq = { type: "req", id, method, params };

        const out = await new Promise<unknown>((r, j) => {
          pending.set(id, { resolve: r, reject: j });
          ws.send(JSON.stringify(req));
        });

        clearTimeout(timer);
        finish(undefined, out as T);
      } catch (e) {
        clearTimeout(timer);
        finish(e);
      }
    });
  });
}
