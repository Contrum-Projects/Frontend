# SCRUM-125 · E9-H1 · Interruptor «Necesito factura» en el checkout

**Orden:** 31 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-53 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-118](SCRUM-118.md), [SCRUM-126](SCRUM-126.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito pedir factura al comprar, con la finalidad de recibir el documento que necesito.

**Historia backend:** SCRUM-53 · **Figma:** 05 Checkout

## Criterios de aceptación

1. **Comprobante por defecto.** El cliente no activa nada. Cuando llega al checkout. Se informa que recibirá el comprobante electrónico de pago.
2. **Con datos guardados.** El cliente activa «Necesito factura» y tiene datos de facturación. Cuando los ve. Puede elegir cuál usar.
3. **Sin datos.** El cliente activa el interruptor y no tiene datos. Cuando continúa. La pantalla le pide registrarlos antes de seguir.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta        |
| ----------- | ---------- | --------- | ----------- |
| 05 Checkout | 2010:1024  | 2010:2211 | `/checkout` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 03-11-2026: **Sí**, con el backend real (sin rutas simuladas).

- `POST /api/pedidos` (E5-H3) recibe `tipoDocumento: 'boleta' | 'factura'` y, con factura,
  `datosFacturacionId`. Sin datos activos en la cuenta responde 409 «Debes registrar tus datos de
  facturación antes de pedir factura.»; con datos y sin id, 400; con un id ajeno o desactivado, 404
  (reglas de negocio, decisiones del 1 nov de E9-H1).
- `GET`, `POST` y `PATCH /api/cuentas/yo/facturacion` (E9-H2) para listar, agregar y editar los
  datos desde el checkout. El Swagger aún no declara sus respuestas: el tipo sigue en
  `respuestas.ts` (`DatosFacturacionCuenta`).

## Notas de trabajo

**03-11-2026**

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/46 (depende de #45, SCRUM-123).

- **Rama:** sale de `SCRUM-123-cotizacion-direccion`, porque el checkout depende de esa historia
  y su PR #45 aún no se integra. El PR de esta historia muestra también esos commits hasta que
  se integre.
- **Decisiones con el usuario:**
  - Sin datos de facturación se muestra el mismo mensaje con que el backend rechaza la factura
    («Debes registrar tus datos de facturación antes de pedir factura.»), junto a «Agregar datos
    de facturación», y el pago queda bloqueado hasta guardar unos. Los datos guardados quedan
    elegidos.
  - Al encender el interruptor quedan elegidos los primeros datos de la lista (el orden del
    backend), como muestra Figma.
- **Texto de la tarjeta:** cambia con el interruptor. Apagado: «Si no, recibes el comprobante
  electrónico de pago en tu correo.» (celular 2021:3018). Encendido: «Con los datos de
  facturación de tu cuenta.» (escritorio 2021:1773). Se usa el mismo texto en escritorio y en
  celular.
- **Agregar y Editar** abren un diálogo (`tienda/cuenta/dialogoFacturacion.tsx`) con los campos
  y las reglas de 10b Datos de facturación, sin salir del checkout. Figma no dibuja el diálogo.
- **Los datos se piden solo al encender el interruptor**, para no hacer la lectura si se compra
  con comprobante.
- **Otra pestaña:**
  - Si los datos elegidos se eliminan, no se eligen otros en silencio (la factura saldría con
    otro RUT): queda ninguno marcado y el pago bloqueado hasta elegir.
  - Tras un 409 o un 404 de `POST /api/pedidos`, la lista se vuelve a pedir.
- **Pendiente (menor):** un 409 por falta de datos de facturación también muestra «Volver al
  carrito», porque el aviso no distingue el motivo del 409. Para distinguirlo habría que comparar
  el mensaje del backend o pedirle un código de error.
- **Para el backend:** documentar en el Swagger las respuestas de `/api/cuentas/yo/facturacion`
  (el tipo sigue en `respuestas.ts`).
