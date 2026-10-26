# SCRUM-118 · E5-H3 · Pantalla de checkout

**Orden:** 28 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-45 · **API:** No

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

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
