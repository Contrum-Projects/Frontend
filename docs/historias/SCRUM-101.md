# SCRUM-101 · E3-H2 · Tabla de formatos en el producto

**Orden:** 11 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-27 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-100](SCRUM-100.md)  
**La necesitan después:** [SCRUM-102](SCRUM-102.md), [SCRUM-104](SCRUM-104.md), [SCRUM-111](SCRUM-111.md)

Como Personal de tienda, necesito gestionar los formatos dentro del formulario del producto, con la finalidad de cargar cada tamaño o tono con sus datos.

**Historia backend:** SCRUM-27 · **Figma:** P3 Producto nuevo (tabla de formatos)

## Criterios de aceptación

1. **Tabla de formatos.** El personal edita un producto. Cuando agrega o edita un formato. Puede ingresar SKU, código de barras, nombre, contenido y unidad, peso y medidas, stock mínimo y vencimiento opcional.
2. **SKU o código repetido.** El servidor rechaza el dato. Cuando el personal guarda. La fila muestra el campo repetido.
3. **Formato predeterminado.** El producto tiene varios formatos. Cuando el personal marca uno. La tabla muestra una sola marca de predeterminado.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/productos/{id}/formatos`, `/api/catalogo/formatos/{id}`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
