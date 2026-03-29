# CHANGELOG – Mein Trinkspiel

---

## [2026-03-30] – UI Refresh: Spielauswahl Online-Lobby einheitlich

### Änderungen
- **`app/online/[code]/page.tsx`:** Spielauswahl-Karten im Lobby auf neues Design umgestellt – neutrales Glassmorphism (`bg-white/[0.07] border-white/[0.18] backdrop-blur-xl`), farbiger 2px-Top-Stripe, große Emojis statt Gradient-Icon-Boxen; `SPIELE`-Array um `emoji` + `stripe` erweitert, alte Felder `iconGradient`/`cardGradient`/`border` entfernt

### Angefasste Dateien
- `app/online/[code]/page.tsx`

---

## [2026-03-30] – UI Refresh: Glassmorphism konsistent (Fix)

### Fixes
- **`app/page.tsx`:** Glassmorphism auf Spielkarten wiederhergestellt – `backdrop-blur-xl`, `bg-white/[0.07]`, `border-white/[0.18]`, stärkere Inset-Shadow
- **`app/online/page.tsx`:** Gradient-Icon-Box + Glow-Blob im Name-Step entfernt → neutrales Glassmorphism wie Home-Hero

### Angefasste Dateien
- `app/page.tsx`
- `app/online/page.tsx`

---

## [2026-03-30] – UI Refresh: Refined Minimal

### Startseite (`app/page.tsx`)
- **Spielkarten:** Bunte Gradient-Hintergründe + farbige Borders entfernt → einheitliche `bg-white/[0.05] border-white/[0.10]`; farbiger 2px-Top-Stripe pro Spiel
- **Icons:** Lucide-Icon-Boxen entfernt → große Emojis direkt (🤔 ⚡ 🙋 🕵️)
- **Kartentitel:** `text-[18px]` → `text-[20px]` für bessere Hierarchie gegenüber Subtitle
- **Hero:** Gradient-Logo-Box + Glow-Blob entfernt → neutrales `bg-white/[0.07] border border-white/[0.12]`; Titel von "Trinkspiel App" → "Trinkspiel"; `pt-16 pb-10` → `pt-10 pb-8`
- **Hintergrund-Glow:** Violetter `radial-gradient`-Overlay entfernt
- **Online-Button:** Solid-Cyan-Gradient + Glow entfernt → cleaner Border-Button (`border-white/[0.15] bg-white/[0.06]`)
- **Import:** `Eye, Zap, Users2, UserX` entfernt (nur noch `Globe`)

### GameLayout (`components/GameLayout.tsx`)
- **Nav-Padding:** `pt-12 pb-8` → `pt-8 pb-6` (mehr Content-Raum)

### Angefasste Dateien
- `app/page.tsx`
- `components/GameLayout.tsx`

---

## [2026-03-27] – Code & Design Fixes (Review-Durchlauf 3)

### Fehlerbehandlung
- **`.catch()` Supabase Fetch:** `wahrheit-oder-pflicht/page.tsx` + `ich-hab-noch-nie/page.tsx`: `.then()` hatte kein `.catch()` → bei Promise-Reject blieb `loading` auf `true`; `.catch()` mit `console.error` + `setLoading(false)` ergänzt
- **`karteZiehen` try/catch:** `online/[code]/page.tsx`: Gesamter Fetch-Block (Supabase + Update) jetzt in try/catch; bei Fehler `console.error` + `setIsLoading(false)` garantiert

### Typografie min 18px
- **Imposter Abstimmungs-Buttons:** `imposter/page.tsx`: Spielername-Span `font-black` → `text-[18px] font-black`
- **Wer-würde-eher Name-Input:** `wer-wuerde-eher/page.tsx`: Input ohne text-size → `text-[18px]` ergänzt; `placeholder-zinc-600` → `placeholder-zinc-500`
- **Online Lobby Name-Badge:** `online/page.tsx`: Spielername-Span ohne text-size → `text-[18px]`
- **Online Lobby Kachel-Labels:** `online/page.tsx`: "Raum erstellen" / "Raum beitreten" `font-black` → `text-[18px] font-black`
- **Imposter-Picker Buttons:** `online/[code]/page.tsx`: "1 Imposter" / "2 Imposter" `font-black` → `text-[18px] font-black`

