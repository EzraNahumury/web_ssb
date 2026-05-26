"use client";

type AdminStatsProps = {
  totalCount: number;
  activeCount: number;
  needActionCount: number;
};

export function AdminStats({ totalCount, activeCount, needActionCount }: AdminStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total */}
      <div className="stat-card stat-enter stat-enter-1">
        <div className="flex items-center gap-4">
          <div className="stat-icon-float stat-icon-float-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <p className="stat-value">{totalCount}</p>
            <p className="stat-label mt-1">Total Admin Academy</p>
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="stat-card stat-enter stat-enter-2">
        <div className="flex items-center gap-4">
          <div className="stat-icon-float stat-icon-float-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <p className="stat-value">{activeCount}</p>
            <p className="stat-label mt-1">Academy Aktif</p>
          </div>
        </div>
      </div>

      {/* Need action */}
      <div className="stat-card stat-enter stat-enter-3">
        <div className="flex items-center gap-4">
          <div className="stat-icon-float stat-icon-float-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="stat-value">{needActionCount}</p>
            <p className="stat-label mt-1">Perlu Tindak Lanjut</p>
          </div>
        </div>
      </div>
    </section>
  );
}
