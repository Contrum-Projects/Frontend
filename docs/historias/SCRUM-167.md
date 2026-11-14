# SCRUM-167 · Teléfono de contacto para despachar con Chilexpress

**Orden:** 57 de 57 · **Puntos:** sin estimar · **Historia backend:** SCRUM-167 (la misma) · **API:** Sí

**Necesita antes (frontend):** [SCRUM-122](SCRUM-122.md), [SCRUM-130](SCRUM-130.md)  
**La necesitan después:** ninguna

Corrige una brecha de SCRUM-153 (OT automática). El teléfono de la cuenta es opcional, pero
Chilexpress lo exige para crear la OT. Hasta ahora un pedido con despacho se creaba sin teléfono y,
al despacharlo, el panel solo ofrecía crear la OT a mano en el portal de Chilexpress.

## Criterios de aceptación (frontend)

4. **Pantalla de pago.** Con despacho, el checkout muestra el campo «Teléfono de contacto»,
   precargado con el de la cuenta, y muestra el error del backend junto al campo sin perder lo
   escrito.
5. **Sin teléfono sigue el respaldo.** Sin teléfono en ningún lado, el panel muestra el 409 del
   backend con el respaldo de siempre.
6. **Panel.** En un pedido con despacho sin teléfono (`envio.telefonoContacto` y el de la cuenta
   vacíos), al despachar con la OT automática se pide «Teléfono de quien recibe».

Los criterios 1, 2, 3 y 5 son del backend (ver Jira).

## API

Estado al 14-11-2026 (`pnpm api:tipos` contra la rama `SCRUM-167-telefono-despacho` del backend):
**Sí**. No hay rutas nuevas: `CrearPedidoDto` y `CambiarEstadoPedidoDto` agregan `telefonoContacto`
(opcional, hasta 20). Sin teléfono, `POST /api/pedidos` con despacho responde 400 con
`errores[].campo = 'telefonoContacto'`.

## Notas de trabajo

- 14-11-2026: rama `SCRUM-167-telefono-despacho`. PR del backend:
  https://github.com/Contrum-Projects/Backend/pull/87 (se integra primero).