### Button-Fix
- **Kategorie-Chips:** `imposter/page.tsx`: `py-3` → `py-[14px]` (sichert ≥52px Touch-Target)

### Kontrast
- **`text-zinc-500` → `text-zinc-400`** in allen betroffenen Dateien:
  - `wahrheit-oder-pflicht/page.tsx`: "Lade Karten...", "Keine Karten gefunden."
  - `ich-hab-noch-nie/page.tsx`: "Lade Karten...", "Keine Karten gefunden."
  - `wer-wuerde-eher/page.tsx`: "Keine Karten gefunden.", X-Icon, "vs"-Span
  - `imposter/page.tsx`: EyeOff-Icon + "Verdeckt"-Label
  - `online/[code]/page.tsx`: "Warte auf Spieler...", Crown-Icon, "Starte die erste Runde!" / "Warte auf den Host..." (Imposter), "vs"-Span, "Der Host zieht die Karten"

### Angefasste Dateien
- `app/wahrheit-oder-pflicht/page.tsx`
- `app/ich-hab-noch-nie/page.tsx`
- `app/wer-wuerde-eher/page.tsx`
- `app/imposter/page.tsx`
- `app/online/page.tsx`
- `app/online/[code]/page.tsx`

---

## [2026-03-27] – Code & Design Fixes (Review-Durchlauf 2)

### Crash-Fixes
- **`spielStarten()` try/catch:** `wer-wuerde-eher/page.tsx`: Supabase-Fetch in try/catch; bei leerem Pool oder Fehler wird Fehlermeldung im UI angezeigt (neuer `fehler`-State)
- **`einreichen()` Fehler-Feedback:** `ich-hab-noch-nie/page.tsx`: Bei Insert-Fehler wird `submitError`-State gesetzt und im Formular angezeigt; `console.error` Logging
- **`imposterAuflösung` try/catch:** `online/[code]/page.tsx`: Supabase-Update in try/catch mit `console.error`
- **`toggle18Plus` try/catch:** `online/[code]/page.tsx`: Supabase-Update in try/catch
- **`spielWählen` try/catch:** `online/[code]/page.tsx`: Supabase-Update in try/catch
- **`zurückZurLobby` try/catch:** `online/[code]/page.tsx`: Supabase-Update in try/catch
- **`verlassen` try/catch:** `online/[code]/page.tsx`: Raum-Löschen in try/catch; `localStorage.removeItem` und Navigation laufen auch bei Fehler

### Design-Fixes
- **Spielkarten-Titel:** `app/page.tsx` Z.94: `text-base` → `text-[18px]`
- **18+ Toggle Spiel-Modus:** `wer-wuerde-eher/page.tsx`: `py-3 text-base` → `py-[14px] text-[18px]` (war ~48px, jetzt min. 52px)
- **18+ Toggle inaktiv Text:** `wer-wuerde-eher/page.tsx`: `text-zinc-500` → `text-zinc-400`
- **18+ Toggle inaktiv Text:** `online/[code]/page.tsx`: `text-zinc-500` → `text-zinc-400`
- **Host-Button "Auflösung anzeigen":** `online/[code]/page.tsx`: `text-base` → `text-[18px]`
- **Host-Buttons "Wahrheit"/"Pflicht":** `online/[code]/page.tsx`: `text-base` → `text-[18px]`
- **Spielername Overflow:** `online/[code]/page.tsx`: `truncate` Klasse auf Spielernamen in Lobby

### CSS-Bereinigung
- **`globals.css`:** Ungenutzte Animationen und Utility-Klassen entfernt: `@keyframes slideUp`, `@keyframes popIn`, `@keyframes shimmer`, `.card-animate`, `.shimmer`
- Behalten: `@keyframes slideInRight` (`.card-slide-right` aktiv), `@keyframes playerPop` (`.player-pop` aktiv), `@keyframes buttonPress`

