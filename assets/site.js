// Bewegung und kleine Helfer für Birhats Seite. Ohne Bibliotheken.
const RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FEIN = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const grenze = (x, a, b) => Math.min(b, Math.max(a, x));

// ---------- Menü ----------
const knopf = $('.menue-knopf'), menue = $('#menue');
const menueZu = () => { menue.classList.remove('offen'); document.body.classList.remove('menue-offen'); knopf.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
knopf.addEventListener('click', () => {
  const offen = !menue.classList.contains('offen');
  menue.classList.toggle('offen', offen);
  document.body.classList.toggle('menue-offen', offen);
  knopf.setAttribute('aria-expanded', String(offen));
  document.body.style.overflow = offen ? 'hidden' : '';
  if (offen) $('a', menue).focus({ preventScroll: true });
});
menue.addEventListener('click', e => { if (e.target.closest('a')) menueZu(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && menue.classList.contains('offen')) { menueZu(); knopf.focus(); } });

// ---------- Satz in Wörter zerlegen (leuchtet beim Scrollen Wort für Wort auf) ----------
const satz = $('[data-woerter]');
if (satz) {
  const teile = [];
  satz.childNodes.forEach(n => {
    const rot = n.nodeType === 1;
    n.textContent.split(/(\s+)/).forEach(t => {
      if (!t) return;
      if (/^\s+$/.test(t)) { teile.push(document.createTextNode(t)); return; }
      const s = document.createElement('span'); s.className = 'w' + (rot ? ' rot' : ''); s.textContent = t; teile.push(s);
    });
  });
  satz.replaceChildren(...teile);
}
const woerter = satz ? $$('.w', satz) : [];

// ---------- Marke oben links: Pfeilkreis oder Wortmarke ----------
// Solange das große Logo im Startbereich zu sehen ist (nicht unter der Kopfleiste), steht oben nur der Pfeilkreis.
// Hat es den sichtbaren Bereich nach oben verlassen, erscheint die Wortmarke. Unterseiten haben die Wortmarke fest.
{
  const kopf = $('.kopf'), heroLogo = $('.hero-logo');
  if (kopf && heroLogo && 'IntersectionObserver' in window) {
    let beobachter = null;
    const starten = () => {
      beobachter?.disconnect();
      const h = Math.round(kopf.getBoundingClientRect().height);
      beobachter = new IntersectionObserver(([e]) => {
        const darueber = !e.isIntersecting && e.boundingClientRect.bottom <= h + 1;
        kopf.classList.toggle('wort', darueber);
      }, { rootMargin: `-${h}px 0px 0px 0px` });
      beobachter.observe(heroLogo);
    };
    starten();
    let uhr = null;
    addEventListener('resize', () => { clearTimeout(uhr); uhr = setTimeout(starten, 200); });
  }
}

// ---------- Unterschrift: wie mit dem Stift geschrieben ----------
// Sie schreibt sich einmal, sobald sie ganz im Bild ist. Zusammenhängende Striche laufen ineinander. Vor jedem neu
// angesetzten Strich (B, t-Strich, i-Punkt, Unterstrich) gibt es eine kurze Pause wie beim Absetzen des Stifts.
const unterschrift = $('.unterschrift');
if (unterschrift && !RUHIG) {
  let t = 0, ende = null;
  const plan = $$('path', unterschrift).map(p => {
    const len = p.getTotalLength(), start = p.getPointAtLength(0);
    if (ende && Math.hypot(start.x - ende.x, start.y - ende.y) > 2) t += 0.13;   // Stift absetzen, neu ansetzen
    const dauer = Math.max(0.08, len / 1300);
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = len;
    const uebergang = `stroke-dashoffset ${dauer}s cubic-bezier(.45,.05,.55,.95) ${t}s`;
    t += dauer;
    ende = p.getPointAtLength(len);
    return { p, uebergang };
  });
  // Erst den leeren Zustand festschreiben, dann den Übergang setzen. Sonst würde schon das Leeren animiert.
  plan.forEach(({ p }) => getComputedStyle(p).strokeDashoffset);
  plan.forEach(({ p, uebergang }) => { p.style.transition = uebergang; });
  const striche = plan.map(({ p }) => p);
  const gruss = unterschrift.closest('.gruss') || unterschrift;
  let geplant = false;
  const pruefen = () => {
    geplant = false;
    const r = unterschrift.getBoundingClientRect();
    // erst, wenn sie ganz zu sehen ist, mit etwas Abstand zum unteren Rand (Browserleisten am Handy)
    if (r.top < 0 || r.bottom > innerHeight * 0.96) return;
    gruss.classList.add('sichtbar');
    striche.forEach(p => { p.style.strokeDashoffset = 0; });
    removeEventListener('scroll', planen); removeEventListener('resize', planen); removeEventListener('load', planen);
  };
  const planen = () => { if (!geplant) { geplant = true; requestAnimationFrame(pruefen); } };
  addEventListener('scroll', planen, { passive: true });
  addEventListener('resize', planen);
  addEventListener('load', planen);
  planen();
}

// ---------- Einblenden ----------
const zaehlen = el => {
  const ziel = +el.dataset.zahl, ab = +(el.dataset.ab || 0), jahr = ziel > 1900 && ziel < 2100;
  const zeig = v => { el.textContent = jahr ? String(v) : v.toLocaleString('de-DE'); };
  if (RUHIG) return zeig(ziel);
  const t0 = performance.now(), dauer = 1700;
  const schritt = t => { const p = grenze((t - t0) / dauer, 0, 1), e = 1 - Math.pow(1 - p, 4); zeig(Math.round(ab + (ziel - ab) * e)); if (p < 1) requestAnimationFrame(schritt); };
  requestAnimationFrame(schritt);
};
const beobachter = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('sichtbar');
  $$('[data-zahl]', e.target).forEach(zaehlen);
  beobachter.unobserve(e.target);
}), { rootMargin: '0px 0px -12% 0px' });
$$('.rv, .zeilen, .zahl, .karte, [data-reveal]').forEach(el => beobachter.observe(el));

