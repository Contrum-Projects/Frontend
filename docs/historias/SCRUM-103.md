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

Estado al 28-10-2026 (`pnpm api:tipos` contra el backend local): **Sí**, sin rutas simuladas.

- `GET` y `POST /api/catalogo/marcas`: listar (solo activas) y crear. 409 «Ya existe una marca con
  ese nombre.».
- `GET` y `POST /api/catalogo/categorias`, `PATCH /api/catalogo/categorias/{id}`: árbol, crear
  (con `padreId`, subcategoría) y editar o mover. 409 si el movimiento forma un ciclo.
- **Falta:** editar una marca (`PATCH /api/catalogo/marcas/{id}`) y el conteo de productos por
  marca y categoría que muestra Figma.
- Ninguna declara su respuesta en el Swagger: `MarcaPanel` en `compartido/api/respuestas.ts`;
  el árbol usa `CategoriaTienda` (`NodoCategoria`).

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

**28-10-2026** · PR: https://github.com/Contrum-Projects/Frontend/pull/15

- **Marcas solo se crean.** El backend no tiene ruta para editar una marca, así que la lista no
  lleva el lápiz de Figma. El criterio 1 queda cumplido en «crea»; «edita» espera el endpoint.
  Pedido al backend (SCRUM-29): `PATCH /api/catalogo/marcas/{id}` con `{ nombre }` y el mismo 409.
- **No se eliminan marcas ni categorías.** No hay ruta `DELETE` (ni la piden la historia, Figma ni
  las reglas de negocio). Pedido al backend: definir la regla y la ruta. En categorías, qué pasa
  si tiene productos o subcategorías (rechazar con 409, desactivar o subir las subcategorías un
  nivel); en marcas, desactivar (`activa`, ya existe en el modelo) en vez de borrar. La pantalla
  lo sumará cuando exista.
- **Sin conteo de productos.** Figma muestra «24 productos» por fila, pero ni las marcas ni el
  árbol lo entregan. Se omite; si el backend lo agrega, se suma a la fila.
- **Formularios en panel lateral** (Sheet), como «Nueva cuenta de personal»: Figma no los dibuja.
  Categoría: nombre, descripción (opcional) y categoría padre («Ninguna (categoría principal)» o
  una del árbol, con su ruta «Shampoo › Reparación»). Editar sirve también para mover.
- **Ciclos:** el selector solo quita la propia categoría. Elegir una de sus subcategorías lo
  rechaza el backend (409) y el motivo aparece junto a «Categoría padre»; no se repite la regla.
- **Errores junto al campo** por cómo empieza el mensaje del backend («El nombre…», «La
  descripción…», «La categoría padre…», «No se puede mover…», «Ya existe…»). El resto, arriba.
- **Celular:** no hay diseño; las tarjetas van una debajo de otra.
- **Claves de consulta** `CLAVES_CATALOGO` en `panel/catalogo/consultasCatalogo.ts`: SCRUM-100
  debe usar `useMarcas()` y `useCategorias()` para que lo creado aquí aparezca en sus selectores.
- **Acceso:** como en Figma (P3a 2039:980), `/panel/productos` tiene el botón «Marcas y
  categorías» en su encabezado, y en esta pantalla el menú marca «Productos». De Productos solo
  existe el encabezado; la tabla, los filtros y «Producto nuevo» son de SCRUM-100. En celular
  Figma no dibuja el botón, pero se muestra igual: si no, no hay cómo llegar.
