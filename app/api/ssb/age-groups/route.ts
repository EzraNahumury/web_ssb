import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAgeGroupsBySsbId, createAgeGroup } from "@/lib/data";
import { ageGroupSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET() {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const data = await getAgeGroupsBySsbId(ssbId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json();
  const parsed = ageGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const ageGroup = await createAgeGroup(ssbId, parsed.data);
  return NextResponse.json({ data: ageGroup }, { status: 201 });
}
