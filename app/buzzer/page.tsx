"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, RefreshCw, AlertCircle, RotateCcw } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

type GameState = "idle" | "waiting" | "revealed" | "pressed";

function reaktionsBewertung(ms: number) {
  if (ms < 300) return { text: "Blitzschnell! ⚡", color: "text-emerald-400" };
  if (ms < 600) return { text: "Gut reagiert! 👍", color: "text-sky-400" };
  if (ms < 1000) return { text: "Na ja... 😅", color: "text-amber-400" };
  return { text: "Schläfrig! Trinken! 🍺", color: "text-red-400" };
}

export default function Buzzer() {
  const [karte, setKarte] = useState<Aufgabe | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aufräumen bei Unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    };
  }, []);

  async function ladeKarte() {
    setIsLoading(true);
    setFehler(null);
    setGameState("idle");
    setReactionMs(null);

    const { data, error } = await supabase
      .from("aufgaben")
      .select("id, text, typ")
      .eq("typ", "buzzer")
      .neq("id", karte?.id ?? 0)
      .limit(10);

    if (error || !data || data.length === 0) {
      setFehler("Keine Buzzer-Aufgaben in der Datenbank.");
    } else {
      setKarte(data[Math.floor(Math.random() * data.length)] as Aufgabe);
    }
    setIsLoading(false);
  }

  const starteRunde = useCallback(() => {
    setGameState("waiting");
    setReactionMs(null);
    setElapsedMs(0);

    // Zufällige Wartezeit: 1500 – 5000 ms
    const delay = 1500 + Math.random() * 3500;

    waitTimeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("revealed");

      // Reaction timer: alle 50ms updaten
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - (startTimeRef.current ?? Date.now()));
      }, 50);
    }, delay);
  }, []);

  function drücken() {
    if (gameState !== "revealed") return;

    const ms = Date.now() - (startTimeRef.current ?? Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
    setReactionMs(ms);
    setGameState("pressed");
  }

  function abbrechen() {
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("idle");
    setReactionMs(null);
  }

  const bewertung = reactionMs !== null ? reaktionsBewertung(reactionMs) : null;

  return (
    <GameLayout title="Buzzer">
      <div
        className="mx-auto flex w-full max-w-md flex-col justify-between"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        {/* Karten-Bereich */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          {fehler ? (
            <div className="flex w-full items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="text-red-300 text-sm">{fehler}</p>
            </div>
          ) : (
            <>
              {/* Aufgaben-Karte */}
              {karte ? (
                <div
                  className={`w-full rounded-2xl border p-8 shadow-2xl transition-all duration-300 ${
                    gameState === "revealed" || gameState === "pressed"
                      ? "border-red-800/60 bg-red-950/20"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  {gameState === "waiting" ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-zinc-400 text-lg font-medium">Warten...</p>
                    </div>
                  ) : (
                    <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
                      {karte.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
                  <Zap className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                  <p className="text-zinc-500">Lade zuerst eine Karte</p>
                </div>
              )}

              {/* Reaktionszeit / Ergebnis */}
              {gameState === "revealed" && (
                <div className="text-center">
                  <p className="text-5xl font-black tabular-nums text-red-400">
                    {(elapsedMs / 1000).toFixed(2)}s
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">Reagiere jetzt!</p>
                </div>
              )}

              {gameState === "pressed" && bewertung && reactionMs !== null && (
                <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
                  <p className="text-5xl font-black tabular-nums text-zinc-100 mb-2">
                    {(reactionMs / 1000).toFixed(2)}s
                  </p>
                  <p className={`text-xl font-bold ${bewertung.color}`}>
                    {bewertung.text}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-8">
          {/* Haupt-BUZZ-Button */}
          {gameState === "revealed" && (
            <button
              onClick={drücken}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-7 text-2xl font-black text-white shadow-2xl transition-all active:scale-95 hover:bg-red-400 animate-pulse"
            >
              <Zap className="h-7 w-7" />
              BUZZ!
            </button>
          )}

          {/* Runde starten / Abbrechen */}
          {gameState === "idle" && karte && (
            <button
              onClick={starteRunde}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-5 text-xl font-bold text-white shadow-lg transition-all active:scale-95 hover:bg-red-400"
            >
              <Zap className="h-5 w-5" />
              Runde starten
            </button>
          )}

          {gameState === "waiting" && (
            <button
              onClick={abbrechen}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 py-5 text-lg font-bold text-zinc-300 transition-all active:scale-95 hover:bg-zinc-700"
            >
              Abbrechen
            </button>
          )}

          {gameState === "pressed" && (
            <button
              onClick={starteRunde}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-700 py-5 text-lg font-bold text-zinc-100 transition-all active:scale-95 hover:bg-zinc-600"
            >
              <RotateCcw className="h-5 w-5" />
              Noch mal
            </button>
          )}

          {/* Neue Karte laden */}
          <button
            onClick={ladeKarte}
            disabled={isLoading || gameState === "waiting" || gameState === "revealed"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 py-4 text-base font-medium text-zinc-400 transition-all active:scale-95 disabled:opacity-40 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {karte ? "Neue Karte" : "Karte laden"}
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
