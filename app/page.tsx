import { redirect } from "next/navigation";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { getAuthorizedDashboardSession } from "@/lib/dashboard-access";

export default async function Home() {
  const adminSession = await getAuthorizedAdminSession();

  if (adminSession) {
    redirect("/admin");
  }

  const access = await getAuthorizedDashboardSession();
  redirect(access ? "/dashboard" : "/login");
}
