import React, { useId } from "react";

export const defaultRobotColors = {
  primary: "#7c5cff",
  secondary: "#5eead4",
  body: "#f8f4e8",
  screen: "#3b2477",
  shadow: "#241b3f",
  outline: "#d8d0bd",
};

const expressionMap = {
  happy: {
    eye: "round",
    mouth: "M86 89Q100 106 114 89",
    browLeft: "M72 67Q82 60 91 67",
    browRight: "M109 67Q118 60 128 67",
    armLeft: "M72 142Q55 149 43 166",
    armRight: "M148 142Q165 149 177 166",
    glow: 0.55,
  },
  neutral: {
    eye: "round",
    mouth: "M88 93H112",
    browLeft: "M73 66H91",
    browRight: "M109 66H127",
    armLeft: "M72 143Q56 155 47 171",
    armRight: "M148 143Q164 155 173 171",
    glow: 0.38,
  },
  angry: {
    eye: "angry",
    mouth: "M88 100Q100 91 112 100",
    browLeft: "M71 61L92 70",
    browRight: "M129 61L108 70",
    armLeft: "M72 142Q55 137 41 151",
    armRight: "M148 142Q165 137 179 151",
    glow: 0.28,
  },
  sad: {
    eye: "sad",
    mouth: "M87 101Q100 89 113 101",
    browLeft: "M72 72Q82 64 92 71",
    browRight: "M108 71Q118 64 128 72",
    armLeft: "M74 145Q61 161 55 179",
    armRight: "M146 145Q159 161 165 179",
    glow: 0.25,
  },
  excited: {
    eye: "excited",
    mouth: "M84 87Q100 112 116 87",
    browLeft: "M70 63Q82 52 94 63",
    browRight: "M106 63Q118 52 130 63",
    armLeft: "M72 141Q52 132 38 144",
    armRight: "M148 141Q168 132 182 144",
    glow: 0.82,
  },
  judging: {
    eye: "judging",
    mouth: "M88 94Q103 102 116 90",
    browLeft: "M71 65L93 62",
    browRight: "M108 68L130 63",
    armLeft: "M72 143Q56 149 45 163",
    armRight: "M148 143Q164 149 175 163",
    glow: 0.42,
  },
};

const moodAliases = {
  disappointed: "sad",
  debochado: "judging",
};