// ---------- Ortsbänder: anhalten und weiterlaufen ----------
const baender = $('.baender'), pause = $('.band-pause');
if (baender && pause && !RUHIG) {
  pause.hidden = false;
  pause.addEventListener('click', () => {
    const an = baender.classList.toggle('pausiert');
    pause.setAttribute('aria-pressed', String(an));
    $('[data-text]', pause).textContent = an ? 'weiterlaufen' : 'anhalten';
  });
}

// ---------- Themen: Kacheln öffnen eine eigene Seite ----------
// Am PC klappt eine Kachel beim Darüberfahren auf. Ein Klick oder Tipp lässt sie über den ganzen Bildschirm wachsen,
// dann fächern sich die Inhalte auf. „Zur Übersicht“, Escape oder die Zurück-Geste am Handy lassen sie in die Kachel
// zurückschrumpfen. Die Texte stehen in index.html unter .thema-texte (ohne JavaScript dort sichtbar).
const bahnen = $$('.bahn');
const aktivSetzen = b => bahnen.forEach(x => x.classList.toggle('aktiv', x === b));
const themen = bahnen.map(b => ({ b, id: b.dataset.thema, nr: $('.nr', b)?.textContent || '', kurz: $('.kurz', b)?.textContent || '',
  farbe: b.style.getPropertyValue('--farbe').trim(), text: document.getElementById('thema-' + b.dataset.thema) })).filter(t => t.text);
let themaSeite = null, themaNr = -1, themaOffen = false, themaGepusht = false, themaDanach = null;
const pfeil = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

