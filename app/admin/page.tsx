import { redirect } from "next/navigation";
import { AdminActions } from "@/components/admin-actions";
import { AdminSsbManager } from "@/components/admin-ssb-manager";
import { AdminStats } from "@/components/admin-stats";
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
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[260px] flex-1">
            <span
              className="mb-2 inline-block rounded-full px-3.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-white"
              style={{ background: "linear-gradient(135deg, #0062ff, #00b4ff)" }}
            >
              Ayres Admin
            </span>
            <h1 className="text-[1.8rem] font-extrabold leading-tight tracking-tight text-blue-950" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
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
              <p className="text-[0.82rem] font-bold leading-tight text-blue-950" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{session.name}</p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-500" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {session.role.replace("_", " ")}
              </p>
            </div>
            <AdminActions />
          </div>
        </header>

        {/* ── Stats ─────────────────────────── */}
        <AdminStats totalCount={accounts.length} activeCount={activeCount} needActionCount={needActionCount} />

        {/* ── Manager ───────────────────────── */}
        <AdminSsbManager accounts={accounts} />
      </div>
    </main>
  );
}
