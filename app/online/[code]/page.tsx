"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCw, Users, Copy, Check, Crown, AlertCircle,
  Loader2, LogOut, Beer, Scale, Hand, ChevronLeft,
  HelpCircle, Flame, Globe, Eye, Zap, Users2, Radio,
} from "lucide-react";
import { SkipForward } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Room } from "@/lib/supabase";

type PlayerInfo = { name: string; isHost: boolean; joinedAt: number };
type GameId = "allgemein" | "wahrheit-oder-pflicht" | "ich-hab-noch-nie" | "wer-wuerde-eher";

const SPIELE: { id: GameId; label: string; desc: string; Icon: React.ElementType; iconGradient: string; cardBg: string; border: string }[] = [
  { id: "allgemein",             label: "Freie Runde",          desc: "Alle Karten gemischt",         Icon: Beer,   iconGradient: "from-amber-400 to-orange-500",  cardBg: "bg-[#1a100b]", border: "border-amber-900/40" },
  { id: "wahrheit-oder-pflicht", label: "Wahrheit oder Pflicht", desc: "Truth or Dare",                Icon: Eye,    iconGradient: "from-violet-500 to-purple-700", cardBg: "bg-[#1a0b2e]", border: "border-purple-900/40" },
  { id: "ich-hab-noch-nie",      label: "Ich hab noch nie",     desc: "Never Have I Ever",            Icon: Zap,    iconGradient: "from-sky-400 to-blue-600",     cardBg: "bg-[#0b152e]", border: "border-blue-900/40" },
  { id: "wer-wuerde-eher",       label: "Am ehesten würde...",  desc: "Most Likely To",               Icon: Users2, iconGradient: "from-green-400 to-emerald-600", cardBg: "bg-[#0b200f]", border: "border-green-900/40" },
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

  const currentCardIdRef = useRef<number | null>(null);
  const currentCardTextRef = useRef<string | null>(null);
  const playersRef = useRef<PlayerInfo[]>([]);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { currentCardTextRef.current = currentCardText; }, [currentCardText]);

  useEffect(() => {
    async function loadRoom() {
      const { data, error } = await supabase.from("rooms").select("*").eq("id", upperCode).single();
      if (error || !data) { setFehler("Raum nicht gefunden."); setPageLoading(false); return; }
      const r = data as Room;
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

  const karteZiehen = useCallback(async (typ?: "wahrheit" | "pflicht") => {
    setIsLoading(true);
    let cardText: string | null = null, cardId: number | null = null, meta: Record<string, string> = {};
    if (currentGame === "ich-hab-noch-nie") {
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
    if (cardText) {
      await supabase.from("rooms").update({ current_card_id: cardId, current_card_text: cardText, current_meta: meta }).eq("id", upperCode);
      setCurrentCardText(cardText); setCurrentMeta(meta);
    }
    setIsLoading(false);
  }, [currentGame, upperCode]);

  async function spielWählen(gameId: GameId) {
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
    <GameLayout title="Lobby" titleIcon={<Globe className="h-4 w-4 text-sky-400" />} glowColor="rgba(14,165,233,0.10)">
      <div className="flex flex-col gap-5">
        {RoomHeader}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4">
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
              {SPIELE.map(({ id, label, desc, Icon, iconGradient, cardBg, border }) => (
                <button key={id} onClick={() => spielWählen(id)} className={`flex flex-col rounded-3xl border p-4 text-left transition-all active:scale-95 ${cardBg} ${border}`}>
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient}`}><Icon className="h-5 w-5 text-white" /></div>
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
  );

  // ── Spiel ─────────────────────────────────────────────────────────────────
  const gradientMap: Record<string, string> = {
    "allgemein": "from-amber-400 to-orange-500",
    "wahrheit-oder-pflicht": "from-violet-600 to-pink-500",
    "ich-hab-noch-nie": "from-sky-500 to-cyan-400",
    "wer-wuerde-eher": "from-emerald-500 to-green-400",
  };
  const cardGradient = gradientMap[currentGame] ?? "from-violet-600 to-pink-500";

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
          {currentGame === "wer-wuerde-eher" && currentMeta.player1 && (
            <div className="mb-4 flex w-full max-w-sm items-center gap-3">
              <div className="flex-1 rounded-2xl border border-emerald-800/40 bg-emerald-950/30 py-2.5 text-center"><p className="font-black text-emerald-200">{currentMeta.player1}</p></div>
              <span className="font-black text-zinc-500">VS</span>
              <div className="flex-1 rounded-2xl border border-emerald-800/40 bg-emerald-950/30 py-2.5 text-center"><p className="font-black text-emerald-200">{currentMeta.player2}</p></div>
            </div>
          )}
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04]">
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${cardGradient}`} />
            <div className="p-6 pb-8 pt-7">
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
        </div>
        <div className="flex flex-col gap-3 pb-2">
          {isHost ? (
            currentGame === "wahrheit-oder-pflicht" ? (
              <div className="flex gap-3">
                <button onClick={() => karteZiehen("wahrheit")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 py-4 text-base font-black text-white transition-all active:scale-95 disabled:opacity-60">
                  <HelpCircle className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} /> Wahrheit
                </button>
                <button onClick={() => karteZiehen("pflicht")} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 py-4 text-base font-black text-white transition-all active:scale-95 disabled:opacity-60">
                  <Flame className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} /> Pflicht
                </button>
              </div>
            ) : (
              <button onClick={() => karteZiehen()} disabled={isLoading} className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${cardGradient} py-5 text-xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-70`}>
                <SkipForward className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                {currentCardText ? "Nächste Karte" : "Erste Karte ziehen"}
              </button>
            )
          ) : (
            <div className="flex w-full items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] py-5">
              <p className="text-sm font-black text-zinc-500">Der Host zieht die Karten</p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