const themaSeiteBauen = () => {
  themaSeite = document.createElement('div');
  themaSeite.className = 'thema-seite';
  themaSeite.hidden = true;
  themaSeite.setAttribute('role', 'dialog');
  themaSeite.setAttribute('aria-modal', 'true');
  themaSeite.setAttribute('aria-labelledby', 'thema-seite-titel');
  themaSeite.innerHTML = `
    <div class="thema-leiste fach"><button type="button" class="thema-zurueck" data-zurueck>${pfeil('M15 5l-7 7 7 7')}Zur Übersicht</button><span class="thema-zaehler" data-zaehler></span></div>
    <div class="thema-buehne">
      <header class="thema-kopf"><span class="thema-nr fach" data-nr aria-hidden="true"></span><span class="thema-symbol fach" data-symbol aria-hidden="true"></span><h2 class="fach" id="thema-seite-titel" data-titel></h2></header>
      <div class="thema-inhalt" data-inhalt></div>
      <div class="thema-fuss fach">
        <p>Fragen oder Ideen zu diesem Thema?</p>
        <div class="thema-aktionen"><a class="knopf thema-hell" href="#frage-stellen" data-ziel>Schreib mir</a><a class="knopf" href="#kontakt" data-ziel>Lad mich ein</a></div>
        <button type="button" class="thema-weiter" data-weiter><span><small>Nächster Schwerpunkt</small><b data-weiter-name></b></span>${pfeil('M5 12h13M13 6l6 6-6 6')}</button>
      </div>
    </div>`;
  document.body.append(themaSeite);
  $('[data-zurueck]', themaSeite).addEventListener('click', () => themaZurueck());
  $('[data-weiter]', themaSeite).addEventListener('click', () => themaWechseln((themaNr + 1) % themen.length));
  $$('[data-ziel]', themaSeite).forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const ziel = $(a.getAttribute('href'));
    // Ziel ohne Einblende-Bewegung berechnen (offsetTop statt Bildschirmlage), Abstand für die Kopfleiste abziehen
    themaZurueck(() => {
      if (!ziel) return;
      let y = 0;
      for (let el = ziel; el; el = el.offsetParent) y += el.offsetTop;
      const abstand = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      scrollTo({ top: y - abstand, behavior: RUHIG ? 'auto' : 'smooth' });
    });
  }));
  themaSeite.addEventListener('keydown', e => { if (e.key === 'Escape') themaZurueck(); });
};

const themaFuellen = i => {
  const t = themen[i], naechstes = themen[(i + 1) % themen.length];
  themaSeite.style.setProperty('--farbe', t.farbe);
  $('[data-nr]', themaSeite).textContent = t.nr;
  $('[data-zaehler]', themaSeite).textContent = `${t.nr} / ${String(themen.length).padStart(2, '0')}`;
  $('[data-symbol]', themaSeite).replaceChildren($('svg', t.b).cloneNode(true));
  $('[data-titel]', themaSeite).textContent = $('h3', t.text).textContent;
  const inhalt = $('.thema-text-inhalt', t.text).cloneNode(true);
  [...inhalt.children].forEach(el => { if (!el.classList.contains('stationen')) el.classList.add('fach'); });
  $('[data-inhalt]', themaSeite).replaceChildren(...inhalt.children);
  $('[data-weiter-name]', themaSeite).textContent = `${naechstes.nr} ${naechstes.kurz}`;
  // Reihenfolge des Auftritts = Leserichtung, die Stationen-Karten mitgezählt
  $$('.fach, .stationen li', themaSeite).forEach((el, j) => el.style.setProperty('--j', j));
};

// Alles außer der Themenseite ruht, solange sie offen ist (kein Scrollen, kein Tabben dahinter)
const themaSperren = an => {
  // Breite der Scrollleiste ausgleichen, damit am PC nichts springt und die Seite bis zum rechten Rand reicht
  const leiste = an ? innerWidth - document.documentElement.clientWidth : 0;
  [...document.body.children].forEach(el => { if (el !== themaSeite && el.tagName !== 'SCRIPT') el.inert = an; });
  document.body.style.overflow = an ? 'hidden' : '';
  document.body.style.paddingRight = leiste > 0 ? leiste + 'px' : '';
};
const kachelAusschnitt = b => {
  const r = b.getBoundingClientRect(), w = document.documentElement.clientWidth, h = innerHeight, n = v => Math.max(0, v);
  return `inset(${n(r.top)}px ${n(w - r.right)}px ${n(h - r.bottom)}px ${n(r.left)}px round 22px)`;
};

