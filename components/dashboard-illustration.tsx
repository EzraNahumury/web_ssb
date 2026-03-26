export function DashboardIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 350"
      fill="none"
      className="w-full h-full"
      aria-label="Dashboard illustration"
    >
      <defs>
        <linearGradient id="di-monitor-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2f6e" />
          <stop offset="100%" stopColor="#081d45" />
        </linearGradient>
        <linearGradient id="di-screen-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1e3d" />
          <stop offset="100%" stopColor="#0d2f6e" />
        </linearGradient>
        <linearGradient id="di-bar-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0062ff" />
        </linearGradient>
        <linearGradient id="di-bar-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00b4ff" />
          <stop offset="100%" stopColor="#0062ff" />
        </linearGradient>
        <linearGradient id="di-arrow-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0062ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="di-clipboard-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c6e3f6" />
          <stop offset="100%" stopColor="#a0d0f0" />
        </linearGradient>
        <linearGradient id="di-shadow-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#0062ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0062ff" stopOpacity="0" />
        </linearGradient>
        <filter id="di-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`
          .di-monitor { animation: di-breathe 4s ease-in-out infinite; transform-origin: 200px 230px; }
          .di-clipboard { animation: di-float1 3.5s ease-in-out infinite; }
          .di-arrow { animation: di-float2 3s ease-in-out infinite; }
          .di-sq1 { animation: di-float3 3.2s ease-in-out infinite; }
          .di-sq2 { animation: di-float1 4s ease-in-out infinite 0.5s; }
          .di-sq3 { animation: di-float2 3.8s ease-in-out infinite 1s; }
          .di-sq4 { animation: di-float3 4.2s ease-in-out infinite 0.3s; }
          .di-dot1 { animation: di-pulse 2.5s ease-in-out infinite; }
          .di-dot2 { animation: di-pulse 3s ease-in-out infinite 0.4s; }
          .di-dot3 { animation: di-pulse 2.8s ease-in-out infinite 0.8s; }
          .di-donut { animation: di-spin 8s linear infinite; transform-origin: 266px 183px; }

          @keyframes di-breathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes di-float1 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-10px) translateX(3px); }
          }
          @keyframes di-float2 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-8px) translateX(-4px); }
          }
          @keyframes di-float3 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes di-pulse {
            0%, 100% { opacity: 0.3; r: 2.5; }
            50% { opacity: 0.7; r: 3.5; }
          }
          @keyframes di-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {/* ===================== BASE SHADOW ===================== */}
      <ellipse cx="200" cy="310" rx="130" ry="25" fill="url(#di-shadow-grad)" />

      {/* ===================== MONITOR + STAND ===================== */}
      <g className="di-monitor">
        {/* Stand base */}
        <polygon points="200,300 240,282 200,264 160,282" fill="#0d2f6e" opacity="0.7" />
        <polygon points="200,300 240,282 240,278 200,296" fill="#081d45" opacity="0.6" />
        <polygon points="200,300 160,282 160,278 200,296" fill="#0a2555" opacity="0.6" />
        <rect x="194" y="230" width="12" height="38" rx="2" fill="#0d2f6e" />
        <rect x="198" y="230" width="4" height="38" fill="#081d45" opacity="0.4" />

        {/* Monitor body */}
        <polygon points="320,100 330,94 330,222 320,228" fill="#081d45" />
        <polygon points="80,100 90,94 330,94 320,100" fill="#1a4494" />
        <rect x="80" y="100" width="240" height="128" rx="6" fill="url(#di-monitor-face)" />
        <rect x="92" y="110" width="216" height="106" rx="3" fill="url(#di-screen-bg)" />
        <rect x="92" y="110" width="216" height="106" rx="3" fill="none" stroke="#0062ff" strokeWidth="0.5" opacity="0.4" />

        {/* Dashboard content */}
        <rect x="100" y="116" width="200" height="12" rx="2" fill="#0a1e3d" />
        <circle cx="108" cy="122" r="2" fill="#ff5f57" />
        <circle cx="115" cy="122" r="2" fill="#ffbd2e" />
        <circle cx="122" cy="122" r="2" fill="#28c840" />
        <rect x="180" y="120" width="50" height="4" rx="1" fill="#1a4494" />

        <rect x="100" y="130" width="36" height="80" fill="#071633" />
        <rect x="106" y="138" width="24" height="3" rx="1" fill="#0062ff" opacity="0.8" />
        <rect x="106" y="146" width="20" height="3" rx="1" fill="#1a4494" opacity="0.5" />
        <rect x="106" y="154" width="22" height="3" rx="1" fill="#1a4494" opacity="0.5" />
        <rect x="106" y="162" width="18" height="3" rx="1" fill="#1a4494" opacity="0.5" />
        <rect x="106" y="170" width="24" height="3" rx="1" fill="#1a4494" opacity="0.5" />
        <rect x="100" y="136" width="3" height="7" rx="1" fill="#38bdf8" />

        <rect x="142" y="132" width="46" height="20" rx="2" fill="#0a2555" />
        <rect x="192" y="132" width="46" height="20" rx="2" fill="#0a2555" />
        <rect x="242" y="132" width="52" height="20" rx="2" fill="#0a2555" />
        <rect x="148" y="136" width="18" height="3" rx="1" fill="#38bdf8" opacity="0.6" />
        <rect x="148" y="142" width="30" height="5" rx="1" fill="#c6e3f6" opacity="0.3" />
        <rect x="198" y="136" width="16" height="3" rx="1" fill="#00b4ff" opacity="0.6" />
        <rect x="198" y="142" width="28" height="5" rx="1" fill="#c6e3f6" opacity="0.3" />
        <rect x="248" y="136" width="20" height="3" rx="1" fill="#0062ff" opacity="0.6" />
        <rect x="248" y="142" width="34" height="5" rx="1" fill="#c6e3f6" opacity="0.3" />

        {/* Bar chart */}
        <rect x="142" y="158" width="90" height="50" rx="2" fill="#071633" />
        <line x1="152" y1="170" x2="224" y2="170" stroke="#1a4494" strokeWidth="0.5" opacity="0.3" />
        <line x1="152" y1="180" x2="224" y2="180" stroke="#1a4494" strokeWidth="0.5" opacity="0.3" />
        <line x1="152" y1="190" x2="224" y2="190" stroke="#1a4494" strokeWidth="0.5" opacity="0.3" />
        <line x1="152" y1="200" x2="224" y2="200" stroke="#1a4494" strokeWidth="0.5" opacity="0.3" />
        <rect x="155" y="185" width="7" height="17" rx="1" fill="url(#di-bar-blue)" />
        <rect x="165" y="178" width="7" height="24" rx="1" fill="url(#di-bar-light)" />
        <rect x="175" y="190" width="7" height="12" rx="1" fill="url(#di-bar-blue)" />
        <rect x="185" y="172" width="7" height="30" rx="1" fill="url(#di-bar-light)" />
        <rect x="195" y="168" width="7" height="34" rx="1" fill="url(#di-bar-blue)" />
        <rect x="205" y="175" width="7" height="27" rx="1" fill="url(#di-bar-light)" />
        <rect x="215" y="164" width="7" height="38" rx="1" fill="#38bdf8" />
        <rect x="148" y="162" width="30" height="3" rx="1" fill="#c6e3f6" opacity="0.4" />

        {/* Donut chart */}
        <rect x="238" y="158" width="56" height="50" rx="2" fill="#071633" />
        <circle cx="266" cy="183" r="14" fill="none" stroke="#0a2555" strokeWidth="5" />
        <g className="di-donut">
          <circle cx="266" cy="183" r="14" fill="none" stroke="#0062ff" strokeWidth="5" strokeDasharray="55 33" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="266" cy="183" r="14" fill="none" stroke="#38bdf8" strokeWidth="5" strokeDasharray="22 66" strokeDashoffset="-55" strokeLinecap="round" />
        </g>
        <text x="266" y="185" textAnchor="middle" fill="#c6e3f6" fontSize="6" fontFamily="sans-serif" fontWeight="bold">78%</text>
        <rect x="244" y="162" width="24" height="3" rx="1" fill="#c6e3f6" opacity="0.4" />

        <rect x="92" y="110" width="216" height="106" rx="3" fill="#0062ff" opacity="0.04" />
      </g>

      {/* ===================== ARROW ===================== */}
      <g className="di-arrow" filter="url(#di-glow)">
        <g transform="translate(335, 80)">
          <rect x="6" y="16" width="10" height="40" rx="3" fill="url(#di-arrow-grad)" />
          <polygon points="11,0 24,20 16,20 16,16 6,16 6,20 -2,20" fill="url(#di-arrow-grad)" />
          <rect x="9" y="20" width="3" height="30" rx="1.5" fill="white" opacity="0.25" />
        </g>
      </g>

      {/* Trend line */}
      <g className="di-arrow">
        <polyline points="340,140 348,132 354,136 362,124" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <circle cx="362" cy="124" r="2.5" fill="#38bdf8" opacity="0.8" />
      </g>

      {/* ===================== CLIPBOARD ===================== */}
      <g className="di-clipboard" transform="translate(40, 60) rotate(-8)">
        <rect x="0" y="8" width="48" height="60" rx="4" fill="url(#di-clipboard-grad)" />
        <polygon points="48,8 52,5 52,65 48,68" fill="#8ab8dc" />
        <polygon points="0,8 4,5 52,5 48,8" fill="#d8edf9" />
        <rect x="14" y="2" width="20" height="10" rx="3" fill="#0062ff" />
        <rect x="18" y="0" width="12" height="6" rx="2" fill="#0062ff" />
        <rect x="20" y="1" width="8" height="4" rx="1.5" fill="#38bdf8" />
        <rect x="8" y="22" width="32" height="3" rx="1" fill="#0d2f6e" opacity="0.2" />
        <rect x="8" y="29" width="28" height="3" rx="1" fill="#0d2f6e" opacity="0.15" />
        <rect x="8" y="36" width="32" height="3" rx="1" fill="#0d2f6e" opacity="0.2" />
        <rect x="8" y="43" width="24" height="3" rx="1" fill="#0d2f6e" opacity="0.15" />
        <g transform="translate(30, 52)">
          <circle cx="0" cy="0" r="7" fill="#0062ff" opacity="0.15" />
          <path d="M0,-6 L1.5,-5.5 L2,-4 L3.5,-3.5 L4.5,-5 L5.5,-4 L4,-2.5 L4.5,-1 L6,0 L5.5,1.5 L4,1 L3,2.5 L4,4 L2.5,5 L1.5,3.5 L0,4 L-1.5,3.5 L-2.5,5 L-4,4 L-3,2.5 L-4,1 L-5.5,1.5 L-6,0 L-4.5,-1 L-4,-2.5 L-5.5,-4 L-4.5,-5 L-3.5,-3.5 L-2,-4 L-1.5,-5.5 Z" fill="#0062ff" opacity="0.7" />
          <circle cx="0" cy="0" r="2.5" fill="#c6e3f6" />
        </g>
      </g>

      {/* ===================== FLOATING SQUARES ===================== */}
      <g className="di-sq1" transform="translate(330, 44)">
        <rect width="20" height="20" rx="3" fill="#0062ff" opacity="0.6" />
        <polygon points="20,0 24,-3 24,17 20,20" fill="#0062ff" opacity="0.35" />
        <polygon points="0,0 4,-3 24,-3 20,0" fill="#38bdf8" opacity="0.5" />
        <rect x="4" y="12" width="3" height="5" rx="0.5" fill="white" opacity="0.5" />
        <rect x="9" y="8" width="3" height="9" rx="0.5" fill="white" opacity="0.5" />
        <rect x="14" y="5" width="3" height="12" rx="0.5" fill="white" opacity="0.5" />
      </g>

      <g className="di-sq2" transform="translate(30, 170)">
        <rect width="16" height="16" rx="2" fill="#00b4ff" opacity="0.45" />
        <polygon points="16,0 19,-2 19,14 16,16" fill="#0062ff" opacity="0.3" />
        <polygon points="0,0 3,-2 19,-2 16,0" fill="#38bdf8" opacity="0.35" />
      </g>

      <g className="di-sq3" transform="translate(360, 170)">
        <rect width="12" height="12" rx="2" fill="#38bdf8" opacity="0.35" />
        <polygon points="12,0 14,-2 14,10 12,12" fill="#0062ff" opacity="0.25" />
      </g>

      <g className="di-sq4" transform="translate(55, 260)">
        <rect width="14" height="14" rx="2" fill="#0062ff" opacity="0.3" />
        <polygon points="14,0 17,-2 17,12 14,14" fill="#081d45" opacity="0.3" />
        <polygon points="0,0 3,-2 17,-2 14,0" fill="#38bdf8" opacity="0.25" />
      </g>

      {/* ===================== ANIMATED DOTS ===================== */}
      <circle className="di-dot1" cx="68" cy="140" r="3" fill="#38bdf8" opacity="0.4" />
      <circle className="di-dot2" cx="355" cy="150" r="2.5" fill="#0062ff" opacity="0.35" />
      <circle className="di-dot3" cx="340" cy="260" r="3.5" fill="#00b4ff" opacity="0.25" />
      <circle className="di-dot1" cx="50" cy="230" r="2" fill="#38bdf8" opacity="0.3" />
      <circle className="di-dot2" cx="370" cy="210" r="2" fill="#38bdf8" opacity="0.2" />
      <circle className="di-dot3" cx="100" cy="80" r="2.5" fill="#0062ff" opacity="0.3" />

      {/* Connection lines */}
      <line x1="85" y1="100" x2="100" y2="120" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <line x1="335" y1="120" x2="315" y2="135" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
    </svg>
  );
}
