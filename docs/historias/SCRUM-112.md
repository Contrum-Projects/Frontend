# SCRUM-112 · E11-H3 · Registrar salidas que no son venta

**Orden:** 20 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-38 · **API:** No

**Necesita antes (frontend):** [SCRUM-111](SCRUM-111.md)  
**La necesitan después:** [SCRUM-113](SCRUM-113.md)

Como Personal de tienda, necesito registrar mermas y consumo desde el panel, con la finalidad de que el stock refleje lo real.

**Historia backend:** SCRUM-38 · **Figma:** P5c Registrar salida

## Criterios de aceptación

1. **Registrar salida.** El personal abre el panel lateral (escritorio) o la pantalla propia (celular). Cuando elige tipo (merma por vencimiento, merma por daño o consumo en la peluquería), formato, ubicación y cantidad. La salida queda registrada y el stock se actualiza.
2. **Cantidad mayor al stock.** La cantidad supera el stock de la ubicación. Cuando el servidor la rechaza. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla             | Escritorio                | Celular   | Ruta                                    |
| -------------------- | ------------------------- | --------- | --------------------------------------- |
| P5c Registrar salida | 2043:1689 (panel lateral) | 2044:1209 | panel lateral sobre `/panel/inventario` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
