# SCRUM-128 · E9-H4 · Descargar el comprobante o la factura

**Orden:** 36 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-56 · **API:** No

**Necesita antes (frontend):** [SCRUM-129](SCRUM-129.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito descargar el documento de mi compra desde el pedido, con la finalidad de respaldarla.

**Historia backend:** SCRUM-56 · **Figma:** 07 Mis pedidos (detalle)

## Criterios de aceptación

1. **Disponible.** El pedido tiene su documento. Cuando el cliente pulsa descargar. Se descarga el archivo.
2. **Pendiente.** La factura aún no se registra. Cuando el cliente abre el pedido. Se indica que el documento está pendiente y no se ofrece la descarga.

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
