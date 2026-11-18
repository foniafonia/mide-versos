# Mide versos

App para enseñar a medir versos en castellano (métrica silábica), pedida por maestras de PT en ColmenIA.

- En línea: https://foniafonia.github.io/mide-versos/
- `metrica.js`: motor (sílabas fonológicas, sinalefa, diptongo/hiato, diéresis, sinéresis, ley del acento final, versos compuestos, rima y estrofas).
- `banco.js`: versos de dominio público y versos propios para Primaria.
- `app.js`: interfaz (medir paso a paso, palmadas, práctica, banco, guía, ficha imprimible, modo pizarra, abeja de mejoras).
- Pruebas: `node pruebas/pruebas.js` (cada verso del banco tiene su medida esperada).

Contadores anónimos: abacus, espacio `foniafonia-versos`, claves `mv_*` (`mv_aperturas`, `mv_personas`, `mv_c_<canal>_aperturas`, `mv_medir`, `mv_practica_acaba`, `mv_skool`…). `?c=wa|tg|fb|ig|sk|ln` marca el canal; `?yo=1` no cuenta en ese aparato.

Gabinete Fönia · ColmenIA (https://www.skool.com/logopedia-7339).
