"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ParticleBackground } from "@/components/particle-background";
import { FinanceManager } from "@/components/finance-manager";
import type { BillingConfig, DashboardSummary, Participant, Partnership, SsbProfile } from "@/lib/data";

type DashboardShellProps = {
  user: { name: string; role: "AYRES_ADMIN" | "SSB_ADMIN" };
  profile: SsbProfile;
  partnership: Partnership | null;
  summary: DashboardSummary;
  participants: Participant[];
  billingConfig: BillingConfig | null;
};

type ParticipantFormState = {
  id: number | null;
  name: string;
  nickname: string;
  birth_date: string;
  position: string;
  jersey_size: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  join_date: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
};

const emptyParticipant: ParticipantFormState = {
  id: null, name: "", nickname: "", birth_date: "", position: "", jersey_size: "",
  parent_name: "", parent_phone: "", address: "", join_date: "", status: "ACTIVE", notes: "",
};

const inputCls =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-500/10";

const labelCls = "block text-[0.72rem] font-bold text-slate-600";

const glass = "rounded-[22px] border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-2xl";

export function DashboardShell({ user, profile, partnership, summary, participants, billingConfig }: DashboardShellProps) {
  const router = useRouter();
  const [profileState, setProfileState] = useState({
    name: profile.name,
    logo: profile.logo ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    partnership_notes: profile.partnership_notes ?? "",
  });
  const [participantState, setParticipantState] = useState<ParticipantFormState>(emptyParticipant);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);
  const [activeTab, setActiveTab] = useState<"peserta" | "keuangan">("peserta");

  const activeUntilLabel = useMemo(() => {
    if (!partnership) return "Belum ada data partnership";
    return `${partnership.start_date} — ${partnership.end_date}`;
  }, [partnership]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setFeedback(""); setIsSavingProfile(true);
    const response = await fetch("/api/ssb/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileState),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { setError(data.error ?? "Gagal menyimpan profil."); setIsSavingProfile(false); return; }
    setFeedback("Profil SSB berhasil diperbarui.");
    setIsSavingProfile(false);
    router.refresh();
  }

  function startEditParticipant(p: Participant) {
    setParticipantState({
      id: p.id, name: p.name, nickname: p.nickname ?? "", birth_date: p.birth_date ?? "",
      position: p.position ?? "", jersey_size: p.jersey_size ?? "", parent_name: p.parent_name ?? "",
      parent_phone: p.parent_phone ?? "", address: p.address ?? "", join_date: p.join_date ?? "",
      status: p.status, notes: p.notes ?? "",
    });
    setFeedback(""); setError("");
    window.scrollTo({ top: document.getElementById("participant-form")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function saveParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setFeedback(""); setIsSavingParticipant(true);
    const isEditing = Boolean(participantState.id);
    const response = await fetch(isEditing ? `/api/participants/${participantState.id}` : "/api/participants", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participantState),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { setError(data.error ?? "Gagal menyimpan peserta."); setIsSavingParticipant(false); return; }
    setFeedback(isEditing ? "Data peserta berhasil diperbarui." : "Peserta baru berhasil ditambahkan.");
    setParticipantState(emptyParticipant);
    setIsSavingParticipant(false);
    router.refresh();
  }

  async function removeParticipant(id: number) {
    if (!window.confirm("Hapus peserta ini?")) return;
    setError(""); setFeedback("");
    const response = await fetch(`/api/participants/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { setError(data.error ?? "Gagal menghapus peserta."); return; }
    if (participantState.id === id) setParticipantState(emptyParticipant);
    setFeedback("Peserta berhasil dihapus.");
    router.refresh();
  }

  function pf(key: keyof typeof emptyParticipant) {
    return {
      value: participantState[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setParticipantState((s) => ({ ...s, [key]: e.target.value })),
    };
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(145deg, #dff3fc 0%, #c6e3f6 40%, #d0e6f9 80%, #e0f0fb 100%)" }}
    >
      <ParticleBackground />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5">
        {/* ── Header ────────────────────────── */}
        <header className="flex items-center justify-between gap-4 rounded-[22px] border border-white/50 bg-white/70 px-5 py-3.5 shadow-[0_6px_16px_rgba(0,50,120,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl">
          <div className="flex items-center gap-4 min-w-0">
            {profile.logo ? (
              <div className="relative shrink-0">
                <img src={profile.logo} alt="Logo SSB" className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-md" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white ring-2 ring-white/80 shadow-md"
                  style={{ background: "linear-gradient(135deg, #0062ff, #00b4ff)" }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.1rem] font-extrabold tracking-tight text-blue-950 truncate" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{profile.name}</h1>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #0062ff, #00b4ff)" }}
                >
                  SSB Partner
                </span>
              </div>
              <p className="mt-0.5 text-[0.74rem] text-sky-800/50 truncate">
                <span className="font-semibold text-blue-950/70">{user.name}</span>
                <span className="mx-1.5 text-sky-300">/</span>
                <span className="text-sky-700/50">{user.role.replace("_", " ")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden items-center gap-2.5 rounded-xl border border-white/60 bg-white/50 px-3.5 py-2 shadow-sm sm:flex">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                partnership?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {partnership?.status ?? "N/A"}
              </span>
              <div className="h-4 w-px bg-slate-200" />
              <p className="text-[0.72rem] font-semibold text-blue-950/70">{activeUntilLabel}</p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-red-200/50 bg-red-50/50 px-3 py-2 text-[0.72rem] font-semibold text-red-500 transition hover:bg-red-50 hover:shadow-sm"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Keluar
            </button>
          </div>
        </header>

        {/* ── Stats ─────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12),0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{summary.totalParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Peserta</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12),0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{summary.activeParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Peserta Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12),0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/10 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{summary.inactiveParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Peserta Nonaktif</p>
            </div>
          </div>
        </section>

        {/* ── Tab Navigation ───────────────── */}
        <div className="flex gap-1 rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-sm backdrop-blur-2xl">
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "peserta"
                ? "text-white shadow-md"
                : "text-slate-600 hover:bg-white/50"
            }`}
            style={activeTab === "peserta" ? { background: "linear-gradient(90deg, #006aff, #00bbff)" } : undefined}
            onClick={() => setActiveTab("peserta")}
          >
            Peserta
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "keuangan"
                ? "text-white shadow-md"
                : "text-slate-600 hover:bg-white/50"
            }`}
            style={activeTab === "keuangan" ? { background: "linear-gradient(90deg, #006aff, #00bbff)" } : undefined}
            onClick={() => setActiveTab("keuangan")}
          >
            Keuangan
          </button>
        </div>

        {/* ── Feedback ──────────────────────── */}
        {feedback && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 text-[0.78rem] font-semibold text-emerald-700">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {feedback}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200/70 bg-red-50/80 px-3.5 py-2.5 text-[0.78rem] font-semibold text-red-600">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {activeTab === "peserta" && (<>
        {/* ── Profile + Activity ─────────────── */}
        <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
          {/* Profile form */}
          <div className={`${glass} flex flex-col gap-3.5`}>
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Profil SSB</p>
              <h2 className="text-lg font-extrabold text-blue-950">Data utama klub</h2>
            </div>

            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Informasi Klub</p>
            <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

            <div className="flex items-center gap-3">
              {profileState.logo ? (
                <img src={profileState.logo} alt="Logo SSB" className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-contain bg-white p-1" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-xs">Logo</div>
              )}
              <div>
                <label className={labelCls}>Nama SSB</label>
                <p className="text-base font-bold text-blue-950">{profileState.name || "-"}</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Nomor kontak</label>
              <p className="rounded-xl border-[1.5px] border-slate-100 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-700">{profileState.phone || "-"}</p>
            </div>
            <div>
              <label className={labelCls}>Alamat</label>
              <p className="rounded-xl border-[1.5px] border-slate-100 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-700 min-h-[68px]">{profileState.address || "-"}</p>
            </div>
            <div>
              <label className={labelCls}>Keterangan partnership</label>
              <p className="rounded-xl border-[1.5px] border-slate-100 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-700 min-h-[68px]">{profileState.partnership_notes || "-"}</p>
            </div>
          </div>

          {/* Activity */}
          <div className={`${glass} flex flex-col gap-3.5`}>
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Peserta Terbaru</p>
              <h2 className="text-lg font-extrabold text-blue-950">Ringkasan aktivitas</h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {summary.latestParticipants.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <p className="text-sm">Belum ada data peserta.</p>
                </div>
              ) : (
                summary.latestParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-blue-500/[0.06] bg-white/50 px-4 py-3 transition hover:bg-blue-500/[0.025]">
                    <div>
                      <p className="text-[0.85rem] font-semibold text-slate-800">{p.name}</p>
                      <p className="text-[0.72rem] text-slate-400">
                        {p.position ?? "Posisi belum diisi"} &middot; Jersey {p.jersey_size ?? "-"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                      p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Participant Form + Table ────────── */}
        <section id="participant-form" className="grid gap-5 xl:grid-cols-[420px_1fr]">
          {/* Form */}
          <form onSubmit={saveParticipant} className={`${glass} flex flex-col gap-3.5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Form Peserta</p>
                <h2 className="text-lg font-extrabold text-blue-950">
                  {participantState.id ? "Edit peserta" : "Tambah peserta baru"}
                </h2>
              </div>
              {participantState.id && (
                <button
                  type="button"
                  className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-3 py-1.5 text-[0.75rem] font-semibold text-blue-600 transition hover:bg-blue-500/10"
                  onClick={() => setParticipantState(emptyParticipant)}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Identitas */}
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Identitas Peserta</p>
            <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div>
                <label className={labelCls}>Nama lengkap</label>
                <input className={inputCls} {...pf("name")} required />
              </div>
              <div>
                <label className={labelCls}>Nama panggilan</label>
                <input className={inputCls} {...pf("nickname")} />
              </div>
              <div>
                <label className={labelCls}>Tanggal lahir</label>
                <input type="date" className={inputCls} {...pf("birth_date")} />
              </div>
              <div>
                <label className={labelCls}>Tanggal bergabung</label>
                <input type="date" className={inputCls} {...pf("join_date")} />
              </div>
            </div>

            {/* Bermain */}
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Posisi & Jersey</p>
            <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div>
                <label className={labelCls}>Posisi bermain</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} {...pf("position")}>
                    <option value="">Pilih posisi</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ukuran jersey</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} {...pf("jersey_size")}>
                    <option value="">Pilih ukuran</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            {/* Wali */}
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Data Wali</p>
            <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div>
                <label className={labelCls}>Nama orang tua / wali</label>
                <input className={inputCls} {...pf("parent_name")} />
              </div>
              <div>
                <label className={labelCls}>Nomor HP orang tua</label>
                <input className={inputCls} {...pf("parent_phone")} />
              </div>
            </div>

            {/* Lainnya */}
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Lainnya</p>
            <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

            <div className="grid grid-cols-[1fr_160px] gap-3 max-md:grid-cols-1">
              <div>
                <label className={labelCls}>Alamat</label>
                <textarea className={`${inputCls} min-h-[68px] resize-y`} {...pf("address")} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={participantState.status} onChange={(e) => setParticipantState((s) => ({ ...s, status: e.target.value as "ACTIVE" | "INACTIVE" }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Catatan</label>
              <textarea className={`${inputCls} min-h-[68px] resize-y`} {...pf("notes")} />
            </div>

            <button
              type="submit"
              className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
              disabled={isSavingParticipant}
            >
              {isSavingParticipant ? "Menyimpan..." : participantState.id ? "Perbarui Peserta" : "Tambah Peserta"}
            </button>
          </form>

          {/* Table */}
          <div className={glass}>
            <div className="mb-5">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Daftar Peserta</p>
              <h2 className="text-lg font-extrabold text-blue-950">{participants.length} peserta terdata</h2>
            </div>

            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b-2 border-blue-500/5">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Nama</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Posisi</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Jersey</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-sm">Belum ada data peserta.</p>
                        </div>
                      </td>
                    </tr>
                  ) : participants.map((p) => (
                    <tr key={p.id} className="border-b border-blue-500/[0.04] transition hover:bg-blue-500/[0.025]">
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="mt-0.5 text-[0.72rem] text-slate-400">{p.parent_name ?? "Wali belum diisi"}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{p.position ?? "-"}</td>
                      <td className="px-3 py-3.5 text-slate-600">{p.jersey_size ?? "-"}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => startEditParticipant(p)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/[0.06] text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                          </button>
                          <button type="button" onClick={() => removeParticipant(p.id)} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-500 transition hover:bg-red-500/10">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </>)}

        {activeTab === "keuangan" && (
          <FinanceManager participants={participants} billingConfig={billingConfig} />
        )}
      </div>
    </div>
  );
}
