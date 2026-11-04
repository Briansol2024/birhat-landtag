# Heidi – KI-Dienst einrichten

Die Website liegt auf GitHub Pages und kann selbst keine geheimen Schlüssel aufbewahren. Deshalb läuft die KI über diesen kleinen Dienst bei Cloudflare Workers. Er hält den API-Schlüssel, prüft die Herkunft der Anfragen, begrenzt die Zahl der Fragen und gibt nur Text und geprüfte Quellen zurück.

Solange der Dienst nicht eingerichtet ist, beantwortet Heidi auf der Website nur die festen, geprüften Fragen. Sie kennzeichnet das auch so.

## Was ihr braucht

- Ein **Cloudflare-Konto**. Der kostenlose Tarif reicht.
- Einen **Anthropic-API-Schlüssel** von console.anthropic.com. Stellt dort in der Console unbedingt ein **monatliches Ausgabenlimit** ein.
- **Node.js** auf dem PC.

## Einrichtung (einmalig, etwa 15 Minuten)

```bash
cd ki-dienst
npm install
npx wrangler login
npx wrangler kv namespace create ZAEHLER
```

Die angezeigte `id` in `wrangler.toml` bei `HIER_DIE_ID_EINTRAGEN` einsetzen. Danach den Schlüssel als Secret hinterlegen. Er wird abgefragt und landet nie in einer Datei:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put SALZ
```

Für `SALZ` irgendeinen langen Zufallstext eingeben. Er macht die Zählung der Anfragen anonym.

In `wrangler.toml` prüfen:

- `ERLAUBTE_URSPRUENGE`: die Adressen der Website, z. B. `https://birhat2027.de`.
- `WISSEN_URL`: die Adresse von `assets/data/wissen.json` auf der Website. Nach dem Domain-Umzug `https://birhat2027.de/assets/data/wissen.json`.

Dann veröffentlichen:

```bash
npx wrangler deploy
```

Wrangler zeigt eine Adresse wie `https://heidi.<name>.workers.dev`. In der Website in `assets/data/ki.json` eintragen:

```json
{ "endpunkt": "https://heidi.<name>.workers.dev/frage" }
```

Danach die Website neu hochladen. Heidi zeigt dann „KI“ statt „Fest“.

## Kosten und Grenzen

Preise laut Anthropic, Stand 04.11.2026, in US-Dollar. Je Frage gehen etwa 3.000 Token Wissensbasis mit. Die genaue Zahl zeigt die Console nach den ersten Fragen.

- **Modell:** `claude-opus-5-5` mit niedrigem Aufwand (`AUFWAND = "low"`). Preis: 4 $ je Million Eingabe-Token, 20 $ je Million Ausgabe-Token. Die Wissensbasis wird 5 Minuten zwischengespeichert. Die erste Frage zahlt 5 $ je Million dafür, jede weitere in dieser Zeit nur 0,20 $. Das macht etwa 1 bis 3 Cent pro Antwort.
- **Günstiger:** Mit `MODELL = "claude-haiku-5-5"` kostet eine Antwort etwa 0,1 Cent, also rund zwanzigmal weniger. Das Modell ist einfacher, deshalb vorher mit den Startfragen ausprobieren.
- **Grenzen** in `wrangler.toml`:
  - 6 Fragen pro Minute und Person
  - 40 pro Person und Tag
  - 150 pro Tag insgesamt

  Danach antwortet der Dienst mit „Heidi macht für heute Pause“, und die Website zeigt feste Antworten. Mit Opus kostet ein Tag damit höchstens etwa 4 $, mit Haiku etwa 0,15 $.
- **Ausgabenlimit:** In der Anthropic-Console unter „Limits“ ein Monatslimit setzen, z. B. 20 $. Ist es erreicht, zeigt Heidi nur noch feste Antworten.
- **Cloudflare:** Der kostenlose Tarif reicht. Er erlaubt 100.000 Anfragen und 1.000 Schreibvorgänge im Zähler pro Tag. Heidi braucht drei Schreibvorgänge je Frage, bei 150 Fragen also 450. Das Tageslimit deshalb nicht über 300 setzen, sonst ist der kostenlose Tarif zu klein.

## Datenschutz

- **Übertragen** wird nur die Frage, dazu höchstens die letzten sechs Nachrichten des laufenden Gesprächs. Der Dienst speichert nichts davon.
- **Für die Grenzen** zählt er pro Tag einen gekürzten Hashwert aus IP-Adresse, `SALZ` und Datum. Die IP-Adresse selbst wird nicht gespeichert. Die Zähler verfallen nach spätestens zwei Tagen.
- **Anthropic** verarbeitet die Frage, um die Antwort zu erzeugen. Für API-Kunden werden Eingaben nicht zum Training genutzt. Die Aufbewahrungsfristen stehen in den Bedingungen von Anthropic.
- **Datenschutzerklärung:** Der Abschnitt „KI-Assistentin Heidi“ in `datenschutz.html` beschreibt das für Besucher.

## Status ändern (Bewerbung → Nominierung → Wahl)

Nur in `assets/data/wissen.json` bei `status.aktuell` ändern, auf `bewerbung`, `nominiert` oder `gewaehlt`. Die Texte dazu stehen direkt darunter. Website und Heidi lesen beide diese Datei. Der Dienst lädt sie spätestens nach fünf Minuten neu.
