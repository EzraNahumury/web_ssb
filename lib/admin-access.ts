import { getSession } from "@/lib/auth";

export async function getAuthorizedAdminSession() {
  const session = await getSession();

  if (!session || session.role !== "AYRES_ADMIN") {
    return null;
  }

  return session;
}