const themaOeffnen = (i, { animiert = true, verlauf = true } = {}) => {
  if (!themaSeite) themaSeiteBauen();
  themaNr = i; themaFuellen(i);
  themaSeite.classList.remove('da', 'zu');
  themaSeite.hidden = false;
  themaSeite.scrollTop = 0;
  themaSperren(true);
  if (animiert && !RUHIG) {
    themaSeite.style.transition = 'none';
    themaSeite.style.clipPath = kachelAusschnitt(themen[i].b);
    themaSeite.getBoundingClientRect();
    themaSeite.style.transition = '';
    requestAnimationFrame(() => { themaSeite.style.clipPath = 'inset(0px 0px 0px 0px round 0px)'; themaSeite.classList.add('da'); });
  } else {
    themaSeite.style.clipPath = '';
    themaSeite.classList.add('da');
  }
  if (verlauf) { history.pushState({ thema: themen[i].id }, '', '#thema-' + themen[i].id); themaGepusht = true; }
  themaOffen = true;
  $('[data-zurueck]', themaSeite).focus({ preventScroll: true });
};

const themaSchliessen = () => {
  if (!themaOffen) return;
  themaOffen = false;
  const b = themen[themaNr].b, danach = themaDanach;
  themaDanach = null;
  const fertig = () => {
    themaSeite.hidden = true;
    themaSeite.classList.remove('zu');
    themaSeite.style.clipPath = '';
    themaSperren(false);
    b.focus({ preventScroll: true });
    if (danach) danach();
  };
  themaSeite.classList.remove('da');
  themaSeite.classList.add('zu');
  if (RUHIG) return fertig();
  aktivSetzen(b);
  setTimeout(() => { themaSeite.style.clipPath = kachelAusschnitt(b); }, 150);
  setTimeout(fertig, 150 + 760);
};

// Zurück über den Browserverlauf, damit die Zurück-Geste am Handy dasselbe tut wie der Knopf
const themaZurueck = danach => {
  themaDanach = danach || null;
  if (themaGepusht) { themaGepusht = false; history.back(); }
  else { history.replaceState(null, '', location.pathname + location.search); themaSchliessen(); }
};

const themaWechseln = i => {
  if (!themaOffen) return;
  themaSeite.classList.remove('da');
  themaSeite.classList.add('zu');
  history.replaceState({ thema: themen[i].id }, '', '#thema-' + themen[i].id);
  setTimeout(() => {
    themaNr = i; themaFuellen(i);
    themaSeite.scrollTop = 0;
    themaSeite.classList.remove('zu');
    themaSeite.getBoundingClientRect();
    themaSeite.classList.add('da');
    $('[data-zurueck]', themaSeite).focus({ preventScroll: true });
  }, RUHIG ? 0 : 200);
};

addEventListener('popstate', e => {
  const i = themen.findIndex(t => t.id === e.state?.thema);
  if (themaOffen && i < 0) themaSchliessen();
  else if (!themaOffen && i >= 0) { themaOeffnen(i, { verlauf: false }); themaGepusht = true; }
});

let hoverUhr = null;
bahnen.forEach(b => {
  if (FEIN) {
    b.addEventListener('mouseenter', () => { clearTimeout(hoverUhr); hoverUhr = setTimeout(() => aktivSetzen(b), 90); });
    b.addEventListener('mouseleave', () => clearTimeout(hoverUhr));
  }
  b.addEventListener('focus', () => aktivSetzen(b));
  b.addEventListener('click', () => { const i = themen.findIndex(t => t.b === b); if (i >= 0) { aktivSetzen(b); themaOeffnen(i); } });
});
// Direkt über eine Adresse wie …/#thema-bildung aufgerufen: gleich die Themenseite zeigen
{ const i = themen.findIndex(t => location.hash === '#thema-' + t.id); if (i >= 0) themaOeffnen(i, { animiert: false, verlauf: false }); }

// ---------- Aufklappbereiche „Mein politischer Weg“ / „Mein beruflicher Weg“ (ohne JavaScript offen) ----------
$$('.akk').forEach(akk => {
  const k = $('.akk-knopf', akk);
  akk.classList.add('zu'); k.setAttribute('aria-expanded', 'false');
  k.addEventListener('click', () => {
    const offen = akk.classList.toggle('zu') === false;
    k.setAttribute('aria-expanded', String(offen));
  });
});

