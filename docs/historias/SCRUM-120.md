# SCRUM-120 · E6-H1 · Botón de pago y regreso desde Mercado Pago

**Orden:** 32 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-47 · **API:** No

**Necesita antes (frontend):** [SCRUM-118](SCRUM-118.md)  
**La necesitan después:** [SCRUM-121](SCRUM-121.md)

Como un Cliente, necesito pagar mi pedido desde la tienda, con la finalidad de completar mi compra.

**Historia backend:** SCRUM-47 · **Figma:** 05 Checkout, 09 Resultado del pago

## Criterios de aceptación

1. **Ir a pagar.** El pedido está creado. Cuando el cliente pulsa «Pagar con Mercado Pago». La interfaz lo lleva al pago.
2. **Pago rechazado.** Mercado Pago rechaza el pago. Cuando el cliente vuelve. La pantalla muestra el aviso, la hora límite de la reserva y permite reintentar.
3. **Pedido ya pagado.** El pedido ya está pagado. Cuando el cliente abre el pago. La interfaz lo lleva al detalle del pedido.

## Pantalla y ruta

| Pantalla              | Escritorio         | Celular                                 | Ruta                                        |
| --------------------- | ------------------ | --------------------------------------- | ------------------------------------------- |
| 09 Resultado del pago | aprobado 2034:2106 | rechazado 2034:4663 · vencido 2034:4725 | `/pago/resultado` (retorno de Mercado Pago) |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
