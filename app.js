/* Mide versos · interfaz: medir paso a paso, palmadas, práctica, banco, guía,
   ficha imprimible, modo pizarra, contadores anónimos, abeja de mejoras y puente a ColmenIA. */
(function () {
'use strict';
var M = window.Metrica;
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function baraja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

/* ===================== Contadores (abacus, anónimos) ===================== */
var Q = new URLSearchParams(location.search);
var CANAL = (Q.get('c') || '').replace(/[^a-z]/gi, '').slice(0, 6).toLowerCase();
if (CANAL) ls('mv-canal', CANAL); else CANAL = ls('mv-canal') || '';
var NO_CONTAR = Q.get('yo') === '1';
if (NO_CONTAR) ls('mv-no-contar', '1'); if (ls('mv-no-contar')) NO_CONTAR = true;
var CB = 'https://abacus.jasoncameron.dev/hit/foniafonia-versos/';
function cuenta(k) {
  if (NO_CONTAR) return;
  k = String(k).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 60);
  try {
    new Image().src = CB + 'mv_' + k;
    if (CANAL && /^(aperturas|personas|skool$|medir$|practica_acaba)/.test(k)) new Image().src = CB + 'mv_c_' + CANAL + '_' + k;
  } catch (e) {}
}
var esNuevaVisita = !!Q.get('c');
cuenta('aperturas');
if (!ls('mv-visto')) { ls('mv-visto', '1'); cuenta('personas'); }
var _usados = {};
function cuentaUnaVez(k) { if (_usados[k]) return; _usados[k] = 1; cuenta(k); }

/* ===================== Puente a ColmenIA ===================== */
var SK = 'https://www.skool.com/logopedia-7339/about';   // portada: nunca con ?c=
function puentes(raiz) {
  (raiz || document).querySelectorAll('a[data-sk]').forEach(function (a) {
    if (a.dataset.skOk) return; a.dataset.skOk = '1'; a.href = SK;
    a.addEventListener('click', function () { cuenta('skool'); cuenta('skool_' + a.getAttribute('data-sk')); });
  });
}
function bloquePuente(lugar, titulo) {
  return '<div class="puente" style="margin-top:14px;text-align:left"><div class="logos"><img src="img/colmenia-logo.webp" alt="ColmenIA"><img src="img/logo-fonia.jpg" alt="Gabinete Fönia"></div>' +
    '<b>' + esc(titulo || '¿Te ha servido? Pide lo siguiente en ColmenIA') + '</b>' +
    '<p>Mide versos nació porque unas maestras de PT lo pidieron en ColmenIA. Allí cada docente cuenta qué necesita en su aula (otra ficha, otro nivel, los versos de su temario) y lo pensamos y mejoramos entre todos.</p>' +
    '<a class="btn oro" data-sk="' + esc(lugar) + '" target="_blank" rel="noopener">Entrar en ColmenIA</a></div>';
}

/* ===================== Vistas ===================== */
function vista(v) {
  ['medir', 'practicar', 'banco', 'guia'].forEach(function (x) { $('v-' + x).classList.toggle('oculto', x !== v); });
  document.querySelectorAll('nav.pest button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v); });
  if (v !== 'medir') cuentaUnaVez('vista_' + v);
  paraPalmas();
  window.scrollTo(0, 0);
}
document.querySelectorAll('nav.pest button').forEach(function (b) { b.addEventListener('click', function () { vista(b.dataset.v); }); });

/* ===================== Adaptaciones (NEE) ===================== */
var AJ_DEF = { tam: 1, facil: false, mayus: false, contraste: false, suave: false, guiado: false, voz: false, lento: false, contador: false, ronda: 8, opc: false, pista: true };
var AJ = {};
try { AJ = JSON.parse(ls('mv-ajustes') || '{}') || {}; } catch (e) { AJ = {}; }
Object.keys(AJ_DEF).forEach(function (k) { if (AJ[k] === undefined) AJ[k] = AJ_DEF[k]; });
var PERFILES = {
  normal: {},
  dislexia: { tam: 2, facil: true, voz: true, lento: true, pista: true },
  vision: { tam: 3, facil: true, contraste: true, contador: true, voz: true },
  auditiva: { contador: true, lento: true, guiado: true },
  tea: { suave: true, guiado: true, lento: true, ronda: 4, opc: true, pista: true },
  tdah: { guiado: true, ronda: 4, contador: true, pista: true },
  inicial: { tam: 2, mayus: true, facil: true, voz: true, lento: true, contador: true, ronda: 4, opc: true, pista: true }
};
function aplicaAjustes() {
  var b = document.body;
  b.classList.toggle('t2', AJ.tam === 2); b.classList.toggle('t3', AJ.tam === 3);
  ['facil', 'mayus', 'contraste', 'suave', 'guiado'].forEach(function (k) { b.classList.toggle(k, !!AJ[k]); });
  document.querySelectorAll('#mAdapta [data-a]').forEach(function (c) { c.checked = !!AJ[c.dataset.a]; });
  document.querySelectorAll('#aTam [data-t]').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.t === AJ.tam); });
  document.querySelectorAll('#aRonda [data-r]').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.r === AJ.ronda); });
  ls('mv-ajustes', JSON.stringify(AJ));
}
function cambiaAjustes() { aplicaAjustes(); if (EST.items && EST.items.length && !$('v-medir').classList.contains('oculto')) pintaResultado(); }
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-adapta]')) { $('mAdapta').classList.remove('oculto'); var f = $('mAdapta').querySelector('button'); if (f) f.focus(); cuenta('adapta_abre'); }
});
$('perfiles').addEventListener('click', function (e) {
  var b = e.target.closest('[data-p]'); if (!b) return;
  AJ = Object.assign({}, AJ_DEF, PERFILES[b.dataset.p]); cuenta('adapta_' + b.dataset.p); cambiaAjustes();
  toast(b.dataset.p === 'normal' ? 'Vuelta a lo de siempre' : 'Perfil aplicado: ajústalo si hace falta');
});
$('mAdapta').addEventListener('change', function (e) { var c = e.target.closest('[data-a]'); if (!c) return; AJ[c.dataset.a] = c.checked; cuenta('adapta_' + c.dataset.a + (c.checked ? '_si' : '_no')); cambiaAjustes(); });
$('aTam').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; AJ.tam = +b.dataset.t; cambiaAjustes(); });
$('aRonda').addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (!b) return; AJ.ronda = +b.dataset.r; cambiaAjustes(); });
$('aCierra').addEventListener('click', function () { $('mAdapta').classList.add('oculto'); });
$('mAdapta').addEventListener('click', function (e) { if (e.target === $('mAdapta')) $('mAdapta').classList.add('oculto'); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('mAdapta').classList.add('oculto'); });
var NUMEROS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho'];
function diNumero(n) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(NUMEROS[n] || String(n)); u.lang = 'es-ES'; u.rate = 1.15;
  var v = speechSynthesis.getVoices().filter(function (x) { return /^es(-|_)ES/i.test(x.lang); })[0]; if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/* ===================== Sonido: palmadas ===================== */
