/* Mide versos · motor de métrica silábica del castellano.
   Separa en sílabas fonológicas, marca sinalefas, hiatos, diptongos,
   aplica la ley del acento final, nombra el verso y analiza la rima.
   Funciona igual en el navegador (window.Metrica) y en node (require). */
(function (raiz) {
'use strict';

var FUERTES = 'aeoáéóíú';            // í y ú con tilde se portan como fuertes (hiato)
var TILDE = 'áéíóú';
var SIN_TILDE = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ï': 'i' };
var GRUPOS = ['pl', 'pr', 'bl', 'br', 'fl', 'fr', 'cl', 'cr', 'gl', 'gr', 'dr', 'tr', 'kl', 'kr'];
var ATONAS = ('el la lo los las un unos unas mi mis tu tus su sus me te se nos os le les y e o u ni que de a en con por para sin sobre del al si pero mas cuando donde como porque aunque hasta desde entre hacia tras ante bajo cual quien cuyo cuya').split(' ');

function quita(s) { return s.replace(/[áéíóúüï]/g, function (c) { return SIN_TILDE[c]; }); }
function esVocalLetra(c) { return /[aeiouáéíóúüï]/.test(c); }

/* ---------- Clasificación de letras de una palabra ---------- */
function clasifica(l) {
  // l: palabra en minúsculas. Devuelve tipos: 'V' vocal, 'C' consonante, 'H' hache muda.
  var t = [], n = l.length;
  for (var i = 0; i < n; i++) {
    var c = l[i], p = l[i - 1], s = l[i + 1];
    if (c === 'u' && (p === 'q' || (p === 'g' && (s === 'e' || s === 'i' || s === 'é' || s === 'í')))) t.push('C');
    else if (c === 'y') {
      // y vocal: sola, o al final tras vocal (rey, hoy, muy)
      if (n === 1 || (i === n - 1 && p && esVocalLetra(p))) t.push('V'); else t.push('C');
    }
    else if (esVocalLetra(c)) t.push('V');
    else if (c === 'h') t.push(p === 'c' ? 'C' : 'H');
    else t.push('C');
  }
  return t;
}

function debil(c) { return c === 'i' || c === 'u' || c === 'ü' || c === 'y' || c === 'ï'; }
function esFuerte(c) { return FUERTES.indexOf(c) >= 0; }

/* Entre dos vocales seguidas (en la misma palabra) ¿hay hiato por defecto? */
function dieresisMarcada(l, i) { return l[i] === 'ï' || (l[i] === 'ü' && l[i - 1] !== 'g' && l[i - 1] !== 'q'); }
function hiatoNatural(a, b) {
  if (esFuerte(a) && esFuerte(b)) return true;              // dos fuertes, o débil con tilde
  if (debil(a) && debil(b)) return a === b;                 // ii, uu: hiato; iu, ui: diptongo
  return false;                                             // fuerte+débil átona: diptongo
}

/* ---------- Análisis de una palabra ---------- */
function palabra(orig) {
  var l = orig.toLowerCase();
  var tipos = clasifica(l);
  var n = l.length;
  // Grupos de vocales (la h entre vocales no separa): lista de posiciones de vocal
  var grupos = [], g = null, ultimaV = -1;
  for (var i = 0; i < n; i++) {
    if (tipos[i] === 'V') {
      var soloH = g && ultimaV >= 0 && (function () { for (var k = ultimaV + 1; k < i; k++) if (tipos[k] !== 'H') return false; return true; })();
      if (g && soloH) g.push(i); else { g = [i]; grupos.push(g); }
      ultimaV = i;
    } else if (tipos[i] !== 'H') { g = null; }
  }
  // Uniones entre vocales seguidas de un mismo grupo
  var uniones = [];
  grupos.forEach(function (gr, gi) {
    for (var k = 0; k + 1 < gr.length; k++) {
      var a = l[gr[k]], b = l[gr[k + 1]];
      var forz = dieresisMarcada(l, gr[k]) || dieresisMarcada(l, gr[k + 1]);
      var hiato = forz || hiatoNatural(a, b);
      uniones.push({ g: gi, k: k, i: gr[k], j: gr[k + 1], natural: hiato ? 'hiato' : 'diptongo', unida: !hiato, forzada: forz });
    }
  });
  return { orig: orig, l: l, tipos: tipos, grupos: grupos, uniones: uniones };
}

/* Corta la palabra en sílabas según el estado de sus uniones */
function silabas(P) {
  var l = P.l, n = l.length, tipos = P.tipos;
  // núcleos: lista de [inicio, fin] de posiciones de vocal
  var nucleos = [], u = 0;
  P.grupos.forEach(function (gr) {
    var ini = gr[0];
    for (var k = 0; k + 1 < gr.length; k++) {
      var un = P.uniones[u++];
      if (!un.unida) { nucleos.push([ini, gr[k]]); ini = gr[k + 1]; }
    }
    nucleos.push([ini, gr[gr.length - 1]]);
  });
  if (!nucleos.length) return [{ t: P.orig, a: 0, b: n }];
  // Cortes entre núcleos
  var cortes = [];
  for (var x = 0; x + 1 < nucleos.length; x++) {
    var desde = nucleos[x][1] + 1, hasta = nucleos[x + 1][0]; // consonantes en [desde, hasta)
    // unidades consonánticas (ch, ll, rr, qu, gu cuentan como una)
    var unid = [], p = desde;
    while (p < hasta) {
      var dos = l.substr(p, 2);
      if ((dos === 'ch' || dos === 'll' || dos === 'rr') && p + 1 < hasta) { unid.push([p, dos]); p += 2; }
      else if ((dos === 'qu' || dos === 'gu') && tipos[p + 1] === 'C' && p + 1 < hasta) { unid.push([p, dos]); p += 2; }
      else { unid.push([p, l[p]]); p++; }
    }
    var corte;
    if (!unid.length) corte = hasta;                         // hiato directo
    else if (unid.length === 1 && unid[0][1] === 'h') corte = unid[0][0];
    else if (unid.length >= 2 && GRUPOS.indexOf(unid[unid.length - 2][1] + unid[unid.length - 1][1]) >= 0) corte = unid[unid.length - 2][0];
    else corte = unid[unid.length - 1][0];
    cortes.push(corte);
  }
  var res = [], ant = 0;
  cortes.concat([n]).forEach(function (c, i) {
    res.push({ t: P.orig.slice(ant, c), a: ant, b: c, nuc: nucleos[i] });
    ant = c;
  });
  return res;
}

/* Sílaba tónica de una palabra ya silabeada */
function tonica(P, sil) {
  var l = P.l, n = sil.length;
  if (n === 1) return 0;
  // adverbios en -mente: para el final del verso manda «men»
  var conTilde = -1;
  sil.forEach(function (s, i) { if (/[áéíóú]/.test(s.t.toLowerCase())) conTilde = i; });
  if (/mente$/.test(l) && n >= 3 && (conTilde >= 0 && conTilde < n - 2)) return n - 2;
  if (conTilde >= 0) return conTilde;
  var ult = l[l.length - 1];
  if (/[aeiouns]/.test(ult)) return n - 2;
  return n - 1;
}

/* Vocal que lleva el acento dentro del núcleo de la sílaba tónica */
function vocalTonica(P, s) {
  var l = P.l, a = s.nuc[0], b = s.nuc[1], mejor = -1;
  for (var i = a; i <= b; i++) if (TILDE.indexOf(l[i]) >= 0) return i;
  for (i = a; i <= b; i++) if (P.tipos[i] === 'V' && 'aeo'.indexOf(l[i]) >= 0) return i;
  for (i = b; i >= a; i--) if (P.tipos[i] === 'V') { mejor = i; break; }
  return mejor < 0 ? a : mejor;
}

/* ---------- Troceo del verso en palabras ---------- */
function trocea(verso) {
  var re = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñÏï]+/g, m, pal = [];
  while ((m = re.exec(verso))) {
    pal.push({ txt: m[0], ini: m.index, fin: m.index + m[0].length });
  }
  pal.forEach(function (p, i) {
    var sig = pal[i + 1];
    var entre = verso.slice(p.fin, sig ? sig.ini : verso.length);
    p.pausa = /[,;:.!?…—–()¡¿"«»]/.test(entre) ? entre.replace(/\s/g, '') : '';
  });
  return pal;
}

/* ¿Puede haber sinalefa entre el final de A y el principio de B? */
function puedeSinalefa(A, B) {
  var la = A.P.l, lb = B.P.l;
  // A acaba en vocal (la h final es muda: «oh»)
  var fa = la.replace(/h$/, '');
  var tA = A.P.tipos[fa.length - 1];
  if (!fa.length || tA !== 'V') return false;
  // -y final ante vocal suena consonante (soy un → so-yun), salvo la conjunción «y»
  if (fa.length > 1 && fa[fa.length - 1] === 'y') return false;
  // B empieza por vocal (o h + vocal)
  var ib = lb[0] === 'h' && lb[1] !== undefined ? 1 : 0;
  if (B.P.tipos[ib] !== 'V') return false;
  // hie-, hue-, ie-, ue- al principio: la i/u suena consonante (hierba, hueso)
  if ((lb[ib] === 'i' || lb[ib] === 'u') && lb[ib + 1] && /[aeoáéó]/.test(lb[ib + 1]) && ib === 1) return false;
  return true;
}

/* ---------- Medida de un verso ----------
   op: { sinalefa: true|false, cambios: {clave: true|false} }
   Las «claves» de uniones son: 'p<i>u<k>' (dentro de la palabra i) y 's<i>' (sinalefa entre i e i+1). */
function mide(verso, op) {
  op = op || {};
  var usaSin = op.sinalefa !== false, cambios = op.cambios || {};
  var pal = trocea(verso);
  if (!pal.length) return null;
  pal.forEach(function (p, i) {
    p.P = palabra(p.txt);
    p.P.uniones.forEach(function (u, k) {
      u.clave = 'p' + i + 'u' + k;
      if (u.forzada) { u.unida = false; return; }
      if (cambios[u.clave] !== undefined) u.unida = cambios[u.clave];
    });
    p.sil = silabas(p.P);
    p.ton = tonica(p.P, p.sil);
    p.atona = p.sil.length === 1 && ATONAS.indexOf(quita(p.P.l)) >= 0 && !/[áéíóú]/.test(p.P.l);
  });
  // Sinalefas
  var juntas = [];
  for (var i = 0; i + 1 < pal.length; i++) {
    var pos = puedeSinalefa(pal[i], pal[i + 1]);
    var clave = 's' + i;
    var activa = pos && usaSin;
    if (pos && cambios[clave] !== undefined) activa = cambios[clave];
    if (op.cesura === i) activa = false;
    juntas.push({ clave: clave, i: i, posible: pos, activa: activa });
  }
  // Sílabas métricas: lista de grupos de {pal, sil}
  var metr = [], cur = null;
  pal.forEach(function (p, i) {
    p.sil.forEach(function (s, k) {
      var item = { w: i, k: k, t: s.t, tonica: (k === p.ton && !p.atona) };
      if (k === 0 && i > 0 && juntas[i - 1].activa && cur) cur.partes.push(item);
      else { cur = { partes: [item] }; metr.push(cur); }
    });
  });
  metr.forEach(function (m) { m.tonica = m.partes.some(function (x) { return x.tonica; }); m.t = m.partes.map(function (x) { return x.t; }).join('‿'); });
  var ult = pal[pal.length - 1];
  var post = ult.sil.length - 1 - ult.ton;
  var tipo = post <= 0 ? 'aguda' : post === 1 ? 'llana' : post === 2 ? 'esdrújula' : 'sobresdrújula';
  var ajuste = post <= 0 ? 1 : post === 1 ? 0 : -(post - 1);
  var fonol = metr.length;
  var r = {
    verso: verso, palabras: pal, juntas: juntas, metricas: metr,
    fonologicas: fonol, ultima: ult.txt, tipoFinal: tipo, ajuste: ajuste,
    total: fonol + ajuste
  };
  r.licencias = licencias(r);
  r.rima = rima(ult);
  return r;
}

/* Licencias aplicadas respecto a lo natural */
function licencias(r) {
  var out = [];
  r.juntas.forEach(function (j) {
    if (!j.posible) return;
    var a = r.palabras[j.i], b = r.palabras[j.i + 1];
    var txt = a.sil[a.sil.length - 1].t + '‿' + b.sil[0].t;
    out.push({ clave: j.clave, tipo: j.activa ? 'sinalefa' : 'hiato', txt: j.activa ? txt : a.sil[a.sil.length - 1].t + ' | ' + b.sil[0].t, palabras: a.txt + ' ' + b.txt });
  });
  r.palabras.forEach(function (p) {
    p.P.uniones.forEach(function (u) {
      var par = p.P.orig.slice(u.i, u.j + 1);
      if (u.forzada) out.push({ clave: u.clave, tipo: 'diéresis', txt: par, palabras: p.txt, forzada: true });
      else if (u.natural === 'hiato' && u.unida) out.push({ clave: u.clave, tipo: 'sinéresis', txt: par, palabras: p.txt });
      else if (u.natural === 'diptongo' && !u.unida) out.push({ clave: u.clave, tipo: 'diéresis', txt: par, palabras: p.txt });
      else if (u.natural === 'hiato') out.push({ clave: u.clave, tipo: 'hiato-palabra', txt: par, palabras: p.txt });
    });
  });
  return out;
}

/* ---------- Rima ---------- */
function fonetica(s) {
  // Aproximación fonética para comparar rimas (castellano de España)
  s = s.toLowerCase();
  s = s.replace(/y$/, 'i');
  s = s.replace(/qu([eiéí])/g, 'k$1').replace(/gu([eiéí])/g, 'g$1').replace(/gü/g, 'gu');
  s = s.replace(/c([eiéí])/g, 'z$1').replace(/g([eiéí])/g, 'j$1');
  s = s.replace(/ch/g, 'Ç').replace(/c/g, 'k').replace(/h/g, '').replace(/v/g, 'b').replace(/w/g, 'u').replace(/x/g, 'ks');
  return quita(s);
}
function rima(ult) {
  var P = ult.P, sil = ult.sil, s = sil[ult.ton];
  var vt = vocalTonica(P, s);
  var cola = P.l.slice(vt);
  var cons = fonetica(cola);
  // asonante: vocales que suenan desde la tónica (sin las semivocales de los diptongos)
  var voc = [quita(P.l[vt])];
  var postSil = sil.slice(ult.ton + 1);
  // en esdrújulas no cuenta la vocal de la penúltima sílaba
  if (postSil.length >= 2) postSil = [postSil[postSil.length - 1]];
  postSil.forEach(function (x, idx) {
    var nu = x.nuc; if (!nu) return;
    var mejor = null;
    for (var i = nu[0]; i <= nu[1]; i++) if (P.tipos[i] === 'V' && /[aeoáéó]/.test(P.l[i])) { mejor = P.l[i]; break; }
    if (!mejor) for (i = nu[1]; i >= nu[0]; i--) if (P.tipos[i] === 'V') { mejor = P.l[i]; break; }
    mejor = quita(mejor || '');
    if (mejor === 'i' || mejor === 'y') mejor = 'e';
    if (mejor === 'u') mejor = 'o';
    voc.push(mejor);
  });
  return { cons: cons, ason: voc.join('-'), cola: P.orig.slice(vt) };
}

/* ---------- Nombres ---------- */
var NOMBRES = { 1: 'monosílabo', 2: 'bisílabo', 3: 'trisílabo', 4: 'tetrasílabo', 5: 'pentasílabo', 6: 'hexasílabo', 7: 'heptasílabo', 8: 'octosílabo', 9: 'eneasílabo', 10: 'decasílabo', 11: 'endecasílabo', 12: 'dodecasílabo', 13: 'tridecasílabo', 14: 'alejandrino', 15: 'pentadecasílabo', 16: 'hexadecasílabo', 17: 'heptadecasílabo', 18: 'octodecasílabo', 19: 'eneadecasílabo' };
function nombre(n) { return NOMBRES[n] || (n + ' sílabas'); }
function arte(n) { return n <= 8 ? 'menor' : 'mayor'; }

/* ---------- Ajuste a un metro (licencias) ----------
   Busca la combinación de licencias más natural para que el verso mida «objetivo». */
function opciones(r) {
  var op = [];
  r.juntas.forEach(function (j) {
    if (!j.posible || !j.activa) return;
    var a = r.palabras[j.i], b = r.palabras[j.i + 1];
    var coste = 1;
    var tA = a.sil.length - 1 === a.ton && !a.atona;     // la última sílaba de A es tónica
    var tB = b.ton === 0 && !b.atona;                    // la primera de B es tónica
    if (tA) coste -= 0.4; if (tB) coste -= 0.35;
    if (a.pausa && /[.;:!?]/.test(a.pausa)) coste -= 0.2;
    op.push({ clave: j.clave, val: false, delta: +1, coste: coste, tipo: 'hiato' });
  });
  r.palabras.forEach(function (p) {
    p.P.uniones.forEach(function (u) {
      if (u.forzada) return;
      var a = p.P.l[u.i], b = p.P.l[u.j];
      if (u.natural === 'hiato' && u.unida === false) {
        var c = (/[áéíóú]/.test(a + b)) ? 1.6 : 1.1;
        op.push({ clave: u.clave, val: true, delta: -1, coste: c, tipo: 'sinéresis' });
      }
      if (u.natural === 'diptongo' && u.unida) {
        op.push({ clave: u.clave, val: false, delta: +1, coste: 1.5, tipo: 'diéresis' });
      }
    });
  });
  return op;
}

function ajusta(verso, objetivo, base) {
  var r0 = mide(verso, base);
  if (!r0) return null;
  var dif = objetivo - r0.total;
  if (dif === 0) return { r: r0, coste: 0, cambios: {} };
  if (Math.abs(dif) > 2) return null;
  var ops = opciones(r0).filter(function (o) { return o.delta === (dif > 0 ? 1 : -1); });
  ops.sort(function (a, b) { return a.coste - b.coste; });
  var n = Math.abs(dif);
  if (ops.length < n) return null;
  var elegidas = ops.slice(0, n), cambios = {};
  Object.keys((base && base.cambios) || {}).forEach(function (k) { cambios[k] = base.cambios[k]; });
  elegidas.forEach(function (o) { cambios[o.clave] = o.val; });
  var r = mide(verso, { sinalefa: base ? base.sinalefa : true, cambios: cambios, cesura: base && base.cesura });
  if (!r || r.total !== objetivo) return null;
  return { r: r, coste: elegidas.reduce(function (s, o) { return s + o.coste; }, 0) + (n - 1) * 0.5, cambios: cambios, elegidas: elegidas };
}

/* Verso compuesto: dos hemistiquios, cada uno con su ley del acento */
function compuesto(verso, mitad, permite) {
  var pal = trocea(verso);
  if (pal.length < 3) return null;
  var mejor = null;
  for (var k = 0; k < pal.length - 1; k++) {
    var izq = verso.slice(0, pal[k].fin), der = verso.slice(pal[k + 1].ini);
    var a = permite ? ajusta(izq, mitad) : (function () { var x = mide(izq); return x && x.total === mitad ? { r: x, coste: 0, cambios: {} } : null; })();
    if (!a) continue;
    var b = permite ? ajusta(der, mitad) : (function () { var x = mide(der); return x && x.total === mitad ? { r: x, coste: 0, cambios: {} } : null; })();
    if (!b) continue;
    var coste = a.coste + b.coste + (pal[k].pausa ? 0 : 0.3) + Math.abs(k + 0.5 - pal.length / 2) * 0.01;
    if (!mejor || coste < mejor.coste) mejor = { coste: coste, lic: a.coste + b.coste, camb: [a.cambios, b.cambios], k: k, hemis: [a.r, b.r], total: a.r.total + b.r.total, izq: izq, der: der };
  }
  return mejor;
}

/* Mide un verso, con objetivo opcional (número de sílabas) */
function analiza(verso, op) {
  op = op || {};
  var base = { sinalefa: op.sinalefa !== false, cambios: op.cambios || {} };
  var r = mide(verso, base);
  if (!r) return null;
  r.nombre = nombre(r.total); r.arte = arte(r.total);
  var obj = op.objetivo;
  // ¿compuesto? (alejandrino 7+7, dodecasílabo 6+6, hexadecasílabo 8+8)
  var mitades = obj ? (obj >= 12 && obj % 2 === 0 ? [obj / 2] : []) :
    (r.total >= 13 && r.total <= 15 ? [7] : r.total === 12 ? [6] : r.total >= 16 && r.total <= 17 ? [8] : []);
  if (op.compuesto !== false) {
    for (var m = 0; m < mitades.length; m++) {
      var c = compuesto(verso, mitades[m], !!obj);
      if (c && (!obj || c.total === obj)) {
        r.compuesto = c; r.total = c.total; r.nombre = nombre(c.total) + ' (' + mitades[m] + ' + ' + mitades[m] + ')'; r.arte = 'mayor';
        r.ajustado = !!obj && c.lic > 0;
        return r;
      }
    }
  }
  if (obj && obj !== r.total && !op.cambios) {
    var a = ajusta(verso, obj, base);
    if (a) { a.r.nombre = nombre(obj); a.r.arte = arte(obj); a.r.ajustado = true; a.r.sugeridas = a.elegidas; a.r.cambios = a.cambios; return a.r; }
  }
  return r;
}

/* ---------- Poema ---------- */
function poema(texto, op) {
  op = op || {};
  var lineas = texto.replace(/\r/g, '').split('\n');
  var versos = [], estrofa = 0, hubo = false;
  lineas.forEach(function (ln) {
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ln)) { if (hubo) estrofa++; hubo = false; return; }
    hubo = true; versos.push({ texto: ln.trim(), estrofa: estrofa });
  });
  if (!versos.length) return null;
  versos.forEach(function (v) { v.r = analiza(v.texto, { sinalefa: op.sinalefa }); });
  // Metros principales del poema
  var frec = {};
  versos.forEach(function (v) { frec[v.r.total] = (frec[v.r.total] || 0) + 1; });
  var principales = Object.keys(frec).map(Number).filter(function (n) { return frec[n] >= 2 && frec[n] >= versos.length * 0.2; });
  if (op.objetivo) principales = [op.objetivo];
  if (versos.length >= 3 && principales.length && op.ajustar !== false) {
    versos.forEach(function (v) {
      if (principales.indexOf(v.r.total) >= 0) return;
      var cerca = principales.slice().sort(function (a, b) { return Math.abs(a - v.r.total) - Math.abs(b - v.r.total); });
      for (var i = 0; i < cerca.length; i++) {
        if (Math.abs(cerca[i] - v.r.total) > 1 && !op.objetivo) break;
        var x = analiza(v.texto, { sinalefa: op.sinalefa, objetivo: cerca[i] });
        if (x && x.total === cerca[i]) { v.r = x; break; }
      }
    });
  }
  esquema(versos);
  var estrofas = [];
  versos.forEach(function (v) { (estrofas[v.estrofa] = estrofas[v.estrofa] || []).push(v); });
  estrofas = estrofas.filter(Boolean);
  var nombres = estrofas.map(nombraEstrofa);
  return { versos: versos, estrofas: estrofas, nombresEstrofa: nombres, forma: nombraPoema(versos, estrofas, nombres), principales: principales };
}