export default function RobotPet({
  mood = "neutral",
  primaryColor = defaultRobotColors.primary,
  secondaryColor = defaultRobotColors.secondary,
  bodyColor = defaultRobotColors.body,
  screenColor = defaultRobotColors.screen,
  shadowColor = defaultRobotColors.shadow,
  outlineColor = defaultRobotColors.outline,
}) {
  const rawId = useId().replace(/:/g, "");
  const bodyGradientId = `robotBody-${rawId}`;
  const screenGradientId = `robotScreen-${rawId}`;
  const primaryGradientId = `robotPrimary-${rawId}`;
  const shadowFilterId = `robotSoftShadow-${rawId}`;
  const screenGlowFilterId = `robotScreenGlow-${rawId}`;
  const normalizedMood = moodAliases[mood] || mood;
  const expression = expressionMap[normalizedMood] || expressionMap.neutral;
  const robotClass = `robot-mascot robot-mood-${normalizedMood}`;

  return (
    <svg viewBox="0 0 220 240" role="img" aria-label={`robo mascote ${normalizedMood}`} className={robotClass}>
      <defs>
        <linearGradient id={bodyGradientId} x1="50" x2="170" y1="48" y2="224" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffdf6" />
          <stop offset="0.56" stopColor={bodyColor} />
          <stop offset="1" stopColor="#e7dfcf" />
        </linearGradient>
        <linearGradient id={screenGradientId} x1="57" x2="163" y1="61" y2="133" gradientUnits="userSpaceOnUse">
          <stop stopColor={screenColor} />
          <stop offset="1" stopColor={shadowColor} />
        </linearGradient>
        <linearGradient id={primaryGradientId} x1="36" x2="179" y1="24" y2="225" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="1" stopColor={shadowColor} />
        </linearGradient>
        <filter id={shadowFilterId} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor={shadowColor} floodOpacity="0.3" />
        </filter>
        <filter id={screenGlowFilterId}>
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={secondaryColor} floodOpacity={expression.glow} />
        </filter>
      </defs>

      <ellipse cx="110" cy="226" rx="58" ry="10" fill="#050816" opacity="0.35" />

      <g className="robot-antennas">
        <path d="M87 58L80 17" stroke={outlineColor} strokeWidth="7" strokeLinecap="round" />
        <path d="M133 58L140 17" stroke={outlineColor} strokeWidth="7" strokeLinecap="round" />
        <circle cx="78" cy="15" r="11" fill={primaryColor} />
        <circle cx="142" cy="15" r="11" fill={primaryColor} />
        <circle cx="74" cy="10" r="4" fill="#fff" opacity="0.32" />
        <circle cx="138" cy="10" r="4" fill="#fff" opacity="0.32" />
      </g>

      <g filter={`url(#${shadowFilterId})`}>
        <path d="M70 151C77 132 93 122 110 122C127 122 143 132 150 151L159 197C163 218 150 231 132 227L113 223L88 227C70 231 57 218 61 197Z" fill={`url(#${bodyGradientId})`} stroke={outlineColor} strokeWidth="4" />
        <path d="M72 158Q110 139 148 158" fill="none" stroke="#fff" strokeWidth="5" opacity="0.52" strokeLinecap="round" />

        <path d={expression.armLeft} stroke={`url(#${bodyGradientId})`} strokeWidth="24" strokeLinecap="round" fill="none" />
        <path d={expression.armRight} stroke={`url(#${bodyGradientId})`} strokeWidth="24" strokeLinecap="round" fill="none" />
        <path d={expression.armLeft} stroke={outlineColor} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75" />
        <path d={expression.armRight} stroke={outlineColor} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75" />
        <RobotHand side="left" color={primaryColor} outline={shadowColor} />
        <RobotHand side="right" color={primaryColor} outline={shadowColor} />

        <path d="M89 201Q82 218 82 229" stroke={`url(#${bodyGradientId})`} strokeWidth="22" strokeLinecap="round" />
        <path d="M131 201Q138 218 138 229" stroke={`url(#${bodyGradientId})`} strokeWidth="22" strokeLinecap="round" />
        <path d="M77 224Q88 214 101 224Q98 238 79 237Q64 236 67 228Q70 224 77 224Z" fill={`url(#${primaryGradientId})`} />
        <path d="M143 224Q132 214 119 224Q122 238 141 237Q156 236 153 228Q150 224 143 224Z" fill={`url(#${primaryGradientId})`} />
        <ellipse cx="99" cy="226" rx="4" ry="9" fill={shadowColor} opacity="0.7" />
        <ellipse cx="121" cy="226" rx="4" ry="9" fill={shadowColor} opacity="0.7" />

        <rect x="80" y="154" width="60" height="43" rx="16" fill={bodyColor} stroke={outlineColor} strokeWidth="4" />
        <rect x="87" y="161" width="46" height="31" rx="10" fill={primaryColor} />
        <path d="M94 176C99 162 104 190 110 176C116 162 121 190 127 174" stroke={secondaryColor} strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="94" y="201" width="32" height="8" rx="4" fill={primaryColor} opacity="0.9" />
      </g>

      <g className="robot-head" filter={`url(#${shadowFilterId})`}>
        <path d="M42 93C42 59 60 43 94 42C105 41 115 41 126 42C160 43 178 59 178 93V103C178 135 160 151 126 153C115 154 105 154 94 153C60 151 42 135 42 103Z" fill={`url(#${bodyGradientId})`} stroke={outlineColor} strokeWidth="4" />
        <path d="M35 86C35 74 40 67 46 67H52V119H46C40 119 35 112 35 100Z" fill={primaryColor} opacity="0.86" />
        <path d="M185 86C185 74 180 67 174 67H168V119H174C180 119 185 112 185 100Z" fill={primaryColor} opacity="0.86" />
        <path d="M55 91C56 68 69 56 94 55C105 54 115 54 126 55C151 56 164 68 165 91V99C164 122 151 133 126 134C115 135 105 135 94 134C69 133 56 122 55 99Z" fill={`url(#${screenGradientId})`} filter={`url(#${screenGlowFilterId})`} />
        <path className="robot-screen-sweep" d="M66 65C91 57 128 56 153 65" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.22" />
        <path d="M64 82C67 68 74 62 91 60" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.72" />
        <circle cx="98" cy="60" r="5" fill="#fff" opacity="0.17" />
        <path d="M154 119Q145 126 133 126" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.2" />

        <path d={expression.browLeft} stroke="#171225" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d={expression.browRight} stroke="#171225" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        <RobotEye cx={86} cy={88} type={expression.eye} color={secondaryColor} />
        <RobotEye cx={134} cy={88} type={expression.eye} color={secondaryColor} flip />
        <path d={expression.mouth} stroke={secondaryColor} strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function RobotEye({ cx, cy, type, color, flip = false }) {
  if (type === "angry") {
    return <path className="robot-eye" d={flip ? `M${cx - 10} ${cy - 4}L${cx + 10} ${cy + 4}` : `M${cx - 10} ${cy + 4}L${cx + 10} ${cy - 4}`} stroke={color} strokeWidth="9" strokeLinecap="round" />;
  }
  if (type === "sad") {
    return <ellipse className="robot-eye" cx={cx} cy={cy + 4} rx="8" ry="11" fill={color} opacity="0.86" />;
  }
  if (type === "excited") {
    return <ellipse className="robot-eye" cx={cx} cy={cy} rx="10" ry="14" fill={color} />;
  }
  if (type === "judging") {
    return <path className="robot-eye" d={`M${cx - 11} ${cy}H${cx + 11}`} stroke={color} strokeWidth="8" strokeLinecap="round" />;
  }
  return <ellipse className="robot-eye" cx={cx} cy={cy} rx="8" ry="12" fill={color} />;
}

function RobotHand({ side, color, outline }) {
  const flip = side === "right";
  const x = flip ? 176 : 44;
  const y = 166;
  const scale = flip ? "scale(-1 1)" : "";
  const origin = `${x} ${y}`;
  return (
    <g transform={`translate(${x} ${y}) ${scale}`} style={{ transformOrigin: origin }}>
      <path d="M0 0C-13 5 -21 14 -18 22C-9 21 -5 16 -2 12C-5 20 0 25 8 21C7 16 8 12 11 9C12 17 18 20 23 14C18 4 9 -3 0 0Z" fill={color} stroke={outline} strokeWidth="3" />
      <path d="M-4 7C-8 13 -11 16 -16 18M3 10C1 15 0 18 -2 20M10 9C12 13 15 15 20 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
    </g>
  );
}