var AC = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function palmada(fuerte) {
  if (!$('oSon').checked) return;
  var ac = audio(); if (!ac) return;
  var dur = 0.09, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  var src = ac.createBufferSource(); src.buffer = buf;
  var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fuerte ? 1100 : 1700; f.Q.value = 0.9;
  var g = ac.createGain(); g.gain.value = fuerte ? 1.1 : 0.45;
  src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
}
var PALMAS = null;
function paraPalmas() {
  if (!PALMAS) return;
  PALMAS.t.forEach(clearTimeout); PALMAS.els.forEach(function (e) { e.classList.remove('ya'); });
  if (PALMAS.boton) PALMAS.boton.textContent = '👏 Palmear';
  $('contador').classList.add('oculto');
  PALMAS = null;
}
function palmea(card, boton) {
  if (PALMAS && PALMAS.card === card) { paraPalmas(); return; }
  paraPalmas();
  var els = [].slice.call(card.querySelectorAll('.cabv ~ .chips .sil:not(.menos)'));
  if (!els.length) return;
  cuenta('palmear');
  var paso = AJ.lento || AJ.voz ? 1100 : 650, t = [];
  PALMAS = { card: card, els: els, t: t, boton: boton };
  boton.textContent = '⏹ Parar';
  els.forEach(function (e, i) {
    t.push(setTimeout(function () {
      els.forEach(function (x) { x.classList.remove('ya'); }); e.classList.add('ya');
      palmada(e.classList.contains('ton'));
      if (AJ.voz) diNumero(i + 1);
      if (AJ.contador) { var c = $('contador'); c.innerHTML = (i + 1) + '<small>' + esc(e.firstChild.textContent) + '</small>'; c.classList.remove('oculto'); }
    }, 300 + i * paso));
  });
  t.push(setTimeout(paraPalmas, 300 + els.length * paso + (AJ.contador ? 1500 : 400)));
}
document.addEventListener('visibilitychange', function () { if (document.hidden) { paraPalmas(); if (window.speechSynthesis) speechSynthesis.cancel(); } });
function lee(txt) {
  if (!window.speechSynthesis) { toast('Este aparato no puede leer en voz alta'); return; }
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(txt); u.lang = 'es-ES'; u.rate = 0.8;
  var v = speechSynthesis.getVoices().filter(function (x) { return /^es(-|_)ES/i.test(x.lang); })[0]; if (v) u.voice = v;
  speechSynthesis.speak(u); cuenta('leer');
}
function toast(t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2600); }

/* ===================== Medir ===================== */
var EST = { items: [], poema: null };
var NOMBRE_TIPO = { aguda: 'aguda', llana: 'llana', 'esdrújula': 'esdrújula', sobresdrújula: 'sobresdrújula' };
(function () {
  var o = $('oObj'), h = '<option value="">automático</option>';
  for (var n = 4; n <= 16; n++) h += '<option value="' + n + '">' + n + ' · ' + M.nombre(n) + '</option>';
  o.innerHTML = h;
})();
var EJEMPLOS = [
  ['Verde que te quiero verde', 'Verde que te quiero verde'],
  ['Era un niño que soñaba', 'Era un niño que soñaba'],
  ['Bécquer (poema)', 'golondrinas'], ['Machado (poema)', 'caminante'], ['Soneto de Lope', 'violante'], ['Alejandrinos de Darío', 'sonatina']
];
$('ejemplos').innerHTML = '<span class="glos">Prueba:</span> ' + EJEMPLOS.map(function (e, i) { return '<button type="button" data-e="' + i + '">' + esc(e[0]) + '</button>'; }).join('');
$('ejemplos').addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-e]'); if (!b) return;
  var e = EJEMPLOS[b.dataset.e], p = window.BANCO.filter(function (x) { return x.id === e[1]; })[0];
  $('texto').value = p ? p.t : e[1]; cuenta('ejemplo'); medir();
});

function medir(sinContar) {
  var t = $('texto').value.replace(/\t/g, ' ');
  var lineas = t.split('\n');
  var aviso = '';
  if (lineas.filter(function (l) { return /[a-záéíóúñü]/i.test(l); }).length > 60) { t = lineas.slice(0, 80).join('\n'); aviso = '<div class="aviso">Medimos los primeros versos. Para poemas largos, pégalo por partes.</div>'; }
  if (!/[a-záéíóúñü]/i.test(t)) { $('resultado').innerHTML = '<div class="aviso">Escribe un verso para medirlo.</div>'; return; }
  var obj = parseInt($('oObj').value, 10) || null;
  EST.poema = M.poema(t, { sinalefa: $('oSin').checked, objetivo: obj });
  EST.items = EST.poema.versos.map(function (v) {
    var it = { texto: v.texto, r: v.r, marca: v.marca, tipoRima: v.tipoRima, estrofa: v.estrofa, cambios: null };
    if (v.r.compuesto) { var c = v.r.compuesto; it.hemis = [{ texto: c.izq, r: c.hemis[0], cambios: null }, { texto: c.der, r: c.hemis[1], cambios: null }]; }
    return it;
  });
  pintaResultado(aviso);
  if (!sinContar) { cuenta('medir'); if (EST.items.length > 1) cuenta('medir_poema'); }
}
$('bMedir').addEventListener('click', function () { audio(); medir(); });
$('texto').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); medir(); } });
$('oSin').addEventListener('change', function () { cuenta('sinalefa_' + ($('oSin').checked ? 'si' : 'no')); medir(true); });
$('oObj').addEventListener('change', function () { cuenta('objetivo'); medir(true); });

function totalItem(it) { return it.hemis ? it.hemis[0].r.total + it.hemis[1].r.total : it.r.total; }

function pintaResultado(aviso) {
  var items = EST.items, h = aviso || '';
  if (items.length > 1) h += resumenPoema();
  else h += '<div class="fila" style="margin-bottom:10px"><button class="btn sec peq" type="button" data-imp="sol">🖨 Ficha con solución</button><button class="btn sec peq" type="button" data-imp="alu">🖨 Ficha para el alumno</button><button class="btn sec peq" type="button" data-adapta>♿ Adaptar</button></div>';
  items.forEach(function (it, i) { h += tarjetaVerso(it, i, items.length === 1); });
  if (items.length > 1) h += '<p class="glos">Toca «Ver paso a paso» en cualquier verso para ver cómo se mide.</p>';
  $('resultado').innerHTML = h;
  puentes($('resultado'));
}

