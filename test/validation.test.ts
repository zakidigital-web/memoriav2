import { describe, expect, it } from "vitest";
import { getYearbookLimits, SettingsSchema, YearbookCreateSchema } from "../api/_lib/validation";

describe("validation", () => {
  it("provides default yearbook limits", () => {
    delete process.env.YEARBOOK_MAX_PDF_BYTES;
    delete process.env.YEARBOOK_MAX_PAGE_IMAGE_BYTES;
    delete process.env.YEARBOOK_MAX_PAGES;
    const limits = getYearbookLimits();
    expect(limits.maxPdfBytes).toBeGreaterThan(0);
    expect(limits.maxPageImageBytes).toBeGreaterThan(0);
    expect(limits.maxPages).toBeGreaterThan(0);
  });

  it("validates settings payload", () => {
    const parsed = SettingsSchema.safeParse({
      primaryColor: "#2563eb",
      isAlumniVisible: true,
      yearbookSettings: { sortBy: "year-desc", gridColumns: 4, showStudentCount: true },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid yearbook create payload", () => {
    const parsed = YearbookCreateSchema.safeParse({ title: "", year: 1800, pdfUrl: "x" });
    expect(parsed.success).toBe(false);
  });
});

