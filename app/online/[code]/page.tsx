"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCw, Users, Copy, Check, Crown, AlertCircle,
  Loader2, LogOut, Beer, Scale, Hand, ChevronLeft,
  HelpCircle, Flame, Globe, Eye, Zap, Users2, Radio, UserX,
} from "lucide-react";
import { SkipForward } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Room } from "@/lib/supabase";
import { playTick, playCountdownEnd, playWin, playLose, playReveal } from "@/lib/sounds";

type PlayerInfo = { name: string; isHost: boolean; joinedAt: number };
type GameId = "allgemein" | "wahrheit-oder-pflicht" | "ich-hab-noch-nie" | "wer-wuerde-eher" | "imposter";

const IMPOSTER_WÖRTER = [
  "Hund", "Katze", "Elefant", "Pinguin", "Giraffe", "Delfin", "Tiger", "Flamingo", "Panda", "Wolf",
  "Pizza", "Sushi", "Burger", "Schokolade", "Avocado", "Pommes", "Steak", "Donut", "Tacos", "Ramen",
  "Paris", "New York", "Tokio", "Sydney", "Dubai", "Barcelona", "London", "Berlin", "Hawaii", "Ibiza",
  "Star Wars", "Titanic", "Avatar", "Friends", "Breaking Bad", "Harry Potter", "Matrix", "Joker", "Squid Game",
  "Fußball", "Tennis", "Boxen", "Surfen", "Basketball", "Golf", "Ski", "Volleyball",
  "Bier", "Gin Tonic", "Margarita", "Cocktail", "Shots", "Tequila", "Prosit", "Bierpong",
];

const IMPOSTER_HILFSWÖRTER: Record<string, string> = {
  "Hund": "Leine", "Katze": "Fell", "Elefant": "Grau", "Pinguin": "Frack",
  "Giraffe": "Hals", "Delfin": "Springen", "Tiger": "Streifen",
  "Flamingo": "Rosa", "Panda": "Schwarz-Weiß", "Wolf": "Heulen",
  "Pizza": "Tomaten", "Sushi": "Stäbchen", "Burger": "Brötchen",
  "Schokolade": "Kakao", "Avocado": "Kernig", "Pommes": "Salz",
  "Steak": "Grill", "Donut": "Loch", "Tacos": "Mexiko", "Ramen": "Suppe",
  "Paris": "Frankreich", "New York": "Wolkenkratzer", "Tokio": "Japan",
  "Sydney": "Australien", "Dubai": "Wüste", "Barcelona": "Spanien",
  "London": "Regen", "Berlin": "Hauptstadt", "Hawaii": "Vulkan", "Ibiza": "Feiern",
  "Star Wars": "Raumschiff", "Titanic": "Eisberg", "Avatar": "Blau",
  "Friends": "Sofa", "Breaking Bad": "Chemie", "Harry Potter": "Magie",
  "Matrix": "Simulation", "Joker": "Clown", "Squid Game": "Spiele",
  "Fußball": "Tor", "Tennis": "Schläger", "Boxen": "Ring",
  "Surfen": "Welle", "Basketball": "Korb", "Golf": "Fairway",
  "Ski": "Schnee", "Volleyball": "Netz",
  "Bier": "Hopfen", "Gin Tonic": "Gurke", "Margarita": "Salz",
  "Cocktail": "Shaker", "Shots": "Schnell", "Tequila": "Limette",
  "Prosit": "Anstoßen", "Bierpong": "Becher",
};