---

## [2026-03-27] – Code & Design Fixes (Review-Durchlauf 1)

### Code-Fixes
- **Fehlerbehandlung Supabase:** `wahrheit-oder-pflicht/page.tsx` und `ich-hab-noch-nie/page.tsx`: Supabase-Fetch überprüft jetzt `error` vor `setSupabaseCards`
- **`handleSchonGetan` async:** `ich-hab-noch-nie/page.tsx`: Supabase-Update jetzt mit `await` + `try/catch`
- **`kopieren()` try/catch:** `online/[code]/page.tsx`: `navigator.clipboard.writeText()` in try/catch (scheitert in nicht-HTTPS)
- **Ungenutzte Imports entfernt:** `online/[code]/page.tsx`: `Radio`, `Scale`, `Hand`, `RefreshCw` entfernt; doppelter `SkipForward`-Import beseitigt
- **Tote CSS-Klassen entfernt:** `globals.css`: `.card-flip` und `.pop-animate` und `@keyframes cardFlip` entfernt

### Design-Fixes
- **Button-Mindestgröße 52px:** Alle Buttons auf `min-h-[52px]` / `py-[14px]` angehoben:
  - Verlassen-Button `h-9→min-h-[52px]`, Copy-Button `h-10→min-h-[52px]`
  - "Spiel wechseln"-Button `py-1.5→py-[14px]`
  - 18+ Toggle überall `py-3→py-[14px]`
  - Imposter 2-Imposter-Toggle: kleiner Switch-Knopf durch klickbare Zeile mit `py-[14px]` ersetzt
  - Kategorie-Chips `py-2→py-3`, Spielernamen-Input `py-2→py-3`
  - "Anderes Wort"-Button `py-2.5→py-[14px]`
  - "Verstanden & Verbergen" `py-3→py-[14px]`
  - Plus/Minus Spieleranzahl `h-12→min-h-[52px]`
  - Plus-Button wer-wuerde-eher `h-12→min-h-[52px]`
  - Remove-Button Spieler `h-10→min-h-[52px]`
  - "Eigenen Satz"-Accordion `py-3→py-[14px]`
  - Send-Button Formular `h-12→min-h-[52px]`
  - "Ändern"-Link online: kein Touch-Target → `min-h-[52px] px-3`
  - "Abbrechen"-Imposter-Picker `py-3→py-[14px]`
- **Typografie min 18px:** Alle `text-xs` und `text-sm` in allen Dateien auf `text-[18px]` angehoben; `text-base` (16px) auf `text-[18px]`
- **Kontrast verbessert:** `text-zinc-500`/`text-zinc-600` auf sekundären Texten → `text-zinc-400`; `text-red-400/70`/`text-emerald-400/70` → volle Opazität
- **Button-Press einheitlich:** Alle `active:scale-95` und `active:scale-[0.93]` → `active:scale-[0.97]` in allen Dateien inkl. GameLayout.tsx

---

## [2026-03-27] – Design & UX Review (Durchlauf 1)

### Was wurde gemacht
- Vollständiger Design-Review aller 9 Hauptdateien
- Report geschrieben nach `/tmp/design-review.md`

### Befunde (zusammengefasst)
- **CSS-Variablen:** Definiert, aber in keiner Komponente genutzt (alle Tailwind-Klassen hardcoded)
- **Typografie:** ~50+ Textstellen unter 18px (hauptsächlich `text-xs`/`text-sm`), besonders `app/imposter/page.tsx` und `app/online/[code]/page.tsx`
- **Buttons:** 15+ Buttons unter 52px, kritisch: Verlassen-Button `h-9 w-9` (36px), "Spiel wechseln" `py-1.5` (~28px), Toggle-Schalter `h-7` (28px)
- **Kein horizontales Scrollen:** ✅ Kein Verstoß gefunden
- **Kontrast:** `text-zinc-600` auf `#0d0f1e` ca. 2:1 – kritisch bei Party-Umgebung (Footer, Imposter-Sub-Labels)
- **Animationen:** `card-flip` definiert aber nirgends genutzt (toter Code); `pop-animate` ebenfalls ungenutzt
- **Hover-Only:** Verlassen-Button, "Ändern"-Link ohne `active:` Touch-Feedback
- **WOW-Faktor:** Imposter-Setup wirkt wie Formular, Wer-würde-eher VS-Header ohne Animation/Avatar

