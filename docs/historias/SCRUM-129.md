# SCRUM-129 · E8-H1 · Mis pedidos y detalle del pedido

**Orden:** 34 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-57 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-124](SCRUM-124.md), [SCRUM-128](SCRUM-128.md)

Como un Cliente, necesito ver mis pedidos y su detalle, con la finalidad de hacer seguimiento a lo que compré.

**Historia backend:** SCRUM-57 · **Figma:** 07 Mis pedidos, 07b Mis pedidos vacío

## Criterios de aceptación

1. **Listado.** El cliente abre «Mis pedidos». Cuando carga. Ve fecha, total y estado de cada pedido.
2. **Detalle.** El cliente abre un pedido. Cuando carga. Ve artículos, montos, entrega y el historial de estados con fechas.
3. **Sin pedidos.** La cuenta es nueva. Cuando abre la pantalla. Ve el mensaje y el botón al catálogo.
4. **Sin acceso.** El pedido es de otra cuenta. Cuando el cliente abre el enlace. La pantalla indica que no existe.

## Pantalla y ruta

| Pantalla                 | Escritorio                                      | Celular           | Ruta                                          |
| ------------------------ | ----------------------------------------------- | ----------------- | --------------------------------------------- |
| 07 Mis pedidos y detalle | 2019:1396 · detalle 2019:1623 · vacío 2058:3544 | detalle 2019:2970 | `/cuenta/pedidos`, `/cuenta/pedidos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 4-11-2026: **Sí**. Endpoints reales, sin API simulada:

- `GET /api/pedidos?pagina=&limite=` → `{ items: ResumenPedido[], total, pagina, limite }`, del más
  reciente al más antiguo. `ResumenPedido`: `codigoPublico`, `fechaPedido`, `total` (con IVA) y
  `estado`.
- `GET /api/pedidos/{codigoPedido}` → `DetallePedidoCuenta` (artículos, montos, envío, documento,
  historial). Un pedido de otra cuenta responde 404, igual que uno que no existe.

El Swagger no declara ninguna de las dos respuestas: los tipos están en
`compartido/api/respuestas.ts`, tomados de `src/modulos/pedidos/mis-pedidos.service.ts`.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

### 4-11-2026 · Implementación

**Decisiones (con el usuario):**

- **Sin miniaturas en la lista.** Figma muestra las fotos de los productos de cada pedido, pero
  el listado no las trae. Leer el detalle de cada pedido solo para las fotos serían N llamadas.
- **Historial solo con lo ocurrido.** Figma muestra también los pasos futuros («Entregado» vacío).
  El frontend no los deduce: la secuencia de estados es regla del backend (y aún es PROPUESTA en
  `transiciones-estado-pedido.ts`). Se muestran todos los cambios del historial, incluido
  «Pendiente de pago».
- **Montos: Despacho y Total.** Figma tiene además «Productos», pero la API no entrega ese
  subtotal y el frontend no calcula montos (RNF-03).
- La tarjeta **Pago** («Pagado el …») toma la fecha del cambio a «pagado» del historial; si el
  pedido no se ha pagado, no aparece.
- Retiro en tienda: tarjeta «Entrega» con «Retiro en tienda» (la API no entrega la dirección de
  la tienda).
- Quedan para otras historias: código y estado del envío (SCRUM-124) y la tarjeta «Documento»
  con la descarga (SCRUM-128).
- Etiquetas de estado: las de `ETIQUETAS_ESTADO` del backend, con mayúscula inicial. Insignias:
  en curso en acento suave; entregado, retirado y cancelado en hueso oscuro (como Figma);
  pendiente de pago con los colores de aviso (no está en Figma).
- «Cargar más pedidos» (botón de contorno) pide la página siguiente; no está en Figma.
- `DisenoCuenta` envuelve el menú y la protección en `<Suspense>`: leen `usePathname` y, con
  Cache Components, el build falla en la ruta dinámica `/cuenta/pedidos/[codigo]` sin ese límite.

**Textos que no están en Figma (revisar):** «No encontramos este pedido» / «Revisa el enlace o
busca el pedido en Mis pedidos.» / «Ir a Mis pedidos» (criterio 4), «Cargar más pedidos»,
«Entrega» / «Retiro en tienda».

**Pedir al backend (SCRUM-57):**

- Declarar en el Swagger las respuestas de `GET /api/pedidos` y `GET /api/pedidos/{codigoPedido}`.
- Agregar al listado las imágenes de los artículos (p. ej. `imagenes: string[]`, hasta 3) para
  las miniaturas de Figma.
- Agregar `montos.productos` (suma de los artículos con IVA) para la línea «Productos».
