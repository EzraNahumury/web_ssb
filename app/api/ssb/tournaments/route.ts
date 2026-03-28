import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTournamentsBySsbId, createTournament } from "@/lib/data";
import { tournamentSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET() {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const data = await getTournamentsBySsbId(ssbId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json();
  const parsed = tournamentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const tournament = await createTournament(ssbId, parsed.data);
  return NextResponse.json({ data: tournament }, { status: 201 });
}
