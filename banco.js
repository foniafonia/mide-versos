/* Banco de versos. Solo textos de dominio público (autores fallecidos hace más de 80 años
   o tradición popular) y versos escritos para esta app.
   m: medida esperada de cada verso (la batería de pruebas la comprueba). */
(function (raiz) {
var BANCO = [
  /* ---------- Primaria ---------- */
  { id: 'munyeca', nivel: 'primaria', autor: 'Tradicional', titulo: 'Tengo una muñeca', m: [6, 6, 6, 6],
    t: 'Tengo una muñeca\nvestida de azul,\ncon su camisita\ny su canesú.' },
  { id: 'pollitos', nivel: 'primaria', autor: 'Tradicional', titulo: 'Los pollitos dicen', m: [6, 6, 6, 6],
    t: 'Los pollitos dicen\npío, pío, pío,\ncuando tienen hambre,\ncuando tienen frío.' },
  { id: 'corro', nivel: 'primaria', autor: 'Tradicional', titulo: 'Al corro de la patata', m: [8, 8, 8, 8],
    t: 'Al corro de la patata\ncomeremos ensalada\ncomo comen los señores,\nnaranjitas y limones.' },
  { id: 'luna', nivel: 'primaria', autor: 'Mide versos', titulo: 'La luna redonda', m: [6, 6, 6, 6],
    t: 'La luna redonda\nse asoma al balcón,\nme mira y me canta\nla nana del sol.' },
  { id: 'perro', nivel: 'primaria', autor: 'Mide versos', titulo: 'Mi perro Tuno', m: [8, 8, 8, 8],
    t: 'Mi perro se llama Tuno\ny corre detrás del gato;\nlos dos se van al jardín\ny juegan con mi zapato.' },
  { id: 'sol', nivel: 'primaria', autor: 'Mide versos', titulo: 'El sol de la mañana', m: [5, 5, 5, 5],
    t: 'El sol se asoma\npor la ventana,\nlo pinta todo\ncada mañana.' },
  { id: 'burro', nivel: 'primaria', autor: 'Tomás de Iriarte', titulo: 'El burro flautista', m: [6, 6, 6, 6, 6, 6, 6, 6],
    t: 'Esta fabulilla,\nsalga bien o mal,\nme ha ocurrido ahora\npor casualidad.\n\nCerca de unos prados\nque hay en mi lugar,\npasaba un borrico\npor casualidad.' },
  { id: 'primavera', nivel: 'primaria', autor: 'Antonio Machado', titulo: 'La primavera besaba', m: [8, 8, 8, 8],
    t: 'La primavera besaba\nsuavemente la arboleda,\ny el verde nuevo brotaba\ncomo una verde humareda.' },

  /* ---------- Clásicos ---------- */
  { id: 'caminante', nivel: 'clasico', autor: 'Antonio Machado', titulo: 'Caminante, no hay camino', m: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    t: 'Caminante, son tus huellas\nel camino y nada más;\ncaminante, no hay camino,\nse hace camino al andar.\nAl andar se hace camino,\ny al volver la vista atrás\nse ve la senda que nunca\nse ha de volver a pisar.\nCaminante, no hay camino,\nsino estelas en la mar.' },
  { id: 'olmo', nivel: 'clasico', autor: 'Antonio Machado', titulo: 'A un olmo seco', m: [11, 7, 11, 11],
    t: 'Al olmo viejo, hendido por el rayo\ny en su mitad podrido,\ncon las lluvias de abril y el sol de mayo\nalgunas hojas verdes le han salido.' },
  { id: 'retrato', nivel: 'clasico', autor: 'Antonio Machado', titulo: 'Retrato', m: [14, 14, 14, 14],
    t: 'Mi infancia son recuerdos de un patio de Sevilla,\ny un huerto claro donde madura el limonero;\nmi juventud, veinte años en tierras de Castilla;\nmi historia, algunos casos que recordar no quiero.' },
  { id: 'golondrinas', nivel: 'clasico', autor: 'Gustavo Adolfo Bécquer', titulo: 'Rima LIII', m: [11, 11, 11, 7, 11, 11, 11, 7],
    t: 'Volverán las oscuras golondrinas\nen tu balcón sus nidos a colgar,\ny otra vez con el ala a sus cristales\njugando llamarán.\n\nPero aquellas que el vuelo refrenaban\ntu hermosura y mi dicha a contemplar,\naquellas que aprendieron nuestros nombres...\nésas... ¡no volverán!' },
  { id: 'poesia', nivel: 'clasico', autor: 'Gustavo Adolfo Bécquer', titulo: 'Rima XXI', m: [11, 11, 11, 7],
    t: '¿Qué es poesía?, dices mientras clavas\nen mi pupila tu pupila azul.\n¿Qué es poesía? ¿Y tú me lo preguntas?\nPoesía... eres tú.' },
  { id: 'suspiros', nivel: 'clasico', autor: 'Gustavo Adolfo Bécquer', titulo: 'Rima XXXVIII', m: [11, 11, 11, 7],
    t: 'Los suspiros son aire y van al aire.\nLas lágrimas son agua y van al mar.\nDime, mujer: cuando el amor se olvida,\n¿sabes tú adónde va?' },
  { id: 'mirada', nivel: 'clasico', autor: 'Gustavo Adolfo Bécquer', titulo: 'Rima XXIII', m: [8, 8, 8, 8],
    t: 'Por una mirada, un mundo;\npor una sonrisa, un cielo;\npor un beso... ¡yo no sé\nqué te diera por un beso!' },
  { id: 'olas', nivel: 'clasico', autor: 'Gustavo Adolfo Bécquer', titulo: 'Rima LII', m: [11, 11, 11, 7],
    t: 'Olas gigantes que os rompéis bramando\nen las playas desiertas y remotas,\nenvuelto entre la sábana de espumas,\n¡llevadme con vosotras!' },
  { id: 'lunaluna', nivel: 'clasico', autor: 'Federico García Lorca', titulo: 'Romance de la luna, luna', m: [8, 8, 8, 8, 8, 8, 8, 8],
    t: 'La luna vino a la fragua\ncon su polisón de nardos.\nEl niño la mira, mira.\nEl niño la está mirando.\nEn el aire conmovido\nmueve la luna sus brazos\ny enseña, lúbrica y pura,\nsus senos de duro estaño.' },
  { id: 'sonambulo', nivel: 'clasico', autor: 'Federico García Lorca', titulo: 'Romance sonámbulo', m: [8, 8, 8, 8],
    t: 'Verde que te quiero verde.\nVerde viento. Verdes ramas.\nEl barco sobre la mar\ny el caballo en la montaña.' },
  { id: 'juventud', nivel: 'clasico', autor: 'Rubén Darío', titulo: 'Canción de otoño en primavera', m: [9, 9, 9, 9],
    t: 'Juventud, divino tesoro,\n¡ya te vas para no volver!\nCuando quiero llorar, no lloro...\ny a veces lloro sin querer...' },
  { id: 'sonatina', nivel: 'clasico', autor: 'Rubén Darío', titulo: 'Sonatina', m: [14, 14, 14, 14, 14, 14],
    t: 'La princesa está triste... ¿qué tendrá la princesa?\nLos suspiros se escapan de su boca de fresa,\nque ha perdido la risa, que ha perdido el color.\nLa princesa está pálida en su silla de oro,\nestá mudo el teclado de su clave sonoro,\ny en un vaso, olvidada, se desmaya una flor.' },
  { id: 'fatal', nivel: 'clasico', autor: 'Rubén Darío', titulo: 'Lo fatal', m: [14, 14],
    t: 'Dichoso el árbol que es apenas sensitivo,\ny más la piedra dura porque esa ya no siente,' },
  { id: 'pirata', nivel: 'clasico', autor: 'José de Espronceda', titulo: 'Canción del pirata', m: [8, 8, 8, 8, 8, 8, 8, 8],
    t: 'Con diez cañones por banda,\nviento en popa, a toda vela,\nno corta el mar, sino vuela\nun velero bergantín.\nBajel pirata que llaman,\npor su bravura, el Temido,\nen todo mar conocido\ndel uno al otro confín.' },
  { id: 'garcilaso', nivel: 'clasico', autor: 'Garcilaso de la Vega', titulo: 'Soneto V', m: [11, 11, 11, 11],
    t: 'Escrito está en mi alma vuestro gesto,\ny cuanto yo escribir de vos deseo;\nvos sola lo escribistes, yo lo leo\ntan solo, que aun de vos me guardo en esto.' },
  { id: 'nariz', nivel: 'clasico', autor: 'Francisco de Quevedo', titulo: 'A una nariz', m: [11, 11, 11, 11],
    t: 'Érase un hombre a una nariz pegado,\nérase una nariz superlativa,\nérase una nariz sayón y escriba,\nérase un peje espada muy barbado.' },
  { id: 'violante', nivel: 'clasico', autor: 'Lope de Vega', titulo: 'Soneto de repente', m: [11, 11, 11, 11],
    t: 'Un soneto me manda hacer Violante,\nque en mi vida me he visto en tal aprieto;\ncatorce versos dicen que es soneto;\nburla burlando van los tres delante.' },
  { id: 'manrique', nivel: 'clasico', autor: 'Jorge Manrique', titulo: 'Coplas por la muerte de su padre', m: [8, 8, 4, 8, 8, 4],
    t: 'Recuerde el alma dormida,\navive el seso y despierte\ncontemplando\ncómo se pasa la vida,\ncómo se viene la muerte\ntan callando;' },
  { id: 'necios', nivel: 'clasico', autor: 'Sor Juana Inés de la Cruz', titulo: 'Redondillas', m: [8, 8, 8, 8],
    t: 'Hombres necios que acusáis\na la mujer sin razón,\nsin ver que sois la ocasión\nde lo mismo que culpáis:' },
  { id: 'marti', nivel: 'clasico', autor: 'José Martí', titulo: 'Versos sencillos', m: [8, 8, 8, 8],
    t: 'Yo soy un hombre sincero\nde donde crece la palma,\ny antes de morirme quiero\nechar mis versos del alma.' },
  { id: 'lechera', nivel: 'clasico', autor: 'Félix María Samaniego', titulo: 'La lechera', m: [7, 11, 7, 11, 11, 11],
    t: 'Llevaba en la cabeza\nuna lechera el cántaro al mercado\ncon aquella presteza,\naquel aire sencillo, aquel agrado,\nque va diciendo a todo el que lo advierte:\n«¡Yo sí que estoy contenta con mi suerte!»' },
  { id: 'cebolla', nivel: 'clasico', autor: 'Miguel Hernández', titulo: 'Nanas de la cebolla', m: [7, 5, 7, 5],
    t: 'La cebolla es escarcha\ncerrada y pobre.\nEscarcha de tus días\ny de mis noches.' }
];

/* Versos sueltos para practicar: nivel 1 sin sinalefa, 2 con sinalefa, 3 con aguda o esdrújula, 4 con licencias */
var PRACTICA = [
  { v: 'Mi perro se llama Tuno', n: 1 }, { v: 'Tengo una muñeca', n: 1 }, { v: 'Los pollitos dicen', n: 1 },
  { v: 'Al corro de la patata', n: 1 }, { v: 'cuando tienen hambre', n: 1 }, { v: 'por la ventana', n: 1 },
  { v: 'naranjitas y limones', n: 1 }, { v: 'La primavera besaba', n: 1 }, { v: 'Verde que te quiero verde', n: 1 },
  { v: 'Verde viento. Verdes ramas.', n: 1 }, { v: 'con su polisón de nardos', n: 1 }, { v: 'Caminante, son tus huellas', n: 1 },
  { v: 'Nuestras vidas son los ríos', n: 1 }, { v: 'Juventud, divino tesoro', n: 1 }, { v: 'Volverán las oscuras golondrinas', n: 1 },
  { v: 'Era un niño que soñaba', n: 2 }, { v: 'La luna vino a la fragua', n: 2 }, { v: 'El niño la está mirando', n: 2 },
  { v: 'y el caballo en la montaña', n: 2 }, { v: 'se asoma al balcón', n: 2 }, { v: 'Recuerde el alma dormida', n: 2 },
  { v: 'viento en popa, a toda vela', n: 2 }, { v: 'Asia a un lado, al otro Europa', n: 2 }, { v: 'y otra vez con el ala a sus cristales', n: 2 },
  { v: 'Mi infancia son recuerdos de un patio de Sevilla', n: 2 }, { v: 'Érase un hombre a una nariz pegado', n: 2 },
  { v: 'Los suspiros son aire y van al aire', n: 2 }, { v: 'como una verde humareda', n: 2 },
  { v: 'un caballo de cartón', n: 3 }, { v: 'El barco sobre la mar', n: 3 }, { v: 'vestida de azul', n: 3 },
  { v: 'y su canesú', n: 3 }, { v: 'un velero bergantín', n: 3 }, { v: 'se hace camino al andar', n: 3 },
  { v: 'en tu balcón sus nidos a colgar', n: 3 }, { v: 'jugando llamarán', n: 3 }, { v: '¡ya te vas para no volver!', n: 3 },
  { v: 'Poesía... eres tú', n: 3 }, { v: 'La niña come plátanos', n: 3 }, { v: 'Mi gato duerme en el árbol', n: 3 },
  { v: 'Canta el reloj', n: 3 }, { v: 'Dichoso el árbol que es apenas sensitivo', n: 3 },
  { v: 'Escrito está en mi alma vuestro gesto', n: 4, obj: 11 }, { v: 'La princesa está pálida en su silla de oro', n: 4, obj: 14 },
  { v: 'dulce, süave y amoroso', n: 4, obj: 8 }, { v: 'y cuanto yo escribir de vos deseo', n: 4 }
];

var API = { BANCO: BANCO, PRACTICA: PRACTICA };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else { raiz.BANCO = BANCO; raiz.PRACTICA = PRACTICA; }
})(this);
