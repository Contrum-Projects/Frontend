# SCRUM-116 · E5-H1 · Pantalla del carrito

**Orden:** 24 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-43 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-108](SCRUM-108.md)  
**La necesitan después:** [SCRUM-117](SCRUM-117.md), [SCRUM-119](SCRUM-119.md), [SCRUM-118](SCRUM-118.md)

Como un Cliente, necesito el carrito en la tienda, con la finalidad de armar mi compra antes de pagar.

**Historia backend:** SCRUM-43 · **Figma:** 04 Carrito, 04b Carrito vacío

## Criterios de aceptación

1. **Agregar y cambiar.** El cliente agrega desde la ficha. Cuando cambia cantidades o quita artículos. El carrito recalcula los totales con «IVA incluido».
2. **Artículo con problema.** Un artículo supera el stock. Cuando se muestra el carrito. Se marca con aviso y el paso siguiente queda bloqueado hasta ajustarlo.
3. **Carrito vacío.** No hay artículos. Cuando el cliente abre el carrito. Ve el mensaje y el botón al catálogo.

## Pantalla y ruta

| Pantalla   | Escritorio                 | Celular                                       | Ruta       |
| ---------- | -------------------------- | --------------------------------------------- | ---------- |
| 04 Carrito | 2008:872 · listo 2035:2364 | 2008:1927 · listo 2035:4957 · vacío 2060:2231 | `/carrito` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Revisado el 01-11-2026: **Sí**, el backend real ya tiene el carrito (SCRUM-43). Sin rutas simuladas.

| Uso                        | Endpoint                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| Ver el carrito con totales | `GET /api/carrito`                                                          |
| Agregar desde la ficha     | `POST /api/carrito/items` `{ articuloId, cantidad }` (suma a lo que ya hay) |
| Cambiar la cantidad        | `PATCH /api/carrito/items/{articuloId}` `{ cantidad }`                      |
| Quitar                     | `DELETE /api/carrito/items/{articuloId}`                                    |

Todos devuelven el carrito entero (`CarritoCuenta`, backend `src/modulos/carrito/carrito.service.ts`):
líneas con `precioUnitario` y `subtotal` con IVA, `aLaVenta`, `stockSuficiente`, `bajoMinimo`,
`impideCrearPedido`, y `total` y `puedeCrearPedido`. El Swagger no declara la respuesta: el tipo
está en `compartido/api/respuestas.ts`. Exigen sesión de cliente o profesional (403 al personal).
`articuloId` es el id del formato o del pack.

## Notas de trabajo

**01-11-2026**

- Decisiones con el usuario:
  - Visitante sin sesión (hasta SCRUM-117): «Agregar al carrito» lleva a `/ingresar?volver=<ficha>`
    y `/carrito` muestra «Ingresa para ver tu carrito» con el botón «Ingresar».
  - Textos de las líneas con problema (Figma solo dibuja el del mínimo): stock «No hay stock para
    esta cantidad. Baja la cantidad o quítalo del carrito.»; ya no se vende «Este producto ya no
    está disponible. Quítalo del carrito.»; banner «Hay productos que debes ajustar para
    continuar.»; bajo el botón «Ajusta los productos marcados para continuar.».
  - Al agregar: aviso «Agregado al carrito» con «Ver carrito»; la persona sigue en la ficha.
  - Contador del header: unidades totales del carrito; oculto sin sesión o vacío.
- Cada respuesta del backend reemplaza el carrito en la caché (`setQueryData`): el frontend no
  suma precios ni decide el bloqueo; solo cuenta unidades para el título y el contador.
- «Continuar con la compra» lleva a `/checkout` (SCRUM-118, aún sin página). Queda deshabilitado
  si `puedeCrearPedido` es `false`.
- Un artículo que ya no se vende no muestra cantidad (el backend rechaza cambiarla): solo quitar.
- Con `bajoMinimo` se reutiliza el texto del mínimo de la ficha; el aviso de Figma con «Agrega N
  más» y «Subir a 3» queda para SCRUM-119.
- En la ficha, el bloque de compra se reinicia al cambiar de formato (cantidad y error del
  formato anterior).
- Pedidos al backend (SCRUM-43): declarar en el Swagger la respuesta de `/api/carrito` (hoy sin
  esquema) y considerar enviar la marca de cada línea, que Figma muestra («Marca A · 300 ml»).
- Personal de tienda en `/carrito`: no se pide el carrito (el backend responde 403) y se muestra
  el mensaje genérico del 403, «No tienes permiso para hacer esto.». Por confirmar con el equipo.
- El botón del carrito de la tarjeta del catálogo sigue deshabilitado: el carrito agrega formatos
  y la tarjeta muestra el producto. No tiene historia.
- Revisión (verificador, diseño, seguridad): botón de quitar a 40 px, aviso ligado a la cantidad
  y a quitar, contador sobre el ícono (cabe a 360 px), esqueleto con el h1 real, sin doble
  agregado mientras se espera la sesión, y no se guarda en caché un carrito que llega después de
  cerrar sesión.
- Pendiente: probar en el navegador con una cuenta de cliente del backend local (la semilla solo
  crea la del administrador).
