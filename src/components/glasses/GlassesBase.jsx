import React, { useId } from "react";

export function JulietFrame({
  lens = "#dbeafe",
  lens2 = lens,
  frame = "#e5e7eb",
  bridge = frame,
  shine = "#ffffff",
  matte = false,
  neon = false,
}) {
  const rawId = useId().replace(/:/g, "");
  const lensId = `julietLens-${rawId}`;
  const glowId = `julietGlow-${rawId}`;
  return (
    <svg viewBox="0 0 180 84" className="glasses-svg" aria-hidden="true">
      <defs>
        <linearGradient id={lensId} x1="18" x2="78" y1="62" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor={lens} />
          <stop offset="1" stopColor={lens2} />
        </linearGradient>
        <filter id={glowId}>
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={lens2} floodOpacity={neon ? "0.75" : "0.25"} />
        </filter>
      </defs>
      <g filter={`url(#${glowId})`}>
        <path d="M9 27C20 12 47 9 70 18C80 22 82 33 78 46C73 64 58 76 36 73C18 71 8 58 5 41C4 35 5 30 9 27Z" fill={matte ? "#0f172a" : frame} />
        <path d="M171 27C160 12 133 9 110 18C100 22 98 33 102 46C107 64 122 76 144 73C162 71 172 58 175 41C176 35 175 30 171 27Z" fill={matte ? "#0f172a" : frame} />
        <path d="M17 29C27 20 49 18 65 23C72 26 73 33 71 42C67 55 56 64 39 63C25 62 16 53 14 40C13 35 14 31 17 29Z" fill={`url(#${lensId})`} />
        <path d="M163 29C153 20 131 18 115 23C108 26 107 33 109 42C113 55 124 64 141 63C155 62 164 53 166 40C167 35 166 31 163 29Z" fill={`url(#${lensId})`} />
        <path d="M77 30C85 25 95 25 103 30" stroke={bridge} strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M9 27C0 23 -6 26 -12 34" stroke={frame} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M171 27C180 23 186 26 192 34" stroke={frame} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="glasses-shine" d="M25 29L61 23M116 24L154 30" stroke={shine} strokeWidth="4" strokeLinecap="round" opacity="0.78" />
      </g>
    </svg>
  );
}

export function ShieldFrame({ lens = "#22d3ee", frame = "#020617", accent = "#67e8f9", neon = false }) {
  const glowId = `shieldNeon-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 180 84" className="glasses-svg" aria-hidden="true">
      <filter id={glowId}>
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={accent} floodOpacity={neon ? "0.9" : "0.25"} />
      </filter>
      <g filter={`url(#${glowId})`}>
        <path d="M7 26H173L160 58C157 66 151 70 142 70H38C29 70 23 66 20 58Z" fill={frame} stroke={accent} strokeWidth="7" strokeLinejoin="round" />
        <path d="M23 33H75L69 55H31Z" fill={lens} opacity="0.86" />
        <path d="M105 33H157L149 55H111Z" fill={lens} opacity="0.86" />
        <path d="M75 43H105" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <path className="glasses-shine" d="M28 35H68M111 35H151" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      </g>
    </svg>
  );
}

export function ClassicFrame({ lens = "#94a3b8", frame = "#111827", accent = "#f8fafc", round = false }) {
  const rx = round ? 24 : 12;
  return (
    <svg viewBox="0 0 180 84" className="glasses-svg" aria-hidden="true">
      <g>
        <rect x="14" y="22" width="60" height="42" rx={rx} fill={lens} stroke={frame} strokeWidth="7" />
        <rect x="106" y="22" width="60" height="42" rx={rx} fill={lens} stroke={frame} strokeWidth="7" />
        <path d="M74 40Q90 31 106 40" stroke={frame} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M4 28L14 35M166 35L176 28" stroke={frame} strokeWidth="7" strokeLinecap="round" />
        <path className="glasses-shine" d="M25 28L62 58M118 28L154 58" stroke={accent} strokeWidth="4" opacity="0.62" />
      </g>
    </svg>
  );
}
