"use client";

import { useState } from "react";
import { HelpCircle, Flame, AlertCircle } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { supabase, type Aufgabe } from "@/lib/supabase";

type Typ = "wahrheit" | "pflicht";

async function ladeKarte(typ: Typ, aktuelleId: number | null) {
  const { data, error } = await supabase
    .from("aufgaben")
    .select("id, text, typ")
    .eq("typ", typ)
    .neq("id", aktuelleId ?? 0)
    .limit(10);

  if (error || !data || data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)] as Aufgabe;
}

export default function WahrheitOderPflicht() {
  const [karte, setKarte] = useState<Aufgabe | null>(null);
  const [aktiverTyp, setAktiverTyp] = useState<Typ | null>(null);
  const [isLoading, setIsLoading] = useState<Typ | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function ziehe(typ: Typ) {
    setIsLoading(typ);
    setFehler(null);
    const neueKarte = await ladeKarte(typ, karte?.id ?? null);
    if (!neueKarte) {
      setFehler(`Keine ${typ === "wahrheit" ? "Wahrheitsfragen" : "Pflichtaufgaben"} in der Datenbank.`);
    } else {
      setKarte(neueKarte);
      setAktiverTyp(typ);
    }
    setIsLoading(null);
  }

  return (
    <GameLayout title="Wahrheit oder Pflicht">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between">
        {/* Karten-Bereich */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
          {fehler ? (
            <div className="flex w-full items-start gap-3 rounded-2xl border border-red-800 bg-red-950/50 p-6">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="text-red-300">{fehler}</p>
            </div>
          ) : karte ? (
            <>
              {/* Typ-Badge */}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${
                  aktiverTyp === "wahrheit"
                    ? "bg-sky-900/60 text-sky-300"
                    : "bg-orange-900/60 text-orange-300"
                }`}
              >
                {aktiverTyp === "wahrheit" ? (
                  <HelpCircle className="h-4 w-4" />
                ) : (
                  <Flame className="h-4 w-4" />
                )}
                {aktiverTyp === "wahrheit" ? "Wahrheit" : "Pflicht"}
              </div>
              {/* Karte */}
              <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                <p className="text-center text-2xl font-semibold leading-relaxed text-zinc-100">
                  {karte.text}
                </p>
              </div>
            </>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
              <p className="text-zinc-500 text-lg">
                Wähle <span className="text-sky-400 font-semibold">Wahrheit</span> oder{" "}
                <span className="text-orange-400 font-semibold">Pflicht</span>
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => ziehe("wahrheit")}
            disabled={isLoading !== null}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-sky-400"
          >
            <HelpCircle className={`h-5 w-5 ${isLoading === "wahrheit" ? "animate-spin" : ""}`} />
            Wahrheit
          </button>
          <button
            onClick={() => ziehe("pflicht")}
            disabled={isLoading !== null}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 hover:bg-orange-400"
          >
            <Flame className={`h-5 w-5 ${isLoading === "pflicht" ? "animate-spin" : ""}`} />
            Pflicht
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
