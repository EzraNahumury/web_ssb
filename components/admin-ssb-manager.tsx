"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SsbAdminAccount } from "@/lib/data";

const today = new Date().toISOString().slice(0, 10);
const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  .toISOString()
  .slice(0, 10);

const initialState = {
  ssbName: "",
  address: "",
  phone: "",
  partnershipNotes: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  startDate: today,
  endDate: nextYear,
  status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "EXPIRED",
  currentLogo: "",
};

const inputCls =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-500/10";

const labelCls = "block text-[0.72rem] font-bold text-slate-600";

const glass =
  "rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl";

type AdminSsbManagerProps = {
  accounts: SsbAdminAccount[];
};

export function AdminSsbManager({ accounts }: AdminSsbManagerProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [viewingAccountId, setViewingAccountId] = useState<number | null>(null);
  const [formState, setFormState] = useState(initialState);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const logoPreviewUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);

  useEffect(() => {
    return () => { if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl); };
  }, [logoPreviewUrl]);

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      [a.name, a.email, a.ssbName ?? ""].some((v) => v.toLowerCase().includes(q)),
    );
  }, [accounts, searchQuery]);

  const viewingAccount = useMemo(
    () => accounts.find((a) => a.id === viewingAccountId) ?? null,
    [accounts, viewingAccountId],
  );

  function resetForm() {
    setEditingAccountId(null);
    setFormState(initialState);
    setLogoFile(null);
    setShowAdminPassword(false);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function startEdit(account: SsbAdminAccount) {
    setEditingAccountId(account.id);
    setViewingAccountId(null);
    setError("");
    setFeedback("");
    setLogoFile(null);
    setShowAdminPassword(false);
    if (logoInputRef.current) logoInputRef.current.value = "";
    setFormState({
      ssbName: account.ssbName ?? "",
      address: account.address ?? "",
      phone: account.phone ?? "",
      partnershipNotes: account.partnershipNotes ?? "",
      adminName: account.name,
      adminEmail: account.email,
      adminPassword: "",
      startDate: account.partnershipStartDate ?? today,
      endDate: account.partnershipEndDate ?? nextYear,
      status: account.partnershipStatus ?? "ACTIVE",
      currentLogo: account.logo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.set("ssbName", formState.ssbName);
    payload.set("address", formState.address);
    payload.set("phone", formState.phone);
    payload.set("partnershipNotes", formState.partnershipNotes);
    payload.set("adminName", formState.adminName);
    payload.set("adminEmail", formState.adminEmail);
    payload.set("adminPassword", formState.adminPassword);
    payload.set("startDate", formState.startDate);
    payload.set("endDate", formState.endDate);
    payload.set("status", formState.status);
    payload.set("currentLogo", formState.currentLogo);
    if (logoFile) payload.set("logo", logoFile);

    const isEditing = editingAccountId !== null;
    const response = await fetch(isEditing ? `/api/admin/ssb/${editingAccountId}` : "/api/admin/ssb", {
      method: isEditing ? "PATCH" : "POST",
      body: payload,
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (isEditing ? "Gagal memperbarui akun SSB." : "Gagal membuat akun SSB."));
      setIsSubmitting(false);
      return;
    }

    setFeedback(isEditing ? "Data SSB berhasil diperbarui." : "SSB dan akun admin berhasil dibuat.");
    resetForm();
    setIsSubmitting(false);
    router.refresh();
  }

  async function handleDelete(account: SsbAdminAccount) {
    if (!window.confirm(`Hapus SSB "${account.ssbName ?? account.name}" beserta akun admin-nya?`)) return;
    setError("");
    setFeedback("");
    setIsDeletingId(account.id);

    const response = await fetch(`/api/admin/ssb/${account.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Gagal menghapus akun SSB.");
      setIsDeletingId(null);
      return;
    }

    if (editingAccountId === account.id) resetForm();
    setFeedback("Data SSB berhasil dihapus.");
    setIsDeletingId(null);
    router.refresh();
  }

  function updateField(key: keyof typeof initialState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormState((s) => ({ ...s, [key]: e.target.value }));
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      {/* ══════ LEFT: Form ══════ */}
      <form onSubmit={handleSubmit} className={`${glass} flex flex-col gap-3.5`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">
              {editingAccountId ? "Edit SSB" : "Tambah SSB"}
            </p>
            <h2 className="text-lg font-extrabold text-blue-950">
              {editingAccountId ? "Ubah data SSB" : "Buat SSB baru"}
            </h2>
          </div>
          {editingAccountId && (
            <button
              type="button"
              className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-3 py-1.5 text-[0.75rem] font-semibold text-blue-600 transition hover:bg-blue-500/10"
              onClick={resetForm}
            >
              Batal
            </button>
          )}
        </div>

        {/* Feedback */}
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

        {/* Section: SSB Info */}
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Informasi SSB</p>
        <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className={labelCls} htmlFor="ssb-name">Nama SSB</label>
            <input id="ssb-name" className={inputCls} placeholder="Masukkan nama SSB" value={formState.ssbName} onChange={updateField("ssbName")} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="ssb-phone">Nomor kontak</label>
            <input id="ssb-phone" className={inputCls} placeholder="08xxxxxxxxxx" value={formState.phone} onChange={updateField("phone")} />
          </div>
        </div>

        {/* Logo upload */}
        <div>
          <label className={labelCls} htmlFor="ssb-logo">Logo SSB</label>
          <div
            className="mt-1 cursor-pointer rounded-xl border-2 border-dashed border-slate-300/80 p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
            onClick={() => logoInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && logoInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={logoInputRef}
              id="ssb-logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            {logoPreviewUrl || formState.currentLogo ? (
              <div className="flex items-center gap-3">
                <Image src={logoPreviewUrl ?? formState.currentLogo} alt="Preview" width={56} height={56} className="h-14 w-14 rounded-lg border border-slate-200 bg-white object-contain" />
                <div className="text-left">
                  <p className="text-[0.78rem] font-semibold text-slate-700">{logoFile ? logoFile.name : "Logo tersimpan"}</p>
                  <p className="text-[0.65rem] text-slate-400">Klik untuk ganti</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[0.78rem] font-medium">Klik untuk upload logo</p>
                <p className="text-[0.65rem]">JPG, PNG, WEBP (maks. 2 MB)</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="ssb-address">Alamat</label>
          <textarea id="ssb-address" className={`${inputCls} min-h-[68px] resize-y`} placeholder="Alamat lengkap SSB" value={formState.address} onChange={updateField("address")} />
        </div>

        <div>
          <label className={labelCls} htmlFor="partnership-notes">Keterangan partnership</label>
          <textarea id="partnership-notes" className={`${inputCls} min-h-[68px] resize-y`} placeholder="Catatan kerjasama..." value={formState.partnershipNotes} onChange={updateField("partnershipNotes")} />
        </div>

        {/* Section: Admin */}
        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Akun Admin</p>
        <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className={labelCls} htmlFor="admin-name">Nama admin</label>
            <input id="admin-name" className={inputCls} placeholder="Nama lengkap" value={formState.adminName} onChange={updateField("adminName")} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="admin-email">Email admin</label>
            <input id="admin-email" type="email" className={inputCls} placeholder="email@contoh.com" value={formState.adminEmail} onChange={updateField("adminEmail")} required />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="admin-password">Password admin</label>
          <div className="relative">
            <input
              id="admin-password"
              type={showAdminPassword ? "text" : "password"}
              className={`${inputCls} pr-12`}
              value={formState.adminPassword}
              onChange={updateField("adminPassword")}
              placeholder={editingAccountId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
              required={!editingAccountId}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-blue-500"
              onClick={() => setShowAdminPassword((c) => !c)}
            >
              {showAdminPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A9.77 9.77 0 0112 4.8c4.7 0 8.27 3.03 9.5 7.2a10.94 10.94 0 01-3.02 4.57M6.61 6.61C4.62 7.89 3.25 9.79 2.5 12c1.23 4.17 4.8 7.2 9.5 7.2 1.82 0 3.47-.46 4.9-1.26" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {editingAccountId && <p className="text-[0.68rem] text-slate-400">Isi hanya jika ingin mengganti password.</p>}
        </div>

        {/* Section: Partnership */}
        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sky-700/70">Partnership</p>
        <div className="h-px bg-gradient-to-r from-blue-500/10 to-transparent" />

        <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
          <div className="min-w-0">
            <label className={labelCls} htmlFor="status">Status</label>
            <div className="relative">
              <select id="status" className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={formState.status} onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value as "ACTIVE" | "INACTIVE" | "EXPIRED" }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <div className="min-w-0">
            <label className={labelCls} htmlFor="start-date">Mulai</label>
            <input id="start-date" type="date" className={`${inputCls} min-w-0 text-xs`} value={formState.startDate} onChange={updateField("startDate")} required />
          </div>
          <div className="min-w-0">
            <label className={labelCls} htmlFor="end-date">Berakhir</label>
            <input id="end-date" type="date" className={`${inputCls} min-w-0 text-xs`} value={formState.endDate} onChange={updateField("endDate")} required />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : editingAccountId ? "Simpan Perubahan" : "Buat SSB"}
        </button>
      </form>

      {/* ══════ RIGHT: List ══════ */}
      <div className={glass}>
        {/* Header + Search */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Daftar Akun</p>
            <h2 className="text-lg font-extrabold text-blue-950">Admin SSB Terdaftar</h2>
          </div>
          <div className="relative w-full max-w-[260px]">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className={`${inputCls} pl-9`}
              placeholder="Cari admin, email, atau SSB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full text-left text-[0.82rem]">
            <thead>
              <tr className="border-b-2 border-blue-500/5">
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Admin SSB</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">SSB</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Periode</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">{searchQuery ? "Tidak ditemukan." : "Belum ada akun admin SSB."}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.map((account) => (
                <tr key={account.id} className="border-b border-blue-500/[0.04] transition hover:bg-blue-500/[0.025]">
                  <td className="px-3 py-3.5">
                    <p className="font-semibold text-slate-800">{account.name}</p>
                    <p className="mt-0.5 text-[0.72rem] text-slate-400">{account.email}</p>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{account.ssbName ?? "-"}</td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                      account.partnershipStatus === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {account.partnershipStatus ?? "N/A"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-slate-500">
                    {account.partnershipStartDate && account.partnershipEndDate
                      ? `${account.partnershipStartDate} — ${account.partnershipEndDate}`
                      : "-"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setViewingAccountId(account.id)} title="Detail" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/[0.07] text-blue-500 transition hover:bg-blue-500/15">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      <button type="button" onClick={() => startEdit(account)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/[0.06] text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                      </button>
                      <button type="button" onClick={() => handleDelete(account)} disabled={isDeletingId === account.id} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-500 transition hover:bg-red-500/10 disabled:opacity-50">
                        {isDeletingId === account.id ? (
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-500" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════ MODAL: Detail ══════ */}
      {viewingAccount && (
        <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6 backdrop-blur-sm" onClick={() => setViewingAccountId(null)}>
          <div className="anim-slide-up w-full max-w-lg overflow-hidden rounded-[22px] bg-white shadow-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button type="button" className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-slate-500 backdrop-blur-sm transition hover:bg-slate-100 hover:text-slate-800" onClick={() => setViewingAccountId(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Logo */}
            {(viewingAccount.logo || formState.currentLogo) && (
              <div className="relative h-40 w-full bg-gradient-to-br from-slate-100 to-blue-50">
                <Image src={viewingAccount.logo ?? formState.currentLogo} alt="Logo" fill className="object-contain p-6" sizes="520px" />
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-1.5 px-6 pt-5 pb-3">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Detail Akun</p>
              <h3 className="text-lg font-extrabold text-blue-950">{viewingAccount.ssbName ?? viewingAccount.name}</h3>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                viewingAccount.partnershipStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {viewingAccount.partnershipStatus ?? "BELUM DIATUR"}
              </span>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 max-sm:grid-cols-1">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Nama Admin</p>
                <p className="mt-0.5 text-[0.85rem] text-slate-800">{viewingAccount.name}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Email Admin</p>
                <p className="mt-0.5 text-[0.85rem] text-slate-800">{viewingAccount.email}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Nama SSB</p>
                <p className="mt-0.5 text-[0.85rem] text-slate-800">{viewingAccount.ssbName ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Nomor Kontak</p>
                <p className="mt-0.5 text-[0.85rem] text-slate-800">{viewingAccount.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Periode</p>
                <p className="mt-0.5 text-[0.85rem] text-slate-800">
                  {viewingAccount.partnershipStartDate && viewingAccount.partnershipEndDate ? `${viewingAccount.partnershipStartDate} — ${viewingAccount.partnershipEndDate}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Alamat</p>
                <p className="mt-0.5 text-[0.85rem] leading-relaxed text-slate-800">{viewingAccount.address ?? "-"}</p>
              </div>
            </div>

            {viewingAccount.partnershipNotes && (
              <div className="px-6 pb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Keterangan Partnership</p>
                <p className="mt-0.5 text-[0.85rem] leading-relaxed text-slate-800">{viewingAccount.partnershipNotes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 pb-6 pt-3">
              <button
                type="button"
                className="btn-shimmer flex-1 rounded-[14px] py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
                onClick={() => { startEdit(viewingAccount); setViewingAccountId(null); }}
              >
                Edit Data
              </button>
              <button
                type="button"
                className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/10"
                onClick={() => setViewingAccountId(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
