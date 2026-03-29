"use client";

import { useState, useEffect } from "react";
import { SkipForward, Flame, Beer } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";
import { WAHRHEIT_18_PLUS, PFLICHT_18_PLUS } from "@/lib/fragenData";

const EMOJIS: Record<string, string> = { wahrheit: "🤔", pflicht: "😈" };

const WAHRHEIT_18PLUS: Aufgabe[] = WAHRHEIT_18_PLUS.map((text, i) => ({
  id: -(i + 1), text, typ: "wahrheit",
}));
const PFLICHT_18PLUS: Aufgabe[] = PFLICHT_18_PLUS.map((text, i) => ({
  id: -(i + 101), text, typ: "pflicht",
}));

export default function WahrheitOderPflicht() {
  const [sbCards, setSbCards] = useState<Aufgabe[]>([]);
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [idx, setIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [drinkN, setDrinkN] = useState(0);
  const [drinkFlash, setDrinkFlash] = useState(false);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("aufgaben").select("id, text, typ").in("typ", ["wahrheit", "pflicht"]);
        if (!error) setSbCards((data as Aufgabe[]) ?? []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    let pool = [...sbCards];
    if (modus === "18+") pool = [...pool, ...WAHRHEIT_18PLUS, ...PFLICHT_18PLUS];
    if (pool.length) { setCards([...pool].sort(() => Math.random() - 0.5)); setIdx(0); }
  }, [modus, sbCards]);

  const next = () => { setIdx(i => (i + 1) % Math.max(cards.length, 1)); setDrinkN(0); };
  const drink = () => { setDrinkN(n => n + 1); setDrinkFlash(true); setTimeout(() => setDrinkFlash(false), 350); };

  const sw = useSwipeable({ onSwipedLeft: next, onSwipedRight: next, preventScrollOnSwipe: true });
  const card = idx >= 0 ? cards[idx] : null;
  const isW = card?.typ === "wahrheit";

  return (
    <GameLayout
      title="Wahrheit oder Pflicht"
      titleIcon={<Flame className="h-3.5 w-3.5 text-violet-400" />}
      glowColor="rgba(124,58,237,0.09)"
      accentClass="accent-top-violet"
      counter={cards.length > 0 ? `${idx + 1}/${cards.length}` : ""}
    >
      <div className="flex flex-1 flex-col justify-between gap-3">
        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center py-1">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-2xl anim-shimmer bg-white/5" />
              <p className="text-[13px] font-extrabold text-zinc-500">Karten werden geladen…</p>
            </div>
          ) : !card ? (
            <p className="text-[14px] font-extrabold text-zinc-500">Keine Karten gefunden.</p>
          ) : (
            <div key={idx} {...sw} style={{ touchAction: "pan-y" }}
              className="anim-slide relative w-full overflow-hidden rounded-[var(--r-xl)] select-none glass-card">
              <div className={isW ? "accent-top-violet" : "accent-top-red"} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="px-5 pt-5 pb-6">
                {/* badge row */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border ${
                    isW ? "bg-violet-500/12 text-violet-300 border-violet-500/15" : "bg-pink-500/12 text-pink-300 border-pink-500/15"
                  }`}>
                    <span className="text-sm">{EMOJIS[card.typ]}</span>
                    {isW ? "Wahrheit" : "Pflicht"}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-600 tabular-nums">{idx + 1}/{cards.length}</span>
                </div>

                {/* question */}
                <p className="text-center text-[20px] font-extrabold text-white leading-snug min-h-[72px] flex items-center justify-center">
                  {card.text}
                </p>

                {/* swipe hint */}
                <div className="swipe-hint">
                  <div className="line" /><span className="label">Swipe für nächste</span><div className="line" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Controls ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          <button onClick={() => setModus(m => m === "normal" ? "18+" : "normal")}
            className={`toggle-18 ${modus === "18+" ? "on" : "off"}`}>
            🔞 {modus === "18+" ? "18+ aktiv – Deaktivieren" : "18+ Modus freischalten"}
          </button>

          <div className="btn-row">
            <button onClick={drink} className={`btn-secondary !border-amber-900/35 ${drinkFlash ? "!bg-amber-700/50 !text-amber-200" : "!text-amber-300"}`}>
              <Beer className="h-[18px] w-[18px]" />
              Trinken{drinkN > 0 ? ` × ${drinkN}` : ""}
            </button>
            <button onClick={next}
              className="btn-primary bg-gradient-to-r from-violet-600 to-pink-500 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
              <SkipForward className="h-[18px] w-[18px]" />
              Nächste
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
