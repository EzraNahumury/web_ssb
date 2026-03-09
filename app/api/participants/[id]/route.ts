import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteParticipant, updateParticipant } from "@/lib/data";
import { participantSchema } from "@/lib/validation";

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

  const body = await request.json();
  const parsed = participantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data peserta tidak valid." },
      { status: 400 },
    );
  }

  const participant = await updateParticipant(
    routeData.participantId,
    routeData.ssbId,
    parsed.data,
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