function esquema(versos) {
  var letras = 'abcdefghijklmnopqrstuvwxyz', usadas = 0;
  var porCons = {}, porAson = {};
  versos.forEach(function (v, i) { (porCons[v.r.rima.cons] = porCons[v.r.rima.cons] || []).push(i); });
  versos.forEach(function (v) { v.letra = null; v.tipoRima = null; });
  // consonante primero
  var grupos = [];
  Object.keys(porCons).forEach(function (k) { if (porCons[k].length >= 2) grupos.push({ idx: porCons[k], tipo: 'consonante' }); });
  // romance: misma asonancia en versos alternos (todos pares o todos impares) aunque algunos rimen en consonante
  var todasAson = {};
  versos.forEach(function (v, i) { (todasAson[v.r.rima.ason] = todasAson[v.r.rima.ason] || []).push(i); });
  Object.keys(todasAson).forEach(function (k) {
    var idx = todasAson[k];
    if (idx.length < 3 || !idx.every(function (i) { return i % 2 === idx[0] % 2; })) return;
    var cons = {}; idx.forEach(function (i) { cons[versos[i].r.rima.cons] = 1; });
    if (Object.keys(cons).length < 2) return;
    grupos = grupos.map(function (g) { return { idx: g.idx.filter(function (i) { return idx.indexOf(i) < 0; }), tipo: g.tipo }; }).filter(function (g) { return g.idx.length >= 2; });
    grupos.push({ idx: idx, tipo: 'asonante' });
  });
  var enCons = 0; grupos.forEach(function (g) { if (g.tipo === 'consonante') enCons += g.idx.length; });
  if (enCons < versos.length * 0.5) {
    versos.forEach(function (v, i) { if (!grupos.some(function (g) { return g.idx.indexOf(i) >= 0; })) (porAson[v.r.rima.ason] = porAson[v.r.rima.ason] || []).push(i); });
    Object.keys(porAson).forEach(function (k) { if (porAson[k].length >= 2) grupos.push({ idx: porAson[k], tipo: 'asonante' }); });
  }
  // asonante que comparte vocales con un grupo consonante: misma letra (p. ej. romance con alguna consonante)
  grupos.sort(function (a, b) { return a.idx[0] - b.idx[0]; });
  var asonDeLetra = {};
  grupos.forEach(function (g) {
    var ason = versos[g.idx[0]].r.rima.ason, letra;
    if (g.tipo === 'asonante' && asonDeLetra[ason]) letra = asonDeLetra[ason];
    else { letra = letras[usadas++ % 26]; if (g.tipo === 'asonante') asonDeLetra[ason] = letra; }
    g.idx.forEach(function (i) { versos[i].letra = letra; versos[i].tipoRima = g.tipo; });
  });
  versos.forEach(function (v) {
    v.marca = v.letra ? (v.r.total >= 9 ? v.letra.toUpperCase() : v.letra) : '–';
  });
}

