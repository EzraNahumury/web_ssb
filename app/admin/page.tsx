import { redirect } from "next/navigation";
import { AdminActions } from "@/components/admin-actions";
import { AdminSsbManager } from "@/components/admin-ssb-manager";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { getSsbAdminAccounts } from "@/lib/data";

export default async function AdminPage() {
  const session = await getAuthorizedAdminSession();

  if (!session) {
    redirect("/login");
  }

  const accounts = await getSsbAdminAccounts();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="panel flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Ayres Admin</p>
            <h1 className="font-heading text-4xl text-slate-950">Manajemen akun admin SSB</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Akun ini dipakai untuk mendaftarkan dan memantau akses admin SSB. Data peserta
              tetap dikelola dari akun admin SSB masing-masing.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-slate-50">
            <p className="text-sm text-slate-300">Login sebagai</p>
            <p className="font-heading text-2xl">{session.name}</p>
            <p className="text-sm text-slate-400">{session.role}</p>
            <AdminActions />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="stat-card">
            <p className="stat-label">Total admin SSB</p>
            <p className="stat-value">{accounts.length}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">SSB aktif</p>
            <p className="stat-value">
              {accounts.filter((account) => account.partnershipStatus === "ACTIVE").length}
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Perlu tindak lanjut</p>
            <p className="stat-value">
              {accounts.filter((account) => account.partnershipStatus !== "ACTIVE").length}
            </p>
          </article>
        </section>

        <AdminSsbManager accounts={accounts} />
      </div>
    </main>
  );
}
