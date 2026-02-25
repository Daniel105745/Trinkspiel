"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, LogIn, Loader2, AlertCircle } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase } from "@/lib/supabase";

function generateCode(): string {
  // Verwende nur eindeutige Zeichen (kein O/0, I/1 Verwechslung)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export default function OnlineLobby() {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function raumErstellen() {
    setIsLoading(true);
    setFehler(null);

    const code = generateCode();
    const hostId = crypto.randomUUID();

    const { error } = await supabase.from("rooms").insert({
      id: code,
      host_id: hostId,
      current_card_id: null,
      current_card_text: null,
    });

    if (error) {
      setFehler("Raum konnte nicht erstellt werden. Bitte nochmal versuchen.");
      setIsLoading(false);
      return;
    }

    // Host-ID lokal speichern, damit nach Refresh noch erkennbar
    localStorage.setItem(`trinkspiel_host_${code}`, hostId);
    router.push(`/online/${code}`);
  }

  async function raumBeitreten() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setFehler("Bitte einen 4-stelligen Code eingeben.");
      return;
    }

    setIsLoading(true);
    setFehler(null);

    const { data, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", code)
      .single();

    if (error || !data) {
      setFehler(`Raum "${code}" nicht gefunden. Prüfe den Code.`);
      setIsLoading(false);
      return;
    }

    router.push(`/online/${code}`);
  }

  return (
    <GameLayout title="Online Modus">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Fehlermeldung */}
        {fehler && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-red-300 text-sm">{fehler}</p>
          </div>
        )}

        {/* Raum erstellen */}
        <div
          className={`rounded-2xl border transition-all ${
            mode === "create"
              ? "border-amber-700/80 bg-amber-950/30"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <button
            onClick={() => setMode(mode === "create" ? "idle" : "create")}
            className="flex w-full items-center gap-4 p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
              <Plus className="h-6 w-6 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-100">Raum erstellen</p>
              <p className="text-sm text-zinc-500">
                Du bist der Host und ziehst die Karten
              </p>
            </div>
          </button>

          {mode === "create" && (
            <div className="border-t border-zinc-800 p-5 pt-4">
              <p className="mb-4 text-sm text-zinc-400">
                Ein zufälliger 4-stelliger Code wird generiert. Teile ihn mit
                deinen Freunden.
              </p>
              <button
                onClick={raumErstellen}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 text-lg font-bold text-zinc-950 transition-all active:scale-95 disabled:opacity-60 hover:bg-amber-300"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
                Raum erstellen
              </button>
            </div>
          )}
        </div>

        {/* Raum beitreten */}
        <div
          className={`rounded-2xl border transition-all ${
            mode === "join"
              ? "border-zinc-600 bg-zinc-800/50"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <button
            onClick={() => setMode(mode === "join" ? "idle" : "join")}
            className="flex w-full items-center gap-4 p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-700/50">
              <LogIn className="h-6 w-6 text-zinc-300" />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-100">Raum beitreten</p>
              <p className="text-sm text-zinc-500">
                Code vom Host eingeben und mitspielen
              </p>
            </div>
          </button>

          {mode === "join" && (
            <div className="border-t border-zinc-800 p-5 pt-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 4))
                }
                onKeyDown={(e) => e.key === "Enter" && raumBeitreten()}
                placeholder="Z.B. A3K7"
                maxLength={4}
                className="mb-4 w-full rounded-xl bg-zinc-800 px-4 py-3 text-center text-2xl font-black uppercase tracking-widest text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-zinc-500"
              />
              <button
                onClick={raumBeitreten}
                disabled={isLoading || joinCode.length !== 4}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-4 text-lg font-bold text-zinc-950 transition-all active:scale-95 disabled:opacity-40 hover:bg-white"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Beitreten
              </button>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