function resumenPoema() {
  var items = EST.items, P = EST.poema;
  var med = items.map(totalItem), frec = {};
  med.forEach(function (n) { frec[n] = (frec[n] || 0) + 1; });
  var metros = Object.keys(frec).map(Number).sort(function (a, b) { return frec[b] - frec[a]; })
    .map(function (n) { return '<b>' + n + '</b> ' + M.nombre(n) + (frec[n] > 1 ? 's' : '') + ' ×' + frec[n]; }).join(' · ');
  var mayor = med.some(function (n) { return n >= 9; }), menor = med.some(function (n) { return n <= 8; });
  var arte = mayor && menor ? 'mezcla arte mayor y menor' : mayor ? 'arte mayor (más de 8 sílabas)' : 'arte menor (8 sílabas o menos)';
  var esq = P.estrofas.map(function (e) { return e.map(function (v) { return v.marca; }).join(''); }).join('  ');
  var tipos = {}; P.versos.forEach(function (v) { if (v.tipoRima) tipos[v.tipoRima] = 1; });
  var rimaTxt = Object.keys(tipos).length ? 'Rima ' + Object.keys(tipos).join(' y ') : 'Sin rima (versos sueltos o blancos)';
  var forma = P.forma || P.nombresEstrofa.filter(Boolean)[0] || '';
  var aj = items.filter(function (it) { return it.r.ajustado; }).length;
  return '<div class="resumen"><h2>Poema de ' + items.length + ' versos' + (forma ? ' · ' + esc(forma) : '') + '</h2>' +
    '<p>' + metros + '</p><p>' + arte + ' · ' + rimaTxt + '</p>' +
    '<p style="margin-top:8px">Esquema de rima:</p><div class="esq">' + esc(esq) + '</div>' +
    '<p class="glos" style="color:#BFE3CC">Mayúscula: verso de arte mayor. Minúscula: arte menor. Raya: verso suelto, sin rima.' + (aj ? ' Hay ' + aj + ' verso' + (aj > 1 ? 's' : '') + ' con licencia para que midan como el resto: lo verás en sus pasos.' : '') + '</p>' +
    '<div class="fila" style="margin-top:8px"><button class="btn oro peq" type="button" data-imp="sol">🖨 Ficha con solución</button><button class="btn sec peq" type="button" data-imp="alu">🖨 Ficha para el alumno</button><button class="btn sec peq" type="button" id="bPracPoema">🎯 Practicar con este poema</button><button class="btn sec peq" type="button" data-adapta>♿ Adaptar</button></div></div>';
}

function colaHTML(r, texto) {
  var pal = r.palabras, u = pal[pal.length - 1], cola = r.rima.cola;
  var ini = u.fin - cola.length;
  if (ini < u.ini) return esc(texto);
  return esc(texto.slice(0, ini)) + '<span class="cola">' + esc(texto.slice(ini, u.fin)) + '</span>' + esc(texto.slice(u.fin));
}

function chipsHTML(r, desde, sinNum) {
  var h = '', n = desde || 0, fon = r.metricas.length, quitar = r.ajuste < 0 ? -r.ajuste : 0;
  r.metricas.forEach(function (m, i) {
    var menos = i >= fon - quitar;
    h += '<span class="sil c' + ((n % 6) + 1) + (m.tonica ? ' ton' : '') + (menos ? ' menos' : '') + (sinNum ? ' nonum' : '') + '" role="img" aria-label="' + esc((menos ? 'no cuenta: ' : 'sílaba ' + (n + 1) + ': ') + m.t.replace(/‿/g, ' ') + (m.tonica ? ', fuerte' : '')) + '">' + esc(m.t) + '<i>' + (menos ? '−1' : (n + 1)) + '</i></span>';
    if (!menos) n++;
  });
  if (r.ajuste > 0) { h += '<span class="sil ext' + (sinNum ? ' nonum' : '') + '" role="img" aria-label="más una, porque acaba en aguda" title="Última palabra aguda: se suma una">+1<i>' + (n + 1) + '</i></span>'; n++; }
  return { h: h, n: n };
}

function tarjetaVerso(it, i, abierto) {
  var r = it.r, tot = totalItem(it);
  var nombre = M.nombre(tot) + (it.hemis ? ' (' + it.hemis[0].r.total + ' + ' + it.hemis[1].r.total + ')' : '');
  var arte = tot <= 8 ? 'arte menor' : 'arte mayor';
  var fin = it.hemis ? it.hemis[1].r : r;
  var h = '<article class="verso" id="vs' + i + '" data-i="' + i + '">' +
    '<div class="cabv"><div class="num">' + tot + '<small>sílabas</small></div><div class="txt">' + colaHTML(r, it.texto) +
    '<small>' + esc(nombre) + ' · ' + arte + ' · termina en palabra ' + esc(fin.tipoFinal) + (r.ajustado ? ' · con licencia' : '') + '</small></div>' +
    (EST.items.length > 1 ? '<div class="letra' + (it.marca === '–' ? ' nada' : '') + '" title="' + (it.tipoRima ? 'rima ' + it.tipoRima : 'sin rima') + '">' + esc(it.marca) + '</div>' : '') + '</div>';
  if (it.hemis) {
    var a = chipsHTML(it.hemis[0].r, 0), b = chipsHTML(it.hemis[1].r, a.n);
    h += '<div class="chips">' + a.h + '<span class="une" style="align-self:center;font-size:26px" title="cesura">‖</span>' + b.h + '</div>';
  } else h += '<div class="chips">' + chipsHTML(r, 0).h + '</div>';
  h += '<div class="acciones"><button class="btn peq" type="button" data-acc="palmas">👏 Palmear</button><button class="btn sec peq" type="button" data-acc="leer">🔊 Leer</button><button class="btn sec peq" type="button" data-acc="mal" title="Avísanos si crees que no mide bien">🐝 ¿No mide bien?</button></div>';
  var ph = pasosHTML(it, i);
  if (AJ.guiado) { var k = 0; ph = ph.replace(/<div class="paso"/g, function () { return k++ ? '<div class="paso esc"' : '<div class="paso"'; }) + '<p><button class="btn peq" type="button" data-sigpaso>Siguiente paso ▶</button></p>'; }
  h += '<details class="pasos"' + (abierto || AJ.guiado ? ' open' : '') + '><summary>Ver paso a paso</summary>' + ph + '</details></article>';
  return h;
}

function pasosHTML(it, i) {
  if (it.hemis) {
    var hs = it.hemis.map(function (hm, k) {
      return '<div class="verso"><div class="txt" style="font-size:19px;margin-bottom:6px"><b>' + (k ? '2.º' : '1.er') + ' hemistiquio:</b> ' + esc(hm.texto) + '</div>' + pasosSimple(hm.r, i, k) + '</div>';
    }).join('');
    var t0 = it.hemis[0].r.total, t1 = it.hemis[1].r.total;
    return '<div class="aviso">Es un <b>verso compuesto</b>: se parte en dos mitades (hemistiquios). Cada mitad se mide por separado, con su propia regla del final, y entre las dos no hay sinalefa.</div>' +
      '<div class="hemis">' + hs + '</div>' +
      '<div class="paso" data-n="✓"><h3>Total</h3><div class="formula"><span>' + t0 + '</span>+<span>' + t1 + '</span>=<span class="igual">' + (t0 + t1) + ' · ' + esc(M.nombre(t0 + t1)) + '</span></div></div>';
  }
  return pasosSimple(it.r, i, -1);
}