function nombraEstrofa(e) {
  var n = e.length, med = e.map(function (v) { return v.r.total; });
  var esq = e.map(function (v) { return v.letra || '-'; }).join('');
  var todos = function (x) { return med.every(function (m) { return m === x; }); };
  var menor = med.every(function (m) { return m <= 8; });
  var tipos = e.map(function (v) { return v.tipoRima; });
  var cons = tipos.every(function (t) { return !t || t === 'consonante'; });
  var norm = normaliza(esq);
  if (n === 2 && norm === 'aa') return 'pareado';
  if (n === 3 && todos(11) && norm === 'aba') return 'terceto';
  if (n === 3 && norm === 'a-a' && menor) return 'soleá';
  if (n === 3 && todos(11)) return 'terceto';
  if (n === 4) {
    var mayorIg = med.every(function (m) { return m === med[0] && m >= 9; });
    if (mayorIg && norm === 'abba' && cons) return 'cuarteto';
    if (mayorIg && norm === 'abab' && cons) return 'serventesio';
    if (menor && norm === 'abba' && cons) return 'redondilla';
    if (menor && norm === 'abab' && cons) return 'cuarteta';
    if (todos(8) && /^.a.a$/.test(norm.replace(/b/g, '-'))) return 'copla';
    if (med.join(',') === '7,5,7,5' && /^.a.a$/.test(norm.replace(/b/g, '-'))) return 'seguidilla';
    if (todos(14) && norm === 'aaaa') return 'cuaderna vía';
  }
  if (n === 5) {
    if (med.join(',') === '7,11,7,7,11' && norm === 'ababb') return 'lira';
    if (menor) return 'quintilla';
  }
  if (n === 6 && med.join(',') === '8,8,4,8,8,4' && norm === 'abcabc') return 'copla manriqueña';
  if (n === 8 && todos(11) && norm === 'abababcc') return 'octava real';
  if (n === 10 && todos(8) && norm === 'abbaaccddc') return 'décima espinela';
  if (n === 14 && todos(11)) return 'soneto';
  return '';
}
function normaliza(esq) {
  var m = {}, sig = 'abcdefghijklmnopqrstuvwxyz', k = 0;
  return esq.split('').map(function (c) { if (c === '-') return '-'; if (!m[c]) m[c] = sig[k++]; return m[c]; }).join('');
}
function nombraPoema(versos, estrofas, nombres) {
  var med = versos.map(function (v) { return v.r.total; });
  var n = versos.length;
  var todos = function (x) { return med.every(function (m) { return m === x; }); };
  if (estrofas.length === 4 && nombres.slice(0, 2).every(function (x) { return x === 'cuarteto' || x === 'serventesio'; }) && estrofas[2].length === 3 && estrofas[3].length === 3 && todos(11)) return 'soneto';
  if (n === 14 && todos(11)) return 'soneto';
  if (estrofas.length === 1 && n <= 5 && nombres[0]) return nombres[0];
  // romance: octosílabos, pares con la misma asonancia, impares sueltos
  if (n >= 4 && med.filter(function (m) { return m === 8; }).length >= n * 0.8) {
    var pares = versos.filter(function (v, i) { return i % 2 === 1; });
    var l = pares[0].letra;
    if (l && pares.every(function (v) { return v.letra === l; }) && versos.filter(function (v, i) { return i % 2 === 0 && v.letra === l; }).length === 0) return 'romance';
  }
  if (estrofas.length === 1 && nombres[0]) return nombres[0];
  return '';
}

var API = { mide: mide, analiza: analiza, poema: poema, nombre: nombre, arte: arte, trocea: trocea, palabra: palabra, silabas: silabas, version: '1.0' };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.Metrica = API;
})(this);
