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
  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const filteredAccounts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return accounts;
    }

    return accounts.filter((account) =>
      [account.name, account.email, account.ssbName ?? ""].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [accounts, searchQuery]);

  const viewingAccount = useMemo(
    () => accounts.find((account) => account.id === viewingAccountId) ?? null,
    [accounts, viewingAccountId],
  );

  function resetForm() {
    setEditingAccountId(null);
    setFormState(initialState);
    setLogoFile(null);
    setShowAdminPassword(false);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  function startEdit(account: SsbAdminAccount) {
    setEditingAccountId(account.id);
    setViewingAccountId(account.id);
    setError("");
    setFeedback("");
    setLogoFile(null);
    setShowAdminPassword(false);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
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

    if (logoFile) {
      payload.set("logo", logoFile);
    }

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
    const confirmed = window.confirm(`Hapus SSB "${account.ssbName ?? account.name}" beserta akun admin-nya?`);
    if (!confirmed) {
      return;
    }

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

    if (editingAccountId === account.id) {
      resetForm();
    }

    setFeedback("Data SSB berhasil dihapus.");
    setIsDeletingId(null);
    router.refresh();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="panel space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">{editingAccountId ? "Edit SSB" : "Tambah SSB"}</p>
            <h2 className="font-heading text-2xl text-slate-950">
              {editingAccountId ? "Ubah data SSB dan admin login" : "Buat SSB dan admin login"}
            </h2>
          </div>
          {editingAccountId ? (
            <button type="button" className="button-ghost" onClick={resetForm}>
              Batal edit
            </button>
          ) : null}
        </div>

        {feedback ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {feedback}
          </div>
        ) : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="field-label" htmlFor="ssb-name">
              Nama SSB
            </label>
            <input
              id="ssb-name"
              className="input"
              value={formState.ssbName}
              onChange={(event) =>
                setFormState((current) => ({ ...current, ssbName: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="ssb-phone">
              Nomor kontak
            </label>
            <input
              id="ssb-phone"
              className="input"
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="field-label" htmlFor="ssb-logo">
              File logo
            </label>
            <input
              ref={logoInputRef}
              id="ssb-logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="input file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-500">
              Format: JPG, PNG, atau WEBP. Ukuran maksimal 2 MB.
            </p>
            {logoFile ? <p className="text-xs text-slate-500">File dipilih: {logoFile.name}</p> : null}
            {!logoFile && formState.currentLogo ? (
              <p className="text-xs text-slate-500">Logo saat ini tersimpan.</p>
            ) : null}
            {logoPreviewUrl || formState.currentLogo ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Preview logo
                </p>
                <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={logoPreviewUrl ?? formState.currentLogo}
                    alt="Preview logo SSB"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="field-label" htmlFor="ssb-address">
              Alamat
            </label>
            <textarea
              id="ssb-address"
              className="input min-h-24 resize-y"
              value={formState.address}
              onChange={(event) =>
                setFormState((current) => ({ ...current, address: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="field-label" htmlFor="partnership-notes">
              Keterangan partnership
            </label>
            <textarea
              id="partnership-notes"
              className="input min-h-24 resize-y"
              value={formState.partnershipNotes}
              onChange={(event) =>
                setFormState((current) => ({ ...current, partnershipNotes: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="field-label" htmlFor="admin-name">
              Nama admin SSB
            </label>
            <input
              id="admin-name"
              className="input"
              value={formState.adminName}
              onChange={(event) =>
                setFormState((current) => ({ ...current, adminName: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="admin-email">
              Email admin SSB
            </label>
            <input
              id="admin-email"
              type="email"
              className="input"
              value={formState.adminEmail}
              onChange={(event) =>
                setFormState((current) => ({ ...current, adminEmail: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="admin-password">
              Password admin SSB
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showAdminPassword ? "text" : "password"}
                className="input pr-12"
                value={formState.adminPassword}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, adminPassword: event.target.value }))
                }
                placeholder={editingAccountId ? "Kosongkan jika tidak diubah" : ""}
                required={!editingAccountId}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-800"
                onClick={() => setShowAdminPassword((current) => !current)}
                aria-label={showAdminPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showAdminPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.09A9.77 9.77 0 0112 4.8c4.7 0 8.27 3.03 9.5 7.2a10.94 10.94 0 01-3.02 4.57M6.61 6.61C4.62 7.89 3.25 9.79 2.5 12c1.23 4.17 4.8 7.2 9.5 7.2 1.82 0 3.47-.46 4.9-1.26"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {editingAccountId ? (
              <p className="text-xs text-slate-500">
                Password lama tidak bisa ditampilkan. Isi field ini hanya jika ingin mengganti password.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="status">
              Status akses
            </label>
            <select
              id="status"
              className="input"
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as "ACTIVE" | "INACTIVE" | "EXPIRED",
                }))
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="start-date">
              Tanggal mulai
            </label>
            <input
              id="start-date"
              type="date"
              className="input"
              value={formState.startDate}
              onChange={(event) =>
                setFormState((current) => ({ ...current, startDate: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="field-label" htmlFor="end-date">
              Tanggal akhir
            </label>
            <input
              id="end-date"
              type="date"
              className="input"
              value={formState.endDate}
              onChange={(event) =>
                setFormState((current) => ({ ...current, endDate: event.target.value }))
              }
              required
            />
          </div>
        </div>

        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : editingAccountId ? "Update SSB" : "Buat SSB"}
        </button>
      </form>

      <div className="panel">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Daftar akun</p>
            <h2 className="font-heading text-2xl text-slate-950">Admin SSB terdaftar</h2>
          </div>
          <div className="w-full md:max-w-xs">
            <label className="field-label" htmlFor="search-admin-ssb">
              Search
            </label>
            <input
              id="search-admin-ssb"
              className="input"
              placeholder="Cari admin, email, atau SSB"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3 font-medium">Admin SSB</th>
                <th className="px-3 py-3 font-medium">SSB</th>
                <th className="px-3 py-3 font-medium">Status akses</th>
                <th className="px-3 py-3 font-medium">Periode</th>
                <th className="px-3 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    {searchQuery ? "Data yang dicari tidak ditemukan." : "Belum ada akun admin SSB."}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-100">
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.email}</p>
                    </td>
                    <td className="px-3 py-4 text-slate-600">{account.ssbName ?? "-"}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          account.partnershipStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {account.partnershipStatus ?? "BELUM DIATUR"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {account.partnershipStartDate && account.partnershipEndDate
                        ? `${account.partnershipStartDate} sampai ${account.partnershipEndDate}`
                        : "-"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800"
                          onClick={() => setViewingAccountId(account.id)}
                          aria-label={`Lihat detail ${account.ssbName ?? account.name}`}
                          title="Lihat detail"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            className="h-[18px] w-[18px]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.46 12C3.73 7.94 7.28 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-4.82 7-9.54 7S3.73 16.06 2.46 12z"
                            />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          onClick={() => startEdit(account)}
                          aria-label={`Edit ${account.ssbName ?? account.name}`}
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            className="h-[18px] w-[18px]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.06 4.94l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.63-1.63a1.5 1.5 0 00-2.12 0l-1.65 1.65z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-60"
                          onClick={() => handleDelete(account)}
                          disabled={isDeletingId === account.id}
                          aria-label={`Hapus ${account.ssbName ?? account.name}`}
                          title="Hapus"
                        >
                          {isDeletingId === account.id ? (
                            "..."
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              className="h-[18px] w-[18px]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 7h16"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 11v6M14 11v6"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {viewingAccount ? (
          <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Detail akun</p>
                <h3 className="font-heading text-xl text-slate-950">
                  {viewingAccount.ssbName ?? viewingAccount.name}
                </h3>
              </div>
              <button
                type="button"
                className="button-ghost"
                onClick={() => setViewingAccountId(null)}
              >
                Tutup
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {(viewingAccount.logo || formState.currentLogo) && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50">
                      <Image
                        src={viewingAccount.logo ?? formState.currentLogo}
                        alt={`Logo ${viewingAccount.ssbName ?? viewingAccount.name}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 360px"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nama admin</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingAccount.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email admin</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingAccount.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nama SSB</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingAccount.ssbName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nomor kontak</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingAccount.phone ?? "-"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status akses</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {viewingAccount.partnershipStatus ?? "BELUM DIATUR"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Periode</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {viewingAccount.partnershipStartDate && viewingAccount.partnershipEndDate
                      ? `${viewingAccount.partnershipStartDate} sampai ${viewingAccount.partnershipEndDate}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Alamat</p>
                  <p className="mt-1 text-sm leading-6 text-slate-900">{viewingAccount.address ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Keterangan partnership</p>
                  <p className="mt-1 text-sm leading-6 text-slate-900">
                    {viewingAccount.partnershipNotes ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
