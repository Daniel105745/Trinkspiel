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
  const [err, setErr] = useState<string | null>(null);

  function nameOk() {
    const t = name.trim();
    if (!t) return;
    sessionStorage.setItem("trinkspiel_name", t);
    setStep("action");
    setErr(null);
  }

  async function create() {
    setIsLoading(true); setErr(null);
    const code = generateCode();
    const hostId = crypto.randomUUID();
    const { error } = await supabase.from("rooms").insert({
      id: code, host_id: hostId,
      current_card_id: null, current_card_text: null, current_game: null, current_meta: {},
    });
    if (error) { setErr("Fehler beim Erstellen."); setIsLoading(false); return; }
    localStorage.setItem(`trinkspiel_host_${code}`, hostId);
    router.push(`/online/${code}`);
  }

  async function join() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) { setErr("Bitte 4-stelligen Code eingeben."); return; }
    setIsLoading(true); setErr(null);
    const { data, error } = await supabase.from("rooms").select("id").eq("id", code).single();
    if (error || !data) { setErr(`Raum "${code}" nicht gefunden.`); setIsLoading(false); return; }
    router.push(`/online/${code}`);
  }

  /* ═══ NAME ═══ */
  if (step === "name") {
    return (
      <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-3.5 w-3.5 text-sky-400" />}
        glowColor="rgba(14,165,233,0.08)" accentClass="accent-top-sky">
        <div className="flex flex-col items-center gap-5 pt-6">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-400 to-cyan-300 text-3xl shadow-lg">👤</div>
          </div>
          <div className="text-center">
            <h2 className="text-[22px] font-extrabold text-white">Wie heißt du?</h2>
            <p className="mt-0.5 text-[13px] font-semibold text-zinc-500">Dein Name wird allen Mitspielern angezeigt</p>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && nameOk()}
            placeholder="Dein Name…" maxLength={20} autoFocus
            className="input w-full max-w-sm text-center !text-[18px] !font-extrabold !py-3.5" />
          <button onClick={nameOk} disabled={!name.trim()}
            className="btn-primary w-full max-w-sm bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_20px_rgba(14,165,233,0.35)] disabled:opacity-40 !py-[14px] !text-[16px]">
            Weiter <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </GameLayout>
    );
  }

  /* ═══ ACTION ═══ */
  return (
    <GameLayout title="Online Multiplayer" titleIcon={<Globe className="h-3.5 w-3.5 text-sky-400" />}
      glowColor="rgba(14,165,233,0.08)" accentClass="accent-top-sky">
      <div className="flex flex-col gap-3">
        {/* name badge */}
        <div className="flex items-center justify-between rounded-[var(--r-md)] glass px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-900/50 text-[14px] font-extrabold text-sky-300">
              {name.trim()[0]?.toUpperCase()}
            </div>
            <span className="text-[15px] font-extrabold text-white">{name.trim()}</span>
          </div>
          <button onClick={() => setStep("name")} className="px-2 py-2 text-[13px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
            Ändern
          </button>
        </div>

        {err && (
          <div className="flex items-start gap-2.5 rounded-[var(--r-md)] border border-red-800/50 bg-red-950/35 p-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-[13px] font-bold text-red-300">{err}</p>
          </div>
        )}

        {/* create */}
        <div className={`rounded-[var(--r-xl)] border backdrop-blur-xl transition-all ${
          mode === "create" ? "border-sky-700/50 bg-sky-950/25 shadow-[0_0_20px_rgba(14,165,233,0.1)]" : "border-[var(--c-border-hi)] bg-[var(--c-surface)]"}`}>
          <button onClick={() => { setMode(mode === "create" ? "idle" : "create"); setErr(null); }}
            className="flex w-full items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-sky-400 to-cyan-300">
              <Plus className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="text-left">
              <p className="text-[15px] font-extrabold text-white">Raum erstellen</p>
              <p className="text-[12px] font-semibold text-zinc-500">Du bist Host und wählst das Spiel</p>
            </div>
          </button>
          {mode === "create" && (
            <div className="border-t border-white/[0.05] p-4 pt-3">
              <p className="mb-3 text-[13px] font-semibold text-zinc-500">Ein 4-stelliger Code wird generiert — teile ihn mit deinen Freunden.</p>
              <button onClick={create} disabled={isLoading}
                className="btn-primary w-full bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_20px_rgba(14,165,233,0.35)] disabled:opacity-50">
                {isLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Globe className="h-[18px] w-[18px]" />}
                Raum erstellen
              </button>
            </div>
          )}
        </div>

        {/* join */}
        <div className={`rounded-[var(--r-xl)] border backdrop-blur-xl transition-all ${
          mode === "join" ? "border-white/[0.18] bg-white/[0.07]" : "border-[var(--c-border-hi)] bg-[var(--c-surface)]"}`}>
          <button onClick={() => { setMode(mode === "join" ? "idle" : "join"); setErr(null); }}
            className="flex w-full items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.06]">
              <LogIn className="h-[18px] w-[18px] text-zinc-300" />
            </div>
            <div className="text-left">
              <p className="text-[15px] font-extrabold text-white">Raum beitreten</p>
              <p className="text-[12px] font-semibold text-zinc-500">Code vom Host eingeben</p>
            </div>
          </button>
          {mode === "join" && (
            <div className="border-t border-white/[0.05] p-4 pt-3">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                onKeyDown={e => e.key === "Enter" && join()} placeholder="Z.B. A3K7" maxLength={4}
                className="input mb-3 text-center !text-[22px] !font-extrabold uppercase tracking-[0.2em]" />
              <button onClick={join} disabled={isLoading || joinCode.length !== 4}
                className="btn-primary w-full bg-white !text-zinc-950 disabled:opacity-40">
                {isLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <LogIn className="h-[18px] w-[18px]" />}
                Beitreten
              </button>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
