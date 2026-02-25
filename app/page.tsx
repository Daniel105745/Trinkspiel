import Link from "next/link";
import { Eye, Zap, Users2, Radio, Globe } from "lucide-react";

const SPIELE = [
  {
    href: "/wahrheit-oder-pflicht",
    title: "Wahrheit oder Pflicht",
    subtitle: "Truth or Dare",
    Icon: Eye,
    iconGradient: "from-violet-500 to-purple-700",
    cardGradient: "from-purple-900/50 to-purple-950/30",
    border: "border-purple-500/20",
  },
  {
    href: "/ich-hab-noch-nie",
    title: "Ich hab noch nie",
    subtitle: "Never Have I Ever",
    Icon: Zap,
    iconGradient: "from-sky-400 to-blue-600",
    cardGradient: "from-slate-800/60 to-blue-950/40",
    border: "border-sky-500/20",
  },
  {
    href: "/wer-wuerde-eher",
    title: "Am ehesten würde...",
    subtitle: "Most Likely To",
    Icon: Users2,
    iconGradient: "from-green-400 to-emerald-600",
    cardGradient: "from-green-900/50 to-green-950/30",
    border: "border-green-500/20",
  },
  {
    href: "/buzzer",
    title: "Buzzer Mode",
    subtitle: "Wer drückt zuerst?",
    Icon: Radio,
    iconGradient: "from-orange-400 to-red-600",
    cardGradient: "from-red-900/50 to-red-950/30",
    border: "border-red-500/20",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0f1e] flex flex-col items-center px-5 pb-10">
      {/* Hintergrund-Glow oben */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(139,92,246,0.18) 0%, transparent 60%)",
        }}
      />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center gap-4 pt-16 pb-10">
        <div className="relative">
          <div className="absolute inset-0 scale-[2.2] rounded-full bg-violet-600/30 blur-3xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-pink-500 text-5xl shadow-2xl shadow-violet-900/60">
            🍺
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Trinkspiel App
          </h1>
          <p className="mt-2 text-lg font-semibold text-zinc-400 tracking-wide">
            Party • Spaß • Chaos
          </p>
        </div>
      </div>

      {/* Spielkarten – 2×2 Glassmorphism Grid */}
      <div className="relative z-10 grid w-full max-w-sm grid-cols-2 gap-4">
        {SPIELE.map(({ href, title, subtitle, Icon, iconGradient, cardGradient, border }) => (
          <Link
            key={href}
            href={href}
            className={`
              group flex min-h-[160px] flex-col rounded-3xl border p-4
              bg-gradient-to-br ${cardGradient}
              ${border}
              backdrop-blur-xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.3)]
              transition-all duration-200
              hover:bg-white/[0.08] active:scale-95
            `}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-base font-black text-white leading-tight">{title}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-400">{subtitle}</p>
          </Link>
        ))}
      </div>

      {/* ODER Divider */}
      <div className="relative z-10 my-7 flex w-full max-w-sm items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-black tracking-[0.3em] text-zinc-500">ODER</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Online Multiplayer – intensiver Cyan-Glow */}
      <Link href="/online" className="relative z-10 w-full max-w-sm">
        <div
          className="
            flex items-center justify-center gap-3 rounded-3xl
            bg-gradient-to-r from-sky-400 to-cyan-300
            py-5 text-xl font-black text-white
            shadow-[0_0_30px_rgba(6,182,212,0.45),0_4px_20px_rgba(0,0,0,0.3)]
            transition-all duration-200 active:scale-95 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]
          "
        >
          <Globe className="h-6 w-6" />
          Online Multiplayer
        </div>
      </Link>

      {/* Footer – Safe Area */}
      <p className="relative z-10 mt-8 mb-2 text-center text-sm font-semibold text-zinc-600">
        Nur für Personen ab 18 Jahren 🔞
      </p>
    </main>
  );
}
