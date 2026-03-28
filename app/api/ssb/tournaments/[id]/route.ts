import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateTournament, deleteTournament } from "@/lib/data";
import { tournamentSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function getRouteData(context: RouteContext) {
  const session = await getSession();
  const params = await context.params;
  const id = Number(params.id);
  if (!session?.ssbId || Number.isNaN(id)) return null;
  return { ssbId: session.ssbId, id };
}

export async function PATCH(request: Request, context: RouteContext) {
  const routeData = await getRouteData(context);
  if (!routeData) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json();
  const parsed = tournamentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const updated = await updateTournament(routeData.id, routeData.ssbId, parsed.data);
  if (!updated) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const routeData = await getRouteData(context);
  if (!routeData) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const deleted = await deleteTournament(routeData.id, routeData.ssbId);
  if (!deleted) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
