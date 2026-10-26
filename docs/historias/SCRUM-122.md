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

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
