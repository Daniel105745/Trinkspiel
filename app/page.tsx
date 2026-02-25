import Link from "next/link";
import { Beer, Scale, Hand, Users, Zap, ChevronRight, Globe } from "lucide-react";

const LOKALE_SPIELE = [
  {
    href: "/wahrheit-oder-pflicht",
    title: "Wahrheit oder Pflicht",
    desc: "Frage oder Aufgabe – du entscheidest",
    Icon: Scale,
    accent: "text-sky-400",
    border: "border-sky-900/60",
    bg: "bg-sky-950/30",
    glow: "hover:border-sky-700/80",
  },
  {
    href: "/ich-hab-noch-nie",
    title: "Ich hab noch nie...",
    desc: "Gestehe und trink wenn nötig",
    Icon: Hand,
    accent: "text-emerald-400",
    border: "border-emerald-900/60",
    bg: "bg-emerald-950/30",
    glow: "hover:border-emerald-700/80",
  },
  {
    href: "/wer-wuerde-eher",
    title: "Wer würde eher...?",
    desc: "Kombiniert Freunde mit Aufgaben",
    Icon: Users,
    accent: "text-violet-400",
    border: "border-violet-900/60",
    bg: "bg-violet-950/30",
    glow: "hover:border-violet-700/80",
  },
  {
    href: "/buzzer",
    title: "Buzzer",
    desc: "Reaktionsspiel – wer langsam ist, trinkt",
    Icon: Zap,
    accent: "text-red-400",
    border: "border-red-900/60",
    bg: "bg-red-950/30",
    glow: "hover:border-red-700/80",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 p-6 pb-12">
      {/* Header */}
      <header className="flex w-full max-w-md items-center gap-3 pt-6 pb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400">
          <Beer className="h-6 w-6 text-zinc-950" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Trinkspiel</h1>
          <p className="text-sm text-zinc-500">Wähle ein Spiel</p>
        </div>
      </header>

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Lokal */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Lokal — Einzelgerät
          </p>
          <div className="grid grid-cols-2 gap-4">
            {LOKALE_SPIELE.map(({ href, title, desc, Icon, accent, border, bg, glow }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all active:scale-95 ${border} ${bg} ${glow}`}
              >
                <Icon className={`mb-4 h-8 w-8 ${accent}`} />
                <div>
                  <p className="font-bold text-zinc-100 leading-snug text-base">{title}</p>
                  <p className="mt-1 text-xs text-zinc-500 leading-snug">{desc}</p>
                </div>
                <ChevronRight className={`mt-4 h-4 w-4 self-end ${accent} opacity-60`} />
              </Link>
            ))}
          </div>
        </section>

        {/* Online */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Online — Mehrere Geräte
          </p>
          <Link
            href="/online"
            className="flex items-center justify-between rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 transition-all active:scale-95 hover:border-amber-700/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10">
                <Globe className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-zinc-100 text-base">Online Modus</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Raum erstellen oder beitreten
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400 opacity-60" />
          </Link>
        </section>
      </div>
    </main>
  );
}