### Offen / Nächste Schritte
- Alle `text-xs`/`text-sm` Texte auf min. `text-[18px]` anheben (prioritär: Imposter, Online)
- Verlassen-Button, Spiel-wechseln-Button, Toggle-Schalter auf 52px anheben
- `text-zinc-600` durch `text-zinc-400` ersetzen
- `card-flip` und `pop-animate` entfernen oder nutzen

---

## [2026-03-27] – Code-Qualität, DRY-Refactoring, Design-System-Vervollständigung

### Was wurde geändert

**DRY-Refactoring – Duplikate entfernt**
- `app/wahrheit-oder-pflicht/page.tsx` – 104 Zeilen hardcodierter 18+-Arrays entfernt; ersetzt durch `WAHRHEIT_18_PLUS` / `PFLICHT_18_PLUS` aus `lib/fragenData.ts` (`.map()` mit negativen IDs)
- `app/ich-hab-noch-nie/page.tsx` – 52 Zeilen hardcodierter 18+-Array entfernt; ersetzt durch `ICH_HAB_NOCH_NIE_18_PLUS` aus `lib/fragenData.ts`
- `app/wer-wuerde-eher/page.tsx` – 52 Zeilen hardcodierter 18+-Array entfernt; ersetzt durch `WER_WUERDE_EHER_18_PLUS` aus `lib/fragenData.ts`

**Design-System (`app/globals.css`)**
- CSS-Variablen vervollständigt: `--color-bg`, `--color-card`, `--color-card-border`, `--color-text`, `--color-muted`, `--spacing-sm/md/lg`, `--radius-sm/md/lg`, `--font-display`, `--font-body`
- Neue Animationen: `cardFlip`, `slideInRight`, `buttonPress`, `playerPop`
- Neue Utility-Klassen: `.card-flip`, `.card-slide-right`, `.player-pop`
- `body` nutzt jetzt `var(--color-bg)` und `overflow-x: hidden` (kein horizontales Scrollen)
- Globales Button-Press-Feedback: `button:active` + `a:active` → `scale(0.97)` (gilt für alle Buttons ohne Tailwind-Klasse)

**Animationen – Kartenwechsel**
- Alle 3 Offline-Spielseiten: Karten-Div hat `key={index}` → Animation wird bei jedem Kartenwechsel neu getriggert
- Online-Raum: `key={currentCardText}` auf Kartendiv → Slide-Animation bei jeder neuen Karte
- Spieler-Banner Online: `key={selectedPlayer + cardText}` → `player-pop` Animation bei jedem neuen Spieler
- Alle Spielkarten nutzen jetzt `.card-slide-right` statt `.card-animate`

**GameLayout (`components/GameLayout.tsx`)**
- Zurück-Button: `h-12 w-12` → `h-[52px] w-[52px]` (52px Touch-Target-Pflicht)
- Titel + Counter: `text-base` → `text-[18px]` (18px Minimum)
- ArrowLeft-Icon: `h-5 w-5` → `h-6 w-6`
- `overflow-x: hidden` auf `<main>`

