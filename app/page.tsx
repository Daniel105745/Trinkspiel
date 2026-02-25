import Link from "next/link";
import { Eye, Zap, Users2, Radio, Globe } from "lucide-react";

const SPIELE = [
  {
    href: "/wahrheit-oder-pflicht",
    title: "Wahrheit oder Pflicht",
    subtitle: "Truth or Dare",
    Icon: Eye,
    iconGradient: "from-violet-500 to-purple-700",
    cardBg: "bg-[#1a0b2e]",
    border: "border-purple-900/40",
  },
  {
    href: "/ich-hab-noch-nie",
    title: "Ich hab noch nie",
    subtitle: "Never Have I Ever",
    Icon: Zap,
    iconGradient: "from-sky-400 to-blue-600",
    cardBg: "bg-[#0b152e]",
    border: "border-blue-900/40",
  },
  {
    href: "/wer-wuerde-eher",
    title: "Am ehesten würde...",
    subtitle: "Most Likely To",
    Icon: Users2,
    iconGradient: "from-green-400 to-emerald-600",
    cardBg: "bg-[#0b200f]",
    border: "border-green-900/40",
  },
  {
    href: "/buzzer",
    title: "Buzzer Mode",
    subtitle: "Wer drückt zuerst?",
    Icon: Radio,
    iconGradient: "from-orange-400 to-red-600",
    cardBg: "bg-[#2a0b0b]",
    border: "border-red-900/40",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0f1e] flex flex-col items-center px-5 pb-10">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 pt-16 pb-10">
        <div className="relative">
          <div className="absolute inset-0 scale-[2] rounded-full bg-violet-600/25 blur-3xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-pink-500 text-5xl shadow-2xl shadow-violet-900/60">
            🍺
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Trinkspiel App
          </h1>
          <p className="mt-2 text-lg text-zinc-400 tracking-wide">
            Party • Spaß • Chaos
          </p>
        </div>
      </div>

      {/* Spielkarten */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        {SPIELE.map(({ href, title, subtitle, Icon, iconGradient, cardBg, border }) => (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[160px] flex-col rounded-3xl border p-4 transition-transform active:scale-95 ${cardBg} ${border}`}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-base font-black text-white leading-tight">{title}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-400">{subtitle}</p>
          </Link>
        ))}
      </div>

      {/* ODER Divider */}
      <div className="my-7 flex w-full max-w-sm items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-black tracking-[0.3em] text-zinc-500">ODER</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Online Multiplayer */}
      <Link href="/online" className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-sky-400 to-cyan-300 py-5 text-xl font-black text-white shadow-xl shadow-sky-900/40 active:scale-95 transition-transform">
          <Globe className="h-6 w-6" />
          Online Multiplayer
        </div>
      </Link>

      {/* Footer */}
      <p className="mt-8 text-sm font-semibold text-zinc-600">
        Nur für Personen ab 18 Jahren 🔞
      </p>
    </main>
  );
}
