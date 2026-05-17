import React from "react";
import { Flame, Heart, Meh } from "lucide-react";

const moodMap = {
  happy: {
    icon: Heart,
    label: "feliz",
    mouth: "M72 125C88 145 112 145 128 125",
    brows: "M60 76L82 70 M110 70L132 76",
    color: "from-teal-300 to-emerald-300",
  },
  angry: {
    icon: Flame,
    label: "irritado",
    mouth: "M74 132C90 120 110 120 126 132",
    brows: "M60 68L84 78 M108 78L132 68",
    color: "from-rose-300 to-amber-300",
  },
  neutral: {
    icon: Meh,
    label: "alerta",
    mouth: "M78 128H122",
    brows: "M62 72H84 M108 72H130",
    color: "from-teal-300 to-amber-300",
  },
};

export function PetAvatar({ mood = "neutral", compact = false }) {
  const current = moodMap[mood] ?? moodMap.neutral;
  const Icon = current.icon;

  return (
    <div className={`relative mx-auto ${compact ? "w-36" : "w-full max-w-[230px]"} animate-floaty`}>
      <div className={`absolute inset-x-6 bottom-0 h-12 rounded-full bg-gradient-to-r ${current.color} blur-2xl opacity-40`} />
      <svg viewBox="0 0 200 210" className="relative w-full drop-shadow-2xl" role="img" aria-label={`Pet ${current.label}`}>
        <path d="M58 52C42 33 28 34 20 56C36 56 48 63 58 76V52Z" fill="#fbbf24" />
        <path d="M142 52C158 33 172 34 180 56C164 56 152 63 142 76V52Z" fill="#fbbf24" />
        <path d="M38 92C38 55 62 32 100 32C138 32 162 55 162 92V124C162 160 137 184 100 184C63 184 38 160 38 124V92Z" fill="url(#petGradient)" />
        <path d="M70 100C70 94 74 89 80 89C86 89 90 94 90 100C90 106 86 111 80 111C74 111 70 106 70 100Z" fill="#0f172a" />
        <path d="M110 100C110 94 114 89 120 89C126 89 130 94 130 100C130 106 126 111 120 111C114 111 110 106 110 100Z" fill="#0f172a" />
        <path d={current.brows} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
        <path d="M45 84C55 75 79 73 96 79C101 82 103 88 101 96C98 109 87 117 72 115C58 113 48 105 45 93C44 90 43 86 45 84Z" fill="#151515" />
        <path d="M155 84C145 75 121 73 104 79C99 82 97 88 99 96C102 109 113 117 128 115C142 113 152 105 155 93C156 90 157 86 155 84Z" fill="#151515" />
        <path d="M50 85C58 79 78 78 92 82C96 84 97 88 96 93C93 104 84 110 73 109C62 108 54 102 52 93C51 90 49 87 50 85Z" fill="url(#julietLeft)" />
        <path d="M150 85C142 79 122 78 108 82C104 84 103 88 104 93C107 104 116 110 127 109C138 108 146 102 148 93C149 90 151 87 150 85Z" fill="url(#julietRight)" />
        <path d="M98 86C100 84 100 84 102 86" stroke="#151515" strokeWidth="8" strokeLinecap="round" />
        <path d="M42 84C35 82 31 83 27 88" stroke="#151515" strokeWidth="7" strokeLinecap="round" />
        <path d="M158 84C165 82 169 83 173 88" stroke="#151515" strokeWidth="7" strokeLinecap="round" />
        <path d="M58 84C67 80 82 80 91 84" stroke="#ffb13b" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <path d="M142 84C133 80 118 80 109 84" stroke="#ff4f86" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <path d="M100 112L90 122H110L100 112Z" fill="#0f172a" />
        <path d={current.mouth} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="56" cy="120" r="8" fill="#fb7185" opacity="0.4" />
        <circle cx="144" cy="120" r="8" fill="#fb7185" opacity="0.4" />
        <defs>
          <linearGradient id="petGradient" x1="42" x2="160" y1="40" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5eead4" />
            <stop offset="1" stopColor="#facc15" />
          </linearGradient>
          <linearGradient id="julietLeft" x1="52" x2="96" y1="96" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff8a1d" />
            <stop offset="0.48" stopColor="#ff3d7f" />
            <stop offset="1" stopColor="#ff5f9e" />
          </linearGradient>
          <linearGradient id="julietRight" x1="104" x2="150" y1="96" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff8a1d" />
            <stop offset="0.5" stopColor="#ff3d7f" />
            <stop offset="1" stopColor="#ff5f9e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute right-2 top-4 rounded-full border border-white/20 bg-slate-950/70 p-2 text-white backdrop-blur">
        <Icon size={20} />
      </div>
    </div>
  );
}
