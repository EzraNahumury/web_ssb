import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markPaymentPaid } from "@/lib/data";
import { markPaymentPaidSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getRouteData(context: RouteContext) {
  const session = await getSession();
  const params = await context.params;
  const paymentId = Number(params.id);

  if (!session?.ssbId || Number.isNaN(paymentId)) {
    return null;
  }

  return {
    ssbId: session.ssbId,
    paymentId,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const routeData = await getRouteData(context);

  if (!routeData) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = markPaymentPaidSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const payment = await markPaymentPaid(
    routeData.paymentId,
    routeData.ssbId,
    parsed.data.notes,
  );

  if (!payment) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ data: payment });
}
