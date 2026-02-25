"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCw, Users, Copy, Check, Crown, AlertCircle,
  Loader2, LogOut, Beer, Scale, Hand, ChevronLeft,
  HelpCircle, Flame,
} from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Room } from "@/lib/supabase";

// ─── Typen ──────────────────────────────────────────────────────────────────

type PlayerInfo = {
  name: string;
  isHost: boolean;
  joinedAt: number;
};

type GameId = "allgemein" | "wahrheit-oder-pflicht" | "ich-hab-noch-nie" | "wer-wuerde-eher";

// ─── Spielkonfiguration ─────────────────────────────────────────────────────

const SPIELE: {
  id: GameId;
  label: string;
  desc: string;
  Icon: React.ElementType;
  accent: string;
  border: string;
  bg: string;
}[] = [
  {
    id: "allgemein",
    label: "Freie Runde",
    desc: "Zufällige Karten aus allen Kategorien",
    Icon: Beer,
    accent: "text-amber-400",
    border: "border-amber-900/60",
    bg: "bg-amber-950/20",
  },
  {
    id: "wahrheit-oder-pflicht",
    label: "Wahrheit oder Pflicht",
    desc: "Der Host wählt den Typ pro Karte",
    Icon: Scale,
    accent: "text-sky-400",
    border: "border-sky-900/60",
    bg: "bg-sky-950/20",
  },
  {
    id: "ich-hab-noch-nie",
    label: "Ich hab noch nie...",
    desc: "Gestehe – und trinke wenn nötig",
    Icon: Hand,
    accent: "text-emerald-400",
    border: "border-emerald-900/60",
    bg: "bg-emerald-950/20",
  },
  {
    id: "wer-wuerde-eher",
    label: "Wer würde eher...?",
    desc: "Zwei Spieler werden zufällig gepickt",
    Icon: Users,
    accent: "text-violet-400",
    border: "border-violet-900/60",
    bg: "bg-violet-950/20",
  },
];

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function getUserId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "trinkspiel_userId";
  const stored = sessionStorage.getItem(key);
  if (stored) return stored;
  const fresh = crypto.randomUUID();
  sessionStorage.setItem(key, fresh);
  return fresh;
}

function getPlayers(state: Record<string, PlayerInfo[]>): PlayerInfo[] {
  return Object.values(state)
    .flat()
    .sort((a, b) => a.joinedAt - b.joinedAt);
}

