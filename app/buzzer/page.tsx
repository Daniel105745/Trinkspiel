"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, RefreshCw, Radio, RotateCcw } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

type GameState = "idle" | "waiting" | "revealed" | "pressed";

function bewertung(ms: number): { text: string; color: string } {
  if (ms < 300) return { text: "Blitzschnell! ⚡", color: "text-emerald-400" };
  if (ms < 600) return { text: "Gut reagiert! 👍", color: "text-sky-400" };
  if (ms < 1000) return { text: "Na ja... 😅", color: "text-amber-400" };
  return { text: "Zu langsam! Trinken! 🍺", color: "text-red-400" };
}

export default function Buzzer() {
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("aufgaben")
        .select("id, text, typ")
        .eq("typ", "buzzer");
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5) as Aufgabe[];
        setCards(shuffled);
        setIndex(0);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waitRef.current) clearTimeout(waitRef.current);
    };
  }, []);

  function nächsteKarte() {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setGameState("idle");
    setReactionMs(null);
    setElapsedMs(0);
  }

  const starteRunde = useCallback(() => {
    setGameState("waiting");
    setReactionMs(null);
    setElapsedMs(0);
    const delay = 1500 + Math.random() * 3500;
    waitRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("revealed");
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
    if (waitRef.current) clearTimeout(waitRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("idle");
  }

  const card = index >= 0 ? cards[index] : null;
  const result = reactionMs !== null ? bewertung(reactionMs) : null;
  const counter = cards.length > 0 ? `${index + 1}/${cards.length}` : "";

  return (
    <GameLayout
      title="Buzzer Mode"
      titleIcon={<Radio className="h-4 w-4 text-orange-400" />}
      glowColor="rgba(239,68,68,0.10)"
      counter={counter}
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 items-center justify-center py-4">
          {loading ? (
            <div className="text-zinc-500 text-lg font-bold">Lade Karten...</div>
          ) : !card ? (
            <div className="text-zinc-500 text-lg font-bold">Keine Karten gefunden.</div>
          ) : (
            <div className="flex w-full max-w-sm flex-col gap-4">
              {/* Aufgaben-Karte */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 to-red-500" />
                <div className="p-6 pb-8 pt-7">
                  <span className="inline-block rounded-xl bg-red-900/50 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-300">
                    Aufgabe
                  </span>

                  {gameState === "waiting" ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-lg font-black text-zinc-400">Warten...</p>
                    </div>
                  ) : (
                    <>
                      <div className="my-6 text-center text-6xl">⚡</div>
                      <p className="text-center text-xl font-black text-white leading-snug">
                        {card.text}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Reaktionszeit / Ergebnis */}
              {gameState === "revealed" && (
                <div className="text-center">
                  <p className="text-5xl font-black tabular-nums text-red-400">
                    {(elapsedMs / 1000).toFixed(2)}s
                  </p>
                </div>
              )}
              {gameState === "pressed" && result && reactionMs !== null && (
                <div className="rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_32px_rgba(0,0,0,0.4)] p-6 text-center">
                  <p className="text-5xl font-black tabular-nums text-white mb-2">
                    {(reactionMs / 1000).toFixed(2)}s
                  </p>
                  <p className={`text-xl font-black ${result.color}`}>{result.text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-2">
          {gameState === "revealed" && (
            <button
              onClick={drücken}
              className="flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 py-7 text-2xl font-black text-white shadow-[0_0_30px_rgba(239,68,68,0.5),0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 animate-pulse"
            >
              <Zap className="h-7 w-7" />
              BUZZ!
            </button>
          )}
          {gameState === "idle" && card && (
            <button
              onClick={starteRunde}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95"
            >
              <Zap className="h-5 w-5" />
              Runde starten
            </button>
          )}
          {gameState === "waiting" && (
            <button
              onClick={abbrechen}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] py-5 text-lg font-black text-zinc-300 transition-all active:scale-95"
            >
              Abbrechen
            </button>
          )}
          {gameState === "pressed" && (
            <button
              onClick={starteRunde}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] py-5 text-lg font-black text-zinc-200 transition-all active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              Noch mal
            </button>
          )}
          <button
            onClick={nächsteKarte}
            disabled={gameState === "waiting" || gameState === "revealed"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] py-3.5 text-sm font-black text-zinc-400 transition-all active:scale-95 disabled:opacity-30"
          >
            <RefreshCw className="h-4 w-4" />
            Neue Karte
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
