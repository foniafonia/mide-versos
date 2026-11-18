/* Batería de pruebas del motor: node pruebas/pruebas.js */
var M = require('../metrica.js');
var fallos = 0, total = 0;
function ok(c, msg) { total++; if (!c) { fallos++; console.log('✗ ' + msg); } }

/* 1. Separación silábica de palabras (fonológica) */
var PAL = {
  'golondrinas': 'go-lon-dri-nas', 'oscuras': 'os-cu-ras', 'poesía': 'po-e-sí-a', 'caballo': 'ca-ba-llo',
  'perro': 'pe-rro', 'muchacho': 'mu-cha-cho', 'instante': 'ins-tan-te', 'obstruir': 'obs-truir',
  'ciudad': 'ciu-dad', 'ruido': 'rui-do', 'país': 'pa-ís', 'río': 'rí-o', 'aéreo': 'a-é-re-o',
  'buey': 'buey', 'Paraguay': 'Pa-ra-guay', 'averiguáis': 'a-ve-ri-guáis', 'guerra': 'gue-rra',
  'pingüino': 'pin-güi-no', 'quiero': 'quie-ro', 'ahumado': 'ahu-ma-do', 'búho': 'bú-ho',
  'alcohol': 'al-co-hol', 'deshacer': 'des-ha-cer', 'atleta': 'at-le-ta', 'hombre': 'hom-bre',
  'cielo': 'cie-lo', 'huevo': 'hue-vo', 'reyes': 're-yes', 'hoy': 'hoy', 'muy': 'muy',
  'construir': 'cons-truir', 'transporte': 'trans-por-te', 'examen': 'e-xa-men', 'aire': 'ai-re',
  'teatro': 'te-a-tro', 'leer': 'le-er', 'creer': 'cre-er', 'baúl': 'ba-úl', 'oído': 'o-í-do',
  'süave': 'sü-a-ve', 'cigüeña': 'ci-güe-ña', 'sublime': 'su-bli-me', 'abrazo': 'a-bra-zo',
  'Machado': 'Ma-cha-do', 'Bécquer': 'Béc-quer', 'llorar': 'llo-rar', 'triunfo': 'triun-fo'
};
Object.keys(PAL).forEach(function (w) {
  var s = M.silabas(M.palabra(w)).map(function (x) { return x.t; }).join('-');
  ok(s === PAL[w], 'sílabas «' + w + '»: ' + s + ' (esperado ' + PAL[w] + ')');
});

/* 2. Tipo de palabra por el acento */
var ACE = { 'canción': 'aguda', 'reloj': 'aguda', 'verde': 'llana', 'árbol': 'llana', 'lágrima': 'esdrújula',
  'cómpramelo': 'sobresdrújula', 'mar': 'aguda', 'golondrinas': 'llana', 'jardín': 'aguda', 'rápidamente': 'llana',
  'Uruguay': 'aguda', 'examen': 'llana', 'Bécquer': 'llana', 'pájaro': 'esdrújula', 'feliz': 'aguda' };
Object.keys(ACE).forEach(function (w) {
  var r = M.mide(w);
  ok(r.tipoFinal === ACE[w], 'acento «' + w + '»: ' + r.tipoFinal + ' (esperado ' + ACE[w] + ')');
});

