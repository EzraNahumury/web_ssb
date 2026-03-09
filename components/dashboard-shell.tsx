"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardSummary, Participant, Partnership, SsbProfile } from "@/lib/data";

type DashboardShellProps = {
  user: {
    name: string;
    role: "AYRES_ADMIN" | "SSB_ADMIN";
  };
  profile: SsbProfile;
  partnership: Partnership | null;
  summary: DashboardSummary;
  participants: Participant[];
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
  id: null,
  name: "",
  nickname: "",
  birth_date: "",
  position: "",
  jersey_size: "",
  parent_name: "",
  parent_phone: "",
  address: "",
  join_date: "",
  status: "ACTIVE",
  notes: "",
};

export function DashboardShell({
  user,
  profile,
  partnership,
  summary,
  participants,
}: DashboardShellProps) {
  const router = useRouter();
  const [profileState, setProfileState] = useState({
    name: profile.name,
    logo: profile.logo ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    partnership_notes: profile.partnership_notes ?? "",
  });
  const [participantState, setParticipantState] =
    useState<ParticipantFormState>(emptyParticipant);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);

  const activeUntilLabel = useMemo(() => {
    if (!partnership) {
      return "Belum ada data partnership";
    }

    return `${partnership.start_date} sampai ${partnership.end_date}`;
  }, [partnership]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    setIsSavingProfile(true);

    const response = await fetch("/api/ssb/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileState),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Gagal menyimpan profil.");
      setIsSavingProfile(false);
      return;
    }

    setFeedback("Profil SSB berhasil diperbarui.");
    setIsSavingProfile(false);
    router.refresh();
  }

  function startEditParticipant(participant: Participant) {
    setParticipantState({
      id: participant.id,
      name: participant.name,
      nickname: participant.nickname ?? "",
      birth_date: participant.birth_date ?? "",
      position: participant.position ?? "",
      jersey_size: participant.jersey_size ?? "",
      parent_name: participant.parent_name ?? "",
      parent_phone: participant.parent_phone ?? "",
      address: participant.address ?? "",
      join_date: participant.join_date ?? "",
      status: participant.status,
      notes: participant.notes ?? "",
    });
    setFeedback("");
    setError("");
  }

  async function saveParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    setIsSavingParticipant(true);

    const isEditing = Boolean(participantState.id);
    const endpoint = isEditing
      ? `/api/participants/${participantState.id}`
      : "/api/participants";
    const method = isEditing ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participantState),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Gagal menyimpan peserta.");
      setIsSavingParticipant(false);
      return;
    }

    setFeedback(
      isEditing ? "Data peserta berhasil diperbarui." : "Peserta baru berhasil ditambahkan.",
    );
    setParticipantState(emptyParticipant);
    setIsSavingParticipant(false);
    router.refresh();
  }

  async function removeParticipant(id: number) {
    const confirmed = window.confirm("Hapus peserta ini?");
    if (!confirmed) {
      return;
    }

    setError("");
    setFeedback("");

    const response = await fetch(`/api/participants/${id}`, {
      method: "DELETE",
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Gagal menghapus peserta.");
      return;
    }

    if (participantState.id === id) {
      setParticipantState(emptyParticipant);
    }

    setFeedback("Peserta berhasil dihapus.");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(190,24,93,0.18),_transparent_28%),linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_40%,_#ecfeff_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="panel overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5">
              <span className="badge">Dashboard SSB Partner Ayres Apparel</span>
              <div className="space-y-3">
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">
                  {profile.name}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  Kelola profil SSB, pantau peserta aktif, dan simpan data ukuran jersey
                  dalam satu dashboard yang ringan dan rapi.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[28px] bg-slate-950 p-6 text-slate-50">
              <div>
                <p className="text-sm text-slate-300">Login sebagai</p>
                <p className="font-heading text-2xl">{user.name}</p>
                <p className="text-sm text-slate-400">{user.role}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Masa aktif partnership
                </p>
                <p className="mt-2 text-sm text-slate-100">{activeUntilLabel}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Status: {partnership?.status ?? "BELUM DIATUR"}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {profile.partnership_notes ?? "Belum ada keterangan partnership."}
                </p>
              </div>
              <button type="button" className="button-secondary" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="stat-card">
            <p className="stat-label">Total peserta</p>
            <p className="stat-value">{summary.totalParticipants}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Peserta aktif</p>
            <p className="stat-value">{summary.activeParticipants}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Peserta nonaktif</p>
            <p className="stat-value">{summary.inactiveParticipants}</p>
          </article>
        </section>

        {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={saveProfile} className="panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Profil SSB</p>
                <h2 className="font-heading text-2xl text-slate-950">Data utama klub</h2>
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="ssb-name">
                Nama SSB
              </label>
              <input
                id="ssb-name"
                className="input"
                value={profileState.name}
                onChange={(event) =>
                  setProfileState((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="ssb-logo">
                URL logo
              </label>
              <input
                id="ssb-logo"
                className="input"
                value={profileState.logo}
                onChange={(event) =>
                  setProfileState((current) => ({ ...current, logo: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="ssb-phone">
                Nomor kontak
              </label>
              <input
                id="ssb-phone"
                className="input"
                value={profileState.phone}
                onChange={(event) =>
                  setProfileState((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="ssb-address">
                Alamat
              </label>
              <textarea
                id="ssb-address"
                className="input min-h-28 resize-y"
                value={profileState.address}
                onChange={(event) =>
                  setProfileState((current) => ({ ...current, address: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="ssb-partnership-notes">
                Keterangan partnership
              </label>
              <textarea
                id="ssb-partnership-notes"
                className="input min-h-28 resize-y"
                value={profileState.partnership_notes}
                onChange={(event) =>
                  setProfileState((current) => ({
                    ...current,
                    partnership_notes: event.target.value,
                  }))
                }
              />
            </div>

            <button type="submit" className="button-primary" disabled={isSavingProfile}>
              {isSavingProfile ? "Menyimpan..." : "Simpan profil"}
            </button>
          </form>

          <div className="panel space-y-4">
            <div>
              <p className="section-kicker">Peserta terbaru</p>
              <h2 className="font-heading text-2xl text-slate-950">Ringkasan aktivitas</h2>
            </div>

            <div className="space-y-3">
              {summary.latestParticipants.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada data peserta.</p>
              ) : (
                summary.latestParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{participant.name}</p>
                      <p className="text-sm text-slate-500">
                        {participant.position ?? "Posisi belum diisi"} • Jersey{" "}
                        {participant.jersey_size ?? "-"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        participant.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {participant.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <form onSubmit={saveParticipant} className="panel space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Form peserta</p>
                <h2 className="font-heading text-2xl text-slate-950">
                  {participantState.id ? "Edit peserta" : "Tambah peserta baru"}
                </h2>
              </div>
              {participantState.id ? (
                <button
                  type="button"
                  className="button-ghost"
                  onClick={() => setParticipantState(emptyParticipant)}
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="field-label">Nama lengkap</label>
                <input
                  className="input"
                  value={participantState.name}
                  onChange={(event) =>
                    setParticipantState((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Nama panggilan</label>
                <input
                  className="input"
                  value={participantState.nickname}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      nickname: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Tanggal lahir</label>
                <input
                  type="date"
                  className="input"
                  value={participantState.birth_date}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      birth_date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Tanggal bergabung</label>
                <input
                  type="date"
                  className="input"
                  value={participantState.join_date}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      join_date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Posisi bermain</label>
                <input
                  className="input"
                  value={participantState.position}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      position: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Ukuran jersey</label>
                <input
                  className="input"
                  value={participantState.jersey_size}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      jersey_size: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Nama orang tua / wali</label>
                <input
                  className="input"
                  value={participantState.parent_name}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      parent_name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Nomor HP orang tua / wali</label>
                <input
                  className="input"
                  value={participantState.parent_phone}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      parent_phone: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <label className="field-label">Alamat</label>
                <textarea
                  className="input min-h-24 resize-y"
                  value={participantState.address}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="field-label">Status</label>
                <select
                  className="input"
                  value={participantState.status}
                  onChange={(event) =>
                    setParticipantState((current) => ({
                      ...current,
                      status: event.target.value as "ACTIVE" | "INACTIVE",
                    }))
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label">Catatan</label>
              <textarea
                className="input min-h-28 resize-y"
                value={participantState.notes}
                onChange={(event) =>
                  setParticipantState((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>

            <button type="submit" className="button-primary" disabled={isSavingParticipant}>
              {isSavingParticipant
                ? "Menyimpan..."
                : participantState.id
                  ? "Perbarui peserta"
                  : "Tambah peserta"}
            </button>
          </form>

          <div className="panel space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Daftar peserta</p>
                <h2 className="font-heading text-2xl text-slate-950">
                  {participants.length} peserta terdata
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Nama</th>
                    <th className="px-3 py-3 font-medium">Posisi</th>
                    <th className="px-3 py-3 font-medium">Jersey</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        Belum ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-slate-100">
                        <td className="px-3 py-4">
                          <p className="font-medium text-slate-900">{participant.name}</p>
                          <p className="text-xs text-slate-500">
                            {participant.parent_name ?? "Orang tua belum diisi"}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          {participant.position ?? "-"}
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          {participant.jersey_size ?? "-"}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              participant.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="button-ghost"
                              onClick={() => startEditParticipant(participant)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="button-danger"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              Hapus
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
      </div>
    </div>
  );
}
