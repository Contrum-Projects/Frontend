# SCRUM-105 · E3-H6 · Pantalla Pack nuevo

**Orden:** 14 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-31 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-102](SCRUM-102.md), [SCRUM-104](SCRUM-104.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito crear packs desde el panel, con la finalidad de ofrecer promociones armadas.

**Historia backend:** SCRUM-31 · **Figma:** P3c Pack nuevo

## Criterios de aceptación

1. **Componentes.** El personal arma el pack. Cuando agrega formatos con su cantidad. La tabla muestra el stock de cada componente.
2. **Solo formatos.** El personal busca un componente. Cuando escribe. La búsqueda muestra solo formatos de producto, nunca otros packs.
3. **Disponibilidad y vigencia.** El pack tiene componentes y vigencia opcional. Cuando se guarda. El panel muestra la disponibilidad del componente más escaso, los precios con su valor con IVA y las fotos propias del pack.

## Pantalla y ruta

| Pantalla       | Escritorio | Celular   | Ruta                 |
| -------------- | ---------- | --------- | -------------------- |
| P3c Pack nuevo | 2065:2381  | 2065:9091 | `/panel/packs/nuevo` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 28-10-2026 (`pnpm api:tipos` contra el backend local): **Parcial**.

**Existe** (SCRUM-31, `src/modulos/catalogo/packs.controller.ts` y `packs.service.ts`):

- `POST /api/catalogo/packs`, `GET` y `PATCH /api/catalogo/packs/{id}`, `GET /api/catalogo/packs`.
  El Swagger no declara la respuesta: el tipo `PackPanel` está en `compartido/api/respuestas.ts`.
- Fotos del pack: `/api/catalogo/articulos/{id}/imagenes` con el id del pack (E3-H3).
- Precios del pack: `GET` y `PUT /api/catalogo/articulos/{id}/precios` (E3-H5). Los valores con
  IVA siguen pedidos a SCRUM-30 (ver SCRUM-104).

**Simulado** (`compartido/api/simulado/panelCatalogo.ts`, forma pedida a SCRUM-31):

1. `GET /api/catalogo/formatos?buscar=&pagina=&limite=`: búsqueda de formatos para armar el pack
   (criterio 2). Solo formatos activos de productos activos, nunca packs. Busca en el nombre del
   producto, el nombre del formato y el SKU.

   ```json
   {
     "items": [
       {
         "formatoId": 21,
         "sku": "SH-REP-300",
         "nombreFormato": "300 ml",
         "producto": { "id": 7, "nombre": "Shampoo reparador" },
         "canalVenta": "general",
         "stockTotal": 2,
         "precioMinoristaNeto": 10916,
         "precioMinoristaConIva": 12990
       }
     ],
     "total": 1,
     "pagina": 1,
     "limite": 20
   }
   ```

   Errores: 401, 403 (sin `catalogo.gestionar`), 400 (paginación inválida).

2. En `PackPanel` (respuesta de `GET`, `POST` y `PATCH /catalogo/packs`), campos nuevos:
   - en cada componente: `stockTotal`, `precioMinoristaNeto`, `precioMinoristaConIva` (criterio 1);
   - `disponibilidad`: packs que alcanzan con el stock de hoy, la del componente más escaso
     contando las unidades que lleva (como en `/tienda/packs/{id}`), pero también fuera de la
     vigencia (criterio 3);
   - `componenteLimitante`: `{ formatoId, stockTotal }` o `null`;
   - `precioMinoristaPorSeparadoConIva`: lo que cuestan los componentes por separado, con IVA
     (Figma: «por separado $24.980»).

Mientras no existan: la búsqueda simulada arma la lista con los productos reales cuyo **nombre**
coincide (no busca por formato ni SKU) y sus formatos activos, **sin** stock ni precios; los
packs van directo al backend real. Lo que falta se ve como «—» o «sin dato»: no se calcula ni se
inventa en el frontend. Cada búsqueda simulada hace hasta 21 llamadas al backend (el listado y los
formatos de cada producto): en desarrollo puede tocar el límite de peticiones por IP.

## Notas de trabajo

- **Flujo:** «Guardar pack» crea el pack (`POST`) y abre `/panel/packs/[id]`, la misma pantalla
  con el pack guardado (`GET`/`PATCH`). Ahí aparecen las fotos, los precios y la disponibilidad;
  antes, «Guarda el pack para agregar fotos y precios.» (fotos y precios necesitan el id).
- **Vigencia:** dos fechas opcionales, «Vigente desde» y «Vigente hasta» (Figma dibuja un solo
  campo; la API recibe dos). Vacía va como `null`.
- **Precios:** se fijan en el panel lateral de E3-H5 (con motivo, como los formatos), no en
  campos en línea. Solo con `precios.gestionar`. El interruptor «Exclusivo» va en «Datos del
  pack»: es parte del pack (`canalVenta`) y los precios van fuera del `<form>`.
- **Anchos:** dos columnas y tabla de componentes desde `xl` (1280 px), como la tabla de
  formatos; por debajo, una columna y cada componente como tarjeta (un solo campo de cantidad
  por fila). Las fotos usan la misma galería en celular y en escritorio.
- **Reutilizado:** `GestorFotos` (sale de `fotosFormato.tsx`) y `PanelPrecios` ahora reciben de
  quién son las fotos o los precios, para servir a formatos y packs.
- **Pedir al backend (SCRUM-31):** la búsqueda de formatos y los campos de arriba. Además, los
  mensajes de componentes nombran el formato por id («El formato con id 11 no está activo…»):
  sería mejor el SKU o el nombre, porque el personal no ve ids.
- **Swagger:** las respuestas de packs no están declaradas (`content?: never`), y las fechas de
  `CrearPackDto` salen tipadas como objeto (`Record<string, never>`): hay un cast con
  `TODO(SCRUM-105)` en `esquemaPack.ts` y otro en `consultasPacks.ts` (búsqueda simulada).
- **Hecha** cuando el backend tenga lo pedido, se borren las rutas simuladas y se pruebe con el
  backend real.
- **Revisiones:** criterios, diseño y seguridad. Se corrigió el diseño entre 1024 y 1279 px, el
  foco al agregar o quitar un componente, el alto táctil de los botones, la búsqueda simulada
  (devuelve el 401/403 en vez de «sin resultados») y que la simulación ya no muestra ceros.
- **Pendiente de revisar a mano:** la pantalla a 360 y 1440 px con el backend real (no hubo
  navegador en la sesión), sobre todo los dos `type="date"` en iOS Safari, y la tabla que se
  vuelve tarjeta con VoiceOver.
- **Sección «Packs» (agregada fuera de Figma, a pedido):** entrada «Packs» en el menú lateral
  después de «Productos» (`catalogo.gestionar`) y listado en `/panel/packs` con nombre y SKU,
  componentes con su cantidad, vigencia con «Vigente»/«Fuera de vigencia» (campo `vigente` del
  backend), «Exclusivo» e «Inactivo». Usa `GET /api/catalogo/packs` real, paginado. En celular
  Packs no entra en la barra inferior de Figma: va en «Más». «Cancelar» y «← Packs» vuelven al
  listado. Falta que diseño la agregue a Figma (menú y pantalla).
