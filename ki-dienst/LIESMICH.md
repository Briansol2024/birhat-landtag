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

- **Modell:** `claude-opus-5-5` mit niedrigem Aufwand (`AUFWAND = "low"`). Eine Antwort braucht grob 4.000 bis 6.000 Eingabe-Token, davon ist der größte Teil zwischengespeichert, und etwa 300 Ausgabe-Token. Das sind meist ein bis zwei Cent pro Antwort.
- **Grenzen** in `wrangler.toml`:
  - 6 Fragen pro Minute und Person
  - 40 pro Person und Tag
  - 500 pro Tag insgesamt

  Danach antwortet der Dienst mit „Heidi macht für heute Pause“, und die Website zeigt feste Antworten. Bei 500 Fragen am Tag sind die Kosten damit auf wenige Euro begrenzt.
- **Günstiger:** Mit `MODELL = "claude-haiku-5-5"` wird es noch einmal deutlich billiger. Ob ihr das wollt, entscheidet ihr. Probiert es vorher mit den Startfragen aus.
- Zusätzlich gilt das Ausgabenlimit in der Anthropic-Console.

## Datenschutz

- **Übertragen** wird nur die Frage, dazu höchstens die letzten sechs Nachrichten des laufenden Gesprächs. Der Dienst speichert nichts davon.
- **Für die Grenzen** zählt er pro Tag einen gekürzten Hashwert aus IP-Adresse, `SALZ` und Datum. Die IP-Adresse selbst wird nicht gespeichert. Die Zähler verfallen nach spätestens zwei Tagen.
- **Anthropic** verarbeitet die Frage, um die Antwort zu erzeugen. Für API-Kunden werden Eingaben nicht zum Training genutzt. Die Aufbewahrungsfristen stehen in den Bedingungen von Anthropic.
- **Datenschutzerklärung:** Der Abschnitt „KI-Assistentin Heidi“ in `datenschutz.html` beschreibt das für Besucher.

## Status ändern (Bewerbung → Nominierung → Wahl)

Nur in `assets/data/wissen.json` bei `status.aktuell` ändern, auf `bewerbung`, `nominiert` oder `gewaehlt`. Die Texte dazu stehen direkt darunter. Website und Heidi lesen beide diese Datei. Der Dienst lädt sie spätestens nach fünf Minuten neu.
