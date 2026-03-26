"use client";

import { useState, useEffect } from "react";
import { SkipForward, Flame, Beer } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

const EMOJIS: Record<string, string> = { wahrheit: "🤔", pflicht: "😈" };

const WAHRHEIT_18PLUS: Aufgabe[] = [
  { id: -1,  text: "Hast du schon mal jemanden geküsst, der/die vergeben war?", typ: "wahrheit" },
  { id: -2,  text: "Wie viele Personen hast du schon geküsst?", typ: "wahrheit" },
  { id: -3,  text: "Was ist das Freizügigste, was du je auf einer Party getan hast?", typ: "wahrheit" },
  { id: -4,  text: "Hast du schon mal jemanden nur wegen Langeweile gedated?", typ: "wahrheit" },
  { id: -5,  text: "Was ist dein größtes Liebes-Geheimnis?", typ: "wahrheit" },
  { id: -6,  text: "Hast du schon mal Gefühle für jemanden gehabt, der mit deinem besten Freund zusammen war?", typ: "wahrheit" },
  { id: -7,  text: "Hast du schon mal jemandem sexts geschickt?", typ: "wahrheit" },
  { id: -8,  text: "Was ist der heißeste Traum, den du je hattest?", typ: "wahrheit" },
  { id: -9,  text: "Hast du schon mal aus Mitleid jemanden geküsst?", typ: "wahrheit" },
  { id: -10, text: "Hast du schon mal zwei Personen gleichzeitig gedated?", typ: "wahrheit" },
  { id: -11, text: "Was ist das Frechste, was du je in einem Chat geschrieben hast?", typ: "wahrheit" },
  { id: -12, text: "Mit welcher Person im Raum würdest du am ehesten flirten?", typ: "wahrheit" },
  { id: -13, text: "Was ist dein peinlichstes Erlebnis beim Flirten?", typ: "wahrheit" },
  { id: -14, text: "Hast du schon mal jemandem eine Lüge über deine Vergangenheit erzählt?", typ: "wahrheit" },
  { id: -15, text: "Welche App auf deinem Handy würde dich am meisten blamieren?", typ: "wahrheit" },
  { id: -16, text: "Was ist das Aufregendste, was du je getan hast, ohne erwischt zu werden?", typ: "wahrheit" },
  { id: -17, text: "Hast du jemals nach einem Treffen sofort bereut, was passiert ist?", typ: "wahrheit" },
  { id: -18, text: "Wer hier findest du heimlich am attraktivsten?", typ: "wahrheit" },
  { id: -19, text: "Was ist das Wildeste, was du je auf einer Party erlebt hast?", typ: "wahrheit" },
  { id: -20, text: "Hast du schon mal jemanden deiner Freunde geküsst?", typ: "wahrheit" },
  { id: -21, text: "Hast du schon mal eine Beziehung wegen einer anderen Person beendet?", typ: "wahrheit" },
  { id: -22, text: "Was ist die schlimmste sexuelle Situation, in der du je warst?", typ: "wahrheit" },
  { id: -23, text: "Hast du schon mal jemanden nur wegen seines Aussehens gedated?", typ: "wahrheit" },
  { id: -24, text: "Was ist der verrückteste Ort, an dem du jemanden geküsst hast?", typ: "wahrheit" },
  { id: -25, text: "Hast du schon mal mit jemandem geflirtet, nur um etwas zu bekommen?", typ: "wahrheit" },
  { id: -26, text: "Was ist das Schlimmste, was du je getan hast, um einen Ex zurückzugewinnen?", typ: "wahrheit" },
  { id: -27, text: "Hast du schon mal jemanden geküsst, wessen Namen du nicht wusstest?", typ: "wahrheit" },
  { id: -28, text: "Welches Geheimnis über dein Liebesleben weißt nur du?", typ: "wahrheit" },
  { id: -29, text: "Hast du jemals jemanden blockiert und dann entblockt?", typ: "wahrheit" },
  { id: -30, text: "Was ist das Aufregendste, was du dir für eine Nacht wünschst?", typ: "wahrheit" },
  { id: -31, text: "Hast du schon mal jemandem absichtlich den Kopf verdreht, ohne es ernst zu meinen?", typ: "wahrheit" },
  { id: -32, text: "Was war das Peinlichste, was du je beim Date gesagt hast?", typ: "wahrheit" },
  { id: -33, text: "Hast du schon mal jemanden geghostet und warum?", typ: "wahrheit" },
  { id: -34, text: "Was ist der größte Schwindel, den du je in einer Beziehung getan hast?", typ: "wahrheit" },
  { id: -35, text: "Hast du schon mal mit einem Kollegen oder einer Kollegin geflirtet?", typ: "wahrheit" },
  { id: -36, text: "Wer im Raum würde dir am ehesten um 2 Uhr nachts schreiben?", typ: "wahrheit" },
  { id: -37, text: "Hast du schon mal deinen eigenen Ex auf einer Party ignoriert?", typ: "wahrheit" },
  { id: -38, text: "Was ist die peinlichste Nachricht, die du je abgeschickt hast?", typ: "wahrheit" },
  { id: -39, text: "Hast du schon mal jemanden nach Hause eingeladen und dann die Meinung geändert?", typ: "wahrheit" },
  { id: -40, text: "Was ist das Schlimmste, was dein Ex je über dich erzählt hat?", typ: "wahrheit" },
  { id: -41, text: "Wie lange war deine längste Beziehung, und warum habt ihr euch getrennt?", typ: "wahrheit" },
  { id: -42, text: "Hast du schon mal eine Beziehung über WhatsApp beendet?", typ: "wahrheit" },
  { id: -43, text: "Was ist das Freizügigste Foto, das du je jemandem geschickt hast?", typ: "wahrheit" },
  { id: -44, text: "Hast du schon mal an jemand anderen gedacht, während du jemanden geküsst hast?", typ: "wahrheit" },
  { id: -45, text: "Hast du schon mal jemanden für einen anderen angeschrieben, aus Versehen?", typ: "wahrheit" },
  { id: -46, text: "Was war der schlechteste erste Eindruck, den du je gemacht hast?", typ: "wahrheit" },
  { id: -47, text: "Hast du schon mal jemanden aus Versehen 'Ich liebe dich' gesagt?", typ: "wahrheit" },
  { id: -48, text: "Wem im Raum würdest du ein Date vorschlagen, wenn du müsstest?", typ: "wahrheit" },
  { id: -49, text: "Was ist die peinlichste Sache, die du je beim Flirten getan hast?", typ: "wahrheit" },
  { id: -50, text: "Hast du schon mal jemanden eifersüchtig gemacht – absichtlich?", typ: "wahrheit" },
  { id: -51, text: "Was war dein schlimmstes Date aller Zeiten?", typ: "wahrheit" },
  { id: -52, text: "Hast du schon mal ein Fake-Profil auf einer Dating-App genutzt?", typ: "wahrheit" },
];

