import { redirect } from "next/navigation";
import { AdminActions } from "@/components/admin-actions";
import { AdminSsbManager } from "@/components/admin-ssb-manager";
import { ParticleBackground } from "@/components/particle-background";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { getSsbAdminAccounts } from "@/lib/data";

export default async function AdminPage() {
  const session = await getAuthorizedAdminSession();
  if (!session) redirect("/login");

  const accounts = await getSsbAdminAccounts();
  const activeCount = accounts.filter((a) => a.partnershipStatus === "ACTIVE").length;
  const needActionCount = accounts.filter((a) => a.partnershipStatus !== "ACTIVE").length;

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(145deg, #dff3fc 0%, #c6e3f6 40%, #d0e6f9 80%, #e0f0fb 100%)" }}
    >
      <ParticleBackground />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5">
        {/* ── Header ────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[260px] flex-1">
            <span
              className="mb-2 inline-block rounded-full px-3.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-white"
              style={{ background: "linear-gradient(135deg, #0062ff, #00b4ff)" }}
            >
              Ayres Admin
            </span>
            <h1 className="text-[1.8rem] font-extrabold leading-tight tracking-tight text-blue-950">
              Manajemen Akun SSB
            </h1>
            <p className="mt-1 max-w-lg text-[0.82rem] leading-relaxed text-sky-800/60">
              Kelola pendaftaran dan akses admin SSB partner. Data peserta dikelola dari akun admin masing-masing.
            </p>
          </div>

          {/* User card */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/50 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur-2xl">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #0062ff, #00b4ff)" }}
            >
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[0.82rem] font-bold leading-tight text-blue-950">{session.name}</p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-500">
                {session.role.replace("_", " ")}
              </p>
            </div>
            <AdminActions />
          </div>
        </header>

        {/* ── Stats ─────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{accounts.length}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Admin SSB</p>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{activeCount}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">SSB Aktif</p>
            </div>
          </div>

          {/* Need action */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/10 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{needActionCount}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Perlu Tindak Lanjut</p>
            </div>
          </div>
        </section>

        {/* ── Manager ───────────────────────── */}
        <AdminSsbManager accounts={accounts} />
      </div>
    </main>
  );
}
