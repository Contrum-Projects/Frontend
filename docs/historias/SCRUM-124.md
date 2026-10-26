# SCRUM-124 · E7-H3 · Seguimiento del despacho en el pedido

**Orden:** 35 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-52 · **API:** No

**Necesita antes (frontend):** [SCRUM-129](SCRUM-129.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el estado y el código de seguimiento de mi despacho, con la finalidad de saber cuándo llegará.

**Historia backend:** SCRUM-52 · **Figma:** 07 Mis pedidos (detalle)

## Criterios de aceptación

1. **Envío registrado.** El pedido fue despachado. Cuando el cliente abre el detalle. Ve el servicio, el código de seguimiento y el estado del envío.
2. **Estado actualizado.** El estado del envío cambió. Cuando el cliente vuelve a abrir el detalle. Ve el estado más reciente.

## Pantalla y ruta

| Pantalla                 | Escritorio                                      | Celular           | Ruta                                          |
| ------------------------ | ----------------------------------------------- | ----------------- | --------------------------------------------- |
| 07 Mis pedidos y detalle | 2019:1396 · detalle 2019:1623 · vacío 2058:3544 | detalle 2019:2970 | `/cuenta/pedidos`, `/cuenta/pedidos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
