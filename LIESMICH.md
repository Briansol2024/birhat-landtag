# Birhat Kaçar – Bewerbungsseite Landtag 2027

Statische Seite ohne Baustufe, nicht auf Wix. Sie läuft auf GitHub Pages und später unter birhat2027.de.

- Testadresse: https://briansol2024.github.io/birhat-landtag/ (für Suchmaschinen gesperrt)
- `index.html`, `impressum.html`, `datenschutz.html`
- `assets/styles.css`: Gestaltung
- `assets/site.js`: Bewegung, Menü, Karte, Aufklappbereiche, Instagram-Einwilligung
- `assets/wegweiser.js`: „Wer hilft mir bei meinem Anliegen?“
- `assets/heidi.js`: KI-Assistentin mit festen Antworten als Rückfall
- `assets/data/wissen.json`: **die zentrale Wissensbasis** – Status (Bewerbung / nominiert / gewählt), bestätigte Angaben, Quellen, feste Antworten. Website und KI lesen beide diese Datei.
- `assets/data/wegweiser.json`: Zuständigkeiten je Ort und Anliegen mit Quellen und Prüfdatum
- `assets/data/orte.json`: Ortskarten für die Wahlkreiskarte (Art, Kreis, offizielle Website)
- `assets/data/ki.json`: Adresse des KI-Dienstes (leer = nur feste Antworten)
- `ki-dienst/`: der kleine Server-Dienst für die KI (Cloudflare Worker), Einrichtung in `ki-dienst/LIESMICH.md`

## Pflege

- **Status ändern:** in `assets/data/wissen.json` bei `status.aktuell`.
- **Instagram-Auswahl:** die sechs Beiträge stehen in `index.html` im Abschnitt `#instagram`. Für jeden Beitrag Link und Datum anpassen und das Stand-Datum im Hinweistext ändern. Die Auswahl wird von Hand gepflegt, nicht automatisch.
- **Wegweiser:** in `assets/data/wegweiser.json` Einträge und `geprueft_am` aktualisieren. Links vorher prüfen.

## Offen vor dem öffentlichen Start

- Impressum: Anschrift und E-Mail. Ohne Anschrift darf die Seite nicht öffentlich gehen.
- Fotograf/in der beiden Porträts fürs Impressum.
- Domain birhat2027.de (gekauft bei domain.de): DNS-Einträge setzen und in GitHub als eigene Domain eintragen.
  - A-Einträge für `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - CNAME für `www`: briansol2024.github.io
- Beim Start mit eigener Domain `<meta name="robots" content="noindex">` aus den drei Seiten nehmen und `robots.txt` löschen.
- KI-Dienst einrichten (siehe `ki-dienst/LIESMICH.md`). Bis dahin zeigt Heidi nur feste Antworten.

## Wegweiser: nicht vollständig belegte Punkte (Stand 03.11.2026)

Diese Fälle zeigt der Wegweiser bewusst vorsichtig an:

- **Fintel, Führungszeugnis:** Ob es auch im Rathaus Lauenbrück geht, steht nicht auf der Seite der Samtgemeinde. Angezeigt wird „nicht eindeutig“ mit Verweis auf das Bundesamt für Justiz.
- **Fintel, Straßenschäden:** Bei Bundes- und Landesstraßen ist nicht ausdrücklich belegt, welcher Geschäftsbereich der Landesbehörde zuständig ist.
- **Neuenkirchen, Wohngeld und Personalausweis; Wietzendorf, Personalausweis:** Die Zuständigkeit ist nur über den Zuständigkeitsfinder des Landes belegt. Eine eigene Seite der Gemeinde dazu gibt es nicht. Verlinkt ist deshalb die Startseite bzw. die Leistungsübersicht.
- **Unterlagen:** Die Listen stammen von den Seiten der jeweils genannten Quelle, meist Stadt Soltau, Munster, Heidekreis oder Landkreis Rotenburg. Bei anderen Orten können sie leicht abweichen. Jede Unterlage zeigt deshalb ihre Quelle.

## Quellen

- **Lebenslauf und Ämter:** birhatkacar.de („Über mich“, „Meine Arbeit“), Stand 03.11.2026.
- **Kreistagswahl 2026:** 4.116 Stimmen, Angabe von Birhat.
- **Wahlkreis 43 Soltau ab 2027:** Änderung des Landeswahlgesetzes, beschlossen am 03.03.2026.
- **Wahltermin 26.09.2027 sowie Erst- und Zweitstimme:** Niedersächsischer Landtag, „Wahlverfahren, Wahlsystem“.
- **Nominierung:** § 18 Niedersächsisches Landeswahlgesetz.
- **Kartenkoordinaten:** OpenStreetMap (Nominatim).
- **Heidefoto:** Pirx3000, Wikimedia Commons, CC BY-SA 4.0.
