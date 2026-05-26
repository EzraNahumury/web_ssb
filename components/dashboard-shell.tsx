"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ParticleBackground } from "@/components/particle-background";
import { FinanceManager } from "@/components/finance-manager";
import { ReportManager } from "@/components/report-manager";
import { TournamentManager } from "@/components/tournament-manager";
import type { AgeGroup, BillingConfig, DashboardSummary, Participant, Partnership, SsbProfile } from "@/lib/data";
import { FieldViewerModal } from "@/components/field-viewer-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DashboardShellProps = {
  user: { name: string; role: "AYRES_ADMIN" | "SSB_ADMIN" | "PELATIH" };
  profile: SsbProfile;
  partnership: Partnership | null;
  summary: DashboardSummary;
  participants: Participant[];
  billingConfig: BillingConfig | null;
  ageGroups: AgeGroup[];
};

type ParticipantFormState = {
  id: number | null;
  name: string;
  nickname: string;
  photo: string | null;
  birth_date: string;
  position: string;
  role: string;
  jersey_size: string;
  age_group: string;
  tournament: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  join_date: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
};

const emptyParticipant: ParticipantFormState = {
  id: null, name: "", nickname: "", photo: null, birth_date: "", position: "", role: "", jersey_size: "", age_group: "", tournament: "",
  parent_name: "", parent_phone: "", address: "", join_date: "", status: "ACTIVE", notes: "",
};

const inputCls =
  "w-full rounded-md border border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-[#FF3B30]/40 focus:border-[#FF3B30] focus:bg-[#1E1E1E] focus:ring-[3px] focus:ring-[#FF3B30]/15";

const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/60";

const glass = "rounded-xl border border-white/10 bg-[#1E1E1E] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)]";

function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeGroupLabel(birthDate: string | null, groups: AgeGroup[]) {
  if (!birthDate) return null;
  const age = getAge(birthDate);
  const group = groups.find((g) => age >= g.min_age && age <= g.max_age);
  return group?.name ?? null;
}

