"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  coachName: "",
  coachEmail: "",
  coachPassword: "",
  startDate: today,
  endDate: nextYear,
  status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "EXPIRED",
  currentLogo: "",
};

const inputCls =
  "w-full rounded-md border border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-[#FF3B30]/40 focus:border-[#FF3B30] focus:bg-[#1E1E1E] focus:ring-[3px] focus:ring-[#FF3B30]/15";

const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/60";

const glass =
  "rounded-xl border border-white/10 bg-[#1E1E1E] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)]";

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

  const [deleteConfirm, setDeleteConfirm] = useState<SsbAdminAccount | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 3500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);
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
    setToast(null);
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
      coachName: "",
      coachEmail: "",
      coachPassword: "",
      startDate: account.partnershipStartDate ?? today,
      endDate: account.partnershipEndDate ?? nextYear,
      status: account.partnershipStatus ?? "ACTIVE",
      currentLogo: account.logo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);
    setIsSubmitting(true);

    const payload = new FormData();
    payload.set("ssbName", formState.ssbName);
    payload.set("address", formState.address);
    payload.set("phone", formState.phone);
    payload.set("partnershipNotes", formState.partnershipNotes);
    payload.set("adminName", formState.adminName);
    payload.set("adminEmail", formState.adminEmail);
    payload.set("adminPassword", formState.adminPassword);
    payload.set("coachName", formState.coachName);
    payload.set("coachEmail", formState.coachEmail);
    payload.set("coachPassword", formState.coachPassword);
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
      showToast("error", data.error ?? (isEditing ? "Gagal memperbarui akun Academy." : "Gagal membuat akun Academy."));
      setIsSubmitting(false);
      return;
    }

    showToast("success", isEditing ? "Data Academy berhasil diperbarui." : "Academy dan akun admin berhasil dibuat.");
    resetForm();
    setIsSubmitting(false);
    router.refresh();
  }

  function handleDelete(account: SsbAdminAccount) {
    setDeleteConfirm(account);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    const account = deleteConfirm;
    setDeleteConfirm(null);
    setToast(null);
    setIsDeletingId(account.id);

    const response = await fetch(`/api/admin/ssb/${account.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      showToast("error", data.error ?? "Gagal menghapus akun Academy.");
      setIsDeletingId(null);
      return;
    }

    if (editingAccountId === account.id) resetForm();
    showToast("success", "Data Academy berhasil dihapus.");
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
            <p className="section-kicker">
              {editingAccountId ? "Edit Academy" : "Tambah Academy"}
            </p>
            <h2 className="font-heading mt-2 text-xl font-bold uppercase tracking-wide text-white">
              {editingAccountId ? "Ubah Data Academy" : "Buat Academy Baru"}
            </h2>
          </div>
          {editingAccountId && (
            <button
              type="button"
              className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-[#FF3B30] transition hover:bg-[#FF3B30]/20"
              onClick={resetForm}
            >
              Batal
            </button>
          )}
        </div>

        {/* Feedback is handled by toast modal below */}

        {/* Section: SSB Info */}
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#FF3B30]/80">Informasi Academy</p>
        <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className={labelCls} htmlFor="ssb-name">Nama Academy</label>
            <input id="ssb-name" className={inputCls} placeholder="Masukkan nama Academy" value={formState.ssbName} onChange={updateField("ssbName")} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="ssb-phone">Nomor kontak</label>
            <input id="ssb-phone" className={inputCls} placeholder="08xxxxxxxxxx" value={formState.phone} onChange={updateField("phone")} />
          </div>
        </div>

        {/* Logo upload */}
        <div>
          <label className={labelCls} htmlFor="ssb-logo">Logo Academy</label>
          <div
            className="mt-1 cursor-pointer rounded-md border-2 border-dashed border-white/15 bg-[#161616] p-4 text-center transition hover:border-[#FF3B30] hover:bg-[#FF3B30]/5"
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
                <Image src={logoPreviewUrl ?? formState.currentLogo} alt="Preview" width={56} height={56} className="h-14 w-14 rounded-md border border-white/15 bg-[#0F0F0F] object-contain" />
                <div className="text-left">
                  <p className="text-[0.78rem] font-semibold text-white">{logoFile ? logoFile.name : "Logo tersimpan"}</p>
                  <p className="text-[0.65rem] text-white/40 uppercase tracking-wider mt-0.5">Klik untuk ganti</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2 text-white/30">
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
          <textarea id="ssb-address" className={`${inputCls} min-h-[68px] resize-y`} placeholder="Alamat lengkap Academy" value={formState.address} onChange={updateField("address")} />
        </div>

        <div>
          <label className={labelCls} htmlFor="partnership-notes">Keterangan partnership</label>
          <textarea id="partnership-notes" className={`${inputCls} min-h-[68px] resize-y`} placeholder="Catatan kerjasama..." value={formState.partnershipNotes} onChange={updateField("partnershipNotes")} />
        </div>

        {/* Section: Admin */}
        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#FF3B30]/80">Akun Admin</p>
        <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

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
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/30 transition hover:text-[#FF3B30]"
              onClick={() => setShowAdminPassword((c) => !c)}
            >
              {showAdminPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A9.77 9.77 0 0112 4.8c4.7 0 8.27 3.03 9.5 7.2a10.94 10.94 0 01-3.02 4.57M6.61 6.61C4.62 7.89 3.25 9.79 2.5 12c1.23 4.17 4.8 7.2 9.5 7.2 1.82 0 3.47-.46 4.9-1.26" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {editingAccountId && <p className="text-[0.68rem] text-white/30">Isi hanya jika ingin mengganti password.</p>}
        </div>

        {/* Section: Pelatih */}
        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#FF3B30]/80">Akun Pelatih</p>
        <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className={labelCls} htmlFor="coach-name">Nama pelatih</label>
            <input id="coach-name" className={inputCls} placeholder="Nama lengkap" value={formState.coachName} onChange={updateField("coachName")} />
          </div>
          <div>
            <label className={labelCls} htmlFor="coach-email">Email pelatih</label>
            <input id="coach-email" type="email" className={inputCls} placeholder="email@contoh.com" value={formState.coachEmail} onChange={updateField("coachEmail")} />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="coach-password">Password pelatih</label>
          <input id="coach-password" type="password" className={inputCls} placeholder={editingAccountId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} value={formState.coachPassword} onChange={updateField("coachPassword")} />
        </div>

        {/* Section: Partnership */}
        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#FF3B30]/80">Partnership</p>
        <div className="h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />

        <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
          <div className="min-w-0">
            <label className={labelCls} htmlFor="status">Status</label>
            <div className="relative">
              <select id="status" className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={formState.status} onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value as "ACTIVE" | "INACTIVE" | "EXPIRED" }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
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
          className="btn-shimmer mt-1 w-full rounded-md py-3 font-heading text-[0.95rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_16px_rgba(255,59,48,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,59,48,0.5)] disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : editingAccountId ? "Simpan Perubahan" : "Buat Academy"}
        </button>
      </form>

      {/* ══════ RIGHT: List ══════ */}
      <div className={glass}>
        {/* Header + Search */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Daftar Akun</p>
            <h2 className="font-heading mt-2 text-xl font-bold uppercase tracking-wide text-white">Admin Academy Terdaftar</h2>
          </div>
          <div className="relative w-full max-w-[260px]">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className={`${inputCls} pl-9`}
              placeholder="Cari admin, email, atau Academy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full text-left text-[0.82rem]">
            <thead>
              <tr className="border-b-2 border-[#FF3B30]/20">
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Admin Academy</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Academy</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Status</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Periode</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center gap-2 py-10 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">{searchQuery ? "Tidak ditemukan." : "Belum ada akun admin Academy."}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.map((account) => (
                <tr key={account.id} className="border-b border-white/5 transition hover:bg-[#FF3B30]/[0.06]">
                  <td className="px-3 py-3.5">
                    <p className="font-semibold text-white/90">{account.name}</p>
                    <p className="mt-0.5 text-[0.72rem] text-white/30">{account.email}</p>
                  </td>
                  <td className="px-3 py-3.5 text-white/60">{account.ssbName ?? "-"}</td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                      account.partnershipStatus === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {account.partnershipStatus ?? "N/A"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-white/50">
                    {account.partnershipStartDate && account.partnershipEndDate
                      ? `${account.partnershipStartDate} — ${account.partnershipEndDate}`
                      : "-"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setViewingAccountId(account.id)} title="Detail" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      <button type="button" onClick={() => startEdit(account)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white border border-white/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z" /></svg>
                      </button>
                      <button type="button" onClick={() => handleDelete(account)} disabled={isDeletingId === account.id} title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 disabled:opacity-50">
                        {isDeletingId === account.id ? (
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FF3B30]/30 border-t-[#FF3B30]" />
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
        <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md" onClick={() => setViewingAccountId(null)}>
          <div className="anim-slide-up w-full max-w-lg overflow-hidden rounded-xl bg-[#1E1E1E] border border-white/10 shadow-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button type="button" className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-[#2A2A2A] text-white/60 transition hover:bg-[#FF3B30]/20 hover:text-[#FF3B30]" onClick={() => setViewingAccountId(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Logo */}
            {(viewingAccount.logo || formState.currentLogo) && (
              <div className="relative h-40 w-full bg-gradient-to-br from-[#0F0F0F] to-[#1E1E1E] border-b border-white/5">
                <Image src={viewingAccount.logo ?? formState.currentLogo} alt="Logo" fill className="object-contain p-6" sizes="520px" />
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-1.5 px-6 pt-5 pb-3">
              <p className="section-kicker">Detail Akun</p>
              <h3 className="text-lg font-extrabold text-white">{viewingAccount.ssbName ?? viewingAccount.name}</h3>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                viewingAccount.partnershipStatus === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {viewingAccount.partnershipStatus ?? "BELUM DIATUR"}
              </span>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 max-sm:grid-cols-1">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nama Admin</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.name}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Email Admin</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.email}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nama Pelatih</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.coachName ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Email Pelatih</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.coachEmail ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nama Academy</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.ssbName ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Nomor Kontak</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">{viewingAccount.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Periode</p>
                <p className="mt-0.5 text-[0.85rem] text-white/90">
                  {viewingAccount.partnershipStartDate && viewingAccount.partnershipEndDate ? `${viewingAccount.partnershipStartDate} — ${viewingAccount.partnershipEndDate}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Alamat</p>
                <p className="mt-0.5 text-[0.85rem] leading-relaxed text-white/90">{viewingAccount.address ?? "-"}</p>
              </div>
            </div>

            {viewingAccount.partnershipNotes && (
              <div className="px-6 pb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/30">Keterangan Partnership</p>
                <p className="mt-0.5 text-[0.85rem] leading-relaxed text-white/90">{viewingAccount.partnershipNotes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 pb-6 pt-3">
              <button
                type="button"
                className="btn-shimmer flex-1 rounded-md py-2.5 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,59,48,0.35)] transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
                onClick={() => { startEdit(viewingAccount); setViewingAccountId(null); }}
              >
                Edit Data
              </button>
              <button
                type="button"
                className="rounded-md border border-white/15 bg-[#2A2A2A] px-4 py-2.5 font-heading text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-[#353535]"
                onClick={() => setViewingAccountId(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
              <h3 className="confirm-title font-heading text-xl font-bold uppercase tracking-wide text-white">Hapus Academy?</h3>
              <p className="confirm-desc text-[0.85rem] leading-relaxed text-white/60">
                Hapus <span className="font-bold text-white">{deleteConfirm.ssbName ?? deleteConfirm.name}</span> beserta akun admin-nya? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="confirm-buttons flex gap-3 px-6 pt-4 pb-6">
              <button type="button" className="flex-1 rounded-md border border-white/15 bg-[#2A2A2A] px-4 py-2.5 font-heading text-[0.82rem] font-bold uppercase tracking-wider text-white/70 transition-all duration-200 hover:bg-[#353535] active:scale-95" onClick={() => setDeleteConfirm(null)}>
                Batal
              </button>
              <button type="button" className="confirm-btn-yes flex-1 rounded-md bg-[#FF3B30] px-4 py-2.5 font-heading text-[0.82rem] font-bold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(255,59,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95" onClick={confirmDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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
              <h3 className="toast-title font-heading text-xl font-bold uppercase tracking-wide text-white">
                {toast.type === "success" ? "Berhasil" : "Gagal"}
              </h3>
              <p className="toast-desc text-[0.85rem] leading-relaxed text-white/60">{toast.message}</p>
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
    </section>
  );
}
