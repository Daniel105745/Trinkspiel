"use client";

import { useState, useEffect } from "react";
import { SkipForward, Beer, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import GameLayout from "@/components/GameLayout";
import { supabase, type IchHabNochNie } from "@/lib/supabase";
import { ICH_HAB_NOCH_NIE_18_PLUS } from "@/lib/fragenData";

const LOCAL_18: IchHabNochNie[] = ICH_HAB_NOCH_NIE_18_PLUS.map((text, i) => ({
  id: -(i + 1), text: `...${text}`, schon_getan_count: 0, noch_nie_count: 0,
}));

export default function IchHabNochNie() {
  const [sbCards, setSbCards] = useState<IchHabNochNie[]>([]);
  const [cards, setCards] = useState<IchHabNochNie[]>([]);
  const [idx, setIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [inp, setInp] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [modus, setModus] = useState<"normal" | "18+">("normal");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("ich_hab_noch_nie").select("id, text, schon_getan_count, noch_nie_count");
        if (!error) setSbCards((data as IchHabNochNie[]) ?? []);
      } catch { /* */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    let pool = [...sbCards];
    if (modus === "18+") pool = [...pool, ...LOCAL_18];
    if (pool.length) { setCards([...pool].sort(() => Math.random() - 0.5)); setIdx(0); setDone(false); }
  }, [modus, sbCards]);

  const next = () => { setIdx(i => (i + 1) % Math.max(cards.length, 1)); setDone(false); };

  async function handleDone() {
    if (done) return;
    setDone(true); setFlash(true); setTimeout(() => setFlash(false), 350);
    const c = cards[idx];
    if (c && c.id > 0) {
      try { await supabase.from("ich_hab_noch_nie").update({ schon_getan_count: c.schon_getan_count + 1 }).eq("id", c.id); } catch {}
    }
  }

  async function submit() {
    if (!inp.trim()) return;
    setSending(true); setErr(null);
    const { error } = await supabase.from("ich_hab_noch_nie").insert({ text: inp.trim(), schon_getan_count: 0, noch_nie_count: 0 });
    if (!error) { setOk(true); setInp(""); setTimeout(() => setOk(false), 3000); } else { setErr("Fehlgeschlagen. Nochmal versuchen."); }
    setSending(false);
  }

  const sw = useSwipeable({ onSwipedLeft: next, onSwipedRight: next, preventScrollOnSwipe: true });
  const card = idx >= 0 ? cards[idx] : null;

  return (
    <GameLayout
      title="Ich hab noch nie"
      titleIcon={<span className="text-sm leading-none">🙊</span>}
      glowColor="rgba(14,165,233,0.07)"
      accentClass="accent-top-sky"
      counter={cards.length > 0 ? `${idx + 1}/${cards.length}` : ""}
    >
      <div className="flex flex-1 flex-col justify-between gap-3">
        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center py-1">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-2xl anim-shimmer bg-white/5" />
              <p className="text-[13px] font-extrabold text-zinc-500">Karten werden geladen…</p>
            </div>
          ) : !card ? (
            <p className="text-[14px] font-extrabold text-zinc-500">Keine Karten gefunden.</p>
          ) : (
            <div key={idx} {...sw} style={{ touchAction: "pan-y" }}
              className="anim-slide relative w-full overflow-hidden rounded-[var(--r-xl)] select-none glass-card">
              <div className="accent-top-sky" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/12 border border-sky-500/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-sky-300">
                    <span className="text-sm">🙊</span>Sozial
                  </span>
                  <span className="text-[11px] font-bold text-zinc-600 tabular-nums">{idx + 1}/{cards.length}</span>
                </div>

                <p className="text-center text-[13px] font-extrabold text-sky-400 uppercase tracking-wider mb-1.5">
                  Ich hab noch nie…
                </p>
                <p className="text-center text-[20px] font-extrabold text-white leading-snug min-h-[72px] flex items-center justify-center">
                  {card.text}
                </p>

                {done && (
                  <div className="mt-4 anim-fade rounded-[var(--r-md)] bg-amber-500/10 border border-amber-500/15 px-4 py-2.5 text-center">
                    <p className="text-[13px] font-extrabold text-amber-400">🍺 {card.schon_getan_count + 1}× schon getan – trinken!</p>
                  </div>
                )}

                <div className="swipe-hint"><div className="line" /><span className="label">Swipe für nächste</span><div className="line" /></div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Controls ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          <button onClick={() => setModus(m => m === "normal" ? "18+" : "normal")}
            className={`toggle-18 ${modus === "18+" ? "on" : "off"}`}>
            🔞 {modus === "18+" ? "18+ aktiv – Deaktivieren" : "18+ Modus freischalten"}
          </button>

          <div className="btn-row">
            <button onClick={handleDone} disabled={done}
              className={`btn-secondary !border-amber-900/35 disabled:opacity-40 ${flash ? "!bg-amber-700/50 !text-amber-200" : "!text-amber-300"}`}>
              <Beer className="h-[18px] w-[18px]" />Schon getan
            </button>
            <button onClick={next}
              className="btn-primary bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_20px_rgba(14,165,233,0.35)]">
              <SkipForward className="h-[18px] w-[18px]" />Nächste
            </button>
          </div>

          {/* submit accordion */}
          <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)]">
            <button onClick={() => setFormOpen(!formOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-extrabold text-zinc-500 hover:text-zinc-300 transition-colors">
              <span>Eigenen Satz einreichen</span>
              {formOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {formOpen && (
              <div className="flex gap-2 border-t border-white/[0.05] p-2.5">
                <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder="…in einem Flugzeug geweint."
                  className="input flex-1 !py-2.5 !text-[13px]" />
                <button onClick={submit} disabled={sending || !inp.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--r-sm)] bg-sky-500 active:scale-[0.93] disabled:opacity-40">
                  <Send className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            )}
            {ok && <p className="pb-2.5 text-center text-[12px] font-extrabold text-emerald-400">✓ Eingereicht!</p>}
            {err && <p className="pb-2.5 text-center text-[12px] font-extrabold text-red-400">{err}</p>}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
