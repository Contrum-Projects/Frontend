# SCRUM-131 · E8-H3 · Cancelar un pedido pendiente de pago desde el panel

**Orden:** 38 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-59 · **API:** No

**Necesita antes (frontend):** [SCRUM-130](SCRUM-130.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito cancelar pedidos pendientes de pago, con la finalidad de liberar el stock.

**Historia backend:** SCRUM-59 · **Figma:** P2 Pedidos

## Criterios de aceptación

1. **Cancelar.** El pedido está pendiente de pago. Cuando el personal lo cancela. La interfaz pide confirmación y muestra el pedido cancelado en el historial.
2. **Pedido pagado.** El pedido ya está pagado. Cuando el personal abre su detalle. La acción de cancelar no se ofrece.
3. **Cliente.** El cliente revisa un pedido pendiente. Cuando abre su detalle. No ve opción de cancelar.

## Pantalla y ruta

| Pantalla   | Escritorio | Celular                     | Ruta                                        |
| ---------- | ---------- | --------------------------- | ------------------------------------------- |
| P2 Pedidos | 2028:725   | 2023:336 · detalle 2024:333 | `/panel/pedidos`, `/panel/pedidos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
