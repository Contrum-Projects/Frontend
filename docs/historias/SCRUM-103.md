# SCRUM-103 · E3-H4 · Pantalla de marcas y categorías

**Orden:** 9 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-29 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito administrar marcas, categorías y subcategorías, con la finalidad de ordenar el catálogo.

**Historia backend:** SCRUM-29 · **Figma:** P3b Marcas y categorías

## Criterios de aceptación

1. **Marcas.** El personal abre la pantalla. Cuando crea o edita una marca. La lista la muestra y el formulario de producto la ofrece en su selector.
2. **Árbol de categorías.** El personal crea una subcategoría. Cuando guarda. El árbol la muestra bajo su categoría.
3. **Errores.** El servidor rechaza una marca repetida o un ciclo de categorías. Cuando el personal guarda. La pantalla muestra el motivo.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |
| P3b Marcas y categorías     | 2039:1311  | —        | `/panel/marcas-y-categorias`                      |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/marcas`, `/api/catalogo/categorias…`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
