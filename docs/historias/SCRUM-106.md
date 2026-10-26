# SCRUM-106 · E2-H1 · Inicio y catálogo por categorías y marcas

**Orden:** 1 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-32 · **API:** Sí

**Necesita antes (frontend):** nada  
**La necesitan después:** [SCRUM-94](SCRUM-94.md), [SCRUM-107](SCRUM-107.md), [SCRUM-108](SCRUM-108.md), [SCRUM-138](SCRUM-138.md)

Como un Visitante o Cliente, necesito el inicio y el catálogo de la tienda, con la finalidad de encontrar productos por categoría o marca.

**Historia backend:** SCRUM-32 · **Figma:** 01 Inicio, 02 Catálogo, 12 Menú

## Criterios de aceptación

1. **Inicio.** El usuario abre la tienda. Cuando carga. Ve promociones, filas de «Más vendidos» y «Novedades» y marcas, con header de tienda (buscador, cuenta, carrito y categorías).
2. **Catálogo por categoría o marca.** El usuario elige una categoría o marca. Cuando se carga el listado. Ve las tarjetas de producto (foto principal del formato predeterminado, nombre, marca y precio).
3. **Sin productos.** La categoría no tiene productos. Cuando el usuario la abre. La pantalla lo indica y ofrece explorar otras categorías.
4. **Celular.** El usuario abre el menú. Cuando navega. Ve categorías con subcategorías, packs, marcas, ayuda y cuenta.

## Pantalla y ruta

| Pantalla                  | Escritorio | Celular                     | Ruta                          |
| ------------------------- | ---------- | --------------------------- | ----------------------------- |
| 01 Inicio                 | 2016:1184  | 2017:1191                   | `/`                           |
| 02 Catálogo (con filtros) | 2006:395   | 2005:374 · filtros 2005:662 | `/catalogo?categoria=&marca=` |
| 12 Menú                   | —          | 2060:2101                   | componente del header         |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/tienda/productos`, `/api/tienda/categorias`, `/api/tienda/marcas`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
