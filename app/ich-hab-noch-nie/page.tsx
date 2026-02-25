"use client";

import { useState, useEffect } from "react";
import { SkipForward, Beer, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type IchHabNochNie } from "@/lib/supabase";

export default function IchHabNochNie() {
  const [cards, setCards] = useState<IchHabNochNie[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [schonGetan, setSchonGetan] = useState(false);
  const [trinkenFlash, setTrinkenFlash] = useState(false);
  const [formOffen, setFormOffen] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const [sendingForm, setSendingForm] = useState(false);
  const [formErfolg, setFormErfolg] = useState(false);

  useEffect(() => {
    supabase
      .from("ich_hab_noch_nie")
      .select("id, text, schon_getan_count, noch_nie_count")
      .then(({ data }) => {
        if (data?.length) {
          setCards([...data].sort(() => Math.random() - 0.5) as IchHabNochNie[]);
          setIndex(0);
        }
        setLoading(false);
      });
  }, []);

  function nächsteKarte() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setSchonGetan(false);
  }

  function handleSchonGetan() {
    if (schonGetan) return;
    setSchonGetan(true);
    setTrinkenFlash(true);
    setTimeout(() => setTrinkenFlash(false), 300);
    const card = cards[index];
    if (card) {
      supabase
        .from("ich_hab_noch_nie")
        .update({ schon_getan_count: card.schon_getan_count + 1 })
        .eq("id", card.id);
    }
  }

  async function einreichen() {
    if (!eingabe.trim()) return;
    setSendingForm(true);
    const { error } = await supabase
      .from("ich_hab_noch_nie")
      .insert({ text: eingabe.trim(), schon_getan_count: 0, noch_nie_count: 0 });
    if (!error) {
      setFormErfolg(true);
      setEingabe("");
      setTimeout(() => setFormErfolg(false), 3000);
    }
    setSendingForm(false);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nächsteKarte,
    onSwipedRight: nächsteKarte,
    preventScrollOnSwipe: true,
  });

  const card = index >= 0 ? cards[index] : null;

  return (
    <GameLayout
      title="Ich hab noch nie"
      titleIcon={<span className="text-base">🙊</span>}
      glowColor="rgba(14,165,233,0.10)"
      counter={cards.length > 0 ? `${index + 1}/${cards.length}` : ""}
    >
      <div className="flex flex-1 flex-col justify-between">
        {/* Karte */}
        <div className="flex flex-1 items-center justify-center py-4">
          {loading ? (
            <p className="font-black text-zinc-500">Lade Karten...</p>
          ) : !card ? (
            <p className="font-black text-zinc-500">Keine Karten gefunden.</p>
          ) : (
            <div
              {...swipeHandlers}
              style={{ touchAction: "pan-y" }}
              className="
                relative w-full max-w-sm overflow-hidden rounded-3xl
                border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl
                shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)]
                select-none
              "
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 to-cyan-400" />
              <div className="p-6 pb-8 pt-7">
                <span className="inline-block rounded-xl bg-sky-900/60 px-3 py-1 text-xs font-black uppercase tracking-widest text-sky-300">
                  Sozial
                </span>
                <div className="my-8 text-center text-6xl">🙊</div>
                <p className="text-center text-xl font-black text-white leading-snug">
                  {card.text}
                </p>
                {schonGetan && (
                  <p className="mt-4 text-center text-sm font-bold text-amber-400">
                    🍺 {card.schon_getan_count + 1} haben das schon getan!
                  </p>
                )}
                <p className="mt-10 text-center text-xs font-semibold text-zinc-600">
                  ← Swipe für nächste Karte →
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pb-2">
          {/* Buttons – beide flex-1 */}
          <div className="flex gap-3">
            <button
              onClick={handleSchonGetan}
              disabled={schonGetan}
              className={`
                flex flex-1 items-center justify-center gap-2
                rounded-2xl py-4 font-black text-base text-amber-300
                border border-amber-900/50
                transition-all active:scale-95 disabled:opacity-50
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                ${trinkenFlash ? "bg-amber-800/80" : "bg-amber-950/80"}
              `}
            >
              <Beer className="h-5 w-5" />
              Schon getan
            </button>
            <button
              onClick={nächsteKarte}
              className="
                flex flex-1 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400
                py-4 text-base font-black text-white
                shadow-[0_0_20px_rgba(14,165,233,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
                transition-all active:scale-95
              "
            >
              <SkipForward className="h-5 w-5" />
              Nächste Karte
            </button>
          </div>

          {/* Einreichen Accordion */}
          <div
            className="
              rounded-2xl border border-white/[0.10] bg-white/[0.05] backdrop-blur-xl overflow-hidden
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            "
          >
            <button
              onClick={() => setFormOffen(!formOffen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>Eigenen Satz einreichen</span>
              {formOffen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {formOffen && (
              <div className="flex gap-2 border-t border-white/[0.06] p-3">
                <input
                  type="text"
                  value={eingabe}
                  onChange={(e) => setEingabe(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && einreichen()}
                  placeholder="...in einem Flugzeug geweint."
                  className="flex-1 rounded-xl bg-white/[0.08] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={einreichen}
                  disabled={sendingForm || !eingabe.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 transition-colors hover:bg-sky-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
            {formErfolg && (
              <p className="pb-3 text-center text-sm font-bold text-emerald-400">✓ Eingereicht!</p>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
