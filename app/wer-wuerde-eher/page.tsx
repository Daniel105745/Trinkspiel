"use client";

import { useState, useEffect } from "react";
import { SkipForward, Plus, X, Users2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";
import { WER_WUERDE_EHER_18_PLUS } from "@/lib/fragenData";

// 18+ Karten aus fragenData.ts – mit negativen IDs um Supabase-IDs nicht zu überschneiden
const WER_WUERDE_EHER_18PLUS: Aufgabe[] = WER_WUERDE_EHER_18_PLUS.map((text, i) => ({
  id: -(i + 1),
  text,
  typ: "wer_wuerde_eher",
}));

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
  const [fehler, setFehler] = useState<string | null>(null);

  async function spielStarten() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("aufgaben")
        .select("id, text, typ")
        .eq("typ", "wer_wuerde_eher");
      if (error) throw error;
      const fetched = (data as Aufgabe[]) ?? [];
      setSupabaseCards(fetched);

      let pool = [...fetched];
      if (modus === "18+") pool = [...pool, ...WER_WUERDE_EHER_18PLUS];
      if (pool.length === 0) {
        setLoading(false);
        setFehler("Keine Karten gefunden. Bitte Internetverbindung prüfen.");
        return;
      }
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIndex(0);
      setAktiveSpieler(zweiZufälligeSpieler(spieler));
      setFehler(null);
    } catch (err) {
      console.error("spielStarten Fehler:", err);
      setFehler("Fehler beim Laden der Karten. Bitte nochmal versuchen.");
      setLoading(false);
      return;
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
          <p className="text-center text-[18px] font-bold text-zinc-400">
            Mindestens 2 Spieler hinzufügen
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && spielerHinzufügen()}
              placeholder="Name eingeben..."
              className="flex-1 rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl px-4 py-3 text-[18px] font-bold text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={spielerHinzufügen}
              disabled={!eingabe.trim()}
              className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <Plus className="h-5 w-5 text-white" />
            </button>
          </div>

          {spieler.length > 0 && (
            <div className="flex flex-col gap-2">
              {spieler.map((name, i) => (
                <div
                  key={name}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`player-pop flex items-center justify-between rounded-2xl ${GLASS} px-4 py-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/60 text-base font-black text-emerald-300">
                      {name[0].toUpperCase()}
                    </div>
                    <span className="text-[18px] font-bold text-white">{name}</span>
                  </div>
                  <button
                    onClick={() => setSpieler(spieler.filter((s) => s !== name))}
                    className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl transition-colors active:bg-red-900/40"
                  >
                    <X className="h-5 w-5 text-zinc-400" />
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
              rounded-2xl py-[14px] text-[18px] font-black transition-all active:scale-[0.97]
              ${modus === "18+"
                ? "border border-red-500/40 bg-red-950/60 text-red-300"
                : "border border-white/[0.10] bg-white/[0.04] text-zinc-400"
              }
            `}
          >
            🔞 {modus === "18+" ? "18+ Modus aktiv" : "18+ Modus aktivieren"}
          </button>

          {fehler && (
            <p className="rounded-2xl border border-red-800 bg-red-950/50 px-4 py-3 text-[18px] font-bold text-red-300">
              {fehler}
            </p>
          )}

          <button
            onClick={spielStarten}
            disabled={spieler.length < 2 || loading}
            className="
              mt-2 flex w-full items-center justify-center gap-2 rounded-3xl
              bg-gradient-to-r from-emerald-500 to-green-400
              py-5 text-xl font-black text-white
              shadow-[0_0_20px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all active:scale-[0.97] disabled:opacity-40
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
            <p className="font-black text-zinc-400">Keine Karten gefunden.</p>
          ) : (
            <div
              key={index}
              {...swipeHandlers}
              style={{ touchAction: "pan-y" }}
              className={`card-slide-right relative w-full max-w-sm overflow-hidden rounded-3xl ${GLASS} select-none`}
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 to-green-400" />
              <div className="p-6 pb-8 pt-7">

                {/* VS Header – prominent oben */}
                {aktiveSpieler && (
                  <div className="mb-6 text-center">
                    <p className="text-[28px] font-black text-white leading-tight">
                      {aktiveSpieler[0]}{" "}
                      <span className="text-lg text-zinc-400">vs</span>{" "}
                      {aktiveSpieler[1]}
                    </p>
                  </div>
                )}

                {/* Frage zentriert und groß */}
                <div className="my-4 text-center text-5xl">🤷</div>
                <p className="text-center text-[26px] font-black text-white leading-snug">
                  Wer würde am ehesten... {card.text}
                </p>

                <p className="mt-8 text-center text-[18px] font-semibold text-zinc-400">
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
            rounded-2xl py-[14px] text-[18px] font-black transition-all active:scale-[0.97]
            ${modus === "18+"
              ? "border border-red-500/40 bg-red-950/60 text-red-300"
              : "border border-white/[0.10] bg-white/[0.04] text-zinc-400"
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
              rounded-2xl py-[14px] font-black text-[18px] text-zinc-300
              border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              transition-all active:scale-[0.97]
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
              transition-all active:scale-[0.97]
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
