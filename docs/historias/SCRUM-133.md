# SCRUM-133 · E4-H2 · Aceptar, editar o descartar la sugerencia

**Orden:** 41 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-61 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-132](SCRUM-132.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito revisar la sugerencia antes de publicarla, con la finalidad de asegurar que lo publicado sea correcto.

**Historia backend:** SCRUM-61 · **Figma:** P3 Producto nuevo, P3a Productos (origen de la descripción)

## Criterios de aceptación

1. **Tres acciones.** Hay una sugerencia en pantalla. Cuando el personal la acepta, la edita o la descarta. La interfaz envía el origen correcto (IA, IA editada o manual).
2. **Sin publicar sin revisar.** El personal sale sin confirmar. Cuando intenta salir. La interfaz avisa que la sugerencia no se guardará.
3. **Origen visible.** El producto ya existe. Cuando el personal abre el listado. Ve el origen de la descripción: manual, IA o IA editada.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**.

- `POST /api/catalogo/descripciones/sugerencia` devuelve `{ descripcion, ingredientes, firma }`.
- `POST /api/catalogo/productos` y `PATCH /api/catalogo/productos/{id}` aceptan
  `sugerencia: { descripcion, firma }` (la sugerida, sin cambios) e `ingredientes` (texto o
  `null`; en el PATCH, `null` borra). El backend decide el origen: igual a la sugerida, `ia`;
  distinta, `ia_editada`; sin `sugerencia`, `manual`. Firma que no corresponde: 400.
- Las respuestas del panel traen `ingredientes` (agregado a `ProductoPanel` en `respuestas.ts`).

## Notas de trabajo

- **Acciones (decisión del 04-11 con el usuario):** «Usar» copia la descripción y, si la foto los
  muestra, los ingredientes; «Editar» hace lo mismo y deja el cursor en la descripción; ambas
  cierran la tarjeta, que queda lista para pedir otra. «Descartar» la cierra sin tocar el
  formulario. Al guardar se reenvía la sugerencia usada con su firma; el frontend nunca calcula
  el origen. Si después de usarla se descarta otra sugerencia, la usada se sigue enviando.
- **Ingredientes (decisión del 04-11):** campo opcional «Ingredientes» bajo la descripción, sin
  Figma. Vacío se envía como `null`, así que en la edición borra la lista. Revisar con diseño.
- **Aviso al salir:** activo con una sugerencia a la vista o una usada sin guardar. Los enlaces
  internos (menú del panel, «Cancelar») abren «¿Salir sin guardar?» / «La sugerencia de
  descripción no se guardará.» con «Seguir editando» y «Salir sin guardar» (textos aprobados el
  04-11, sin Figma); cerrar o recargar la pestaña pide la confirmación del navegador. El botón
  «Atrás» del navegador no tiene aviso: Next 16 no permite detener esa navegación.
- **Chip «Sin descripción aún»** (Figma 2029:766) en el producto nuevo mientras la descripción
  está vacía.
- **Origen visible (criterio 3):** ya estaba en el listado y en la edición desde SCRUM-100; se
  agregó la prueba E4-H2.
- **Para el backend:** el Swagger declara `ingredientes` de `CrearProductoDto` y
  `ActualizarProductoDto` como objeto; falta `type: String` en `@ApiPropertyOptional`. El
  frontend lo convierte en `cuerpoProducto` mientras tanto.
- **Pendiente con diseño:** en la edición, la etiqueta de origen muestra lo guardado hasta
  guardar (tras «Usar» sigue «Manual»). El alto de 38 px del botón mediano en celular y el foco
  de acento de las áreas de texto son de los componentes base, fuera de esta historia.
- **PR:** https://github.com/Contrum-Projects/Frontend/pull/56
