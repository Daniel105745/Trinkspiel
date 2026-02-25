"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCw,
  Users,
  Copy,
  Check,
  Crown,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Room } from "@/lib/supabase";

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

// ─── Komponente ─────────────────────────────────────────────────────────────

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();

  // ── State ──────────────────────────────────────────────────────────────────
  const [room, setRoom] = useState<Room | null>(null);
  const [currentCardText, setCurrentCardText] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Ref für aktuellen card_id (vermeidet stale closures beim Kartenziehen)
  const currentCardIdRef = useRef<number | null>(null);

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

      const roomData = data as Room;
      setRoom(roomData);
      setCurrentCardText(roomData.current_card_text);
      currentCardIdRef.current = roomData.current_card_id;

      // Host erkennen: gespeicherte Host-ID mit DB abgleichen
      const storedHostId = localStorage.getItem(`trinkspiel_host_${code}`);
      setIsHost(!!storedHostId && storedHostId === roomData.host_id);

      setPageLoading(false);
    }

    loadRoom();
  }, [code]);

  // ── Realtime: Postgres Changes + Presence ────────────────────────────────
  useEffect(() => {
    const userId = getUserId();

    const channel = supabase.channel(`room-${code}`, {
      config: {
        presence: { key: userId },
      },
    });

    channel
      // Karte sync: wenn Host current_card_text ändert, alle Clients updaten
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${code}`,
        },
        (payload) => {
          const updated = payload.new as Room;
          setCurrentCardText(updated.current_card_text);
          currentCardIdRef.current = updated.current_card_id;
        }
      )
      // Presence: Anzahl verbundener Spieler tracken
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setPlayerCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId, joinedAt: Date.now() });
        }
      });

    // Cleanup bei Unmount: Subscription entfernen
    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  // ── Nächste Karte ziehen (nur Host) ───────────────────────────────────────
  const nächsteKarte = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("aufgaben")
      .select("id, text")
      .neq("id", currentCardIdRef.current ?? 0)
      .limit(15);

    if (!error && data && data.length > 0) {
      const card = data[Math.floor(Math.random() * data.length)];
      currentCardIdRef.current = card.id;

      // Update in DB → triggert Realtime für alle Clients im Raum
      await supabase
        .from("rooms")
        .update({
          current_card_id: card.id,
          current_card_text: card.text,
        })
        .eq("id", code);

      // Eigene Ansicht sofort updaten (Realtime eigene Events kommen doppelt)
      setCurrentCardText(card.text);
    }

    setIsLoading(false);
  }, [code]);

  // ── Raum verlassen ────────────────────────────────────────────────────────
  async function raumVerlassen() {
    if (isHost) {
      // Host löscht den Raum beim Verlassen
      await supabase.from("rooms").delete().eq("id", code);
      localStorage.removeItem(`trinkspiel_host_${code}`);
    }
    router.push("/online");
  }

  // ── Code kopieren ─────────────────────────────────────────────────────────
  async function kopieren() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Render: Laden ─────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <GameLayout title="Online Modus">
        <div className="flex flex-1 items-center justify-center">
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

  // ── Render: Spiel ─────────────────────────────────────────────────────────
  return (
    <GameLayout title={isHost ? "Host — Online Modus" : "Mitspieler"}>
      <div
        className="mx-auto flex w-full max-w-md flex-col justify-between"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        {/* Rauminfo-Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Code + Kopieren */}
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2">
              <span className="text-xl font-black tracking-widest text-zinc-100">
                {code}
              </span>
            </div>
            <button
              onClick={kopieren}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 transition-colors hover:bg-zinc-700"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          </div>

          {/* Spieler-Anzahl + Verlassen */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5">
              <Users className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">
                {playerCount}
              </span>
            </div>
            <button
              onClick={raumVerlassen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-colors hover:bg-red-950 hover:border-red-800"
            >
              <LogOut className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Host-Badge */}
        {isHost && (
          <div className="mb-4 flex items-center gap-2 self-start rounded-full border border-amber-800/60 bg-amber-950/40 px-3 py-1.5">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">
              Du bist der Host
            </span>
          </div>
        )}

        {/* Karte */}
        <div className="flex flex-1 flex-col items-center justify-center py-6">
          {currentCardText ? (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
              <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
                {currentCardText}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
              {isHost ? (
                <>
                  <Crown className="mx-auto mb-4 h-10 w-10 text-amber-400/50" />
                  <p className="text-zinc-500">
                    Alle bereit? Zieh die erste Karte!
                  </p>
                </>
              ) : (
                <>
                  <Users className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                  <p className="text-zinc-500">Warte auf den Host...</p>
                  <p className="mt-2 text-xs text-zinc-600">
                    Der Host zieht gleich die erste Karte
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-8">
          {isHost ? (
            <button
              onClick={nächsteKarte}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 py-5 text-xl font-bold text-zinc-950 shadow-lg transition-all active:scale-95 disabled:opacity-70 hover:bg-amber-300"
            >
              <RefreshCw className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
              {currentCardText ? "Nächste Karte" : "Erste Karte ziehen"}
            </button>
          ) : (
            <div className="flex w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-5">
              <p className="text-sm text-zinc-500">
                Der Host zieht die Karten
              </p>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
