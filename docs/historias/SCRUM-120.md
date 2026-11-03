# SCRUM-120 · E6-H1 · Botón de pago y regreso desde Mercado Pago

**Orden:** 32 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-47 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-118](SCRUM-118.md)  
**La necesitan después:** [SCRUM-121](SCRUM-121.md)

Como un Cliente, necesito pagar mi pedido desde la tienda, con la finalidad de completar mi compra.

**Historia backend:** SCRUM-47 · **Figma:** 05 Checkout, 09 Resultado del pago

## Criterios de aceptación

1. **Ir a pagar.** El pedido está creado. Cuando el cliente pulsa «Pagar con Mercado Pago». La interfaz lo lleva al pago.
2. **Pago rechazado.** Mercado Pago rechaza el pago. Cuando el cliente vuelve. La pantalla muestra el aviso, la hora límite de la reserva y permite reintentar.
3. **Pedido ya pagado.** El pedido ya está pagado. Cuando el cliente abre el pago. La interfaz lo lleva al detalle del pedido.

## Pantalla y ruta

| Pantalla              | Escritorio         | Celular                                 | Ruta                                               |
| --------------------- | ------------------ | --------------------------------------- | -------------------------------------------------- |
| 09 Resultado del pago | aprobado 2034:2106 | rechazado 2034:4663 · vencido 2034:4725 | `/pedidos/[codigo]/pago` (retorno de Mercado Pago) |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 03-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**, sin rutas simuladas.

- `POST /api/pedidos/{codigoPedido}/pago` → `{ urlPago, pagarHasta }` (`CobroIniciado`). 409 si
  el pedido ya está pagado, cancelado o venció; 503 si Mercado Pago no responde.
- `POST /api/pedidos/{codigoPedido}/pago/confirmar` con `{ pagoId }` → `{ estadoPago, pedido }`
  (`PagoConfirmado`, `estadoPago`: `aprobado` | `rechazado` | `pendiente`). 400 si el pago no
  es de este pedido; 409 si el pedido ya tenía un pago aprobado o fue cancelado.
- `GET /api/pedidos/{codigoPedido}` → `DetallePedidoCuenta`.

El Swagger no declara las respuestas de los dos `POST`: los tipos están en
`compartido/api/respuestas.ts`, citando `src/modulos/pagos/pagar-pedido.service.ts`.

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/47
- **Ruta de regreso:** el backend arma `back_urls` con `URL_TIENDA` + `/pedidos/{codigo}/pago`,
  así que la pantalla está en `app/(tienda)/pedidos/[codigo]/pago`, no en `/pago/resultado`.
  Se corrigió `docs/pantallas.md` y SCRUM-121.
- **El resultado lo da el backend:** se lee `payment_id` (o `collection_id`) solo si es
  numérico y se confirma con el backend, que consulta a Mercado Pago; el `status` de la URL no se
  usa. Sin id (volvió sin pagar, Mercado Pago manda `null`) o con 400/409 al confirmar, se lee el
  pedido. La confirmación va en una consulta sin reintentos (es idempotente en el backend y
  tiene un límite de 10 por minuto).
- **Criterio 1:** ya lo cumplía el checkout (SCRUM-118). La petición del cobro y la validación
  de la URL (https y dominio de Mercado Pago) pasaron a `tienda/pago/cobro.ts`, que usan el
  checkout y «Intentar de nuevo».
- **Decisiones con el usuario (03-11-2026):**
  - Pago aprobado o pendiente al volver: lleva al detalle del pedido, igual que el pedido ya
    pagado. SCRUM-121 cambiará esto por «Recibimos tu pago» y el estado pendiente. El pedido
    cancelado o vencido también lleva al detalle por ahora (SCRUM-121, criterio 3).
  - El segundo botón es «Seguir comprando» (al catálogo) en lugar de «Volver al carrito» de
    Figma: al crear el pedido el backend vacía el carrito, que se vería vacío.
  - El texto de Figma («Mercado Pago no aprobó el pago… No se hizo ningún cargo.») solo cuando
    el backend confirma `rechazado`. Si volvió sin pagar: «El pago del pedido X no se
    completó.». Con 400 al confirmar (el pago no es de este pedido o no es por su total; pudo
    haber cargo) se suma el mensaje del backend en un aviso.
- **Doble pago (409 al confirmar):** si el pedido ya tenía un pago aprobado, la pantalla lleva al
  detalle sin avisar del segundo cargo. Según el backend queda en `revision_manual` (E6-H3) para
  el personal; confirmar con SCRUM-47 si hace falta avisar al comprador.
- **Detalle del pedido:** `/cuenta/pedidos/[codigo]` es de SCRUM-129 y aún da 404
  (`urlPedido` en `tienda/diseno/enlaces.ts` con `TODO(SCRUM-129)`).
- **Sin sesión:** `CuentaProtegida` aceptó la prop `volver`, así que tras ingresar se vuelve con el
  mismo `payment_id`.
- **En desarrollo** el regreso automático de Mercado Pago exige https: el comprador pulsa
  «Volver al sitio» (lo indica el backend en `pasarela-mercado-pago.ts`).
- **Para el backend (SCRUM-47):** declarar en el Swagger las respuestas de `POST …/pago` y
  `POST …/pago/confirmar`.
