"use client";

import Link from "next/link";
import { Globe, ChevronRight } from "lucide-react";

const SPIELE = [
  {
    href: "/wahrheit-oder-pflicht",
    title: "Wahrheit oder Pflicht",
    sub: "Truth or Dare",
    emoji: "🔥",
    grad: "from-violet-600 to-pink-500",
    cardBg: "from-violet-900/25 to-purple-950/10",
    border: "border-violet-500/20",
    glow: "shadow-[0_4px_28px_rgba(139,92,246,0.12)]",
    tag: "Klassiker",
    tagC: "bg-violet-500/15 text-violet-300",
  },
  {
    href: "/ich-hab-noch-nie",
    title: "Ich hab noch nie",
    sub: "Never Have I Ever",
    emoji: "🙊",
    grad: "from-sky-400 to-cyan-500",
    cardBg: "from-sky-900/25 to-blue-950/10",
    border: "border-sky-500/20",
    glow: "shadow-[0_4px_28px_rgba(14,165,233,0.10)]",
    tag: "Sozial",
    tagC: "bg-sky-500/15 text-sky-300",
  },
  {
    href: "/wer-wuerde-eher",
    title: "Am ehesten würde…",
    sub: "Most Likely To",
    emoji: "🤷",
    grad: "from-emerald-400 to-green-500",
    cardBg: "from-emerald-900/25 to-green-950/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_4px_28px_rgba(52,211,153,0.10)]",
    tag: "Gruppenspiel",
    tagC: "bg-emerald-500/15 text-emerald-300",
  },
  {
    href: "/imposter",
    title: "Imposter",
    sub: "Wer ist der Verräter?",
    emoji: "🕵️",
    grad: "from-red-500 to-orange-500",
    cardBg: "from-red-900/25 to-red-950/10",
    border: "border-red-500/20",
    glow: "shadow-[0_4px_28px_rgba(239,68,68,0.10)]",
    tag: "Detektiv",
    tagC: "bg-red-500/15 text-red-300",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pb-10 overflow-x-hidden">
      {/* ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 12%, rgba(139,92,246,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-6 gap-4">
        <div className="relative">
          <div className="absolute inset-0 scale-[2.4] rounded-full bg-violet-600/12 blur-3xl anim-glow" />
          <div className="relative anim-float flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-[0_6px_28px_rgba(139,92,246,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]">
            <span className="text-[40px] leading-none">🍺</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-[32px] font-black text-white tracking-tight leading-none">
            Trinkspiel
          </h1>
          <p className="text-[32px] font-black text-grad-violet tracking-tight leading-none">
            App
          </p>
          <p className="mt-2.5 text-[11px] font-bold text-zinc-500 tracking-[0.3em] uppercase">
            Party • Spaß • Chaos
          </p>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full mb-5">
        <div className="glass rounded-[14px] px-4 py-2.5 flex items-center justify-around">
          {[
            { v: "4", l: "Spiele" },
            { v: "500+", l: "Fragen" },
            { v: "∞", l: "Spaß" },
          ].map(({ v, l }) => (
            <div key={l} className="text-center">
              <p className="text-[20px] font-black text-white leading-none">{v}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em] mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Spiele-Grid ──────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full grid grid-cols-2 gap-2.5">
        {SPIELE.map(({ href, title, sub, emoji, grad, cardBg, border, glow, tag, tagC }, i) => (
          <Link
            key={href}
            href={href}
            className={`
              anim-pop group relative flex flex-col rounded-[var(--r-xl)] overflow-hidden
              border ${border} bg-gradient-to-br ${cardBg}
              backdrop-blur-xl ${glow}
              hover:brightness-110
              transition-all duration-200 active:scale-[0.96]
              p-3.5 min-h-[168px]
            `}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-[var(--r-xl)]" />

            {/* icon */}
            <div className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br ${grad} shadow-[0_3px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]`}>
              <span className="text-[20px]">{emoji}</span>
            </div>

            {/* tag */}
            <span className={`self-start mb-1.5 rounded-full px-2 py-[2px] text-[9px] font-extrabold uppercase tracking-wider ${tagC}`}>
              {tag}
            </span>

            {/* text */}
            <p className="text-[14px] font-extrabold text-white leading-tight">{title}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-zinc-500 leading-tight">{sub}</p>

            {/* arrow */}
            <div className="mt-auto pt-1.5 flex justify-end">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/8 group-hover:bg-white/15 transition-colors">
                <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 my-5 flex w-full items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/8" />
        <span className="text-[10px] font-extrabold tracking-[0.4em] text-zinc-600 uppercase">oder</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/8" />
      </div>

      {/* ── Online CTA ───────────────────────────────────────────────────── */}
      <Link href="/online" className="relative z-10 w-full">
        <div className="relative overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_28px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-200 active:scale-[0.97]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/20">
                <Globe className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-white leading-none">Online Multiplayer</p>
                <p className="text-[11px] font-semibold text-sky-100/70 mt-0.5">Mit Freunden spielen</p>
              </div>
            </div>
            <ChevronRight className="h-[18px] w-[18px] text-white/70" />
          </div>
        </div>
      </Link>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <p className="relative z-10 mt-6 text-center text-[11px] font-semibold text-zinc-600">
        Nur für Personen ab 18 Jahren 🔞
      </p>
    </main>
  );
}