// ---------- Wahlkreis: Ortskarte ----------
const ortKarte = $('.ort-karte');
let ORTE = null;
fetch('assets/data/orte.json').then(r => r.ok ? r.json() : null).then(d => { ORTE = d; }).catch(() => {});
const zeigeOrt = id => {
  if (!ortKarte) return;
  $$('[data-ort]').forEach(el => {
    const an = el.dataset.ort === id;
    el.classList.toggle('gewaehlt', an);
    if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') el.setAttribute('aria-pressed', String(an));
  });
  const o = ORTE?.orte?.[id];
  ortKarte.classList.remove('neu'); void ortKarte.offsetWidth; ortKarte.classList.add('neu');
  ortKarte.replaceChildren();
  const h = document.createElement('h3'); h.textContent = o ? o.name : ($(`button[data-ort="${id}"] b`)?.textContent || id);
  ortKarte.append(h);
  if (!o) { const p = document.createElement('p'); p.textContent = 'Die Ortsdaten konnten gerade nicht geladen werden.'; ortKarte.append(p); return; }
  const p = document.createElement('p'); p.textContent = o.beschreibung; ortKarte.append(p);
  const link = (url, text) => { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = text; return a; };
  const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
  const links = document.createElement('p'); links.className = 'ort-links';
  if (o.website) links.append(link(o.website, host(o.website)));
  const k = ORTE.kreise?.[o.kreis];
  if (k?.website) links.append(link(k.website, k.name));
  if (links.childNodes.length) ortKarte.append(links);
};
$$('[data-ort]').forEach(el => {
  el.addEventListener('click', () => zeigeOrt(el.dataset.ort));
  if (el.getAttribute('role') === 'button') el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeOrt(el.dataset.ort); } });
});

// ---------- Instagram-Karussell: wischen, Pfeile, Pfeiltasten. Bilder ab Nr. 2 laden erst bei Bedarf ----------
$$('[data-karussell]').forEach(k => {
  const ul = $('.insta-folien', k), folien = [...ul.children], n = folien.length;
  const zahl = $('.insta-zahl', k), status = $('[data-karussell-status]', k), punkte = $$('.insta-punkte i', k);
  const zurueck = $('.insta-zurueck', k), weiter = $('.insta-weiter', k);
  let akt = 0, ziel = null, zielUhr = 0;   // ziel: laufendes Blättern per Pfeil, bis dahin Scroll-Zwischenstände ignorieren
  const laden = i => { const img = folien[i]?.querySelector('img[data-src]'); if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); } };
  const zeigen = (i, ansagen) => {
    akt = i;
    zahl.textContent = `${i + 1}/${n}`;
    if (ansagen) status.textContent = `Bild ${i + 1} von ${n}`;
    punkte.forEach((p, j) => p.classList.toggle('an', j === i));
    zurueck.disabled = i === 0; weiter.disabled = i === n - 1;
    laden(i); laden(i + 1);
  };
  const gehe = i => {
    i = grenze(i, 0, n - 1); laden(i); ziel = i;
    clearTimeout(zielUhr); zielUhr = setTimeout(() => { ziel = null; }, 900);
    ul.scrollTo({ left: i * ul.clientWidth, behavior: RUHIG ? 'auto' : 'smooth' });
    zeigen(i, true);
  };
  ul.addEventListener('pointerdown', () => { ziel = null; });
  zurueck.addEventListener('click', () => gehe(akt - 1));
  weiter.addEventListener('click', () => gehe(akt + 1));
  ul.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); gehe(akt + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); gehe(akt - 1); }
  });
  let geplant = false;
  ul.addEventListener('scroll', () => {
    if (geplant) return; geplant = true;
    requestAnimationFrame(() => { geplant = false; const i = grenze(Math.round(ul.scrollLeft / ul.clientWidth), 0, n - 1); if (ziel !== null) { if (Math.abs(ul.scrollLeft - ziel * ul.clientWidth) < 2) ziel = null; return; } if (i !== akt) zeigen(i, false); else laden(i + 1); });
  }, { passive: true });
  // Das zweite Bild vorladen, sobald die Kachel in die Nähe kommt, damit das erste Wischen flüssig ist.
  const nah = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { laden(1); nah.disconnect(); } }, { rootMargin: '300px' });
  nah.observe(k);
});

