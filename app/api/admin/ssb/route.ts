import { NextResponse } from "next/server";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { hashPassword } from "@/lib/auth";
import { createSsbAdminAccount } from "@/lib/data";
import { saveSsbLogo } from "@/lib/uploads";
import { createSsbAdminSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getAuthorizedAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const logoFile = formData.get("logo");
    const body = {
      ssbName: String(formData.get("ssbName") ?? ""),
      logo: null as string | null,
      address: String(formData.get("address") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      partnershipNotes: String(formData.get("partnershipNotes") ?? ""),
      adminName: String(formData.get("adminName") ?? ""),
      adminEmail: String(formData.get("adminEmail") ?? ""),
      adminPassword: String(formData.get("adminPassword") ?? ""),
      coachName: String(formData.get("coachName") ?? ""),
      coachEmail: String(formData.get("coachEmail") ?? ""),
      coachPassword: String(formData.get("coachPassword") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      status: String(formData.get("status") ?? ""),
    };

    if (logoFile instanceof File && logoFile.size > 0) {
      body.logo = await saveSsbLogo(logoFile);
    }

    const parsed = createSsbAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data SSB tidak valid." },
        { status: 400 },
      );
    }

    await createSsbAdminAccount({
      ssbName: parsed.data.ssbName,
      logo: parsed.data.logo,
      address: parsed.data.address,
      phone: parsed.data.phone,
      partnershipNotes: parsed.data.partnershipNotes,
      adminName: parsed.data.adminName,
      adminEmail: parsed.data.adminEmail,
      adminPasswordHash: hashPassword(parsed.data.adminPassword),
      coachName: parsed.data.coachName,
      coachEmail: parsed.data.coachEmail,
      coachPasswordHash: parsed.data.coachPassword ? hashPassword(parsed.data.coachPassword) : null,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      status: parsed.data.status,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "Email admin SSB sudah terdaftar." },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "INVALID_FILE_TYPE") {
      return NextResponse.json(
        { error: "Logo harus berupa JPG, PNG, atau WEBP." },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return NextResponse.json(
        { error: "Ukuran logo maksimal 2 MB." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
