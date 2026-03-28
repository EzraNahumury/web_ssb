import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBillingConfig, upsertBillingConfig } from "@/lib/data";
import { billingConfigSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET() {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const data = await getBillingConfig(ssbId);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = billingConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data billing tidak valid." },
      { status: 400 },
    );
  }

  const data = await upsertBillingConfig(ssbId, parsed.data);
  return NextResponse.json({ data });
}
