// „Frag Heidi“ – KI-Assistentin mit festen, geprüften Antworten als Rückfall.
// Die KI läuft über einen eigenen Dienst (Ordner ki-dienst/), dessen Adresse in assets/data/ki.json steht.
// Ist dort keine Adresse eingetragen oder der Dienst nicht erreichbar, gibt es nur die festen Antworten aus
// assets/data/wissen.json – klar als „Feste Antwort“ gekennzeichnet. Gespräche werden nirgends gespeichert.
(() => {
  const chat = document.querySelector('[data-chat]');
  if (!chat) return;
  const $ = s => chat.querySelector(s);
  const verlauf = $('[data-chat-verlauf]'), statusEl = $('[data-chat-status]'), vorschlaege = $('[data-chat-vorschlaege]');
  const form = $('[data-chat-form]'), feld = form.querySelector('textarea'), recht = $('[data-chat-recht]');
  let WISSEN = null, KI = { endpunkt: '' }, einverstanden = false, laeuft = false, wartend = null;
  const gespraech = []; // nur im Arbeitsspeicher, für Rückfragen

  const STICHWORTE = {
    wer: ['wer ist', 'birhat', 'person', 'vorstellen', 'über birhat'],
    beruf: ['beruf', 'arbeitet', 'arbeit', 'job', 'sozialarbeiter'],
    nominierung: ['nominierung', 'aufstellung', 'wahlkreiskonferenz', 'ablauf', 'wie wird man'],
    status: ['nominiert', 'schon kandidat', 'bereits kandidat', 'aufgestellt'],
    orte: ['orte', 'wahlkreis', 'gemeinden', 'gehören', 'welche städte'],
    stimmen: ['erststimme', 'zweitstimme', 'zwei stimmen', 'stimmen'],
    briefwahl: ['briefwahl', 'wahlschein', 'per post', 'briefwahlunterlagen'],
  };

  const datum = iso => { const [j, m, t] = String(iso).split('-'); return t ? `${t}.${m}.${j}` : iso; };
  const absaetze = text => String(text).split(/\n{2,}|\n/).map(s => s.trim()).filter(Boolean);

  function nachricht(wer, text, { quellen = [], art = '', fehler = false } = {}) {
    const li = document.createElement('li');
    li.className = 'msg ' + (wer === 'du' ? 'msg-du' : 'msg-heidi') + (fehler ? ' msg-fehler' : '');
    const kopf = document.createElement('span'); kopf.className = 'msg-wer';
    kopf.textContent = wer === 'du' ? 'Du' : art === 'fest' ? 'Feste Antwort · geprüft' : art === 'hinweis' ? 'Heidi · Hinweis' : 'Heidi · KI';
    const inhalt = document.createElement('div'); inhalt.className = 'msg-text';
    absaetze(text).forEach(a => { const p = document.createElement('p'); p.textContent = a; inhalt.append(p); });
    li.append(kopf, inhalt);
    if (quellen.length) {
      const q = document.createElement('div'); q.className = 'msg-quellen';
      quellen.forEach(({ titel, url }) => {
        const z = document.createElement('span'); z.append('Quelle: ');
        if (url && /^https:\/\//.test(url)) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = titel; z.append(a); }
        else z.append(titel);
        q.append(z);
      });
      if (WISSEN?.stand) { const s = document.createElement('span'); s.textContent = 'Stand: ' + datum(WISSEN.stand); q.append(s); }
      li.append(q);
    }
    verlauf.append(li);
    verlauf.scrollTop = verlauf.scrollHeight;
    return li;
  }

  const quellenVon = ids => (ids || []).map(id => WISSEN?.quellen?.[id]).filter(Boolean);
  const festeAntwort = eintrag => {
    const text = eintrag.antwort === '@status' ? WISSEN.status.texte[WISSEN.status.aktuell] : eintrag.antwort;
    nachricht('heidi', text, { quellen: quellenVon(eintrag.quellen), art: 'fest' });
  };
  const passendeFrage = text => {
    const t = text.toLowerCase();
    let best = null, punkte = 0;
    for (const e of WISSEN?.faq || []) {
      const p = (STICHWORTE[e.id] || []).filter(w => t.includes(w)).length + (t.trim() === e.frage.toLowerCase() ? 5 : 0);
      if (p > punkte) { best = e; punkte = p; }
    }
    return best;
  };

  function einwilligungZeigen(frage) {
    wartend = frage;
    if (chat.querySelector('.einwilligung')) return;
    const box = document.createElement('div'); box.className = 'einwilligung';
    const p = document.createElement('p');
    p.textContent = 'Bevor Heidi antwortet: Deine Frage wird über einen Dienst dieser Website bei Cloudflare an Anthropic (USA) geschickt. Dort erzeugt eine KI die Antwort. Gespeichert wird sie nicht dauerhaft. Bitte gib keine persönlichen Daten ein.';
    const ja = document.createElement('button'); ja.type = 'button'; ja.className = 'knopf knopf-haupt'; ja.textContent = 'Einverstanden, Frage senden';
    const nein = document.createElement('button'); nein.type = 'button'; nein.className = 'knopf'; nein.textContent = 'Lieber nur feste Antworten';
    const reihe = document.createElement('div'); reihe.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap'; reihe.append(ja, nein);
    box.append(p, reihe);
    vorschlaege.before(box);
    ja.addEventListener('click', () => { einverstanden = true; box.remove(); const f = wartend; wartend = null; if (f) frageKI(f); });
    nein.addEventListener('click', () => {
      box.remove(); const f = wartend; wartend = null;
      if (!f) return;
      const e = passendeFrage(f);
      e ? festeAntwort(e) : nachricht('heidi', 'Dazu habe ich keine feste Antwort. Probier eine der vorgeschlagenen Fragen. Bei Fragen zu Ämtern und Anträgen hilft dir der Wegweiser weiter oben.', { art: 'hinweis' });
    });
    ja.focus();
  }

  async function frageKI(frage) {
    if (laeuft) return;
    laeuft = true;
    const denkt = document.createElement('li'); denkt.className = 'msg msg-heidi';
    denkt.innerHTML = '<span class="msg-wer">Heidi · KI</span><span class="denkt">Heidi sucht in den geprüften Angaben<i></i><i></i><i></i></span>';
    verlauf.append(denkt); verlauf.scrollTop = verlauf.scrollHeight;
    const ctl = new AbortController(), uhr = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch(KI.endpunkt, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ frage, verlauf: gespraech.slice(-6) }),
      });
      const d = await r.json().catch(() => ({}));
      denkt.remove();
      if (!r.ok) throw Object.assign(new Error(d.fehler || 'Fehler'), { status: r.status });
      nachricht('heidi', d.antwort, { quellen: d.quellen || [] });
      gespraech.push({ rolle: 'du', text: frage }, { rolle: 'heidi', text: d.antwort });
    } catch (err) {
      denkt.remove();
      const e = passendeFrage(frage);
      const grund = err.status === 429 ? 'Gerade kommen zu viele Fragen auf einmal. Versuch es bitte in ein paar Minuten noch einmal.'
        : 'Heidi ist gerade nicht erreichbar.';
      nachricht('heidi', grund + (e ? ' Hier ist die geprüfte feste Antwort dazu:' : ''), { fehler: true, art: 'fest' });
      if (e) festeAntwort(e);
    } finally { clearTimeout(uhr); laeuft = false; }
  }

  function fragen(frage) {
    frage = frage.trim().slice(0, 400);
    if (!frage || laeuft) return;
    nachricht('du', frage);
    if (KI.endpunkt) {
      if (!einverstanden) return einwilligungZeigen(frage);
      return frageKI(frage);
    }
    const e = passendeFrage(frage);
    if (e) festeAntwort(e);
    else nachricht('heidi', 'Dazu habe ich keine feste Antwort. Die KI ist noch nicht eingerichtet, deshalb kann ich nur die vorgeschlagenen Fragen beantworten. Bei Fragen zu Ämtern und Anträgen hilft dir der Wegweiser weiter oben.', { art: 'hinweis' });
  }

  form.addEventListener('submit', e => { e.preventDefault(); fragen(feld.value); feld.value = ''; feld.style.height = ''; });
  feld.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  feld.addEventListener('input', () => { feld.style.height = 'auto'; feld.style.height = Math.min(feld.scrollHeight, 140) + 'px'; });
  // Am Handy: Eingabefeld über der Bildschirmtastatur halten
  feld.addEventListener('focus', () => setTimeout(() => form.scrollIntoView({ block: 'end', behavior: 'smooth' }), 300));
  window.visualViewport?.addEventListener('resize', () => { if (document.activeElement === feld) form.scrollIntoView({ block: 'end' }); });

  Promise.all([
    fetch('assets/data/wissen.json').then(r => r.json()),
    fetch('assets/data/ki.json').then(r => r.ok ? r.json() : {}).catch(() => ({})),
  ]).then(([w, k]) => {
    WISSEN = w; KI = { endpunkt: '', ...k };
    if (KI.endpunkt && !/^https:\/\//.test(KI.endpunkt)) KI.endpunkt = '';
    statusEl.classList.toggle('fest', !KI.endpunkt);
    statusEl.textContent = KI.endpunkt
      ? 'Heidi ist eine KI. Antworten können Fehler enthalten – im Zweifel gilt die genannte Quelle.'
      : 'Die KI ist noch nicht eingerichtet. Du bekommst geprüfte feste Antworten.';
    recht.textContent = KI.endpunkt
      ? 'Heidi spricht nicht für Birhat, macht keine Zusagen und leitet nichts weiter. Fragen gehen über Cloudflare an Anthropic (USA) und werden nicht dauerhaft gespeichert. '
      : 'Feste Antworten kommen direkt von dieser Website, es wird nichts übertragen. ';
    const mehr = document.createElement('a'); mehr.href = 'datenschutz.html#ki'; mehr.textContent = 'Mehr im Datenschutz'; recht.append(mehr);
    w.faq.forEach(e => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = e.frage;
      b.addEventListener('click', () => fragen(e.frage));
      vorschlaege.append(b);
    });
  }).catch(() => {
    statusEl.textContent = 'Heidi konnte gerade nicht geladen werden.';
    form.hidden = true;
  });
})();
