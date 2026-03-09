import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSsbProfile, updateSsbProfile } from "@/lib/data";
import { profileSchema } from "@/lib/validation";

async function requireSsbSession() {
  const session = await getSession();
  if (!session?.ssbId) {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireSsbSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getSsbProfile(session.ssbId!);

  return NextResponse.json({ data: profile });
}

export async function PATCH(request: Request) {
  const session = await requireSsbSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data profil tidak valid." },
      { status: 400 },
    );
  }

  const profile = await updateSsbProfile(session.ssbId!, parsed.data);
  return NextResponse.json({ data: profile });
}
