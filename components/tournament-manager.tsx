"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tournament } from "@/lib/data";

const inputCls =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-500/10";

const labelCls = "block text-[0.72rem] font-bold text-slate-600";

const glass = "rounded-[22px] border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-2xl";

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
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Form Tournament</p>
              <h2 className="text-lg font-extrabold text-blue-950">
                {editingId ? "Edit tournament" : "Tambah tournament"}
              </h2>
            </div>
            {editingId && (
              <button type="button" className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-3 py-1.5 text-[0.75rem] font-semibold text-blue-600 transition hover:bg-blue-500/10" onClick={resetForm}>
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
            className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
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
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Daftar Tournament</p>
              <h2 className="text-lg font-extrabold text-blue-950">{tournaments.length} tournament</h2>
            </div>
            <div className="relative w-full max-w-[260px]">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
              <input className={`${inputCls} pl-9`} placeholder="Cari tournament..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            </div>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b-2 border-blue-500/5">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Nama</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Title</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Keterangan</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-sm">{search ? "Tidak ditemukan." : "Belum ada tournament."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className={`border-b border-blue-500/[0.04] transition hover:bg-blue-500/[0.025] ${editingId === t.id ? "bg-blue-50/50" : ""}`}>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-slate-800">{t.name}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{t.title ?? "-"}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-slate-500">
                        {new Date(t.tournament_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3.5 text-[0.78rem] text-slate-500 max-w-[200px] truncate">{t.description ?? "-"}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => startEdit(t)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/[0.06] text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                          </button>
                          <button type="button" onClick={() => handleDelete(t.id, t.name)} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-500 transition hover:bg-red-500/10">
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
          <div className={`toast-card relative w-full max-w-xs overflow-hidden rounded-2xl bg-white ${toastDismissing ? "toast-card-out" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
              {toast.type === "success" ? (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32"><circle className="toast-circle-success" cx="12" cy="12" r="10" stroke="#10b981" /><path className="toast-tick" strokeLinecap="round" strokeLinejoin="round" stroke="#10b981" d="M9 12l2 2 4-4" /></svg>
                </div>
              ) : (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32"><circle className="toast-circle-error" cx="12" cy="12" r="10" stroke="#ef4444" /><path className="toast-cross" strokeLinecap="round" stroke="#ef4444" d="M15 9l-6 6M9 9l6 6" /></svg>
                </div>
              )}
              <h3 className="toast-title text-lg font-bold text-slate-800">{toast.type === "success" ? "Berhasil!" : "Gagal"}</h3>
              <p className="toast-desc text-[0.85rem] leading-relaxed text-slate-500">{toast.message}</p>
              <button type="button" className={`toast-btn mt-1 w-full rounded-xl px-4 py-2.5 text-[0.82rem] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${toast.type === "success" ? "bg-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.35)]" : "bg-red-500 shadow-[0_4px_16px_rgba(239,68,68,0.35)]"}`} onClick={dismissToast}>OK</button>
            </div>
            <div className={`toast-progress absolute bottom-0 left-0 h-1 ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        </div>
      )}
    </div>
  );
}
