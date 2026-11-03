# SCRUM-122 · E7-H1 · Elegir despacho o retiro en el checkout

**Orden:** 29 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-50 · **API:** No

**Necesita antes (frontend):** [SCRUM-118](SCRUM-118.md)  
**La necesitan después:** [SCRUM-123](SCRUM-123.md)

Como un Cliente, necesito elegir cómo recibo mi pedido, con la finalidad de recibirlo de la forma que me acomode.

**Historia backend:** SCRUM-50 · **Figma:** 05 Checkout

## Criterios de aceptación

1. **Retiro en tienda.** El cliente elige retiro. Cuando cambia la opción. El resumen no suma envío.
2. **Despacho a domicilio.** El cliente elige despacho. Cuando cambia la opción. La pantalla pide o permite elegir una dirección y muestra el costo de envío.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta        |
| ----------- | ---------- | --------- | ----------- |
| 05 Checkout | 2010:1024  | 2010:2211 | `/checkout` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 02-11-2026: **Sí**, sin rutas simuladas (backend SCRUM-50, PR #42, y SCRUM-51, PR #44).

- `GET /api/cuentas/yo/direcciones`: las direcciones de la cuenta (E1-H5).
- `GET /api/despacho/cotizacion?direccionId=`: `{ costo, totalCarrito, total }` con IVA. Errores
  con mensaje en español: 404 dirección ajena, 409 carrito vacío, artículo que ya no se vende o sin
  cobertura de Chilexpress, 503 si Chilexpress no responde, y 429 (10 por minuto por cuenta).
- `POST /api/pedidos`: `{ claveIdempotencia, tipoEntrega: 'despacho', direccionId, tipoDocumento }`, o
  `tipoEntrega: 'retiro'` sin `direccionId` (con ella responde 400).

El Swagger no declara la respuesta de la cotización: el tipo `CotizacionDespacho` está en
`compartido/api/respuestas.ts`, citando `cotizar-envio.service.ts` del backend.

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/44 (En revisión desde el 02-11-2026).

**Alcance (acordado el 02-11-2026):** la cotización entra aquí, porque el criterio 2 pide mostrar el
costo. SCRUM-123 queda con el aviso «sin respuesta» que ofrece el retiro (409/503) y la dirección
nueva con la lista oficial.

**Decisiones:**

- El checkout parte con retiro en tienda elegido (Figma muestra despacho): así no se cotiza con
  Chilexpress, que tiene límite de 10 por minuto, hasta que el cliente elige despacho.
- Con despacho se usa la dirección principal; «Cambiar» (solo con más de una) muestra la lista para
  elegir otra. «Agregar otra dirección» abre el mismo diálogo de Mis datos. Sin direcciones: «Agrega
  la dirección donde quieres recibir tu pedido.» y el botón «Agregar dirección».
- La tarjeta muestra «calle número · Principal», la referencia, la comuna y la región:
  `DireccionCuenta` no tiene un nombre como «Casa» de Figma.
- El costo aparece en la opción y en la línea «Despacho» del resumen. El total es el `total` de la
  cotización: el frontend no suma el envío (RNF-03).
- Con despacho, «Pagar con Mercado Pago» queda deshabilitado hasta tener la cotización. Si falla, se
  muestra el mensaje del backend; ofrecer el retiro es de SCRUM-123.
- La cotización cuelga de la clave del carrito y no se reintenta sola, por el límite del backend.
- En la lista de direcciones, marcar (con clic o teclado) no cotiza: la dirección se usa y se
  cotiza al pulsar «Usar esta dirección» (texto propio, Figma no tiene esta lista), y el foco vuelve
  a «Cambiar». Así las flechas no gastan el límite de cotizaciones ni cierran la lista.
- Figma pone la dirección entre las dos opciones. Para no dejar botones ni otro grupo de radios dentro
  de un `radiogroup`, el contenedor de las opciones es un `group` (Radix permite cambiar el rol).
- Si la cotización falla, el resumen muestra «—» («Sin cotizar» para lectores) en Despacho y Total,
  no un esqueleto.
- El personal de tienda no pide direcciones (`useDirecciones({ activa })`), y con despacho sin
  dirección no se envía el pedido (nunca se cambia a retiro sin avisar).

**Preguntas abiertas:**

- ~~¿La dirección que se agrega desde el checkout debe quedar elegida?~~ Resuelta en SCRUM-123
  (02-11-2026): sí, queda elegida y se cotiza.
- `docs/diseno.md` dice «Blue Express» en el checkout; el courier es Chilexpress (decisión del
  backend del 26-10) y Figma 2010:1088 dice «Chilexpress». Conviene corregir `docs/diseno.md`.

**Para el backend:**

- Documentar en el Swagger la respuesta de `GET /api/despacho/cotizacion` (`CotizacionDespacho`).

**Pendiente:** probar con el backend real a 1440 y a 360 px. El `cp-backend` local se pasó a `main`
(con sus migraciones), pero el proceso en :3000 seguía con el build anterior; los tipos se
generaron con una copia temporal en :3009.
