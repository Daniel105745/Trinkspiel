# CLAUDE.md – Mein Trinkspiel

## Pflichtregeln (gelten für JEDE Sitzung)

- **Lies IMMER zuerst CLAUDE.md UND CHANGELOG.md** bevor du irgendetwas machst.
- **Kein Erkunden des Projektbaums** – alles Nötige steht hier.
- **Lies NUR Dateien, die für die aktuelle Aufgabe relevant sind.**
- **Kurze Antworten** – kein unnötiges Padding, kein Wiederholen.
- **Nach JEDER Änderung CHANGELOG.md aktualisieren.**

---

## Tech-Stack

| Technologie | Zweck |
|---|---|
| Next.js 16 (App Router) | Framework |
| React 19 | UI |
| TypeScript | Sprache |
| Tailwind CSS v4 | Styling – kein `tailwind.config.js`, nutzt `@import "tailwindcss"` |
| Supabase | Datenbank + Realtime (postgres_changes + Presence) |
| Lucide React | Icons |
| react-swipeable | Swipe-Gesten auf Karten |
| Web Audio API | Sound-Effekte (keine externen Audiodateien) |

---

## Projektstruktur

```
/mein-trinkspiel
├── CLAUDE.md                           # Diese Datei – immer zuerst lesen
├── CHANGELOG.md                        # Änderungsprotokoll – nach jeder Änderung updaten
│
├── app/
│   ├── page.tsx                        # Startseite – Spielauswahl-Grid (4 Karten + Online-Button)
│   ├── layout.tsx                      # Root Layout: Nunito-Font, lang="de", max-w-[430px], dark
│   ├── globals.css                     # Tailwind v4 import, Dark-Mode-Hintergrund #0d0f1e
│   │
│   ├── wahrheit-oder-pflicht/
│   │   └── page.tsx                    # Wahrheit oder Pflicht – Supabase + WAHRHEIT/PFLICHT_18PLUS[], 18+ Toggle
│   │
│   ├── ich-hab-noch-nie/
│   │   └── page.tsx                    # Ich hab noch nie – Supabase + ICH_HAB_NOCH_NIE_18PLUS[], 18+ Toggle, Einreich-Formular
│   │
│   ├── wer-wuerde-eher/
│   │   └── page.tsx                    # Wer würde eher – Setup-Phase (Spieler), dann Spiel; VS-Header in Karte; 18+ Toggle
│   │
│   ├── imposter/
│   │   └── page.tsx                    # Imposter – vollständig lokal, Wortkategorien, Rollen, Abstimmung, Punkte
│   │
│   ├── buzzer/
│   │   └── page.tsx                    # Buzzer – Reaktionszeit-Spiel mit Rating
│   │
│   ├── online/
│   │   ├── page.tsx                    # Online-Lobby – Name eingeben, Raum erstellen/beitreten (4-Buchstaben-Code)
│   │   └── [code]/
│   │       └── page.tsx                # Online-Raum – Realtime-Sync, Host-Steuerung, alle Spiele, 18+ Toggle
│   │
│   └── components/
│       └── GameLayout.tsx              # Wiederverwendbares Layout: Header-Pill, Titel, Glow, Counter
│
├── lib/
│   ├── supabase.ts                     # Supabase-Client + Typen: Aufgabe, IchHabNochNie, Room
│   ├── sounds.ts                       # Web Audio API: playTick, playCountdownEnd, playWin, playLose, playReveal
│   └── fragenData.ts                   # Geteilte 18+ Fragendaten (4 Arrays als string[]) – genutzt von Online-Modus
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Supabase-Tabellen

| Tabelle | Felder | Verwendung |
|---|---|---|
| `aufgaben` | `id, text, typ` | Karten für `wahrheit`, `pflicht`, `wer_wuerde_eher`, `buzzer` |
| `ich_hab_noch_nie` | `id, text, schon_getan_count, noch_nie_count` | Karten für Ich hab noch nie |
| `rooms` | `id, created_at, current_card_id, current_card_text, current_game, current_meta, host_id` | Online-Räume |

---

## Spieldaten – wo sie liegen

### Aus Supabase (remote)
- `wahrheit-oder-pflicht/page.tsx` → `aufgaben` typ `wahrheit`/`pflicht`
- `ich-hab-noch-nie/page.tsx` → `ich_hab_noch_nie`
- `wer-wuerde-eher/page.tsx` → `aufgaben` typ `wer_wuerde_eher`
- `online/[code]/page.tsx` → alle Tabellen je nach aktivem Spiel

### Lokal hardcoded

| Datei | Konstante | Inhalt |
|---|---|---|
| `lib/fragenData.ts` | `WAHRHEIT_18_PLUS` | 52 Wahrheit-Fragen (18+), string[] |
| `lib/fragenData.ts` | `PFLICHT_18_PLUS` | 52 Pflicht-Aufgaben (18+), string[] |
| `lib/fragenData.ts` | `ICH_HAB_NOCH_NIE_18_PLUS` | 52 Aussagen (18+), string[] |
| `lib/fragenData.ts` | `WER_WUERDE_EHER_18_PLUS` | 53 Fragen (18+), string[] |
| `wahrheit-oder-pflicht/page.tsx` | `WAHRHEIT_18PLUS`, `PFLICHT_18PLUS` | Typed `Aufgabe[]` mit neg. IDs (offline) |
| `ich-hab-noch-nie/page.tsx` | `ICH_HAB_NOCH_NIE_18PLUS` | Typed `IchHabNochNie[]` mit neg. IDs (offline) |
| `wer-wuerde-eher/page.tsx` | `WER_WUERDE_EHER_18PLUS` | Typed `Aufgabe[]` mit neg. IDs (offline) |
| `imposter/page.tsx` | `KATEGORIEN`, `HILFSWÖRTER` | Wortkategorien + Hilfswörter |
| `online/[code]/page.tsx` | `IMPOSTER_WÖRTER`, `IMPOSTER_HILFSWÖRTER` | Imposter-Wörter für Online-Modus |

> Offline-18+-Arrays nutzen **negative IDs** (z.B. -1, -2) um Konflikte mit Supabase-IDs zu vermeiden.

---

## Design-Konventionen

- **Hintergrund:** `#0d0f1e`
- **Karten:** `bg-white/[0.07] border border-white/[0.18] backdrop-blur-xl rounded-3xl`
- **Gradient-Balken oben:** `h-[3px]` absolut positioniert
- **Farbschema:**
  - Wahrheit oder Pflicht → Violet/Pink
  - Ich hab noch nie → Sky/Cyan
  - Wer würde eher → Emerald/Green
  - Imposter → Red/Orange
  - Online/Allgemein → Amber/Orange
