# SCRUM-108 · E2-H3 · Ficha de producto y de pack

**Orden:** 16 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-34 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** [SCRUM-109](SCRUM-109.md), [SCRUM-116](SCRUM-116.md)

Como un Visitante o Cliente, necesito la ficha de producto y de pack, con la finalidad de decidir qué formato comprar.

**Historia backend:** SCRUM-34 · **Figma:** 03 Ficha de producto, 03b Formato agotado, 03c Ficha de pack

## Criterios de aceptación

1. **Formatos y galería.** El usuario abre un producto. Cuando elige un formato. La galería, el precio con «IVA incluido» y la disponibilidad cambian con el formato.
2. **Formato agotado.** El formato no tiene stock. Cuando el usuario lo selecciona. Se marca «Agotado», el botón de agregar queda deshabilitado y se avisa si otro formato sí está disponible.
3. **Pack.** El usuario abre un pack. Cuando carga. Ve los formatos que incluye con cantidades, el precio del pack frente al precio por separado y la disponibilidad del componente más escaso.

## Pantalla y ruta

| Pantalla             | Escritorio                   | Celular               | Ruta              |
| -------------------- | ---------------------------- | --------------------- | ----------------- |
| 03 Ficha de producto | 2007:635 · agotado 2058:3096 | 2007:1706 (peluquero) | `/productos/[id]` |
| 03c Ficha de pack    | 2058:3302                    | —                     | `/packs/[id]`     |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 30-10-2026 (`pnpm api:tipos` contra el backend local): **Parcial**. Los dos endpoints
existen y la pantalla los usa sin rutas simuladas:

- `GET /api/tienda/productos/{id}`: producto con sus formatos a la venta (el predeterminado
  primero), cada uno con `imagenes`, `precio` con IVA y `disponibilidad` (`disponible` | `agotado`,
  sin cantidades). 404 si no existe, no está a la venta o es exclusivo.
- `GET /api/tienda/packs/{id}`: el pack del listado (E3-H6) con `imagenes` y la `disponibilidad`
  de su componente más escaso. 404 si no existe, no está vigente o es exclusivo.

El Swagger no declara las respuestas (`content?: never`): los tipos `ProductoDetalle`,
`FormatoDetalle` y `PackDetalle` están en `compartido/api/respuestas.ts`, copiados de
`src/modulos/catalogo/tienda-detalle.service.ts` del backend.

**Pedidos a SCRUM-34 (backend):**

1. Documentar en el Swagger la respuesta 200 de los dos endpoints.
2. Precio del pack por separado (criterio 3, Figma 03c «Por separado: $24.980»): la suma con IVA
   de sus componentes, calculada en el backend. Hoy no viene y la ficha no lo muestra.
3. Opcional, para Figma 03c: imagen e id de producto de cada componente del pack (miniatura y
   enlace a su ficha).

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**30-10-2026**

- PR: https://github.com/Contrum-Projects/Frontend/pull/26, integrado el 30-10-2026. Hecha: usa
  solo el backend real (sin rutas simuladas). Queda pendiente del backend el precio por separado
  del pack (criterio 3).

- Rutas con el `id` del backend (`/productos/[id]`, `/packs/[id]`), como los enlaces del catálogo
  (`urlProducto`, `urlPack`); la historia decía `[codigo]`, pero el backend no tiene código
  público para productos.
- La ficha se arma en el servidor como visitante (SEO, sin caché, RNF-30). El precio profesional y
  la vista del peluquero (Figma 2007:1706) quedan para SCRUM-109.
- Precio por separado del pack: **se omite** hasta que el backend lo entregue (decisión del
  usuario, 30-10-2026). El criterio 3 queda incompleto en ese punto.
- Cantidad y «Agregar al carrito» se muestran como en Figma pero aún no agregan nada:
  `TODO(SCRUM-116)` en `tienda/ficha/compra.tsx`. Agotado: sin cantidad y botón «Agotado»
  deshabilitado.
- Aviso de agotado: «Agotado en este formato. El de 300 ml sí está disponible.» (texto de Figma);
  con varios disponibles, «Los de 300 ml y 1 L sí están disponibles.»; sin ninguno, solo
  «Agotado en este formato.».
- No se muestran (sin datos en la API ni criterio): pestañas «Ingredientes» y «Modo de uso»,
  «También te puede interesar», aviso «¿Eres peluquero?» (SCRUM-109/134), «quedan 2» del pack
  (el backend no informa cantidades, a propósito) ni la miniatura de cada componente.
- La descripción va una vez, en la sección «Descripción» bajo la ficha (la API tiene un solo texto;
  Figma lo repite bajo el título).
- Celular: la cantidad va arriba y el botón a todo el ancho (como Figma 2007:1779), para que
  quepa en 360 px; desde `sm`, en una fila.
- Pendiente fuera de esta historia: la miga «Packs» del pack enlaza a `/packs`, que no tiene
  página ni historia (igual que el enlace «Packs» del header).
- Revisión (verificador-criterios y revisor-diseno): corregidos el ancho de la galería entre
  1024 y 1280 px, los botones de la cantidad a 40 px, el espaciado de los formatos y la fila de
  compra en 360 px. No revisado con datos reales: un formato disponible y varios formatos (en el
  backend local todo está agotado y con un solo formato); lo cubren las pruebas.
- Nuevo: `compartido/ui/cantidad.tsx` (Figma › Componentes › Cantidad) y la utilidad
  `texto-precio-ficha` en `app/globals.css` (30 px en celular y 36 en escritorio, como Figma).
