import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function vercelApiDev(): Plugin {
  const resolveHandler = (pathname: string): { moduleId: string; query: Record<string, string> } | null => {
    const clean = pathname.replace(/\/+$/, "");
    if (!clean.startsWith("/api")) return null;
    
    // In dev mode, route everything under /api to our single index.ts router
    return { moduleId: "/api/index.ts", query: {} };
  };

  const readBody = async (req: any) => {
    const method = String(req.method || "GET").toUpperCase();
    if (method === "GET" || method === "HEAD") return undefined;
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const raw = Buffer.concat(chunks);
    if (!raw.length) return undefined;
    const ct = String(req.headers?.["content-type"] || "");
    if (ct.includes("application/json")) {
      try {
        return JSON.parse(raw.toString("utf-8"));
      } catch {
        return undefined;
      }
    }
    return raw.toString("utf-8");
  };

  const wrapRes = (res: any) => {
    const apiRes: any = res;
    apiRes.status = (code: number) => {
      res.statusCode = code;
      return apiRes;
    };
    apiRes.send = (payload: any) => {
      if (payload === undefined) {
        res.end();
        return;
      }
      if (typeof payload === "string" || Buffer.isBuffer(payload)) {
        res.end(payload);
        return;
      }
      res.end(String(payload));
    };
    return apiRes;
  };

  return {
    name: "vercel-api-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const url = new URL(req.url, "http://localhost");
        const resolved = resolveHandler(url.pathname);
        if (!resolved) return next();

        try {
          const mod = await server.ssrLoadModule(resolved.moduleId);
          const handler = mod?.default;
          if (typeof handler !== "function") {
            res.statusCode = 500;
            res.end("Invalid API handler");
            return;
          }

          (req as any).query = resolved.query;
          (req as any).body = await readBody(req);

          await handler(req as any, wrapRes(res));
          if (!res.writableEnded) res.end();
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: e?.message ? String(e.message) : "Internal error" }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vercelApiDev(), react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
