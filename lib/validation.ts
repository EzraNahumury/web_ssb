import { z } from "zod";

const nullableText = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .transform((value) => value || null),
);

const nullableDate = z
  .string()
  .trim()
  .transform((value) => value || null)
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Format tanggal harus YYYY-MM-DD.",
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nama SSB minimal 3 karakter."),
  logo: nullableText,
  address: nullableText,
  phone: nullableText,
  partnership_notes: nullableText,
});

export const participantSchema = z.object({
  name: z.string().trim().min(3, "Nama peserta minimal 3 karakter."),
  nickname: nullableText,
  birth_date: nullableDate,
  position: nullableText,
  jersey_size: nullableText,
  parent_name: nullableText,
  parent_phone: nullableText,
  address: nullableText,
  join_date: nullableDate,
  status: z.enum(["ACTIVE", "INACTIVE"]),
  notes: nullableText,
});

export const createSsbAdminSchema = z
  .object({
    ssbName: z.string().trim().min(3, "Nama SSB minimal 3 karakter."),
    logo: nullableText,
    address: nullableText,
    phone: nullableText,
    partnershipNotes: nullableText,
    adminName: z.string().trim().min(3, "Nama admin minimal 3 karakter."),
    adminEmail: z.string().trim().email("Email admin tidak valid."),
    adminPassword: z.string().min(6, "Password admin minimal 6 karakter."),
    startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
    endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
    path: ["endDate"],
  });

export const updateSsbAdminSchema = z
  .object({
    ssbName: z.string().trim().min(3, "Nama SSB minimal 3 karakter."),
    logo: nullableText,
    address: nullableText,
    phone: nullableText,
    partnershipNotes: nullableText,
    adminName: z.string().trim().min(3, "Nama admin minimal 3 karakter."),
    adminEmail: z.string().trim().email("Email admin tidak valid."),
    adminPassword: nullableText,
    startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
    endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]),
  })
  .refine((value) => value.adminPassword === null || value.adminPassword.length >= 6, {
    message: "Password admin minimal 6 karakter.",
    path: ["adminPassword"],
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
    path: ["endDate"],
  });