// ---------- Scroll-Effekte ----------
const kopf = $('.kopf'), balken = $('.fortschritt i');
const heroFoto = $('[data-parallax]'), heide = $('.wahlkreis-bg'), wahlkreis = $('.wahlkreis'), claim = $('.claim');
const breit = matchMedia('(min-width: 901px)');
function scrollen() {
  const y = scrollY, h = innerHeight;
  kopf.classList.toggle('voll', y > 40);
  balken.style.transform = `scaleX(${grenze(y / (document.documentElement.scrollHeight - h), 0, 1)})`;
  if (RUHIG) return;
  if (heroFoto && breit.matches && y < h * 1.2) heroFoto.style.transform = `translate3d(0,${y * heroFoto.dataset.parallax}px,0)`;
  if (claim && woerter.length) {
    const r = claim.getBoundingClientRect();
    const p = grenze((h * 0.85 - r.top) / (r.height * 0.75), 0, 1);
    const n = Math.round(p * woerter.length);
    woerter.forEach((w, i) => w.classList.toggle('an', i < n));
  }
  if (heide && wahlkreis) {
    const r = wahlkreis.getBoundingClientRect();
    if (r.bottom > 0 && r.top < h) heide.style.transform = `translate3d(0,${r.top * -0.1}px,0)`;
  }
}
let geplant = false;
addEventListener('scroll', () => { if (geplant) return; geplant = true; requestAnimationFrame(() => { geplant = false; scrollen(); }); }, { passive: true });
addEventListener('resize', scrollen);
scrollen();

// ---------- Status aus der Wissensbasis (zentral in assets/data/wissen.json) ----------
fetch('assets/data/wissen.json').then(r => r.ok ? r.json() : null).then(w => {
  const s = w?.status?.aktuell, k = $('[data-status-kicker]'), antwort = $('[data-status-text]');
  if (!s) return;
  if (k && s === 'nominiert') k.textContent = 'SPD-Kandidat · Landtagswahl 2027';
  if (k && s === 'gewaehlt') k.textContent = 'Ihr Abgeordneter im Landtag';
  if (antwort && w.status.texte?.[s]) antwort.textContent = w.status.texte[s];
}).catch(() => {});

// ---------- Frage per Mail ----------
// Die Seite verschickt selbst nichts: Das Formular öffnet das Mailprogramm mit fertiger Mail an Birhat.
// Die Adresse steht geteilt im Formular (data-an, data-bei), damit Sammelprogramme sie nicht direkt finden.
const mailForm = $('[data-mail-form]');
if (mailForm) {
  const hinweis = $('[data-mail-hinweis]'), feld = mailForm.elements.frage;
  const adresse = `${mailForm.dataset.an}@${mailForm.dataset.bei}`;
  mailForm.addEventListener('submit', e => {
    e.preventDefault();
    const frage = feld.value.trim(), name = mailForm.elements.name.value.trim();
    if (!frage) { feld.value = ''; feld.reportValidity(); return; }
    const text = frage + (name ? `\n\n${name}` : '');
    location.href = `mailto:${adresse}?subject=${encodeURIComponent('Frage über deine Website')}&body=${encodeURIComponent(text)}`;
    const p = document.createElement('p');
    p.append('Dein Mailprogramm sollte sich jetzt mit deiner Frage öffnen. Dort nur noch auf Senden tippen. Es öffnet sich nichts? Dann kopier deine Frage und schick sie an ');
    const a = document.createElement('a'); a.href = 'mailto:' + adresse; a.textContent = adresse;
    p.append(a, '.');
    const kopieren = document.createElement('button'); kopieren.type = 'button'; kopieren.className = 'knopf'; kopieren.textContent = 'Frage kopieren';
    const info = document.createElement('span'); info.setAttribute('role', 'status');
    kopieren.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); info.textContent = 'Kopiert.'; }
      catch { info.textContent = 'Kopieren ging nicht. Bitte markieren und kopieren.'; }
    });
    hinweis.replaceChildren(p, kopieren, info);
  });
}