const PFLICHT_18PLUS: Aufgabe[] = [
  { id: -101, text: "Flüstere der Person neben dir etwas Verführerisches ins Ohr.", typ: "pflicht" },
  { id: -102, text: "Tanze für 30 Sekunden so verführerisch wie möglich.", typ: "pflicht" },
  { id: -103, text: "Sage der Person gegenüber, was dir an ihr physisch am besten gefällt.", typ: "pflicht" },
  { id: -104, text: "Imitiere deinen besten Flirt-Move vor der Gruppe.", typ: "pflicht" },
  { id: -105, text: "Setze dich für 1 Minute auf den Schoß der Person neben dir.", typ: "pflicht" },
  { id: -106, text: "Schick deinem Ex eine Emoji-Nachricht ohne Erklärung.", typ: "pflicht" },
  { id: -107, text: "Gib einer Person im Raum eine 1-minütige Schultermassage.", typ: "pflicht" },
  { id: -108, text: "Küss die Person links von dir auf den Handrücken.", typ: "pflicht" },
  { id: -109, text: "Leg deinen Kopf für 2 Minuten auf den Schoß deines Sitznachbars.", typ: "pflicht" },
  { id: -110, text: "Zeig deinen Lockscreen – wenn da ein Date oder Ex ist, erzähl die Geschichte.", typ: "pflicht" },
  { id: -111, text: "Schreib auf einen Zettel, wen du im Raum küssen würdest, und zeig ihn.", typ: "pflicht" },
  { id: -112, text: "Halte jemandes Hand für 2 Minuten, ohne etwas zu sagen.", typ: "pflicht" },
  { id: -113, text: "Rate, wer im Raum am leidenschaftlichsten küsst. Und begründe es.", typ: "pflicht" },
  { id: -114, text: "Stell dir vor, du bewirbst dich für ein Date mit der Person links von dir. Was sagst du?", typ: "pflicht" },
  { id: -115, text: "Mach einen Liebesbrief in unter 1 Minute an eine Person im Raum.", typ: "pflicht" },
  { id: -116, text: "Beschreibe die Person rechts von dir so attraktiv wie möglich – 30 Sekunden.", typ: "pflicht" },
  { id: -117, text: "Führe mit jemandem ein Fake-Date-Szenario durch – für 2 Minuten.", typ: "pflicht" },
  { id: -118, text: "Wähle einen Songtext, der dein Liebesleben beschreibt. Singe ihn.", typ: "pflicht" },
  { id: -119, text: "Sage jemandem etwas Schmeichelhaftes in deiner verführerischsten Stimme.", typ: "pflicht" },
  { id: -120, text: "Teile dein peinlichstes Dating-App-Gespräch mit der Gruppe.", typ: "pflicht" },
  { id: -121, text: "Sende einer Person im Raum heimlich eine 'Ich mag dich'-Nachricht per Zettel.", typ: "pflicht" },
  { id: -122, text: "Zeig deinen zuletzt gesendeten Text (kein Familienchat erlaubt).", typ: "pflicht" },
  { id: -123, text: "Ruf eine Person an, auf die du einen Crush hattest, und sag einfach 'Ich dachte an dich'.", typ: "pflicht" },
  { id: -124, text: "Gib der Person zu deiner Rechten einen Kuss auf die Wange – nur mit deren OK.", typ: "pflicht" },
  { id: -125, text: "Erzähle deinen wildesten Party-Moment in maximal 30 Sekunden.", typ: "pflicht" },
  { id: -126, text: "Mach drei tiefe Augenkontakt-Sekunden mit jeder Person nacheinander.", typ: "pflicht" },
  { id: -127, text: "Schick einer nicht anwesenden Person die Nachricht 'Hey, ich vermisse dich'.", typ: "pflicht" },
  { id: -128, text: "Imitiere, wie du jemanden in einer Bar aufrei&en würdest.", typ: "pflicht" },
  { id: -129, text: "Zeig deine Handykontakte und nenne den letzten, mit dem du geflirtet hast.", typ: "pflicht" },
  { id: -130, text: "Tausche für 1 Minute Handy mit der Person zu deiner Linken.", typ: "pflicht" },
  { id: -131, text: "Mach eine Liegestütze und lass die Person gegenüber dir dabei zuzählen.", typ: "pflicht" },
  { id: -132, text: "Erzähle die Geschichte deines ersten Kusses.", typ: "pflicht" },
  { id: -133, text: "Beschreibe dein perfektes Date in 20 Sekunden.", typ: "pflicht" },
  { id: -134, text: "Mach für 30 Sekunden die beste Verführer-Stimme und rede irgendetwas.", typ: "pflicht" },
  { id: -135, text: "Schick jemandem im Raum eine Sprachnachricht mit einem Kompliment.", typ: "pflicht" },
  { id: -136, text: "Zeig das peinlichste Foto von dir auf deinem Handy.", typ: "pflicht" },
  { id: -137, text: "Mach 5 Minuten lang den persönlichen Butler der Person links von dir.", typ: "pflicht" },
  { id: -138, text: "Imitiere einen Filmkuss mit einem imaginären Partner.", typ: "pflicht" },
  { id: -139, text: "Sage der Person gegenüber etwas, was du noch nie zu ihr gesagt hast.", typ: "pflicht" },
  { id: -140, text: "Sitz für die nächste Runde auf dem Schoß deiner Wahl.", typ: "pflicht" },
  { id: -141, text: "Erzähle deinen peinlichsten Moment auf einer Party.", typ: "pflicht" },
  { id: -142, text: "Tue so, als würdest du jemanden aus dem Raum anflirten – für 1 Minute.", typ: "pflicht" },
  { id: -143, text: "Schreib der Person rechts eine Dating-Profil-Beschreibung laut vor.", typ: "pflicht" },
  { id: -144, text: "Mach für 30 Sekunden den besten Stripclub-Tanz (angezogen!).", typ: "pflicht" },
  { id: -145, text: "Nenne 3 Dinge, die du an der Person links von dir attraktiv findest.", typ: "pflicht" },
  { id: -146, text: "Zeig der Gruppe deine Dating-App-Profilfotos.", typ: "pflicht" },
  { id: -147, text: "Erzähle in 30 Sekunden, wie du jemanden in einer Bar ansprechen würdest.", typ: "pflicht" },
  { id: -148, text: "Küss die Hand der Person gegenüber von dir auf dramatische Art.", typ: "pflicht" },
  { id: -149, text: "Wähle jemanden im Raum und sag ihm einen Satz aus einem Liebesfilm.", typ: "pflicht" },
  { id: -150, text: "Sei für die nächste Runde der/die Chef*in und verteile Trink-Befehle.", typ: "pflicht" },
  { id: -151, text: "Zeig, wie du auf Tinder mit jemandem schreiben würdest, und mach es live.", typ: "pflicht" },
  { id: -152, text: "Erzähle das peinlichste Gespräch, das du je mit einem Ex hattest.", typ: "pflicht" },
];

export default function WahrheitOderPflicht() {
  const [supabaseCards, setSupabaseCards] = useState<Aufgabe[]>([]);
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [trinkenCount, setTrinkenCount] = useState(0);
  const [trinkenFlash, setTrinkenFlash] = useState(false);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    supabase
      .from("aufgaben")
      .select("id, text, typ")
      .in("typ", ["wahrheit", "pflicht"])
      .then(({ data }) => {
        setSupabaseCards((data as Aufgabe[]) ?? []);
        setLoading(false);
      });
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
              {/* Gradient top border */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-pink-500" />

              <div className="p-6 pb-8 pt-7">
                <span
                  className={`inline-block rounded-xl px-3 py-1 text-xs font-black uppercase tracking-widest ${
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

                <p className="text-center text-xl font-black text-white leading-snug">
                  {card.text}
                </p>

                <p className="mt-10 text-center text-xs font-semibold text-zinc-600">
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
        <div className="flex gap-3 pb-2">
          <button
            onClick={trinken}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-2xl py-4 font-black text-base text-amber-300
              border border-amber-900/50
              transition-all active:scale-95
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
              py-4 text-base font-black text-white
              shadow-[0_0_20px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all active:scale-95
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
