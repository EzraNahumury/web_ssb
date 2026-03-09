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
    <div className="mt-4">
      <button type="button" className="button-secondary" onClick={handleLogout}>
        Keluar
      </button>
    </div>
  );
}
