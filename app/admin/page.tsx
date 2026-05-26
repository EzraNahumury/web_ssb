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
    <main className="relative min-h-screen overflow-x-hidden bg-stadium bg-noise">
      <ParticleBackground />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6">
        {/* ── Header ────────────────────────── */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[260px] flex-1">
            <span className="badge mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
              </svg>
              Ayres Command
            </span>
            <h1 className="font-display text-[2.6rem] text-white leading-none">
              Academy <span className="text-[#FF3B30]">Control</span> Center
            </h1>
            <p className="mt-2 max-w-xl text-[0.84rem] leading-relaxed text-white/50">
              Kelola pendaftaran dan akses admin Academy partner. Data peserta dikelola dari akun admin masing-masing.
            </p>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#1E1E1E] px-3.5 py-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#FF3B30] to-[#B22A22] text-sm font-black text-white shadow-[0_4px_14px_rgba(255,59,48,0.4)]">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-heading text-[0.95rem] font-bold leading-tight text-white tracking-wide uppercase">{session.name}</p>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#FF3B30]">
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
