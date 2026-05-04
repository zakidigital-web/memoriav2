import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQueryOne, dbQuery } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const admin = await requireAdmin(req, res);

  await dbQueryOne(
    `INSERT INTO activity_logs (admin_id, action, target, details) VALUES ($1, $2, $3, $4)`,
    [admin.id, "GENERATE_DUMMY", "multiple_tables", JSON.stringify({ action: "auto-fill" })]
  );

  // Generate teachers
  await dbQuery(`
    INSERT INTO teachers (name, position, message, category) VALUES
    ('Budi Santoso', 'Kepala Sekolah', 'Teruslah berprestasi', 'Pimpinan'),
    ('Siti Aminah', 'Guru Matematika', 'Matematika itu mudah', 'Guru Kelas'),
    ('Agus Setiawan', 'Staf Administrasi', 'Kami melayani dengan sepenuh hati', 'Staf TU')
  `);

  // Generate alumni
  await dbQuery(`
    INSERT INTO alumni (name, ttl, message, graduation_year, class_name) VALUES
    ('Andi Kurniawan', 'Jakarta, 1 Januari 2005', 'Kenangan indah di SMP', 2020, 'IX A'),
    ('Dewi Lestari', 'Bandung, 5 Mei 2005', 'Sukses untuk kita semua', 2020, 'IX B'),
    ('Reza Rahadian', 'Surabaya, 10 Agustus 2006', 'Jangan lupakan almamater', 2021, 'IX A')
  `);

  return json(res, 200, { ok: true, message: "Dummy data generated successfully" });
});