"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TransactionRow, ReportSummary } from "@/lib/data";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── CSS class tokens ───────────────────────── */
const inputCls =
  "w-full rounded-md border border-white/10 bg-[#161616] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-[#FF3B30]/40 focus:border-[#FF3B30] focus:bg-[#1E1E1E] focus:ring-[3px] focus:ring-[#FF3B30]/15";

const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/60";

const glass =
  "rounded-xl border border-white/10 bg-[#1E1E1E] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)]";

/* ─── Types ──────────────────────────────────── */
type PeriodMode =
  | "kemarin"
  | "7hari"
  | "30hari"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

/* ─── Constants ──────────────────────────────── */
const DAY_HEADERS = ["S", "S", "R", "K", "J", "S", "M"]; // Sen‑Min
const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","Mei","Jun",
  "Jul","Agu","Sep","Okt","Nov","Des",
];

const MENU_ITEMS: { key: PeriodMode; label: string; hasPanel: boolean }[] = [
  { key: "kemarin", label: "Kemarin", hasPanel: false },
  { key: "7hari", label: "7 Hari Sebelumnya", hasPanel: false },
  { key: "30hari", label: "30 Hari Sebelumnya", hasPanel: false },
  { key: "daily", label: "Per Hari", hasPanel: true },
  { key: "weekly", label: "Per Minggu", hasPanel: true },
  { key: "monthly", label: "Per Bulan", hasPanel: true },
  { key: "yearly", label: "Berdasarkan Tahun", hasPanel: true },
];

/* ─── Helpers ────────────────────────────────── */
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
function todayDate() {
  return fmtLocalDate(new Date());
}
function fmtLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmtLocalDate(d);
}

function getWeekRange(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: fmtLocalDate(monday), end: fmtLocalDate(sunday) };
}

