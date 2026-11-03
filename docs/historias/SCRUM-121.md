# SCRUM-121 · E6-H2 · Pantalla de resultado del pago

**Orden:** 33 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-48 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-120](SCRUM-120.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el resultado de mi pago, con la finalidad de saber que mi compra quedó registrada.

**Historia backend:** SCRUM-48 · **Figma:** 09 Resultado del pago

## Criterios de aceptación

1. **Pago aprobado.** El pago fue aprobado. Cuando el cliente vuelve a la tienda. Ve el resumen del pedido y que recibirá el comprobante por correo.
2. **Pago pendiente.** La confirmación aún no llega. Cuando el cliente abre la pantalla. Ve el estado pendiente y la pantalla se actualiza al llegar la confirmación.
3. **Pedido vencido.** Pasaron los 15 minutos sin pago. Cuando el cliente abre el pedido. La pantalla informa la cancelación.

## Pantalla y ruta

| Pantalla              | Escritorio         | Celular                                 | Ruta                                               |
| --------------------- | ------------------ | --------------------------------------- | -------------------------------------------------- |
| 09 Resultado del pago | aprobado 2034:2106 | rechazado 2034:4663 · vencido 2034:4725 | `/pedidos/[codigo]/pago` (retorno de Mercado Pago) |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 03-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**, sin rutas simuladas. Son
los mismos endpoints de SCRUM-120:

- `POST /api/pedidos/{codigoPedido}/pago/confirmar` → `{ estadoPago, pedido }` (`PagoConfirmado`).
- `GET /api/pedidos/{codigoPedido}` → `DetallePedidoCuenta`. Sin límite de peticiones: es la que
  se repite mientras el pago está pendiente.
- `GET /api/cuentas/yo` → `DatosPersonales` (el correo de la cuenta).

El pago pendiente lo resuelve el backend: la notificación de Mercado Pago (E6-H2,
`notificacion-pago.service.ts`) deja el pedido `pagado`, o la tarea de vencimiento (E6-H3,
`vencimiento-pago.service.ts`) lo deja `cancelado`. La pantalla solo mira `pedido.estado`.

## Notas de trabajo

- **Qué muestra** (`resolverResultado` en `tienda/pago/consultasPago.ts`):
  - `cancelado` → «Tu pedido se canceló».
  - Ya no espera el pago y este regreso trajo un pago aprobado o pendiente → «Recibimos tu pago».
  - Ya pagado, sin pago en este regreso (sin id, o 400/409) → detalle del pedido (SCRUM-120 c3).
  - Sigue `pendiente_pago` con un pago pendiente → «Estamos confirmando tu pago».
  - Si no → «El pago no se completó» (SCRUM-120).
- **Pendiente:** lee el pedido cada 5 s (`useSeguimientoPedido`) mientras siga `pendiente_pago`
  y cambia sola a aprobado o cancelado. No ofrece «Intentar de nuevo»: el pago en proceso podría
  aprobarse y sería un segundo cargo. Un 409 tras reintentar ahora muestra el cancelado en vez de
  ir al detalle.
- **Decisiones con el usuario (03-11-2026):**
  - Pendiente (sin diseño en Figma): ícono de reloj, «Estamos confirmando tu pago» y «Aún no se
    confirma el pago del pedido X. Esta pantalla se actualiza sola cuando llegue.», con «Ver mis
    pedidos» y «Seguir comprando». Sin nombrar a Mercado Pago (`docs/diseno.md`: solo en el
    botón de pagar y en el pago no aprobado).
  - Cancelado: «El pedido X se canceló. Si aún quieres los productos, puedes volver a
    comprarlos.», sin la causa ni los 15 minutos de Figma, porque el backend no dice por qué se
    canceló (pudo ser la tienda, E8-H3).
  - Aprobado: «Te enviamos la confirmación a {correo}» en lugar de «el comprobante»: el correo
    del backend (`plantillas/pedido.ts`) no lo adjunta, dice que se descarga desde el detalle.
    Sin el correo de la cuenta (cargando o con error) dice «…a tu correo»: el texto no salta.
  - Pago que no corresponde al pedido o no es por su total (400 al confirmar, viene de
    SCRUM-120): ya no ofrece «Intentar de nuevo», porque pudo haber un cargo y pagar otra vez
    cobraría dos veces. En su lugar, «Ver mis pedidos».
  - La foto de las líneas queda en 56 px (el mismo `LineaResumen` del checkout); Figma usa 52 px
    en el resultado.
- **Qué sigue:** el aviso usa el texto del correo del backend: «…cuando tu pedido salga a
  despacho» o «…cuando tu pedido esté listo para retiro».
- **Reutilización:** `LineaResumen` salió de `resumenCheckout.tsx` a
  `tienda/checkout/lineaResumen.tsx`.
  `EncabezadoResultado` y `AccionesResultado` los usan las cuatro pantallas de resultado.
- **Seguimiento con error:** una lectura que falla se reintenta dos veces; si sigue fallando,
  deja de pedir el pedido, quita «se actualiza sola» y muestra el mensaje del backend con
  «Reintentar» (lo marcó la auditoría de seguridad).
- **Pago aprobado sobre un pedido ya cancelado:** el backend no lo aplica (409, queda en
  `revision_manual`, E6-H3) y la pantalla muestra el cancelado, sin decir que no hubo cargo.
  Preguntar a SCRUM-48/E6-H3 si al comprador hay que avisarle algo más.
- **Enlaces:** «Ver mi pedido» y «Ver mis pedidos» dan 404 hasta SCRUM-129.
- **Para el backend:** exponer el motivo de la cancelación en `DetallePedidoCuenta` (impago o
  la tienda) para usar el texto de Figma. Lo de SCRUM-120 sigue pendiente: declarar en el
  Swagger las respuestas de los `POST` de pago.
- **Sin probar en el navegador con el backend real:** hace falta un pedido en cada estado
  (aprobado, pendiente y vencido) con Mercado Pago de prueba.
