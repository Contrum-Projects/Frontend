# SCRUM-117 · E5-H2 · Carrito del visitante en el navegador

**Orden:** 25 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-44 · **API:** No

**Necesita antes (frontend):** [SCRUM-116](SCRUM-116.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito que mi carrito se conserve al iniciar sesión, con la finalidad de no perder lo que elegí.

**Historia backend:** SCRUM-44 · **Figma:** 04 Carrito

## Criterios de aceptación

1. **Sin sesión.** El visitante agrega artículos. Cuando cierra y vuelve a abrir el navegador. El carrito sigue ahí.
2. **Al iniciar sesión.** El visitante tiene artículos y su cuenta tenía un carrito. Cuando inicia sesión. La interfaz envía los artículos al servidor y muestra el carrito unido.

## Pantalla y ruta

| Pantalla   | Escritorio                 | Celular                                       | Ruta       |
| ---------- | -------------------------- | --------------------------------------------- | ---------- |
| 04 Carrito | 2008:872 · listo 2035:2364 | 2008:1927 · listo 2035:4957 · vacío 2060:2231 | `/carrito` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Revisado el 02-11-2026: **Sí**, el backend real ya tiene el carrito del visitante (SCRUM-44). Sin
rutas simuladas.

| Uso                                    | Endpoint                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Mostrar el carrito del navegador       | `POST /api/carrito/cotizar` `{ articulos: [{ articuloId, cantidad }] }`     |
| Unir al de la cuenta al iniciar sesión | `POST /api/carrito/unir` (misma lista; cliente y profesional, personal 403) |

`cotizar` es pública (60 por minuto por IP) y responde con la forma de `GET /api/carrito`,
siempre como visitante; un artículo que no se vende sin cuenta sale con `aLaVenta: false` y sin
nombre, tipo ni imagen. `unir` devuelve el carrito de la cuenta más `ajustes`
(`no_disponible`, `agotado`, `cantidad_ajustada`). La lista lleva de 1 a 50 artículos distintos
con cantidades de 1 a 999. El Swagger no declara las respuestas: `CarritoUnido` y
`AjusteUnionCarrito` están en `compartido/api/respuestas.ts` (backend
`src/modulos/carrito/carrito.service.ts`).

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**02-11-2026**

- Decisiones con el usuario:
  - Al agregar sin sesión, se guarda en el navegador sin revisar el stock (no se gasta el límite
    de `cotizar`); el carrito marca la línea al cotizar, igual que el de la cuenta.
  - Línea que no se vende sin cuenta (sin nombre): «Producto no disponible», sin precio ni
    cantidad, con el aviso de siempre y el botón de quitar.
  - «Continuar con la compra» del visitante lleva a `/ingresar?volver=/carrito`; al volver ve el
    carrito unido.
  - Lo que `unir` quitó o ajustó se avisa arriba de `/carrito` (Alert info): «Quitamos un
    producto que ya no está disponible.» / «Quitamos N productos que ya no están disponibles.» y
    «Ajustamos la cantidad de un producto (N productos) al máximo de 999.». Se ve hasta que la
    persona cambia su carrito o cierra sesión, también sobre el carrito vacío.
- El navegador guarda solo `{ articuloId, cantidad }` en `localStorage` (`cp:carrito`, versión 1),
  sin precios ni datos de la persona. Al leer, zod descarta las entradas dañadas o repetidas; si
  el almacenamiento está bloqueado, el carrito vive en memoria mientras la pestaña siga abierta.
- `<UnionCarrito>` (layout de la tienda) une solo cuando empieza la sesión de la pestaña (al
  ingresar o al abrir con la sesión viva), no cuando otra pestaña cambia el carrito: así lo que
  agrega un visitante en otra pestaña no va a la cuenta abierta en esta (auditoría de seguridad).
  Web Locks evita unir dos veces entre pestañas; se descuenta del navegador solo lo enviado.
- Si `unir` falla, no se borra nada: los productos siguen en el navegador. Se avisa (decidido
  con el usuario el 02-11-2026) con un toast con «Reintentar» donde esté la persona y un aviso
  con «Reintentar» arriba de `/carrito` hasta que se unan. Con un 4xx, el mensaje del backend;
  con un 5xx o sin conexión, «No pudimos sumar a tu carrito los productos que agregaste sin
  sesión.». Si no reintenta, se vuelve a intentar en el próximo ingreso o al recargar.
- En el carrito del visitante los controles esperan mientras se cotiza el último cambio (frena
  los clics de más contra el límite de 60 por minuto); un 429 muestra el error con «Reintentar».
- El contador del header, sin sesión, suma las unidades del navegador sin llamar a la API.
- `LineaCarrito` recibe sus acciones por props: `LineaCuenta` (backend) y `LineaVisitante`
  (navegador), en `lineasCarrito.tsx`. Una línea sin cantidad ni subtotal no deja fila vacía.
- Pedidos al backend (SCRUM-44): declarar en el Swagger las respuestas de `cotizar` y `unir`
  (hoy sin esquema; tipos en `respuestas.ts`).
- Pendiente: comparar con Figma a 360/390 y 1440 px (los revisores no tuvieron el MCP de Figma)
  y probar en el navegador con una cuenta de cliente del backend local.
- PR: https://github.com/Contrum-Projects/Frontend/pull/40 (En revisión desde el 02-11-2026; sin capturas, falta probar en el navegador con una cuenta de cliente).
