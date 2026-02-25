"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, LogIn, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase } from "@/lib/supabase";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

type Step = "name" | "action";
type Mode = "idle" | "create" | "join";

export default function OnlineLobby() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");

  const [mode, setMode] = useState<Mode>("idle");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  function nameBestaetigen() {
    const trimmed = name.trim();
    if (!trimmed) return;
    sessionStorage.setItem("trinkspiel_name", trimmed);
    setStep("action");
    setFehler(null);
  }

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
      current_game: null,
      current_meta: {},
    });

    if (error) {
      setFehler("Raum konnte nicht erstellt werden. Nochmal versuchen.");
      setIsLoading(false);
      return;
    }

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

  // ── Schritt 1: Name eingeben ──────────────────────────────────────────────
  if (step === "name") {
    return (
      <GameLayout title="Online Modus">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10">
              <Globe className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Wie heißt du?</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Dein Name wird allen Mitspielern angezeigt
            </p>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && nameBestaetigen()}
            placeholder="Dein Name..."
            maxLength={20}
            autoFocus
            className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-center text-xl font-semibold text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400"
          />

          <button
            onClick={nameBestaetigen}
            disabled={!name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-5 text-xl font-bold text-zinc-950 transition-all active:scale-95 disabled:opacity-40 hover:bg-amber-300"
          >
            Weiter
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── Schritt 2: Raum erstellen / beitreten ────────────────────────────────
  return (
    <GameLayout title="Online Modus">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Name-Badge */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-300">
              {name.trim()[0]?.toUpperCase()}
            </div>
            <span className="font-semibold text-zinc-200">{name.trim()}</span>
          </div>
          <button
            onClick={() => setStep("name")}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Ändern
          </button>
        </div>

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
              ? "border-amber-700/80 bg-amber-950/20"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <button
            onClick={() => { setMode(mode === "create" ? "idle" : "create"); setFehler(null); }}
            className="flex w-full items-center gap-4 p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
              <Plus className="h-6 w-6 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-100">Raum erstellen</p>
              <p className="text-sm text-zinc-500">Du bist der Host und wählst das Spiel</p>
            </div>
          </button>

          {mode === "create" && (
            <div className="border-t border-zinc-800 p-5 pt-4">
              <p className="mb-4 text-sm text-zinc-400">
                Ein 4-stelliger Code wird generiert — teile ihn mit deinen Freunden.
              </p>
              <button
                onClick={raumErstellen}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 text-lg font-bold text-zinc-950 transition-all active:scale-95 disabled:opacity-60 hover:bg-amber-300"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />}
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
            onClick={() => { setMode(mode === "join" ? "idle" : "join"); setFehler(null); }}
            className="flex w-full items-center gap-4 p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-700/50">
              <LogIn className="h-6 w-6 text-zinc-300" />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-100">Raum beitreten</p>
              <p className="text-sm text-zinc-500">Code vom Host eingeben</p>
            </div>
          </button>

          {mode === "join" && (
            <div className="border-t border-zinc-800 p-5 pt-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
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
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                Beitreten
              </button>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
