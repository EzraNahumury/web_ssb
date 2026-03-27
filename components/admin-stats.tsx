"use client";

import BorderGlow from "@/components/border-glow";

type AdminStatsProps = {
  totalCount: number;
  activeCount: number;
  needActionCount: number;
};

export function AdminStats({ totalCount, activeCount, needActionCount }: AdminStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="210 80 60"
        backgroundColor="rgba(255,255,255,0.7)"
        borderRadius={16}
        glowRadius={30}
        glowIntensity={0.6}
        coneSpread={25}
        animated={false}
        colors={['#60a5fa', '#3b82f6', '#2563eb']}
        className="stat-enter stat-enter-1"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="stat-icon-float stat-icon-float-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{totalCount}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Total Admin SSB</p>
          </div>
        </div>
      </BorderGlow>

      {/* Active */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="150 70 55"
        backgroundColor="rgba(255,255,255,0.7)"
        borderRadius={16}
        glowRadius={30}
        glowIntensity={0.6}
        coneSpread={25}
        animated={false}
        colors={['#34d399', '#10b981', '#059669']}
        className="stat-enter stat-enter-2"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="stat-icon-float stat-icon-float-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{activeCount}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">SSB Aktif</p>
          </div>
        </div>
      </BorderGlow>

      {/* Need action */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="35 85 60"
        backgroundColor="rgba(255,255,255,0.7)"
        borderRadius={16}
        glowRadius={30}
        glowIntensity={0.6}
        coneSpread={25}
        animated={false}
        colors={['#fbbf24', '#f59e0b', '#d97706']}
        className="stat-enter stat-enter-3"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="stat-icon-float stat-icon-float-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/10 text-amber-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[1.65rem] font-extrabold leading-none text-blue-950">{needActionCount}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">Perlu Tindak Lanjut</p>
          </div>
        </div>
      </BorderGlow>
    </section>
  );
}
