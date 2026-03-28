import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  getAgeGroupsBySsbId,
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

  const [summary, participants, billingConfig, ageGroups] = await Promise.all([
    getDashboardSummary(ssbId),
    getParticipantsBySsbId(ssbId),
    getBillingConfig(ssbId),
    getAgeGroupsBySsbId(ssbId),
  ]);

  return (
    <DashboardShell
      user={{ name: session.name, role: session.role }}
      profile={profile}
      partnership={partnership}
      summary={summary}
      participants={participants}
      billingConfig={billingConfig}
      ageGroups={ageGroups}
    />
  );
}
