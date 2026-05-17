import React from "react";

const moodShapes = {
  happy: { brow: "M63 75Q76 66 89 75", brow2: "M111 75Q124 66 137 75", mouth: "M78 130Q100 151 122 130", eye: "round", glow: 0.6 },
  neutral: { brow: "M62 72L88 72", brow2: "M112 72L138 72", mouth: "M82 134Q100 139 118 134", eye: "round", glow: 0.35 },
  angry: { brow: "M61 65L90 78", brow2: "M139 65L110 78", mouth: "M82 141Q100 127 118 141", eye: "sharp", glow: 0.2 },
  disappointed: { brow: "M62 78Q76 70 90 78", brow2: "M110 78Q124 70 138 78", mouth: "M82 143Q100 130 118 143", eye: "tired", glow: 0.15 },
  excited: { brow: "M61 70Q76 57 91 70", brow2: "M109 70Q124 57 139 70", mouth: "M76 128Q100 158 124 128", eye: "star", glow: 0.85 },
  debochado: { brow: "M61 70Q77 62 91 72", brow2: "M110 72L139 66", mouth: "M80 136Q103 148 124 128", eye: "smirk", glow: 0.5 },
};

export function PetBase({
  mood = "neutral",
  body = "#5eead4",
  belly = "#ccfbf1",
  accent = "#0f766e",
  kind = "cleitin",
  horns = false,
  ears = false,
  antenna = false,
  skull = false,
  robot = false,
  crownMark = false,
  className = "",
}) {
  const face = moodShapes[mood] ?? moodShapes.neutral;
  const iris = face.eye === "sharp" ? accent : "#0f172a";

  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label={`${kind} ${mood}`}
      className={`pet-svg drop-shadow-2xl ${className}`}
    >
      <defs>
        <radialGradient id={`${kind}-shine`} cx="34%" cy="24%" r="80%">
          <stop stopColor="#ffffff" stopOpacity="0.86" />
          <stop offset="0.32" stopColor={body} />
          <stop offset="1" stopColor={accent} />
        </radialGradient>
        <linearGradient id={`${kind}-belly`} x1="62" x2="140" y1="104" y2="174">
          <stop stopColor={belly} stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`${kind}-soft`}>
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor={accent} floodOpacity="0.22" />
        </filter>
      </defs>

      <ellipse cx="100" cy="190" rx="56" ry="14" fill="#020617" opacity="0.32" />
      {face.glow > 0 && <circle cx="100" cy="105" r="84" fill={body} opacity={face.glow * 0.13} className="pet-mood-glow" />}

      {antenna && (
        <g fill="none" stroke={accent} strokeLinecap="round" strokeWidth="7">
          <path d="M76 43Q62 19 45 17" />
          <path d="M124 43Q138 19 155 17" />
          <circle cx="42" cy="16" r="8" fill={body} stroke="none" />
          <circle cx="158" cy="16" r="8" fill={body} stroke="none" />
        </g>
      )}

      {horns && (
        <g filter={`url(#${kind}-soft)`}>
          <path d="M61 55Q55 24 78 38Q77 51 67 64Z" fill="#ffe4e6" />
          <path d="M139 55Q145 24 122 38Q123 51 133 64Z" fill="#ffe4e6" />
        </g>
      )}

      {ears && (
        <g filter={`url(#${kind}-soft)`}>
          <path d="M45 86Q28 46 70 62Z" fill={`url(#${kind}-shine)`} />
          <path d="M155 86Q172 46 130 62Z" fill={`url(#${kind}-shine)`} />
          <path d="M51 79Q43 59 65 68" fill={belly} opacity="0.72" />
          <path d="M149 79Q157 59 135 68" fill={belly} opacity="0.72" />
        </g>
      )}

      <path
        d={skull ? "M39 94C39 52 62 31 100 31C138 31 161 52 161 94C161 121 149 134 136 142L132 174C128 191 115 200 100 200C85 200 72 191 68 174L64 142C51 134 39 121 39 94Z" : "M37 98C37 55 62 31 100 31C138 31 163 55 163 98V128C163 171 137 198 100 198C63 198 37 171 37 128V98Z"}
        fill={`url(#${kind}-shine)`}
        filter={`url(#${kind}-soft)`}
      />

      {robot && (
        <g>
          <rect x="52" y="49" width="96" height="108" rx="24" fill="#0f172a" opacity="0.14" />
          <rect x="64" y="34" width="72" height="17" rx="8" fill="#e0f2fe" opacity="0.85" />
          <path d="M43 94H31M157 94H169" stroke="#bae6fd" strokeWidth="9" strokeLinecap="round" />
        </g>
      )}

      <ellipse cx="100" cy="143" rx="42" ry="40" fill={`url(#${kind}-belly)`} opacity={skull ? "0.18" : "0.9"} />
      <path d="M54 129Q35 134 31 154Q50 158 61 141" fill={accent} opacity="0.52" />
      <path d="M146 129Q165 134 169 154Q150 158 139 141" fill={accent} opacity="0.52" />
      <path d="M76 192Q72 207 54 207" stroke={accent} strokeWidth="12" strokeLinecap="round" />
      <path d="M124 192Q128 207 146 207" stroke={accent} strokeWidth="12" strokeLinecap="round" />

      {crownMark && <path d="M83 56L96 45L108 58L125 46L121 71H79Z" fill="#facc15" opacity="0.9" />}

      <g className="pet-face">
        <path d={face.brow} stroke="#111827" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.82" />
        <path d={face.brow2} stroke="#111827" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.82" />
        <Eye cx={75} cy={93} type={face.eye} iris={iris} />
        <Eye cx={125} cy={93} type={face.eye} iris={iris} flip />
        <path d={face.mouth} stroke="#111827" strokeWidth="8" strokeLinecap="round" fill="none" />
        {skull && (
          <g fill="#111827" opacity="0.78">
            <rect x="84" y="158" width="8" height="16" rx="3" />
            <rect x="97" y="158" width="8" height="16" rx="3" />
            <rect x="110" y="158" width="8" height="16" rx="3" />
          </g>
        )}
      </g>
    </svg>
  );
}