function fuerzaHTML(u) {
  return '<div class="fuerza" aria-hidden="true">' + u.sil.map(function (s, k) { return '<span class="' + (k === u.ton ? 'f' : '') + '">' + esc(s.t) + '</span>'; }).join('') + '</div>';
}
function pasosSimple(r, i, hk) {
  var d = 'data-v="' + i + '" data-h="' + hk + '"';
  // 1. sílabas de cada palabra
  var pals = r.palabras.map(function (p) {
    return '<span>' + p.sil.map(function (s, k) { return '<span class="' + (k === p.ton && !p.atona ? 't' : '') + '">' + esc(s.t) + '</span>'; }).join('<span class="pt">-</span>') + '</span>';
  }).join(' ');
  var h = '<div class="paso" data-n="1"><h3>Separa cada palabra en sílabas</h3><div class="pals">' + pals + '</div><p>En rojo, la sílaba que suena más fuerte (tónica). Las palabras pequeñas como «el», «de» o «que» no llevan fuerza.</p></div>';
  // 2. uniones
  var tg = [];
  r.juntas.forEach(function (j) {
    if (!j.posible) return;
    var a = r.palabras[j.i], b = r.palabras[j.i + 1], sa = a.sil[a.sil.length - 1].t, sb = b.sil[0].t;
    tg.push('<button type="button" class="tog ' + (j.activa ? 'on' : 'lic') + '" ' + d + ' data-k="' + j.clave + '" data-val="' + (!j.activa) + '">' +
      (j.activa ? '<b>' + esc(sa) + '<span class="une">‿</span>' + esc(sb) + '</b> sinalefa: cuentan como una' : '<b>' + esc(sa) + ' | ' + esc(sb) + '</b> hiato: cuentan dos') + '</button>');
  });
  r.palabras.forEach(function (p) {
    p.P.uniones.forEach(function (u) {
      var par = esc(p.P.orig.slice(u.i, u.j + 1).replace(/h/gi, ''));
      var w = esc(p.txt);
      if (u.forzada) { tg.push('<span class="tog lic fija"><b>' + par + '</b> en «' + w + '»: diéresis marcada (ü), se separan</span>'); return; }
      var txt;
      if (u.natural === 'diptongo') txt = u.unida ? '<b>' + par + '</b> en «' + w + '»: diptongo, una sílaba' : '<b>' + par + '</b> en «' + w + '»: diéresis, se separan (licencia)';
      else txt = u.unida ? '<b>' + par + '</b> en «' + w + '»: sinéresis, se juntan (licencia)' : '<b>' + par + '</b> en «' + w + '»: hiato, dos sílabas';
      var lic = (u.natural === 'diptongo') !== u.unida;
      tg.push('<button type="button" class="tog ' + (lic ? 'lic' : (u.unida ? 'on' : '')) + '" ' + d + ' data-k="' + u.clave + '" data-val="' + (!u.unida) + '">' + txt + '</button>');
    });
  });
  h += '<div class="paso" data-n="2"><h3>Mira las vocales que se juntan</h3>' +
    (tg.length ? '<div class="toggles">' + tg.join('') + '</div><p>Pulsa una unión para cambiarla y ver cómo cambia la medida. La <b>sinalefa</b> junta la vocal final de una palabra con la primera de la siguiente.</p>' : '<p>No hay vocales que se junten: cada sílaba cuenta una.</p>') +
    (r.ajustado && r.sugeridas ? '<div class="aviso">Para que mida ' + r.total + (EST.items.length > 1 ? ', como el resto del poema' : '') + ', se aplica: <b>' + r.sugeridas.map(function (s) { return s.tipo; }).join(', ') + '</b>. Es una licencia: el poeta separa o junta sonidos para que cuadre el verso.</div>' : '') + '</div>';
  // 3. sílabas fonológicas
  h += '<div class="paso" data-n="3"><h3>Cuenta las sílabas que suenan</h3><p>Al leerlo en voz alta salen <b>' + r.fonologicas + '</b> golpes de voz.</p></div>';
  // 4. ley del acento final
  var u = r.palabras[r.palabras.length - 1];
  var silU = u.sil.map(function (s, k) { return k === u.ton ? s.t.toUpperCase() : s.t; }).join('-');
  var expl = {
    aguda: 'es <b>aguda</b>: la fuerza cae en la última sílaba (' + esc(silU) + '). Se suma 1.',
    llana: 'es <b>llana</b>: la fuerza cae en la penúltima (' + esc(silU) + '). Se queda igual.',
    'esdrújula': 'es <b>esdrújula</b>: la fuerza cae en la antepenúltima (' + esc(silU) + '). Se resta 1.',
    sobresdrújula: 'es <b>sobresdrújula</b>: la fuerza cae antes de la antepenúltima (' + esc(silU) + '). Se restan 2.'
  }[r.tipoFinal];
  var signo = r.ajuste > 0 ? '+ 1' : r.ajuste < 0 ? '− ' + (-r.ajuste) : '+ 0';
  h += '<div class="paso" data-n="4"><h3>Mira la última palabra</h3>' + fuerzaHTML(u) + '<p>«' + esc(u.txt) + '» ' + expl + '</p>' +
    '<div class="formula"><span>' + r.fonologicas + '</span>' + signo.split(' ')[0] + '<span>' + signo.split(' ')[1] + '</span>=<span class="igual">' + r.total + '</span></div></div>';
  if (hk < 0) h += '<div class="paso" data-n="✓"><h3>' + r.total + ' sílabas métricas: ' + esc(M.nombre(r.total)) + '</h3><p>' + (r.total <= 8 ? 'Arte menor: 8 sílabas o menos.' : 'Arte mayor: más de 8 sílabas.') + ' La rima empieza en la vocal fuerte de la última palabra: «-' + esc(r.rima.cola) + '».</p></div>';
  return h;
}