/* 3. Versos sueltos (sin metro esperado) */
var VERSOS = [
  ['Verde que te quiero verde', 8], ['Volverán las oscuras golondrinas', 11],
  ['en tu balcón sus nidos a colgar,', 11], ['y otra vez con el ala a sus cristales', 11],
  ['jugando llamarán.', 7], ['Caminante, no hay camino,', 8], ['se hace camino al andar.', 8],
  ['Era un niño que soñaba', 8], ['un caballo de cartón.', 8], ['Juventud, divino tesoro,', 9],
  ['¡ya te vas para no volver!', 9], ['Cuando quiero llorar, no lloro...', 9], ['y a veces lloro sin querer.', 9],
  ['La princesa está triste... ¿qué tendrá la princesa?', 14], ['Los suspiros se escapan de su boca de fresa,', 14],
  ['que ha perdido la risa, que ha perdido el color.', 14], ['La luna vino a la fragua', 8],
  ['con su polisón de nardos.', 8], ['El niño la mira, mira.', 8], ['El niño la está mirando.', 8],
  ['Verde viento. Verdes ramas.', 8], ['El barco sobre la mar', 8], ['y el caballo en la montaña.', 8],
  ['¿Qué es poesía?, dices mientras clavas', 11], ['en mi pupila tu pupila azul.', 11],
  ['¿Qué es poesía? ¿Y tú me lo preguntas?', 11], ['Poesía... eres tú.', 7],
  ['Con diez cañones por banda,', 8], ['viento en popa, a toda vela,', 8], ['no corta el mar, sino vuela', 8],
  ['un velero bergantín.', 8], ['y ve el capitán pirata,', 8], ['cantando alegre en la popa,', 8],
  ['Asia a un lado, al otro Europa,', 8], ['y allá a su frente Estambul.', 8],
  ['Olas gigantes que os rompéis bramando', 11], ['en las playas desiertas y remotas,', 11],
  ['envuelto entre la sábana de espumas,', 11], ['¡llevadme con vosotras!', 7],
  ['Mi infancia son recuerdos de un patio de Sevilla,', 14], ['y un huerto claro donde madura el limonero;', 14],
  ['y cuanto yo escribir de vos deseo;', 11], ['vos sola lo escribistes, yo lo leo', 11],
  ['tan solo, que aun de vos me guardo en esto.', 11], ['La niña come plátanos', 7],
  ['Tengo una muñeca', 6], ['vestida de azul,', 6], ['En un lugar de la Mancha', 8],
  ['Nuestras vidas son los ríos', 8], ['que van a dar en la mar,', 8], ['que es el morir;', 5],
  ['Recuerde el alma dormida,', 8], ['avive el seso y despierte', 8], ['contemplando', 4],
  ['Yo soy un hombre sincero', 8], ['de donde crece la palma,', 8],
  ['Puedo escribir los versos más tristes esta noche.', 14]
];
VERSOS.forEach(function (v) {
  var r = M.analiza(v[0]);
  ok(r.total === v[1], 'verso «' + v[0] + '»: ' + r.total + ' (esperado ' + v[1] + ') · ' + r.metricas.map(function (m) { return m.t; }).join('-') + ' ' + r.tipoFinal);
});

/* 4. Licencias con metro esperado */
var CON = [
  ['Escrito está en mi alma vuestro gesto,', 11, 'hiato'],
  ['La princesa está pálida en su silla de oro,', 14, 'hiato'],
  ['dulce, süave y amoroso', 8, 'diéresis']
];
CON.forEach(function (v) {
  var r = M.analiza(v[0], { objetivo: v[1] });
  var tipos = r.compuesto ? r.compuesto.hemis.reduce(function (a, h) { return a.concat(h.licencias); }, []) : r.licencias;
  ok(r.total === v[1], 'con objetivo «' + v[0] + '»: ' + r.total + ' (esperado ' + v[1] + ')');
  ok(tipos.some(function (l) { return l.tipo === v[2]; }), 'licencia en «' + v[0] + '»: falta ' + v[2]);
});

/* 5. Poemas: metro, rima y estrofa */
var SONETO = 'Escrito está en mi alma vuestro gesto,\ny cuanto yo escribir de vos deseo;\nvos sola lo escribistes, yo lo leo\ntan solo, que aun de vos me guardo en esto.';
var p = M.poema(SONETO);
ok(p.versos.every(function (v) { return v.r.total === 11; }), 'Garcilaso: todos endecasílabos → ' + p.versos.map(function (v) { return v.r.total; }));
ok(p.versos.map(function (v) { return v.marca; }).join('') === 'ABBA', 'Garcilaso: rima ' + p.versos.map(function (v) { return v.marca; }).join(''));
ok(p.nombresEstrofa[0] === 'cuarteto', 'Garcilaso: estrofa ' + p.nombresEstrofa[0]);

