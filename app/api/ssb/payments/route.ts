import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  generateMonthlyInvoices,
  generateDepositInvoices,
  getPaymentsByMonth,
  getFinanceSummary,
  createSessionPayment,
} from "@/lib/data";
import { createSessionPaymentSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

export async function GET(request: NextRequest) {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Parameter month harus format YYYY-MM." },
      { status: 400 },
    );
  }

  await Promise.all([
    generateMonthlyInvoices(ssbId, month),
    generateDepositInvoices(ssbId),
  ]);

  const [payments, summary] = await Promise.all([
    getPaymentsByMonth(ssbId, month),
    getFinanceSummary(ssbId, month),
  ]);

  return NextResponse.json({ data: payments, summary });
}

export async function POST(request: Request) {
  const ssbId = await requireSsbId();

  if (!ssbId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSessionPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data pembayaran tidak valid." },
      { status: 400 },
    );
  }

  const payment = await createSessionPayment(
    ssbId,
    parsed.data.participant_id,
    parsed.data.amount,
    parsed.data.notes,
  );

  return NextResponse.json({ data: payment }, { status: 201 });
}
