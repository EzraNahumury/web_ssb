import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTransactionsByMonth, getReportSummary, createTransaction } from "@/lib/data";
import { transactionSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET(request: NextRequest) {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const month = request.nextUrl.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Parameter month harus format YYYY-MM." }, { status: 400 });
  }

  const [transactions, summary] = await Promise.all([
    getTransactionsByMonth(ssbId, month),
    getReportSummary(ssbId, month),
  ]);

  return NextResponse.json({ data: transactions, summary });
}

export async function POST(request: Request) {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const transaction = await createTransaction(ssbId, parsed.data);
  return NextResponse.json({ data: transaction }, { status: 201 });
}
