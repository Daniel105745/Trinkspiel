"use client";

import { useState, useEffect } from "react";
import { SkipForward, Plus, X, Users2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

const WER_WUERDE_EHER_18PLUS: Aufgabe[] = [
  { id: -1,  text: "auf einer Party mit einer fremden Person nach Hause gehen?", typ: "wer_wuerde_eher" },
  { id: -2,  text: "ein Geheimnis preisgeben, nachdem er/sie getrunken hat?", typ: "wer_wuerde_eher" },
  { id: -3,  text: "einen One-Night-Stand nicht bereuen?", typ: "wer_wuerde_eher" },
  { id: -4,  text: "seinen/ihren Ex um 3 Uhr morgens anrufen?", typ: "wer_wuerde_eher" },
  { id: -5,  text: "heimlich jemand anderen attraktiver finden als den eigenen Partner?", typ: "wer_wuerde_eher" },
  { id: -6,  text: "eine heimliche Affäre haben?", typ: "wer_wuerde_eher" },
  { id: -7,  text: "beim Dating absichtlich lügen?", typ: "wer_wuerde_eher" },
  { id: -8,  text: "mit einem Promi flirten und dabei seine Hemmungen verlieren?", typ: "wer_wuerde_eher" },
  { id: -9,  text: "auf einer Party im Freien knutschen?", typ: "wer_wuerde_eher" },
  { id: -10, text: "einen Kuss für einen Drink tauschen?", typ: "wer_wuerde_eher" },
  { id: -11, text: "nackt schwimmen gehen, wenn es niemand sieht?", typ: "wer_wuerde_eher" },
  { id: -12, text: "jemanden im Internet ansprechen und ein Date vorschlagen?", typ: "wer_wuerde_eher" },
  { id: -13, text: "auf Tinder alle nach rechts swipen?", typ: "wer_wuerde_eher" },
  { id: -14, text: "eine Beziehung per SMS beenden?", typ: "wer_wuerde_eher" },
  { id: -15, text: "auf einer Hochzeit jemanden aufreißen?", typ: "wer_wuerde_eher" },
  { id: -16, text: "ein Blind Date akzeptieren und danach direkt mehr wollen?", typ: "wer_wuerde_eher" },
  { id: -17, text: "auf einem Festival verschwinden und erst am nächsten Morgen zurückkommen?", typ: "wer_wuerde_eher" },
  { id: -18, text: "seine gesamte Beziehungsgeschichte beim ersten Date erzählen?", typ: "wer_wuerde_eher" },
  { id: -19, text: "jemanden nur anschreiben, um Aufmerksamkeit zu bekommen?", typ: "wer_wuerde_eher" },
  { id: -20, text: "im Flugzeug jemanden kennenlernen und die Nummer nehmen?", typ: "wer_wuerde_eher" },
  { id: -21, text: "beim Speed-Dating mitmachen und alle beeindrucken?", typ: "wer_wuerde_eher" },
  { id: -22, text: "nach dem dritten Date 'Ich liebe dich' sagen?", typ: "wer_wuerde_eher" },
  { id: -23, text: "mit jemandem ausgehen, der/die 10 Jahre älter ist?", typ: "wer_wuerde_eher" },
  { id: -24, text: "den ganzen Abend über seinen/ihren Ex reden?", typ: "wer_wuerde_eher" },
  { id: -25, text: "beim ersten Date zu viel trinken?", typ: "wer_wuerde_eher" },
  { id: -26, text: "das Dating-Profil stark übertreiben?", typ: "wer_wuerde_eher" },
  { id: -27, text: "gleichzeitig mit zwei Personen schreiben?", typ: "wer_wuerde_eher" },
  { id: -28, text: "seinen/ihren Ex auf Social Media stalken?", typ: "wer_wuerde_eher" },
  { id: -29, text: "Strip-Poker spielen und gewinnen?", typ: "wer_wuerde_eher" },
  { id: -30, text: "unter dem Tisch mit jemandem flirten?", typ: "wer_wuerde_eher" },
  { id: -31, text: "eine Wette eingehen, bei der er/sie sich auszieht?", typ: "wer_wuerde_eher" },
  { id: -32, text: "ein heimliches Verhältnis haben?", typ: "wer_wuerde_eher" },
  { id: -33, text: "jemanden nach einer Party einladen, ohne Absichten zu haben – und sie dann doch zu haben?", typ: "wer_wuerde_eher" },
  { id: -34, text: "auf einer Party einschlafen und nicht merken, was passiert?", typ: "wer_wuerde_eher" },
  { id: -35, text: "eine Beziehung nur wegen Äußerlichkeiten beginnen?", typ: "wer_wuerde_eher" },
  { id: -36, text: "beim ersten Kuss die falsche Richtung wählen?", typ: "wer_wuerde_eher" },
  { id: -37, text: "auf Social Media eine romantische Liebeserklärung posten?", typ: "wer_wuerde_eher" },
  { id: -38, text: "bei einer Gruppenreise ein Doppelzimmer mit jemandem teilen wollen?", typ: "wer_wuerde_eher" },
  { id: -39, text: "absichtlich jemanden eifersüchtig machen?", typ: "wer_wuerde_eher" },
  { id: -40, text: "nach einem schlechten Date sofort das nächste planen?", typ: "wer_wuerde_eher" },
  { id: -41, text: "jemanden ghosten, nur weil er/sie zu viel schreibt?", typ: "wer_wuerde_eher" },
  { id: -42, text: "in einer Bar jemanden mit einer schlechten Pickup-Line ansprechen?", typ: "wer_wuerde_eher" },
  { id: -43, text: "auf einem ersten Date ein Foto machen und auf Instagram posten?", typ: "wer_wuerde_eher" },
  { id: -44, text: "aus einer Beziehung durch ein Meme ausbrechen?", typ: "wer_wuerde_eher" },
  { id: -45, text: "jemanden daten, der/die einen Freund/eine Freundin kennt?", typ: "wer_wuerde_eher" },
  { id: -46, text: "beim nächsten Singleurlaub eine Affäre haben?", typ: "wer_wuerde_eher" },
  { id: -47, text: "spontan über Nacht bei jemandem bleiben, den er/sie gerade erst kennengelernt hat?", typ: "wer_wuerde_eher" },
  { id: -48, text: "auf einer Party die meisten Nummern einsammeln?", typ: "wer_wuerde_eher" },
  { id: -49, text: "jemanden schon beim ersten Treffen küssen?", typ: "wer_wuerde_eher" },
  { id: -50, text: "auf einem Date das Handy nicht aus der Hand legen können?", typ: "wer_wuerde_eher" },
  { id: -51, text: "heimlich einen Crush auf jemanden im Raum haben?", typ: "wer_wuerde_eher" },
  { id: -52, text: "jemanden nach Hause einladen und dann die Meinung ändern?", typ: "wer_wuerde_eher" },
];

function zweiZufälligeSpieler(spieler: string[]): [string, string] {
  const s = [...spieler].sort(() => Math.random() - 0.5);
  return [s[0], s[1]];
}

const GLASS =
  "border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]";

export default function WerWürdeEher() {
  const [spieler, setSpieler] = useState<string[]>([]);
  const [eingabe, setEingabe] = useState("");
  const [phase, setPhase] = useState<"setup" | "spiel">("setup");
  const [supabaseCards, setSupabaseCards] = useState<Aufgabe[]>([]);
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [aktiveSpieler, setAktiveSpieler] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  async function spielStarten() {
    setLoading(true);
    const { data } = await supabase
      .from("aufgaben")
      .select("id, text, typ")
      .eq("typ", "wer_wuerde_eher");
    const fetched = (data as Aufgabe[]) ?? [];
    setSupabaseCards(fetched);

    let pool = [...fetched];
    if (modus === "18+") pool = [...pool, ...WER_WUERDE_EHER_18PLUS];
    if (pool.length > 0) {
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIndex(0);
      setAktiveSpieler(zweiZufälligeSpieler(spieler));
    }
    setLoading(false);
    setPhase("spiel");
  }

  // Rebuild when modus changes while in game
  useEffect(() => {
    if (phase !== "spiel") return;
    let pool = [...supabaseCards];
    if (modus === "18+") pool = [...pool, ...WER_WUERDE_EHER_18PLUS];
    if (pool.length > 0) {
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIndex(0);
    }
  }, [modus]); // eslint-disable-line react-hooks/exhaustive-deps

  function nächsteRunde() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setAktiveSpieler(zweiZufälligeSpieler(spieler));
  }

  function spielerHinzufügen() {
    const name = eingabe.trim();
    if (name && !spieler.includes(name)) setSpieler([...spieler, name]);
    setEingabe("");
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nächsteRunde,
    onSwipedRight: nächsteRunde,
    preventScrollOnSwipe: true,
  });

  const card = index >= 0 ? cards[index] : null;

  if (phase === "setup") {
    return (
      <GameLayout
        title="Am ehesten würde..."
        titleIcon={<Users2 className="h-4 w-4 text-emerald-400" />}
        glowColor="rgba(52,211,153,0.10)"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm font-bold text-zinc-400">
            Mindestens 2 Spieler hinzufügen
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && spielerHinzufügen()}
              placeholder="Name eingeben..."
              className="flex-1 rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl px-4 py-3 font-bold text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={spielerHinzufügen}
              disabled={!eingabe.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-5 w-5 text-white" />
            </button>
          </div>

          {spieler.length > 0 && (
            <div className="flex flex-col gap-2">
              {spieler.map((name) => (
                <div
                  key={name}
                  className={`flex items-center justify-between rounded-2xl ${GLASS} px-4 py-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/60 text-sm font-black text-emerald-300">
                      {name[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-white">{name}</span>
                  </div>
                  <button onClick={() => setSpieler(spieler.filter((s) => s !== name))}>
                    <X className="h-4 w-4 text-zinc-500 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 18+ Toggle in Setup */}
          <button
            onClick={() => setModus((m) => (m === "normal" ? "18+" : "normal"))}
            className={`
              flex w-full items-center justify-center gap-2
              rounded-2xl py-3 text-base font-black transition-all active:scale-95
              ${modus === "18+"
                ? "border border-red-500/40 bg-red-950/60 text-red-300"
                : "border border-white/[0.10] bg-white/[0.04] text-zinc-500"
              }
            `}
          >
            🔞 {modus === "18+" ? "18+ Modus aktiv" : "18+ Modus aktivieren"}
          </button>

          <button
            onClick={spielStarten}
            disabled={spieler.length < 2 || loading}
            className="
              mt-2 flex w-full items-center justify-center gap-2 rounded-3xl
              bg-gradient-to-r from-emerald-500 to-green-400
              py-5 text-xl font-black text-white
              shadow-[0_0_20px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all active:scale-95 disabled:opacity-40
            "
          >
            <Users2 className="h-5 w-5" />
            Spielen! ({spieler.length} Spieler)
          </button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Am ehesten würde..."
      titleIcon={<Users2 className="h-4 w-4 text-emerald-400" />}
      glowColor="rgba(52,211,153,0.10)"
      counter={cards.length > 0 ? `${index + 1}/${cards.length}` : ""}
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 items-center justify-center py-4">
          {!card ? (
            <p className="font-black text-zinc-500">Keine Karten gefunden.</p>
          ) : (
            <div
              {...swipeHandlers}
              style={{ touchAction: "pan-y" }}
              className={`card-animate relative w-full max-w-sm overflow-hidden rounded-3xl ${GLASS} select-none`}
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 to-green-400" />
              <div className="p-6 pb-8 pt-7">

                {/* VS Header – prominent oben */}
                {aktiveSpieler && (
                  <div className="mb-6 text-center">
                    <p className="text-[28px] font-black text-white leading-tight">
                      {aktiveSpieler[0]}{" "}
                      <span className="text-lg text-zinc-500">vs</span>{" "}
                      {aktiveSpieler[1]}
                    </p>
                  </div>
                )}

                {/* Frage zentriert und groß */}
                <div className="my-4 text-center text-5xl">🤷</div>
                <p className="text-center text-[26px] font-black text-white leading-snug">
                  Wer würde am ehesten... {card.text}
                </p>

                <p className="mt-8 text-center text-xs font-semibold text-zinc-400">
                  ← Swipe für nächste Runde →
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 18+ Toggle */}
        <button
          onClick={() => setModus((m) => (m === "normal" ? "18+" : "normal"))}
          className={`
            mb-3 flex w-full items-center justify-center gap-2
            rounded-2xl py-3 text-base font-black transition-all active:scale-95
            ${modus === "18+"
              ? "border border-red-500/40 bg-red-950/60 text-red-300"
              : "border border-white/[0.10] bg-white/[0.04] text-zinc-500"
            }
          `}
        >
          🔞 {modus === "18+" ? "18+ Modus aktiv – Tap zum Deaktivieren" : "18+ Modus aktivieren"}
        </button>

        {/* Buttons */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={() => setPhase("setup")}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-2xl py-[14px] font-black text-base text-zinc-300
              border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              transition-all active:scale-95
            `}
          >
            <Users2 className="h-4 w-4" />
            Spieler
          </button>
          <button
            onClick={nächsteRunde}
            className="
              flex flex-1 items-center justify-center gap-2
              rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400
              py-[14px] text-lg font-black text-white
              shadow-[0_0_20px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all active:scale-95
            "
          >
            <SkipForward className="h-5 w-5" />
            Nächste Runde
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
