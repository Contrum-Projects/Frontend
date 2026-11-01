# SCRUM-112 · E11-H3 · Registrar salidas que no son venta

**Orden:** 20 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-38 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-111](SCRUM-111.md)  
**La necesitan después:** [SCRUM-113](SCRUM-113.md)

Como Personal de tienda, necesito registrar mermas y consumo desde el panel, con la finalidad de que el stock refleje lo real.

**Historia backend:** SCRUM-38 · **Figma:** P5c Registrar salida

## Criterios de aceptación

1. **Registrar salida.** El personal abre el panel lateral (escritorio) o la pantalla propia (celular). Cuando elige tipo (merma por vencimiento, merma por daño o consumo en la peluquería), formato, ubicación y cantidad. La salida queda registrada y el stock se actualiza.
2. **Cantidad mayor al stock.** La cantidad supera el stock de la ubicación. Cuando el servidor la rechaza. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla             | Escritorio                | Celular   | Ruta                                    |
| -------------------- | ------------------------- | --------- | --------------------------------------- |
| P5c Registrar salida | 2043:1689 (panel lateral) | 2044:1209 | panel lateral sobre `/panel/inventario` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 01-11-2026 (`compartido/api/esquema.d.ts` de `main` y repo del backend): **Parcial**.

| Uso                               | Endpoint                                          | Estado                                                                                                    |
| --------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Registrar salida (CA1, CA2)       | `POST /api/inventario/salidas` (`CrearSalidaDto`) | Real. El Swagger no declara la respuesta (`SalidaRegistrada` de `salidas.service.ts`, en `respuestas.ts`) |
| Ubicaciones con stock del formato | `GET /api/inventario/stock/formatos/{id}`         | Real (E11-H5). El Swagger no declara la respuesta (`StockFormato` de `stock.service.ts`)                  |
| Buscar formatos                   | `GET /api/catalogo/formatos?buscar=`              | Simulado desde SCRUM-105                                                                                  |

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**01-11-2026 (/historia):**

- **Dónde se abre:** la página Stock (`/panel/inventario`) es de SCRUM-114 y aún no existe.
  Los botones «Registrar salida» y «Nueva entrada» quedan en `AccionesInventario`, en la cabecera
  de Inventario (hoy en Entradas; SCRUM-114 los reutiliza en Stock). En escritorio, la salida se
  registra en un panel lateral; en celular, en `/panel/inventario/salidas/nueva`, que al registrar
  vuelve a Entradas (TODO(SCRUM-114): volver a Stock). La ruta pide `inventario.registrar`
  (decidido con el usuario).
- **Tipos:** solo los tres de salida. Ajuste y Transferencia, que Figma muestra como chips, llegan
  con SCRUM-113 (decidido con el usuario).
- **Sin cálculo de stock en el frontend (RNF-03):** Figma calcula antes de guardar «El stock en
  B-01 queda en 2, bajo el mínimo de 4» y, en celular, desactiva el botón con «Solo hay 1 en
  A-02». No se hace. Si la cantidad no alcanza, el 400 del backend («No hay stock suficiente en
  esa ubicación: hay 1 y la salida es de 2.») queda junto a la cantidad (CA2). Al registrar, el
  aviso «Salida registrada. Quedan N en Bodega · B-01.» usa `stockRestante` de la respuesta. El
  aviso de stock mínimo queda para SCRUM-115 (decidido con el usuario).
- **Ubicación:** un Select con las ubicaciones donde el formato tiene stock (`GET
/inventario/stock/formatos/{id}`), «Bodega principal · B-01 · stock 3». Incluye las desactivadas,
  marcadas así, porque el backend acepta salidas de ellas. En celular Figma muestra la ubicación
  dentro del selector de formato («A-02 · stock 1»); aquí es un campo aparte en las dos versiones.
- **Formato:** un Popover con búsqueda (la misma consulta de packs y entradas), no otro panel
  lateral, porque quedaría un panel dentro del otro.
- **Errores:** el backend responde mensajes sin campo; `campoDelError` los asocia por cómo
  empiezan (tipo, formato, ubicación, cantidad y «No hay stock suficiente…», observación).
- **Pedido a SCRUM-38 / SCRUM-40:** declarar en el Swagger las respuestas del POST de salidas y
  del GET de stock por formato, y el `type: string` de `observacion` en `CrearSalidaDto`.
- **Permiso de la búsqueda de formatos:** `GET /api/catalogo/formatos` (simulado, SCRUM-105) es
  del catálogo. Si el backend lo protege con `catalogo.gestionar`, el bodeguero (que tiene
  `inventario.registrar` pero no ese permiso) no podrá buscar formatos ni aquí ni en Entradas
  (SCRUM-111). **Pedido al backend:** que acepte también `inventario.registrar`, o un buscador
  de formatos de inventario.
- Pendiente para «Hecha»: probar con el backend real y revisar a 1440 y 360 px (no hubo
  navegador en esta sesión).
