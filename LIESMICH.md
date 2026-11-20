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
- **Themen und Forderungen** (seit 20.11.2026): Abschnitt `#themen` in `index.html`. Bildung, Mobilität und Wirtschaft sind Kacheln mit der Klasse `thema`. Ein Klick auf die Kachel oder auf „Forderungen ansehen“ öffnet direkt darunter das Feld mit den Forderungen (`section.forderungen`). Es ist immer nur ein Feld offen. Geschlossen wird über denselben Knopf, über „Schließen“ im Feld oder mit Escape. Ohne JavaScript stehen alle Forderungen offen da. Direktlinks gehen auch, z. B. `birhat2027.de/#forderungen-mobilitaet`. Jede Forderung ist gleich aufgebaut: „Worum es geht“, „Was ich vorhabe“, „Wer zuständig ist“ (Land, Heidekreis, Städte und Gemeinden, „Meine Rolle im Landtag“) und darunter die Quellen. Noch offene Punkte tragen das gelbe Etikett „Prüfauftrag“. Wenn sich Angaben ändern, den Text, die Quelle und „Stand der Angaben“ unten im Feld anpassen. Die Kacheln 04 (Kinder, Jugend, Familien) und 05 (Feuerwehr, Ehrenamt) sind kurze Kacheln ohne Forderungen. Die Bedienung steuert `assets/site.js`, Abschnitt „Themen“.
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
- **Forderungen zu Bildung, Mobilität und Wirtschaft** (geprüft am 20.11.2026; die Quellen stehen auf der Seite bei jeder Forderung):
  - **Bildung:**
    - Die Zahlen zu Schulsozialarbeit und Ganztag stammen aus der Pressemitteilung des Kultusministeriums vom 18.09.2026. Die Mitteilung beschreibt den Haushalts*entwurf*. Ob der Landtag den Haushalt beschlossen hat, war am 20.11.2026 nicht zu belegen.
    - Wie die Stellen auf die Schulen verteilt werden, steht nicht in der Mitteilung.
    - Die Zuständigkeiten sind belegt mit NSchG §§ 23, 102, 106, 108 und 112 und dem Ganztagserlass vom 01.01.2026.
  - **BBS Soltau:**
    - Die Ausbildungsbereiche stehen auf bbssoltau.de.
    - Dass der Heidekreis Träger der BBS ist, steht auf heidekreis.de unter „Infrastrukturen“.
    - Den Nachholbedarf bei der Ausstattung nennt die IHK im Papier „Standortbedingungen in der Region Heidekreis“ (2026).
  - **Bahn:**
    - Der Name „Heidebahn“ gilt nur für die RB 38 (Hannover – Buchholz). Die RB 37 (Bremen – Uelzen) heißt nicht so. Beide Linien zusammen heißen „Heidekreuz“.
    - Werte je Linie veröffentlicht die LNVG bereits im Qualitätsmonitor.
    - Die Pünktlichkeit von 81,3 % (2025) gilt für das ganze Gebiet der LNVG und stammt aus der LNVG-Pressemitteilung vom 30.04.2026.
    - Die Aussage zur Verlässlichkeit stammt aus der Stellungnahme des Landkreises für den Verkehrsausschuss des Bundestages vom April 2026.
  - **Lüneburg – Soltau:**
    - Die LNVG-Seite (Stand 12/2025) nennt als Ziel 2028/2029 und als nächste Schritte Planfeststellung, GVFG-Förderung und Betriebskosten.
    - In der LNVG-Mitteilung vom 20.08.2026 steht, dass ein Betreiber gefunden ist. Die Züge sollen ab Ende 2028 fahren.
    - Laut SinON-FAQ ist das Vorhaben erst mit dem Förderbescheid des Bundes verbindlich.
  - **Bus 150/5700:**
    - Im Nahverkehrsplan 2025–2029 steht der Ausbau als Vorschlag mit Priorität 2a unter Maßnahme 4.3 (im Entwurf S. 79).
    - Die Kosten sind grob mit „ca. 125 T€/Jahr“ geschätzt, unter Finanzierungsvorbehalt.
    - Der Kreistag hat den Plan am 13.12.2024 einstimmig beschlossen.
    - Linie 5700 gehört zum Landkreis Lüneburg. Ihre Konzession endete am 31.12.2025. Ob Nummer und Linienweg heute noch so gelten, ist nicht geprüft.
    - Als landesbedeutsame Buslinie kann das Land die Verbindung laut Plan nicht fördern.
  - **Wirtschaft:**
    - Die Zahlen 13,4 % und 17,3 % stammen aus der IHK-Standortumfrage 2025, Heidekreis-Werte (Tabelle S. 15 im PDF).
    - Der Satz „Ausbildungsplätze bleibt hoch …“ stammt aus dem IHK-Fachkräftemonitor 2025 und gilt für den ganzen IHK-Bezirk.
    - Dass der Heidekreis zum GRW-Fördergebiet gehört, steht auf der NBank-Seite „Niedersachsen Invest GRW“.
    - Energieeffizienz ist bewusst nicht genannt: Die NBank-Programme „Klimaschutz und Energieeffizienz“ und „Betriebliche Ressourceneffizienz“ nahmen am 20.11.2026 keine Anträge an.
