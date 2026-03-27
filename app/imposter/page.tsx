"use client";

import { useState, useEffect } from "react";
import { UserX, Shuffle, Eye, EyeOff, ChevronRight, RotateCcw, Minus, Plus, Trophy } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { playTick, playCountdownEnd, playWin, playLose } from "@/lib/sounds";

const WÖRTER: Record<string, string[]> = {
  "Tiere 🐾": [
    "Hund", "Katze", "Elefant", "Pinguin", "Giraffe", "Delfin", "Tiger",
    "Krokodil", "Flamingo", "Panda", "Löwe", "Affe", "Zebra", "Koala",
    "Otter", "Papagei", "Schildkröte", "Hai", "Wolf", "Fuchs",
  ],
  "Essen 🍕": [
    "Pizza", "Sushi", "Burger", "Schokolade", "Avocado", "Käse", "Pommes",
    "Nudeln", "Steak", "Eis", "Donut", "Tacos", "Ramen", "Croissant",
    "Hot Dog", "Popcorn", "Chips", "Cupcake", "Brezeln", "Spaghetti",
  ],
  "Orte 🌍": [
    "Paris", "New York", "Tokio", "Sydney", "Rom", "Dubai", "Barcelona",
    "Malediven", "Las Vegas", "London", "Berlin", "Ägypten", "Hawaii",
    "Venedig", "Ibiza", "Amsterdam", "Prag", "Wien",
  ],
  "Film & TV 🎬": [
    "Star Wars", "Titanic", "Avatar", "Friends", "Breaking Bad", "Harry Potter",
    "Game of Thrones", "Avengers", "Joker", "Matrix", "Inception",
    "Squid Game", "Stranger Things", "Der Pate", "Pulp Fiction",
  ],
  "Sport ⚽": [
    "Fußball", "Tennis", "Boxen", "Surfen", "Skifahren", "Basketball",
    "Golf", "Volleyball", "Schwimmen", "Radfahren", "Kampfsport", "Formel 1",
    "Rugby", "Baseball",
  ],
  "Party 🍺": [
    "Bier", "Prosit", "Schnapsglas", "Kater", "Bierpong", "Freibier",
    "Gin Tonic", "Margarita", "Cocktail", "Shots", "Weinschorle",
    "Longdrink", "Wodka", "Tequila", "Sekt",
  ],
};

const ALLE = Object.values(WÖRTER).flat();

const HILFSWÖRTER: Record<string, string> = {
  "Hund": "Leine", "Katze": "Fell", "Elefant": "Grau", "Pinguin": "Frack",
  "Giraffe": "Hals", "Delfin": "Springen", "Tiger": "Streifen",
  "Krokodil": "Sumpf", "Flamingo": "Rosa", "Panda": "Schwarz-Weiß",
  "Löwe": "König", "Affe": "Baum", "Zebra": "Gestreift",
  "Koala": "Australien", "Otter": "Schwimmen", "Papagei": "Bunt",
  "Schildkröte": "Langsam", "Hai": "Flosse", "Wolf": "Heulen", "Fuchs": "Clever",
  "Pizza": "Tomaten", "Sushi": "Stäbchen", "Burger": "Brötchen",
  "Schokolade": "Kakao", "Avocado": "Kernig", "Käse": "Reifen",
  "Pommes": "Salz", "Nudeln": "Mehl", "Steak": "Grill", "Eis": "Kugel",
  "Donut": "Loch", "Tacos": "Mexiko", "Ramen": "Suppe",
  "Croissant": "Butter", "Hot Dog": "Senf", "Popcorn": "Kino",
  "Chips": "Tüte", "Cupcake": "Glasur", "Brezeln": "Salz", "Spaghetti": "Soße",
  "Paris": "Frankreich", "New York": "Wolkenkratzer", "Tokio": "Japan",
  "Sydney": "Australien", "Rom": "Italien", "Dubai": "Wüste",
  "Barcelona": "Spanien", "Malediven": "Insel", "Las Vegas": "Casino",
  "London": "Regen", "Berlin": "Hauptstadt", "Ägypten": "Pyramide",
  "Hawaii": "Vulkan", "Venedig": "Gondel", "Ibiza": "Feiern",
  "Amsterdam": "Kanal", "Prag": "Brücke", "Wien": "Walzer",
  "Star Wars": "Raumschiff", "Titanic": "Eisberg", "Avatar": "Blau",
  "Friends": "Sofa", "Breaking Bad": "Chemie", "Harry Potter": "Magie",
  "Game of Thrones": "Drachen", "Avengers": "Superheld", "Joker": "Clown",
  "Matrix": "Simulation", "Inception": "Traum", "Squid Game": "Spiele",
  "Stranger Things": "Kinder", "Der Pate": "Mafia", "Pulp Fiction": "Gangster",
  "Fußball": "Tor", "Tennis": "Schläger", "Boxen": "Ring",
  "Surfen": "Welle", "Skifahren": "Schnee", "Basketball": "Korb",
  "Golf": "Fairway", "Volleyball": "Netz", "Schwimmen": "Bahn",
  "Radfahren": "Pedal", "Kampfsport": "Gürtel", "Formel 1": "Rennstrecke",
  "Rugby": "Oval", "Baseball": "Handschuh",
  "Bier": "Hopfen", "Prosit": "Anstoßen", "Schnapsglas": "Klein",
  "Kater": "Kopfweh", "Bierpong": "Becher", "Freibier": "Gratis",
  "Gin Tonic": "Gurke", "Margarita": "Salz", "Cocktail": "Shaker",
  "Shots": "Schnell", "Weinschorle": "Wein", "Longdrink": "Eis",
  "Wodka": "Russland", "Tequila": "Limette", "Sekt": "Blasen",
};

