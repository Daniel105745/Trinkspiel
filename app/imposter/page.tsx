"use client";

import { useState, useEffect } from "react";
import { UserX, Shuffle, Eye, EyeOff, ChevronRight, RotateCcw, Minus, Plus, Trophy, Play } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { playTick, playCountdownEnd, playWin, playLose } from "@/lib/sounds";

const WÖRTER: Record<string, string[]> = {
  "Tiere 🐾":    ["Hund","Katze","Elefant","Pinguin","Giraffe","Delfin","Tiger","Krokodil","Flamingo","Panda","Löwe","Affe","Zebra","Koala","Otter","Papagei","Schildkröte","Hai","Wolf","Fuchs"],
  "Essen 🍕":    ["Pizza","Sushi","Burger","Schokolade","Avocado","Käse","Pommes","Nudeln","Steak","Eis","Donut","Tacos","Ramen","Croissant","Hot Dog","Popcorn","Chips","Cupcake","Brezeln","Spaghetti"],
  "Orte 🌍":     ["Paris","New York","Tokio","Sydney","Rom","Dubai","Barcelona","Malediven","Las Vegas","London","Berlin","Ägypten","Hawaii","Venedig","Ibiza","Amsterdam","Prag","Wien"],
  "Film & TV 🎬":["Star Wars","Titanic","Avatar","Friends","Breaking Bad","Harry Potter","Game of Thrones","Avengers","Joker","Matrix","Inception","Squid Game","Stranger Things","Der Pate","Pulp Fiction"],
  "Sport ⚽":     ["Fußball","Tennis","Boxen","Surfen","Skifahren","Basketball","Golf","Volleyball","Schwimmen","Radfahren","Kampfsport","Formel 1","Rugby","Baseball"],
  "Party 🍺":    ["Bier","Prosit","Schnapsglas","Kater","Bierpong","Freibier","Gin Tonic","Margarita","Cocktail","Shots","Weinschorle","Longdrink","Wodka","Tequila","Sekt"],
};
const ALLE = Object.values(WÖRTER).flat();
const HINTS: Record<string,string> = {
  Hund:"Leine",Katze:"Fell",Elefant:"Grau",Pinguin:"Frack",Giraffe:"Hals",Delfin:"Springen",Tiger:"Streifen",Krokodil:"Sumpf",Flamingo:"Rosa",Panda:"Schwarz-Weiß",Löwe:"König",Affe:"Baum",Zebra:"Gestreift",Koala:"Australien",Otter:"Schwimmen",Papagei:"Bunt",Schildkröte:"Langsam",Hai:"Flosse",Wolf:"Heulen",Fuchs:"Clever",
  Pizza:"Tomaten",Sushi:"Stäbchen",Burger:"Brötchen",Schokolade:"Kakao",Avocado:"Kernig",Käse:"Reifen",Pommes:"Salz",Nudeln:"Mehl",Steak:"Grill",Eis:"Kugel",Donut:"Loch",Tacos:"Mexiko",Ramen:"Suppe",Croissant:"Butter","Hot Dog":"Senf",Popcorn:"Kino",Chips:"Tüte",Cupcake:"Glasur",Brezeln:"Salz",Spaghetti:"Soße",
  Paris:"Frankreich","New York":"Wolkenkratzer",Tokio:"Japan",Sydney:"Australien",Rom:"Italien",Dubai:"Wüste",Barcelona:"Spanien",Malediven:"Insel","Las Vegas":"Casino",London:"Regen",Berlin:"Hauptstadt",Ägypten:"Pyramide",Hawaii:"Vulkan",Venedig:"Gondel",Ibiza:"Feiern",Amsterdam:"Kanal",Prag:"Brücke",Wien:"Walzer",
  "Star Wars":"Raumschiff",Titanic:"Eisberg",Avatar:"Blau",Friends:"Sofa","Breaking Bad":"Chemie","Harry Potter":"Magie","Game of Thrones":"Drachen",Avengers:"Superheld",Joker:"Clown",Matrix:"Simulation",Inception:"Traum","Squid Game":"Spiele","Stranger Things":"Kinder","Der Pate":"Mafia","Pulp Fiction":"Gangster",
  Fußball:"Tor",Tennis:"Schläger",Boxen:"Ring",Surfen:"Welle",Skifahren:"Schnee",Basketball:"Korb",Golf:"Fairway",Volleyball:"Netz",Schwimmen:"Bahn",Radfahren:"Pedal",Kampfsport:"Gürtel","Formel 1":"Rennstrecke",Rugby:"Oval",Baseball:"Handschuh",
  Bier:"Hopfen",Prosit:"Anstoßen",Schnapsglas:"Klein",Kater:"Kopfweh",Bierpong:"Becher",Freibier:"Gratis","Gin Tonic":"Gurke",Margarita:"Salz",Cocktail:"Shaker",Shots:"Schnell",Weinschorle:"Wein",Longdrink:"Eis",Wodka:"Russland",Tequila:"Limette",Sekt:"Blasen",
};

