import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createParticipant, getParticipantsBySsbId } from "@/lib/data";
import { participantSchema } from "@/lib/validation";
import { saveParticipantPhoto } from "@/lib/uploads";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET() {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const data = await getParticipantsBySsbId(ssbId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const photoFile = formData.get("photo") as File | null;
  const currentPhoto = formData.get("currentPhoto") as string | null;

  const body = Object.fromEntries(formData.entries());
  delete body.photo;
  delete body.currentPhoto;

  const parsed = participantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data peserta tidak valid." },
      { status: 400 },
    );
  }

  let photoUrl = currentPhoto || null;
  if (photoFile && photoFile.size > 0) {
    try {
      photoUrl = await saveParticipantPhoto(photoFile);
    } catch {
      return NextResponse.json({ error: "Gagal upload foto." }, { status: 400 });
    }
  }

  const participant = await createParticipant(ssbId, { ...parsed.data, photo: photoUrl });
  return NextResponse.json({ data: participant }, { status: 201 });
}
