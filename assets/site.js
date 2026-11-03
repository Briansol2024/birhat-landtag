// Bewegung für Birhats Seite: Einblenden, Zähler, Scroll-Effekte, Themen-Bahnen, Menü. Ohne Bibliotheken.
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
});
menue.addEventListener('click', e => { if (e.target.closest('a')) menueZu(); });
addEventListener('keydown', e => { if (e.key === 'Escape') menueZu(); });

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

// ---------- Einblenden ----------
const zaehlen = el => {
  const ziel = +el.dataset.zahl, ab = +(el.dataset.ab || 0), jahr = ziel > 1900 && ziel < 2100;
  const zeig = v => { el.textContent = jahr ? String(v) : v.toLocaleString('de-DE'); };
  if (RUHIG) return zeig(ziel);
  const t0 = performance.now(), dauer = 1800;
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

// ---------- Themen-Bahnen: eine ist offen ----------
const bahnen = $$('.bahn');
const oeffne = b => bahnen.forEach(x => { const an = x === b; x.classList.toggle('aktiv', an); x.setAttribute('aria-expanded', String(an)); });
bahnen.forEach(b => {
  b.addEventListener('click', () => oeffne(b));
  b.addEventListener('focus', () => oeffne(b));
  if (FEIN) b.addEventListener('mouseenter', () => oeffne(b));
});

// ---------- Scroll-Effekte ----------
const kopf = $('.kopf'), balken = $('.fortschritt i');
const heroBild = $('[data-parallax]'), heide = $('.wahlkreis-bg'), wahlkreis = $('.wahlkreis');
const ueberImg = $('[data-innen-parallax]'), ueberBild = $('.ueber-bild');
const claim = $('.claim'), weg = $('.weg'), spur = $('.weg-spur'), linie = $('.weg-linie i');
let wegWeite = 0;

function wegMessen() {
  if (!weg) return;
  if (RUHIG || innerWidth < 900) { weg.style.height = ''; spur.style.transform = ''; wegWeite = 0; return; }
  wegWeite = Math.max(0, spur.scrollWidth - innerWidth);
  weg.style.height = (wegWeite + innerHeight) + 'px';
}

function scrollen() {
  const y = scrollY, h = innerHeight;
  kopf.classList.toggle('voll', y > 40);
  balken.style.transform = `scaleX(${grenze(y / (document.documentElement.scrollHeight - h), 0, 1)})`;
  if (RUHIG) return;
  if (heroBild && y < h * 1.2) heroBild.style.transform = `translate3d(0,${y * heroBild.dataset.parallax}px,0)`;
  if (claim && woerter.length) {
    const r = claim.getBoundingClientRect();
    const p = grenze((h * 0.85 - r.top) / (r.height * 0.75), 0, 1);
    const n = Math.round(p * woerter.length);
    woerter.forEach((w, i) => w.classList.toggle('an', i < n));
  }
  if (wegWeite) {
    const r = weg.getBoundingClientRect();
    const p = grenze(-r.top / (weg.offsetHeight - h), 0, 1);
    spur.style.transform = `translate3d(${-p * wegWeite}px,0,0)`;
    linie.style.transform = `scaleX(${p})`;
  }
  if (ueberImg && ueberBild) {
    const r = ueberBild.getBoundingClientRect();
    if (r.bottom > 0 && r.top < h) ueberImg.style.transform = `translate3d(0,${(r.top / h) * -60}px,0)`;
  }
  if (heide && wahlkreis) {
    const r = wahlkreis.getBoundingClientRect();
    if (r.bottom > 0 && r.top < h) heide.style.transform = `translate3d(0,${r.top * -0.12}px,0)`;
  }
}
let geplant = false;
addEventListener('scroll', () => { if (geplant) return; geplant = true; requestAnimationFrame(() => { geplant = false; scrollen(); }); }, { passive: true });
addEventListener('resize', () => { wegMessen(); scrollen(); });
addEventListener('load', () => { wegMessen(); scrollen(); });
document.fonts?.ready.then(() => { wegMessen(); scrollen(); });
wegMessen(); scrollen();

// ---------- Maus: Knöpfe werden leicht angezogen ----------
if (FEIN && !RUHIG) {
  $$('.magnet').forEach(m => {
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    m.addEventListener('pointerleave', () => { m.style.transform = ''; });
  });
}
