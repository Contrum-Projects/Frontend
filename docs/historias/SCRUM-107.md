# SCRUM-107 · E2-H2 · Búsqueda y filtros del catálogo

**Orden:** 15 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-33 · **API:** Revisar

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** ninguna

Como un Visitante o Cliente, necesito buscar y filtrar en la tienda, con la finalidad de llegar rápido al producto.

**Historia backend:** SCRUM-33 · **Figma:** 02 Catálogo (filtros), 11 Búsqueda

## Criterios de aceptación

1. **Resultados.** El usuario escribe en el buscador. Cuando envía. Ve los resultados con filtros por categoría, subcategoría y marca.
2. **Sin resultados.** Nada coincide. Cuando se muestra la respuesta. La pantalla lo indica y propone categorías para seguir.
3. **Filtros en celular.** El usuario está en un celular. Cuando abre los filtros. Se muestra un panel de filtros y los resultados se actualizan al aplicarlos.

## Pantalla y ruta

| Pantalla                  | Escritorio | Celular                     | Ruta                          |
| ------------------------- | ---------- | --------------------------- | ----------------------------- |
| 02 Catálogo (con filtros) | 2006:395   | 2005:374 · filtros 2005:662 | `/catalogo?categoria=&marca=` |
| 11 Búsqueda               | 2058:2736  | sin resultados 2060:2396    | `/buscar?q=`                  |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Revisar**. Solo `/api/tienda/productos`; confirmar si acepta búsqueda por texto.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