/* clics dentro del resultado */
$('resultado').addEventListener('click', function (e) {
  var imp = e.target.closest('[data-imp]'); if (imp) { ficha(imp.dataset.imp, EST.items); return; }
  if (e.target.closest('#bPracPoema')) { empiezaPractica(EST.items.map(function (it) { return { v: it.texto }; }), 'poema'); return; }
  var tg = e.target.closest('.tog[data-k]');
  if (tg) {
    var it = EST.items[+tg.dataset.v], hk = +tg.dataset.h, dest = hk >= 0 ? it.hemis[hk] : it;
    dest.cambios = Object.assign({}, dest.r.cambios || {}, dest.cambios || {});
    dest.cambios[tg.dataset.k] = tg.dataset.val === 'true';
    var nr = M.analiza(dest.texto, { sinalefa: $('oSin').checked, cambios: dest.cambios, compuesto: false });
    if (hk < 0) { nr.rima = it.r.rima; } dest.r = nr; dest.r.cambios = dest.cambios;
    if (hk >= 0) it.r.ajustado = false;
    var card = $('vs' + tg.dataset.v), tmp = document.createElement('div');
    tmp.innerHTML = tarjetaVerso(it, +tg.dataset.v, true);
    card.replaceWith(tmp.firstChild);
    cuenta('union_toca');
    if (EST.items.length > 1) { var rs = document.querySelector('#resultado .resumen'); if (rs) { var t2 = document.createElement('div'); t2.innerHTML = resumenPoema(); rs.replaceWith(t2.firstChild); } }
    return;
  }
  var acc = e.target.closest('[data-acc]'); if (!acc) return;
  var card2 = acc.closest('.verso'), it2 = EST.items[+card2.dataset.i];
  if (acc.dataset.acc === 'palmas') { audio(); palmea(card2, acc); }
  if (acc.dataset.acc === 'leer') lee(it2.texto);
  if (acc.dataset.acc === 'mal') abreAbeja('El verso «' + it2.texto + '» me sale ' + totalItem(it2) + ' sílabas y creo que son: ');
});

document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-sigpaso]'); if (!b) return;
  var d = b.closest('details'), sig = d.querySelector('.paso.esc');
  if (sig) { sig.classList.remove('esc'); sig.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); cuentaUnaVez('paso_guiado'); }
  if (!d.querySelector('.paso.esc')) b.remove();
});

/* ===================== Ficha imprimible ===================== */
function ficha(modo, items, titulo) {
  if (!items || !items.length) return;
  var sol = modo === 'sol';
  var h = '<div class="fcab"><img src="img/logo-fonia.jpg" alt="Gabinete Fönia"><h1>' + esc(titulo || 'Mide versos') + (sol ? ' · solución' : '') + '</h1><img src="img/colmenia-logo.webp" alt="ColmenIA"></div>';
  if (!sol) h += '<p>Nombre: ______________________________ Fecha: ____________</p>';
  items.forEach(function (it, i) {
    var tot = totalItem(it), r = it.hemis ? it.hemis[1].r : it.r;
    h += '<div class="fv"><div class="t">' + (i + 1) + '. ' + esc(it.texto) + '</div>';
    if (sol) {
      var ch = it.hemis ? (function () { var a = chipsHTML(it.hemis[0].r, 0), b = chipsHTML(it.hemis[1].r, a.n); return a.h + ' ‖ ' + b.h; })() : chipsHTML(it.r, 0).h;
      h += '<div class="chips">' + ch + '</div><p style="margin:6px 0 0"><b>' + tot + ' sílabas</b> · ' + esc(M.nombre(tot)) + ' · arte ' + (tot <= 8 ? 'menor' : 'mayor') + ' · última palabra ' + esc(r.tipoFinal) +
        (it.marca && EST.items.length > 1 && items === EST.items ? ' · rima ' + esc(it.marca) : '') + (it.r.ajustado ? ' · con licencia' : '') + '</p>';
    } else {
      h += '<div class="lin"></div><p style="margin:4px 0 0">Colorea un cuadro por cada sílaba:</p><div class="cuadros">' + new Array(17).join('<span></span>') + '</div><p style="margin:4px 0">Sílabas métricas: <span class="cuad"></span> Última palabra: <span class="chk"></span>aguda <span class="chk"></span>llana <span class="chk"></span>esdrújula ' +
        (items.length > 1 ? '&nbsp; Rima: <span class="cuad"></span>' : '') + '</p>';
    }
    h += '</div>';
  });
  if (sol && items === EST.items && items.length > 1) h += '<p><b>Esquema de rima:</b> ' + esc(EST.poema.estrofas.map(function (e) { return e.map(function (v) { return v.marca; }).join(''); }).join('  ')) + (EST.poema.forma ? ' · ' + esc(EST.poema.forma) : '') + '</p>';
  if (!sol) h += '<p style="font-size:11pt"><b>Recuerda:</b> sinalefa (vocal final + vocal inicial = una sílaba) · aguda +1 · llana = · esdrújula −1</p>';
  h += '<div class="fpie">Mide versos · ColmenIA, la comunidad de logopedia e IA (skool.com/logopedia-7339) · Gabinete Fönia · Material de apoyo para el aula.</div>';
  $('ficha').innerHTML = h;
  cuenta('imprimir'); cuenta('imprimir_' + modo);
  setTimeout(function () { window.print(); }, 150);
}
window.addEventListener('afterprint', function () {
  if ($('puenteImp') || $('v-medir').classList.contains('oculto')) return;
  var d = document.createElement('div'); d.id = 'puenteImp';
  d.innerHTML = bloquePuente('imprimir', '¿Lista la ficha? En ColmenIA hay más para tu aula');
  $('resultado').insertBefore(d, $('resultado').firstChild); puentes(d);
});