function Eye({ cx, cy, type, iris, flip = false }) {
  if (type === "tired") {
    return <path d={`M${cx - 14} ${cy}Q${cx} ${cy + 10} ${cx + 14} ${cy}`} stroke="#111827" strokeWidth="8" strokeLinecap="round" fill="none" />;
  }

  if (type === "star") {
    return <path d={`M${cx} ${cy - 18}L${cx + 6} ${cy - 5}L${cx + 20} ${cy - 4}L${cx + 9} ${cy + 5}L${cx + 12} ${cy + 18}L${cx} ${cy + 10}L${cx - 12} ${cy + 18}L${cx - 9} ${cy + 5}L${cx - 20} ${cy - 4}L${cx - 6} ${cy - 5}Z`} fill="#111827" />;
  }

  if (type === "smirk") {
    const d = flip ? `M${cx - 14} ${cy + 2}Q${cx} ${cy - 10} ${cx + 14} ${cy + 2}` : `M${cx - 14} ${cy - 2}Q${cx} ${cy + 8} ${cx + 14} ${cy - 2}`;
    return <path d={d} stroke="#111827" strokeWidth="8" strokeLinecap="round" fill="none" />;
  }

  if (type === "sharp") {
    return <path d={`M${cx - 18} ${cy - 4}Q${cx} ${cy - 17} ${cx + 18} ${cy - 4}Q${cx} ${cy + 13} ${cx - 18} ${cy - 4}Z`} fill="#fff" stroke="#111827" strokeWidth="5" />;
  }

  return (
    <g className="pet-eye">
      <ellipse cx={cx} cy={cy} rx="17" ry="19" fill="#fff" />
      <circle cx={cx} cy={cy + 1} r="9" fill={iris} />
      <circle cx={cx - 4} cy={cy - 5} r="3" fill="#fff" />
    </g>
  );
}

export function PetFallback({ mood = "neutral" }) {
  return (
    <svg viewBox="0 0 200 220" role="img" aria-label={`silhueta ${mood}`} className="pet-svg drop-shadow-2xl">
      <ellipse cx="100" cy="190" rx="56" ry="14" fill="#020617" opacity="0.32" />
      <path d="M37 98C37 55 62 31 100 31C138 31 163 55 163 98V128C163 171 137 198 100 198C63 198 37 171 37 128V98Z" fill="#334155" />
      <circle cx="76" cy="94" r="10" fill="#cbd5e1" />
      <circle cx="124" cy="94" r="10" fill="#cbd5e1" />
      <path d="M82 137Q100 145 118 137" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  );
}