function getCalendarWeeks(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  let dow = first.getDay();
  dow = dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6
  const cursor = new Date(year, month, 1 - dow);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function fmtDisplay(d: string) {
  const dt = new Date(d + "T00:00:00");
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

function getDisplayLabel(mode: PeriodMode, refDate: string, rangeStart: string, rangeEnd: string): string {
  switch (mode) {
    case "kemarin":
      return `Kemarin  ${fmtDisplay(refDate)}`;
    case "7hari":
      return `7 Hari Sebelumnya  ${fmtDisplay(rangeStart)} - ${fmtDisplay(rangeEnd)}`;
    case "30hari":
      return `30 Hari Sebelumnya  ${fmtDisplay(rangeStart)} - ${fmtDisplay(rangeEnd)}`;
    case "daily":
      return `Per Hari  ${fmtDisplay(refDate)}`;
    case "weekly": {
      const { start, end } = getWeekRange(refDate);
      return `Per Minggu  ${fmtDisplay(start)} - ${fmtDisplay(end)}`;
    }
    case "monthly": {
      const [y, m] = refDate.slice(0, 7).split("-");
      return `Per Bulan  ${MONTH_NAMES[Number(m) - 1]} ${y}`;
    }
    case "yearly":
      return `Berdasarkan Tahun  ${refDate.slice(0, 4)}`;
  }
}

function getPdfPeriodLabel(mode: PeriodMode, refDate: string, rangeStart: string, rangeEnd: string): string {
  const full = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const short = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  switch (mode) {
    case "kemarin":
    case "daily":
      return full(refDate);
    case "7hari":
      return `7 Hari Terakhir (${short(rangeStart)} - ${full(rangeEnd)})`;
    case "30hari":
      return `30 Hari Terakhir (${short(rangeStart)} - ${full(rangeEnd)})`;
    case "weekly": {
      const { start, end } = getWeekRange(refDate);
      return `${short(start)} - ${full(end)}`;
    }
    case "monthly": {
      const [y, m] = refDate.slice(0, 7).split("-");
      return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    }
    case "yearly":
      return `Tahun ${refDate.slice(0, 4)}`;
  }
}

/* ─── Component ──────────────────────────────── */
export function ReportManager({ ssbName, ssbLogo }: { ssbName: string; ssbLogo: string | null }) {
  /* --- period state --- */
  const [periodMode, setPeriodMode] = useState<PeriodMode>("monthly");
  const [refDate, setRefDate] = useState(todayDate());
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);

  /* --- picker UI state --- */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<PeriodMode | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [hoveredWeekIdx, setHoveredWeekIdx] = useState(-1);
  const pickerRef = useRef<HTMLDivElement>(null);

  /* --- data state --- */
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    systemIncome: 0, manualIncome: 0, totalIncome: 0, totalExpense: 0, balance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [txSearch, setTxSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 4;

  /* --- form state --- */
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(todayDate());
  const [isSaving, setIsSaving] = useState(false);

  /* --- toast state --- */
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [toastDismissing, setToastDismissing] = useState(false);

  /* --- derived --- */
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);
  const isReadOnly = Number(refDate.slice(0, 4)) < 2026;
  const emptyLabel =
    periodMode === "kemarin" || periodMode === "daily"
      ? "hari"
      : periodMode === "7hari" || periodMode === "weekly"
      ? "minggu"
      : periodMode === "monthly" || periodMode === "30hari"
      ? "bulan"
      : "tahun";

  /* ═══════════ Click-outside for picker ═══════════ */
  useEffect(() => {
    if (!pickerOpen) return;
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pickerOpen]);

  /* ═══════════ Toast helpers ═══════════ */
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

  /* ═══════════ Data fetching ═══════════ */
  useEffect(() => { fetchData(); }, [periodMode, refDate, rangeStart, rangeEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setIsLoading(true);
    try {
      let param = "";
      if (periodMode === "kemarin" || periodMode === "daily") {
        param = `period=daily&date=${refDate}`;
      } else if (periodMode === "7hari" || periodMode === "30hari") {
        param = `period=range&start=${rangeStart}&end=${rangeEnd}`;
      } else if (periodMode === "weekly") {
        param = `period=weekly&date=${refDate}`;
      } else if (periodMode === "monthly") {
        param = `period=monthly&date=${refDate.slice(0, 7)}`;
      } else {
        param = `period=yearly&date=${refDate.slice(0, 4)}`;
      }
      const res = await fetch(`/api/ssb/transactions?${param}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.data ?? []);
        setSummary(data.summary ?? { systemIncome: 0, manualIncome: 0, totalIncome: 0, totalExpense: 0, balance: 0 });
        setOpeningBalance(data.openingBalance ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  /* ═══════════ CRUD handlers ═══════════ */
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

  /* ═══════════ Picker selection handlers ═══════════ */
  function openPicker() {
    const willOpen = !pickerOpen;
    setPickerOpen(willOpen);
    if (willOpen) {
      setActiveMenu(periodMode);
      const d = new Date(refDate + "T00:00:00");
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
      setHoveredWeekIdx(-1);
    }
  }

  function selectShortcut(key: PeriodMode) {
    if (key === "kemarin") {
      const yesterday = daysAgo(1);
      setPeriodMode("kemarin");
      setRefDate(yesterday);
    } else if (key === "7hari") {
      setPeriodMode("7hari");
      setRangeStart(daysAgo(7));
      setRangeEnd(daysAgo(1));
      setRefDate(daysAgo(1));
    } else if (key === "30hari") {
      setPeriodMode("30hari");
      setRangeStart(daysAgo(30));
      setRangeEnd(daysAgo(1));
      setRefDate(daysAgo(1));
    }
    setPickerOpen(false);
    setPage(1);
  }

  function selectDay(day: Date) {
    setPeriodMode("daily");
    setRefDate(fmtLocalDate(day));
    setPickerOpen(false);
    setPage(1);
  }

  function selectWeek(monday: Date) {
    setPeriodMode("weekly");
    setRefDate(fmtLocalDate(monday));
    setPickerOpen(false);
    setPage(1);
  }

  function selectMonth(year: number, monthIdx: number) {
    const m = String(monthIdx + 1).padStart(2, "0");
    setPeriodMode("monthly");
    setRefDate(`${year}-${m}-01`);
    setPickerOpen(false);
    setPage(1);
  }

  function selectYear(year: number) {
    setPeriodMode("yearly");
    setRefDate(`${year}-01-01`);
    setPickerOpen(false);
    setPage(1);
  }

  /* ═══════════ Calendar navigation ═══════════ */
  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  /* ═══════════ PDF export ═══════════ */
  function getPeriodRange(): { start: string; end: string } {
    switch (periodMode) {
      case "kemarin":
      case "daily":
        return { start: refDate, end: refDate };
      case "7hari":
      case "30hari":
        return { start: rangeStart, end: rangeEnd };
      case "weekly":
        return getWeekRange(refDate);
      case "monthly": {
        const [y, m] = refDate.slice(0, 7).split("-").map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        return {
          start: `${y}-${String(m).padStart(2, "0")}-01`,
          end: `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
        };
      }
      case "yearly":
        return { start: `${refDate.slice(0, 4)}-01-01`, end: `${refDate.slice(0, 4)}-12-31` };
    }
  }

  async function exportPDF() {
    const range = getPeriodRange();
    const fmtFull = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const fmtNum = (n: number) => Number(n).toLocaleString("id-ID");

    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    // ── Logo + Header (centered) ──
    const logoSize = 18;
    let logoLoaded = false;

    if (ssbLogo) {
      try {
        const res = await fetch(ssbLogo);
        const blob = await res.blob();
        const base64: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, 14, 10, logoSize, logoSize);
        logoLoaded = true;
      } catch { /* logo gagal dimuat, skip */ }
    }

    const titleX = pw / 2;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Laporan Keuangan ${ssbName}`, titleX, 18, { align: "center" });

    const periodY = 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const periodPrefix = "Periode Laporan ";
    const periodValue = `${fmtFull(range.start)} sampai ${fmtFull(range.end)}`;
    const fullPeriodText = periodPrefix + periodValue;
    const periodTextW = doc.getTextWidth(fullPeriodText);
    const periodStartX = (pw - periodTextW) / 2;
    doc.text(periodPrefix, periodStartX, periodY);
    doc.setFont("helvetica", "normal");
    doc.text(periodValue, periodStartX + doc.getTextWidth(periodPrefix), periodY);

    // ── Saldo Awal ──
    const saldoY = logoLoaded ? 10 + logoSize + 10 : 32;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Saldo Awal :  ", 14, saldoY);
    const saldoLabelW = doc.getTextWidth("Saldo Awal :  ");
    doc.setFont("helvetica", "normal");
    doc.text(fmtNum(openingBalance), 14 + saldoLabelW, saldoY);

    // ── Group system transactions by payment category ──
    const manualTx = transactions.filter((t) => t.source === "MANUAL");
    const systemTx = transactions.filter((t) => t.source === "SYSTEM");

    const systemGroups = new Map<string, { desc: string; amount: number; date: string }>();
    for (const t of systemTx) {
      let key: string;
      let desc: string;
      if (t.payment_type === "MONTHLY") {
        const pm = t.period_month ?? t.transaction_date.slice(0, 7);
        const [y, m] = pm.split("-").map(Number);
        const mName = new Date(y, m - 1).toLocaleDateString("id-ID", { month: "long" });
        key = `monthly-${pm}`;
        desc = `Pembayaran uang bulan ${mName}`;
      } else if (t.payment_type === "REGISTRATION") {
        const pm = t.transaction_date.slice(0, 7);
        const [y, m] = pm.split("-").map(Number);
        const mName = new Date(y, m - 1).toLocaleDateString("id-ID", { month: "long" });
        key = `registration-${pm}`;
        desc = `Pendaftaran bulan ${mName}`;
      } else if (t.payment_type === "SESSION") {
        key = `session-${t.transaction_date}`;
        desc = `Pembayaran sesi latihan ${new Date(t.transaction_date + "T00:00:00").toLocaleDateString("id-ID")}`;
      } else {
        key = `other-${t.id}`;
        desc = t.description;
      }
      const existing = systemGroups.get(key);
      if (existing) {
        existing.amount += Number(t.amount);
        if (t.transaction_date > existing.date) existing.date = t.transaction_date;
      } else {
        systemGroups.set(key, { desc, amount: Number(t.amount), date: t.transaction_date });
      }
    }

    // Combine manual + grouped system, sort ascending by date
    const pdfItems: { desc: string; amount: number; date: string; type: "INCOME" | "EXPENSE" }[] = [
      ...manualTx.map((t) => ({ desc: t.description, amount: Number(t.amount), date: t.transaction_date, type: t.type })),
      ...Array.from(systemGroups.values()).map((g) => ({ desc: g.desc, amount: g.amount, date: g.date, type: "INCOME" as const })),
    ];
    pdfItems.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

    let running = openingBalance;
    const bodyRows = pdfItems.map((t, i) => {
      if (t.type === "INCOME") running += t.amount;
      else running -= t.amount;
      return [
        String(i + 1),
        new Date(t.date + "T00:00:00").toLocaleDateString("id-ID"),
        t.desc,
        t.type === "INCOME" ? fmtNum(t.amount) : "",
        t.type === "EXPENSE" ? fmtNum(t.amount) : "",
        fmtNum(running),
      ];
    });

    // Footer row with totals
    const totalIncome = pdfItems.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const totalExpense = pdfItems.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    bodyRows.push(["", "", "", fmtNum(totalIncome), fmtNum(totalExpense), ""]);

    const lastIdx = bodyRows.length - 1;

    // ── Table ──
    autoTable(doc, {
      startY: saldoY + 6,
      head: [["No.", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo"]],
      body: bodyRows,
      theme: "grid",
      headStyles: { fillColor: [56, 87, 35], textColor: 255, fontStyle: "bold", fontSize: 9, halign: "center" },
      styles: { fontSize: 8.5, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.3 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 28 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 30 },
        5: { halign: "right", cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      didParseCell(data) {
        // Header column colors
        if (data.section === "head") {
          if (data.column.index === 3) data.cell.styles.fillColor = [76, 175, 80];
          else if (data.column.index === 4) data.cell.styles.fillColor = [239, 83, 80];
          else if (data.column.index === 5) data.cell.styles.fillColor = [66, 133, 244];
        }
        // Footer row (last body row)
        if (data.section === "body" && data.row.index === lastIdx) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 9;
          if (data.column.index === 3) {
            data.cell.styles.fillColor = [220, 245, 220];
          } else if (data.column.index === 4) {
            data.cell.styles.fillColor = [255, 220, 220];
          } else {
            data.cell.styles.fillColor = [245, 245, 245];
          }
        }
        // Alternate row colors (skip footer)
        if (data.section === "body" && data.row.index < lastIdx && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [250, 250, 250];
        }
      },
    });

    // ── Page footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(
        `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} — Halaman ${i} dari ${pageCount}`,
        pw / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" },
      );
      doc.setTextColor(0);
    }

    let fileDate = refDate.slice(0, 7);
    if (periodMode === "kemarin" || periodMode === "daily") fileDate = refDate;
    else if (periodMode === "7hari") fileDate = `${rangeStart}_${rangeEnd}`;
    else if (periodMode === "30hari") fileDate = `${rangeStart}_${rangeEnd}`;
    else if (periodMode === "weekly") { const wr = getWeekRange(refDate); fileDate = `${wr.start}_${wr.end}`; }
    else if (periodMode === "yearly") fileDate = refDate.slice(0, 4);
    doc.save(`Laporan_Keuangan_${ssbName.replace(/\s+/g, "_")}_${fileDate}.pdf`);
  }

  /* ═══════════ Filtered list ═══════════ */
  const filtered = (() => {
    let result = filter === "ALL" ? transactions : transactions.filter((t) => t.type === filter);
    const q = txSearch.trim().toLowerCase();
    if (q) result = result.filter((t) => t.description.toLowerCase().includes(q));
    return result;
  })();

  /* ═══════════ Calendar rendering helpers ═══════════ */
  const calWeeks = getCalendarWeeks(calYear, calMonth);

  function isSelectedDay(d: Date) {
    return periodMode === "daily" && fmtLocalDate(d) === refDate;
  }
  function isSelectedWeekRow(week: Date[]) {
    if (periodMode !== "weekly") return false;
    const wr = getWeekRange(refDate);
    return fmtLocalDate(week[0]) === wr.start;
  }

  const navBtnCls =
    "flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition hover:bg-white/10 hover:text-white/60";

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="flex flex-col gap-4">
      {/* ─── Summary Cards ─── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 stat-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-white">{formatRupiah(summary.totalIncome)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Total Pemasukan</p>
            <p className="text-[0.62rem] text-white/30">Sistem: {formatRupiah(summary.systemIncome)} + Manual: {formatRupiah(summary.manualIncome)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 stat-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-500/10 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-white">{formatRupiah(summary.totalExpense)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Total Pengeluaran</p>
          </div>
        </div>
        <div className="flex items-center gap-4 stat-card">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${summary.balance >= 0 ? "bg-[#FF3B30]/15 text-[#FF3B30]" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
          </div>
          <div>
            <p className="text-[1.3rem] font-extrabold leading-none text-white">{formatRupiah(summary.balance)}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Saldo</p>
          </div>
        </div>
      </section>

      {/* ─── Form + Table ─── */}
      <section className="grid gap-5 xl:grid-cols-[340px_1fr]">
        {/* Left: Form */}
        <div className={`${glass} flex flex-col gap-3.5`}>
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Input Transaksi</p>
            <h2 className="text-lg font-extrabold text-white">Catat Manual</h2>
          </div>

          {isReadOnly && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" className="shrink-0 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
              <p className="text-[0.78rem] leading-snug text-amber-700">
                <span className="font-bold">Mode Baca Saja</span> — Data sebelum tahun 2026 tidak dapat diubah.
              </p>
            </div>
          )}

          <div className={isReadOnly ? "pointer-events-none opacity-40" : ""}>
            <label className={labelCls}>Tipe</label>
            <div className="relative">
              <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} value={txType} disabled={isReadOnly} onChange={(e) => setTxType(e.target.value as "INCOME" | "EXPENSE")}>
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div className={isReadOnly ? "pointer-events-none opacity-40" : ""}>
            <label className={labelCls}>Keterangan</label>
            <input className={inputCls} placeholder={txType === "INCOME" ? "Contoh: Sponsor" : "Contoh: Sewa lapangan"} value={txDesc} disabled={isReadOnly} onChange={(e) => setTxDesc(e.target.value)} />
          </div>

          <div className={isReadOnly ? "pointer-events-none opacity-40" : ""}>
            <label className={labelCls}>Jumlah (Rp)</label>
            <input className={inputCls} placeholder="Contoh: 5.000.000" inputMode="numeric" value={txAmount} disabled={isReadOnly} onChange={(e) => setTxAmount(formatThousands(e.target.value))} />
          </div>

          <div className={isReadOnly ? "pointer-events-none opacity-40" : ""}>
            <label className={labelCls}>Tanggal</label>
            <input type="date" className={inputCls} value={txDate} disabled={isReadOnly} onChange={(e) => setTxDate(e.target.value)} />
          </div>

          <button
            type="button"
            className="btn-shimmer mt-1 w-full rounded-[14px] py-3 text-[0.85rem] font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(255,59,48,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(255,59,48,0.5)] disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
            disabled={isReadOnly || isSaving || !txDesc || !txAmount || !txDate}
            onClick={handleSave}
          >
            {isSaving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>

        {/* Right: Table */}
        <div className={glass}>
          {/* Header row: title + export */}
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#FF3B30]">Riwayat Transaksi</p>
                <h2 className="text-lg font-extrabold text-white">Laporan Keuangan</h2>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 self-end rounded-xl px-4 py-2.5 text-[0.78rem] font-bold text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(255,59,48,0.4)]"
                style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
                onClick={exportPDF}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Export PDF
              </button>
            </div>

            {/* ══════ Shopee-style period picker + search ══════ */}
            <div className="flex flex-wrap items-end gap-3">
              <div ref={pickerRef} className="relative">
                <label className={labelCls}>Periode Data</label>
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={openPicker}
                  className={`flex items-center gap-2.5 rounded-xl border-[1.5px] bg-white/5 px-3.5 py-2.5 text-left text-[0.82rem] outline-none transition hover:border-white/30 ${
                    pickerOpen ? "border-blue-500 ring-[3px] ring-blue-500/10 bg-white" : "border-white/15"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" className="shrink-0 text-white/30">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span className="whitespace-nowrap font-semibold text-white/80">
                    {getDisplayLabel(periodMode, refDate, rangeStart, rangeEnd)}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" className={`shrink-0 text-white/30 transition ${pickerOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* ──── Dropdown panel ──── */}
                {pickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1.5 flex overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_12px_40px_rgba(0,40,100,0.15)]">
                    {/* Left menu */}
                    <div className="w-[185px] border-r border-white/10 py-2">
                      {MENU_ITEMS.map((item, idx) => {
                        const isActive = periodMode === item.key;
                        const isHover = activeMenu === item.key;
                        const showDivider = idx === 2;
                        return (
                          <div key={item.key}>
                            {showDivider && <div className="my-1.5 border-t border-white/10" />}
                            <button
                              type="button"
                              className={`flex w-full items-center justify-between px-4 py-2.5 text-[0.8rem] transition-colors ${
                                isActive
                                  ? "font-bold text-[#FF3B30]"
                                  : isHover && item.hasPanel
                                  ? "bg-blue-50/60 text-white/90"
                                  : "text-white/60 hover:bg-white/5"
                              }`}
                              onMouseEnter={() => {
                                if (item.hasPanel) {
                                  setActiveMenu(item.key);
                                  setHoveredWeekIdx(-1);
                                } else {
                                  setActiveMenu(null);
                                }
                              }}
                              onClick={() => {
                                if (!item.hasPanel) selectShortcut(item.key);
                                else setActiveMenu(item.key);
                              }}
                            >
                              <span>{item.label}</span>
                              {item.hasPanel && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" className="text-white/70">
                                  <polyline points="9 6 15 12 9 18" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right panel */}
                    {activeMenu && MENU_ITEMS.find((m) => m.key === activeMenu)?.hasPanel && (
                      <div className="w-[290px] p-4">
                        {/* ── Calendar (Per Hari / Per Minggu) ── */}
                        {(activeMenu === "daily" || activeMenu === "weekly") && (
                          <div>
                            {/* Month/year navigation */}
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex gap-0.5">
                                <button type="button" className={navBtnCls} onClick={() => setCalYear((y) => y - 1)}>
                                  <span className="text-xs font-bold">&laquo;</span>
                                </button>
                                <button type="button" className={navBtnCls} onClick={prevMonth}>
                                  <span className="text-xs font-bold">&lsaquo;</span>
                                </button>
                              </div>
                              <span className="text-[0.85rem] font-bold text-white/90">
                                {MONTH_NAMES[calMonth]} {calYear}
                              </span>
                              <div className="flex gap-0.5">
                                <button type="button" className={navBtnCls} onClick={nextMonth}>
                                  <span className="text-xs font-bold">&rsaquo;</span>
                                </button>
                                <button type="button" className={navBtnCls} onClick={() => setCalYear((y) => y + 1)}>
                                  <span className="text-xs font-bold">&raquo;</span>
                                </button>
                              </div>
                            </div>

                            {/* Day headers */}
                            <div className="mb-1 grid grid-cols-7 text-center">
                              {DAY_HEADERS.map((d, i) => (
                                <div key={i} className="py-1 text-[0.68rem] font-bold text-white/30">{d}</div>
                              ))}
                            </div>

                            {/* Calendar body */}
                            {calWeeks.map((week, wi) => {
                              const weekSelected = activeMenu === "weekly" && isSelectedWeekRow(week);
                              const weekHovered = activeMenu === "weekly" && hoveredWeekIdx === wi;
                              return (
                                <div
                                  key={wi}
                                  className={`grid grid-cols-7 text-center transition-colors ${
                                    activeMenu === "weekly" ? "cursor-pointer" : ""
                                  } ${
                                    weekSelected
                                      ? "rounded-lg bg-[#FF3B30]/15"
                                      : weekHovered
                                      ? "rounded-lg bg-blue-50"
                                      : ""
                                  }`}
                                  onMouseEnter={() => activeMenu === "weekly" && setHoveredWeekIdx(wi)}
                                  onMouseLeave={() => activeMenu === "weekly" && setHoveredWeekIdx(-1)}
                                  onClick={() => activeMenu === "weekly" && selectWeek(week[0])}
                                >
                                  {week.map((day, di) => {
                                    const inMonth = day.getMonth() === calMonth;
                                    const today = fmtLocalDate(day) === todayDate();
                                    const selected = activeMenu === "daily" && isSelectedDay(day);
                                    return (
                                      <button
                                        key={di}
                                        type="button"
                                        className={`relative py-1.5 text-[0.8rem] transition-colors ${
                                          selected
                                            ? "rounded-md bg-blue-500 font-bold text-white"
                                            : today
                                            ? "font-bold text-[#FF3B30]"
                                            : inMonth
                                            ? "text-white/80 hover:text-[#FF3B30]"
                                            : "text-white/70"
                                        } ${activeMenu === "daily" && inMonth ? "hover:bg-blue-50 rounded-md" : ""}`}
                                        onClick={(e) => {
                                          if (activeMenu === "daily") {
                                            e.stopPropagation();
                                            selectDay(day);
                                          }
                                        }}
                                      >
                                        {day.getDate()}
                                        {today && !selected && (
                                          <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ── Month grid (Per Bulan) ── */}
                        {activeMenu === "monthly" && (
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <button type="button" className={navBtnCls} onClick={() => setCalYear((y) => y - 1)}>
                                <span className="text-xs font-bold">&lsaquo;</span>
                              </button>
                              <span className="text-[0.85rem] font-bold text-white/90">{calYear}</span>
                              <button type="button" className={navBtnCls} onClick={() => setCalYear((y) => y + 1)}>
                                <span className="text-xs font-bold">&rsaquo;</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {MONTH_SHORT.map((name, i) => {
                                const sel =
                                  periodMode === "monthly" &&
                                  calYear === Number(refDate.slice(0, 4)) &&
                                  i === Number(refDate.slice(5, 7)) - 1;
                                const isCurrent =
                                  calYear === new Date().getFullYear() && i === new Date().getMonth();
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    className={`rounded-lg py-2.5 text-[0.8rem] font-medium transition ${
                                      sel
                                        ? "bg-blue-500 font-bold text-white"
                                        : isCurrent
                                        ? "font-bold text-[#FF3B30] hover:bg-blue-50"
                                        : "text-white/80 hover:bg-white/10"
                                    }`}
                                    onClick={() => selectMonth(calYear, i)}
                                  >
                                    {name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── Year grid (Berdasarkan Tahun) ── */}
                        {activeMenu === "yearly" && (
                          <div>
                            <p className="mb-3 text-center text-[0.85rem] font-bold text-white/90">Pilih Tahun</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {yearOptions.map((y) => {
                                const sel = periodMode === "yearly" && y === Number(refDate.slice(0, 4));
                                const isCurrent = y === new Date().getFullYear();
                                return (
                                  <button
                                    key={y}
                                    type="button"
                                    className={`rounded-lg py-3 text-[0.85rem] font-medium transition ${
                                      sel
                                        ? "bg-blue-500 font-bold text-white"
                                        : isCurrent
                                        ? "font-bold text-[#FF3B30] hover:bg-blue-50"
                                        : "text-white/80 hover:bg-white/10"
                                    }`}
                                    onClick={() => selectYear(y)}
                                  >
                                    {y}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search input */}
              <div className="relative w-[200px]">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
                <input className={`${inputCls} pl-9`} placeholder="Cari keterangan..." value={txSearch} onChange={(e) => { setTxSearch(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="mb-4 flex gap-1 rounded-xl bg-[#161616] p-1.5">
            {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-[0.75rem] font-bold transition-all duration-200 ${
                  filter === f
                    ? "bg-white shadow-[0_2px_8px_rgba(0,50,120,0.12)] -translate-y-0.5 " + (f === "INCOME" ? "text-emerald-600" : f === "EXPENSE" ? "text-red-500" : "text-white/80")
                    : "text-white/30 bg-white/5 hover:text-white/60 hover:bg-white/10"
                }`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === "ALL" ? "Semua" : f === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
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
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Tanggal</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Keterangan</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Tipe</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Jumlah</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-white/50">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center gap-2 py-10 text-white/30">
                          <p className="text-sm">Belum ada transaksi untuk {emptyLabel} ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.slice((page - 1) * perPage, page * perPage).map((t) => (
                    <tr key={t.id} className="border-b border-white/5 transition hover:bg-[#FF3B30]/[0.06]">
                      <td className="whitespace-nowrap px-3 py-3.5 text-[0.78rem] text-white/50">
                        {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-white/90">{t.description}</p>
                        {t.source === "SYSTEM" && (
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[#FF3B30]">Sistem</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          t.type === "INCOME" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-500"
                        }`}>
                          {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-3.5 font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                        {t.type === "INCOME" ? "+" : "-"} {formatRupiah(Number(t.amount))}
                      </td>
                      <td className="px-3 py-3.5">
                        {isReadOnly ? (
                          <span className="text-[0.68rem] text-white/30">{t.source === "SYSTEM" ? "Otomatis" : "—"}</span>
                        ) : t.source === "MANUAL" ? (
                          <button type="button" title="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] transition hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20" onClick={() => handleDelete(t.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                          </button>
                        ) : (
                          <span className="text-[0.68rem] text-white/30">Otomatis</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {filtered.length > perPage && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[0.72rem] text-white/30">
                    {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} dari {filtered.length}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.ceil(filtered.length / perPage) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`rounded-lg px-3 py-1.5 text-[0.75rem] font-bold transition ${
                          p === page ? "bg-[#FF3B30] text-white shadow-sm" : "border border-white/15 text-white/60 hover:bg-white/5"
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.75rem] font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40"
                      disabled={page >= Math.ceil(filtered.length / perPage)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Toast ─── */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={dismissToast}>
          <div className={`toast-overlay absolute inset-0 ${toastDismissing ? "toast-overlay-out" : ""}`} />
          <div className={`toast-card relative w-full max-w-xs overflow-hidden rounded-xl bg-[#1E1E1E] border border-white/10 ${toastDismissing ? "toast-card-out" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-6 text-center">
              {toast.type === "success" ? (
                <div className="toast-icon flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
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
