"use client";

import { FormEvent, useRef, useState } from "react";
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
  const [formState, setFormState] = useState(initialState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  function resetForm() {
    setEditingAccountId(null);
    setFormState(initialState);
    setLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  function startEdit(account: SsbAdminAccount) {
    setEditingAccountId(account.id);
    setError("");
    setFeedback("");
    setLogoFile(null);
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
            <input
              id="admin-password"
              type="password"
              className="input"
              value={formState.adminPassword}
              onChange={(event) =>
                setFormState((current) => ({ ...current, adminPassword: event.target.value }))
              }
              placeholder={editingAccountId ? "Kosongkan jika tidak diubah" : ""}
              required={!editingAccountId}
            />
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
        <div className="mb-4">
          <p className="section-kicker">Daftar akun</p>
          <h2 className="font-heading text-2xl text-slate-950">Admin SSB terdaftar</h2>
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
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    Belum ada akun admin SSB.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
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
                        <button type="button" className="button-ghost" onClick={() => startEdit(account)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => handleDelete(account)}
                          disabled={isDeletingId === account.id}
                        >
                          {isDeletingId === account.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