/* ===================== Practicar ===================== */
var P = { nivel: 1 };
$('niveles').addEventListener('click', function (e) {
  var b = e.target.closest('.nivel'); if (!b) return;
  P.nivel = +b.dataset.n;
  $('niveles').querySelectorAll('.nivel').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
});
$('pEmpieza').addEventListener('click', function () {
  var pool = window.PRACTICA.filter(function (x) { return P.nivel === 4 ? true : x.n === P.nivel; });
  if (P.nivel === 4) pool = baraja(pool.filter(function (x) { return x.n === 4; })).slice(0, 3).concat(baraja(pool.filter(function (x) { return x.n !== 4 && x.n !== 1; })).slice(0, 5));
  empiezaPractica(baraja(pool).slice(0, AJ.ronda), 'nivel' + P.nivel);
});
function empiezaPractica(lista, origen) {
  vista('practicar'); audio();
  P.lista = lista.slice(0, AJ.ronda).map(function (x) {
    var r = M.analiza(x.v, x.obj ? { objetivo: x.obj } : {});
    return { v: x.v, obj: x.obj, r: r };
  }).filter(function (x) { return x.r; });
  P.i = 0; P.bien = 0; P.origen = origen;
  $('pInicio').classList.add('oculto'); $('pJuego').classList.remove('oculto');
  cuenta('practica_empieza'); cuenta('practica_' + origen);
  ejercicio();
}
function itemDe(x) { var it = { texto: x.v, r: x.r, marca: '', cambios: null }; if (x.r.compuesto) { var c = x.r.compuesto; it.hemis = [{ texto: c.izq, r: c.hemis[0] }, { texto: c.der, r: c.hemis[1] }]; } return it; }
function ejercicio() {
  var x = P.lista[P.i], it = itemDe(x), r = x.r, fin = it.hemis ? it.hemis[1].r : r;
  P.taps = 0; P.intento = 0; P.fase = (x.obj ? 'lic' : ($('pTipo').checked ? 'tipo' : 'num'));
  var h = '<div class="marcador"><span>Verso ' + (P.i + 1) + ' de ' + P.lista.length + '</span><span class="abejas">' + (P.bien ? new Array(P.bien + 1).join('🐝') : '') + '</span></div>' +
    '<div class="versoG">' + esc(x.v) + '</div><div id="pPreg"></div><div id="pRes"></div>';
  $('pJuego').innerHTML = h;
  pregunta(x, it, fin);
}
function pregunta(x, it, fin) {
  var h = '';
  if (P.fase === 'lic') {
    h = '<p><b>Este verso es un ' + esc(M.nombre(x.obj)) + ' (' + x.obj + ' sílabas). ¿Qué licencia necesita para llegar?</b></p><div class="tipos">' +
      ['hiato', 'diéresis', 'sinéresis'].map(function (t) { return '<button type="button" data-l="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
      '<p class="glos">Hiato: separar dos vocales de palabras distintas. Diéresis: separar un diptongo. Sinéresis: juntar dos vocales en hiato.</p>';
  } else if (P.fase === 'tipo') {
    h = '<p><b>¿Cómo es la última palabra, «' + esc(fin.ultima) + '»?</b></p><div class="tipos">' +
      ['aguda', 'llana', 'esdrújula'].map(function (t) { return '<button type="button" data-t="' + t + '">' + t + '</button>'; }).join('') + '</div>';
  } else {
    h = '<p><b>¿Cuántas sílabas métricas tiene?</b></p><div class="numeros"' + (AJ.opc ? ' style="grid-template-columns:repeat(3,1fr);max-width:420px"' : '') + '>';
    var tot = totalItem(it), nums = [];
    if (AJ.opc) { var otros = baraja([tot - 2, tot - 1, tot + 1, tot + 2].filter(function (n) { return n >= 2; })).slice(0, 2); nums = baraja([tot].concat(otros)); }
    else for (var n = 3; n <= 16; n++) nums.push(n);
    nums.forEach(function (n) { h += '<button type="button" data-n="' + n + '"' + (AJ.opc ? ' style="min-height:80px;font-size:36px"' : '') + '>' + n + '</button>'; });
    h += '</div><p class="glos">O palmea: toca la mano una vez por sílaba.</p><button class="palmea" type="button" id="pTap" aria-label="Palmada">👏</button>' +
      '<p><b id="pTaps">0</b> palmadas · <button class="btn sec peq" type="button" id="pTapOk">Comprobar mis palmadas</button> <button class="btn sec peq" type="button" id="pTap0">Borrar</button></p>';
  }
  $('pPreg').innerHTML = h;
}
$('pJuego').addEventListener('click', function (e) {
  var x = P.lista && P.lista[P.i]; if (!x) return;
  var it = itemDe(x), fin = it.hemis ? it.hemis[1].r : x.r;
  if (e.target.closest('#pTap')) { P.taps++; $('pTaps').textContent = P.taps; palmada(false); return; }
  if (e.target.closest('#pTap0')) { P.taps = 0; $('pTaps').textContent = 0; return; }
  if (e.target.closest('#pSig')) { P.i++; if (P.i >= P.lista.length) finPractica(); else ejercicio(); return; }
  if (e.target.closest('#pOtra')) { $('pJuego').classList.add('oculto'); $('pInicio').classList.remove('oculto'); return; }
  if (e.target.closest('#pImp')) { ficha('alu', P.lista.map(itemDe), 'Practica la medida'); return; }
  if (e.target.closest('#pImpS')) { ficha('sol', P.lista.map(itemDe), 'Practica la medida'); return; }
  var bt = e.target.closest('[data-t]');
  if (bt && P.fase === 'tipo') {
    var real = fin.tipoFinal === 'sobresdrújula' ? 'esdrújula' : fin.tipoFinal, ok = bt.dataset.t === real;
    var u = fin.palabras[fin.palabras.length - 1], silU = u.sil.map(function (s, k) { return k === u.ton ? s.t.toUpperCase() : s.t; }).join('-');
    $('pRes').innerHTML = '<p class="' + (ok ? 'bien' : 'mal') + '">' + (ok ? '¡Bien! ' : 'Casi. ') + '«' + esc(u.txt) + '» es ' + esc(fin.tipoFinal) + ': ' + esc(silU) + '</p><div style="display:flex;justify-content:center">' + fuerzaHTML(u) + '</div>';
    cuenta(ok ? 'practica_tipo_bien' : 'practica_tipo_mal');
    P.fase = 'num'; pregunta(x, it, fin); return;
  }
  var bl = e.target.closest('[data-l]');
  if (bl && P.fase === 'lic') {
    var lic = (x.r.compuesto ? x.r.compuesto.hemis.reduce(function (a, h) { return a.concat(h.licencias); }, []) : x.r.licencias)
      .filter(function (l) { return l.tipo === 'hiato' || l.tipo === 'diéresis' || l.tipo === 'sinéresis'; }).map(function (l) { return l.tipo; });
    corrige(lic.indexOf(bl.dataset.l) >= 0, x, it, lic.length ? 'Necesita ' + lic.join(' y ') + '.' : '');
    return;
  }
  var bn = e.target.closest('[data-n]') || (e.target.closest('#pTapOk') ? { dataset: { n: P.taps } } : null);
  if (bn && P.fase === 'num') {
    var dicho = +bn.dataset.n, tot = totalItem(it);
    if (dicho !== tot && AJ.pista && !P.intento) { P.intento = 1; pista(x, it, dicho); return; }
    corrige(dicho === tot, x, it, dicho === tot ? '' : 'Has dicho ' + dicho + '.');
  }
});
function pista(x, it, dicho) {
  cuenta('practica_pista');
  var r = it.hemis ? it.hemis[1].r : it.r, ideas = [];
  var sinal = (it.hemis ? it.hemis[0].r.juntas.concat(it.hemis[1].r.juntas) : r.juntas).filter(function (j) { return j.activa; }).length;
  if (sinal) ideas.push('Hay ' + sinal + ' sinalefa' + (sinal > 1 ? 's' : '') + ': vocales de dos palabras que se juntan en una sílaba (‿).');
  if (r.tipoFinal === 'aguda') ideas.push('La última palabra es aguda: suma 1 al final.');
  if (r.tipoFinal === 'esdrújula' || r.tipoFinal === 'sobresdrújula') ideas.push('La última palabra es esdrújula: resta 1 al final.');
  if (it.hemis) ideas.push('Es un verso largo: cuenta cada mitad por separado.');
  if (!ideas.length) ideas.push('Da una palmada por cada golpe de voz, despacio.');
  var ch = it.hemis ? chipsHTML(it.hemis[0].r, 0, true).h + ' ‖ ' + chipsHTML(it.hemis[1].r, chipsHTML(it.hemis[0].r, 0).n, true).h : chipsHTML(it.r, 0, true).h;
  $('pRes').innerHTML += '<div class="aviso" style="text-align:left"><b>Casi. Prueba otra vez.</b> ' + esc(ideas.join(' ')) + '<div class="chips" style="justify-content:center">' + ch + '</div><span class="glos">Cuenta los cuadros de colores.</span></div>';
  P.taps = 0; if ($('pTaps')) $('pTaps').textContent = 0;
}
function corrige(ok, x, it, extra) {
  var tot = totalItem(it);
  if (ok) P.bien++;
  P.fase = 'hecho';
  cuenta(ok ? 'practica_bien' : 'practica_mal');
  $('pPreg').innerHTML = '';
  var guarda = EST.items; EST.items = [it];
  var card = tarjetaVerso(it, 0, !ok);
  EST.items = guarda;
  $('pRes').innerHTML += '<p class="' + (ok ? 'bien' : 'mal') + '">' + (ok ? '¡Muy bien! ' : 'Tiene ' + tot + ' sílabas. ' + esc(extra) + ' ') + (ok ? tot + ' sílabas: ' + esc(M.nombre(tot)) + '. ' + esc(extra) : 'Mira por qué:') + '</p>' +
    '<p><button class="btn" type="button" id="pSig">' + (P.i + 1 < P.lista.length ? 'Siguiente →' : 'Ver resultado') + '</button></p>' +
    '<div style="text-align:left" id="pCard">' + card.replace('id="vs0"', '').replace(/data-k="/g, 'data-nok="') + '</div>';
}
$('pJuego').addEventListener('click', function (e) {
  var acc = e.target.closest('#pCard [data-acc]'); if (!acc) return;
  var x = P.lista[P.i], it = itemDe(x);
  if (acc.dataset.acc === 'palmas') palmea(acc.closest('.verso'), acc);
  if (acc.dataset.acc === 'leer') lee(x.v);
  if (acc.dataset.acc === 'mal') abreAbeja('En práctica, el verso «' + x.v + '» sale ' + totalItem(it) + ' sílabas y creo que son: ');
}, true);
function finPractica() {
  var n = P.lista.length, b = P.bien;
  cuenta('practica_acaba'); cuenta('practica_acaba_' + (b === n ? 'todo' : b >= n / 2 ? 'mitad' : 'poco'));
  $('pJuego').innerHTML = '<h2>' + (b === n ? '¡Todos bien! ' : '') + 'Has acertado ' + b + ' de ' + n + '</h2><div class="abejas">' + new Array(b + 1).join('🐝') + '</div>' +
    '<p>' + (b === n ? 'Ya mides como un poeta.' : 'Cada fallo trae su explicación: repite la ronda y verás cómo sube.') + '</p>' +
    '<p class="fila" style="justify-content:center"><button class="btn" type="button" id="pOtra">Otra ronda</button><button class="btn sec" type="button" id="pImp">🖨 Ficha con estos versos</button><button class="btn sec" type="button" id="pImpS">🖨 Solución</button></p>' +
    bloquePuente('practica', '¿Quieres más versos o fichas para tu clase?');
  puentes($('pJuego'));
}

/* ===================== Banco ===================== */
var FILTRO = 'todos';
function pintaBanco() {
  var h = '';
  window.BANCO.forEach(function (b) {
    if (FILTRO !== 'todos' && b.nivel !== FILTRO) return;
    var med = {}; b.m.forEach(function (n) { med[n] = 1; });
    var metros = Object.keys(med).map(Number).sort(function (x, y) { return y - x; }).map(function (n) { return M.nombre(n); }).join(' y ');
    var lin = b.t.split('\n').filter(Boolean);
    h += '<div class="tarj"><span class="etq">' + (b.nivel === 'primaria' ? 'Primaria' : 'Clásico') + ' · ' + esc(metros) + '</span><h3>' + esc(b.titulo) + '</h3><div class="aut">' + esc(b.autor) + '</div>' +
      '<div class="prim">' + esc(lin.slice(0, 2).join(' / ')) + (lin.length > 2 ? '…' : '') + '</div>' +
      '<div class="fila"><button class="btn peq" type="button" data-med="' + b.id + '">📏 Medir</button><button class="btn sec peq" type="button" data-pra="' + b.id + '">🎯 Practicar</button></div></div>';
  });
  $('tarjetas').innerHTML = h;
}
$('filtro').addEventListener('click', function (e) {
  var b = e.target.closest('[data-f]'); if (!b) return; FILTRO = b.dataset.f;
  $('filtro').querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); pintaBanco();
});
$('tarjetas').addEventListener('click', function (e) {
  var m = e.target.closest('[data-med]'), p = e.target.closest('[data-pra]');
  var id = (m || p || {}).dataset; if (!id) return;
  var b = window.BANCO.filter(function (x) { return x.id === (id.med || id.pra); })[0];
  cuenta('banco_' + b.id);
  if (m) { $('texto').value = b.t; $('oObj').value = ''; vista('medir'); medir(); setTimeout(function () { $('resultado').scrollIntoView({ behavior: 'smooth' }); }, 60); }
  else empiezaPractica(baraja(b.t.split('\n').filter(function (l) { return /[a-z]/i.test(l); }).map(function (l) { return { v: l.trim() }; })), 'banco');
});
pintaBanco();

/* ===================== Guía ===================== */
var GUIA = [
  ['1. Separa en sílabas', 'Cada sílaba es un golpe de voz. Se cuentan las que suenan, no las letras.', 'Ver-de-que-te-quie-ro-ver-de', 'Verde que te quiero verde'],
  ['2. Diptongo e hiato', 'Dos vocales juntas en una palabra pueden ir en la misma sílaba (diptongo: cie-lo, rui-do) o en dos (hiato: po-e-sí-a, rí-o). Dos vocales fuertes (a, e, o) o una i, u con tilde hacen hiato.', 'po-e-sí-a · cie-lo · rí-o', '¿Qué es poesía? ¿Y tú me lo preguntas?'],
  ['3. Sinalefa', 'Si una palabra acaba en vocal y la siguiente empieza por vocal (o por h), se juntan en una sola sílaba. Es lo que hacemos al hablar.', 'E-ra‿un-ni-ño-que-so-ña-ba → 8', 'Era un niño que soñaba'],
  ['4. La regla de la última palabra', 'Mira dónde cae la fuerza de la última palabra del verso. Aguda (can-CIÓN): se suma 1. Llana (VER-de): se queda igual. Esdrújula (PÁ-ja-ro): se resta 1.', 'un-ca-ba-llo-de-car-TÓN → 7 + 1 = 8', 'un caballo de cartón'],
  ['5. Licencias', 'A veces el poeta separa o junta sonidos para que el verso cuadre. Hiato: no hace la sinalefa (es-tá | en). Diéresis: separa un diptongo, y se marca con ü (sü-a-ve). Sinéresis: junta un hiato (poe-ta).', 'Es-cri-to‿es-tá | en-mi‿al-ma-vues-tro-ges-to → 11', 'Escrito está en mi alma vuestro gesto'],
  ['6. Nombre del verso', 'Arte menor: hasta 8 sílabas (bisílabo, trisílabo, tetrasílabo, pentasílabo, hexasílabo, heptasílabo, octosílabo). Arte mayor: 9 o más (eneasílabo, decasílabo, endecasílabo, dodecasílabo, tridecasílabo, alejandrino de 14). Los de 12 o más suelen partirse en dos mitades.', 'Mi‿in-fan-cia-son-re-cuer-dos ‖ de‿un-pa-tio-de-Se-vi-lla → 7 + 7 = 14', 'Mi infancia son recuerdos de un patio de Sevilla'],
  ['7. Rima', 'Desde la vocal fuerte de la última palabra. Consonante: se repite todo (golondrinas / cristalinas). Asonante: solo las vocales (montaña / ramas). Se marca con letras: mayúscula en arte mayor, minúscula en arte menor y raya si el verso no rima.', 'ABBA · abab · –a–a', 'Verde que te quiero verde.\nVerde viento. Verdes ramas.\nEl barco sobre la mar\ny el caballo en la montaña.']
];
$('guia').innerHTML = GUIA.map(function (g, i) {
  return '<div class="caja"><h2>' + esc(g[0]) + '</h2><p>' + esc(g[1]) + '</p><div class="ej">' + esc(g[2]) + '</div><button class="btn sec peq" type="button" data-g="' + i + '">Probarlo</button></div>';
}).join('') + '<div class="caja"><h2>8. Para alumnado con necesidades educativas especiales</h2><p>Con el botón ♿ Adaptar cada alumno trabaja a su manera: letra grande o fácil de leer, MAYÚSCULAS, alto contraste, colores suaves, un paso cada vez, conteo en voz alta, número grande al palmear, rondas cortas, solo 3 respuestas y una pista antes de corregir. Hay perfiles de partida (dislexia, baja visión, sordera, TEA, TDAH, lectura inicial) que luego se ajustan. La ficha impresa respeta la letra elegida y trae cuadros para colorear una sílaba cada vez.</p><p>Idea para el aula: primero palmear el verso todos juntos, luego contar los cuadros de colores y, al final, decirlo sin ayuda.</p><button class="btn sec peq" type="button" data-adapta>♿ Abrir adaptaciones</button></div>' + bloquePuente('guia', '¿Lo explicas de otra forma en tu aula? Compártelo en ColmenIA');
puentes($('guia'));
$('guia').addEventListener('click', function (e) {
  var b = e.target.closest('[data-g]'); if (!b) return;
  $('texto').value = GUIA[+b.dataset.g][3]; $('oObj').value = (+b.dataset.g === 4) ? '11' : '';
  vista('medir'); medir(); cuenta('guia_prueba');
});

/* ===================== Pizarra digital ===================== */
$('bProy').addEventListener('click', function () {
  var on = !document.body.classList.contains('proyecta');
  document.body.classList.toggle('proyecta', on);
  if (on) { cuenta('pizarra'); try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {} }
  else if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
});
document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement) document.body.classList.remove('proyecta'); });

