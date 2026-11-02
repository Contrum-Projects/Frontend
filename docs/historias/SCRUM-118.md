# SCRUM-118 · E5-H3 · Pantalla de checkout

**Orden:** 28 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-45 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md), [SCRUM-116](SCRUM-116.md)  
**La necesitan después:** [SCRUM-122](SCRUM-122.md), [SCRUM-125](SCRUM-125.md), [SCRUM-120](SCRUM-120.md)

Como un Cliente, necesito el checkout de la tienda, con la finalidad de confirmar mi pedido conociendo el monto final.

**Historia backend:** SCRUM-45 · **Figma:** 05 Checkout

## Criterios de aceptación

1. **Resumen.** El cliente llega al checkout. Cuando se carga. Ve entrega, documento («Necesito factura»), totales con IVA y la reserva de 15 minutos.
2. **Confirmar.** Todo está correcto. Cuando pulsa el botón de pago. El botón se deshabilita mientras se envía, para evitar un doble clic, y luego lleva al pago.
3. **Errores.** Falta stock o el correo no está confirmado. Cuando el servidor rechaza el pedido. La pantalla indica el artículo o pide confirmar el correo.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta        |
| ----------- | ---------- | --------- | ----------- |
| 05 Checkout | 2010:1024  | 2010:2211 | `/checkout` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 02-11-2026: **Sí**, sin rutas simuladas.

- `GET /api/carrito`: líneas y total con IVA del resumen.
- `POST /api/pedidos` (`CrearPedidoDto`): `{ claveIdempotencia, tipoEntrega: 'retiro', tipoDocumento: 'boleta' }`.
  Responde el detalle del pedido (`DetallePedidoCuenta`). Errores con mensaje en español: 403 correo
  sin confirmar, 409 sin stock («No hay stock suficiente de …»), artículo que ya no se vende,
  pedido pendiente o carrito vacío, y 429.
- `POST /api/pedidos/{codigoPedido}/pago`: `{ urlPago, pagarHasta }` (`CobroIniciado`).

El Swagger no declara las respuestas de los dos `POST`: los tipos están en
`compartido/api/respuestas.ts`, citando `mis-pedidos.service.ts` y `pagar-pedido.service.ts` del
backend.

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/43 (En revisión desde el 02-11-2026).

**Alcance (acordado el 02-11-2026):**

- Esta historia hace la base del checkout: retiro en tienda ya elegido y comprobante electrónico.
- El despacho con su dirección y costo es de SCRUM-122/123; el interruptor «Necesito factura», de SCRUM-125.
- «Pagar con Mercado Pago» crea el pedido, pide la URL de pago y lleva a Mercado Pago. El regreso,
  el pago rechazado y el pedido ya pagado son de SCRUM-120.

**Decisiones:**

- La clave de idempotencia es un UUID que se crea una vez por visita y se repite en cada intento.
  Si el pedido se crea pero falla pedir el pago, la pantalla guarda el código del pedido y sigue
  mostrando el resumen que se confirmó, aunque el carrito ya venga vacío. Reintentar solo vuelve a
  pedir el pago de ese pedido. Si se recarga la página, el carrito aparece vacío: el pedido
  pendiente se paga desde Mis pedidos (SCRUM-129) o SCRUM-120.
- El botón queda deshabilitado mientras se envía y después del éxito, mientras el navegador va a
  Mercado Pago.
- Solo se abre una `urlPago` con https y en `mercadopago.cl` o `mercadopago.com`, o en sus
  subdominios (por ejemplo `sandbox.`). Es defensa en profundidad: quien decide es el backend.
- Ante un 409 se vuelve a pedir el carrito y se ofrece «Volver al carrito». El mensaje del backend
  ya nombra el artículo.
- Tras crear el pedido no se refresca la caché del carrito: el backend lo vacía, y la pantalla
  pasaría al carrito vacío antes de salir hacia Mercado Pago.
- Texto del documento: «Recibes el comprobante electrónico de pago en tu correo.», adaptado del
  celular de Figma. SCRUM-125 lo cambia por el interruptor.

**Para el backend:**

- `GET /api/carrito` solo entrega el total con IVA. Figma muestra «IVA incluido: $4.626», pero
  aquí se muestra solo «IVA incluido»: el frontend no calcula el IVA. Pedir a SCRUM-43 que el
  carrito entregue el monto del IVA (o neto e IVA).
- El plazo de reserva (15 minutos, `PLAZO_PAGO_MINUTOS`) está escrito en el texto. Si el backend
  lo cambia, el texto queda desactualizado. Se podría pedir que el carrito lo entregue.
- Documentar en el Swagger las respuestas de `POST /api/pedidos` y `POST /api/pedidos/{codigo}/pago`.

**Preguntas abiertas:**

- Con el 409 «Ya tienes un pedido pendiente de pago…» se muestra «Volver al carrito», que no
  ayuda a pagarlo. ¿Adónde debe llevar? Mis pedidos (SCRUM-129) o el pago (SCRUM-120).
- El criterio 3 pide «confirmar el correo». Hoy se muestra el mensaje del backend, sin enlace: no
  hay un endpoint para reenviar la confirmación.

**Pendiente:** probar con el backend real en `main`, a 1440 y a 360 px. El `cp-backend` local estaba en una rama
del 30-10.
