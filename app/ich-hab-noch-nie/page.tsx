"use client";

import { useState, useEffect } from "react";
import { SkipForward, Beer, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type IchHabNochNie } from "@/lib/supabase";
import { ICH_HAB_NOCH_NIE_18_PLUS } from "@/lib/fragenData";

// 18+ Karten aus fragenData.ts – mit negativen IDs, count-Felder bleiben 0 (nur lokal)
const ICH_HAB_NOCH_NIE_18PLUS: IchHabNochNie[] = ICH_HAB_NOCH_NIE_18_PLUS.map((text, i) => ({
  id: -(i + 1),
  text: `...${text}`,
  schon_getan_count: 0,
  noch_nie_count: 0,
}));

export default function IchHabNochNie() {
  const [supabaseCards, setSupabaseCards] = useState<IchHabNochNie[]>([]);
  const [cards, setCards] = useState<IchHabNochNie[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [schonGetan, setSchonGetan] = useState(false);
  const [trinkenFlash, setTrinkenFlash] = useState(false);
  const [formOffen, setFormOffen] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const [sendingForm, setSendingForm] = useState(false);
  const [formErfolg, setFormErfolg] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("ich_hab_noch_nie")
          .select("id, text, schon_getan_count, noch_nie_count");
        if (!error) setSupabaseCards((data as IchHabNochNie[]) ?? []);
      } catch (err) {
        console.error("Supabase Fetch Fehler:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let pool: IchHabNochNie[] = [...supabaseCards];
    if (modus === "18+") {
      pool = [...pool, ...ICH_HAB_NOCH_NIE_18PLUS];
    }
    if (pool.length > 0) {
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIndex(0);
      setSchonGetan(false);
    }
  }, [modus, supabaseCards]);

  function nächsteKarte() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setSchonGetan(false);
  }

  async function handleSchonGetan() {
    if (schonGetan) return;
    setSchonGetan(true);
    setTrinkenFlash(true);
    setTimeout(() => setTrinkenFlash(false), 300);
    const card = cards[index];
    if (card && card.id > 0) {
      try {
        await supabase
          .from("ich_hab_noch_nie")
          .update({ schon_getan_count: card.schon_getan_count + 1 })
          .eq("id", card.id);
      } catch {
        // fire-and-forget: Fehler beim Zähler-Update still ignorieren
      }
    }
  }

  async function einreichen() {
    if (!eingabe.trim()) return;
    setSendingForm(true);
    setSubmitError(null);
    const { error } = await supabase
      .from("ich_hab_noch_nie")
      .insert({ text: eingabe.trim(), schon_getan_count: 0, noch_nie_count: 0 });
    if (!error) {
      setFormErfolg(true);
      setEingabe("");
      setTimeout(() => setFormErfolg(false), 3000);
    } else {
      console.error("einreichen Fehler:", error);
      setSubmitError("Einreichen fehlgeschlagen. Bitte nochmal versuchen.");
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
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 to-cyan-400" />
              <div className="p-6 pb-8 pt-7">
                <span className="inline-block rounded-xl bg-sky-900/60 px-3 py-1 text-[18px] font-black uppercase tracking-widest text-sky-300">
                  Sozial
                </span>
                <div className="my-8 text-center text-6xl">🙊</div>
                <p className="text-center text-[26px] font-black text-white leading-snug">
                  Ich hab noch nie... {card.text}
                </p>
                {schonGetan && (
                  <p className="mt-4 text-center text-[18px] font-bold text-amber-400">
                    🍺 {card.schon_getan_count + 1} haben das schon getan!
                  </p>
                )}
                <p className="mt-10 text-center text-[18px] font-semibold text-zinc-400">
                  ← Swipe für nächste Karte →
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pb-2">
          {/* 18+ Toggle */}
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
            🔞 {modus === "18+" ? "18+ Modus aktiv – Tap zum Deaktivieren" : "18+ Modus aktivieren"}
          </button>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSchonGetan}
              disabled={schonGetan}
              className={`
                flex flex-1 items-center justify-center gap-2
                rounded-2xl py-[14px] font-black text-lg text-amber-300
                border border-amber-900/50
                transition-all active:scale-[0.97] disabled:opacity-50
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
                py-[14px] text-lg font-black text-white
                shadow-[0_0_20px_rgba(14,165,233,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
                transition-all active:scale-[0.97]
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
              className="flex w-full items-center justify-between px-4 py-[14px] text-[18px] font-bold text-zinc-400 hover:text-zinc-200 active:text-zinc-200 transition-colors"
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
                  className="flex-1 rounded-xl bg-white/[0.08] px-4 py-3 text-[18px] text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={einreichen}
                  disabled={sendingForm || !eingabe.trim()}
                  className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl bg-sky-500 transition-colors hover:bg-sky-400 active:scale-[0.97] disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
            {formErfolg && (
              <p className="pb-3 text-center text-[18px] font-bold text-emerald-400">✓ Eingereicht!</p>
            )}
            {submitError && (
              <p className="pb-3 text-center text-[18px] font-bold text-red-400">{submitError}</p>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
