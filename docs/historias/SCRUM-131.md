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

Estado al 04-11-2026: **Sí**. El endpoint existe en el Swagger (SCRUM-59, `cancelar-pedido.controller.ts`):

- `POST /api/pedidos/{codigoPedido}/cancelar`, con el permiso `pedidos.gestionar`.
  - Cuerpo `CancelarPedidoDto`: `{ comentario?: string }`, de hasta 500 caracteres.
  - **200** `{ codigoPublico, estado: 'cancelado' }` (`PedidoCancelado`). El Swagger no declara la
    respuesta; el tipo está en `respuestas.ts`.
  - **400** «El comentario no puede superar los 500 caracteres.»
  - **404** «El pedido no existe.»
  - **409** «Solo se puede cancelar un pedido pendiente de pago.»
  - **403** para quien no es del personal.
- **Simulado:** el detalle del panel (`GET /gestion/pedidos/:codigo`, SCRUM-130) sigue simulado.
  Se le agrega `sePuedeCancelar: boolean` para que el backend decida cuándo se ofrece la acción.
  La forma aún no está acordada con SCRUM-58.

## Notas de trabajo

**04-11-2026 · implementación (rama `SCRUM-131-cancelar-pedido`)**

- **Decisiones del usuario (04-11):**
  - El detalle trae `sePuedeCancelar` desde el backend, para que el frontend no repita la regla
    «solo pendiente de pago» (RNF-04).
  - Se siguió sin Figma porque el MCP no respondía: botón contorno en color destructivo «Cancelar
    pedido» en el detalle y un `AlertDialog` con el título «¿Cancelar el pedido X?», el texto «Su
    stock vuelve al inventario. Esta acción no se puede deshacer.», el campo «Motivo (opcional)» y
    los botones «Volver» / «Cancelar pedido».
- **Errores:**
  - Un 400 se muestra junto al motivo.
  - Un 404 o 409 se muestra como aviso fuera del diálogo y lo cierra: la lista y el detalle se
    vuelven a pedir y el detalle ya no ofrece cancelar.
  - El resto se muestra dentro del diálogo, sin perder el motivo.
  - Sin motivo se envía `{}`.
- **API simulada:** `POST /pedidos/:codigoPedido/cancelar` se simula solo para los códigos
  simulados (el backend no los conoce). `PENDPAGO0001` responde 200 y los demás 409. El detalle
  simulado no cambia.
- **Criterio 3:** el detalle del cliente (`tienda/pedidos`) no tiene la acción. Además, el backend
  responde 403 a un cliente.
- **Para el backend:**
  - SCRUM-58: agregar `sePuedeCancelar` al detalle del panel.
  - SCRUM-59: declarar en el Swagger la respuesta 200 (`PedidoCancelado`).
- **Revisiones (04-11):**
  - Seguridad: sin hallazgos.
  - Diseño (sin Figma):
    - Tras cancelar, el botón desaparece, así que el foco pasa al título del pedido.
    - Los botones del diálogo usan `grande`, por el mínimo táctil en celular.
    - El aviso va en `Alert` y el motivo tiene una altura máxima.
    - Queda una sugerencia para `compartido/ui/alert-dialog.tsx`: los demás diálogos también
      tienen botones `mediano` (38 px).
  - Criterios: se agregaron pruebas del 400 del servidor y del cierre del diálogo con un 409.
- **Pendiente:**
  - Comparar el botón y el diálogo con Figma (P2 Pedidos).
  - Probar con sesión del personal a 1440 y 360 px.
  - Quitar la ruta simulada cuando llegue el detalle real.
