"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tournament } from "@/lib/data";

const inputCls =
  "w-full rounded-md border border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-[#FF3B30]/40 focus:border-[#FF3B30] focus:bg-[#1E1E1E] focus:ring-[3px] focus:ring-[#FF3B30]/15";

const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/60";

const glass = "rounded-xl border border-white/10 bg-[#1E1E1E] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)]";

export function TournamentManager() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Toast
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

  useEffect(() => { fetchTournaments(); }, []);

  async function fetchTournaments() {
    setIsLoading(true);
    const res = await fetch("/api/ssb/tournaments");
    const data = await res.json();
    if (res.ok) setTournaments(data.data ?? []);
    setIsLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setName(""); setTitle(""); setDate(""); setDesc("");
  }

  function startEdit(t: Tournament) {
    setEditingId(t.id);
    setName(t.name);
    setTitle(t.title ?? "");
    setDate(t.tournament_date);
    setDesc(t.description ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    setIsSaving(true);
    const body = { name, title: title || null, tournament_date: date, description: desc || null };
    const isEditing = editingId !== null;

    const res = await fetch(isEditing ? `/api/ssb/tournaments/${editingId}` : "/api/ssb/tournaments", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast("error", data.error ?? "Gagal menyimpan tournament.");
    } else {
      showToast("success", isEditing ? "Tournament berhasil diperbarui." : "Tournament berhasil ditambahkan.");
      resetForm();
      fetchTournaments();
    }
    setIsSaving(false);
  }

  async function handleDelete(id: number, tName: string) {
    if (!window.confirm(`Hapus tournament "${tName}"?`)) return;
    const res = await fetch(`/api/ssb/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) resetForm();
      fetchTournaments();
      showToast("success", "Tournament berhasil dihapus.");
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = q ? tournaments.filter((t) => [t.name, t.title, t.description].some((v) => v?.toLowerCase().includes(q))) : tournaments;

  return (
    <div className="flex flex-col gap-4">
      {/* Form + List */}
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        {/* Left: Form */}
        <div className={`${glass} flex flex-col gap-3.5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Form Tournament</p>
              <h2 className="text-lg font-extrabold text-white">
                {editingId ? "Edit tournament" : "Tambah tournament"}
              </h2>
            </div>
            {editingId && (
              <button type="button" className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/8 px-3 py-1.5 text-[0.75rem] font-semibold text-[#FF3B30] transition hover:bg-[#FF3B30]/15" onClick={resetForm}>
                Reset
              </button>
            )}
          </div>

          <div>
            <label className={labelCls}>Nama tournament</label>
            <input className={inputCls} placeholder="Contoh: Piala Soeratin" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Title / gelar</label>
            <input className={inputCls} placeholder="Contoh: Juara 1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Tanggal tournament</label>
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Keterangan</label>
            <textarea className={`${inputCls} min-h-[80px] resize-y`} placeholder="Keterangan tambahan..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <button
            type="button"
            className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(255,59,48,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(255,59,48,0.5)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
            disabled={isSaving || !name || !date}
            onClick={handleSave}
          >
            {isSaving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Tournament"}
          </button>
        </div>

        {/* Right: List */}
        <div className={glass}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Daftar Tournament</p>
              <h2 className="text-lg font-extrabold text-white">{tournaments.length} tournament</h2>
            </div>
            <div className="relative w-full max-w-[260px]">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
              <input className={`${inputCls} pl-9`} placeholder="Cari tournament..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#FF3B30]/30 border-t-[#FF3B30]" />
            </div>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b-2 border-[#FF3B30]/20">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Nama</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Title</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Tanggal</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Keterangan</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-white/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-sm">{search ? "Tidak ditemukan." : "Belum ada tournament."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className={`border-b border-white/5 transition hover:bg-[#FF3B30]/[0.06] ${editingId === t.id ? "bg-[#FF3B30]/8" : ""}`}>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-white/90">{t.name}</p>
                      </td>
                      <td className="px-3 py-3.5 text-white/60">{t.title ?? "-"}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-white/50">
                        {new Date(t.tournament_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3.5 text-[0.78rem] text-white/50 max-w-[200px] truncate">{t.description ?? "-"}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => startEdit(t)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/[0.06] text-white/50 transition hover:bg-white/10 hover:text-white/80">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                          </button>
                          <button type="button" onClick={() => handleDelete(t.id, t.name)} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={dismissToast}>
          <div className={`toast-overlay absolute inset-0 ${toastDismissing ? "toast-overlay-out" : ""}`} />
          <div className={`toast-card relative w-full max-w-xs overflow-hidden rounded-xl bg-[#1E1E1E] border border-white/10 ${toastDismissing ? "toast-card-out" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
              {toast.type === "success" ? (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32"><circle className="toast-circle-success" cx="12" cy="12" r="10" stroke="#22C55E" /><path className="toast-tick" strokeLinecap="round" strokeLinejoin="round" stroke="#22C55E" d="M9 12l2 2 4-4" /></svg>
                </div>
              ) : (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/30">
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32"><circle className="toast-circle-error" cx="12" cy="12" r="10" stroke="#FF3B30" /><path className="toast-cross" strokeLinecap="round" stroke="#FF3B30" d="M15 9l-6 6M9 9l6 6" /></svg>
                </div>
              )}
              <h3 className="toast-title text-lg font-bold text-white/90">{toast.type === "success" ? "Berhasil!" : "Gagal"}</h3>
              <p className="toast-desc text-[0.85rem] leading-relaxed text-white/50">{toast.message}</p>
              <button type="button" className={`toast-btn mt-1 w-full rounded-xl px-4 py-2.5 text-[0.82rem] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${toast.type === "success" ? "bg-emerald-600 shadow-[0_4px_16px_rgba(34,197,94,0.4)]" : "bg-[#FF3B30] shadow-[0_4px_16px_rgba(255,59,48,0.4)]"}`} onClick={dismissToast}>OK</button>
            </div>
            <div className={`toast-progress absolute bottom-0 left-0 h-1 ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        </div>
      )}
    </div>
  );
}
