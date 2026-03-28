import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  getBillingConfig,
  getDashboardSummary,
  getParticipantsBySsbId,
} from "@/lib/data";
import { getAuthorizedDashboardSession } from "@/lib/dashboard-access";

export default async function DashboardPage() {
  const access = await getAuthorizedDashboardSession();

  if (!access) {
    redirect("/login");
  }

  const { session, profile, partnership } = access;
  const ssbId = session.ssbId!;

  const [summary, participants, billingConfig] = await Promise.all([
    getDashboardSummary(ssbId),
    getParticipantsBySsbId(ssbId),
    getBillingConfig(ssbId),
  ]);

  return (
    <DashboardShell
      user={{ name: session.name, role: session.role }}
      profile={profile}
      partnership={partnership}
      summary={summary}
      participants={participants}
      billingConfig={billingConfig}
    />
  );
}
