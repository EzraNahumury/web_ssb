import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteTransaction } from "@/lib/data";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  const params = await context.params;
  const id = Number(params.id);

  if (!session?.ssbId || Number.isNaN(id)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const deleted = await deleteTransaction(id, session.ssbId);
  if (!deleted) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
