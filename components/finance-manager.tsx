"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BillingConfig, Participant, PaymentWithParticipant, FinanceSummary } from "@/lib/data";

type FinanceManagerProps = {
  participants: Participant[];
  billingConfig: BillingConfig | null;
};

type BillingType = "MONTHLY" | "DEPOSIT_SESSION" | "MONTHLY_SESSION";

const inputCls =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-500/10";

const labelCls = "block text-[0.72rem] font-bold text-slate-600";

const glass = "rounded-[22px] border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-2xl";

const billingLabels: Record<BillingType, string> = {
  MONTHLY: "Bulanan",
  DEPOSIT_SESSION: "Deposit + Per Sesi",
  MONTHLY_SESSION: "Bulanan + Per Sesi",
};

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function formatThousands(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseThousands(formatted: string) {
  return formatted.replace(/\./g, "");
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function FinanceManager({ participants, billingConfig }: FinanceManagerProps) {
  const router = useRouter();

  // Billing config state
  const [billingType, setBillingType] = useState<BillingType>(billingConfig?.billing_type ?? "MONTHLY");
  const [monthlyFee, setMonthlyFee] = useState(billingConfig?.monthly_fee ? formatThousands(billingConfig.monthly_fee.toString()) : "");
  const [depositFee, setDepositFee] = useState(billingConfig?.deposit_fee ? formatThousands(billingConfig.deposit_fee.toString()) : "");
  const [sessionFee, setSessionFee] = useState(billingConfig?.session_fee ? formatThousands(billingConfig.session_fee.toString()) : "");
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  // Payment list state
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [payments, setPayments] = useState<PaymentWithParticipant[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({ totalUnpaid: 0, totalPaid: 0, unpaidCount: 0, paidCount: 0 });
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);

  // Session payment state
  const [sessionParticipantId, setSessionParticipantId] = useState("");
  const [sessionAmount, setSessionAmount] = useState(billingConfig?.session_fee ? formatThousands(billingConfig.session_fee.toString()) : "");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Filter
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "MONTHLY" | "DEPOSIT" | "SESSION">(
    billingConfig?.billing_type === "DEPOSIT_SESSION" ? "DEPOSIT" :
    billingConfig?.billing_type === "MONTHLY" ? "MONTHLY" :
    billingConfig?.billing_type === "MONTHLY_SESSION" ? "MONTHLY" : "ALL"
  );

  // Feedback
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const activeParticipants = participants.filter((p) => p.status === "ACTIVE");
  const hasSessionBilling = billingType === "DEPOSIT_SESSION" || billingType === "MONTHLY_SESSION";
  const filteredPayments = paymentFilter === "ALL" ? payments : payments.filter((p) => p.payment_type === paymentFilter);

  // Fetch payments when month changes
  useEffect(() => {
    if (billingConfig) fetchPayments();
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPayments() {
    setIsLoadingPayments(true);
    try {
      const res = await fetch(`/api/ssb/payments?month=${selectedMonth}`);
      const data = await res.json();
      if (res.ok) {
        setPayments(data.data ?? []);
        setSummary(data.summary ?? { totalUnpaid: 0, totalPaid: 0, unpaidCount: 0, paidCount: 0 });
      }
    } finally {
      setIsLoadingPayments(false);
    }
  }

  async function saveBillingConfig() {
    setError(""); setFeedback(""); setIsSavingBilling(true);

    const body = {
      billing_type: billingType,
      monthly_fee: monthlyFee ? Number(parseThousands(monthlyFee)) : null,
      deposit_fee: depositFee ? Number(parseThousands(depositFee)) : null,
      session_fee: sessionFee ? Number(parseThousands(sessionFee)) : null,
    };

    const res = await fetch("/api/ssb/billing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal menyimpan pengaturan biaya.");
    } else {
      setFeedback("Pengaturan biaya berhasil disimpan.");
      router.refresh();
      fetchPayments();
    }
    setIsSavingBilling(false);
  }

  async function handleMarkPaid(paymentId: number, participantName: string, amount: number) {
    if (!window.confirm(`Tandai lunas pembayaran ${formatRupiah(Number(amount))} untuk ${participantName}?`)) return;

    setMarkingPaidId(paymentId);
    const res = await fetch(`/api/ssb/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: null }),
    });

    if (res.ok) {
      fetchPayments();
    }
    setMarkingPaidId(null);
  }

  async function handleCreateSessionPayment() {
    setError(""); setFeedback(""); setIsSavingSession(true);

    const body = {
      participant_id: Number(sessionParticipantId),
      amount: Number(parseThousands(sessionAmount)),
      notes: sessionNotes || null,
    };

    const res = await fetch("/api/ssb/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal mencatat pembayaran sesi.");
    } else {
      setFeedback("Pembayaran sesi berhasil dicatat.");
      setSessionParticipantId("");
      setSessionNotes("");
      fetchPayments();
    }
    setIsSavingSession(false);
  }

  return (
    <div className="flex flex-col gap-4">
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

      {/* Summary Cards */}
      {billingConfig && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.totalUnpaid + summary.totalPaid)}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Tagihan</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/10 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.totalUnpaid)}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Belum Dibayar ({summary.unpaidCount})</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.totalPaid)}</p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Sudah Dibayar ({summary.paidCount})</p>
            </div>
          </div>
        </section>
      )}

      {/* Config + Payment Table */}
      <section className="grid gap-5 xl:grid-cols-[340px_1fr]">
        {/* Left: Billing Config */}
        <div className={`${glass} flex flex-col gap-3.5`}>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Pengaturan</p>
            <h2 className="text-lg font-extrabold text-blue-950">Tipe Biaya</h2>
          </div>

          <div>
            <label className={labelCls}>Mekanisme pembayaran</label>
            <div className="relative">
              <select
                className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                value={billingType}
                onChange={(e) => setBillingType(e.target.value as BillingType)}
              >
                <option value="MONTHLY">Bulanan</option>
                <option value="DEPOSIT_SESSION">Deposit + Per Sesi Latihan</option>
                <option value="MONTHLY_SESSION">Bulanan + Per Sesi Latihan</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/10 bg-blue-50/40 px-3.5 py-2.5 text-[0.72rem] text-slate-600">
            {billingType === "MONTHLY" && "Peserta bayar 1x per bulan. Tidak ada biaya latihan tambahan."}
            {billingType === "DEPOSIT_SESSION" && "Peserta bayar uang muka di awal, lalu bayar setiap datang latihan."}
            {billingType === "MONTHLY_SESSION" && "Peserta bayar iuran bulanan, plus bayar setiap datang latihan."}
          </div>

          {(billingType === "MONTHLY" || billingType === "MONTHLY_SESSION") && (
            <div>
              <label className={labelCls}>Biaya bulanan (Rp)</label>
              <input
                className={inputCls}
                placeholder="Contoh: 200.000"
                inputMode="numeric"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(formatThousands(e.target.value))}
              />
            </div>
          )}

          {billingType === "DEPOSIT_SESSION" && (
            <div>
              <label className={labelCls}>Biaya deposit / uang muka (Rp)</label>
              <input
                className={inputCls}
                placeholder="Contoh: 500.000"
                inputMode="numeric"
                value={depositFee}
                onChange={(e) => setDepositFee(formatThousands(e.target.value))}
              />
            </div>
          )}

          {(billingType === "DEPOSIT_SESSION" || billingType === "MONTHLY_SESSION") && (
            <div>
              <label className={labelCls}>Biaya per sesi latihan (Rp)</label>
              <input
                className={inputCls}
                placeholder="Contoh: 50.000"
                inputMode="numeric"
                value={sessionFee}
                onChange={(e) => setSessionFee(formatThousands(e.target.value))}
              />
            </div>
          )}

          <button
            type="button"
            className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
            disabled={isSavingBilling}
            onClick={saveBillingConfig}
          >
            {isSavingBilling ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>

          {billingConfig && (
            <div className="mt-1 rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Konfigurasi aktif</p>
              <p className="mt-1 text-[0.82rem] font-semibold text-slate-700">{billingLabels[billingConfig.billing_type]}</p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[0.72rem] text-slate-500">
                {billingConfig.monthly_fee != null && billingConfig.monthly_fee > 0 && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-600">Bulanan: {formatRupiah(Number(billingConfig.monthly_fee))}</span>
                )}
                {billingConfig.deposit_fee != null && billingConfig.deposit_fee > 0 && (
                  <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-600">Deposit: {formatRupiah(Number(billingConfig.deposit_fee))}</span>
                )}
                {billingConfig.session_fee != null && billingConfig.session_fee > 0 && (
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-teal-600">Sesi: {formatRupiah(Number(billingConfig.session_fee))}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Payment Table */}
        <div className={glass}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Tagihan & Pembayaran</p>
              <h2 className="text-lg font-extrabold text-blue-950">Daftar Tagihan</h2>
            </div>
            <div>
              <label className={labelCls}>Bulan</label>
              <input
                type="month"
                className={`${inputCls} w-[180px]`}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Sub-tabs */}
          {billingConfig && (
            <div className="mb-4 flex gap-1 rounded-xl bg-slate-100/70 p-1">
              {(billingType === "MONTHLY" || billingType === "MONTHLY_SESSION") && (
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${paymentFilter === "MONTHLY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setPaymentFilter("MONTHLY")}
                >
                  Bulanan
                </button>
              )}
              {billingType === "DEPOSIT_SESSION" && (
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${paymentFilter === "DEPOSIT" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setPaymentFilter("DEPOSIT")}
                >
                  Deposit
                </button>
              )}
              {hasSessionBilling && (
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${paymentFilter === "SESSION" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setPaymentFilter("SESSION")}
                >
                  Sesi
                </button>
              )}
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${paymentFilter === "ALL" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                onClick={() => setPaymentFilter("ALL")}
              >
                Semua
              </button>
            </div>
          )}

          {!billingConfig ? (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <p className="text-sm">Atur tipe biaya terlebih dahulu untuk melihat tagihan.</p>
            </div>
          ) : isLoadingPayments ? (
            <div className="flex items-center justify-center py-10">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            </div>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b-2 border-blue-500/5">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Peserta</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Tipe</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Jumlah</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                          <p className="text-sm">Belum ada tagihan untuk kategori ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayments.map((pay) => (
                    <tr key={pay.id} className="border-b border-blue-500/[0.04] transition hover:bg-blue-500/[0.025]">
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-slate-800">{pay.participant_name}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          pay.payment_type === "MONTHLY" ? "bg-blue-500/10 text-blue-600" :
                          pay.payment_type === "DEPOSIT" ? "bg-violet-500/10 text-violet-600" :
                          "bg-teal-500/10 text-teal-600"
                        }`}>
                          {pay.payment_type === "MONTHLY" ? "Bulanan" : pay.payment_type === "DEPOSIT" ? "Deposit" : "Sesi"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-slate-700">
                        {formatRupiah(Number(pay.amount))}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          pay.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {pay.status === "PAID" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {pay.status === "UNPAID" ? (
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[0.72rem] font-semibold text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50"
                            disabled={markingPaidId === pay.id}
                            onClick={() => handleMarkPaid(pay.id, pay.participant_name, pay.amount)}
                          >
                            {markingPaidId === pay.id ? (
                              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
                            ) : "Tandai Lunas"}
                          </button>
                        ) : (
                          <span className="text-[0.72rem] text-slate-400">
                            {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString("id-ID") : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Session Payment Form */}
      {billingConfig && hasSessionBilling && (
        <section className={`${glass} max-w-[600px]`}>
          <div className="mb-4">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Pembayaran Sesi</p>
            <h2 className="text-lg font-extrabold text-blue-950">Catat Pembayaran Latihan</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <div>
              <label className={labelCls}>Peserta</label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  value={sessionParticipantId}
                  onChange={(e) => setSessionParticipantId(e.target.value)}
                >
                  <option value="">Pilih peserta</option>
                  {activeParticipants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div>
              <label className={labelCls}>Jumlah (Rp)</label>
              <input
                className={inputCls}
                placeholder="Contoh: 50.000"
                inputMode="numeric"
                value={sessionAmount}
                onChange={(e) => setSessionAmount(formatThousands(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className={labelCls}>Catatan (opsional)</label>
            <input
              className={inputCls}
              placeholder="Catatan pembayaran..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-shimmer mt-4 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
            disabled={isSavingSession || !sessionParticipantId || !sessionAmount}
            onClick={handleCreateSessionPayment}
          >
            {isSavingSession ? "Menyimpan..." : "Catat Pembayaran Sesi"}
          </button>
        </section>
      )}
    </div>
  );
}
