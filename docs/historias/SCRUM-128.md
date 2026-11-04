# SCRUM-128 · E9-H4 · Descargar el comprobante o la factura

**Orden:** 36 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-56 · **API:** Sí

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

Estado al 04-11-2026 (`compartido/api/esquema.d.ts`): **Sí**. Sin API simulada.

- `GET /api/pedidos/{codigoPedido}` (E8-H1) trae `documento`: con factura,
  `{ tipo: 'factura', estado: 'pendiente' | 'disponible', folio, fechaEmision }`; con boleta o
  cancelado, `null`. Con boleta y pago aprobado, `idTransaccionPago` es la referencia del
  comprobante de Mercado Pago.
- `GET /api/pedidos/{codigoPedido}/documento` entrega el PDF (`Content-Disposition: attachment;
filename="factura-<folio>.pdf"`). Factura pendiente, pedido de otra cuenta o inexistente: 404
  «El documento del pedido aún no está disponible.»; almacén caído: 503.

## Notas de trabajo

- **Tarjeta «Documento»** (`tienda/pedidos/documentoPedido.tsx`) entre Envío y Pago; en
  escritorio, las tres tarjetas en una fila desde `lg` (Figma 2019:1733). En celular es una fila con
  el tipo y «Descargar» (2019:3056); el título «Documento» queda para lectores de pantalla.
- **Factura disponible:** «Factura n.º {folio}» y «Descargar PDF». La descarga va por `api`
  (`parseAs: 'blob'`, con el token y por el proxy) y guarda el archivo con el nombre de
  `Content-Disposition` (si falta, `factura-<código>.pdf`). Si falla, el mensaje del backend bajo el
  botón.
- **Factura pendiente** (sin diseño en Figma; texto acordado con el equipo el 04-11-2026):
  «Factura» y «Pendiente: la descargas aquí cuando esté lista.», sin botón.
- **Boleta** (decisión del equipo el 04-11-2026, según la propuesta del backend en E9-H1): no hay
  archivo; la tarjeta muestra «Comprobante de pago» y «N.º de operación de Mercado Pago: {id}».
  Figma dice «Descargar PDF» también para el comprobante: queda pendiente ajustar Figma.
- Revisión de seguridad: el nombre del archivo solo se acepta si es simple y termina en `.pdf`, y
  solo se guarda una respuesta `application/pdf`; la URL temporal se libera un segundo después.
  Mientras descarga, el botón usa `aria-disabled` para no perder el foco.
- Sin documento ni pago aprobado (boleta sin pagar, o cancelado), no hay tarjeta.
- Para el backend: el Swagger declara el 200 de `/documento` sin `content` (`application/pdf`);
  conviene declararlo como binario.
- PR: https://github.com/Contrum-Projects/Frontend/pull/51
