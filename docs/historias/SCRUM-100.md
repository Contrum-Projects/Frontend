# SCRUM-100 · E3-H1 · Panel de productos: listado y formulario

**Orden:** 10 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-26 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-101](SCRUM-101.md), [SCRUM-132](SCRUM-132.md)

Como Personal de tienda, necesito el listado de productos y su formulario en el panel, con la finalidad de mantener el catálogo desde el celular o el computador.

**Historia backend:** SCRUM-26 · **Figma:** P3a Productos, P3 Producto nuevo · **RNF-25**

## Criterios de aceptación

1. **Listado.** El personal abre «Productos». Cuando carga. Ve foto principal, categoría, formatos, precio desde, stock total, estado y origen de la descripción, con filtros por exclusivos, stock bajo e inactivos.
2. **Crear y editar.** El personal abre el formulario. Cuando guarda. La pantalla muestra los campos faltantes marcados o la confirmación.
3. **Desactivar.** El producto está activo. Cuando el personal lo desactiva. La pantalla pide confirmación y lo muestra como inactivo.
4. **Uso desde el celular y el computador.** El panel se abre en un teléfono o en un computador. Cuando el personal crea o edita un producto. El formulario se adapta a la pantalla, sin desplazamiento horizontal.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular   | Ruta                                              |
| --------------------------- | ---------- | --------- | ------------------------------------------------- |
| P3a Productos               | 2039:980   | 2039:5857 | `/panel/productos`                                |
| P3 Producto nuevo / edición | 2029:658   | 2024:443  | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 28-10-2026 (`pnpm api:tipos` contra el backend local): **Parcial**.

- **Reales:** `POST /api/catalogo/productos` (crear), `GET` y `PATCH /api/catalogo/productos/{id}`
  (ver y editar) y `PATCH /api/catalogo/productos/{id}/desactivar`. Ninguna declara su respuesta en
  el Swagger: `ProductoPanel` en `compartido/api/respuestas.ts`.
- **Simulada:** el listado `GET /api/catalogo/productos`. Hoy cada fila trae solo los datos del
  producto, y el criterio 1 pide más. Forma pedida a SCRUM-26 (no acordada aún; ruta simulada en
  `compartido/api/simulado/panelCatalogo.ts`, tipos `ProductoListadoPanel` y
  `ListadoProductosPanel`):
  - Por fila, además de lo actual: `imagen` (URL de la principal del formato predeterminado o
    `null`), `formatos` (cantidad de formatos activos), `precioDesde` (menor precio con IVA del
    canal del producto: minorista si es general, mayorista si es exclusivo; `null` sin precios),
    `stockTotal` (unidades en bodegas activas) y `stockBajo` (algún formato bajo su mínimo).
  - En la respuesta: `conteos: { todos, exclusivos, stockBajo, inactivos }`, con la búsqueda
    aplicada, para los chips «Todos · 86».
  - Filtros nuevos: `canalVenta=profesional`, `stockBajo=true` y `soloInactivos=true` (se mantiene
    `incluirInactivos`; «Todos» lo usa).
  - `buscar` también por marca y SKU (Figma: «Nombre, marca o SKU»).
  - Mientras no exista, la ruta simulada pide al backend los productos reales (hasta 100) y los
    completa con valores fijos: sin imagen, 0 formatos, sin precio y stock 0. No inventa precios
    ni stock.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

**28-10-2026**

- **Listado con API simulada** (decisión del usuario): ver «API». Al llegar el endpoint, borrar
  la ruta de `compartido/api/simulado/panelCatalogo.ts`, el cast de `useProductos`
  (`TODO(SCRUM-100)`) y los tipos de `respuestas.ts` si el Swagger los declara. La historia no
  pasa a Hecha hasta probarla con el backend real.
- **Filtros, uno a la vez** como los chips de Figma. «Todos» incluye los inactivos (Figma muestra
  uno inactivo en «Todos»). Exclusivos y stock bajo también los incluyen.
- **Buscador:** dice «Nombre del producto» y no «Nombre, marca o SKU», porque el backend busca
  solo en el nombre. Busca 300 ms después de la última tecla o con Enter.
- **Categoría con su ruta** («Shampoo › Reparación») armada con el árbol de `useCategorias()`;
  el backend entrega solo la categoría del producto.
- **Formulario:** solo «Datos del producto» y «Descripción»; formatos, fotos y sugerencia de IA
  son de SCRUM-101, 102 y 132. Marca y categoría con el `Select` de shadcn y las consultas de
  SCRUM-103. «Exclusivo para profesionales» es `canalVenta: profesional`. Todos los campos son
  obligatorios en el backend, incluida la descripción. Los errores del backend van junto a su
  campo según cómo empieza el mensaje («El nombre…», «La marca…», «La categoría…»).
- **Al crear** se abre la edición del producto nuevo (ahí irán sus formatos). Al editar se queda
  en la página con la confirmación.
- **Origen de la descripción:** el chip («Manual», «IA», «IA editada») solo en la edición. Figma
  muestra «Sin descripción aún» en el producto nuevo; eso depende de la sugerencia de IA
  (SCRUM-132).
- **Desactivar:** Figma no lo dibuja. Va en una tarjeta al final de la edición, con confirmación
  (`AlertDialog`). Después la página muestra «Inactivo». **No hay reactivar:** el backend no tiene
  la ruta y la historia no lo pide.
- **Marca desactivada:** si el producto tiene una marca que ya no está activa, el selector la
  muestra igual y al guardar el backend avisa junto a «Marca».
- **`/panel/productos/[id]`** exporta `instant = false`: el diseño del panel lee la ruta con
  `usePathname()` fuera de `<Suspense>`, y con un id dinámico eso bloquea el prerender. Las
  próximas rutas dinámicas del panel (pedidos, verificaciones) se toparán con lo mismo.
- **Tabla desde 1280 px (`xl`):** con el menú lateral, entre 1024 y 1280 px las columnas fijas de
  Figma no dejan espacio al nombre del producto; ahí se usa la lista de celular.
- **Lista de celular** como Figma (2039:5857): foto, nombre, marca, formatos, exclusivo/inactivo,
  origen de la descripción y stock. No muestra categoría ni precio desde (Figma no los dibuja);
  están en la edición y en la tabla. Si el equipo los quiere, se agregan al detalle.
- **Revisiones:** criterios, diseño y seguridad sin bloqueantes; se corrigieron el ancho de la
  tabla, el esqueleto de la edición, el foco y el alto táctil de la paginación, el texto de 16 px
  de la descripción en celular, el error del interruptor y el espaciado fuera de la escala. La
  ruta simulada ya no copia las cabeceras del backend y responde 502 si no hay conexión.
- **Pendiente de revisar a mano** con una cuenta del personal: las dos pantallas a 360 y 1440 px
  (no hubo sesión del personal para abrirlas en el navegador).
- **Celular:** el formulario en una columna, con marca y categoría lado a lado como en Figma, y los
  botones al final. Figma no dibuja el acceso a «Marcas y categorías» en celular; se muestra igual.
- **Pedidos al backend (SCRUM-26):** los campos, conteos y filtros del listado (ver «API»), la
  búsqueda por marca y SKU, y una ruta para reactivar un producto si el equipo la quiere.
