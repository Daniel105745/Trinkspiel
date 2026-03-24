"use client";

import { useState, useEffect } from "react";
import { UserX, Shuffle, Eye, EyeOff, ChevronRight, RotateCcw, Minus, Plus } from "lucide-react";
import GameLayout from "@/components/GameLayout";

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
  // Tiere
  "Hund": "Leine", "Katze": "Fell", "Elefant": "Grau", "Pinguin": "Frack",
  "Giraffe": "Hals", "Delfin": "Springen", "Tiger": "Streifen",
  "Krokodil": "Sumpf", "Flamingo": "Rosa", "Panda": "Schwarz-Weiß",
  "Löwe": "König", "Affe": "Baum", "Zebra": "Gestreift",
  "Koala": "Australien", "Otter": "Schwimmen", "Papagei": "Bunt",
  "Schildkröte": "Langsam", "Hai": "Flosse", "Wolf": "Heulen", "Fuchs": "Clever",
  // Essen
  "Pizza": "Tomaten", "Sushi": "Stäbchen", "Burger": "Brötchen",
  "Schokolade": "Kakao", "Avocado": "Kernig", "Käse": "Reifen",
  "Pommes": "Salz", "Nudeln": "Mehl", "Steak": "Grill", "Eis": "Kugel",
  "Donut": "Loch", "Tacos": "Mexiko", "Ramen": "Suppe",
  "Croissant": "Butter", "Hot Dog": "Senf", "Popcorn": "Kino",
  "Chips": "Tüte", "Cupcake": "Glasur", "Brezeln": "Salz", "Spaghetti": "Soße",
  // Orte
  "Paris": "Frankreich", "New York": "Wolkenkratzer", "Tokio": "Japan",
  "Sydney": "Australien", "Rom": "Italien", "Dubai": "Wüste",
  "Barcelona": "Spanien", "Malediven": "Insel", "Las Vegas": "Casino",
  "London": "Regen", "Berlin": "Hauptstadt", "Ägypten": "Pyramide",
  "Hawaii": "Vulkan", "Venedig": "Gondel", "Ibiza": "Feiern",
  "Amsterdam": "Kanal", "Prag": "Brücke", "Wien": "Walzer",
  // Film & TV
  "Star Wars": "Raumschiff", "Titanic": "Eisberg", "Avatar": "Blau",
  "Friends": "Sofa", "Breaking Bad": "Chemie", "Harry Potter": "Magie",
  "Game of Thrones": "Drachen", "Avengers": "Superheld", "Joker": "Clown",
  "Matrix": "Simulation", "Inception": "Traum", "Squid Game": "Spiele",
  "Stranger Things": "Kinder", "Der Pate": "Mafia", "Pulp Fiction": "Gangster",
  // Sport
  "Fußball": "Tor", "Tennis": "Schläger", "Boxen": "Ring",
  "Surfen": "Welle", "Skifahren": "Schnee", "Basketball": "Korb",
  "Golf": "Fairway", "Volleyball": "Netz", "Schwimmen": "Bahn",
  "Radfahren": "Pedal", "Kampfsport": "Gürtel", "Formel 1": "Rennstrecke",
  "Rugby": "Oval", "Baseball": "Handschuh",
  // Party
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

type Phase = "setup" | "passing" | "playing" | "result";

