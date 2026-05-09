"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, Copy, Check, Crown, AlertCircle,
  Loader2, LogOut, Beer, ChevronLeft,
  HelpCircle, Flame, Globe, Eye, Zap, Users2, UserX, SkipForward,
} from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Room } from "@/lib/supabase";
import { playTick, playCountdownEnd, playWin, playLose, playReveal } from "@/lib/sounds";
import { WAHRHEIT_18_PLUS, PFLICHT_18_PLUS, ICH_HAB_NOCH_NIE_18_PLUS, WER_WUERDE_EHER_18_PLUS } from "@/lib/fragenData";

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
  const is18PlusRef = useRef(false);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { is18PlusRef.current = currentMeta.mode18Plus === "true"; }, [currentMeta.mode18Plus]);
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
    const mode18Plus = is18PlusRef.current;
    let cardText: string | null = null, cardId: number | null = null, meta: Record<string, string> = {};

    try {
      if (currentGame === "imposter") {
        const w = IMPOSTER_WÖRTER[Math.floor(Math.random() * IMPOSTER_WÖRTER.length)];
        const pl = [...playersRef.current].sort(() => Math.random() - 0.5);
        const count = onlineImposterCountRef.current;
        const hint = IMPOSTER_HILFSWÖRTER[w] ?? "???";
        meta = { word: w, imposterName: pl[0]?.name ?? "", imposterName2: count >= 2 ? (pl[1]?.name ?? "") : "", revealed: "false", hintWord: hint, imposterCount: String(count) };
        cardText = "🕵️";

      } else if (currentGame === "ich-hab-noch-nie") {
        const prevText = currentCardTextRef.current?.replace("Ich hab noch nie... ", "") ?? "";
        const { data } = await supabase.from("ich_hab_noch_nie").select("id, text").neq("text", prevText).limit(15);
        const supaTexts = data?.map((c) => c.text) ?? [];
        const pool = mode18Plus ? [...supaTexts, ...ICH_HAB_NOCH_NIE_18_PLUS.filter((t) => t !== prevText)] : supaTexts;
        if (pool.length) { cardText = `Ich hab noch nie... ${pool[Math.floor(Math.random() * pool.length)]}`; }

      } else {
        let q = supabase.from("aufgaben").select("id, text, typ").neq("id", currentCardIdRef.current ?? 0).limit(15);
        if (currentGame === "wahrheit-oder-pflicht" && typ) { q = q.eq("typ", typ); meta = { typ }; }
        else if (currentGame === "wer-wuerde-eher") {
          q = q.eq("typ", "wer_wuerde_eher");
          const all = playersRef.current;
          if (all.length >= 2) { const s = [...all].sort(() => Math.random() - 0.5); meta = { player1: s[0].name, player2: s[1].name }; }
        } else { q = q.neq("typ", "buzzer"); }

        const { data } = await q;
        const supaItems = data ?? [];

        // Lokale 18+-Texte dazumischen
        let localTexts: string[] = [];
        if (mode18Plus) {
          if (currentGame === "wahrheit-oder-pflicht" && typ === "wahrheit") localTexts = WAHRHEIT_18_PLUS;
          else if (currentGame === "wahrheit-oder-pflicht" && typ === "pflicht") localTexts = PFLICHT_18_PLUS;
          else if (currentGame === "wer-wuerde-eher") localTexts = WER_WUERDE_EHER_18_PLUS;
          else localTexts = [...WAHRHEIT_18_PLUS, ...PFLICHT_18_PLUS, ...WER_WUERDE_EHER_18_PLUS];
        }

        const totalCount = supaItems.length + localTexts.length;
        if (totalCount > 0) {
          const idx = Math.floor(Math.random() * totalCount);
          if (idx < supaItems.length) {
            const c = supaItems[idx];
            cardText = c.text; cardId = c.id; currentCardIdRef.current = c.id;
          } else {
            cardText = localTexts[idx - supaItems.length];
          }
        }
      }

      // 18+-Modus-Flag in Meta weitertragen
      if (mode18Plus) meta = { ...meta, mode18Plus: "true" };

      // Zufälligen Spieler auswählen (kein Doppelpick; nicht bei Imposter, Wer-würde-eher, Ich-hab-noch-nie)
      if (currentGame !== "imposter" && currentGame !== "wer-wuerde-eher" && currentGame !== "ich-hab-noch-nie") {
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
    } catch (err) {
      console.error("karteZiehen Fehler:", err);
    }
    setIsLoading(false);
  }, [currentGame, upperCode]);

  const imposterAuflösung = useCallback(async () => {
    const newMeta = { ...currentMeta, revealed: "true" };
    try {
      const { error } = await supabase.from("rooms").update({ current_meta: newMeta }).eq("id", upperCode);
      if (error) throw error;
      setCurrentMeta(newMeta);
    } catch (err) {
      console.error("imposterAuflösung Fehler:", err);
    }
  }, [currentMeta, upperCode]);

  async function toggle18Plus() {
    const active = currentMeta.mode18Plus === "true";
    const newMeta = { ...currentMeta, mode18Plus: active ? "false" : "true" };
    try {
      const { error } = await supabase.from("rooms").update({ current_meta: newMeta }).eq("id", upperCode);
      if (error) throw error;
      setCurrentMeta(newMeta);
    } catch (err) {
      console.error("toggle18Plus Fehler:", err);
    }
  }

  async function spielWählen(gameId: GameId) {
    lastSelectedPlayerRef.current = "";
    const initialMeta: Record<string, string> = {};
    // 18+-Modus beibehalten beim Spielwechsel
    if (currentMeta.mode18Plus === "true") initialMeta.mode18Plus = "true";
    // Startspieler random wählen (außer Imposter, Wer-würde-eher, Ich-hab-noch-nie)
    if (gameId !== "imposter" && gameId !== "wer-wuerde-eher" && gameId !== "ich-hab-noch-nie") {
      const pl = playersRef.current;
      if (pl.length >= 1) {
        const chosen = pl[Math.floor(Math.random() * pl.length)];
        lastSelectedPlayerRef.current = chosen.name;
        initialMeta.selectedPlayer = chosen.name;
        initialMeta.isStart = "true";
      }
    }
    try {
      const { error } = await supabase.from("rooms").update({ current_game: gameId, current_card_text: null, current_card_id: null, current_meta: initialMeta }).eq("id", upperCode);
      if (error) throw error;
      setCurrentGame(gameId); setCurrentCardText(null); setCurrentMeta(initialMeta); currentCardIdRef.current = null;
    } catch (err) {
      console.error("spielWählen Fehler:", err);
    }
  }

  async function zurückZurLobby() {
    try {
      const { error } = await supabase.from("rooms").update({ current_game: null, current_card_text: null, current_card_id: null, current_meta: {} }).eq("id", upperCode);
      if (error) throw error;
      setCurrentGame(null); setCurrentCardText(null);
    } catch (err) {
      console.error("zurückZurLobby Fehler:", err);
    }
  }

  async function verlassen() {
    if (isHost) {
      try {
        const { error } = await supabase.from("rooms").delete().eq("id", upperCode);
        if (error) throw error;
      } catch (err) {
        console.error("verlassen (Raum löschen) Fehler:", err);
      }
      localStorage.removeItem(`trinkspiel_host_${upperCode}`);
    }
    router.push("/online");
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(upperCode);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard nicht verfügbar (z.B. kein HTTPS) – still ignorieren
    }
  }

  if (pageLoading) return (
    <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-3.5 w-3.5 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex flex-1 items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-zinc-600" /></div>
    </GameLayout>
  );

  if (fehler || !room) return (
    <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-3.5 w-3.5 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex items-start gap-2.5 rounded-[var(--r-md)] border border-red-800/50 bg-red-950/35 p-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <p className="text-[13px] font-bold text-red-300">{fehler}</p>
      </div>
    </GameLayout>
  );

  const aktivesSpiel = SPIELE.find((s) => s.id === currentGame);

  const RoomHeader = (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="rounded-[var(--r-sm)] glass px-3.5 py-2">
          <span className="text-[16px] font-extrabold tracking-widest text-white">{upperCode}</span>
        </div>
        <button onClick={kopieren} className="flex h-10 w-10 items-center justify-center rounded-[var(--r-sm)] glass transition-colors active:bg-white/10">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5">
          <Users className="h-3.5 w-3.5 text-zinc-400" /><span className="text-[14px] font-extrabold text-zinc-300">{players.length}</span>
        </div>
        <button onClick={verlassen} className="flex h-10 w-10 items-center justify-center rounded-full glass transition-colors hover:bg-red-950 hover:border-red-800 active:bg-red-950 active:border-red-800">
          <LogOut className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (!currentGame) return (
    <>
    <GameLayout title="Lobby" titleIcon={<Globe className="h-3.5 w-3.5 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex flex-col gap-4">
        {RoomHeader}
        <div className="rounded-[var(--r-xl)] glass-card p-4">
          <p className="section-label mb-3">Verbundene Spieler</p>
          <div className="flex flex-col gap-2">
            {players.length === 0 ? (
              <p className="text-[13px] font-semibold text-zinc-500 py-2">Warte auf Spieler...</p>
            ) : players.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-[var(--r-md)] bg-white/[0.04] px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-[14px] font-extrabold text-white">{p.name[0]?.toUpperCase()}</div>
                <span className="flex-1 truncate text-[15px] font-extrabold text-white">{p.name}</span>
                {p.isHost && <div className="flex items-center gap-1 rounded-full bg-amber-950/60 px-2 py-1"><Crown className="h-3 w-3 text-amber-400" /><span className="text-[11px] font-extrabold text-amber-400">Host</span></div>}
              </div>
            ))}
          </div>
        </div>
        {isHost ? (
          <div>
            <p className="section-label mb-3">Spiel auswählen</p>
            <div className="grid grid-cols-2 gap-3">
              {SPIELE.map(({ id, label, desc, Icon, iconGradient, cardGradient, border }) => (
                <button
                  key={id}
                  onClick={() => id === "imposter" ? setImposterPickerOpen(true) : spielWählen(id)}
                  className={`group flex min-h-[130px] flex-col rounded-[var(--r-xl)] border p-4 text-left bg-gradient-to-br ${cardGradient} ${border} backdrop-blur-xl shadow-[var(--sh-card)] transition-all duration-200 active:scale-[0.97]`}
                >
                  <div className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] bg-gradient-to-br ${iconGradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-[14px] font-extrabold text-white leading-snug">{label}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-zinc-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-[var(--r-xl)] border border-dashed border-white/10 bg-white/[0.02] py-10">
            <Crown className="h-7 w-7 text-zinc-500" />
            <p className="text-[13px] font-extrabold text-zinc-500">Warte auf den Host...</p>
          </div>
        )}
      </div>
    </GameLayout>

    {/* Imposter-Picker */}
    {imposterPickerOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-t-[var(--r-xl)] border-t border-white/10 bg-[#0a0c1a] p-5 pb-8">
          <div className="mb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>
          <p className="mb-5 mt-3 text-center text-[18px] font-extrabold text-white">Wie viele Imposter?</p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { onlineImposterCountRef.current = 1; setImposterPickerOpen(false); spielWählen("imposter"); }}
              className="flex items-center gap-3.5 rounded-[var(--r-md)] glass p-4 text-left transition-all active:scale-[0.97]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] bg-red-500/20 text-xl">🕵️</div>
              <div>
                <p className="text-[15px] font-extrabold text-white">1 Imposter</p>
                <p className="text-[12px] font-semibold text-zinc-500">Klassisch</p>
              </div>
            </button>
            <button
              onClick={() => { onlineImposterCountRef.current = 2; setImposterPickerOpen(false); spielWählen("imposter"); }}
              className="flex items-center gap-3.5 rounded-[var(--r-md)] border border-red-500/30 bg-red-950/30 p-4 text-left transition-all active:scale-[0.97]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] bg-red-500/20 text-xl">🕵️🕵️</div>
              <div>
                <p className="text-[15px] font-extrabold text-white">2 Imposter</p>
                <p className="text-[12px] font-semibold text-zinc-500">Mehr Chaos</p>
              </div>
            </button>
            <button
              onClick={() => setImposterPickerOpen(false)}
              className="btn-secondary mt-1"
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
    <GameLayout title={aktivesSpiel?.label ?? "Spiel"} titleIcon={aktivesSpiel ? <aktivesSpiel.Icon className="h-3.5 w-3.5 text-zinc-300" /> : undefined} glowColor="rgba(124,58,237,0.10)">
      <div className="flex flex-1 flex-col justify-between">
        {RoomHeader}
        {isHost && (
          <button onClick={zurückZurLobby} className="mb-3 flex items-center gap-1.5 self-start rounded-full glass px-3.5 py-2 text-[13px] font-extrabold text-zinc-400 transition-colors hover:bg-white/10 active:bg-white/10">
            <ChevronLeft className="h-3.5 w-3.5" /> Spiel wechseln
          </button>
        )}
        {/* Startspieler-Banner – prominent über der Karte */}
        {currentMeta.selectedPlayer && currentGame !== "wer-wuerde-eher" && currentGame !== "ich-hab-noch-nie" && currentGame !== "imposter" && (
          <div
            key={currentMeta.selectedPlayer + currentCardText}
            className="anim-player mb-4 flex flex-col items-center gap-1.5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.40)] text-3xl font-extrabold text-white">
              {currentMeta.selectedPlayer[0]?.toUpperCase()}
            </div>
            <p className="text-[22px] font-extrabold text-white">{currentMeta.selectedPlayer}</p>
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              {currentMeta.isStart === "true" ? "🎲 fängt an!" : "🎯 ist dran!"}
            </span>
          </div>
        )}

        <div className="flex flex-1 items-center justify-center py-2">
          {/* Imposter: personalized role card */}
          {currentGame === "imposter" ? (
            <div className="w-full max-w-sm">
              {countdown !== null ? (
                <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-7 text-center">
                  <div className="accent-top-red" />
                  <p className="section-label mb-5">
                    Neue Runde startet in
                  </p>
                  <div className="flex h-36 w-36 mx-auto items-center justify-center rounded-full border border-red-500/30 bg-red-950/40 mb-5 anim-cd">
                    <span className="text-7xl font-extrabold text-white">{countdown}</span>
                  </div>
                  <p className="text-[13px] font-extrabold text-zinc-500">Macht euch bereit!</p>
                </div>
              ) : !currentMeta.word ? (
                <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-7 text-center">
                  <div className="accent-top-red" />
                  <div className="py-4">
                    {isHost
                      ? <p className="text-[14px] font-extrabold text-zinc-500">Starte die erste Runde!</p>
                      : <p className="text-[14px] font-extrabold text-zinc-500">Warte auf den Host...</p>}
                  </div>
                </div>
              ) : imposterRevealed ? (
                <div className="relative overflow-hidden rounded-[var(--r-xl)] glass-card p-7 text-center">
                  <div className="accent-top-red" />
                  <p className="section-label mb-2">Auflösung</p>
                  <p className="text-[13px] font-bold text-zinc-500 mb-1">Das Wort war</p>
                  <p className="text-3xl font-extrabold text-white mb-4">{currentMeta.word}</p>
                  <p className="text-[13px] font-bold text-zinc-500 mb-1">{twoImpostersOnline ? "Die Imposter waren" : "Der Imposter war"}</p>
                  <p className="text-xl font-extrabold text-red-400">
                    {currentMeta.imposterName}{twoImpostersOnline && currentMeta.imposterName2 ? ` & ${currentMeta.imposterName2}` : ""} 🕵️
                  </p>
                </div>
              ) : isImposter ? (
                <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-red-500/50 bg-red-950/40 backdrop-blur-xl shadow-[var(--sh-card)] p-7 text-center">
                  <div className="accent-top-red" />
                  <div className="text-5xl mb-3">🕵️</div>
                  <p className="text-xl font-extrabold text-red-400 mb-1">Du bist {twoImpostersOnline ? "ein" : "der"}</p>
                  <p className="text-4xl font-extrabold text-red-300">IMPOSTER!</p>
                  {currentMeta.hintWord && (
                    <div className="mt-4 rounded-[var(--r-md)] border border-red-500/20 bg-red-500/10 px-4 py-3">
                      <p className="section-label !text-red-400 mb-1">
                        Dein Hilfswort
                      </p>
                      <p className="text-xl font-extrabold text-red-200">{currentMeta.hintWord}</p>
                    </div>
                  )}
                  <p className="mt-3 text-[13px] font-bold text-red-400/70">
                    Nutze dein Hilfswort – aber nenn das echte Wort nicht!
                  </p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-emerald-500/50 bg-emerald-950/30 backdrop-blur-xl shadow-[var(--sh-card)] p-7 text-center">
                  <div className="accent-top-green" />
                  <p className="section-label mb-3">Das Wort ist</p>
                  <p className="text-4xl font-extrabold text-white mb-3">{currentMeta.word}</p>
                  <p className="text-[13px] font-bold text-emerald-400">
                    Finde den Imposter! Nenn das Wort nicht direkt.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              key={currentCardText ?? "empty"}
              className="anim-slide relative w-full max-w-sm overflow-hidden rounded-[var(--r-xl)] glass-card"
            >
              <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${cardGradient}`} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
              <div className="px-5 pt-5 pb-6">
                {/* Wer würde eher: VS-Anzeige oben in der Karte */}
                {currentGame === "wer-wuerde-eher" && currentMeta.player1 && (
                  <div className="mb-4 text-center">
                    <p className="text-[22px] font-extrabold text-white leading-tight">
                      {currentMeta.player1}{" "}
                      <span className="text-[15px] text-zinc-500">vs</span>{" "}
                      {currentMeta.player2}
                    </p>
                  </div>
                )}

                {currentGame === "wahrheit-oder-pflicht" && currentMeta.typ && (
                  <span className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border ${currentMeta.typ === "wahrheit" ? "bg-violet-500/12 text-violet-300 border-violet-500/15" : "bg-pink-500/12 text-pink-300 border-pink-500/15"}`}>
                    {currentMeta.typ === "wahrheit" ? "🤔" : "🔥"} {currentMeta.typ}
                  </span>
                )}
                {currentCardText ? (
                  <p className="mt-3 text-center text-[20px] font-extrabold text-white leading-snug min-h-[72px] flex items-center justify-center">{currentCardText}</p>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mb-3 text-3xl">{aktivesSpiel?.id === "ich-hab-noch-nie" ? "🙊" : aktivesSpiel?.id === "wahrheit-oder-pflicht" ? "🔥" : aktivesSpiel?.id === "wer-wuerde-eher" ? "🤷" : "🎲"}</div>
                    {isHost
                      ? <p className="text-[14px] font-extrabold text-zinc-500">Zieh die erste Karte!</p>
                      : <p className="text-[14px] font-extrabold text-zinc-500">Warte auf den Host...</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2.5 pb-2">
          {/* 18+ Toggle – Host steuert, alle sehen Status */}
          {currentGame !== "imposter" && (
            <button
              onClick={isHost ? toggle18Plus : undefined}
              disabled={!isHost}
              className={`toggle-18 ${currentMeta.mode18Plus === "true" ? "on" : "off"} ${!isHost ? "cursor-default" : ""}`}
            >
              🔞 {currentMeta.mode18Plus === "true"
                ? `18+ Modus aktiv${!isHost ? "" : " – Tap zum Deaktivieren"}`
                : `18+ Modus${isHost ? " aktivieren" : " (inaktiv)"}`}
            </button>
          )}

          {isHost ? (
            currentGame === "imposter" ? (
              <div className="flex flex-col gap-2.5">
                {currentMeta.word && !imposterRevealed && (
                  <button
                    onClick={imposterAuflösung}
                    disabled={isLoading}
                    className="btn-secondary !border-red-500/30 !text-red-300 disabled:opacity-60"
                  >
                    <UserX className="h-[18px] w-[18px]" /> Auflösung anzeigen
                  </button>
                )}
                <button
                  onClick={() => karteZiehen()}
                  disabled={isLoading}
                  className="btn-primary bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] disabled:opacity-70"
                >
                  <SkipForward className={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`} />
                  {currentMeta.word ? "Neue Runde" : "Runde starten"}
                </button>
              </div>
            ) : currentGame === "wahrheit-oder-pflicht" ? (
              <div className="btn-row">
                <button onClick={() => karteZiehen("wahrheit")} disabled={isLoading} className="btn-primary bg-gradient-to-r from-violet-600 to-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)] disabled:opacity-60">
                  <HelpCircle className={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`} /> Wahrheit
                </button>
                <button onClick={() => karteZiehen("pflicht")} disabled={isLoading} className="btn-primary bg-gradient-to-r from-pink-600 to-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.35)] disabled:opacity-60">
                  <Flame className={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`} /> Pflicht
                </button>
              </div>
            ) : (
              <button onClick={() => karteZiehen()} disabled={isLoading} className={`btn-primary bg-gradient-to-r ${cardGradient} shadow-[0_0_20px_rgba(99,102,241,0.35)] disabled:opacity-70`}>
                <SkipForward className={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`} />
                {currentCardText ? "Nächste Karte" : "Erste Karte ziehen"}
              </button>
            )
          ) : (
            <div className="btn-secondary !cursor-default">
              <p className="text-[13px] font-extrabold text-zinc-500">
                {currentGame === "imposter" ? "Schau auf dein Display – nur für dich!" : "Der Host zieht die Karten"}
              </p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
