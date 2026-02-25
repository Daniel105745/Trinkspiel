"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, LogIn, Loader2, ArrowRight, AlertCircle } from "lucide-react";
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
      id: code, host_id: hostId,
      current_card_id: null, current_card_text: null, current_game: null, current_meta: {},
    });
    if (error) { setFehler("Fehler beim Erstellen. Nochmal versuchen."); setIsLoading(false); return; }
    localStorage.setItem(`trinkspiel_host_${code}`, hostId);
    router.push(`/online/${code}`);
  }

  async function raumBeitreten() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) { setFehler("Bitte einen 4-stelligen Code eingeben."); return; }
    setIsLoading(true); setFehler(null);
    const { data, error } = await supabase.from("rooms").select("id").eq("id", code).single();
    if (error || !data) { setFehler(`Raum "${code}" nicht gefunden.`); setIsLoading(false); return; }
    router.push(`/online/${code}`);
  }

  // ── Schritt 1: Name ──────────────────────────────────────────────────────
  if (step === "name") {
    return (
      <GameLayout
        title="Online Multiplayer"
        titleIcon={<Globe className="h-4 w-4 text-sky-400" />}
        glowColor="rgba(14,165,233,0.10)"
      >
        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-sky-400 to-cyan-300 text-4xl shadow-xl">
              👤
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">Wie heißt du?</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">
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
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-4 text-center text-xl font-black text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={nameBestaetigen}
            disabled={!name.trim()}
            className="flex w-full max-w-sm items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-400 to-cyan-300 py-5 text-xl font-black text-white shadow-lg shadow-sky-900/40 transition-all active:scale-95 disabled:opacity-40"
          >
            Weiter <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </GameLayout>
    );
  }

  // ── Schritt 2: Raum erstellen / beitreten ────────────────────────────────
  return (
    <GameLayout
      title="Online Multiplayer"
      titleIcon={<Globe className="h-4 w-4 text-sky-400" />}
      glowColor="rgba(14,165,233,0.10)"
    >
      <div className="flex flex-col gap-4">
        {/* Name Badge */}
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-900/60 text-sm font-black text-sky-300">
              {name.trim()[0]?.toUpperCase()}
            </div>
            <span className="font-black text-white">{name.trim()}</span>
          </div>
          <button onClick={() => setStep("name")} className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
            Ändern
          </button>
        </div>

        {fehler && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm font-bold text-red-300">{fehler}</p>
          </div>
        )}

        {/* Raum erstellen */}
        <div className={`rounded-3xl border transition-all ${mode === "create" ? "border-sky-700/60 bg-sky-950/20" : "border-white/[0.08] bg-white/[0.04]"}`}>
          <button onClick={() => { setMode(mode === "create" ? "idle" : "create"); setFehler(null); }} className="flex w-full items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-white">Raum erstellen</p>
              <p className="text-sm font-semibold text-zinc-400">Du bist der Host und wählst das Spiel</p>
            </div>
          </button>
          {mode === "create" && (
            <div className="border-t border-white/[0.06] p-5 pt-4">
              <p className="mb-4 text-sm font-semibold text-zinc-400">Ein 4-stelliger Code wird generiert — teile ihn mit deinen Freunden.</p>
              <button onClick={raumErstellen} disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-300 py-4 text-lg font-black text-white transition-all active:scale-95 disabled:opacity-60">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />}
                Raum erstellen
              </button>
            </div>
          )}
        </div>

        {/* Raum beitreten */}
        <div className={`rounded-3xl border transition-all ${mode === "join" ? "border-white/20 bg-white/[0.06]" : "border-white/[0.08] bg-white/[0.04]"}`}>
          <button onClick={() => { setMode(mode === "join" ? "idle" : "join"); setFehler(null); }} className="flex w-full items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
              <LogIn className="h-6 w-6 text-zinc-300" />
            </div>
            <div className="text-left">
              <p className="font-black text-white">Raum beitreten</p>
              <p className="text-sm font-semibold text-zinc-400">Code vom Host eingeben</p>
            </div>
          </button>
          {mode === "join" && (
            <div className="border-t border-white/[0.06] p-5 pt-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && raumBeitreten()}
                placeholder="Z.B. A3K7"
                maxLength={4}
                className="mb-4 w-full rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-center text-2xl font-black uppercase tracking-widest text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-white/30"
              />
              <button onClick={raumBeitreten} disabled={isLoading || joinCode.length !== 4} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-lg font-black text-zinc-950 transition-all active:scale-95 disabled:opacity-40">
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
