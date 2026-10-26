# SCRUM-113 · E11-H4 · Ajustes y transferencias de stock

**Orden:** 21 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-39 · **API:** No

**Necesita antes (frontend):** [SCRUM-112](SCRUM-112.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito ajustar y transferir stock desde el panel, con la finalidad de corregir conteos y ordenar la bodega.

**Historia backend:** SCRUM-39 · **Figma:** P5c Registrar salida (ajuste y transferencia)

## Criterios de aceptación

1. **Ajuste.** El personal elige «Ajuste». Cuando ingresa cantidad positiva o negativa y guarda. El stock se actualiza y el movimiento aparece en el historial.
2. **Transferencia.** El personal elige origen, destino y cantidad. Cuando guarda. El stock cambia en ambas ubicaciones.
3. **Sin stock.** La cantidad supera el origen. Cuando el servidor la rechaza. La pantalla muestra el error.

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
