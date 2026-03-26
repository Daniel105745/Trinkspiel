# CLAUDE.md – Mein Trinkspiel

## Pflichtregeln für Claude

- **Lies diese Datei ZUERST** – immer, vor jeder Aktion.
- **Kein Erkunden des Projektbaums** – alles Nötige steht hier.
- **Lies NUR Dateien, die für die aktuelle Aufgabe relevant sind.**
- **Kurze Antworten** – kein unnötiges Erklären, kein Padding.
- **Kein Explore-Agent** für bekannte Strukturen – direkt per Read/Grep zugreifen.

---

## Tech-Stack

| Technologie | Zweck |
|---|---|
| Next.js 16 (App Router) | Framework |
| React 19 | UI |
| TypeScript | Sprache |
| Tailwind CSS v4 | Styling (kein `tailwind.config.js`, nutzt `@import "tailwindcss"`) |
| Supabase | Datenbank + Realtime |
| Lucide React | Icons |
| react-swipeable | Swipe-Gesten auf Karten |
| Web Audio API | Sound-Effekte (keine externen Dateien) |

---

## Projektstruktur

```
/mein-trinkspiel
├── app/
│   ├── page.tsx                        # Startseite – Spielauswahl-Grid
│   ├── layout.tsx                      # Root Layout: Nunito-Font, lang="de", max-w-[430px], dark
│   ├── globals.css                     # Tailwind v4 import, Dark-Mode-Hintergrund (#0d0f1e)
│   │
│   ├── wahrheit-oder-pflicht/
│   │   └── page.tsx                    # Wahrheit oder Pflicht – Karten aus Supabase + lokale 18+ Daten
│   │
│   ├── ich-hab-noch-nie/
│   │   └── page.tsx                    # Ich hab noch nie – Supabase + lokale 18+ Daten, Formular zum Einreichen
│   │
│   ├── wer-wuerde-eher/
│   │   └── page.tsx                    # Wer würde eher – Setup-Phase (Spieler eingeben), dann Spiel
│   │
│   ├── imposter/
│   │   └── page.tsx                    # Imposter – vollständig lokal (keine Supabase), Wortkategorien, Abstimmung
│   │
│   ├── buzzer/
│   │   └── page.tsx                    # Buzzer – Reaktionszeit-Spiel
│   │
│   ├── online/
│   │   ├── page.tsx                    # Online-Lobby – Name eingeben, Raum erstellen/beitreten
│   │   └── [code]/
│   │       └── page.tsx                # Online-Raum – Realtime via Supabase Presence + postgres_changes
│   │
│   └── components/
│       └── GameLayout.tsx              # Wiederverwendbares Layout: Header-Pill, Titel, Glow, Counter
│
├── lib/
│   ├── supabase.ts                     # Supabase-Client + Typen: Aufgabe, IchHabNochNie, Room
│   └── sounds.ts                       # Web Audio API: playTick, playCountdownEnd, playWin, playLose, playReveal
│
├── CLAUDE.md                           # Diese Datei
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Supabase-Tabellen

| Tabelle | Felder | Verwendung |
|---|---|---|
| `aufgaben` | `id, text, typ` | Karten für Wahrheit/Pflicht (`wahrheit`, `pflicht`), Wer würde eher (`wer_wuerde_eher`), Buzzer (`buzzer`) |
| `ich_hab_noch_nie` | `id, text, schon_getan_count, noch_nie_count` | Karten für Ich hab noch nie |
| `rooms` | `id, created_at, current_card_id, current_card_text, current_game, current_meta, host_id` | Online-Multiplayer-Räume |

---

## Spieldaten – wo sie liegen

### Aus Supabase geladen (remote)
- `wahrheit-oder-pflicht/page.tsx` → Tabelle `aufgaben`, typ `wahrheit` oder `pflicht`
- `ich-hab-noch-nie/page.tsx` → Tabelle `ich_hab_noch_nie`
- `wer-wuerde-eher/page.tsx` → Tabelle `aufgaben`, typ `wer_wuerde_eher`
- `online/[code]/page.tsx` → alle Tabellen je nach aktivem Spiel

### Lokal hardcoded (im Code)
- `imposter/page.tsx` → Wortkategorien (`KATEGORIEN`), Hilfswörter (`HILFSWÖRTER`)
- `online/[code]/page.tsx` → `IMPOSTER_WÖRTER`, `IMPOSTER_HILFSWÖRTER`
- `wahrheit-oder-pflicht/page.tsx` → `WAHRHEIT_18PLUS[]`, `PFLICHT_18PLUS[]` (je 52 Einträge, IDs negativ)
- `ich-hab-noch-nie/page.tsx` → `ICH_HAB_NOCH_NIE_18PLUS[]` (52 Einträge, IDs negativ)
- `wer-wuerde-eher/page.tsx` → `WER_WUERDE_EHER_18PLUS[]` (52 Einträge, IDs negativ)

> Lokale 18+-Daten haben **negative IDs** (z.B. -1, -2, …) um Konflikte mit Supabase-IDs zu vermeiden.

---

## Design-Konventionen

- **Hintergrund:** `#0d0f1e` (via CSS-Variable)
- **Karten:** `bg-white/[0.07] border border-white/[0.18] backdrop-blur-xl rounded-3xl`
- **Farbschema pro Spiel:**
  - Wahrheit oder Pflicht → Violet/Pink
  - Ich hab noch nie → Sky/Cyan
  - Wer würde eher → Emerald/Green
  - Imposter → Red/Orange
  - Online/Allgemein → Amber/Orange
- **Buttons:** `py-4 font-black rounded-2xl`, großer Touch-Target
- **Gradient-Balken oben auf Karten:** `h-[3px]` absolut positioniert
- **Mobile-First:** Container max-w-[430px], safe-area-padding

---

## Online-Modus – wichtige Details

- **Spieler-ID:** `sessionStorage['trinkspiel_userId']` (UUID, einmalig pro Session)
- **Spielername:** `sessionStorage['trinkspiel_name']`
- **Host-Status:** `localStorage['trinkspiel_host_{code}']` (host_id UUID)
- **Sync:** Supabase `postgres_changes` (UPDATE auf `rooms`) + Presence-Tracking
- **Karte ziehen:** Nur der Host kann → schreibt in `rooms.current_card_text` + `current_meta`
- **Spielerwahl:** Bei jeder Karte (außer Imposter/Wer-würde-eher) wird ein zufälliger Spieler in `currentMeta.selectedPlayer` gespeichert; kein Doppelpick hintereinander (`lastSelectedPlayerRef`)
- **Raum-Cleanup:** Räume älter als 24h werden automatisch gelöscht; Host-Disconnect löscht den Raum

---

## Env-Variablen

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Definiert in `.env.local` (nicht im Repo).
