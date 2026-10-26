# SCRUM-123 · E7-H2 · Cotización del despacho y dirección

**Orden:** 30 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-51 · **API:** No

**Necesita antes (frontend):** [SCRUM-122](SCRUM-122.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el costo del despacho antes de pagar, con la finalidad de decidir con el total real.

**Historia backend:** SCRUM-51 · **Figma:** 05 Checkout (despacho)

## Criterios de aceptación

1. **Cotización.** El cliente elige región y comuna de la lista oficial. Cuando se cotiza. El resumen muestra el costo de Chilexpress y el total actualizado.
2. **Sin respuesta.** La cotización no está disponible. Cuando el servidor lo informa. La pantalla lo indica y ofrece el retiro en tienda.
3. **Dirección nueva.** El cliente agrega una dirección. Cuando elige región y comuna. Los selectores solo muestran la lista oficial.

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
