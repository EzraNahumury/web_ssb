import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { findUserByEmail, getPartnershipBySsbId } from "@/lib/data";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(parsed.data.email);

    if (!user || !verifyPassword(parsed.data.password, user.password)) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 },
      );
    }

    if (user.role === "SSB_ADMIN" || user.role === "PELATIH") {
      if (!user.ssb_id) {
        return NextResponse.json(
          { error: "Akun belum terhubung ke data klub." },
          { status: 403 },
        );
      }

      const partnership = await getPartnershipBySsbId(user.ssb_id);
      const today = new Date().toISOString().slice(0, 10);

      if (
        !partnership ||
        partnership.status !== "ACTIVE" ||
        partnership.start_date > today ||
        partnership.end_date < today
      ) {
        return NextResponse.json(
          { error: "Masa aktif kerja sama SSB sudah tidak berlaku." },
          { status: 403 },
        );
      }
    }

    await setSessionCookie({
      userId: user.id,
      role: user.role,
      ssbId: user.ssb_id,
      name: user.name,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: user.role === "AYRES_ADMIN" ? "/admin" : "/dashboard",
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