var BEC = 'Volverán las oscuras golondrinas\nen tu balcón sus nidos a colgar,\ny otra vez con el ala a sus cristales\njugando llamarán.';
p = M.poema(BEC);
ok(p.versos.map(function (v) { return v.r.total; }).join(',') === '11,11,11,7', 'Bécquer: medidas ' + p.versos.map(function (v) { return v.r.total; }));
ok(p.versos.map(function (v) { return v.marca; }).join('') === '–A–a', 'Bécquer: rima ' + p.versos.map(function (v) { return v.marca; }).join('') + ' ' + p.versos.map(function (v) { return v.r.rima.ason + '/' + v.r.rima.cons; }));

var ROM = 'Verde que te quiero verde.\nVerde viento. Verdes ramas.\nEl barco sobre la mar\ny el caballo en la montaña.';
p = M.poema(ROM);
ok(p.versos.map(function (v) { return v.marca; }).join('') === '–a–a', 'Lorca: rima ' + p.versos.map(function (v) { return v.marca + ':' + v.r.rima.ason; }).join(' '));
ok(p.versos.every(function (v) { return v.r.total === 8; }), 'Lorca: octosílabos');
ok(p.forma === 'copla', 'Lorca: forma ' + p.forma);

var RED = 'Yo soy un hombre sincero\nde donde crece la palma,\ny antes de morirme quiero\nechar mis versos del alma.';
p = M.poema(RED);
ok(p.versos.map(function (v) { return v.marca; }).join('') === 'abab', 'Martí: rima ' + p.versos.map(function (v) { return v.marca; }).join(''));
ok(p.nombresEstrofa[0] === 'cuarteta', 'Martí: estrofa ' + p.nombresEstrofa[0]);
ok(p.versos.every(function (v) { return v.r.total === 8; }), 'Martí: ' + p.versos.map(function (v) { return v.r.total; }));

var REDO = 'Hombres necios que acusáis\na la mujer sin razón,\nsin ver que sois la ocasión\nde lo mismo que culpáis:';
p = M.poema(REDO);
ok(p.versos.map(function (v) { return v.marca; }).join('') === 'abba', 'Sor Juana: rima ' + p.versos.map(function (v) { return v.marca; }).join(''));
ok(p.nombresEstrofa[0] === 'redondilla', 'Sor Juana: estrofa ' + p.nombresEstrofa[0]);
ok(p.versos.every(function (v) { return v.r.total === 8; }), 'Sor Juana: ' + p.versos.map(function (v) { return v.r.total; }));

var ALE = 'La princesa está triste... ¿qué tendrá la princesa?\nLos suspiros se escapan de su boca de fresa,\nque ha perdido la risa, que ha perdido el color.\nLa princesa está pálida en su silla de oro,';
p = M.poema(ALE);
ok(p.versos.every(function (v) { return v.r.total === 14; }), 'Darío: alejandrinos ' + p.versos.map(function (v) { return v.r.total; }));

/* 6. Sin sinalefa (interruptor) */
ok(M.analiza('Era un niño que soñaba', { sinalefa: false }).total === 9, 'sin sinalefa: «Era un niño…» debe dar 9');

/* 7. Todo el banco: cada verso mide lo esperado */
var B = require('../banco.js');
B.BANCO.forEach(function (b) {
  var q = M.poema(b.t);
  var med = q.versos.map(function (v) { return v.r.total; });
  ok(med.join(',') === b.m.join(','), 'banco «' + b.titulo + '»: ' + med.join(',') + ' (esperado ' + b.m.join(',') + ')');
  ok(q.versos.length === b.m.length, 'banco «' + b.titulo + '»: número de versos');
});
B.PRACTICA.forEach(function (x) {
  var r = M.analiza(x.v, x.obj ? { objetivo: x.obj } : {});
  ok(r && r.total >= 4 && r.total <= 14, 'práctica «' + x.v + '»: ' + (r && r.total));
});
console.log((total - fallos) + ' de ' + total + ' pruebas bien' + (fallos ? ' · ' + fallos + ' FALLOS' : ' ✓'));
process.exit(fallos ? 1 : 0);
