import type { VercelRequest, VercelResponse } from "@vercel/node";

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;

export function json(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.send(JSON.stringify(data));
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader("allow", allowed.join(", "));
  json(res, 405, { error: "Method not allowed", allowed });
}

export function getOrigin(req: VercelRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "http";
  const host = req.headers.host ?? "localhost";
  return `${proto}://${host}`;
}

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err: any) {
      const message = err?.message ? String(err.message) : String(err);
      const status = typeof err?.status === "number" ? err.status : 500;
      const isProd = process.env.NODE_ENV === "production";
      const payload: any = { error: message };
      if (!isProd) {
        payload.details = {
          name: err?.name ? String(err.name) : undefined,
          code: err?.code ? String(err.code) : undefined,
          stack: err?.stack ? String(err.stack) : undefined,
        };
      }
      json(res, status, payload);
    }
  };
}