**Mobile-First Korrekturen**
- `app/wer-wuerde-eher/page.tsx` – Spieler-Liste: Avatar `h-8 w-8` → `h-10 w-10`, Name `font-bold` → `text-[18px] font-bold`, Remove-Button auf `h-10 w-10` Touch-Target, `player-pop` Animation, Hinweis-Text auf `text-[18px]`
- `app/online/[code]/page.tsx` – Lobby-Spielerliste: Avatar `h-8 w-8` → `h-10 w-10`, Name `text-xl` → `text-[20px]`, Warte-Meldung auf `text-[18px]`, Nicht-Host-Button `py-5` + `text-[18px]`
- `app/online/[code]/page.tsx` – 18+ Toggle: `py-2.5 text-sm` → `py-3 text-[18px]` (min 52px Höhe)
- `app/online/[code]/page.tsx` – VS-Header: `text-2xl` → `text-[28px]`, vs-Span `text-lg` → `text-[20px]`
- `app/buzzer/page.tsx` – Kartentext `text-xl` → `text-[22px]`, Warte-Text `text-lg` → `text-[20px]`, Neue-Karte-Button `py-3.5 text-sm` → `py-[14px] text-[18px]`

### Angefasste Dateien
- `app/globals.css`
- `components/GameLayout.tsx`
- `app/wahrheit-oder-pflicht/page.tsx`
- `app/ich-hab-noch-nie/page.tsx`
- `app/wer-wuerde-eher/page.tsx`
- `app/online/[code]/page.tsx`
- `app/buzzer/page.tsx`

### Offen / Geplant
- CSS-Variablen noch nicht in Tailwind-Klassen genutzt (definiert, aber Tailwind-Utilities bleiben inline)
- `imposter/page.tsx` – große Datei, kein Kartenflip-Refactoring (lokal, kein Swipe)

---

## [2026-03-27] – Mobile-First Design-Überarbeitung (Design Loop)

### ✅ Was wurde geändert

**CSS Design-System (`app/globals.css`)**
- CSS-Variablen hinzugefügt: `--bg`, `--card`, `--card-border`, `--text`, `--text-muted`, `--radius-card`, `--radius-btn`
- Keyframe-Animationen: `slideUp` (Card-Entry), `popIn` (Bounce-Reveal), `shimmer` (Pulsing)
- Utility-Klassen: `.card-animate`, `.pop-animate`, `.shimmer`

**Alle 3 Spielkarten-Seiten**
- Fragentext: `text-xl` → `text-[26px] font-black` (≥26px, 30% größer)
- Haupt-Buttons: `py-4 text-base` → `py-[14px] text-lg` (~56px Höhe, ≥52px Pflicht erfüllt)
- 18+ Toggle: `py-2.5 text-sm` → `py-3 text-base` (~44px Höhe)
- Badge-Labels: `text-xs` → `text-sm`
- Card-Container: `.card-animate` Klasse hinzugefügt (slideUp bei Kartenwechsel)
- Swipe-Hinweis: `text-zinc-600` → `text-zinc-400` (besser bei schlechtem Licht)

**Wer würde eher (`app/wer-wuerde-eher/page.tsx`)**
- VS-Header Spielernamen: `text-2xl` → `text-[28px] font-black`

**Online-Raum (`app/online/[code]/page.tsx`)**
- Spieler-Banner Avatar: `h-16 w-16 text-3xl` → `h-20 w-20 text-4xl`
- Spieler-Banner Name: `text-xl` → `text-[28px] font-black`
- Spieler-Banner Badge: `text-xs` → `text-sm font-black`
- Spieler-Banner Container: `.pop-animate` Klasse (Bounce-Effekt beim Reveal)
- Kartenfragen im Online-Modus: `text-xl` → `text-[26px] font-black leading-snug`
- Lobby Spielernamen-Liste: `font-bold text-white` → `text-xl font-black text-white`

### 📁 Angefasste Dateien
- `app/globals.css`
- `app/wahrheit-oder-pflicht/page.tsx`
- `app/ich-hab-noch-nie/page.tsx`
- `app/wer-wuerde-eher/page.tsx`
- `app/online/[code]/page.tsx`

### 🔲 Offen / Geplant
- Loading-State: "Lade Karten..." könnte `.shimmer`-Animation bekommen
- CSS-Variablen noch nicht aktiv in Tailwind-Klassen genutzt (nur definiert)
- Offline-Spiele nutzen noch eigene duplizierte Arrays statt `lib/fragenData.ts`

