# SCRUM-130 · E8-H2 · Panel de pedidos: cambio de estado

**Orden:** 37 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-58 · **API:** No

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-131](SCRUM-131.md), [SCRUM-127](SCRUM-127.md)

Como Personal de tienda, necesito gestionar pedidos desde el panel, con la finalidad de hacerlos avanzar y mantener informado al cliente.

**Historia backend:** SCRUM-58 · **Figma:** P2 Pedidos

## Criterios de aceptación

1. **Lista y detalle.** El personal abre «Pedidos». Cuando carga. Ve la tabla con filtro por estado y el detalle al lado (escritorio) o en una pantalla aparte (celular).
2. **Cambiar estado.** El pedido está pagado. Cuando el personal elige un estado nuevo y un comentario opcional. El historial muestra el cambio con fecha y quién lo hizo.
3. **Pedido para retiro.** El pedido es de retiro. Cuando el personal lo marca «listo para retiro». La pantalla ofrece después «retirado».

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
