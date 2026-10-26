# SCRUM-121 · E6-H2 · Pantalla de resultado del pago

**Orden:** 33 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-48 · **API:** No

**Necesita antes (frontend):** [SCRUM-120](SCRUM-120.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el resultado de mi pago, con la finalidad de saber que mi compra quedó registrada.

**Historia backend:** SCRUM-48 · **Figma:** 09 Resultado del pago

## Criterios de aceptación

1. **Pago aprobado.** El pago fue aprobado. Cuando el cliente vuelve a la tienda. Ve el resumen del pedido y que recibirá el comprobante por correo.
2. **Pago pendiente.** La confirmación aún no llega. Cuando el cliente abre la pantalla. Ve el estado pendiente y la pantalla se actualiza al llegar la confirmación.
3. **Pedido vencido.** Pasaron los 15 minutos sin pago. Cuando el cliente abre el pedido. La pantalla informa la cancelación.

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