const SPIELE: { id: GameId; label: string; desc: string; Icon: React.ElementType; iconGradient: string; cardGradient: string; border: string }[] = [
  { id: "allgemein",             label: "Freie Runde",          desc: "Alle Karten gemischt",         Icon: Beer,   iconGradient: "from-amber-400 to-orange-500",  cardGradient: "from-amber-900/40 to-orange-950/30",  border: "border-amber-500/20" },
  { id: "wahrheit-oder-pflicht", label: "Wahrheit oder Pflicht", desc: "Truth or Dare",               Icon: Eye,    iconGradient: "from-violet-500 to-purple-700", cardGradient: "from-purple-900/50 to-purple-950/30", border: "border-purple-500/20" },
  { id: "ich-hab-noch-nie",      label: "Ich hab noch nie",     desc: "Never Have I Ever",            Icon: Zap,    iconGradient: "from-sky-400 to-blue-600",     cardGradient: "from-sky-900/50 to-blue-950/30",      border: "border-sky-500/20" },
  { id: "wer-wuerde-eher",       label: "Am ehesten würde...",  desc: "Most Likely To",               Icon: Users2, iconGradient: "from-green-400 to-emerald-600", cardGradient: "from-green-900/50 to-emerald-950/30", border: "border-green-500/20" },
  { id: "imposter",              label: "Imposter",             desc: "Wer ist der Verräter?",        Icon: UserX,  iconGradient: "from-red-500 to-orange-600",    cardGradient: "from-red-900/50 to-red-950/30",       border: "border-red-500/20" },
];

function getUserId() {
  if (typeof window === "undefined") return "ssr";
  const key = "trinkspiel_userId";
  const s = sessionStorage.getItem(key);
  if (s) return s;
  const f = crypto.randomUUID();
  sessionStorage.setItem(key, f);
  return f;
}

