import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDashboardSummary, getPartnershipBySsbId } from "@/lib/data";

export async function GET() {
  const session = await getSession();

  if (!session?.ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [summary, partnership] = await Promise.all([
    getDashboardSummary(session.ssbId),
    getPartnershipBySsbId(session.ssbId),
  ]);

  return NextResponse.json({ data: { summary, partnership } });
}
