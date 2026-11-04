// „Wer hilft mir bei meinem Anliegen?“ – Ort → Thema → Anliegen → zuständige Stelle.
// Daten: assets/data/wegweiser.json (gepflegte Zuordnung mit Quellen und Prüfdatum).
// Es wird nichts gespeichert und nichts übertragen; die Auswahl lebt nur in dieser Seite.
(() => {
  const wurzel = document.querySelector('[data-wegweiser]');
  if (!wurzel) return;
  const buehne = wurzel.querySelector('.ww-buehne');
  const anzeige = [...wurzel.querySelectorAll('[data-schritt-anzeige]')];
  const THEMEN = [
    ['familie', 'Familie', 'Kita, Elterngeld, Kindergeld'],
    ['schule', 'Schule', 'Anmeldung, Schulweg'],
    ['wohnen', 'Wohnen', 'Umzug, Wohngeld, Bauen'],
    ['mobilitaet', 'Mobilität', 'Auto, Führerschein, Straße, Bus'],
    ['verwaltung', 'Verwaltung', 'Ausweis, Zeugnis, Gewerbe'],
  ];
  let D = null;
  const wahl = { ort: null, thema: null, anliegen: null };
  const RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const datum = iso => { const [j, m, t] = String(iso).split('-'); return t ? `${t}.${m}.${j}` : iso; };

  function szene(schritt, ...kinder) {
    anzeige.forEach(li => li.classList.toggle('an', +li.dataset.schrittAnzeige <= schritt));
    const s = el('div', 'ww-szene'); s.append(...kinder);
    buehne.replaceChildren(s);
    const fokus = s.querySelector('h3, .ww-frage'); if (fokus) { fokus.tabIndex = -1; fokus.focus({ preventScroll: true }); }
  }
  const knopfReihe = (eintraege, klick) => {
    const reihe = el('div', 'ww-auswahl');
    eintraege.forEach(([wert, titel, klein]) => {
      const b = el('button'); b.type = 'button'; b.append(titel);
      if (klein) b.append(el('small', null, klein));
      b.addEventListener('click', () => klick(wert));
      reihe.append(b);
    });
    return reihe;
  };
  const zurueck = ziel => { const b = el('button', 'ww-zurueck', 'Zurück'); b.type = 'button'; b.addEventListener('click', ziel); return b; };

  function schrittOrt() {
    wahl.ort = wahl.thema = wahl.anliegen = null;
    szene(1, el('p', 'ww-frage', 'Wo wohnst du?'),
      knopfReihe(Object.entries(D.orte).map(([id, o]) => [id, o.name, o.kreis === 'rotenburg' ? 'Landkreis Rotenburg (Wümme)' : 'Landkreis Heidekreis']), id => { wahl.ort = id; schrittThema(); }));
  }
  function schrittThema() {
    szene(2, el('p', 'ww-frage', 'Worum geht es?'),
      knopfReihe(THEMEN.filter(([id]) => D.anliegen.some(a => a.kategorie === id)), id => { wahl.thema = id; schrittAnliegen(); }),
      zurueck(schrittOrt));
  }
  function schrittAnliegen() {
    const liste = D.anliegen.filter(a => a.kategorie === wahl.thema);
    szene(3, el('p', 'ww-frage', 'Was genau brauchst du?'),
      knopfReihe(liste.map(a => [a.id, a.titel]), id => { wahl.anliegen = id; ergebnis(D.anliegen.find(a => a.id === id)); }),
      zurueck(schrittThema));
  }

  function ergebnis(a) {
    const ort = D.orte[wahl.ort];
    const z = a.zustaendig?.[wahl.ort];
    const box = el('div', 'ww-ergebnis');
    box.append(el('p', 'ww-pfad', `${ort.name} · ${THEMEN.find(t => t[0] === a.kategorie)?.[1] || ''}`), el('h3', null, a.titel));

    const feld = (titel, inhalt, extra = '') => { const f = el('div', 'ww-feld' + extra); f.append(el('b', null, titel)); f.append(...[].concat(inhalt)); box.append(f); return f; };
    const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
    const link = (u, text) => { const l = el('a', null, text || host(u)); l.href = u; l.target = '_blank'; l.rel = 'noopener'; return l; };
    const EBENE = { gemeinde: ort.art === 'Samtgemeinde' ? 'Samtgemeinde' : (ort.art || 'Gemeinde'), kreis: D.kreise?.[ort.kreis]?.name || 'Landkreis', bund: 'Bundesbehörde' };
    if (z) {
      const unklar = z.ebene === 'unklar';
      const teile = [el('p', null, z.stelle)];
      if (!unklar && EBENE[z.ebene]) teile.unshift(el('span', 'ww-ebene', EBENE[z.ebene]));
      feld(unklar ? 'Zuständigkeit nicht eindeutig' : 'Zuständig', teile, unklar ? ' ww-unklar' : '');
    } else {
      feld('Zuständigkeit nicht eindeutig', el('p', null, 'Dafür gibt es hier keine geprüfte Zuordnung. Frag bei deiner Stadt oder Gemeinde nach – sie hilft weiter oder nennt die richtige Stelle.'), ' ww-unklar');
    }
    if (a.schritt) feld('Nächster Schritt', el('p', null, a.schritt));
    const url = z?.url || ort.website;
    if (url) feld('Offizielle Anlaufstelle', link(url));
    // Unterlagen, die nur für bestimmte Orte oder einen Landkreis belegt sind, werden gefiltert.
    const unterlagen = (a.unterlagen || []).filter(u => u.orte ? u.orte.includes(wahl.ort) : u.kreis ? u.kreis === ort.kreis : true);
    if (unterlagen.length) {
      const ul = el('ul');
      unterlagen.forEach(u => {
        const li = el('li', null, u.text);
        if (u.quelle) { const s = el('small'); s.append(' · Quelle: ', link(u.quelle)); li.append(s); }
        ul.append(li);
      });
      feld('Unterlagen', ul);
    } else {
      feld('Unterlagen', el('p', null, 'Welche Unterlagen du brauchst, steht auf der Seite der zuständigen Stelle oder erfährst du dort direkt.'));
    }
    if (a.hinweis) feld('Hinweis', el('p', null, a.hinweis));
    if (a.quellen?.length) {
      const q = el('p', 'ww-quellen'); a.quellen.forEach(u => q.append(link(u)));
      feld('Quellen', q);
    }
    box.append(el('p', 'ww-stand', `Geprüft am ${datum(D.geprueft_am)}. Angaben ohne Gewähr – maßgeblich ist die Seite der zuständigen Stelle.`));

    const aktionen = el('div', 'ww-aktionen'), info = el('span', 'ww-kopiert');
    info.setAttribute('role', 'status');
    const kopieren = el('button', 'knopf', 'Kopieren'); kopieren.type = 'button';
    kopieren.addEventListener('click', async () => {
      const text = [a.titel + ` (${ort.name})`, z ? (z.ebene === 'unklar' ? 'Zuständigkeit nicht eindeutig: ' : 'Zuständig: ') + z.stelle : '', a.schritt ? 'Nächster Schritt: ' + a.schritt : '', url ? 'Link: ' + url : '',
        unterlagen.length ? 'Unterlagen:\n' + unterlagen.map(u => '- ' + u.text).join('\n') : '', a.hinweis ? 'Hinweis: ' + a.hinweis : '',
        'Geprüft am ' + datum(D.geprueft_am) + ' – Angaben ohne Gewähr.'].filter(Boolean).join('\n');
      try { await navigator.clipboard.writeText(text); info.textContent = 'Kopiert.'; }
      catch { info.textContent = 'Kopieren ging nicht – bitte markieren und kopieren.'; }
    });
    const drucken = el('button', 'knopf', 'Drucken'); drucken.type = 'button';
    drucken.addEventListener('click', () => { document.body.classList.add('druck-ww'); print(); setTimeout(() => document.body.classList.remove('druck-ww'), 500); });
    // Hauptaktion: zurück zur ersten Frage, ohne Neuladen. Auswahl und Ergebnis sind danach weg, der Fokus steht am Anfang.
    const neu = el('button', 'knopf knopf-haupt ww-neu', 'Neue Frage stellen'); neu.type = 'button';
    neu.addEventListener('click', () => { schrittOrt(); wurzel.scrollIntoView({ block: 'start', behavior: RUHIG ? 'auto' : 'smooth' }); });
    aktionen.append(kopieren, drucken, info);
    const ende = el('div', 'ww-ende'); ende.append(neu, aktionen);
    box.append(ende, zurueck(schrittAnliegen));
    szene(3, box);
  }

  fetch('assets/data/wegweiser.json').then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(d => { D = d; schrittOrt(); })
    .catch(() => { buehne.replaceChildren(el('p', null, 'Der Wegweiser konnte gerade nicht geladen werden.')); });
})();
