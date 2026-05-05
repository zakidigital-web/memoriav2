import { z } from "zod";
import { getEnv } from "./env";

export const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

export const SetupAdminSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(256),
});

export const TeacherSchema = z.object({
  name: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  message: z.string().max(2000).optional().default(""),
  photoUrl: z.string().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  category: z.enum(["Pimpinan", "Guru Kelas", "Staf TU"]),
});

export const AlumniSchema = z.object({
  name: z.string().min(1).max(200),
  ttl: z.string().max(200).optional().default(""),
  message: z.string().max(2000).optional().default(""),
  photoUrl: z.string().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  graduationYear: z.number().int().min(1900).max(2100),
  className: z.string().min(1).max(100),
  instagram: z.string().max(200).optional().default(""),
  twitter: z.string().max(200).optional().default(""),
  linkedin: z.string().max(200).optional().default(""),
});

export const SchoolSchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  faviconUrl: z.string().optional(),
  tagline: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  history: z.string().max(20000).optional().default(""),
  vision: z.string().max(2000).optional().default(""),
  mission: z.string().max(20000).optional().default(""),
  facilities: z.string().max(2000).optional().default(""),
  defaultTheme: z.enum(["light", "dark"]).optional().default("light"),
});

export const YearbookCreateSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.number().int().min(1900).max(2100),
  totalStudents: z.number().int().min(0).max(100000).optional().default(0),
  totalClasses: z.number().int().min(0).max(10000).optional().default(0),
  backgroundMusicUrl: z.string().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  pdfUrl: z.string().url(),
  coverImageUrl: z.string().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  pageImageUrls: z.array(z.string().url()).max(500).optional().default([]),
});

export const SettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isAlumniVisible: z.boolean(),
  yearbookSettings: z.object({
    sortBy: z.enum(["year-desc", "year-asc", "title-asc"]),
    gridColumns: z.number().int().min(2).max(8),
    showStudentCount: z.boolean(),
  }),
});

export function getYearbookLimits() {
  const env = getEnv();
  return {
    maxPdfBytes: env.YEARBOOK_MAX_PDF_BYTES ?? 30 * 1024 * 1024,
    maxPageImageBytes: env.YEARBOOK_MAX_PAGE_IMAGE_BYTES ?? 2 * 1024 * 1024,
    maxPages: env.YEARBOOK_MAX_PAGES ?? 50,
  };
}

