# SCRUM-127 · E9-H3 · Facturas por emitir y registro de la factura

**Orden:** 39 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-55 · **API:** No

**Necesita antes (frontend):** [SCRUM-130](SCRUM-130.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito registrar la factura emitida desde el panel, con la finalidad de dejarla disponible para el cliente.

**Historia backend:** SCRUM-55 · **Figma:** P2c Facturas

## Criterios de aceptación

1. **Facturas por emitir.** El personal abre la pestaña «Facturas por emitir» en Pedidos. Cuando carga. Ve los pedidos que pidieron factura, por emitir o con folio.
2. **Registrar.** El personal abre un pedido. Cuando ingresa folio y fecha y sube el PDF. La tarjeta muestra los datos del receptor y los montos tomados del pedido, y guarda la factura.
3. **Folio repetido.** El servidor rechaza el folio. Cuando el personal guarda. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla                | Escritorio | Celular             | Ruta                      |
| ----------------------- | ---------- | ------------------- | ------------------------- |
| P2c Facturas por emitir | 2050:2078  | registrar 2051:1443 | `/panel/pedidos/facturas` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
