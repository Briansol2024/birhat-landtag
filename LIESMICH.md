# Birhat Kaçar – Bewerbungsseite Landtag 2027

Statische Seite ohne Baustufe, nicht auf Wix. Sie läuft auf GitHub Pages und später unter birhat2027.de.

- Testadresse: https://briansol2024.github.io/birhat-landtag/ (für Suchmaschinen gesperrt)
- `index.html`, `impressum.html`, `datenschutz.html`
- `assets/styles.css`: Gestaltung
- `assets/site.js`: Bewegung, Menü, Karte, Aufklappbereiche, Instagram-Karussell, Fragen-Formular
- `assets/wegweiser.js`: „Wer hilft mir bei meinem Anliegen?“
- `assets/data/wissen.json`: Status der Bewerbung (Bewerbung / nominiert / gewählt) und bestätigte Angaben mit Quellen
- `assets/data/wegweiser.json`: Zuständigkeiten je Ort und Anliegen mit Quellen und Prüfdatum
- `assets/data/orte.json`: Ortskarten für die Wahlkreiskarte (Art, Kreis, offizielle Website)
- `assets/img/birhat-wand-*.jpg`, `birhat-bank-hoch-*.jpg`: die beiden Porträts in mehreren Breiten (Bank-Foto als engerer Ausschnitt im Format 4:5). Der Browser lädt die passende Größe.
- `assets/img/logo/`: Kampagnenlogo. Das große Logo im Startbereich besteht aus sieben deckungsgleichen Ebenen (`logo-*.png`) für die Einstiegsanimation. Freigestellt aus den gelieferten JPG-Fassungen (832 px breit): großes Logo weiß mit rotem Pfeilkreis, Wortmarke (rot und mit schwarzem Kreis fürs rote Menü), Pfeilkreis, Favicons. Mit den SVG-Originalen aus Canva würde es noch schärfer, dann einfach die PNGs gleichen Namens ersetzen.
- Wahlkreiskarte: direkt als SVG in `index.html` (`.karte`), Grenzen aus BKG VG250 (Stand 01.01., abgerufen 04.11.2026), Namenslagen automatisch gegen Linien und fremde Flächen geprüft.
- `ki-dienst/`: nicht in Benutzung. Die KI-Assistentin Heidi ist seit 04.11.2026 von der Website entfernt, der Code bleibt nur aufbewahrt.

## Pflege

- **Status ändern:** in `assets/data/wissen.json` bei `status.aktuell`. Wird derzeit auf der Seite nicht angezeigt (Hinweis über dem Logo am 04.11.2026 entfernt).
- **Häufige Fragen:** stehen direkt in `index.html` im Abschnitt `#fragen`, jede mit Quelle. Nach Änderungen das Stand-Datum darunter anpassen.
- **Fragen-Formular:** verschickt selbst nichts, sondern öffnet das Mailprogramm der Besucher mit fertiger Mail. Die Empfängeradresse steht geteilt im Formular bei `data-an` (vor dem @) und `data-bei` (nach dem @).
- **Instagram-Auswahl:** Die sechs Beiträge stehen in `index.html` im Abschnitt `#instagram`, die Bilder in `assets/img/instagram/`. Die Seite lädt nichts von Instagram, deshalb bekommt Meta keine Besucherdaten. Die Auswahl wird von Hand gepflegt, nicht automatisch. So tauschst du einen Beitrag aus:
  1. Bilder des Beitrags (höchstens 640 px breit, JPEG) unter dem Kürzel aus der Beitragsadresse speichern und durchnummerieren, z. B. `DejPYRcjHKs-1.jpg`, `DejPYRcjHKs-2.jpg`.
  2. In `index.html` die Kachel anpassen: Link, Datum, Bilder mit Bildbeschreibung (`alt`) und den kurzen Textauszug. Der Auszug stammt wörtlich aus dem Beitrag. Bei mehreren Bildern wird die Kachel ein Karussell. Dafür eine bestehende Karussell-Kachel kopieren. Das erste Bild steht in `src`, alle weiteren in `data-src`, damit sie erst beim Blättern laden. Anzahl der Punkte und die Angabe „1/7“ müssen zur Bildzahl passen.
  3. Das Stand-Datum im Hinweistext über den Kacheln ändern.
