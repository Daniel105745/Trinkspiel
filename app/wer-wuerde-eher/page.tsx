"use client";

import { useState, useEffect } from "react";
import { SkipForward, Plus, X, Users2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

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
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [aktiveSpieler, setAktiveSpieler] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(false);

  async function spielStarten() {
    setLoading(true);
    const { data } = await supabase
      .from("aufgaben")
      .select("id, text, typ")
      .eq("typ", "wer_wuerde_eher");
    if (data?.length) {
      setCards([...data].sort(() => Math.random() - 0.5) as Aufgabe[]);
      setIndex(0);
      setAktiveSpieler(zweiZufälligeSpieler(spieler));
    }
    setLoading(false);
    setPhase("spiel");
  }

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
              className={`relative w-full max-w-sm overflow-hidden rounded-3xl ${GLASS} select-none`}
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 to-green-400" />
              <div className="p-6 pb-8 pt-7">
                {aktiveSpieler && (
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex-1 rounded-2xl border border-emerald-800/40 bg-emerald-950/40 py-2.5 text-center">
                      <p className="font-black text-emerald-200">{aktiveSpieler[0]}</p>
                    </div>
                    <span className="font-black text-zinc-500">VS</span>
                    <div className="flex-1 rounded-2xl border border-emerald-800/40 bg-emerald-950/40 py-2.5 text-center">
                      <p className="font-black text-emerald-200">{aktiveSpieler[1]}</p>
                    </div>
                  </div>
                )}
                <span className="inline-block rounded-xl bg-emerald-900/60 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
                  Am ehesten würde...
                </span>
                <div className="my-6 text-center text-6xl">🤷</div>
                <p className="text-center text-xl font-black text-white leading-snug">{card.text}</p>
                <p className="mt-8 text-center text-xs font-semibold text-zinc-600">
                  ← Swipe für nächste Karte →
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons – beide flex-1 */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={() => setPhase("setup")}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-2xl py-4 font-black text-sm text-zinc-300
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
              py-4 text-base font-black text-white
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