const pick = (k: string | null) => { const p = k ? WÖRTER[k] : ALLE; return p[Math.floor(Math.random() * p.length)]; };
const hint = (w: string) => HINTS[w] ?? "???";
const gn = (ns: string[], i: number) => ns[i]?.trim() || `Spieler ${i + 1}`;

type Phase = "setup" | "passing" | "playing" | "result";

export default function ImposterPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [pCount, setPCount] = useState(4);
  const [pNames, setPNames] = useState<string[]>(Array(10).fill(""));
  const [kat, setKat] = useState<string | null>(null);
  const [word, setWord] = useState(() => pick(null));
  const [impIdx, setImpIdx] = useState<number[]>([]);
  const [cur, setCur] = useState(0);
  const [show, setShow] = useState(false);
  const [ack, setAck] = useState(false);
  const [vote, setVote] = useState<number | null>(null);
  const [cd, setCd] = useState<number | null>(null);
  const [hintW, setHintW] = useState("");
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));
  const [rnd, setRnd] = useState(0);
  const [twoImp, setTwoImp] = useState(false);

  useEffect(() => {
    if (cd === null) return;
    if (cd === 0) { playCountdownEnd(); setCd(null); return; }
    playTick();
    const t = setTimeout(() => setCd(c => c !== null ? c - 1 : null), 1000);
    return () => clearTimeout(t);
  }, [cd]);

  const isImp = impIdx.includes(cur);
  const correct = vote !== null && impIdx.includes(vote);

  function startGame() {
    const cnt = twoImp ? 2 : 1;
    const pool = Array.from({ length: pCount }, (_, i) => i);
    const idx: number[] = [];
    for (let i = 0; i < cnt; i++) { const r = Math.floor(Math.random() * pool.length); idx.push(...pool.splice(r, 1)); }
    setImpIdx(idx); setCur(0); setShow(false); setAck(false); setVote(null);
    setHintW(hint(word)); setRnd(r => r + 1); setCd(5); setPhase("passing");
  }

  function resolve() {
    const ok = vote !== null && impIdx.includes(vote);
    const ns = [...scores];
    if (ok) { for (let i = 0; i < pCount; i++) if (!impIdx.includes(i)) ns[i]++; }
    else { for (const i of impIdx) ns[i]++; }
    setScores(ns); ok ? playWin() : playLose(); setPhase("result");
  }

  function newRound() { setWord(pick(kat)); setVote(null); setImpIdx([]); setCur(0); setShow(false); setAck(false); setPhase("setup"); }
  function resetScores() { setScores(Array(10).fill(0)); setRnd(0); newRound(); }

  const maxS = Math.max(...scores.slice(0, pCount), 1);

  /* ═══ SETUP ═══ */
  if (phase === "setup") {
    return (
      <GameLayout title="Imposter" titleIcon={<UserX className="h-3.5 w-3.5 text-red-400" />}
        glowColor="rgba(239,68,68,0.07)" accentClass="accent-top-red">
        <div className="flex flex-col gap-3 pb-1">
          {/* scoreboard */}
          {rnd > 0 && (
            <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-amber-500/15 bg-amber-950/12 backdrop-blur-xl p-4">
              <div className="accent-top-amber" />
              <p className="mb-2.5 flex items-center gap-1.5 section-label !text-amber-400">
                <Trophy className="h-3.5 w-3.5" /> Punkte nach Runde {rnd}
              </p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: pCount }, (_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-[72px] truncate text-[13px] font-bold text-zinc-300">{gn(pNames, i)}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                        style={{ width: `${(scores[i] / maxS) * 100}%` }} />
                    </div>
                    <span className="w-5 text-right text-[14px] font-extrabold text-amber-400">{scores[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* player count */}
          <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-4">
            <div className="accent-top-red" />
            <p className="section-label mb-3">Spieleranzahl</p>
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => setPCount(p => Math.max(3, p - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] border border-white/8 bg-white/[0.04] text-zinc-300 active:scale-[0.92]">
                <Minus className="h-[18px] w-[18px]" />
              </button>
              <div className="text-center">
                <span className="text-[48px] font-black text-white leading-none">{pCount}</span>
                <p className="text-[11px] font-bold text-zinc-600">Spieler</p>
              </div>
              <button onClick={() => setPCount(p => Math.min(10, p + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] border border-white/8 bg-white/[0.04] text-zinc-300 active:scale-[0.92]">
                <Plus className="h-[18px] w-[18px]" />
              </button>
            </div>
            {/* 2-imp toggle */}
            <button onClick={() => setTwoImp(v => !v)}
              className="mt-3 flex w-full items-center justify-between rounded-[var(--r-md)] border border-white/6 bg-white/[0.03] px-3.5 py-3 active:scale-[0.97]">
              <div>
                <p className="text-[14px] font-extrabold text-zinc-200">2 Imposter</p>
                <p className="text-[11px] font-semibold text-zinc-500">Mehr Chaos</p>
              </div>
              <div className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${twoImp ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-white/8"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoImp ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>
          </div>

          {/* names */}
          <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-4">
            <div className="accent-top-red" />
            <p className="section-label mb-2.5">Spielernamen</p>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: pCount }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-red-500/12 border border-red-500/15 text-[12px] font-extrabold text-red-400">
                    {i + 1}
                  </div>
                  <input value={pNames[i]} onChange={e => { const n = [...pNames]; n[i] = e.target.value; setPNames(n); }}
                    placeholder={`Spieler ${i + 1}`} maxLength={15} className="input !py-2.5 !text-[13px]" />
                </div>
              ))}
            </div>
          </div>

          {/* category */}
          <div>
            <p className="section-label mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => { setKat(null); setWord(pick(null)); }}
                className={`rounded-full px-3.5 py-[7px] text-[12px] font-extrabold active:scale-[0.94] ${!kat ? "bg-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)]" : "border border-white/8 bg-white/[0.04] text-zinc-400"}`}>
                Alle
              </button>
              {Object.keys(WÖRTER).map(k => (
                <button key={k} onClick={() => { setKat(k); setWord(pick(k)); }}
                  className={`rounded-full px-3.5 py-[7px] text-[12px] font-extrabold active:scale-[0.94] ${kat === k ? "bg-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)]" : "border border-white/8 bg-white/[0.04] text-zinc-400"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* word preview */}
          <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-4">
            <div className="accent-top-red" />
            <p className="section-label mb-1">Geheimes Wort</p>
            <p className="text-[32px] font-black text-white">{word}</p>
            <button onClick={() => setWord(pick(kat))}
              className="mt-2.5 flex items-center gap-1.5 rounded-[var(--r-md)] border border-white/8 bg-white/[0.04] px-3.5 py-[9px] text-[12px] font-extrabold text-zinc-400 active:scale-[0.95]">
              <Shuffle className="h-3.5 w-3.5" /> Anderes Wort
            </button>
          </div>

          {/* start */}
          <button onClick={startGame}
            className="btn-primary w-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] !py-[14px] !text-[16px]">
            <Play className="h-[18px] w-[18px]" />
            {rnd > 0 ? "Neue Runde starten" : "Spiel starten"}
          </button>
        </div>
      </GameLayout>
    );
  }

  /* ═══ COUNTDOWN ═══ */
  if (phase === "passing" && cd !== null) {
    return (
      <GameLayout title="Imposter" titleIcon={<UserX className="h-3.5 w-3.5 text-red-400" />}
        glowColor="rgba(239,68,68,0.10)" accentClass="accent-top-red">
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <p className="section-label">Runde {rnd} startet in</p>
          <div className="anim-cd relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-red-500/35 bg-red-950/25 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
            <span className="text-[80px] font-black text-white leading-none">{cd}</span>
          </div>
          <p className="text-[15px] font-extrabold text-zinc-400">Macht euch bereit!</p>
        </div>
      </GameLayout>
    );
  }

  /* ═══ PASSING ═══ */
  if (phase === "passing") {
    return (
      <GameLayout title="Imposter" titleIcon={<UserX className="h-3.5 w-3.5 text-red-400" />}
        glowColor="rgba(239,68,68,0.07)" accentClass="accent-top-red"
        counter={`${cur + 1}/${pCount}`}>
        <div className="flex flex-1 flex-col items-center gap-4">
          <div className="text-center w-full">
            <p className="text-[18px] font-extrabold text-white">{gn(pNames, cur)}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-zinc-500">Verdeckt halten – nur du schaust!</p>
          </div>

          <div className="w-full">
            {!show && !ack && (
              <button onClick={() => setShow(true)}
                className="anim-pop relative w-full overflow-hidden rounded-[var(--r-xl)] glass-card p-8 flex flex-col items-center gap-4 active:scale-[0.97]">
                <div className="accent-top-red" />
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/8">
                  <EyeOff className="h-10 w-10 text-red-400" />
                </div>
                <p className="text-[16px] font-extrabold text-zinc-400">Tippen zum Anzeigen</p>
              </button>
            )}

            {show && (
              <div className={`anim-pop relative w-full overflow-hidden rounded-[var(--r-xl)] backdrop-blur-xl shadow-[var(--sh-card)] p-7 flex flex-col items-center gap-3.5 ${
                isImp ? "border border-red-500/35 bg-red-950/35" : "border border-emerald-500/35 bg-emerald-950/20"}`}>
                <div className={isImp ? "accent-top-red" : "accent-top-green"} />
                {isImp ? (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/12">
                      <span className="text-5xl">🕵️</span>
                    </div>
                    <p className="text-[14px] font-extrabold text-red-400 uppercase tracking-wider">Du bist der</p>
                    <p className="text-[40px] font-black text-red-300 leading-tight">IMPOSTER!</p>
                    <div className="w-full rounded-[var(--r-md)] border border-red-500/15 bg-red-500/8 px-4 py-3 text-center">
                      <p className="section-label !text-red-500 mb-1">Dein Hilfswort</p>
                      <p className="text-[26px] font-black text-red-200">{hintW}</p>
                    </div>
                    <p className="text-center text-[12px] font-bold text-red-400">Nutze dein Hilfswort – nenn das echte Wort nicht!</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/25 bg-emerald-500/8">
                      <Eye className="h-10 w-10 text-emerald-400" />
                    </div>
                    <p className="section-label mb-1">Das geheime Wort ist</p>
                    <p className="text-[44px] font-black text-white">{word}</p>
                    <p className="text-center text-[12px] font-bold text-emerald-400">Finde den Imposter! Nenn das Wort nicht direkt.</p>
                  </>
                )}
                <button onClick={() => { setShow(false); setAck(true); }}
                  className="mt-1 btn-secondary !rounded-[var(--r-md)] !py-[10px] !px-5 !text-[13px]">
                  <EyeOff className="h-3.5 w-3.5" /> Verstanden & Verbergen
                </button>
              </div>
            )}

            {ack && !show && (
              <div className="anim-fade relative w-full overflow-hidden rounded-[var(--r-xl)] glass p-7 flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  <EyeOff className="h-8 w-8 text-zinc-500" />
                </div>
                <p className="text-[16px] font-extrabold text-zinc-500">Verdeckt</p>
              </div>
            )}
          </div>

          {ack && (
            <button onClick={() => {
              if (cur + 1 >= pCount) setPhase("playing");
              else { setCur(p => p + 1); setShow(false); setAck(false); }
            }}
              className="btn-primary bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] !px-7">
              {cur + 1 >= pCount ? "Los geht's! 🚀" : gn(pNames, cur + 1)}
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </GameLayout>
    );
  }

  /* ═══ VOTING ═══ */
  if (phase === "playing") {
    return (
      <GameLayout title="Imposter" titleIcon={<UserX className="h-3.5 w-3.5 text-red-400" />}
        glowColor="rgba(239,68,68,0.07)" accentClass="accent-top-red">
        <div className="flex flex-1 flex-col gap-3 pb-1">
          <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-4">
            <div className="accent-top-red" />
            <p className="text-[20px] font-extrabold text-white mb-1">🕵️ Findet {twoImp ? "die Imposter!" : "den Imposter!"}</p>
            <p className="text-[13px] font-semibold text-zinc-500">Redet abwechselnd über das Wort. Wer ist verdächtig?</p>
          </div>

          <div className="flex-1">
            <p className="section-label mb-2">Wen verdächtigt ihr?</p>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: pCount }, (_, i) => (
                <button key={i} onClick={() => setVote(vote === i ? null : i)}
                  className={`flex items-center gap-2.5 rounded-[var(--r-md)] border p-3.5 text-left transition-all active:scale-[0.97] ${
                    vote === i ? "border-red-500/45 bg-red-950/35 shadow-[0_0_14px_rgba(239,68,68,0.18)]" : "border-[var(--c-border)] bg-[var(--c-surface)]"}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[13px] font-extrabold transition-colors ${
                    vote === i ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-white/8 text-zinc-400"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-[15px] font-extrabold ${vote === i ? "text-white" : "text-zinc-300"}`}>{gn(pNames, i)}</span>
                  {vote === i && <span className="ml-auto text-[18px]">🎯</span>}
                </button>
              ))}
            </div>
          </div>

          <button onClick={resolve} disabled={vote === null}
            className="btn-primary w-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] disabled:opacity-40 !py-[14px] !text-[16px]">
            🎲 Auflösung!
          </button>
        </div>
      </GameLayout>
    );
  }

  /* ═══ RESULT ═══ */
  const impNames = impIdx.map(i => gn(pNames, i));
  const multi = impIdx.length > 1;

  return (
    <GameLayout title="Imposter" titleIcon={<UserX className="h-3.5 w-3.5 text-red-400" />}
      glowColor={correct ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)"}
      accentClass={correct ? "accent-top-green" : "accent-top-red"}>
      <div className="flex flex-1 flex-col items-center gap-3 pb-1">
        {/* result card */}
        <div className={`anim-pop relative w-full overflow-hidden rounded-[var(--r-xl)] backdrop-blur-xl shadow-[var(--sh-card)] p-7 text-center ${
          correct ? "border border-emerald-500/35 bg-emerald-950/20" : "border border-red-500/35 bg-red-950/20"}`}>
          <div className={correct ? "accent-top-green" : "accent-top-red"} />
          <div className="text-[64px] mb-3 leading-none">{correct ? "🎉" : "💀"}</div>
          {correct ? (
            <>
              <p className="text-[28px] font-black text-emerald-300 mb-1.5">Richtig!</p>
              <p className="text-[14px] font-bold text-zinc-400">{gn(pNames, vote!)} war {multi ? "ein" : "der"} Imposter – muss trinken!</p>
              {multi && <p className="mt-1 text-[13px] text-zinc-500">Auch: {impIdx.filter(i => i !== vote).map(i => gn(pNames, i)).join(", ")}</p>}
            </>
          ) : (
            <>
              <p className="text-[28px] font-black text-red-300 mb-1.5">Falsch!</p>
              <p className="text-[14px] font-bold text-zinc-400">{impNames.join(" & ")} {multi ? "waren die Imposter" : "war der Imposter"} – alle anderen trinken!</p>
            </>
          )}
          <div className="mt-4 rounded-[var(--r-md)] border border-white/8 bg-white/[0.04] p-3.5">
            <p className="section-label mb-0.5">Das Wort war</p>
            <p className="text-[32px] font-black text-white">{word}</p>
          </div>
        </div>

        {/* scores */}
        <div className="relative w-full overflow-hidden rounded-[var(--r-xl)] border border-amber-500/15 bg-amber-950/12 backdrop-blur-xl p-4">
          <div className="accent-top-amber" />
          <p className="mb-2.5 flex items-center gap-1.5 section-label !text-amber-400"><Trophy className="h-3.5 w-3.5" /> Runde {rnd}</p>
          <div className="flex flex-col gap-2">
            {Array.from({ length: pCount }, (_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-[72px] truncate text-[13px] font-bold text-zinc-300">{gn(pNames, i)}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${(scores[i] / maxS) * 100}%` }} />
                </div>
                <span className="w-5 text-right text-[14px] font-extrabold text-amber-400">{scores[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="flex w-full flex-col gap-2.5">
          <button onClick={newRound}
            className="btn-primary w-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] !py-[14px] !text-[16px]">
            <ChevronRight className="h-[18px] w-[18px]" /> Neue Runde
          </button>
          <button onClick={resetScores} className="btn-secondary w-full !text-[13px]">
            <RotateCcw className="h-3.5 w-3.5" /> Punkte zurücksetzen
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
