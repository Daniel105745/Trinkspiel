# UI Refresh – Refined Minimal Design

**Datum:** 2026-03-30
**Status:** Approved
**Scope:** Startseite + GameLayout (alle Spielseiten indirekt)

---

## Kontext

Die App hat nach mehreren Design-Iterationen (CHANGELOG 2026-03-27) eine solide Basis: 52px Touch-Targets, 18px Mindestschrift, Glassmorphism-Karten. Die Spielseiten selbst sind gut. Die Startseite wirkt visuell überladen durch bunte Gradient-Hintergründe pro Karte, einen großen Glow-Blob, farbige Borders und einen schweren Cyan-Online-Button.

**Gewählte Richtung:** Refined Minimal – einheitliche neutrale Karten, Farbe nur als dünner Top-Stripe, große Emojis statt Icon-Boxen, ruhigerer Hero.

---

## Änderungen

### 1. `app/page.tsx` – Startseite

#### Spielkarten (2×2 Grid)
- **Entfernen:** `cardGradient` und per-Game `border` aus dem `SPIELE`-Array
- **Hintergrund:** `bg-white/[0.05]` (einheitlich für alle 4 Karten, statt unterschiedliche Gradienten)
- **Border:** `border-white/[0.10]` (einheitlich, statt farbige per-Game-Border)
- **Farbiger Akzent:** absolut positionierter `h-[2px]`-Stripe oben, Farbe per Spiel (wie auf Spielseiten bereits vorhanden)
- **Icon:** `Icon`-Komponente + Gradient-Box entfernen → großes Emoji direkt (`text-3xl`)
- **Emojis:**
  - Wahrheit oder Pflicht → `🤔`
  - Ich hab noch nie → `⚡`
  - Am ehesten würde... → `🙋`
  - Imposter → `🕵️`
- **Titel:** `text-[20px] font-black text-white` (von 18px auf 20px für bessere Hierarchie gegenüber Subtitle)
- **Subtitle:** bleibt `text-[18px] font-semibold text-zinc-400`

#### Hero-Bereich
- **Logo-Box:** Gradient `from-violet-500 to-pink-500` → neutrales `bg-white/[0.07] border border-white/[0.12]`; kein Glow-Blob (`absolute inset-0 scale-[2.2] ... blur-3xl` entfernen)
- **App-Titel:** "Trinkspiel App" → "Trinkspiel" (kürzer, selbsterklärender)
- **Spacing:** `pt-16 pb-10` → `pt-10 pb-8` (Platz sparen ohne Enge)
- **Hintergrund-Glow:** `radial-gradient` Overlay entfernen (das violette Blob oben)

#### Online-Button
- **Vorher:** `bg-gradient-to-r from-sky-400 to-cyan-300` mit starkem `box-shadow` Cyan-Glow
- **Nachher:** `border border-white/[0.15] bg-white/[0.06] text-white` – cleaner Border-Button, kein Gradient, kein Glow
- Schrift und Icon bleiben, nur der Look wird ruhiger

#### Divider "ODER"
- Bleibt unverändert

#### Footer
- Bleibt unverändert

---

### 2. `components/GameLayout.tsx` – Navigation

- **Nav padding:** `pt-12 pb-8` → `pt-8 pb-6` (mehr Content-Raum, weniger Leerraum oben)
- Alles andere bleibt unverändert (Pills, Counter, Zurück-Button)

---

### 3. Spielseiten – keine Änderungen

Alle Spielseiten (`wahrheit-oder-pflicht`, `ich-hab-noch-nie`, `wer-wuerde-eher`, `imposter`, `buzzer`, `online/`) behalten ihr aktuelles Design. Die Glassmorphism-Karten auf den Spielseiten passen bereits zur neuen Richtung.

---

## Dateien

| Datei | Änderung |
|---|---|
| `app/page.tsx` | Karten, Hero, Online-Button |
| `components/GameLayout.tsx` | Nav-Padding |

---

## Nicht im Scope

- Spielseiten-Inhalte
- Online-Modus-Seiten
- Supabase-Daten oder Spiellogik
- Neue Animationen (bestehende bleiben)
