"use client";

import { useState, useEffect, useRef } from "react";
import { SkipForward, Flame, Beer } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

const EMOJIS: Record<string, string> = {
  wahrheit: "🤔",
  pflicht: "😈",
};

export default function WahrheitOderPflicht() {
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [trinkenCount, setTrinkenCount] = useState(0);
  const [trinkenFlash, setTrinkenFlash] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("aufgaben")
        .select("id, text, typ")
        .in("typ", ["wahrheit", "pflicht"]);
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5) as Aufgabe[];
        setCards(shuffled);
        setIndex(0);
      }
      setLoading(false);
    }
    load();
  }, []);

  function nächsteKarte() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setTrinkenCount(0);
  }

  function trinken() {
    setTrinkenCount((n) => n + 1);
    setTrinkenFlash(true);
    setTimeout(() => setTrinkenFlash(false), 300);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nächsteKarte,
    onSwipedRight: nächsteKarte,
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const card = index >= 0 ? cards[index] : null;
  const counter = cards.length > 0 ? `${index + 1}/${cards.length}` : "";
  const isWahrheit = card?.typ === "wahrheit";

  return (
    <GameLayout
      title="Wahrheit oder Pflicht"
      titleIcon={<Flame className="h-4 w-4 text-orange-400" />}
      glowColor="rgba(124,58,237,0.13)"
      counter={counter}
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* Karte */}
        <div className="flex flex-1 items-center justify-center py-4">
          {loading ? (
            <div className="text-zinc-500 text-lg font-bold">Lade Karten...</div>
          ) : !card ? (
            <div className="text-zinc-500 text-lg font-bold">Keine Karten gefunden.</div>
          ) : (
            <div
              {...swipeHandlers}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] select-none"
              style={{ touchAction: "pan-y" }}
            >
              {/* Gradient top border */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-pink-500" />

              <div className="p-6 pb-8 pt-7">
                {/* Badge */}
                <span
                  className={`inline-block rounded-xl px-3 py-1 text-xs font-black uppercase tracking-widest ${
                    isWahrheit
                      ? "bg-violet-800/60 text-violet-200"
                      : "bg-pink-900/60 text-pink-200"
                  }`}
                >
                  {isWahrheit ? "Wahrheit" : "Pflicht"}
                </span>

                {/* Emoji */}
                <div className="my-8 text-center text-6xl">
                  {EMOJIS[card.typ] ?? "🎲"}
                </div>

                {/* Frage */}
                <p className="text-center text-xl font-black text-white leading-snug">
                  {card.text}
                </p>

                {/* Swipe-Hint */}
                <p className="mt-10 text-center text-xs font-semibold text-zinc-600">
                  ← Swipe für nächste Karte →
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={trinken}
            className={`flex items-center gap-2 rounded-2xl px-6 py-4 font-black text-base text-amber-300 transition-all active:scale-95 ${
              trinkenFlash ? "bg-amber-800/80" : "bg-amber-950/80"
            } border border-amber-900/40`}
          >
            <Beer className="h-5 w-5" />
            Trinken{trinkenCount > 0 ? ` (${trinkenCount})` : ""}
          </button>
          <button
            onClick={nächsteKarte}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-4 text-base font-black text-white shadow-lg shadow-violet-900/40 transition-all active:scale-95"
          >
            <SkipForward className="h-5 w-5" />
            Nächste Karte
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
