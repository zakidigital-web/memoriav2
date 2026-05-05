import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  YEARBOOK_MAX_PDF_BYTES: z.coerce.number().int().positive().optional(),
  YEARBOOK_MAX_PAGE_IMAGE_BYTES: z.coerce.number().int().positive().optional(),
  YEARBOOK_MAX_PAGES: z.coerce.number().int().positive().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    const err = new Error(`Invalid environment: ${message}`);
    (err as any).status = 500;
    throw err;
  }
  return parsed.data;
}