function getPlayers(state: Record<string, PlayerInfo[]>): PlayerInfo[] {
  return Object.values(state).flat().sort((a, b) => a.joinedAt - b.joinedAt);
}

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const upperCode = code.toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentCardText, setCurrentCardText] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<Record<string, string>>({});
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [imposterPickerOpen, setImposterPickerOpen] = useState(false);
  const onlineImposterCountRef = useRef<1 | 2>(1);

  const currentCardIdRef = useRef<number | null>(null);
  const currentCardTextRef = useRef<string | null>(null);
  const playersRef = useRef<PlayerInfo[]>([]);
  const prevImposterWordRef = useRef<string | undefined>(undefined);
  const lastSelectedPlayerRef = useRef<string>("");

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { currentCardTextRef.current = currentCardText; }, [currentCardText]);

  // Countdown wenn neue Imposter-Runde startet
  useEffect(() => {
    if (currentGame !== "imposter") { prevImposterWordRef.current = undefined; return; }
    if (prevImposterWordRef.current === undefined) {
      prevImposterWordRef.current = currentMeta.word;
      return;
    }
    if (currentMeta.word && currentMeta.word !== prevImposterWordRef.current) {
      prevImposterWordRef.current = currentMeta.word;
      setCountdown(5);
    }
  }, [currentMeta.word, currentGame]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { playCountdownEnd(); setCountdown(null); return; }
    playTick();
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    async function loadRoom() {
      const { data, error } = await supabase.from("rooms").select("*").eq("id", upperCode).single();
      if (error || !data) { setFehler("Raum nicht gefunden."); setPageLoading(false); return; }
      const r = data as Room;
      // Auto-Cleanup: Räume älter als 24h löschen
      if (Date.now() - new Date(r.created_at).getTime() > 24 * 60 * 60 * 1000) {
        await supabase.from("rooms").delete().eq("id", upperCode);
        setFehler("Dieser Raum ist abgelaufen. Bitte erstelle einen neuen Raum.");
        setPageLoading(false);
        return;
      }
      setRoom(r); setCurrentCardText(r.current_card_text); setCurrentGame(r.current_game);
      setCurrentMeta(r.current_meta ?? {}); currentCardIdRef.current = r.current_card_id;
      const storedHostId = localStorage.getItem(`trinkspiel_host_${upperCode}`);
      setIsHost(!!storedHostId && storedHostId === r.host_id);
      setPageLoading(false);
    }
    loadRoom();
  }, [upperCode]);

  useEffect(() => {
    const userId = getUserId();
    const playerName = sessionStorage.getItem("trinkspiel_name") || "Anonym";
    const storedHostId = localStorage.getItem(`trinkspiel_host_${upperCode}`);
    const channel = supabase.channel(`room-${upperCode}`, { config: { presence: { key: userId } } });
    channel
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${upperCode}` }, (payload) => {
        const u = payload.new as Room;
        setCurrentCardText(u.current_card_text); setCurrentGame(u.current_game);
        setCurrentMeta(u.current_meta ?? {}); currentCardIdRef.current = u.current_card_id;
      })
      .on("presence", { event: "sync" }, () => {
        setPlayers(getPlayers(channel.presenceState() as Record<string, PlayerInfo[]>));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ name: playerName, isHost: !!storedHostId, joinedAt: Date.now() });
      });
    return () => { supabase.removeChannel(channel); };
  }, [upperCode]);

  // Sound bei Imposter-Auflösung
  const prevRevealedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (currentGame !== "imposter") { prevRevealedRef.current = undefined; return; }
    if (prevRevealedRef.current === "false" && currentMeta.revealed === "true") {
      const myN = typeof window !== "undefined" ? sessionStorage.getItem("trinkspiel_name") || "Anonym" : "Anonym";
      currentMeta.imposterName === myN ? playReveal() : playWin();
    }
    prevRevealedRef.current = currentMeta.revealed;
  }, [currentMeta.revealed, currentMeta.imposterName, currentGame]);

  const karteZiehen = useCallback(async (typ?: "wahrheit" | "pflicht") => {
    setIsLoading(true);
    let cardText: string | null = null, cardId: number | null = null, meta: Record<string, string> = {};
    if (currentGame === "imposter") {
      const w = IMPOSTER_WÖRTER[Math.floor(Math.random() * IMPOSTER_WÖRTER.length)];
      const pl = [...playersRef.current].sort(() => Math.random() - 0.5);
      const count = onlineImposterCountRef.current;
      const hint = IMPOSTER_HILFSWÖRTER[w] ?? "???";
      meta = {
        word: w,
        imposterName: pl[0]?.name ?? "",
        imposterName2: count >= 2 ? (pl[1]?.name ?? "") : "",
        revealed: "false",
        hintWord: hint,
        imposterCount: String(count),
      };
      cardText = "🕵️";
    } else if (currentGame === "ich-hab-noch-nie") {
      const { data } = await supabase.from("ich_hab_noch_nie").select("id, text").neq("text", currentCardTextRef.current?.replace("Ich hab noch nie... ", "") ?? "").limit(10);
      if (data?.length) { const c = data[Math.floor(Math.random() * data.length)]; cardText = `Ich hab noch nie... ${c.text}`; }
    } else {
      let q = supabase.from("aufgaben").select("id, text, typ").neq("id", currentCardIdRef.current ?? 0).limit(15);
      if (currentGame === "wahrheit-oder-pflicht" && typ) { q = q.eq("typ", typ); meta = { typ }; }
      else if (currentGame === "wer-wuerde-eher") {
        q = q.eq("typ", "wer_wuerde_eher");
        const all = playersRef.current;
        if (all.length >= 2) { const s = [...all].sort(() => Math.random() - 0.5); meta = { player1: s[0].name, player2: s[1].name }; }
      } else { q = q.neq("typ", "buzzer"); }
      const { data } = await q;
      if (data?.length) { const c = data[Math.floor(Math.random() * data.length)]; cardText = c.text; cardId = c.id; currentCardIdRef.current = c.id; }
    }
    // Zufälligen Spieler auswählen (kein Doppelpick hintereinander)
    if (currentGame !== "imposter" && currentGame !== "wer-wuerde-eher") {
      const pl = playersRef.current;
      if (pl.length >= 1) {
        const last = lastSelectedPlayerRef.current;
        const others = pl.filter((p) => p.name !== last);
        const pool = others.length > 0 ? others : pl;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        lastSelectedPlayerRef.current = chosen.name;
        meta = { ...meta, selectedPlayer: chosen.name };
      }
    }
    if (cardText) {
      await supabase.from("rooms").update({ current_card_id: cardId, current_card_text: cardText, current_meta: meta }).eq("id", upperCode);
      setCurrentCardText(cardText); setCurrentMeta(meta);
    }
    setIsLoading(false);
  }, [currentGame, upperCode]);

  const imposterAuflösung = useCallback(async () => {
    const newMeta = { ...currentMeta, revealed: "true" };
    await supabase.from("rooms").update({ current_meta: newMeta }).eq("id", upperCode);
    setCurrentMeta(newMeta);
  }, [currentMeta, upperCode]);

  async function spielWählen(gameId: GameId) {
    lastSelectedPlayerRef.current = "";
    await supabase.from("rooms").update({ current_game: gameId, current_card_text: null, current_card_id: null, current_meta: {} }).eq("id", upperCode);
    setCurrentGame(gameId); setCurrentCardText(null); setCurrentMeta({}); currentCardIdRef.current = null;
  }

  async function zurückZurLobby() {
    await supabase.from("rooms").update({ current_game: null, current_card_text: null, current_card_id: null, current_meta: {} }).eq("id", upperCode);
    setCurrentGame(null); setCurrentCardText(null);
  }

  async function verlassen() {
    if (isHost) { await supabase.from("rooms").delete().eq("id", upperCode); localStorage.removeItem(`trinkspiel_host_${upperCode}`); }
    router.push("/online");
  }

  async function kopieren() {
    await navigator.clipboard.writeText(upperCode);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (pageLoading) return (
    <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-4 w-4 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex flex-1 items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-zinc-600" /></div>
    </GameLayout>
  );

  if (fehler || !room) return (
    <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-4 w-4 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm font-bold text-red-300">{fehler}</p>
      </div>
    </GameLayout>
  );

  const aktivesSpiel = SPIELE.find((s) => s.id === currentGame);

  const RoomHeader = (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2">
          <span className="text-xl font-black tracking-widest text-white">{upperCode}</span>
        </div>
        <button onClick={kopieren} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition-colors active:bg-white/10">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
          <Users className="h-4 w-4 text-zinc-400" /><span className="text-sm font-black text-zinc-300">{players.length}</span>
        </div>
        <button onClick={verlassen} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] transition-colors hover:bg-red-950 hover:border-red-800">
          <LogOut className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (!currentGame) return (
    <>
    <GameLayout title="Lobby" titleIcon={<Globe className="h-4 w-4 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex flex-col gap-5">
        {RoomHeader}
        <div className="rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_4px_20px_rgba(0,0,0,0.3)] p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Verbundene Spieler</p>
          <div className="flex flex-col gap-2">
            {players.length === 0 ? <p className="text-sm font-semibold text-zinc-600 py-2">Warte auf Spieler...</p>
              : players.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">{p.name[0]?.toUpperCase()}</div>
                  <span className="flex-1 font-bold text-white">{p.name}</span>
                  {p.isHost && <div className="flex items-center gap-1 rounded-full bg-amber-950/60 px-2 py-0.5"><Crown className="h-3 w-3 text-amber-400" /><span className="text-xs font-black text-amber-400">Host</span></div>}
                </div>
              ))}
          </div>
        </div>
        {isHost ? (
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Spiel auswählen</p>
            <div className="grid grid-cols-2 gap-3">
              {SPIELE.map(({ id, label, desc, Icon, iconGradient, cardGradient, border }) => (
                <button
                  key={id}
                  onClick={() => id === "imposter" ? setImposterPickerOpen(true) : spielWählen(id)}
                  className={`group flex min-h-[150px] flex-col rounded-3xl border p-4 text-left bg-gradient-to-br ${cardGradient} ${border} backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200 active:scale-95`}
                >
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-black text-white leading-snug">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-10">
            <Crown className="h-8 w-8 text-zinc-600" />
            <p className="font-black text-zinc-500">Warte auf den Host...</p>
          </div>
        )}
      </div>
    </GameLayout>

    {/* Imposter-Picker */}
    {imposterPickerOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-t-3xl border-t border-white/10 bg-zinc-950 p-6 pb-10">
          <div className="mb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>
          <p className="mb-6 mt-4 text-center text-xl font-black text-white">Wie viele Imposter?</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onlineImposterCountRef.current = 1; setImposterPickerOpen(false); spielWählen("imposter"); }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-left transition-all active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-2xl">🕵️</div>
              <div>
                <p className="font-black text-white">1 Imposter</p>
                <p className="text-sm text-zinc-500">Klassisch</p>
              </div>
            </button>
            <button
              onClick={() => { onlineImposterCountRef.current = 2; setImposterPickerOpen(false); spielWählen("imposter"); }}
              className="flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-left transition-all active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-2xl">🕵️🕵️</div>
              <div>
                <p className="font-black text-white">2 Imposter</p>
                <p className="text-sm text-zinc-500">Mehr Chaos</p>
              </div>
            </button>
            <button
              onClick={() => setImposterPickerOpen(false)}
              className="mt-1 rounded-2xl border border-white/10 bg-white/[0.05] py-3 font-black text-zinc-500 transition-all active:scale-95"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );

  // ── Spiel ─────────────────────────────────────────────────────────────────
  const gradientMap: Record<string, string> = {
    "allgemein": "from-amber-400 to-orange-500",
    "wahrheit-oder-pflicht": "from-violet-600 to-pink-500",
    "ich-hab-noch-nie": "from-sky-500 to-cyan-400",
    "wer-wuerde-eher": "from-emerald-500 to-green-400",
    "imposter": "from-red-500 to-orange-500",
  };
  const cardGradient = gradientMap[currentGame] ?? "from-violet-600 to-pink-500";

  // Imposter: personalized role display
  const myName = typeof window !== "undefined" ? sessionStorage.getItem("trinkspiel_name") || "Anonym" : "Anonym";
  const isImposter = currentGame === "imposter" && (currentMeta.imposterName === myName || (!!currentMeta.imposterName2 && currentMeta.imposterName2 === myName));
  const imposterRevealed = currentMeta.revealed === "true";
  const twoImpostersOnline = currentMeta.imposterCount === "2";

  return (
    <GameLayout title={aktivesSpiel?.label ?? "Spiel"} titleIcon={aktivesSpiel ? <aktivesSpiel.Icon className="h-4 w-4 text-zinc-300" /> : undefined} glowColor="rgba(124,58,237,0.10)">
      <div className="flex flex-1 flex-col justify-between">
        {RoomHeader}
        {isHost && (
          <button onClick={zurückZurLobby} className="mb-4 flex items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-black text-zinc-400 transition-colors hover:bg-white/10">
            <ChevronLeft className="h-3.5 w-3.5" /> Spiel wechseln
          </button>
        )}
        <div className="flex flex-1 items-center justify-center py-4">
          {/* Imposter: personalized role card */}
          {currentGame === "imposter" ? (
            <div className="w-full max-w-sm">
              {countdown !== null ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">
                    Neue Runde startet in
                  </p>
                  <div className="flex h-40 w-40 mx-auto items-center justify-center rounded-full border border-red-500/30 bg-red-950/40 mb-6">
                    <span className="text-8xl font-black text-white">{countdown}</span>
                  </div>
                  <p className="text-base font-black text-zinc-400">Macht euch bereit!</p>
                </div>
              ) : !currentMeta.word ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                  <div className="py-4">
                    {isHost
                      ? <p className="font-black text-zinc-500">Starte die erste Runde!</p>
                      : <p className="font-black text-zinc-500">Warte auf den Host...</p>}
                  </div>
                </div>
              ) : imposterRevealed ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Auflösung</p>
                  <p className="text-sm font-bold text-zinc-400 mb-1">Das Wort war</p>
                  <p className="text-4xl font-black text-white mb-4">{currentMeta.word}</p>
                  <p className="text-sm font-bold text-zinc-400 mb-1">{twoImpostersOnline ? "Die Imposter waren" : "Der Imposter war"}</p>
                  <p className="text-2xl font-black text-red-400">
                    {currentMeta.imposterName}{twoImpostersOnline && currentMeta.imposterName2 ? ` & ${currentMeta.imposterName2}` : ""} 🕵️
                  </p>
                </div>
              ) : isImposter ? (
                <div className="relative overflow-hidden rounded-3xl border border-red-500/50 bg-red-950/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                  <div className="text-6xl mb-4">🕵️</div>
                  <p className="text-2xl font-black text-red-400 mb-1">Du bist {twoImpostersOnline ? "ein" : "der"}</p>
                  <p className="text-5xl font-black text-red-300">IMPOSTER!</p>
                  {currentMeta.hintWord && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3">
                      <p className="text-xs font-black uppercase tracking-widest text-red-500/60 mb-1">
                        Dein Hilfswort
                      </p>
                      <p className="text-2xl font-black text-red-200">{currentMeta.hintWord}</p>
                    </div>
                  )}
                  <p className="mt-4 text-sm font-bold text-red-400/70">
                    Nutze dein Hilfswort – aber nenn das echte Wort nicht!
                  </p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/50 bg-emerald-950/30 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-green-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Das Wort ist</p>
                  <p className="text-5xl font-black text-white mb-4">{currentMeta.word}</p>
                  <p className="text-sm font-bold text-emerald-400/70">
                    Finde den Imposter! Nenn das Wort nicht direkt.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.18] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_40px_rgba(0,0,0,0.5)]">
              <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${cardGradient}`} />
              <div className="p-6 pb-8 pt-7">
                {/* Wer würde eher: VS-Anzeige oben in der Karte */}
                {currentGame === "wer-wuerde-eher" && currentMeta.player1 && (
                  <div className="mb-5 text-center">
                    <p className="text-2xl font-black text-white leading-tight">
                      {currentMeta.player1}{" "}
                      <span className="text-lg text-zinc-500">vs</span>{" "}
                      {currentMeta.player2}
                    </p>
                  </div>
                )}

                {/* Zufällig ausgewählter Spieler für alle anderen Spiele */}
                {currentMeta.selectedPlayer && currentGame !== "wer-wuerde-eher" && (
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/30 text-xs font-black text-amber-300">
                        {currentMeta.selectedPlayer[0]?.toUpperCase()}
                      </div>
                      <span className="font-black text-white text-sm">{currentMeta.selectedPlayer}</span>
                      <span className="text-amber-400 text-xs font-black">ist dran!</span>
                    </div>
                  </div>
                )}

                {currentGame === "wahrheit-oder-pflicht" && currentMeta.typ && (
                  <span className={`mb-4 inline-block rounded-xl px-3 py-1 text-xs font-black uppercase tracking-widest ${currentMeta.typ === "wahrheit" ? "bg-violet-800/60 text-violet-200" : "bg-pink-900/60 text-pink-200"}`}>
                    {currentMeta.typ}
                  </span>
                )}
                {currentCardText ? (
                  <p className="mt-4 text-center text-xl font-black text-white leading-snug">{currentCardText}</p>
                ) : (
                  <div className="py-8 text-center">
                    {isHost ? <p className="font-black text-zinc-500">Zieh die erste Karte!</p>
                      : <p className="font-black text-zinc-500">Warte auf den Host...</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 pb-2">
          {isHost ? (
            currentGame === "imposter" ? (
              <div className="flex flex-col gap-3">
                {currentMeta.word && !imposterRevealed && (
                  <button
                    onClick={imposterAuflösung}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-950/40 py-4 text-base font-black text-red-300 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <UserX className="h-5 w-5" /> Auflösung anzeigen
                  </button>
                )}
                <button
                  onClick={() => karteZiehen()}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-70"
                >
                  <SkipForward className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                  {currentMeta.word ? "Neue Runde" : "Runde starten"}
                </button>
              </div>
            ) : currentGame === "wahrheit-oder-pflicht" ? (
              <div className="flex gap-3">
                <button onClick={() => karteZiehen("wahrheit")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 py-4 text-base font-black text-white shadow-[0_0_16px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-60">
                  <HelpCircle className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} /> Wahrheit
                </button>
                <button onClick={() => karteZiehen("pflicht")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 py-4 text-base font-black text-white shadow-[0_0_16px_rgba(236,72,153,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-60">
                  <Flame className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} /> Pflicht
                </button>
              </div>
            ) : (
              <button onClick={() => karteZiehen()} disabled={isLoading} className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${cardGradient} py-5 text-xl font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-70`}>
                <SkipForward className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                {currentCardText ? "Nächste Karte" : "Erste Karte ziehen"}
              </button>
            )
          ) : (
            <div className="flex w-full items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] py-5">
              <p className="text-sm font-black text-zinc-500">
                {currentGame === "imposter" ? "Schau auf dein Display – nur für dich!" : "Der Host zieht die Karten"}
              </p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