- **Wegweiser:** in `assets/data/wegweiser.json` Einträge und `geprueft_am` aktualisieren. Links vorher prüfen.

## Offen vor dem öffentlichen Start

- E-Mail: vorerst birhat.kacar@web.de im Impressum und im Fragen-Formular. Sobald es eine eigene Adresse @birhat2027.de gibt, an beiden Stellen tauschen und bei domain.de den MX-Eintrag setzen.
- Anschrift (Am Bahnhof 1t, 29614 Soltau) und Fotografin (Sandra Krafft) stehen seit 04.11.2026 im Impressum. Die Domain birhat2027.de läuft.
- Seit 04.11.2026 für Suchmaschinen freigegeben (auf Brians Ja): Die Startseite ist auffindbar (`canonical`, `sitemap.xml`). Impressum und Datenschutz haben `noindex, follow`, damit Birhats Anschrift nicht in den Suchergebnissen steht. `robots.txt` sperrt nur `ki-dienst/` und `LIESMICH.md`.
- Linkvorschau (WhatsApp, Facebook, X und andere), seit 05.11.2026: Open-Graph- und Twitter-Card-Angaben stehen im Kopf von `index.html` direkt nach `canonical`, ohne JavaScript. Das Bild ist `assets/img/linkvorschau.jpg` (1200 × 630, unter 100 KB): das weiße Kampagnenlogo mittig auf dunklem Grund mit rotem Band. Das Logo bleibt auch bei einem quadratischen Zuschnitt ganz sichtbar. Wird das Bild ersetzt, bekommt es einen neuen Dateinamen, weil Facebook und WhatsApp alte Vorschauen eine Weile zwischenspeichern.

## Wegweiser: nicht vollständig belegte Punkte (Stand 03.11.2026)

Diese Fälle zeigt der Wegweiser bewusst vorsichtig an:

- **Fintel, Führungszeugnis:** Ob es auch im Rathaus Lauenbrück geht, steht nicht auf der Seite der Samtgemeinde. Angezeigt wird „nicht eindeutig“ mit Verweis auf das Bundesamt für Justiz.
- **Fintel, Straßenschäden:** Bei Bundes- und Landesstraßen ist nicht ausdrücklich belegt, welcher Geschäftsbereich der Landesbehörde zuständig ist.
- **Neuenkirchen, Wohngeld und Personalausweis; Wietzendorf, Personalausweis:** Die Zuständigkeit ist nur über den Zuständigkeitsfinder des Landes belegt. Eine eigene Seite der Gemeinde dazu gibt es nicht. Verlinkt ist deshalb die Startseite bzw. die Leistungsübersicht.
- **Instagram, Beitrag vom 25.07.2026:** Das zweite Bild des Karussells ist bewusst nicht übernommen, weil auf dem Banner ein Name steht, der auf der Seite nicht erscheinen soll.
- **Unterlagen:** Die Listen stammen von den Seiten der jeweils genannten Quelle, meist Stadt Soltau, Munster, Heidekreis oder Landkreis Rotenburg. Bei anderen Orten können sie leicht abweichen. Jede Unterlage zeigt deshalb ihre Quelle.

## Quellen

- **Lebenslauf und Ämter:** birhatkacar.de („Über mich“, „Meine Arbeit“), Stand 03.11.2026.
- **Kreistagswahl 2026:** 4.116 Stimmen, Angabe von Birhat.
- **Wahlkreis 43 Soltau ab 2027:** Änderung des Landeswahlgesetzes, beschlossen am 03.03.2026.
- **Wahltermin 26.09.2027 sowie Erst- und Zweitstimme:** Niedersächsischer Landtag, „Wahlverfahren, Wahlsystem“.
- **Nominierung:** § 18 Niedersächsisches Landeswahlgesetz.
- **Wahlkreiskarte:** Gemeinde- und Samtgemeindegrenzen sowie Verwaltungssitze aus © GeoBasis-DE / BKG (2026), VG250, Datenlizenz Deutschland – Namensnennung 2.0.
- **Häufige Fragen:** § 18 NLWG (VORIS), Niedersächsischer Landtag „Aufgaben des Landtages“; Termin der Mitgliederversammlung (Dezember 2026): Angabe von Brian Weber, 04.11.2026.
- **Heidefoto:** Pirx3000, Wikimedia Commons, CC BY-SA 4.0.
