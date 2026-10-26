# SCRUM-125 · E9-H1 · Interruptor «Necesito factura» en el checkout

**Orden:** 31 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-53 · **API:** No

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

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
