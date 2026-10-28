# SCRUM-102 · E3-H3 · Fotos por formato en el panel

**Orden:** 12 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-28 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md)  
**La necesitan después:** [SCRUM-105](SCRUM-105.md)

Como Personal de tienda, necesito subir y ordenar las fotos de cada formato, con la finalidad de mostrar bien cada producto.

**Historia backend:** SCRUM-28 · **Figma:** P3 Producto nuevo (fotos del formato elegido)

## Criterios de aceptación

1. **Subir foto.** El personal elige un formato. Cuando sube una imagen. Aparece en la galería de ese formato.
2. **Orden y principal.** El formato tiene varias fotos. Cuando el personal cambia el orden o marca otra principal. La galería muestra una sola principal.
3. **Última foto.** El formato tiene una sola foto. Cuando el personal intenta quitarla. La interfaz no lo permite y explica que se necesita al menos una.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/articulos/{id}/imagenes…`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**28-10-2026** (desde SCRUM-101)

- **Las fotos van dentro de cada formato** (decisión del usuario), no en una columna del producto
  como el panel «Fotos del formato» de Figma (2031:975). La página del producto ya usa todo el
  ancho en una columna.
