import Link from "next/link";
import { Globe } from "lucide-react";

const SPIELE = [
  {
    href: "/wahrheit-oder-pflicht",
    title: "Wahrheit oder Pflicht",
    subtitle: "Truth or Dare",
    emoji: "🤔",
    stripe: "from-violet-500 to-pink-500",
  },
  {
    href: "/ich-hab-noch-nie",
    title: "Ich hab noch nie",
    subtitle: "Never Have I Ever",
    emoji: "⚡",
    stripe: "from-sky-400 to-cyan-400",
  },
  {
    href: "/wer-wuerde-eher",
    title: "Am ehesten würde...",
    subtitle: "Most Likely To",
    emoji: "🙋",
    stripe: "from-emerald-400 to-green-500",
  },
  {
    href: "/imposter",
    title: "Imposter",
    subtitle: "Wer ist der Verräter?",
    emoji: "🕵️",
    stripe: "from-red-500 to-orange-500",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0f1e] flex flex-col items-center px-5 pb-10">

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center gap-4 pt-10 pb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/[0.07] border border-white/[0.12] text-4xl shadow-lg">
          🍺
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Trinkspiel
          </h1>
          <p className="mt-2 text-[18px] font-semibold text-zinc-400">
            Party · Spaß · Chaos
          </p>
        </div>
      </div>

      {/* Spielkarten – 2×2 Grid */}
      <div className="relative z-10 grid w-full max-w-sm grid-cols-2 gap-4">
        {SPIELE.map(({ href, title, subtitle, emoji, stripe }) => (
          <Link
            key={href}
            href={href}
            className="
              group relative flex min-h-[160px] flex-col overflow-hidden rounded-3xl
              border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-200
              active:scale-[0.97]
            "
          >
            {/* Farbiger Top-Stripe */}
            <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${stripe}`} />

            <div className="flex flex-1 flex-col p-4 pt-5">
              <span className="mb-3 text-[32px] leading-none">{emoji}</span>
              <p className="text-[20px] font-black text-white leading-tight">{title}</p>
              <p className="mt-1 text-[18px] font-semibold text-zinc-400">{subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ODER Divider */}
      <div className="relative z-10 my-7 flex w-full max-w-sm items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[18px] font-black tracking-[0.3em] text-zinc-500">ODER</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      {/* Online Multiplayer */}
      <Link href="/online" className="relative z-10 w-full max-w-sm">
        <div
          className="
            flex items-center justify-center gap-3 rounded-3xl
            border border-white/[0.15] bg-white/[0.06]
            py-5 text-xl font-black text-white
            transition-all duration-200 active:scale-[0.97]
          "
        >
          <Globe className="h-6 w-6" />
          Online Multiplayer
        </div>
      </Link>

      {/* Footer */}
      <p className="relative z-10 mt-8 mb-2 text-center text-[18px] font-semibold text-zinc-400">
        Nur für Personen ab 18 Jahren 🔞
      </p>
    </main>
  );
}