export function DashboardShell({ user, profile, partnership, summary, participants, billingConfig, ageGroups: initialAgeGroups }: DashboardShellProps) {
  const router = useRouter();
  const [profileState, setProfileState] = useState({
    name: profile.name,
    logo: profile.logo ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    partnership_notes: profile.partnership_notes ?? "",
  });
  const [participantState, setParticipantState] = useState<ParticipantFormState>(emptyParticipant);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [toastDismissing, setToastDismissing] = useState(false);

  const dismissToast = useCallback(() => {
    setToastDismissing(true);
    setTimeout(() => { setToast(null); setToastDismissing(false); }, 300);
  }, []);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToastDismissing(false);
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 3500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "peserta" | "tournament" | "keuangan" | "report">("overview");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [viewingParticipant, setViewingParticipant] = useState<Participant | null>(null);
  const [ageGroups, setAgeGroups] = useState(initialAgeGroups);
  const [agName, setAgName] = useState("");
  const [agMin, setAgMin] = useState("");
  const [agMax, setAgMax] = useState("");
  const [isSavingAg, setIsSavingAg] = useState(false);
  const [editingAgId, setEditingAgId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantPage, setParticipantPage] = useState(1);
  const participantPerPage = 4;
  const [tournamentList, setTournamentList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (activeTab === "peserta") {
      fetch("/api/ssb/tournaments").then((r) => r.json()).then((d) => {
        if (d.data) setTournamentList(d.data);
      });
    }
  }, [activeTab]);

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
    setToast(null); setIsSavingProfile(true);
    const response = await fetch("/api/ssb/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileState),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { showToast("error", data.error ?? "Gagal menyimpan profil."); setIsSavingProfile(false); return; }
    showToast("success", "Profil Academy berhasil diperbarui.");
    setIsSavingProfile(false);
    router.refresh();
  }

  function startEditParticipant(p: Participant) {
    setPhotoFile(null);
    setParticipantState({
      id: p.id, name: p.name, nickname: p.nickname ?? "", photo: p.photo ?? null, birth_date: p.birth_date ?? "",
      position: p.position ?? "", role: p.role ?? "", jersey_size: p.jersey_size ?? "", age_group: p.age_group ?? "", tournament: p.tournament ?? "", parent_name: p.parent_name ?? "",
      parent_phone: p.parent_phone ?? "", address: p.address ?? "", join_date: p.join_date ?? "",
      status: p.status, notes: p.notes ?? "",
    });
    setToast(null);
    window.scrollTo({ top: document.getElementById("participant-form")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function saveParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null); setIsSavingParticipant(true);
    const isEditing = Boolean(participantState.id);

    const payload = new FormData();
    Object.entries(participantState).forEach(([k, v]) => {
      if (k !== "id" && v !== null) payload.set(k, String(v));
    });
    if (photoFile) payload.set("photo", photoFile);
    payload.set("currentPhoto", participantState.photo ?? "");

    const response = await fetch(isEditing ? `/api/participants/${participantState.id}` : "/api/participants", {
      method: isEditing ? "PATCH" : "POST",
      body: payload,
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { showToast("error", data.error ?? "Gagal menyimpan peserta."); setIsSavingParticipant(false); return; }
    showToast("success", isEditing ? "Data peserta berhasil diperbarui." : "Peserta baru berhasil ditambahkan.");
    setParticipantState(emptyParticipant);
    setPhotoFile(null);
    setIsSavingParticipant(false);
    router.refresh();
  }

  function removeParticipant(id: number, name: string) {
    setDeleteConfirm({ id, name });
  }

  async function confirmDeleteParticipant() {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setToast(null);
    const response = await fetch(`/api/participants/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) { showToast("error", data.error ?? "Gagal menghapus peserta."); return; }
    if (participantState.id === id) setParticipantState(emptyParticipant);
    showToast("success", "Peserta berhasil dihapus.");
    router.refresh();
  }

  async function saveAgeGroup() {
    setIsSavingAg(true);
    const body = { name: agName, min_age: Number(agMin), max_age: Number(agMax) };
    const isEditing = editingAgId !== null;

    const res = await fetch(isEditing ? `/api/ssb/age-groups/${editingAgId}` : "/api/ssb/age-groups", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok && data.data) {
      if (isEditing) {
        setAgeGroups((prev) => prev.map((g) => g.id === editingAgId ? data.data : g).sort((a: { min_age: number }, b: { min_age: number }) => a.min_age - b.min_age));
      } else {
        setAgeGroups((prev) => [...prev, data.data].sort((a, b) => a.min_age - b.min_age));
      }
      cancelEditAg();
      showToast("success", isEditing ? "Kelompok umur berhasil diperbarui." : "Kelompok umur berhasil ditambahkan.");
    } else {
      showToast("error", data.error ?? "Gagal menyimpan kelompok umur.");
    }
    setIsSavingAg(false);
  }

  function startEditAg(g: { id: number; name: string; min_age: number; max_age: number }) {
    setEditingAgId(g.id);
    setAgName(g.name);
    setAgMin(String(g.min_age));
    setAgMax(String(g.max_age));
  }

  function cancelEditAg() {
    setEditingAgId(null);
    setAgName(""); setAgMin(""); setAgMax("");
  }

  async function removeAgeGroup(id: number) {
    const res = await fetch(`/api/ssb/age-groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAgeGroups((prev) => prev.filter((g) => g.id !== id));
      if (editingAgId === id) cancelEditAg();
      showToast("success", "Kelompok umur berhasil dihapus.");
    }
  }

  function pf(key: keyof typeof emptyParticipant) {
    return {
      value: participantState[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setParticipantState((s) => ({ ...s, [key]: e.target.value })),
    };
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stadium bg-noise">
      <ParticleBackground />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5">
        {/* ── Header ────────────────────────── */}
        <header className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#1E1E1E] px-5 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-4 min-w-0">
            {profile.logo ? (
              <div className="relative shrink-0">
                <img src={profile.logo} alt="Logo Academy" className="h-12 w-12 rounded-md object-cover ring-2 ring-[#FF3B30]/40 shadow-[0_4px_14px_rgba(255,59,48,0.35)]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-extrabold text-white ring-2 ring-white/80 shadow-md"
                  style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.1rem] font-extrabold tracking-tight text-white truncate" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{profile.name}</h1>
                <span
                  className="badge shrink-0"
                  style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
                >
                  Academy Partner
                </span>
              </div>
              <p className="mt-0.5 text-[0.74rem] text-white/40 truncate">
                <span className="font-semibold text-white/70">{user.name}</span>
                <span className="mx-1.5 text-white/20">/</span>
                <span className="text-white/40">{user.role.replace("_", " ")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden items-center gap-2.5 rounded-md border border-white/10 bg-[#161616] px-3.5 py-2 sm:flex">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                partnership?.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {partnership?.status ?? "N/A"}
              </span>
              <div className="h-4 w-px bg-white/15" />
              <p className="text-[0.72rem] font-semibold text-white/70">{activeUntilLabel}</p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-3 py-2 font-heading text-[0.78rem] font-bold uppercase tracking-wider text-[#FF3B30] transition hover:bg-[#FF3B30]/20"
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
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FF3B30]/15 text-[#FF3B30]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-white">{summary.totalParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Total Peserta</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-white">{summary.activeParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Peserta Aktif</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            <div>
              <p className="text-[1.65rem] font-extrabold leading-none text-white">{summary.inactiveParticipants}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Peserta Nonaktif</p>
            </div>
          </div>
        </section>

        {/* ══════ PELATIH VIEW ══════ */}
        {user.role === "PELATIH" && (
          <section className={glass}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Daftar Peserta</p>
                <h2 className="text-lg font-extrabold text-white">{participants.length} peserta terdata</h2>
              </div>
              <div className="relative w-full max-w-[260px]">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
                <input className={`${inputCls} pl-9`} placeholder="Cari nama, posisi..." value={participantSearch} onChange={(e) => { setParticipantSearch(e.target.value); setParticipantPage(1); }} />
              </div>
            </div>
            <div className="-mx-2 overflow-x-auto">
              {(() => {
                const q = participantSearch.trim().toLowerCase();
                const fp = q ? participants.filter((p) => [p.name, p.nickname, p.position, p.jersey_size, p.age_group].some((v) => v?.toLowerCase().includes(q))) : participants;
                return (
                  <>
                  <table className="w-full text-left text-[0.82rem]">
                    <thead>
                      <tr className="border-b-2 border-[#FF3B30]/20">
                        <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Nama</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Posisi</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Jersey</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Status</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fp.length === 0 ? (
                        <tr><td colSpan={5}><div className="flex flex-col items-center gap-2 py-10 text-white/30"><p className="text-sm">{participantSearch ? "Tidak ditemukan." : "Belum ada data peserta."}</p></div></td></tr>
                      ) : fp.slice((participantPage - 1) * participantPerPage, participantPage * participantPerPage).map((p) => (
                        <tr key={p.id} className="border-b border-white/5 transition hover:bg-[#FF3B30]/[0.025]">
                          <td className="px-3 py-3.5">
                            <p className="font-semibold text-white/90">{p.name}</p>
                            <p className="mt-0.5 text-[0.72rem] text-white/30">{p.nickname ?? ""}</p>
                          </td>
                          <td className="px-3 py-3.5 text-white/60">{p.position ?? "-"}</td>
                          <td className="px-3 py-3.5 text-white/60">{p.jersey_size ?? "-"}</td>
                          <td className="px-3 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${p.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/15"}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />{p.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <button type="button" onClick={() => setViewingParticipant(p)} title="Detail" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/[0.07] text-[#FF3B30] transition hover:bg-[#FF3B30]/15">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fp.length > participantPerPage && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[0.72rem] text-white/30">{(participantPage - 1) * participantPerPage + 1}-{Math.min(participantPage * participantPerPage, fp.length)} dari {fp.length}</p>
                      <div className="flex gap-1.5">
                        <button type="button" className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40" disabled={participantPage <= 1} onClick={() => setParticipantPage((pg) => pg - 1)}>Prev</button>
                        {Array.from({ length: Math.ceil(fp.length / participantPerPage) }, (_, i) => i + 1).map((pg) => (
                          <button key={pg} type="button" className={`rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${pg === participantPage ? "bg-[#FF3B30] text-white shadow-sm" : "border border-white/15 text-white/60 hover:bg-white/5"}`} onClick={() => setParticipantPage(pg)}>{pg}</button>
                        ))}
                        <button type="button" className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40" disabled={participantPage >= Math.ceil(fp.length / participantPerPage)} onClick={() => setParticipantPage((pg) => pg + 1)}>Next</button>
                      </div>
                    </div>
                  )}
                  </>
                );
              })()}
            </div>
          </section>
        )}

        {/* ── Participant Detail Modal ──── */}
        {viewingParticipant && (
          <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6 backdrop-blur-sm" onClick={() => setViewingParticipant(null)}>
            <div className="anim-slide-up w-full max-w-lg overflow-hidden rounded-xl bg-[#1E1E1E] border border-white/10 shadow-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-[#2A2A2A] text-white/60 transition hover:bg-[#FF3B30]/20 hover:text-[#FF3B30]" onClick={() => setViewingParticipant(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="relative flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] to-[#1E1E1E] border-b border-white/5 py-6">
                {viewingParticipant.photo ? (
                  <img src={viewingParticipant.photo} alt="Foto" className="h-24 w-24 rounded-2xl border-2 border-white object-cover shadow-md" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-md" style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}>
                    {viewingParticipant.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-6 pt-5 pb-3">
                <p className="section-kicker">Detail Peserta</p>
                <h3 className="text-lg font-extrabold text-white">{viewingParticipant.name}</h3>
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${viewingParticipant.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/15"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />{viewingParticipant.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 max-sm:grid-cols-1">
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nama Panggilan</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.nickname ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Tanggal Lahir</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.birth_date ?? "-"}{viewingParticipant.birth_date && <span className="ml-1 text-[0.72rem] text-white/30">({getAge(viewingParticipant.birth_date)} thn)</span>}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Kelompok Umur</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.age_group ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Tournament</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.tournament ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Posisi</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.position ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Role</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.role ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Ukuran Jersey</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.jersey_size ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Tanggal Bergabung</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.join_date ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nama Wali</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.parent_name ?? "-"}</p></div>
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">HP Wali</p><p className="mt-0.5 text-[0.85rem] text-white/90">{viewingParticipant.parent_phone ?? "-"}</p></div>
              </div>
              {viewingParticipant.address && (<div className="px-6 pb-2"><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Alamat</p><p className="mt-0.5 text-[0.85rem] leading-relaxed text-white/90">{viewingParticipant.address}</p></div>)}
              {viewingParticipant.notes && (<div className="px-6 pb-2"><p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Catatan</p><p className="mt-0.5 text-[0.85rem] leading-relaxed text-white/90">{viewingParticipant.notes}</p></div>)}
              <div className="flex items-center gap-3 px-6 pb-6 pt-3">
                {user.role !== "PELATIH" && (
                  <button type="button" className="btn-shimmer flex-1 rounded-[14px] py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }} onClick={() => { startEditParticipant(viewingParticipant); setViewingParticipant(null); }}>Edit Data</button>
                )}
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)] transition hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
                  onClick={() => {
                    const p = viewingParticipant;
                    const doc = new jsPDF();
                    const pw = doc.internal.pageSize.getWidth();

                    // Header
                    doc.setFontSize(16);
                    doc.setFont("helvetica", "bold");
                    doc.text(profile.name, pw / 2, 20, { align: "center" });
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    doc.text("Data Peserta", pw / 2, 27, { align: "center" });
                    doc.setDrawColor(200);
                    doc.line(14, 32, pw - 14, 32);

                    // Participant name & status
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text(p.name, 14, 44);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(p.status === "ACTIVE" ? 16 : 120, p.status === "ACTIVE" ? 185 : 120, p.status === "ACTIVE" ? 129 : 120);
                    doc.text(p.status, 14, 50);
                    doc.setTextColor(0);

                    // Detail table
                    const rows: string[][] = [
                      ["Nama Panggilan", p.nickname ?? "-"],
                      ["Tanggal Lahir", p.birth_date ? `${p.birth_date} (${getAge(p.birth_date)} thn)` : "-"],
                      ["Kelompok Umur", p.age_group ?? "-"],
                      ["Tournament", p.tournament ?? "-"],
                      ["Posisi", p.position ?? "-"],
                      ["Role", p.role ?? "-"],
                      ["Ukuran Jersey", p.jersey_size ?? "-"],
                      ["Tanggal Bergabung", p.join_date ?? "-"],
                      ["Nama Wali", p.parent_name ?? "-"],
                      ["HP Wali", p.parent_phone ?? "-"],
                      ["Alamat", p.address ?? "-"],
                    ];
                    if (p.notes) rows.push(["Catatan", p.notes]);

                    autoTable(doc, {
                      startY: 56,
                      head: [["Field", "Detail"]],
                      body: rows,
                      theme: "grid",
                      headStyles: { fillColor: [0, 106, 255], fontStyle: "bold", fontSize: 9 },
                      styles: { fontSize: 9, cellPadding: 4 },
                      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
                      margin: { left: 14, right: 14 },
                    });

                    // Footer
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(150);
                    doc.text(
                      `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
                      pw / 2,
                      doc.internal.pageSize.getHeight() - 10,
                      { align: "center" },
                    );

                    doc.save(`Data_Peserta_${p.name.replace(/\s+/g, "_")}.pdf`);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF
                </button>
                <button type="button" className={`rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/5 px-4 py-2.5 text-sm font-semibold text-[#FF3B30] transition hover:bg-[#FF3B30]/15 ${user.role === "PELATIH" ? "flex-1" : ""}`} onClick={() => setViewingParticipant(null)}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ SSB_ADMIN VIEW ══════ */}
        {user.role !== "PELATIH" && (<>
        {/* ── Tab Navigation ───────────────── */}
        <div className="flex gap-1 rounded-md border border-white/10 bg-[#1E1E1E] p-1.5">
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "overview"
                ? "text-white shadow-md"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            }`}
            style={activeTab === "overview" ? { background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" } : undefined}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "peserta"
                ? "text-white shadow-md"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            }`}
            style={activeTab === "peserta" ? { background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" } : undefined}
            onClick={() => setActiveTab("peserta")}
          >
            Peserta
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "tournament"
                ? "text-white shadow-md"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            }`}
            style={activeTab === "tournament" ? { background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" } : undefined}
            onClick={() => setActiveTab("tournament")}
          >
            Tournament
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "keuangan"
                ? "text-white shadow-md"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            }`}
            style={activeTab === "keuangan" ? { background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" } : undefined}
            onClick={() => setActiveTab("keuangan")}
          >
            Keuangan
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition ${
              activeTab === "report"
                ? "text-white shadow-md"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            }`}
            style={activeTab === "report" ? { background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" } : undefined}
            onClick={() => setActiveTab("report")}
          >
            Report
          </button>
        </div>

        {/* ── Delete Confirm ────────────── */}
        {deleteConfirm && (
          <div className="confirm-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-card w-full max-w-sm overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-2 text-center">
                <div className="confirm-icon flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/30">
                  <svg className="confirm-check" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" width="30" height="30">
                    <circle className="confirm-circle" cx="12" cy="12" r="10" />
                    <path className="confirm-tick" strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                </div>
                <h3 className="confirm-title text-lg font-bold text-white/90">Hapus Peserta?</h3>
                <p className="confirm-desc text-[0.85rem] leading-relaxed text-white/50">
                  Hapus <span className="font-bold text-white/80">{deleteConfirm.name}</span> dari daftar peserta? Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
              <div className="confirm-buttons flex gap-3 px-6 pt-4 pb-6">
                <button type="button" className="flex-1 rounded-md border border-white/15 bg-[#2A2A2A] px-4 py-2.5 font-heading text-[0.82rem] font-bold uppercase tracking-wider text-white/70 transition-all duration-200 hover:bg-[#353535] active:scale-95" onClick={() => setDeleteConfirm(null)}>
                  Batal
                </button>
                <button type="button" className="confirm-btn-yes flex-1 rounded-md bg-[#FF3B30] px-4 py-2.5 font-heading text-[0.82rem] font-bold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(255,59,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95" onClick={confirmDeleteParticipant}>
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Role Picker Modal ─────────── */}
        <FieldViewerModal
          open={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          selectedRoles={participantState.role ? participantState.role.split(",").map((s) => s.trim()).filter(Boolean) : []}
          onConfirm={(roles) => setParticipantState((s) => ({ ...s, role: roles.join(", ") }))}
        />

        {/* ── Toast ──────────────────────── */}
        {toast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={dismissToast}>
            <div className={`toast-overlay absolute inset-0 ${toastDismissing ? "toast-overlay-out" : ""}`} />
            <div
              className={`toast-card relative w-full max-w-xs overflow-hidden rounded-xl ${toastDismissing ? "toast-card-out" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
                {toast.type === "success" ? (
                  <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/300/15 border border-emerald-500/30">
                    <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32">
                      <circle className="toast-circle-success" cx="12" cy="12" r="10" stroke="#22C55E" />
                      <path className="toast-tick" strokeLinecap="round" strokeLinejoin="round" stroke="#22C55E" d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                ) : (
                  <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/30">
                    <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32">
                      <circle className="toast-circle-error" cx="12" cy="12" r="10" stroke="#FF3B30" />
                      <path className="toast-cross" strokeLinecap="round" stroke="#FF3B30" d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  </div>
                )}
                <h3 className="toast-title text-lg font-bold text-white/90">
                  {toast.type === "success" ? "Berhasil!" : "Gagal"}
                </h3>
                <p className="toast-desc text-[0.85rem] leading-relaxed text-white/50">{toast.message}</p>
                <button
                  type="button"
                  className={`toast-btn mt-1 w-full rounded-md px-4 py-2.5 font-heading text-[0.85rem] font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    toast.type === "success"
                      ? "bg-emerald-600 shadow-[0_4px_16px_rgba(34,197,94,0.4)]"
                      : "bg-[#FF3B30] shadow-[0_4px_16px_rgba(255,59,48,0.4)]"
                  }`}
                  onClick={dismissToast}
                >
                  OK
                </button>
              </div>
              <div className={`toast-progress absolute bottom-0 left-0 h-1 ${toast.type === "success" ? "bg-emerald-500" : "bg-[#FF3B30]"}`} />
            </div>
          </div>
        )}

        {activeTab === "overview" && (<>
        {/* ── Profile + Activity ─────────────── */}
        <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
          {/* Profile form */}
          <div className={`${glass} flex flex-col gap-3.5`}>
            <div>
              <p className="section-kicker">Profil Academy</p>
              <h2 className="text-lg font-extrabold text-white">Data utama klub</h2>
            </div>

            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Informasi Klub</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

            <div className="flex items-center gap-3">
              {profileState.logo ? (
                <img src={profileState.logo} alt="Logo Academy" className="h-14 w-14 shrink-0 rounded-md border border-white/15 object-contain bg-[#0F0F0F] p-1" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/30 text-xs">Logo</div>
              )}
              <div>
                <label className={labelCls}>Nama Academy</label>
                <p className="text-base font-bold text-white">{profileState.name || "-"}</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Nomor kontak</label>
              <p className="rounded-xl border-[1.5px] border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white/80">{profileState.phone || "-"}</p>
            </div>
            <div>
              <label className={labelCls}>Alamat</label>
              <p className="rounded-xl border-[1.5px] border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white/80 min-h-[68px]">{profileState.address || "-"}</p>
            </div>
            <div>
              <label className={labelCls}>Keterangan partnership</label>
              <p className="rounded-xl border-[1.5px] border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white/80 min-h-[68px]">{profileState.partnership_notes || "-"}</p>
            </div>
          </div>

          {/* Activity */}
          <div className={`${glass} flex flex-col gap-3.5`}>
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Peserta Terbaru</p>
              <h2 className="text-lg font-extrabold text-white">Ringkasan aktivitas</h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {summary.latestParticipants.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-white/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <p className="text-sm">Belum ada data peserta.</p>
                </div>
              ) : (
                summary.latestParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-[#161616] px-4 py-3 transition hover:bg-[#FF3B30]/[0.025]">
                    <div>
                      <p className="text-[0.85rem] font-semibold text-white/90">{p.name}</p>
                      <p className="text-[0.72rem] text-white/30">
                        {p.position ?? "Posisi belum diisi"} &middot; Jersey {p.jersey_size ?? "-"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                      p.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/15"
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
        </>)}

        {activeTab === "peserta" && (<>
        {/* ── Age Group Manager ────────── */}
        <section className={`${glass} flex flex-col gap-3.5`}>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Pengaturan</p>
            <h2 className="text-lg font-extrabold text-white">Kelompok Umur</h2>
          </div>

          {/* List */}
          {ageGroups.length === 0 ? (
            <p className="text-[0.78rem] text-white/30">Belum ada kelompok umur.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {ageGroups.map((g) => (
                <div key={g.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${editingAgId === g.id ? "border-[#FF3B30] bg-[#FF3B30]/10" : "border-white/8 bg-[#161616] hover:bg-[#FF3B30]/[0.025]"}`}>
                  <div>
                    <p className="text-[0.85rem] font-semibold text-white/90">{g.name}</p>
                    <p className="text-[0.72rem] text-white/30">Umur {g.min_age} - {g.max_age} tahun</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button type="button" title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white border border-white/10" onClick={() => startEditAg(g)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                    </button>
                    <button type="button" title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20" onClick={() => removeAgeGroup(g.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">
            {editingAgId ? "Edit Kelompok Umur" : "Tambah Kelompok Umur"}
          </p>
          <div className="flex items-end gap-2 max-md:flex-wrap">
            <div className="flex-1 min-w-[100px]">
              <label className={labelCls}>Nama</label>
              <input className={inputCls} placeholder="Contoh: U-7" value={agName} onChange={(e) => setAgName(e.target.value)} />
            </div>
            <div className="w-[80px]">
              <label className={labelCls}>Min</label>
              <input type="number" className={inputCls} placeholder="5" value={agMin} onChange={(e) => setAgMin(e.target.value)} />
            </div>
            <div className="w-[80px]">
              <label className={labelCls}>Max</label>
              <input type="number" className={inputCls} placeholder="7" value={agMax} onChange={(e) => setAgMax(e.target.value)} />
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-[#FF3B30] px-4 py-2.5 text-[0.78rem] font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50"
              disabled={!agName || !agMin || !agMax || isSavingAg}
              onClick={saveAgeGroup}
            >
              {isSavingAg ? "..." : editingAgId ? "Simpan" : "Tambah"}
            </button>
            {editingAgId && (
              <button
                type="button"
                className="shrink-0 rounded-xl border border-white/15 px-4 py-2.5 text-[0.78rem] font-semibold text-white/60 transition hover:bg-white/5"
                onClick={cancelEditAg}
              >
                Batal
              </button>
            )}
          </div>
        </section>

        {/* ── Participant Form + Table ────────── */}
        <section id="participant-form" className="grid gap-5 xl:grid-cols-[420px_1fr]">
          {/* Form */}
          <form onSubmit={saveParticipant} className={`${glass} flex flex-col gap-3.5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker">Form Peserta</p>
                <h2 className="text-lg font-extrabold text-white">
                  {participantState.id ? "Edit peserta" : "Tambah peserta baru"}
                </h2>
              </div>
              {participantState.id && (
                <button
                  type="button"
                  className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/5 px-3 py-1.5 text-[0.75rem] font-semibold text-[#FF3B30] transition hover:bg-[#FF3B30]/15"
                  onClick={() => { setParticipantState(emptyParticipant); setPhotoFile(null); }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Foto */}
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Foto Peserta</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />
            <div>
              <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-white/15/80 p-3 transition hover:border-[#FF3B30] hover:bg-[#FF3B30]/5">
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
                {(photoFile || participantState.photo) ? (
                  <>
                    <img src={photoFile ? URL.createObjectURL(photoFile) : participantState.photo!} alt="Foto" className="h-14 w-14 rounded-xl border border-white/15 object-cover" />
                    <div>
                      <p className="text-[0.78rem] font-semibold text-white/80">{photoFile ? photoFile.name : "Foto tersimpan"}</p>
                      <p className="text-[0.65rem] text-white/30">Klik untuk ganti</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 py-1 text-white/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[0.78rem] font-medium">Upload foto peserta</p>
                  </div>
                )}
              </label>
            </div>

            {/* Identitas */}
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Identitas Peserta</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

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

            {/* Kelompok Umur */}
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div>
                <label className={labelCls}>Kelompok umur</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} {...pf("age_group")}>
                    <option value="">Pilih kelompok umur</option>
                    {ageGroups.map((g) => (
                      <option key={g.id} value={g.name}>{g.name} ({g.min_age}-{g.max_age} thn)</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              {participantState.birth_date && (
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2 rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/8 px-3.5 py-2.5 w-full">
                    <span className="text-[0.72rem] text-white/50">Rekomendasi:</span>
                    <span className="text-[0.78rem] font-bold text-[#FF3B30]">
                      {getAgeGroupLabel(participantState.birth_date, ageGroups) ?? "-"}
                    </span>
                    <span className="text-[0.68rem] text-white/30">({getAge(participantState.birth_date)} thn)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tournament */}
            <div>
              <label className={labelCls}>Tournament</label>
              {tournamentList.length === 0 ? (
                <p className="text-[0.75rem] text-white/30 py-2">Belum ada tournament.</p>
              ) : (
                <div className="flex flex-col gap-1.5 rounded-xl border-[1.5px] border-white/15 bg-white/5 px-3.5 py-2.5 max-h-[140px] overflow-y-auto">
                  {tournamentList.map((t) => {
                    const selected = (participantState.tournament ?? "").split(",").map((s) => s.trim()).filter(Boolean);
                    const checked = selected.includes(t.name);
                    return (
                      <label key={t.id} className="flex items-center gap-2.5 cursor-pointer rounded-lg px-1 py-1 transition hover:bg-[#FF3B30]/8">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/15 text-[#FF3B30] accent-[#FF3B30]"
                          checked={checked}
                          onChange={() => {
                            const next = checked ? selected.filter((s) => s !== t.name) : [...selected, t.name];
                            setParticipantState((s) => ({ ...s, tournament: next.join(", ") }));
                          }}
                        />
                        <span className="text-[0.82rem] text-white/80">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {participantState.tournament && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {participantState.tournament.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#FF3B30]/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-[#FF3B30]">
                      {t}
                      <button type="button" className="text-[#FF3B30]/70 hover:text-red-500 transition" onClick={() => {
                        const next = participantState.tournament!.split(",").map((s) => s.trim()).filter((s) => s && s !== t).join(", ");
                        setParticipantState((s) => ({ ...s, tournament: next || "" }));
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bermain */}
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Posisi & Jersey</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

            {/* Role (3D field picker) */}
            <div>
              <label className={labelCls}>Role</label>
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className={`${inputCls} flex items-center gap-2 text-left cursor-pointer`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18" className="shrink-0 text-[#FF3B30]">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 8v8M8 12h8" />
                </svg>
                {participantState.role ? (
                  <span className="text-white/80">Klik untuk ubah role</span>
                ) : (
                  <span className="text-white/30">Klik untuk pilih role dari lapangan 3D</span>
                )}
              </button>
              {participantState.role && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {participantState.role.split(",").map((r) => r.trim()).filter(Boolean).map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 rounded-full bg-[#FF3B30]/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-[#FF3B30]">
                      {r}
                      <button type="button" className="text-[#FF3B30]/70 hover:text-red-500 transition" onClick={() => {
                        const next = participantState.role.split(",").map((s) => s.trim()).filter((s) => s && s !== r).join(", ");
                        setParticipantState((s) => ({ ...s, role: next }));
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

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
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ukuran jersey</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} {...pf("jersey_size")}>
                    <option value="">Pilih ukuran</option>
                    <optgroup label="Anak">
                      <option value="Anak S">S</option>
                      <option value="Anak M">M</option>
                      <option value="Anak L">L</option>
                      <option value="Anak XL">XL</option>
                    </optgroup>
                    <optgroup label="Dewasa">
                      <option value="Dewasa S">S</option>
                      <option value="Dewasa M">M</option>
                      <option value="Dewasa L">L</option>
                      <option value="Dewasa XL">XL</option>
                      <option value="Dewasa XXL">XXL</option>
                      <option value="Dewasa XXXL">XXXL</option>
                    </optgroup>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            {/* Wali */}
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Data Wali</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

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
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#FF3B30]/80">Lainnya</p>
            <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

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
              style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
              disabled={isSavingParticipant}
            >
              {isSavingParticipant ? "Menyimpan..." : participantState.id ? "Perbarui Peserta" : "Tambah Peserta"}
            </button>
          </form>

          {/* Table */}
          <div className={glass}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Daftar Peserta</p>
                <h2 className="text-lg font-extrabold text-white">{participants.length} peserta terdata</h2>
              </div>
              <div className="relative w-full max-w-[260px]">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
                <input className={`${inputCls} pl-9`} placeholder="Cari nama, posisi..." value={participantSearch} onChange={(e) => { setParticipantSearch(e.target.value); setParticipantPage(1); }} />
              </div>
            </div>

            <div className="-mx-2 overflow-x-auto">
              {(() => {
                const q = participantSearch.trim().toLowerCase();
                const filteredParticipants = q ? participants.filter((p) => [p.name, p.nickname, p.position, p.jersey_size, p.age_group].some((v) => v?.toLowerCase().includes(q))) : participants;
                return (
              <table className="w-full text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b-2 border-[#FF3B30]/20">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Nama</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Posisi</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Jersey</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Status</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-white/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-sm">{participantSearch ? "Tidak ditemukan." : "Belum ada data peserta."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredParticipants.slice((participantPage - 1) * participantPerPage, participantPage * participantPerPage).map((p) => (
                    <tr key={p.id} className="border-b border-white/5 transition hover:bg-[#FF3B30]/[0.025]">
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-white/90">{p.name}</p>
                        <p className="mt-0.5 text-[0.72rem] text-white/30">{p.parent_name ?? "Wali belum diisi"}</p>
                      </td>
                      <td className="px-3 py-3.5 text-white/60">{p.position ?? "-"}</td>
                      <td className="px-3 py-3.5 text-white/60">{p.jersey_size ?? "-"}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          p.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/15"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => setViewingParticipant(p)} title="Detail" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/[0.07] text-[#FF3B30] transition hover:bg-[#FF3B30]/15">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                          <button type="button" onClick={() => startEditParticipant(p)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white border border-white/10">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                          </button>
                          <button type="button" onClick={() => removeParticipant(p.id, p.name)} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                );
              })()}

              {(() => {
                const q = participantSearch.trim().toLowerCase();
                const fp = q ? participants.filter((p) => [p.name, p.nickname, p.position, p.jersey_size, p.age_group].some((v) => v?.toLowerCase().includes(q))) : participants;
                return fp.length > participantPerPage ? (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[0.72rem] text-white/30">
                      {(participantPage - 1) * participantPerPage + 1}-{Math.min(participantPage * participantPerPage, fp.length)} dari {fp.length}
                    </p>
                    <div className="flex gap-1.5">
                      <button type="button" className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40" disabled={participantPage <= 1} onClick={() => setParticipantPage((p) => p - 1)}>Prev</button>
                      {Array.from({ length: Math.ceil(fp.length / participantPerPage) }, (_, i) => i + 1).map((pg) => (
                        <button key={pg} type="button" className={`rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${pg === participantPage ? "bg-[#FF3B30] text-white shadow-sm" : "border border-white/15 text-white/60 hover:bg-white/5"}`} onClick={() => setParticipantPage(pg)}>{pg}</button>
                      ))}
                      <button type="button" className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40" disabled={participantPage >= Math.ceil(fp.length / participantPerPage)} onClick={() => setParticipantPage((p) => p + 1)}>Next</button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </section>
        </>)}

        {activeTab === "tournament" && (
          <TournamentManager />
        )}

        {activeTab === "keuangan" && (
          <FinanceManager participants={participants} billingConfig={billingConfig} />
        )}

        {activeTab === "report" && (
          <ReportManager ssbName={profile.name} ssbLogo={profile.logo} />
        )}
        </>)}
      </div>
    </div>
  );
}