function pickWord(kat: string | null): string {
  const pool = kat ? WÖRTER[kat] : ALLE;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickHint(w: string): string {
  return HILFSWÖRTER[w] ?? "???";
}

function getName(names: string[], i: number) {
  return names[i]?.trim() || `Spieler ${i + 1}`;
}

type Phase = "setup" | "passing" | "playing" | "result";

export default function ImposterPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(10).fill(""));
  const [kategorie, setKategorie] = useState<string | null>(null);
  const [word, setWord] = useState(() => pickWord(null));
  const [imposterIndices, setImposterIndices] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hintWord, setHintWord] = useState("");
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));
  const [roundNumber, setRoundNumber] = useState(0);
  const [twoImposters, setTwoImposters] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      playCountdownEnd();
      setCountdown(null);
      return;
    }
    playTick();
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const isCurrentImposter = imposterIndices.includes(currentPlayer);
  const votedCorrectly = votedFor !== null && imposterIndices.includes(votedFor);

  function kategorieWählen(k: string | null) {
    setKategorie(k);
    setWord(pickWord(k));
  }

  function updateName(i: number, value: string) {
    setPlayerNames((prev) => { const n = [...prev]; n[i] = value; return n; });
  }

  function spielStarten() {
    const count = twoImposters ? 2 : 1;
    const pool = Array.from({ length: playerCount }, (_, i) => i);
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * pool.length);
      indices.push(...pool.splice(r, 1));
    }
    setImposterIndices(indices);
    setCurrentPlayer(0);
    setShowRole(false);
    setAcknowledged(false);
    setVotedFor(null);
    setHintWord(pickHint(word));
    setRoundNumber((r) => r + 1);
    setCountdown(5);
    setPhase("passing");
  }

  function verstanden() {
    setShowRole(false);
    setAcknowledged(true);
  }

  function nächsterSpieler() {
    if (currentPlayer + 1 >= playerCount) {
      setPhase("playing");
    } else {
      setCurrentPlayer((p) => p + 1);
      setShowRole(false);
      setAcknowledged(false);
    }
  }

  function auflösung() {
    const correct = votedFor !== null && imposterIndices.includes(votedFor);
    const newScores = [...scores];
    if (correct) {
      for (let i = 0; i < playerCount; i++) {
        if (!imposterIndices.includes(i)) newScores[i]++;
      }
    } else {
      for (const idx of imposterIndices) newScores[idx]++;
    }
    setScores(newScores);
    correct ? playWin() : playLose();
    setPhase("result");
  }

  function neueRunde() {
    setWord(pickWord(kategorie));
    setVotedFor(null);
    setImposterIndices([]);
    setCurrentPlayer(0);
    setShowRole(false);
    setAcknowledged(false);
    setPhase("setup");
  }

  function punkteZurücksetzen() {
    setScores(Array(10).fill(0));
    setRoundNumber(0);
    neueRunde();
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    const maxScore = Math.max(...scores.slice(0, playerCount), 1);
    return (
      <GameLayout
        title="Imposter"
        titleIcon={<UserX className="h-4 w-4 text-red-400" />}
        glowColor="rgba(239,68,68,0.10)"
      >
        <div className="flex flex-col gap-5 pb-2">

          {/* Scoreboard – nach mind. 1 Runde */}
          {roundNumber > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-amber-950/20 backdrop-blur-xl p-5">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-500" />
              <p className="mb-3 flex items-center gap-2 text-[18px] font-black uppercase tracking-widest text-amber-400">
                <Trophy className="h-4 w-4" /> Punkte nach Runde {roundNumber}
              </p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: playerCount }, (_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-24 truncate text-[18px] font-bold text-zinc-300">{getName(playerNames, i)}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${(scores[i] / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[18px] font-black text-amber-400">{scores[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spieleranzahl + Imposter-Anzahl */}
          <div className="rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] p-5">
            <p className="mb-4 text-[18px] font-black uppercase tracking-widest text-zinc-400">Spieleranzahl</p>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setPlayerCount((p) => Math.max(3, p - 1))}
                className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 transition-all active:scale-[0.97]"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-5xl font-black text-white">{playerCount}</span>
              <button
                onClick={() => setPlayerCount((p) => Math.min(10, p + 1))}
                className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 transition-all active:scale-[0.97]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Imposter-Anzahl Toggle – als klickbare Zeile mit ausreichend Touch-Target */}
            <button
              onClick={() => setTwoImposters((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-[14px] transition-all active:scale-[0.97]"
            >
              <div className="text-left">
                <p className="text-[18px] font-black text-zinc-300">2 Imposter</p>
                <p className="text-[18px] font-semibold text-zinc-400">Mehr Chaos, mehr Spaß</p>
              </div>
              <div
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  twoImposters ? "bg-red-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    twoImposters ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Spielernamen */}
          <div className="rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] p-5">
            <p className="mb-4 text-[18px] font-black uppercase tracking-widest text-zinc-400">Spielernamen</p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: playerCount }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[18px] font-black text-zinc-400">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={playerNames[i]}
                    onChange={(e) => updateName(i, e.target.value)}
                    placeholder={`Spieler ${i + 1}`}
                    maxLength={15}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-[18px] font-bold text-white placeholder-zinc-500 outline-none focus:border-red-500/40 focus:bg-white/[0.08]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kategorie */}
          <div>
            <p className="mb-3 text-[18px] font-black uppercase tracking-widest text-zinc-400">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => kategorieWählen(null)}
                className={`rounded-full px-4 py-[14px] text-[18px] font-black transition-all active:scale-[0.97] ${
                  !kategorie
                    ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "border border-white/10 bg-white/[0.05] text-zinc-400"
                }`}
              >
                Alle
              </button>
              {Object.keys(WÖRTER).map((k) => (
                <button
                  key={k}
                  onClick={() => kategorieWählen(k)}
                  className={`rounded-full px-4 py-[14px] text-[18px] font-black transition-all active:scale-[0.97] ${
                    kategorie === k
                      ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      : "border border-white/10 bg-white/[0.05] text-zinc-400"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Wort-Vorschau */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            <p className="mb-2 text-[18px] font-black uppercase tracking-widest text-zinc-400">Geheimes Wort</p>
            <p className="text-4xl font-black text-white">{word}</p>
            <button
              onClick={() => setWord(pickWord(kategorie))}
              className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-[14px] text-[18px] font-black text-zinc-400 transition-all active:scale-[0.97]"
            >
              <Shuffle className="h-4 w-4" /> Anderes Wort
            </button>
          </div>

          {/* Start */}
          <button
            onClick={spielStarten}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.97]"
          >
            <UserX className="h-5 w-5" />
            {roundNumber > 0 ? "Runde starten" : "Spiel starten"}
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── PASSING ────────────────────────────────────────────────────────────────
  if (phase === "passing") {
    if (countdown !== null) {
      return (
        <GameLayout
          title="Imposter"
          titleIcon={<UserX className="h-4 w-4 text-red-400" />}
          glowColor="rgba(239,68,68,0.10)"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-2">
            <p className="text-[18px] font-black uppercase tracking-widest text-zinc-400">
              Runde {roundNumber} startet in
            </p>
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-red-500/30 bg-red-950/40">
              <span className="text-9xl font-black text-white">{countdown}</span>
            </div>
            <p className="text-lg font-black text-zinc-400">Macht euch bereit!</p>
          </div>
        </GameLayout>
      );
    }

    return (
      <GameLayout
        title="Imposter"
        titleIcon={<UserX className="h-4 w-4 text-red-400" />}
        glowColor="rgba(239,68,68,0.10)"
        counter={`${currentPlayer + 1}/${playerCount}`}
      >
        <div className="flex flex-1 flex-col items-center gap-6 pb-2">
          <div className="text-center">
            <p className="text-lg font-black text-zinc-300">
              {getName(playerNames, currentPlayer)} ist dran
            </p>
            <p className="mt-1 text-[18px] font-semibold text-zinc-400">
              Halte das Display verdeckt – nur du schaust!
            </p>
          </div>

          <div className="w-full max-w-sm">
            {!showRole && !acknowledged && (
              <button
                onClick={() => setShowRole(true)}
                className="relative w-full overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center gap-5 transition-all active:scale-[0.97]"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10">
                  <EyeOff className="h-12 w-12 text-red-400" />
                </div>
                <p className="text-xl font-black text-zinc-400">Tippe zum Anzeigen</p>
              </button>
            )}

            {showRole && (
              <div
                className={`relative w-full overflow-hidden rounded-3xl border backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 flex flex-col items-center gap-4 ${
                  isCurrentImposter
                    ? "border-red-500/50 bg-red-950/50"
                    : "border-emerald-500/50 bg-emerald-950/30"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${
                    isCurrentImposter ? "from-red-500 to-orange-500" : "from-emerald-500 to-green-400"
                  }`}
                />
                {isCurrentImposter ? (
                  <>
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10">
                      <span className="text-5xl">🕵️</span>
                    </div>
                    <p className="text-2xl font-black text-red-400">Du bist der</p>
                    <p className="text-5xl font-black text-red-300">IMPOSTER!</p>
                    <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-center">
                      <p className="text-[18px] font-black uppercase tracking-widest text-red-400 mb-1">
                        Dein Hilfswort
                      </p>
                      <p className="text-2xl font-black text-red-200">{hintWord}</p>
                    </div>
                    <p className="text-center text-[18px] font-bold text-red-400">
                      Nutze dein Hilfswort – aber nenn das echte Wort nicht!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10">
                      <Eye className="h-12 w-12 text-emerald-400" />
                    </div>
                    <p className="text-[18px] font-black uppercase tracking-widest text-zinc-400">
                      Das geheime Wort ist
                    </p>
                    <p className="text-5xl font-black text-white">{word}</p>
                    <p className="text-center text-[18px] font-bold text-emerald-400">
                      Finde den Imposter! Nenn das Wort nicht direkt.
                    </p>
                  </>
                )}
                <button
                  onClick={verstanden}
                  className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-[14px] text-[18px] font-black text-zinc-400 transition-all active:scale-[0.97]"
                >
                  <EyeOff className="h-4 w-4" /> Verstanden &amp; Verbergen
                </button>
              </div>
            )}

            {acknowledged && !showRole && (
              <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] p-10 flex flex-col items-center gap-5">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-zinc-600 to-zinc-500" />
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
                  <EyeOff className="h-12 w-12 text-zinc-400" />
                </div>
                <p className="text-xl font-black text-zinc-400">Verdeckt</p>
              </div>
            )}
          </div>

          {acknowledged && (
            <button
              onClick={nächsterSpieler}
              className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 text-lg font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.97]"
            >
              {currentPlayer + 1 >= playerCount
                ? "Los geht's!"
                : getName(playerNames, currentPlayer + 1)}
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </GameLayout>
    );
  }

  // ── PLAYING / VOTING ────────────────────────────────────────────────────────
  if (phase === "playing") {
    return (
      <GameLayout
        title="Imposter"
        titleIcon={<UserX className="h-4 w-4 text-red-400" />}
        glowColor="rgba(239,68,68,0.10)"
      >
        <div className="flex flex-1 flex-col gap-5 pb-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            <p className="text-2xl font-black text-white mb-2">
              🕵️ Findet {twoImposters ? "die Imposter!" : "den Imposter!"}
            </p>
            <p className="text-[18px] font-semibold text-zinc-400">
              Redet abwechselnd über das Wort, ohne es direkt zu nennen. Wer klingt verdächtig?
            </p>
          </div>

          <div>
            <p className="mb-3 text-[18px] font-black uppercase tracking-widest text-zinc-400">
              Wen verdächtigt ihr?
            </p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: playerCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setVotedFor(votedFor === i ? null : i)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.97] ${
                    votedFor === i
                      ? "border-red-500/60 bg-red-950/40"
                      : "border-white/[0.12] bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-[18px] font-black ${
                      votedFor === i ? "bg-red-500 text-white" : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-[18px] font-black ${votedFor === i ? "text-white" : "text-zinc-300"}`}>
                    {getName(playerNames, i)}
                  </span>
                  {votedFor === i && <span className="ml-auto text-red-400">🎯</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={auflösung}
            disabled={votedFor === null}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.97] disabled:opacity-40"
          >
            Auflösung!
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  const imposterNames = imposterIndices.map((idx) => getName(playerNames, idx));
  const mehrere = imposterIndices.length > 1;
  const maxScore = Math.max(...scores.slice(0, playerCount), 1);

  return (
    <GameLayout
      title="Imposter"
      titleIcon={<UserX className="h-4 w-4 text-red-400" />}
      glowColor="rgba(239,68,68,0.10)"
    >
      <div className="flex flex-1 flex-col items-center gap-5 pb-2">
        {/* Ergebnis */}
        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-3xl border backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center ${
            votedCorrectly ? "border-emerald-500/50 bg-emerald-950/30" : "border-red-500/50 bg-red-950/30"
          }`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${
              votedCorrectly ? "from-emerald-500 to-green-400" : "from-red-500 to-orange-500"
            }`}
          />
          <div className="text-6xl mb-4">{votedCorrectly ? "🎉" : "💀"}</div>

          {votedCorrectly ? (
            <>
              <p className="text-3xl font-black text-emerald-300 mb-2">Richtig!</p>
              <p className="text-[18px] font-bold text-zinc-400">
                {getName(playerNames, votedFor!)} war {mehrere ? "ein" : "der"} Imposter – muss trinken!
              </p>
              {mehrere && (
                <p className="mt-1 text-[18px] text-zinc-400">
                  Auch dabei: {imposterIndices.filter((i) => i !== votedFor).map((i) => getName(playerNames, i)).join(", ")}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-3xl font-black text-red-300 mb-2">Falsch!</p>
              <p className="text-[18px] font-bold text-zinc-400">
                {imposterNames.join(" & ")} {mehrere ? "waren die echten Imposter" : "war der echte Imposter"} – alle anderen trinken!
              </p>
            </>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-[18px] font-black uppercase tracking-widest text-zinc-400 mb-1">Das Wort war</p>
            <p className="text-4xl font-black text-white">{word}</p>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/20 bg-amber-950/20 backdrop-blur-xl p-5">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-500" />
          <p className="mb-3 flex items-center gap-2 text-[18px] font-black uppercase tracking-widest text-amber-400">
            <Trophy className="h-4 w-4" /> Punkte nach Runde {roundNumber}
          </p>
          <div className="flex flex-col gap-2">
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 truncate text-[18px] font-bold text-zinc-300">{getName(playerNames, i)}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${(scores[i] / maxScore) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[18px] font-black text-amber-400">{scores[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={neueRunde}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.97]"
          >
            <ChevronRight className="h-5 w-5" />
            Neue Runde
          </button>
          <button
            onClick={punkteZurücksetzen}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.05] py-4 text-[18px] font-black text-zinc-400 transition-all active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Punkte zurücksetzen
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
