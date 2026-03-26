# CHANGELOG – Mein Trinkspiel

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
