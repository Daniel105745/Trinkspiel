"use client";

import { useState } from "react";
import { Plus, X, Users, Shuffle, AlertCircle, RefreshCw } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

function zweiZufälligeSpieler(spieler: string[]): [string, string] {
  const shuffled = [...spieler].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export default function WerWürdeEher() {
  const [spieler, setSpieler] = useState<string[]>([]);
  const [eingabe, setEingabe] = useState("");
  const [phase, setPhase] = useState<"setup" | "spiel">("setup");

  const [karte, setKarte] = useState<Aufgabe | null>(null);
  const [aktuellesSpieler, setAktuellesSpieler] = useState<[string, string] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  function spielerHinzufügen() {
    const name = eingabe.trim();
    if (name && !spieler.includes(name)) {
      setSpieler([...spieler, name]);
    }
    setEingabe("");
  }

  function spielerEntfernen(name: string) {
    setSpieler(spieler.filter((s) => s !== name));
  }

  async function nächsteRunde() {
    setIsLoading(true);
    setFehler(null);

    const { data, error } = await supabase
      .from("aufgaben")
      .select("id, text, typ")
      .eq("typ", "wer_wuerde_eher")
      .neq("id", karte?.id ?? 0)
      .limit(10);

    if (error || !data || data.length === 0) {
      setFehler("Keine Aufgaben für 'Wer würde eher' in der Datenbank.");
    } else {
      setKarte(data[Math.floor(Math.random() * data.length)] as Aufgabe);
      setAktuellesSpieler(zweiZufälligeSpieler(spieler));
    }
    setIsLoading(false);
  }

  // ── Setup-Bildschirm ──────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <GameLayout title="Wer würde eher...?">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <p className="text-zinc-400 text-sm text-center">
            Füge mindestens 2 Spieler hinzu
          </p>

          {/* Spieler-Eingabe */}
          <div className="flex gap-2">
            <input
              type="text"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && spielerHinzufügen()}
              placeholder="Name eingeben..."
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={spielerHinzufügen}
              disabled={!eingabe.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500 transition-colors hover:bg-violet-400 disabled:opacity-50"
            >
              <Plus className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Spielerliste */}
          {spieler.length > 0 && (
            <div className="flex flex-col gap-2">
              {spieler.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-900/60 text-sm font-bold text-violet-300">
                      {name[0].toUpperCase()}
                    </div>
                    <span className="text-zinc-200 font-medium">{name}</span>
                  </div>
                  <button
                    onClick={() => spielerEntfernen(name)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {spieler.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-zinc-500">Noch keine Spieler</p>
            </div>
          )}

          <button
            onClick={() => setPhase("spiel")}
            disabled={spieler.length < 2}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-5 text-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 hover:bg-violet-400"
          >
            <Shuffle className="h-5 w-5" />
            Spielen! ({spieler.length} Spieler)
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── Spiel-Bildschirm ──────────────────────────────────────────────
  return (
    <GameLayout
      title="Wer würde eher...?"
      headerRight={
        <button
          onClick={() => setPhase("setup")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <Users className="h-4 w-4 text-zinc-300" />
        </button>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col justify-between" style={{ minHeight: "calc(100vh - 140px)" }}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
          {fehler ? (
            <div className="flex w-full items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="text-red-300 text-sm">{fehler}</p>
            </div>
          ) : karte && aktuellesSpieler ? (
            <>
              {/* Spieler */}
              <div className="flex w-full items-center justify-center gap-4">
                <div className="flex-1 rounded-2xl border border-violet-800/60 bg-violet-950/40 py-4 text-center">
                  <p className="text-2xl font-bold text-violet-200">{aktuellesSpieler[0]}</p>
                </div>
                <span className="text-xl font-black text-zinc-500">VS</span>
                <div className="flex-1 rounded-2xl border border-violet-800/60 bg-violet-950/40 py-4 text-center">
                  <p className="text-2xl font-bold text-violet-200">{aktuellesSpieler[1]}</p>
                </div>
              </div>

              {/* Frage */}
              <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                <p className="text-center text-sm font-medium text-zinc-500 mb-3">
                  Wer würde eher...
                </p>
                <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
                  {karte.text}
                </p>
              </div>
            </>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
              <Shuffle className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
              <p className="text-zinc-500">Erste Runde starten!</p>
            </div>
          )}
        </div>

        <button
          onClick={nächsteRunde}
          disabled={isLoading}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-5 text-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-violet-400"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          {karte ? "Nächste Runde" : "Los geht's!"}
        </button>
      </div>
    </GameLayout>
  );
}