---

## [2026-03-26] – Session 1 & 2 (Initiales Setup + Große Feature-Session)

### ✅ Was wurde geändert

**18+ Modus (Offline)**
- `app/wahrheit-oder-pflicht/page.tsx` – 52 lokale Wahrheit-Fragen + 52 Pflicht-Aufgaben (18+) hinzugefügt; 18+ Toggle-Button; Supabase-Daten und lokale Daten werden nach Modus gemischt
- `app/ich-hab-noch-nie/page.tsx` – 52 lokale 18+ Aussagen; 18+ Toggle; Einreich-Formular bleibt erhalten; Supabase-IDs >0 für Update-Guard
- `app/wer-wuerde-eher/page.tsx` – 52 lokale 18+ Fragen; 18+ Toggle in Setup-Phase und Spiel; VS-Header in Karte umgezogen (jetzt fett oben: „Spieler A vs Spieler B"), darunter die Frage groß

**Online-Modus – Spielerauswahl**
- `app/online/[code]/page.tsx` – Beim Spielstart wird sofort random ein Startspieler gewählt (`current_meta.selectedPlayer`, `isStart: "true"`); kein Doppelpick via `lastSelectedPlayerRef`; prominenter Avatar-Banner über der Karte (Gradient-Circle, Name, Badge „fängt an!" / „ist dran!")
- `app/online/[code]/page.tsx` – Ich hab noch nie: kein Spielername (nicht sinnvoll)
- `app/online/[code]/page.tsx` – Wer würde eher: VS-Display aus separatem Block in die Karte verschoben
- `app/online/[code]/page.tsx` – Leerer Karten-Zustand zeigt passendes Emoji je nach Spiel

**18+ Modus (Online)**
- `lib/fragenData.ts` – Neue geteilte Datei: `WAHRHEIT_18_PLUS`, `PFLICHT_18_PLUS`, `ICH_HAB_NOCH_NIE_18_PLUS`, `WER_WUERDE_EHER_18_PLUS` als `string[]`
- `app/online/[code]/page.tsx` – Host kann 18+ Modus togglen; Status für alle sichtbar (roter Button wenn aktiv); 18+ Fragen werden in Kartenpool gemischt; `mode18Plus` Flag wird in `current_meta` mitgetragen; `is18PlusRef` für stale-free Closure; Einstellung bleibt bei Spielwechsel erhalten; kein Toggle bei Imposter

**Dokumentation**
- `CLAUDE.md` – Erstellt mit vollständiger Projektstruktur, Regeln, Supabase-Schema, Design-Konventionen, Online-Modus-Details
- `CHANGELOG.md` – Diese Datei (erstellt)

### 📁 Angefasste Dateien
- `app/wahrheit-oder-pflicht/page.tsx`
- `app/ich-hab-noch-nie/page.tsx`
- `app/wer-wuerde-eher/page.tsx`
- `app/online/[code]/page.tsx`
- `lib/fragenData.ts` *(neu)*
- `CLAUDE.md` *(neu → aktualisiert)*
- `CHANGELOG.md` *(neu)*

### 🔲 Offen / Geplant
- Offline-Spiele nutzen noch eigene duplizierte Arrays statt `lib/fragenData.ts` – Refactoring möglich
- Supabase-Tabellen haben noch keine 18+-Fragen (nur lokale Daten)
- Kein Punktesystem im Online-Modus
- Buzzer-Spiel im Online-Modus nicht verfügbar
- Imposter im Online-Modus hat keine Kategoriewahl (nur globale Wortliste)

---

## Template für neue Einträge

```
## [YYYY-MM-DD] – Kurze Beschreibung

### ✅ Was wurde geändert
- `datei/pfad.tsx` – Was genau geändert wurde

### 📁 Angefasste Dateien
- `...`

### 🔲 Offen / Geplant
- ...
```