export default function ImposterPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerCount, setPlayerCount] = useState(4);
  const [kategorie, setKategorie] = useState<string | null>(null);
  const [word, setWord] = useState(() => pickWord(null));
  const [imposterIndex, setImposterIndex] = useState(-1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hintWord, setHintWord] = useState<string>("");

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setCountdown(null); return; }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function kategorieWählen(k: string | null) {
    setKategorie(k);
    setWord(pickWord(k));
  }

  function spielStarten() {
    setImposterIndex(Math.floor(Math.random() * playerCount));
    setCurrentPlayer(0);
    setShowRole(false);
    setAcknowledged(false);
    setVotedFor(null);
    setHintWord(pickHint(word));
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

  function neuesSpiel() {
    setPhase("setup");
    setVotedFor(null);
    setImposterIndex(-1);
    setCurrentPlayer(0);
    setShowRole(false);
    setAcknowledged(false);
    setWord(pickWord(kategorie));
  }

  const isCurrentImposter = currentPlayer === imposterIndex;
  const votedCorrectly = votedFor === imposterIndex;

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <GameLayout
        title="Imposter"
        titleIcon={<UserX className="h-4 w-4 text-red-400" />}
        glowColor="rgba(239,68,68,0.10)"
      >
        <div className="flex flex-col gap-5 pb-2">
          {/* Spieleranzahl */}
          <div className="rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">
              Spieleranzahl
            </p>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setPlayerCount((p) => Math.max(3, p - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 transition-all active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-5xl font-black text-white">{playerCount}</span>
              <button
                onClick={() => setPlayerCount((p) => Math.min(10, p + 1))}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 transition-all active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Kategorie */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
              Kategorie
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => kategorieWählen(null)}
                className={`rounded-full px-4 py-2 text-sm font-black transition-all active:scale-95 ${
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
                  className={`rounded-full px-4 py-2 text-sm font-black transition-all active:scale-95 ${
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
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">
              Geheimes Wort
            </p>
            <p className="text-4xl font-black text-white">{word}</p>
            <button
              onClick={() => setWord(pickWord(kategorie))}
              className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-black text-zinc-400 transition-all active:scale-95"
            >
              <Shuffle className="h-4 w-4" /> Anderes Wort
            </button>
          </div>

          {/* Start */}
          <button
            onClick={spielStarten}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95"
          >
            <UserX className="h-5 w-5" />
            Spiel starten
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
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Neue Runde startet in
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
              Spieler {currentPlayer + 1} ist dran
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Halte das Display verdeckt – nur du schaust!
            </p>
          </div>

          {/* Role card */}
          <div className="w-full max-w-sm">
            {!showRole && !acknowledged && (
              <button
                onClick={() => setShowRole(true)}
                className="relative w-full overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center gap-5 transition-all active:scale-95"
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
                    isCurrentImposter
                      ? "from-red-500 to-orange-500"
                      : "from-emerald-500 to-green-400"
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
                      <p className="text-xs font-black uppercase tracking-widest text-red-500/60 mb-1">
                        Dein Hilfswort
                      </p>
                      <p className="text-2xl font-black text-red-200">{hintWord}</p>
                    </div>
                    <p className="text-center text-sm font-bold text-red-400/70">
                      Nutze dein Hilfswort – aber nenn das echte Wort nicht!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10">
                      <Eye className="h-12 w-12 text-emerald-400" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      Das geheime Wort ist
                    </p>
                    <p className="text-5xl font-black text-white">{word}</p>
                    <p className="text-center text-sm font-bold text-emerald-400/70">
                      Finde den Imposter! Nenn das Wort nicht direkt.
                    </p>
                  </>
                )}
                <button
                  onClick={verstanden}
                  className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-black text-zinc-400 transition-all active:scale-95"
                >
                  <EyeOff className="h-4 w-4" /> Verstanden &amp; Verbergen
                </button>
              </div>
            )}

            {acknowledged && !showRole && (
              <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] p-10 flex flex-col items-center gap-5">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-zinc-600 to-zinc-500" />
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
                  <EyeOff className="h-12 w-12 text-zinc-600" />
                </div>
                <p className="text-xl font-black text-zinc-500">Verdeckt</p>
              </div>
            )}
          </div>

          {acknowledged && (
            <button
              onClick={nächsterSpieler}
              className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 text-lg font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95"
            >
              {currentPlayer + 1 >= playerCount
                ? "Los geht's!"
                : `Spieler ${currentPlayer + 2}`}
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
          {/* Hinweis */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            <p className="text-2xl font-black text-white mb-2">🕵️ Findet den Imposter!</p>
            <p className="text-sm font-semibold text-zinc-400">
              Redet abwechselnd über das Wort, ohne es direkt zu nennen. Wer klingt verdächtig?
            </p>
          </div>

          {/* Abstimmen */}
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
              Wen verdächtigt ihr?
            </p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: playerCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setVotedFor(votedFor === i ? null : i)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-95 ${
                    votedFor === i
                      ? "border-red-500/60 bg-red-950/40"
                      : "border-white/[0.12] bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                      votedFor === i ? "bg-red-500 text-white" : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`font-black ${votedFor === i ? "text-white" : "text-zinc-300"}`}>
                    Spieler {i + 1}
                  </span>
                  {votedFor === i && <span className="ml-auto text-red-400">🎯</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase("result")}
            disabled={votedFor === null}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-40"
          >
            Auflösung!
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  return (
    <GameLayout
      title="Imposter"
      titleIcon={<UserX className="h-4 w-4 text-red-400" />}
      glowColor="rgba(239,68,68,0.10)"
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-2">
        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-3xl border backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center ${
            votedCorrectly
              ? "border-emerald-500/50 bg-emerald-950/30"
              : "border-red-500/50 bg-red-950/30"
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
              <p className="text-base font-bold text-zinc-400">
                Spieler {imposterIndex + 1} war der Imposter – er muss trinken!
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-black text-red-300 mb-2">Falsch!</p>
              <p className="text-base font-bold text-zinc-400">
                Spieler {imposterIndex + 1} war der echte Imposter – alle anderen trinken!
              </p>
            </>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">
              Das Wort war
            </p>
            <p className="text-4xl font-black text-white">{word}</p>
          </div>
        </div>

        <button
          onClick={neuesSpiel}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          Neues Spiel
        </button>
      </div>
    </GameLayout>
  );
}
