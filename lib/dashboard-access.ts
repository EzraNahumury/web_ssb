import { getPartnershipBySsbId, getSsbProfile } from "@/lib/data";
import { getSession } from "@/lib/auth";

export async function getAuthorizedDashboardSession() {
  const session = await getSession();

  if (!session || session.role !== "SSB_ADMIN" || !session.ssbId) {
    return null;
  }

  const [profile, partnership] = await Promise.all([
    getSsbProfile(session.ssbId),
    getPartnershipBySsbId(session.ssbId),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const hasActivePartnership =
    !!partnership &&
    partnership.status === "ACTIVE" &&
    partnership.start_date <= today &&
    partnership.end_date >= today;

  if (!profile || !hasActivePartnership) {
    return null;
  }

  return { session, profile, partnership };
}
