# SCRUM-129 · E8-H1 · Mis pedidos y detalle del pedido

**Orden:** 34 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-57 · **API:** No

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-124](SCRUM-124.md), [SCRUM-128](SCRUM-128.md)

Como un Cliente, necesito ver mis pedidos y su detalle, con la finalidad de hacer seguimiento a lo que compré.

**Historia backend:** SCRUM-57 · **Figma:** 07 Mis pedidos, 07b Mis pedidos vacío

## Criterios de aceptación

1. **Listado.** El cliente abre «Mis pedidos». Cuando carga. Ve fecha, total y estado de cada pedido.
2. **Detalle.** El cliente abre un pedido. Cuando carga. Ve artículos, montos, entrega y el historial de estados con fechas.
3. **Sin pedidos.** La cuenta es nueva. Cuando abre la pantalla. Ve el mensaje y el botón al catálogo.
4. **Sin acceso.** El pedido es de otra cuenta. Cuando el cliente abre el enlace. La pantalla indica que no existe.

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
