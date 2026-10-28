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

Estado al 28-10-2026 (`compartido/api/esquema.d.ts`): **Sí**, todo real, sin rutas simuladas.

- `GET /api/catalogo/productos/{id}/formatos`: lista con el predeterminado primero.
- `POST /api/catalogo/productos/{id}/formatos`: crea (el primero queda predeterminado).
- `PATCH /api/catalogo/formatos/{id}`: edita; `esPredeterminado: true` desmarca a los demás;
  desmarcar el predeterminado responde 400.
- 409 con el dato repetido en el mensaje: «El SKU…», «El código de barras…», «El SKU y el código
  de barras…» o, si chocan dos guardados, «El SKU o el código de barras…».

**Pedidos al backend (SCRUM-27):** el Swagger no declara la respuesta (`FormatoPanel` está en
`compartido/api/respuestas.ts`, copiado de `formatos.service.ts`) y tipa `codigoBarras`,
`contenido` y `fechaVencimiento` como `Record<string, never>` (falta `type` en
`@ApiPropertyOptional({ nullable: true })`). Mientras tanto el cuerpo usa `CuerpoFormato` con un
cast (`TODO(SCRUM-101)` en `consultasProductos.ts`). No hay ruta para desactivar un formato.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**28-10-2026**

- **Rama desde `SCRUM-100-productos`** (PR #17 aún en revisión): el PR de esta historia depende
  de ese.
- **Columnas** (decisión del usuario): solo Formato / SKU, Mín., Vence y editar. Fotos y precios
  de Figma llegan con SCRUM-102 y SCRUM-104. La fila resaltada de Figma es el formato elegido
  para las fotos (SCRUM-102).
- **Formulario en el panel lateral** (decisión del usuario), como «Nueva marca»: Figma no lo
  dibuja. SKU y código, nombre, contenido y unidad, peso y stock mínimo, medidas en cm (alto,
  ancho, largo) y vencimiento opcional con el `SelectorFecha` de la cuenta. Acepta coma decimal.
  Se envían siempre todos los datos; `null` borra lo opcional.
- **Criterio 2:** el 409 queda junto a SKU, código o ambos, en el formulario del formato, sin
  perder lo escrito. Los demás 400 también van junto a su campo según cómo empieza el mensaje.
- **Criterio 3:** etiqueta «Predeterminado» en una sola fila (la API lo entrega primero). Se
  marca con el interruptor del formulario; en el predeterminado (o en el primer formato) el
  interruptor queda fijo y lo explica. `esPredeterminado` solo se envía cuando cambia.
- **Producto nuevo** (decisión del usuario): tarjeta con «Guarda el producto para agregar sus
  formatos.». **Sin formatos:** «Este producto aún no tiene formatos. El primero que agregues
  queda como predeterminado.»
- **Celular:** una tarjeta por formato como Figma, con nombre y SKU en dos líneas para que quepan
  las etiquetas. «Guardar producto» queda al final del formulario del producto, antes de
  Formatos (Figma lo pone al final de la página), porque los formatos se guardan aparte.
- **Vencimiento** con `formatearDia()` nuevo en `compartido/formato/fecha.ts`: `formatearFecha()`
  corría un día las fechas sin hora por la zona de Chile.
- **Página a todo el ancho** (decisión del usuario): sin `lg:max-w-3xl`, como las demás pantallas
  del panel. En escritorio, nombre, marca y categoría van en una fila. No se usa la columna
  derecha de Figma (fotos y sugerencia de IA): **las fotos van dentro de cada formato**, no como
  panel del producto (para SCRUM-102).
- **Revisiones:** criterios y seguridad sin bloqueantes. Diseño: los botones del panel lateral
  se desbordaban a 360 px (ahora «Agregar» y «Guardar»; «Guardar cambios» de
  `formularioCategoria.tsx` tiene el mismo problema, fuera de esta historia), el lápiz pasa a 40 px
  en celular, el esqueleto toma la forma de la tabla o de las tarjetas, y se quitaron dos
  espaciados fuera de la escala. El calendario de vencimiento abre en el mes actual
  (`mesInicial` nuevo en `SelectorFecha`).
- **Sin cambiar (sugerencias):** los mensajes de número muestran el máximo como el backend
  («hasta 99999.99») y en las columnas de alto, ancho y largo ocupan varias líneas; el stock
  mínimo se muestra sin separador de miles.
- **Pendiente de revisar a mano** con una cuenta del personal: la pantalla a 360 y 1440 px.
