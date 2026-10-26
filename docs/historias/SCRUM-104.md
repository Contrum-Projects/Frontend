# SCRUM-104 · E3-H5 · Precios minorista y mayorista en el panel

**Orden:** 13 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-30 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md)  
**La necesitan después:** [SCRUM-105](SCRUM-105.md)

Como Personal de tienda, necesito configurar los precios de cada artículo desde el panel, con la finalidad de vender a cada tipo de cliente al precio correcto.

**Historia backend:** SCRUM-30 · **Figma:** P3 Producto nuevo (precios netos), P3c Pack nuevo

## Criterios de aceptación

1. **Precios netos.** El personal ingresa precios netos. Cuando escribe el valor. La pantalla muestra al lado el valor con IVA.
2. **Exclusivo para profesionales.** El producto o pack es exclusivo. Cuando el personal lo marca. La pantalla pide solo el precio mayorista.
3. **Cambio de precio.** El artículo tiene precio vigente. Cuando el personal ingresa uno nuevo con su motivo. La pantalla muestra el historial de cambios.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/articulos/{id}/precios`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
