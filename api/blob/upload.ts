import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { withErrorHandling, json, methodNotAllowed, getOrigin } from "../_lib/http";
import { requireAdmin } from "../_lib/auth";
import { getEnv } from "../_lib/env";
import { getYearbookLimits } from "../_lib/validation";
import { z } from "zod";

const ClientPayloadSchema = z
  .object({
    kind: z.enum(["yearbook-pdf", "yearbook-page-image"]),
  })
  .nullable()
  .optional();

function safeBasename(name: string) {
  const cleaned = name.replace(/[/\\]/g, "_").replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.slice(0, 120) || "file";
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  await requireAdmin(req, res);

  const env = getEnv();
  if (!env.BLOB_READ_WRITE_TOKEN) return json(res, 500, { error: "Missing BLOB_READ_WRITE_TOKEN" });

  const body = req.body as HandleUploadBody;
  if (!body || typeof body !== "object") return json(res, 400, { error: "Invalid body" });

  const origin = getOrigin(req);
  const requestUrl = `${origin}${req.url ?? "/api/blob/upload"}`;
  const request = new Request(requestUrl, { method: "POST", headers: req.headers as any });

  const { maxPdfBytes, maxPageImageBytes } = getYearbookLimits();

  const result = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
      const payload = ClientPayloadSchema.safeParse(clientPayload ? JSON.parse(clientPayload) : null);
      const kind = payload.success && payload.data ? payload.data.kind : "yearbook-pdf";

      const now = Date.now();
      const base = safeBasename(pathname);
      const folder = kind === "yearbook-pdf" ? "yearbooks/pdfs" : "yearbooks/pages";
      const finalPathname = `${folder}/${now}-${base}`;

      return {
        pathname: finalPathname,
        multipart,
        addRandomSuffix: true,
        allowedContentTypes:
          kind === "yearbook-pdf"
            ? ["application/pdf"]
            : ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: kind === "yearbook-pdf" ? maxPdfBytes : maxPageImageBytes,
        tokenPayload: JSON.stringify({ kind }),
      };
    },
    onUploadCompleted: async () => {},
  });

  json(res, 200, result);
});

