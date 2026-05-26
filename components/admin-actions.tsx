"use client";

import { useRouter } from "next/navigation";

export function AdminActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="ml-1 flex items-center gap-1.5 rounded-md border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-2.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider text-[#FF3B30] transition hover:bg-[#FF3B30]/20"
      onClick={handleLogout}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Keluar
    </button>
  );
}
