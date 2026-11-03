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

// ---------- Unterschrift: Striche nacheinander schreiben ----------
const unterschrift = $('.unterschrift');
if (unterschrift && !RUHIG) {
  let t = 0;
  $$('path', unterschrift).forEach(p => {
    const len = p.getTotalLength();
    const dauer = Math.max(0.05, len / 1400);   // gleichmäßige, zügige Schreibgeschwindigkeit
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = len;
    p.style.transition = `stroke-dashoffset ${dauer}s cubic-bezier(.4,0,.6,1) ${t}s`;
    t += dauer + 0.015;
  });
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
  if (e.target.classList.contains('gruss')) $$('path', e.target).forEach(p => { p.style.strokeDashoffset = 0; });
  beobachter.unobserve(e.target);
}), { rootMargin: '0px 0px -12% 0px' });
$$('.rv, .zeilen, .zahl, .karte, [data-reveal]').forEach(el => beobachter.observe(el));
// Die Unterschrift startet, sobald sie ins Bild kommt.
const grussBeobachter = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('sichtbar');
  $$('path', e.target).forEach(p => { p.style.strokeDashoffset = 0; });
  grussBeobachter.unobserve(e.target);
}), { threshold: 0.2 });
$$('.gruss').forEach(el => grussBeobachter.observe(el));

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

// ---------- Themen-Bahnen: eine ist offen ----------
const bahnen = $$('.bahn');
const oeffne = b => bahnen.forEach(x => { const an = x === b; x.classList.toggle('aktiv', an); x.setAttribute('aria-expanded', String(an)); });
bahnen.forEach(b => {
  b.addEventListener('click', () => oeffne(b));
  b.addEventListener('focus', () => oeffne(b));
});

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
    if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(an));
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
  const k = $('[data-status-kicker]');
  if (!w || !k) return;
  const s = w.status?.aktuell;
  if (s === 'nominiert') k.textContent = 'SPD-Kandidat · Landtagswahl 2027';
  if (s === 'gewaehlt') k.textContent = 'Ihr Abgeordneter im Landtag';
}).catch(() => {});
