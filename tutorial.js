/* Mide versos · tutorial interactivo para el alumnado: «Aprende a medir».
   7 lecciones cortas con animación (solo CSS y temporizadores que se limpian al salir),
   un reto en cada una y su corrección. Respeta «movimiento reducido» y las adaptaciones. */
(function () {
'use strict';
var M = window.Metrica, MV = window.MV;
if (!M || !MV) return;
var esc = MV.esc, $ = function (id) { return document.getElementById(id); };
var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var timers = [], actual = 0, hechas = {}, abierto = false;
try { hechas = JSON.parse(localStorage.getItem('mv-tut') || '{}') || {}; } catch (e) { hechas = {}; }
function guarda() { try { localStorage.setItem('mv-tut', JSON.stringify(hechas)); } catch (e) {} }
function lento() { var a = MV.ajustes(); return a.lento || a.voz ? 1.5 : 1; }
function T(ms, fn) { timers.push(setTimeout(fn, RM ? 0 : ms * lento())); }
function limpia() { timers.forEach(clearTimeout); timers = []; if (window.speechSynthesis) speechSynthesis.cancel(); }
function clap(f) { if (!RM) MV.palmada(!!f); }
function sil(w) { return M.silabas(M.palabra(w)).map(function (x) { return x.t; }); }
function chip(t, i, extra) { return '<span class="sil tch c' + ((i % 6) + 1) + (extra ? ' ' + extra : '') + '">' + esc(t) + '<i>' + (i + 1) + '</i></span>'; }
function enciende(el, sel) { el.querySelectorAll(sel).forEach(function (c) { c.classList.add('on'); }); }
function opciones(correcta, otras) { return MV.baraja([correcta].concat(otras)); }
function botones(ops, attr) { return '<div class="tipos">' + ops.map(function (o) { return '<button type="button" ' + attr + '="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
function cerca(n) { return opciones(n, [n - 1, n + 1].filter(function (x) { return x >= 1; })).map(String); }
function al(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* Cuenta de palmadas animada sobre unos chips ya pintados */
function palmea(esc_, chips, desde, paso, alAcabar) {
  var cont = esc_.querySelector('.tcont'), mano = esc_.querySelector('.tmano');
  chips.forEach(function (c, i) {
    T(desde + i * paso, function () {
      chips.forEach(function (x) { x.classList.remove('ya'); }); c.classList.add('ya');
      if (cont) cont.textContent = i + 1;
      if (mano) { mano.classList.add('pum'); setTimeout(function () { mano.classList.remove('pum'); }, 140); }
      clap(c.classList.contains('ton'));
    });
  });
  T(desde + chips.length * paso + 200, function () { chips.forEach(function (x) { x.classList.remove('ya'); }); if (alAcabar) alAcabar(); });
}

/* ===================== Lecciones ===================== */
var L = [
  { t: '¿Qué es una sílaba?', x: 'Una sílaba es un golpe de voz. Una palmada por cada golpe.',
    anima: function (e) {
      var w = 'mariposa', s = sil(w);
      e.innerHTML = '<div class="tpal">' + w + '</div><div class="tw">' + s.map(function (x, i) { return chip(x, i); }).join('') + '</div><div class="fila" style="justify-content:center"><span class="tmano">👏</span><span class="tcont"></span></div><div class="tcap"></div>';
      var chips = [].slice.call(e.querySelectorAll('.tch'));
      T(700, function () { e.querySelector('.tpal').classList.add('fuera'); e.querySelector('.tcap').textContent = 'La partimos en golpes de voz…'; });
      chips.forEach(function (c, i) { T(1100 + i * 350, function () { c.classList.add('on'); }); });
      palmea(e, chips, 1100 + chips.length * 350 + 300, 650, function () { e.querySelector('.tcap').textContent = '«mariposa» tiene 4 sílabas: ma-ri-po-sa'; });
    },
    reto: function (r, ok) {
      var w = al(['chocolate', 'pelota', 'sol', 'elefante', 'luna', 'zapato', 'mesa', 'murciélago', 'pan', 'bicicleta']), n = sil(w).length;
      r.innerHTML = '<p><b>Tu turno:</b> palmea «' + esc(w) + '». ¿Cuántas sílabas tiene?</p>' + botones(cerca(n), 'data-o');
      r.onclick = function (ev) { var b = ev.target.closest('[data-o]'); if (!b) return; ok(+b.dataset.o === n, w + ': ' + sil(w).join('-') + ' → ' + n + (n === 1 ? ' sílaba' : ' sílabas')); };
    } },

  { t: 'Vocales que van juntas', x: 'Dos vocales juntas: a veces van en la misma sílaba (cie-lo) y a veces se separan (po-e-ta).',
    anima: function (e) {
      function letras(w) { return w.split('').map(function (c) { return '<span' + (/[aeiouáéíóú]/.test(c) ? ' class="voc"' : '') + '>' + c + '</span>'; }).join(''); }
      e.innerHTML = '<div class="tpal" id="tA">' + letras('cielo') + '</div><div class="tcap" id="cA"></div><div class="tpal" id="tB">' + letras('poeta') + '</div><div class="tcap" id="cB"></div>';
      var a = e.querySelectorAll('#tA span'), b = e.querySelectorAll('#tB span');
      T(600, function () { a[1].classList.add('abr'); a[2].classList.add('abr'); $('cA').textContent = 'i + e se abrazan: una sola sílaba'; clap(); });
      T(1900, function () { $('tA').innerHTML = '<span class="abr">cie</span>·<span>lo</span>'; $('cA').textContent = 'cie-lo → 2 sílabas (diptongo)'; });
      T(3200, function () { b[1].classList.add('sep'); b[2].classList.add('sep'); b[1].style.transform = 'translateX(-8px)'; b[2].style.transform = 'translateX(8px)'; $('cB').textContent = 'o + e son fuertes: se separan'; clap(); });
      T(4600, function () { $('tB').innerHTML = '<span>po</span>·<span class="sep">e</span>·<span>ta</span>'; $('cB').textContent = 'po-e-ta → 3 sílabas (hiato)'; });
    },
    reto: function (r, ok) {
      var w = al(['ruido', 'aire', 'teatro', 'río', 'maíz', 'cuento', 'leer', 'piano', 'baúl', 'nieve']), s = sil(w), n = s.length;
      r.innerHTML = '<p><b>Tu turno:</b> ¿cuántas sílabas tiene «' + esc(w) + '»? Fíjate en las vocales.</p>' + botones(cerca(n), 'data-o');
      r.onclick = function (ev) { var b = ev.target.closest('[data-o]'); if (!b) return; ok(+b.dataset.o === n, w + ': ' + s.join('-') + ' → ' + n + ' sílabas'); };
    } },

  { t: 'La sinalefa: palabras que se dan la mano', x: 'Si una palabra acaba en vocal y la siguiente empieza por vocal, se juntan en una sílaba: ‿',
    anima: function (e) {
      e.innerHTML = '<div class="tw" id="sw">' + chip('E', 0) + chip('ra', 1) + '<span style="width:18px"></span>' + chip('un', 2) + '<span style="width:18px"></span>' + chip('ni', 3) + chip('ño', 4) + '</div><div class="tcont"></div><div class="tcap"></div>';
      var cs = [].slice.call(e.querySelectorAll('.tch')), cap = e.querySelector('.tcap'), cont = e.querySelector('.tcont');
      cs.forEach(function (c, i) { T(300 + i * 250, function () { c.classList.add('on'); }); });
      T(1800, function () { cont.textContent = '5?'; cap.textContent = '«Era» acaba en a… «un» empieza por u…'; cs[1].classList.add('par'); cs[2].classList.add('par'); });
      T(3000, function () { cs[1].classList.add('izq'); cs[2].classList.add('der'); });
      T(3700, function () {
        $('sw').innerHTML = '<span class="sil tch on c1">E<i>1</i></span><span class="sil tch on c2"><span>ra<span class="une">‿</span>un</span><i>2</i></span><span style="width:18px"></span><span class="sil tch on c3">ni<i>3</i></span><span class="sil tch on c4">ño<i>4</i></span>';
        cap.textContent = '¡Se dan la mano! ra‿un cuenta como una'; cont.textContent = '4'; clap(true);
      });
    },
    reto: function (r, ok) {
      var v = al(['La luna vino a la fragua', 'cantando alegre en la popa', 'Recuerde el alma dormida', 'Era un niño que soñaba', 'y otra vez con el ala a sus cristales', 'viento en popa, a toda vela']);
      var m = M.mide(v), buenas = m.juntas.filter(function (j) { return j.posible; }).map(function (j) { return j.i; });
      var h = '<p><b>Tu turno:</b> toca los huecos donde hay sinalefa y luego «Comprobar».</p><div class="tverso">';
      m.palabras.forEach(function (p, i) { h += '<span>' + esc(p.txt) + '</span>'; if (i < m.palabras.length - 1) h += '<button type="button" class="thueco" data-h="' + i + '" aria-pressed="false" aria-label="hueco entre ' + esc(p.txt) + ' y ' + esc(m.palabras[i + 1].txt) + '"> </button>'; });
      h += '</div><p><button class="btn" type="button" data-comp>Comprobar</button></p>';
      r.innerHTML = h;
      r.onclick = function (ev) {
        var b = ev.target.closest('.thueco');
        if (b) { var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.textContent = on ? '‿' : ' '; return; }
        if (!ev.target.closest('[data-comp]')) return;
        var marcadas = [].slice.call(r.querySelectorAll('.thueco[aria-pressed=true]')).map(function (x) { return +x.dataset.h; });
        var bien = marcadas.length === buenas.length && buenas.every(function (i) { return marcadas.indexOf(i) >= 0; });
        var txt = buenas.map(function (i) { var a = m.palabras[i], c = m.palabras[i + 1]; return a.txt + '‿' + c.txt; }).join(', ');
        r.querySelectorAll('.thueco').forEach(function (x) { if (buenas.indexOf(+x.dataset.h) >= 0) { x.setAttribute('aria-pressed', 'true'); x.textContent = '‿'; } });
        ok(bien, 'Sinalefas: ' + txt + '.');
      };
    } },

  { t: 'La sílaba fuerte', x: 'Cada palabra tiene una sílaba más fuerte. Dila como si llamaras a alguien: ¡ca-MIÓN!',
    anima: function (e) {
      var W = [['canción', 'aguda: fuerza en la última'], ['verde', 'llana: fuerza en la penúltima'], ['pájaro', 'esdrújula: fuerza en la antepenúltima']];
      e.innerHTML = W.map(function (w, k) {
        var r = M.mide(w[0]), p = r.palabras[0];
        return '<div class="tfila"><b>' + w[0] + '</b><div><div class="tfz" data-k="' + k + '">' + p.sil.map(function (s, i) { return '<span data-t="' + (i === p.ton ? 1 : 0) + '">' + esc(s.t) + '</span>'; }).join('') + '</div><div class="tcap" data-c="' + k + '"></div></div></div>';
      }).join('');
      W.forEach(function (w, k) {
        T(700 + k * 1500, function () { var t = e.querySelector('.tfz[data-k="' + k + '"] [data-t="1"]'); t.classList.add('f'); clap(true); });
        T(1200 + k * 1500, function () { e.querySelector('[data-c="' + k + '"]').textContent = w[1]; });
      });
    },
    reto: function (r, ok) {
      var w = al(['reloj', 'mesa', 'música', 'sofá', 'lápiz', 'murciélago', 'ratón', 'casa', 'plátano', 'jardín', 'árbol', 'teléfono']);
      var m = M.mide(w), tipo = m.tipoFinal === 'sobresdrújula' ? 'esdrújula' : m.tipoFinal, p = m.palabras[0];
      var dib = p.sil.map(function (s, i) { return i === p.ton ? s.t.toUpperCase() : s.t; }).join('-');
      r.innerHTML = '<p><b>Tu turno:</b> ¿dónde está la fuerza en «' + esc(w) + '»?</p>' + botones(['aguda', 'llana', 'esdrújula'], 'data-o');
      r.onclick = function (ev) { var b = ev.target.closest('[data-o]'); if (!b) return; ok(b.dataset.o === tipo, w + ' → ' + dib + ': es ' + tipo + '.'); };
    } },

  { t: 'La regla de la última palabra', x: 'Mira la última palabra. Aguda: suma 1. Llana: igual. Esdrújula: resta 1.',
    anima: function (e) {
      function fila(v, id) { var r = M.mide(v); return '<div class="tw" id="' + id + '">' + r.metricas.map(function (m, i) { return chip(m.t, i, m.tonica ? 'ton' : ''); }).join('') + '</div>'; }
      e.innerHTML = '<div class="tcap">un caballo de cartón</div>' + fila('un caballo de cartón', 'f1') + '<div class="tcont" id="n1"></div><div class="tcap">La niña come plátanos</div>' + fila('La niña come plátanos', 'f2') + '<div class="tcont" id="n2"></div>';
      var a = [].slice.call(e.querySelectorAll('#f1 .tch')), b = [].slice.call(e.querySelectorAll('#f2 .tch'));
      a.forEach(function (c, i) { T(300 + i * 200, function () { c.classList.add('on'); }); });
      T(1900, function () { $('n1').textContent = '7'; a[a.length - 1].classList.add('par'); });
      T(2900, function () { $('f1').insertAdjacentHTML('beforeend', '<span class="sil ext tch">+1<i>8</i></span>'); setTimeout(function () { var x = $('f1').lastChild; if (x) x.classList.add('on'); }, 30); $('n1').textContent = '7 + 1 = 8'; clap(true); });
      b.forEach(function (c, i) { T(4200 + i * 200, function () { c.classList.add('on'); }); });
      T(6100, function () { $('n2').textContent = '8'; b[5].classList.add('par'); });
      T(7100, function () { b[b.length - 1].classList.add('menos'); b[b.length - 1].querySelector('i').textContent = '−1'; $('n2').textContent = '8 − 1 = 7'; clap(); });
    },
    reto: function (r, ok) {
      var v = al(['El barco sobre la mar', 'vestida de azul', 'La niña come plátanos', 'Mi perro se llama Tuno', 'un velero bergantín', 'Canta el reloj']);
      var m = M.mide(v);
      r.innerHTML = '<p><b>Tu turno:</b> «' + esc(v) + '» tiene <b>' + m.fonologicas + '</b> sílabas al contarlas y acaba en «' + esc(m.ultima) + '». ¿Cuántas sílabas métricas tiene?</p>' + botones(cerca(m.total), 'data-o');
      r.onclick = function (ev) { var b = ev.target.closest('[data-o]'); if (!b) return; ok(+b.dataset.o === m.total, '«' + m.ultima + '» es ' + m.tipoFinal + ': ' + m.fonologicas + (m.ajuste > 0 ? ' + 1' : m.ajuste < 0 ? ' − ' + (-m.ajuste) : ' + 0') + ' = ' + m.total + '.'); };
    } },

  { t: '¡Todo junto! Mide un verso', x: 'Los cuatro pasos: separa, junta, cuenta con palmadas y mira el final.',
    anima: function (e) {
      var v = 'Era un niño que soñaba', r = M.mide(v);
      var sueltas = []; r.palabras.forEach(function (p) { p.sil.forEach(function (s) { sueltas.push(s.t); }); });
      e.innerHTML = '<div class="tcap" id="pas">1. Separa en sílabas</div><div class="tw" id="tw6">' + sueltas.map(function (s, i) { return chip(s, i); }).join('') + '</div><div class="fila" style="justify-content:center"><span class="tmano">👏</span><span class="tcont"></span></div><div class="tcap" id="fin6"></div>';
      var cs = [].slice.call(e.querySelectorAll('.tch'));
      cs.forEach(function (c, i) { T(400 + i * 220, function () { c.classList.add('on'); }); });
      T(2700, function () { $('pas').textContent = '2. Junta las sinalefas'; cs[1].classList.add('par'); cs[2].classList.add('par'); });
      T(3800, function () {
        $('tw6').innerHTML = r.metricas.map(function (m, i) { return chip(m.t, i, (m.tonica ? 'ton ' : '') + 'on'); }).join('');
        $('pas').textContent = '3. Cuenta con palmadas';
        palmea(e, [].slice.call(e.querySelectorAll('#tw6 .tch')), 700, 600, function () {
          $('pas').textContent = '4. Mira la última palabra';
          T(500, function () { $('fin6').innerHTML = '«soñaba» es llana: se queda igual → <b>8 sílabas: octosílabo</b>'; clap(true); });
        });
      });
    },
    reto: function (r, ok) {
      var lista = window.PRACTICA.filter(function (x) { return x.n === 2 || x.n === 3; }).filter(function (x) { var t = M.analiza(x.v).total; return t <= 11; });
      var v = al(lista).v, a = M.analiza(v);
      r.innerHTML = '<p><b>Tu turno:</b> mide este verso con los cuatro pasos.</p><div class="tverso">' + esc(v) + '</div>' + botones(cerca(a.total), 'data-o') + '<p><button class="btn sec peq" type="button" data-sol>Verlo paso a paso en la app</button></p>';
      r.onclick = function (ev) {
        if (ev.target.closest('[data-sol]')) { MV.cuenta('tut_ver_app'); MV.medirVerso(v); return; }
        var b = ev.target.closest('[data-o]'); if (!b) return;
        ok(+b.dataset.o === a.total, a.metricas.map(function (m) { return m.t; }).join('-') + (a.ajuste > 0 ? ' +1' : a.ajuste < 0 ? ' −1' : '') + ' → ' + a.total + ' sílabas: ' + M.nombre(a.total) + '.');
      };
    } },

  { t: '¿Cómo se llama el verso?', x: 'Cada verso se llama por sus sílabas. Hasta 8: arte menor. Desde 9: arte mayor.',
    anima: function (e) {
      var h = '<div class="tescala">';
      for (var n = 2; n <= 14; n++) { if (n === 9) h += '<hr>'; h += '<div class="' + (n >= 9 ? 'mayor' : '') + '"><span style="width:26px;text-align:right">' + n + '</span><i data-n="' + n + '"></i><span class="nm" style="opacity:0;transition:opacity .4s">' + M.nombre(n) + '</span></div>'; }
      e.innerHTML = h + '</div><div class="tcap" id="arte"></div>';
      for (n = 2; n <= 14; n++) (function (n) { T(300 + (n - 2) * 280, function () { var i = e.querySelector('i[data-n="' + n + '"]'); i.style.width = (n * 6) + '%'; i.nextSibling.style.opacity = 1; if (n === 8 || n === 11 || n === 14) clap(true); }); })(n);
      T(300 + 13 * 280 + 300, function () { $('arte').textContent = 'Arriba de la raya: arte menor. Abajo: arte mayor. Los más famosos: octosílabo (8), endecasílabo (11) y alejandrino (14).'; });
    },
    reto: function (r, ok) {
      var n = al([5, 7, 8, 9, 11, 14]), nom = M.nombre(n);
      var otras = MV.baraja([5, 7, 8, 9, 11, 14].filter(function (x) { return x !== n; })).slice(0, 2).map(M.nombre);
      r.innerHTML = '<p><b>Tu turno:</b> un verso de <b>' + n + '</b> sílabas es un…</p>' + botones(opciones(nom, otras), 'data-o');
      r.onclick = function (ev) { var b = ev.target.closest('[data-o]'); if (!b) return; ok(b.dataset.o === nom, n + ' sílabas: ' + nom + ', de arte ' + (n <= 8 ? 'menor' : 'mayor') + '.'); };
    } }
];

/* ===================== Pintar ===================== */
function prog() {
  return '<div class="tprog" role="tablist" aria-label="Lecciones">' + L.map(function (l, i) {
    return '<button type="button" data-l="' + i + '" class="' + (hechas[i] ? 'hecha ' : '') + (i === actual ? 'act' : '') + '" aria-label="Lección ' + (i + 1) + ': ' + esc(l.t) + '">' + (hechas[i] ? '✓' : i + 1) + '</button>';
  }).join('') + '<button type="button" data-l="' + L.length + '" class="' + (actual === L.length ? 'act' : '') + '" aria-label="Final">🏁</button></div>';
}
function pinta() {
  limpia();
  var raiz = $('tut');
  if (actual >= L.length) { final(raiz); return; }
  var l = L[actual];
  raiz.innerHTML = prog() + '<div class="caja"><div class="etq2">Lección ' + (actual + 1) + ' de ' + L.length + '</div><h2>' + esc(l.t) + '</h2>' +
    '<p class="ttxt">' + esc(l.x) + '</p><p class="fila"><button class="btn sec peq" type="button" data-oir>🔊 Escuchar</button><button class="btn sec peq" type="button" data-rep>↻ Ver otra vez</button></p>' +
    '<div class="escena" id="escena" aria-live="polite"></div><div class="treto" id="treto"></div><div id="tres" aria-live="polite"></div>' +
    '<div class="tnav"><button class="btn sec" type="button" data-ant' + (actual ? '' : ' disabled') + '>◀ Atrás</button><button class="btn" type="button" data-sig>Siguiente ▶</button></div></div>';
  MV.cuentaUnaVez('tut_leccion_' + (actual + 1));
  l.anima($('escena'));
  nuevoReto();
}
function nuevoReto() {
  var l = L[actual], r = $('treto'); $('tres').innerHTML = '';
  l.reto(r, function (bien, porque) {
    MV.cuenta(bien ? 'tut_bien' : 'tut_mal');
    if (bien) { hechas[actual] = 1; guarda(); clap(true); }
    $('tres').innerHTML = '<p class="' + (bien ? 'bien' : 'mal') + '" style="text-align:center">' + (bien ? '¡Muy bien! 🐝 ' : 'Casi. ') + esc(porque) + '</p>' +
      '<p class="fila" style="justify-content:center"><button class="btn sec peq" type="button" data-otro>Otro reto</button>' + (bien ? '<button class="btn peq" type="button" data-sig>Siguiente lección ▶</button>' : '') + '</p>';
    r.onclick = null; r.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    var p = document.querySelector('.tprog'); if (p) p.outerHTML = prog();
  });
}
function final(raiz) {
  var n = Object.keys(hechas).length;
  MV.cuenta('tut_fin');
  raiz.innerHTML = prog() + '<div class="caja" style="text-align:center"><h2>🎉 ¡Ya sabes medir versos!</h2><div class="abejas">' + new Array(n + 1).join('🐝') + '</div>' +
    '<p class="ttxt">Has superado ' + n + ' de ' + L.length + ' retos. Recuerda los cuatro pasos: <b>separa, junta, cuenta y mira el final.</b></p>' +
    '<p class="fila" style="justify-content:center"><button class="btn" type="button" data-medir>✏️ Medir un verso</button><button class="btn oro" type="button" data-prac>🎯 Practicar con la app</button><button class="btn sec" type="button" data-l="0">↻ Empezar de nuevo</button></p>' +
    MV.bloquePuente('tutorial', 'Para docentes: la práctica, las fichas y los poemas están en ColmenIA') + '</div>';
  MV.puentes(raiz);
}
$('tut').addEventListener('click', function (e) {
  var t = e.target;
  var bl = t.closest('[data-l]'); if (bl) { actual = +bl.dataset.l; if (actual === 0 && t.closest('.caja')) { hechas = {}; guarda(); } pinta(); window.scrollTo(0, 0); return; }
  if (t.closest('[data-sig]')) { actual = Math.min(actual + 1, L.length); pinta(); window.scrollTo(0, 0); return; }
  if (t.closest('[data-ant]')) { actual = Math.max(actual - 1, 0); pinta(); window.scrollTo(0, 0); return; }
  if (t.closest('[data-rep]')) { limpia(); L[actual].anima($('escena')); MV.cuenta('tut_repite'); return; }
  if (t.closest('[data-oir]')) { MV.lee(L[actual].t + '. ' + L[actual].x); return; }
  if (t.closest('[data-otro]')) { nuevoReto(); return; }
  if (t.closest('[data-medir]')) { MV.vista('medir'); return; }
  if (t.closest('[data-prac]')) { MV.practicar(MV.baraja(window.PRACTICA.filter(function (x) { return x.n <= 3; })).map(function (x) { return { v: x.v }; })); return; }
});
document.addEventListener('visibilitychange', function () { if (document.hidden) limpia(); });

window.TUT = {
  abre: function () { abierto = true; MV.audio(); pinta(); },
  para: function () { if (abierto) limpia(); abierto = false; }
};
if (!$('v-aprende').classList.contains('oculto')) window.TUT.abre();
})();
