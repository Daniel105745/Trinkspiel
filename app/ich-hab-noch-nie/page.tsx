"use client";

import { useState, useEffect } from "react";
import { SkipForward, Beer, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type IchHabNochNie } from "@/lib/supabase";

const ICH_HAB_NOCH_NIE_18PLUS: IchHabNochNie[] = [
  { id: -1,  text: "...jemanden zum ersten Mal getroffen und am selben Abend geküsst.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -2,  text: "...sexts verschickt oder empfangen.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -3,  text: "...eine Beziehung wegen einer anderen Person beendet.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -4,  text: "...eine Beziehung aus Langeweile begonnen.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -5,  text: "...auf einer Party gemacht, wofür ich mich am nächsten Morgen geschämt habe.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -6,  text: "...in einem fremden Bett aufgewacht, ohne genau zu wissen, wie ich dahin kam.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -7,  text: "...jemanden in einer Bar aufgerissen.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -8,  text: "...absichtlich jemanden eifersüchtig gemacht.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -9,  text: "...mit meinem Ex geschlafen, nachdem wir uns getrennt hatten.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -10, text: "...eine Beziehung verheimlicht.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -11, text: "...an jemand anderen gedacht, während ich jemanden geküsst habe.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -12, text: "...in einem Flugzeug jemanden kennengelernt und geflirtet.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -13, text: "...jemanden geküsst, wessen Namen ich nicht kannte.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -14, text: "...eine 'Freunde mit Vorteilen'-Situation gehabt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -15, text: "...jemanden aus Sympathie geküsst, nicht aus Gefühl.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -16, text: "...unter dem Tisch Beine berührt, die nicht mir gehörten.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -17, text: "...jemanden zuhause angerufen nach einer Partynacht, obwohl es keine gute Idee war.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -18, text: "...eine Beziehung durch eine SMS beendet.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -19, text: "...gleichzeitig mit zwei Menschen geflirtet.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -20, text: "...einen Pool, eine Sauna oder Dusche zu zweit genutzt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -21, text: "...jemanden auf Social Media angeschrieben, dem ich schon lange hinterhergeschaut habe.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -22, text: "...absichtlich mein Outfit für jemand Spezielles gewählt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -23, text: "...eine Beziehung im Urlaub gehabt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -24, text: "...jemanden nur wegen seiner Stimme attraktiv gefunden.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -25, text: "...auf einem Festival bis zum Morgengrauen mit jemandem Fremdem geredet – und mehr.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -26, text: "...meine Nummer gegeben, obwohl ich nicht wollte, dass er anruft.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -27, text: "...jemanden geküsst, den ich eigentlich für einen Freund hielt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -28, text: "...in einem Kino geflüstert und dabei mehr getan.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -29, text: "...auf einer Hochzeit jemanden angebaggert.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -30, text: "...auf Tinder mit jemandem gematcht, den ich kannte, und nichts gesagt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -31, text: "...jemanden gedated, der/die viel älter oder jünger als ich war.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -32, text: "...ein Date abgesagt, um lieber zu Hause zu bleiben.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -33, text: "...nach einem ersten Date direkt ein zweites geplant.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -34, text: "...aus einer WhatsApp-Gruppe ausgetreten, weil mein Ex drin war.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -35, text: "...jemanden geblockt und Minuten später wieder entblockt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -36, text: "...meinen Ex auf Social Media gestalkt, nachdem wir uns getrennt hatten.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -37, text: "...ein Liebeslied auf jemanden bezogen, der es nie wissen sollte.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -38, text: "...jemanden angelogen über mein Alter oder meinen Job beim Dating.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -39, text: "...auf einem ersten Date zu viel getrunken.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -40, text: "...jemanden nach Hause mitgenommen, den ich erst zwei Stunden kannte.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -41, text: "...ein Liebesgeständnis bereut, sobald die Worte raus waren.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -42, text: "...einer Person 'Ich liebe dich' gesagt, ohne es wirklich so zu meinen.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -43, text: "...mit jemandem geflirtet, nur um ein Getränk zu bekommen.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -44, text: "...jemandem eine falsche Handynummer gegeben.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -45, text: "...gleichzeitig zwei Dates in einer Woche gehabt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -46, text: "...beim Speed-Dating mitgemacht.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -47, text: "...mein Dating-Profil stark übertrieben.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -48, text: "...nach einem Streit sofort wieder gekusst.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -49, text: "...jemandem heimlich einen Zettel mit meiner Nummer zugesteckt.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -50, text: "...jemanden auf einer Party angesprochen, nur weil er/sie so gut aussah.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -51, text: "...eine Nacht mit jemandem verbracht, den ich nie wiedersehen sollte.", schon_getan_count: 0, noch_nie_count: 0 },
  { id: -52, text: "...beim Küssen gegen einen Türrahmen oder ein Regal gestoßen.", schon_getan_count: 0, noch_nie_count: 0 },
];

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
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    supabase
      .from("ich_hab_noch_nie")
      .select("id, text, schon_getan_count, noch_nie_count")
      .then(({ data }) => {
        setSupabaseCards((data as IchHabNochNie[]) ?? []);
        setLoading(false);
      });
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

  function handleSchonGetan() {
    if (schonGetan) return;
    setSchonGetan(true);
    setTrinkenFlash(true);
    setTimeout(() => setTrinkenFlash(false), 300);
    const card = cards[index];
    if (card && card.id > 0) {
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
                  Ich hab noch nie... {card.text}
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
          {/* 18+ Toggle */}
          <button
            onClick={() => setModus((m) => (m === "normal" ? "18+" : "normal"))}
            className={`
              flex w-full items-center justify-center gap-2
              rounded-2xl py-2.5 text-sm font-black transition-all active:scale-95
              ${modus === "18+"
                ? "border border-red-500/40 bg-red-950/60 text-red-300"
                : "border border-white/[0.10] bg-white/[0.04] text-zinc-500"
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
