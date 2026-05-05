import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "./_lib/http";
import { dbQuery, dbQueryOne } from "./_lib/db";

const DEFAULT_SCHOOL = {
  name: "SMP Negeri 1 Jakarta",
  logoUrl: "",
  faviconUrl: "",
  tagline: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  defaultTheme: "light" as const,
  history: "Didirikan pada tahun 1950...",
  vision: "Menjadi sekolah unggulan dalam IPTEK dan IMTAK.",
  mission: "1. Meningkatkan kualitas pembelajaran...",
  facilities: "Lab Komputer, Perpustakaan Digital, GOR.",
};

const DEFAULT_SETTINGS = {
  primaryColor: "#2563eb",
  isAlumniVisible: true,
  yearbookSettings: {
    sortBy: "year-desc" as const,
    gridColumns: 4,
    showStudentCount: true,
  },
};

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const school = await dbQueryOne<{
    name: string;
    logo_url: string | null;
    favicon_url: string | null;
    tagline: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    default_theme: "light" | "dark";
    history: string | null;
    vision: string | null;
    mission: string | null;
    facilities: string | null;
  }>(
    "SELECT name, logo_url, favicon_url, tagline, contact_email, contact_phone, contact_address, default_theme, history, vision, mission, facilities FROM schools ORDER BY created_at ASC LIMIT 1",
    []
  );

  const settingsRow = await dbQueryOne<{ value_json: any }>(
    "SELECT value_json FROM app_settings WHERE key = $1 LIMIT 1",
    ["app"]
  );

  const teachers = await dbQuery(
    "SELECT id, name, position, message, photo_url, category FROM teachers ORDER BY name ASC",
    []
  );

  const alumni = await dbQuery(
    "SELECT id, name, ttl, message, photo_url, graduation_year, class_name, instagram, twitter, linkedin FROM alumni ORDER BY graduation_year DESC, class_name ASC, name ASC",
    []
  );

  const yearbooks = await dbQuery(
    "SELECT id, year, title, pdf_url, cover_image_url, background_music_url, total_students, total_classes, page_count FROM yearbooks ORDER BY year DESC",
    []
  );

  json(res, 200, {
    school: school
      ? {
          name: school.name,
          logo: school.logo_url ?? "",
          favicon: school.favicon_url ?? "",
          tagline: school.tagline ?? "",
          contactEmail: school.contact_email ?? "",
          contactPhone: school.contact_phone ?? "",
          contactAddress: school.contact_address ?? "",
          defaultTheme: school.default_theme,
          history: school.history ?? "",
          vision: school.vision ?? "",
          mission: school.mission ?? "",
          facilities: school.facilities ?? "",
        }
      : DEFAULT_SCHOOL,
    settings: settingsRow?.value_json ?? DEFAULT_SETTINGS,
    teachers: teachers.map((t: any) => ({
      id: t.id,
      name: t.name,
      position: t.position,
      message: t.message,
      photo: t.photo_url ?? "",
      category: t.category,
    })),
    alumni: alumni.map((a: any) => ({
      id: a.id,
      name: a.name,
      ttl: a.ttl,
      message: a.message,
      photo: a.photo_url ?? "",
      graduationYear: a.graduation_year,
      class: a.class_name,
      socialMedia: {
        instagram: a.instagram ?? "",
        twitter: a.twitter ?? "",
        linkedin: a.linkedin ?? "",
      },
    })),
    yearbooks: yearbooks.map((y: any) => ({
      id: y.id,
      year: y.year,
      title: y.title,
      pdfUrl: y.pdf_url,
      coverImage: y.cover_image_url ?? "",
      backgroundMusic: y.background_music_url ?? "",
      totalStudents: y.total_students,
      totalClasses: y.total_classes,
      pageCount: y.page_count ?? null,
    })),
  });
});
