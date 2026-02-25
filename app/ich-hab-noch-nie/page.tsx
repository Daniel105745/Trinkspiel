"use client";

import { useState } from "react";
import { Beer, ThumbsUp, Send, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type IchHabNochNie } from "@/lib/supabase";

export default function IchHabNochNie() {
  const [karte, setKarte] = useState<IchHabNochNie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [abgestimmt, setAbgestimmt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  // Einreichen-Form
  const [formOffen, setFormOffen] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const [sendingForm, setSendingForm] = useState(false);
  const [formErfolg, setFormErfolg] = useState(false);

  async function nächsteKarte() {
    setIsLoading(true);
    setFehler(null);
    setAbgestimmt(false);

    const { data, error } = await supabase
      .from("ich_hab_noch_nie")
      .select("id, text, schon_getan_count, noch_nie_count")
      .neq("id", karte?.id ?? 0)
      .limit(10);

    if (error || !data || data.length === 0) {
      setFehler("Keine Einträge gefunden. Füge zuerst Sätze in die Datenbank ein.");
    } else {
      setKarte(data[Math.floor(Math.random() * data.length)] as IchHabNochNie);
    }
    setIsLoading(false);
  }

  async function abstimmen(feld: "schon_getan_count" | "noch_nie_count") {
    if (!karte || abgestimmt) return;
    const neuerWert = karte[feld] + 1;
    setKarte({ ...karte, [feld]: neuerWert });
    setAbgestimmt(true);
    await supabase
      .from("ich_hab_noch_nie")
      .update({ [feld]: neuerWert })
      .eq("id", karte.id);
  }

  async function einreichen() {
    if (!eingabe.trim()) return;
    setSendingForm(true);
    const { error } = await supabase
      .from("ich_hab_noch_nie")
      .insert({ text: eingabe.trim(), schon_getan_count: 0, noch_nie_count: 0 });

    if (!error) {
      setFormErfolg(true);
      setEingabe("");
      setTimeout(() => setFormErfolg(false), 3000);
    }
    setSendingForm(false);
  }

  const totalStimmen = (karte?.schon_getan_count ?? 0) + (karte?.noch_nie_count ?? 0);

  return (
    <GameLayout title="Ich hab noch nie...">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Fehlermeldung */}
        {fehler && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-red-300 text-sm">{fehler}</p>
          </div>
        )}

        {/* Karte */}
        {karte ? (
          <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <p className="text-center text-base text-zinc-500 font-medium mb-3">
              Ich hab noch nie...
            </p>
            <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
              {karte.text}
            </p>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
            <Beer className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
            <p className="text-zinc-500">Drück "Nächste Runde" um zu starten!</p>
          </div>
        )}

        {/* Abstimmen */}
        {karte && (
          <div className="flex gap-3">
            <button
              onClick={() => abstimmen("schon_getan_count")}
              disabled={abgestimmt}
              className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-amber-800/60 bg-amber-950/40 py-4 transition-all active:scale-95 disabled:opacity-60 hover:bg-amber-950/70"
            >
              <Beer className="mb-1 h-6 w-6 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">Schon getan</span>
              {abgestimmt && (
                <span className="mt-1 text-xs text-amber-500">
                  {karte.schon_getan_count} ({totalStimmen > 0 ? Math.round((karte.schon_getan_count / totalStimmen) * 100) : 0}%)
                </span>
              )}
            </button>
            <button
              onClick={() => abstimmen("noch_nie_count")}
              disabled={abgestimmt}
              className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-emerald-800/60 bg-emerald-950/40 py-4 transition-all active:scale-95 disabled:opacity-60 hover:bg-emerald-950/70"
            >
              <ThumbsUp className="mb-1 h-6 w-6 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Noch nie!</span>
              {abgestimmt && (
                <span className="mt-1 text-xs text-emerald-500">
                  {karte.noch_nie_count} ({totalStimmen > 0 ? Math.round((karte.noch_nie_count / totalStimmen) * 100) : 0}%)
                </span>
              )}
            </button>
          </div>
        )}

        {/* Nächste Runde */}
        <button
          onClick={nächsteKarte}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-5 text-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-emerald-400"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          {karte ? "Nächste Runde" : "Los geht's!"}
        </button>

        {/* Einreichen-Accordion */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <button
            onClick={() => setFormOffen(!formOffen)}
            className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span>Eigenen Satz einreichen</span>
            {formOffen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {formOffen && (
            <div className="flex gap-2 border-t border-zinc-800 p-4">
              <input
                type="text"
                value={eingabe}
                onChange={(e) => setEingabe(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && einreichen()}
                placeholder="...in einem Flugzeug geweint."
                className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={einreichen}
                disabled={sendingForm || !eingabe.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 transition-colors hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          {formErfolg && (
            <p className="pb-3 text-center text-sm text-emerald-400">
              Erfolgreich eingereicht! ✓
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
