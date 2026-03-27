"use client";

import { useState, useEffect } from "react";
import { SkipForward, Flame, Beer } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";
import { WAHRHEIT_18_PLUS, PFLICHT_18_PLUS } from "@/lib/fragenData";

const EMOJIS: Record<string, string> = { wahrheit: "🤔", pflicht: "😈" };

// 18+ Karten aus fragenData.ts – mit negativen IDs um Supabase-IDs nicht zu überschneiden
const WAHRHEIT_18PLUS: Aufgabe[] = WAHRHEIT_18_PLUS.map((text, i) => ({
  id: -(i + 1),
  text,
  typ: "wahrheit",
}));

const PFLICHT_18PLUS: Aufgabe[] = PFLICHT_18_PLUS.map((text, i) => ({
  id: -(i + 101),
  text,
  typ: "pflicht",
}));

export default function WahrheitOderPflicht() {
  const [supabaseCards, setSupabaseCards] = useState<Aufgabe[]>([]);
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [trinkenCount, setTrinkenCount] = useState(0);
  const [trinkenFlash, setTrinkenFlash] = useState(false);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("aufgaben")
          .select("id, text, typ")
          .in("typ", ["wahrheit", "pflicht"]);
        if (!error) setSupabaseCards((data as Aufgabe[]) ?? []);
      } catch (err) {
        console.error("Supabase Fetch Fehler:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let pool: Aufgabe[] = [...supabaseCards];
    if (modus === "18+") {
      pool = [...pool, ...WAHRHEIT_18PLUS, ...PFLICHT_18PLUS];
    }
    if (pool.length > 0) {
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIndex(0);
    }
  }, [modus, supabaseCards]);

  function nächsteKarte() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setTrinkenCount(0);
  }

  function trinken() {
    setTrinkenCount((n) => n + 1);
    setTrinkenFlash(true);
    setTimeout(() => setTrinkenFlash(false), 300);
  }

  function toggleModus() {
    setModus((m) => (m === "normal" ? "18+" : "normal"));
    setTrinkenCount(0);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nächsteKarte,
    onSwipedRight: nächsteKarte,
    preventScrollOnSwipe: true,
  });

  const card = index >= 0 ? cards[index] : null;
  const isWahrheit = card?.typ === "wahrheit";

  return (
    <GameLayout
      title="Wahrheit oder Pflicht"
      titleIcon={<Flame className="h-4 w-4 text-orange-400" />}
      glowColor="rgba(124,58,237,0.13)"
      counter={cards.length > 0 ? `${index + 1}/${cards.length}` : ""}
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* Karte */}
        <div className="flex flex-1 items-center justify-center py-4">
          {loading ? (
            <p className="font-black text-zinc-400">Lade Karten...</p>
          ) : !card ? (
            <p className="font-black text-zinc-400">Keine Karten gefunden.</p>
          ) : (
            <div
              key={index}
              {...swipeHandlers}
              style={{ touchAction: "pan-y" }}
              className="
                card-slide-right
                relative w-full max-w-sm overflow-hidden rounded-3xl
                border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl
                shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)]
                select-none
              "
            >
              {/* Gradient top border */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-pink-500" />

              <div className="p-6 pb-8 pt-7">
                <span
                  className={`inline-block rounded-xl px-3 py-1 text-[18px] font-black uppercase tracking-widest ${
                    isWahrheit
                      ? "bg-violet-800/60 text-violet-200"
                      : "bg-pink-900/60 text-pink-200"
                  }`}
                >
                  {isWahrheit ? "Wahrheit" : "Pflicht"}
                </span>

                <div className="my-8 text-center text-6xl">
                  {EMOJIS[card.typ] ?? "🎲"}
                </div>

                <p className="text-center text-[26px] font-black text-white leading-snug">
                  {card.text}
                </p>

                <p className="mt-10 text-center text-[18px] font-semibold text-zinc-400">
                  ← Swipe für nächste Karte →
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 18+ Toggle */}
        <button
          onClick={toggleModus}
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
            onClick={trinken}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-2xl py-[14px] font-black text-lg text-amber-300
              border border-amber-900/50
              transition-all active:scale-[0.97]
              ${trinkenFlash ? "bg-amber-800/80" : "bg-amber-950/80"}
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            `}
          >
            <Beer className="h-5 w-5" />
            Trinken{trinkenCount > 0 ? ` (${trinkenCount})` : ""}
          </button>
          <button
            onClick={nächsteKarte}
            className="
              flex flex-1 items-center justify-center gap-2
              rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500
              py-[14px] text-lg font-black text-white
              shadow-[0_0_20px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all active:scale-[0.97]
            "
          >
            <SkipForward className="h-5 w-5" />
            Nächste Karte
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
