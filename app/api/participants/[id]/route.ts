import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteParticipant, updateParticipant } from "@/lib/data";
import { participantSchema } from "@/lib/validation";
import { saveParticipantPhoto } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getRouteData(context: RouteContext) {
  const session = await getSession();
  const params = await context.params;
  const participantId = Number(params.id);

  if (!session?.ssbId || Number.isNaN(participantId)) {
    return null;
  }

  return {
    ssbId: session.ssbId,
    participantId,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const routeData = await getRouteData(context);

  if (!routeData) {
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

  const participant = await updateParticipant(
    routeData.participantId,
    routeData.ssbId,
    { ...parsed.data, photo: photoUrl },
  );

  if (!participant) {
    return NextResponse.json({ error: "Peserta tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ data: participant });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const routeData = await getRouteData(context);

  if (!routeData) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const deleted = await deleteParticipant(routeData.participantId, routeData.ssbId);

  if (!deleted) {
    return NextResponse.json({ error: "Peserta tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
