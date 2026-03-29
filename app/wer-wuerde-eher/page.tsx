"use client";

import { useState, useEffect } from "react";
import { SkipForward, Plus, X, Users2, Play } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";
import { WER_WUERDE_EHER_18_PLUS } from "@/lib/fragenData";

const LOCAL_18: Aufgabe[] = WER_WUERDE_EHER_18_PLUS.map((text, i) => ({
  id: -(i + 1), text, typ: "wer_wuerde_eher",
}));

function twoPick(arr: string[]): [string, string] {
  const s = [...arr].sort(() => Math.random() - 0.5);
  return [s[0], s[1]];
}

const PCOL = [
  "from-violet-500 to-purple-600", "from-sky-400 to-blue-500",
  "from-emerald-400 to-green-500", "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500", "from-cyan-400 to-teal-500",
];

export default function WerWürdeEher() {
  const [players, setPlayers] = useState<string[]>([]);
  const [inp, setInp] = useState("");
  const [phase, setPhase] = useState<"setup" | "game">("setup");
  const [sbCards, setSbCards] = useState<Aufgabe[]>([]);
  const [cards, setCards] = useState<Aufgabe[]>([]);
  const [idx, setIdx] = useState(-1);
  const [vs, setVs] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modus, setModus] = useState<"normal" | "18+">("normal");
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("aufgaben").select("id, text, typ").eq("typ", "wer_wuerde_eher");
      if (error) throw error;
      const f = (data as Aufgabe[]) ?? [];
      setSbCards(f);
      let pool = [...f];
      if (modus === "18+") pool = [...pool, ...LOCAL_18];
      if (!pool.length) { setLoading(false); setErr("Keine Karten gefunden."); return; }
      setCards([...pool].sort(() => Math.random() - 0.5));
      setIdx(0); setVs(twoPick(players)); setErr(null);
    } catch { setErr("Fehler beim Laden."); setLoading(false); return; }
    setLoading(false); setPhase("game");
  }

  useEffect(() => {
    if (phase !== "game") return;
    let pool = [...sbCards];
    if (modus === "18+") pool = [...pool, ...LOCAL_18];
    if (pool.length) { setCards([...pool].sort(() => Math.random() - 0.5)); setIdx(0); }
  }, [modus]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { setIdx(i => (i + 1) % Math.max(cards.length, 1)); setVs(twoPick(players)); };
  const add = () => { const n = inp.trim(); if (n && !players.includes(n)) setPlayers([...players, n]); setInp(""); };

  const sw = useSwipeable({ onSwipedLeft: next, onSwipedRight: next, preventScrollOnSwipe: true });
  const card = idx >= 0 ? cards[idx] : null;

  /* ═══ SETUP ═══ */
  if (phase === "setup") {
    return (
      <GameLayout title="Am ehesten würde…" titleIcon={<Users2 className="h-3.5 w-3.5 text-emerald-400" />}
        glowColor="rgba(52,211,153,0.07)" accentClass="accent-top-green">
        <div className="flex flex-col gap-3">
          {/* hint */}
          <div className="glass rounded-[var(--r-md)] px-4 py-2.5 text-center">
            <p className="text-[13px] font-extrabold text-zinc-400">
              Mindestens <span className="text-emerald-400">2 Spieler</span> hinzufügen
            </p>
          </div>

          {/* input */}
          <div className="flex gap-2">
            <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
              placeholder="Name eingeben…" className="input flex-1" />
            <button onClick={add} disabled={!inp.trim()}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[var(--r-md)] bg-gradient-to-br from-emerald-500 to-green-500 shadow-[0_3px_14px_rgba(52,211,153,0.3)] active:scale-[0.92] disabled:opacity-40">
              <Plus className="h-[18px] w-[18px] text-white" />
            </button>
          </div>

          {/* player list */}
          {players.length > 0 && (
            <div className="flex flex-col gap-2">
              {players.map((n, i) => (
                <div key={n} style={{ animationDelay: `${i * 45}ms` }}
                  className="anim-player flex items-center justify-between rounded-[var(--r-md)] glass px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br ${PCOL[i % PCOL.length]} text-[12px] font-extrabold text-white`}>
                      {n[0].toUpperCase()}
                    </div>
                    <span className="text-[14px] font-bold text-white">{n}</span>
                  </div>
                  <button onClick={() => setPlayers(players.filter(s => s !== n))}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] active:bg-red-900/25">
                    <X className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 18+ */}
          <button onClick={() => setModus(m => m === "normal" ? "18+" : "normal")}
            className={`toggle-18 ${modus === "18+" ? "on" : "off"}`}>
            🔞 {modus === "18+" ? "18+ aktiv – Deaktivieren" : "18+ Modus freischalten"}
          </button>

          {err && (
            <div className="rounded-[var(--r-md)] border border-red-800/50 bg-red-950/35 px-4 py-2.5 text-center">
              <p className="text-[13px] font-bold text-red-300">{err}</p>
            </div>
          )}

          {/* start */}
          <button onClick={start} disabled={players.length < 2 || loading}
            className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-40 !py-[14px] !text-[16px]">
            <Play className="h-[18px] w-[18px]" />
            {loading ? "Laden…" : `Spielen! (${players.length} Spieler)`}
          </button>
        </div>
      </GameLayout>
    );
  }

  /* ═══ GAME ═══ */
  return (
    <GameLayout title="Am ehesten würde…" titleIcon={<Users2 className="h-3.5 w-3.5 text-emerald-400" />}
      glowColor="rgba(52,211,153,0.07)" accentClass="accent-top-green"
      counter={cards.length > 0 ? `${idx + 1}/${cards.length}` : ""}>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex flex-1 items-center justify-center py-1">
          {!card ? (
            <p className="text-[14px] font-extrabold text-zinc-500">Keine Karten.</p>
          ) : (
            <div key={idx} {...sw} style={{ touchAction: "pan-y" }}
              className="anim-slide relative w-full overflow-hidden rounded-[var(--r-xl)] select-none glass-card">
              <div className="accent-top-green" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="px-5 pt-5 pb-6">
                {/* VS */}
                {vs && (
                  <div className="mb-4 glass rounded-[var(--r-md)] px-3.5 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[15px] font-extrabold text-white truncate max-w-[100px]">{vs[0]}</span>
                      <span className="text-[10px] font-extrabold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/15">VS</span>
                      <span className="text-[15px] font-extrabold text-white truncate max-w-[100px]">{vs[1]}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 border border-emerald-500/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                    <span className="text-sm">🤷</span>Gruppenspiel
                  </span>
                  <span className="text-[11px] font-bold text-zinc-600 tabular-nums">{idx + 1}/{cards.length}</span>
                </div>

                <p className="text-center text-[12px] font-extrabold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Wer würde am ehesten…
                </p>
                <p className="text-center text-[20px] font-extrabold text-white leading-snug min-h-[72px] flex items-center justify-center">
                  {card.text}
                </p>

                <div className="swipe-hint"><div className="line" /><span className="label">Swipe für nächste</span><div className="line" /></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={() => setModus(m => m === "normal" ? "18+" : "normal")}
            className={`toggle-18 ${modus === "18+" ? "on" : "off"}`}>
            🔞 {modus === "18+" ? "18+ aktiv – Deaktivieren" : "18+ Modus freischalten"}
          </button>

          <div className="btn-row">
            <button onClick={() => setPhase("setup")} className="btn-secondary">
              <Users2 className="h-4 w-4" />Spieler
            </button>
            <button onClick={next}
              className="btn-primary bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <SkipForward className="h-[18px] w-[18px]" />Nächste
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
