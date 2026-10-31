# SCRUM-111 · E11-H2 · Entradas de inventario

**Orden:** 19 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-37 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md), [SCRUM-110](SCRUM-110.md)  
**La necesitan después:** [SCRUM-112](SCRUM-112.md), [SCRUM-114](SCRUM-114.md)

Como Personal de tienda, necesito registrar entradas de inventario desde el panel, con la finalidad de aumentar el stock con respaldo.

**Historia backend:** SCRUM-37 · **Figma:** P5e Inventario · Entradas, P5 Entrada de inventario

## Criterios de aceptación

1. **Lista de entradas.** El personal abre «Entradas». Cuando carga. Ve fecha, factura o guía, proveedor, ubicación, formatos, unidades, costo neto y quién la registró.
2. **Nueva entrada.** El personal completa proveedor, fecha, documento, ubicación y formatos con cantidad y costo. Cuando guarda. La tabla muestra los subtotales y se confirma el registro.
3. **Errores.** Falta un dato o un formato se repite. Cuando el servidor lo rechaza. La pantalla señala la fila o el campo.

## Pantalla y ruta

| Pantalla                        | Escritorio                  | Celular                    | Ruta                                                             |
| ------------------------------- | --------------------------- | -------------------------- | ---------------------------------------------------------------- |
| P5e Entradas · P5 Entrada nueva | 2064:2663 · nueva 2029:4319 | 2069:1703 · nueva 2025:603 | `/panel/inventario/entradas`, `/panel/inventario/entradas/nueva` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 31-10-2026 (Swagger local y `main` del backend): **Parcial**.

| Uso                                       | Endpoint                                            | Estado                                                                                                           |
| ----------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Registrar entrada (CA2, CA3)              | `POST /api/inventario/entradas` (`CrearEntradaDto`) | Real. El Swagger no declara la respuesta (`EntradaRegistrada` de `entradas.service.ts`, tipo en `respuestas.ts`) |
| Lista de entradas (CA1)                   | `GET /api/inventario/entradas`                      | **Simulado** (`compartido/api/simulado/panelInventario.ts`)                                                      |
| Ubicaciones de destino y filtro de bodega | `GET /api/inventario/ubicaciones`                   | **Simulado**                                                                                                     |
| Buscar formatos                           | `GET /api/catalogo/formatos?buscar=`                | Simulado desde SCRUM-105                                                                                         |
| Proveedores activos                       | `GET /api/inventario/proveedores`                   | Real                                                                                                             |

Forma simulada (propuesta del frontend; pedirla a SCRUM-37):

- `GET /api/inventario/entradas?bodegaId=&buscar=&desde=AAAA-MM-DD&hasta=AAAA-MM-DD&pagina=` →
  `{ items: [{ id, fechaRecepcion, tipoDocumento, numeroDocumento, proveedor: { id, razonSocial },
ubicacion: { id, codigo, bodega }, cantidadFormatos, unidades, costoNetoTotal,
registradoPor: { nombre } }], total, pagina, limite }`, de la más reciente a la más antigua.
  `buscar` busca por razón social del proveedor o número de documento. Permiso
  `inventario.registrar`.
- `GET /api/inventario/ubicaciones` → `[{ id, codigo, bodega: { id, nombre } }]`, solo ubicaciones
  activas de bodegas activas.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**31-10-2026 (/historia):**

- **Subtotales y totales:** el frontend no los calcula (CLAUDE.md, RNF-03). Mientras se llena el
  formulario no se muestran; tras registrar, la confirmación muestra `subtotalNeto` por línea y
  `unidades` / `costoNetoTotal` si el backend los envía, y «—» si no. **Pedido a SCRUM-37:** que
  la respuesta del POST los incluya.
- **Documento:** Figma tiene un solo campo; el DTO exige `tipoDocumento`, así que hay un Select
  «Documento» (Factura / Guía de despacho) y el campo «Número de factura o guía». Se agregó
  «Observación (opcional)», que el DTO acepta y Figma no dibuja (decidido con el usuario).
- **Filtros:** bodega, búsqueda (proveedor o documento) y rango de fechas, aplicados por el
  backend (decidido con el usuario). En celular van apilados bajo «Nueva entrada».
- **Errores (CA3):** el backend responde mensajes sin campo; se asocian por cómo empiezan
  (`destinoDelError` en `esquemaEntrada.ts`). «El formato N no existe» y «El stock del formato N…»
  marcan esa fila; «Cada formato debe aparecer una sola vez» marca las filas repetidas (el
  buscador ya impide agregar un formato dos veces). Los errores de cantidad o costo del backend no
  dicen la línea y van bajo la lista. **Pedido a SCRUM-37:** indicar la línea (`detalles.0.cantidad`
  o el `formatoId`) en esos mensajes.
- **Ubicaciones:** la semilla del backend no crea bodegas ni ubicaciones y no hay endpoint para
  crearlas; con la API simulada (ids 1–4) el POST real solo funciona si esas ubicaciones existen
  en la base local. **Pedido a SCRUM-37:** el GET de ubicaciones y ubicaciones en la semilla.
- El selector de proveedor usa `GET /inventario/proveedores`, que pide `proveedores.gestionar`.
  Hoy todo rol con `inventario.registrar` también lo tiene; si eso cambia, confirmar con SCRUM-37.
- `BuscadorFormatos` (packs) acepta ahora `destino` y `aviso` para reutilizarlo aquí.
- **Fechas:** con el date picker de shadcn: `SelectorFecha` en la fecha de recepción (hasta hoy)
  y `Calendar` en modo rango en el filtro de la lista.
- **Paginación:** Figma P5e no la dibuja; la lista muestra la primera página y, si hay más, avisa
  que se usen los filtros.
- Pendiente para «Hecha»: probar con el backend real (sin rutas simuladas) y revisión visual a
  1440 y 360 px (no hubo navegador en esta sesión).

**PR:** https://github.com/Contrum-Projects/Frontend/pull/32 (En revisión; endpoints simulados:
`GET /inventario/entradas` y `GET /inventario/ubicaciones`).
