import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTransactionsByRange, getReportSummaryByRange, getOpeningBalance, createTransaction } from "@/lib/data";
import { transactionSchema } from "@/lib/validation";

async function requireSsbId() {
  const session = await getSession();
  return session?.ssbId ?? null;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeDateRange(period: string, date: string): { start: string; end: string } | null {
  if (period === "daily") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return { start: date, end: date };
  }
  if (period === "weekly") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const d = new Date(date + "T00:00:00");
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: fmtDate(monday), end: fmtDate(sunday) };
  }
  if (period === "monthly") {
    if (!/^\d{4}-\d{2}$/.test(date)) return null;
    const [year, month] = date.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: `${year}-${String(month).padStart(2, "0")}-01`,
      end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
    };
  }
  if (period === "yearly") {
    if (!/^\d{4}$/.test(date)) return null;
    return { start: `${date}-01-01`, end: `${date}-12-31` };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const ssbId = await requireSsbId();
  if (!ssbId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const period = params.get("period") ?? "monthly";

  let range: { start: string; end: string } | null = null;

  if (period === "range") {
    const start = params.get("start");
    const end = params.get("end");
    if (!start || !end || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return NextResponse.json({ error: "Parameter start dan end diperlukan untuk period=range." }, { status: 400 });
    }
    range = { start, end };
  } else {
    const date = params.get("date") ?? params.get("month");
    if (!date) {
      return NextResponse.json({ error: "Parameter date diperlukan." }, { status: 400 });
    }
    range = computeDateRange(period, date);
    if (!range) {
      return NextResponse.json({ error: "Parameter date tidak valid untuk periode yang dipilih." }, { status: 400 });
    }
  }

  const [transactions, summary, openingBalance] = await Promise.all([
    getTransactionsByRange(ssbId, range.start, range.end),
    getReportSummaryByRange(ssbId, range.start, range.end),
    getOpeningBalance(ssbId, range.start),
  ]);

  return NextResponse.json({ data: transactions, summary, openingBalance });
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