// ─── Hauptkomponente ────────────────────────────────────────────────────────

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();

  // ── State ──────────────────────────────────────────────────────────────────
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

  // Refs für stale-closure-sichere Werte in Callbacks
  const currentCardIdRef = useRef<number | null>(null);
  const currentCardTextRef = useRef<string | null>(null);
  const playersRef = useRef<PlayerInfo[]>([]);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { currentCardTextRef.current = currentCardText; }, [currentCardText]);

  // ── Raum laden + Host erkennen ─────────────────────────────────────────────
  useEffect(() => {
    async function loadRoom() {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", code)
        .single();

      if (error || !data) {
        setFehler("Raum nicht gefunden. Prüfe den Code oder erstelle einen neuen Raum.");
        setPageLoading(false);
        return;
      }

      const r = data as Room;
      setRoom(r);
      setCurrentCardText(r.current_card_text);
      setCurrentGame(r.current_game);
      setCurrentMeta(r.current_meta ?? {});
      currentCardIdRef.current = r.current_card_id;

      const storedHostId = localStorage.getItem(`trinkspiel_host_${code}`);
      setIsHost(!!storedHostId && storedHostId === r.host_id);
      setPageLoading(false);
    }
    loadRoom();
  }, [code]);

  // ── Realtime: Postgres Changes + Presence ────────────────────────────────
  useEffect(() => {
    const userId = getUserId();
    const playerName = sessionStorage.getItem("trinkspiel_name") || "Anonym";
    const storedHostId = localStorage.getItem(`trinkspiel_host_${code}`);
    const isHostLocal = !!storedHostId;

    const channel = supabase.channel(`room-${code}`, {
      config: { presence: { key: userId } },
    });

    channel
      // Karte + Spielwechsel sync für alle Clients
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${code}` },
        (payload) => {
          const updated = payload.new as Room;
          setCurrentCardText(updated.current_card_text);
          setCurrentGame(updated.current_game);
          setCurrentMeta(updated.current_meta ?? {});
          currentCardIdRef.current = updated.current_card_id;
        }
      )
      // Presence: Spielerliste live updaten
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PlayerInfo[]>;
        setPlayers(getPlayers(state));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: playerName,
            isHost: isHostLocal,
            joinedAt: Date.now(),
          });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [code]);

  // ── Karte ziehen (nur Host) ───────────────────────────────────────────────
  const karteZiehen = useCallback(async (typ?: "wahrheit" | "pflicht") => {
    setIsLoading(true);

    let cardText: string | null = null;
    let cardId: number | null = null;
    let meta: Record<string, string> = {};

    if (currentGame === "ich-hab-noch-nie") {
      // Aus ich_hab_noch_nie Tabelle ziehen, aktuelle Karte ausschließen
      const { data } = await supabase
        .from("ich_hab_noch_nie")
        .select("id, text")
        .neq("text", currentCardTextRef.current?.replace("Ich hab noch nie... ", "") ?? "")
        .limit(10);

      if (data && data.length > 0) {
        const card = data[Math.floor(Math.random() * data.length)];
        cardText = `Ich hab noch nie... ${card.text}`;
      }
    } else {
      // Aus aufgaben Tabelle ziehen
      let query = supabase
        .from("aufgaben")
        .select("id, text, typ")
        .neq("id", currentCardIdRef.current ?? 0)
        .limit(15);

      if (currentGame === "wahrheit-oder-pflicht" && typ) {
        query = query.eq("typ", typ);
        meta = { typ };
      } else if (currentGame === "wer-wuerde-eher") {
        query = query.eq("typ", "wer_wuerde_eher");
        // Zwei zufällige Spieler aus Presence picken
        const all = playersRef.current;
        if (all.length >= 2) {
          const shuffled = [...all].sort(() => Math.random() - 0.5);
          meta = { player1: shuffled[0].name, player2: shuffled[1].name };
        }
      } else {
        // Freie Runde: alle außer Buzzer
        query = query.neq("typ", "buzzer");
      }

      const { data } = await query;
      if (data && data.length > 0) {
        const card = data[Math.floor(Math.random() * data.length)];
        cardText = card.text;
        cardId = card.id;
        currentCardIdRef.current = card.id;
      }
    }

    if (cardText) {
      // DB updaten → Realtime triggert automatisch alle anderen Clients
      await supabase
        .from("rooms")
        .update({ current_card_id: cardId, current_card_text: cardText, current_meta: meta })
        .eq("id", code);

      // Eigene Ansicht sofort aktualisieren
      setCurrentCardText(cardText);
      setCurrentMeta(meta);
    }

    setIsLoading(false);
  }, [code, currentGame]);

  // ── Spiel auswählen (Host) ───────────────────────────────────────────────
  async function spielWählen(gameId: GameId) {
    await supabase
      .from("rooms")
      .update({ current_game: gameId, current_card_text: null, current_card_id: null, current_meta: {} })
      .eq("id", code);
    // Eigene UI sofort updaten
    setCurrentGame(gameId);
    setCurrentCardText(null);
    setCurrentMeta({});
    currentCardIdRef.current = null;
  }

  // ── Zurück zur Lobby (Host) ──────────────────────────────────────────────
  async function zurückZurLobby() {
    await supabase
      .from("rooms")
      .update({ current_game: null, current_card_text: null, current_card_id: null, current_meta: {} })
      .eq("id", code);
    setCurrentGame(null);
    setCurrentCardText(null);
    setCurrentMeta({});
  }

  // ── Raum verlassen ────────────────────────────────────────────────────────
  async function verlassen() {
    if (isHost) {
      await supabase.from("rooms").delete().eq("id", code);
      localStorage.removeItem(`trinkspiel_host_${code}`);
    }
    router.push("/online");
  }

  async function kopieren() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Render: Laden ─────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <GameLayout title="Online Modus">
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
        </div>
      </GameLayout>
    );
  }

  // ── Render: Fehler ────────────────────────────────────────────────────────
  if (fehler || !room) {
    return (
      <GameLayout title="Online Modus">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-red-300 text-sm">{fehler}</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  // ── Gemeinsamer Header für alle Phasen ───────────────────────────────────
  const RoomHeader = (
    <div className="mx-auto mb-5 flex w-full max-w-md items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2">
          <span className="text-xl font-black tracking-widest text-zinc-100">{code}</span>
        </div>
        <button
          onClick={kopieren}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 transition-colors hover:bg-zinc-700"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5">
          <Users className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">{players.length}</span>
        </div>
        <button
          onClick={verlassen}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-colors hover:bg-red-950 hover:border-red-800"
        >
          <LogOut className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );

  // ── Render: Lobby (kein Spiel ausgewählt) ────────────────────────────────
  if (!currentGame) {
    return (
      <GameLayout title="Lobby">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {RoomHeader}

          {/* Spielerliste */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Verbundene Spieler
            </p>
            <div className="flex flex-col gap-2">
              {players.length === 0 ? (
                <p className="text-sm text-zinc-600 py-2">Warte auf Spieler...</p>
              ) : (
                players.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-800 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold text-zinc-200">
                      {p.name[0]?.toUpperCase()}
                    </div>
                    <span className="flex-1 font-medium text-zinc-200">{p.name}</span>
                    {p.isHost && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-950/60 px-2 py-0.5">
                        <Crown className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-semibold">Host</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spielauswahl (nur Host) */}
          {isHost ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Spiel auswählen
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SPIELE.map(({ id, label, desc, Icon, accent, border, bg }) => (
                  <button
                    key={id}
                    onClick={() => spielWählen(id)}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition-all active:scale-95 hover:brightness-125 ${border} ${bg}`}
                  >
                    <Icon className={`mb-3 h-7 w-7 ${accent}`} />
                    <p className="text-sm font-bold text-zinc-100 leading-snug">{label}</p>
                    <p className="mt-1 text-xs text-zinc-500 leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 py-10">
              <Crown className="h-8 w-8 text-zinc-600" />
              <p className="font-medium text-zinc-500">Warte auf den Host...</p>
              <p className="text-sm text-zinc-600">Der Host wählt gleich ein Spiel</p>
            </div>
          )}
        </div>
      </GameLayout>
    );
  }

  // ── Render: Spiel läuft ──────────────────────────────────────────────────
  const aktivesSpiel = SPIELE.find((s) => s.id === currentGame);

  return (
    <GameLayout title={aktivesSpiel?.label ?? "Spiel"}>
      <div
        className="mx-auto flex w-full max-w-md flex-col justify-between"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        {RoomHeader}

        {/* Zurück zur Lobby (nur Host) */}
        {isHost && (
          <button
            onClick={zurückZurLobby}
            className="mb-4 flex items-center gap-2 self-start rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Spiel wechseln
          </button>
        )}

        {/* Karte */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">

          {/* Wer würde eher: Spieler anzeigen */}
          {currentGame === "wer-wuerde-eher" && currentMeta.player1 && (
            <div className="flex w-full items-center justify-center gap-3">
              <div className="flex-1 rounded-2xl border border-violet-800/60 bg-violet-950/30 py-3 text-center">
                <p className="text-xl font-bold text-violet-200">{currentMeta.player1}</p>
              </div>
              <span className="text-lg font-black text-zinc-500">VS</span>
              <div className="flex-1 rounded-2xl border border-violet-800/60 bg-violet-950/30 py-3 text-center">
                <p className="text-xl font-bold text-violet-200">{currentMeta.player2}</p>
              </div>
            </div>
          )}

          {/* Karten-Typ Badge (Wahrheit/Pflicht) */}
          {currentGame === "wahrheit-oder-pflicht" && currentMeta.typ && (
            <div
              className={`flex items-center gap-2 self-center rounded-full px-4 py-1.5 text-sm font-bold ${
                currentMeta.typ === "wahrheit"
                  ? "bg-sky-900/60 text-sky-300"
                  : "bg-orange-900/60 text-orange-300"
              }`}
            >
              {currentMeta.typ === "wahrheit" ? (
                <HelpCircle className="h-4 w-4" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              {currentMeta.typ === "wahrheit" ? "Wahrheit" : "Pflicht"}
            </div>
          )}

          {/* Hauptkarte */}
          {currentCardText ? (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
              {currentGame === "wer-wuerde-eher" && currentMeta.player1 && (
                <p className="mb-3 text-center text-sm font-medium text-zinc-500">
                  Wer würde eher...
                </p>
              )}
              <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
                {currentCardText}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
              {isHost ? (
                <>
                  {aktivesSpiel && <aktivesSpiel.Icon className={`mx-auto mb-4 h-10 w-10 ${aktivesSpiel.accent} opacity-50`} />}
                  <p className="text-zinc-500">Zieh die erste Karte!</p>
                </>
              ) : (
                <>
                  <Users className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                  <p className="text-zinc-500">Warte auf den Host...</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-8">
          {isHost ? (
            currentGame === "wahrheit-oder-pflicht" ? (
              // Wahrheit/Pflicht: zwei separate Buttons
              <div className="flex gap-3">
                <button
                  onClick={() => karteZiehen("wahrheit")}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-sky-400"
                >
                  <HelpCircle className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                  Wahrheit
                </button>
                <button
                  onClick={() => karteZiehen("pflicht")}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-orange-400"
                >
                  <Flame className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                  Pflicht
                </button>
              </div>
            ) : (
              // Alle anderen Spiele: ein Button
              <button
                onClick={() => karteZiehen()}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 py-5 text-xl font-bold text-zinc-950 shadow-lg transition-all active:scale-95 disabled:opacity-70 hover:bg-amber-300"
              >
                <RefreshCw className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
                {currentCardText ? "Nächste Karte" : "Erste Karte ziehen"}
              </button>
            )
          ) : (
            <div className="flex w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-5">
              <p className="text-sm text-zinc-500">Der Host zieht die Karten</p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