/* ===================== Abeja: mejoras al buzón de Fönia ===================== */
var IDEAS = [['primaria', 'Más versos de Primaria'], ['fichas', 'Más tipos de fichas'], ['ritmo', 'Acentos del ritmo'], ['estrofas', 'Más estrofas'], ['examen', 'Modo examen'], ['catalan', 'Otras lenguas']];
$('mejChips').innerHTML = IDEAS.map(function (c) { return '<button class="chip" type="button" data-m="' + c[0] + '" aria-pressed="false">' + c[1] + '</button>'; }).join('');
$('mejChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b || b.getAttribute('aria-pressed') === 'true') return; b.setAttribute('aria-pressed', 'true'); cuenta('mejora_' + b.dataset.m); $('mejOk').textContent = 'Voto sumado. Lo más pedido es lo siguiente que hacemos.'; });
function abreAbeja(pre) { $('mAbeja').classList.remove('oculto'); $('mejOk').textContent = ''; if (pre) $('mejTxt').value = pre; $('mejTxt').focus(); cuenta('abeja_abre'); }
function cierraAbeja() { $('mAbeja').classList.add('oculto'); }
$('abeja').addEventListener('click', function () { abreAbeja(); });
$('mejCierra').addEventListener('click', cierraAbeja);
$('mAbeja').addEventListener('click', function (e) { if (e.target === $('mAbeja')) cierraAbeja(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cierraAbeja(); });
var BUZON = 'https://fonia-buzon.vercel.app/api/registro', COLA = 'mv-buzon-cola';
function leeCola() { try { return JSON.parse(ls(COLA) || '[]') || []; } catch (e) { return []; } }
function ponCola(l) { ls(COLA, JSON.stringify(l.slice(-20))); }
function manda(c, cb) {
  if (!window.fetch) { cb(false); return; }
  fetch(BUZON, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) })
    .then(function (r) { cb(r.ok); }).catch(function () { cb(false); });
}
function reintenta() { var l = leeCola(); if (!l.length) return; ponCola([]); l.forEach(function (c) { manda(c, function (b) { if (!b) ponCola(leeCola().concat([c])); }); }); }
setTimeout(reintenta, 3000); window.addEventListener('online', reintenta);
$('mejEnvia').addEventListener('click', function () {
  var t = $('mejTxt').value.trim();
  var chips = [].map.call(document.querySelectorAll('#mejChips [aria-pressed="true"]'), function (b) { return b.textContent; });
  if (!t && !chips.length) { $('mejOk').textContent = 'Escribe algo o toca una opción.'; return; }
  var firma = $('mejFirma').value.trim().slice(0, 60);
  var c = { id: 'c0000-mv-' + uid(), caso: '0000', terapeuta: '', material: 'comentario', version: 'mide-versos',
    contenido: 'MIDE VERSOS · MEJORA\n' + (firma ? 'De: ' + firma + '\n' : '') + 'Aparato: ' + navigator.userAgent.slice(0, 160) + '\n\n' + (chips.length ? 'Marcó: ' + chips.join(', ') + '\n' : '') + t.slice(0, 2500) + '\n\nSin datos personales del alumnado.' };
  var b = $('mejEnvia'); b.disabled = true; $('mejOk').textContent = 'Enviando…';
  manda(c, function (bien) {
    b.disabled = false; if (!bien) ponCola(leeCola().concat([c]));
    cuenta(bien ? 'buzon_ok' : 'buzon_cola');
    if (bien) $('mejTxt').value = '';
    $('mejOk').textContent = bien ? '¡Recibido! Ya lo tiene el equipo. Gracias 🐝' : 'Ahora no hay conexión: lo guardamos y se envía solo cuando vuelva.';
  });
});

/* ===================== Arranque ===================== */
aplicaAjustes();
puentes();
var inicio = Q.get('v');
if (inicio && $('v-' + inicio)) vista(inicio);
var vq = Q.get('verso'); if (vq) $('texto').value = vq.slice(0, 2000);
medir(true);
})();
