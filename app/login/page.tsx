import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { getAuthorizedDashboardSession } from "@/lib/dashboard-access";

export default async function LoginPage() {
  const adminSession = await getAuthorizedAdminSession();

  if (adminSession) {
    redirect("/admin");
  }

  const access = await getAuthorizedDashboardSession();

  if (access) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,_#082f49_0%,_#0f172a_38%,_#4c1d95_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[36px] border border-white/10 bg-white/8 p-8 text-white backdrop-blur md:p-10">
          <span className="badge badge-dark">Ayres Apparel x SSB Partner</span>
          <h1 className="mt-6 max-w-xl font-heading text-5xl font-semibold leading-tight">
            Dashboard administrasi peserta yang rapi, cepat, dan siap dipakai harian.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200">
            Sistem ini membantu SSB partner mengelola profil klub, peserta aktif,
            ukuran jersey, dan data wali dalam satu alur kerja yang sederhana.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-tile">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">MVP Fokus</p>
              <p className="mt-2 text-sm text-white">Login, profil SSB, dashboard, CRUD peserta.</p>
            </div>
            <div className="glass-tile">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Benefit</p>
              <p className="mt-2 text-sm text-white">Rekap ukuran jersey lebih cepat dan akurat.</p>
            </div>
            <div className="glass-tile">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Akses</p>
              <p className="mt-2 text-sm text-white">Data tiap SSB tetap terpisah di level database.</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="px-2 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
              Portal Login
            </p>
            <h2 className="mt-2 font-heading text-3xl">Masuk ke dashboard SSB</h2>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