- **Buttons:** `py-4 font-black rounded-2xl`, großer Touch-Target
- **Mobile-First:** Container max-w-[430px], safe-area-padding

---

## Online-Modus – wichtige Details

| Schlüssel | Storage | Wert |
|---|---|---|
| `trinkspiel_userId` | sessionStorage | UUID pro Session |
| `trinkspiel_name` | sessionStorage | Spielername |
| `trinkspiel_host_{code}` | localStorage | host_id UUID (Host-Erkennung) |

- **Sync:** Supabase `postgres_changes` (UPDATE `rooms`) + Presence-Tracking
- **Karte ziehen:** Nur Host → schreibt `current_card_text` + `current_meta` in DB
- **Startspieler:** Wird random beim Spielstart in `current_meta.selectedPlayer` gespeichert; kein Doppelpick (`lastSelectedPlayerRef`)
- **18+ Modus:** Host togglet → `current_meta.mode18Plus = "true/false"` → alle Spieler sehen Status
- **Ich hab noch nie:** Kein Spielername (macht keinen Sinn, alle machen mit)
- **Wer würde eher:** VS-Display (`player1`/`player2`) innerhalb der Karte
- **Raum-Cleanup:** Räume >24h werden gelöscht; Host-Disconnect löscht Raum

---

## Env-Variablen

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Definiert in `.env.local` (nicht im Repo).
