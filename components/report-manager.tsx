"use client";

import { useCallback, useEffect, useState } from "react";
import type { Transaction, ReportSummary } from "@/lib/data";

const inputCls =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-500/10";

const labelCls = "block text-[0.72rem] font-bold text-slate-600";

const glass = "rounded-[22px] border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-2xl";

function formatRupiah(amount: number) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
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

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ReportManager() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({ systemIncome: 0, manualIncome: 0, totalIncome: 0, totalExpense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Form
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(todayDate());
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

  useEffect(() => { fetchData(); }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ssb/transactions?month=${selectedMonth}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.data ?? []);
        setSummary(data.summary ?? { systemIncome: 0, manualIncome: 0, totalIncome: 0, totalExpense: 0, balance: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const res = await fetch("/api/ssb/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: txType,
        description: txDesc,
        amount: Number(parseThousands(txAmount)),
        transaction_date: txDate,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("error", data.error ?? "Gagal menyimpan transaksi.");
    } else {
      showToast("success", "Transaksi berhasil dicatat.");
      setTxDesc(""); setTxAmount(""); setTxDate(todayDate());
      fetchData();
    }
    setIsSaving(false);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Hapus transaksi ini?")) return;
    const res = await fetch(`/api/ssb/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchData();
      showToast("success", "Transaksi berhasil dihapus.");
    }
  }

  const filtered = filter === "ALL" ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.totalIncome)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Pemasukan</p>
            <p className="text-[0.62rem] text-slate-400">Sistem: {formatRupiah(summary.systemIncome)} + Manual: {formatRupiah(summary.manualIncome)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-500/10 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.totalExpense)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Pengeluaran</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-5 shadow-[0_6px_16px_rgba(0,50,120,0.08),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,50,120,0.12)]">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${summary.balance >= 0 ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-blue-950">{formatRupiah(summary.balance)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Saldo</p>
          </div>
        </div>
      </section>

      {/* Form + Table */}
      <section className="grid gap-5 xl:grid-cols-[340px_1fr]">
        {/* Left: Form */}
        <div className={`${glass} flex flex-col gap-3.5`}>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Input Transaksi</p>
            <h2 className="text-lg font-extrabold text-blue-950">Catat Manual</h2>
          </div>

          <div>
            <label className={labelCls}>Tipe</label>
            <div className="relative">
              <select
                className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                value={txType}
                onChange={(e) => setTxType(e.target.value as "INCOME" | "EXPENSE")}
              >
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className={labelCls}>Keterangan</label>
            <input className={inputCls} placeholder={txType === "INCOME" ? "Contoh: Sponsor" : "Contoh: Sewa lapangan"} value={txDesc} onChange={(e) => setTxDesc(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Jumlah (Rp)</label>
            <input className={inputCls} placeholder="Contoh: 5.000.000" inputMode="numeric" value={txAmount} onChange={(e) => setTxAmount(formatThousands(e.target.value))} />
          </div>

          <div>
            <label className={labelCls}>Tanggal</label>
            <input type="date" className={inputCls} value={txDate} onChange={(e) => setTxDate(e.target.value)} />
          </div>

          <button
            type="button"
            className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(0,98,255,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,98,255,0.36)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(90deg, #006aff, #00bbff)" }}
            disabled={isSaving || !txDesc || !txAmount || !txDate}
            onClick={handleSave}
          >
            {isSaving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>

        {/* Right: Table */}
        <div className={glass}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-blue-600">Riwayat Transaksi</p>
              <h2 className="text-lg font-extrabold text-blue-950">Laporan Keuangan</h2>
            </div>
            <div>
              <label className={labelCls}>Bulan</label>
              <input type="month" className={`${inputCls} w-[180px]`} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="mb-4 flex gap-1 rounded-xl bg-slate-100/70 p-1.5">
            {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-[0.75rem] font-bold transition-all duration-200 ${
                  filter === f
                    ? "bg-white shadow-[0_2px_8px_rgba(0,50,120,0.12)] -translate-y-0.5 " + (f === "INCOME" ? "text-emerald-600" : f === "EXPENSE" ? "text-red-500" : "text-slate-700")
                    : "text-slate-400 bg-slate-200/50 hover:text-slate-600 hover:bg-slate-200/80"
                }`}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "Semua" : f === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
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
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Keterangan</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Tipe</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Jumlah</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                          <p className="text-sm">Belum ada transaksi untuk bulan ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((t) => (
                    <tr key={t.id} className="border-b border-blue-500/[0.04] transition hover:bg-blue-500/[0.025]">
                      <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-slate-500">
                        {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-slate-800">{t.description}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                        }`}>
                          {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-3.5 font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                        {t.type === "INCOME" ? "+" : "-"} {formatRupiah(Number(t.amount))}
                      </td>
                      <td className="px-3 py-3.5">
                        <button type="button" title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-500 transition hover:bg-red-500/10" onClick={() => handleDelete(t.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        </button>
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
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32">
                    <circle className="toast-circle-success" cx="12" cy="12" r="10" stroke="#10b981" />
                    <path className="toast-tick" strokeLinecap="round" strokeLinejoin="round" stroke="#10b981" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              ) : (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <svg className="toast-icon-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" width="32" height="32">
                    <circle className="toast-circle-error" cx="12" cy="12" r="10" stroke="#ef4444" />
                    <path className="toast-cross" strokeLinecap="round" stroke="#ef4444" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
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
