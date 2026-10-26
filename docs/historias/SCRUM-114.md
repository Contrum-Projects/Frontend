# SCRUM-114 · E11-H5 · Inventario: stock y movimientos

**Orden:** 22 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-40 · **API:** No

**Necesita antes (frontend):** [SCRUM-111](SCRUM-111.md)  
**La necesitan después:** [SCRUM-115](SCRUM-115.md)

Como Personal de tienda, necesito consultar el stock y los movimientos en el panel, con la finalidad de saber qué hay, dónde está y a cuánto se compró.

**Historia backend:** SCRUM-40 · **Figma:** P5a Inventario · Stock, P5d Inventario · Movimientos

## Criterios de aceptación

1. **Stock.** El personal abre «Stock». Cuando carga. Ve el stock por formato y ubicación, con bodega elegible, último costo y último proveedor, y una lista filtrada por bajo el mínimo en celular.
2. **Movimientos.** El personal abre «Movimientos». Cuando aplica filtros por tipo y período. Ve entradas, ventas, mermas, consumo, transferencias y reingresos, con referencia y quién los registró.
3. **Sin entradas.** El formato nunca se recibió. Cuando se consulta. Muestra stock cero y sin proveedor ni costo.

## Pantalla y ruta

| Pantalla                     | Escritorio | Celular   | Ruta                            |
| ---------------------------- | ---------- | --------- | ------------------------------- |
| P5a Inventario · Stock       | 2043:1300  | 2044:1067 | `/panel/inventario`             |
| P5d Inventario · Movimientos | 2064:2156  | 2069:1548 | `/panel/inventario/movimientos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
