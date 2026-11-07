# SCRUM-130 · E8-H2 · Panel de pedidos: cambio de estado

**Orden:** 37 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-58 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-131](SCRUM-131.md), [SCRUM-127](SCRUM-127.md)

Como Personal de tienda, necesito gestionar pedidos desde el panel, con la finalidad de hacerlos avanzar y mantener informado al cliente.

**Historia backend:** SCRUM-58 · **Figma:** P2 Pedidos

## Criterios de aceptación

1. **Lista y detalle.** El personal abre «Pedidos». Cuando carga. Ve la tabla con filtro por estado y el detalle al lado (escritorio) o en una pantalla aparte (celular).
2. **Cambiar estado.** El pedido está pagado. Cuando el personal elige un estado nuevo y un comentario opcional. El historial muestra el cambio con fecha y quién lo hizo.
3. **Pedido para retiro.** El pedido es de retiro. Cuando el personal lo marca «listo para retiro». La pantalla ofrece después «retirado».

## Pantalla y ruta

| Pantalla   | Escritorio | Celular                     | Ruta                                        |
| ---------- | ---------- | --------------------------- | ------------------------------------------- |
| P2 Pedidos | 2028:725   | 2023:336 · detalle 2024:333 | `/panel/pedidos`, `/panel/pedidos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026 (`pnpm api:tipos` contra el backend local): **Parcial**.

**Real:** `POST /api/pedidos/{codigoPedido}/estado` (`CambiarEstadoPedidoController`, permiso
`pedidos.gestionar`). Cuerpo `{ estado, comentario?, codigoSeguimiento? }`; responde
`{ codigoPublico, estado }`. 400 si falta el comentario al volver atrás o el código al despachar;
409 si el cambio no está permitido desde el estado actual. La secuencia vive en el backend
(`transiciones-estado-pedido.ts`).

**Falta (se simula, forma propuesta a SCRUM-58, por confirmar):** `GET /api/pedidos` y
`GET /api/pedidos/{codigo}` son solo de la cuenta del cliente. El panel necesita:

`GET /api/gestion/pedidos?grupo=&q=&pagina=&limite=` (permiso `pedidos.gestionar`). `q` busca
por pedido, producto o cliente; qué coincide lo decide el backend.

```ts
interface ListadoPedidosGestion {
  items: {
    codigoPublico: string;
    fechaPedido: string; // ISO 8601
    cliente: string; // nombre o razón social
    tipoEntrega: 'despacho' | 'retiro';
    estado: string;
    total: number; // con IVA
    unidades: number; // suma de las cantidades (tarjeta de celular)
  }[];
  total: number;
  pagina: number;
  limite: number;
  // Los grupos del filtro con su conteo: qué estados entran en cada uno lo decide el backend
  grupos: { clave: string; nombre: string; cantidad: number | null }[];
  // El grupo aplicado; sin `grupo` en la consulta, el que el backend elige por defecto
  grupo: string;
}
```

`GET /api/gestion/pedidos/{codigoPedido}`: lo mismo que `DetallePedidoCuenta` (cambiando el
historial) más el cliente y los cambios que se pueden hacer:

```ts
interface DetallePedidoGestion {
  cliente: { nombre: string; correo: string; telefono: string | null };
  historial: {
    estado: string;
    fecha: string;
    comentario: string | null;
    realizadoPor: string; // «Sistema», «Cliente» o el nombre del personal
  }[];
  // Desde el estado actual, según transiciones-estado-pedido.ts; vacío si ya no cambia
  cambiosPermitidos: {
    estado: string;
    sentido: 'avance' | 'retroceso';
    pideCodigoSeguimiento: boolean; // al despachar (E7-H3)
    avisaAlCliente: boolean; // ESTADOS_CON_AVISO
  }[];
}
```

Errores: 401, 403 (sin `pedidos.gestionar`), 404 (el pedido no existe).

## Notas de trabajo

**PR:** https://github.com/Contrum-Projects/Frontend/pull/52 (En revisión; lista y detalle con API simulada).

**04-11-2026 · implementación (rama `SCRUM-130-panel-pedidos`)**

- **Rutas:** `app/panel/pedidos/layout.tsx` monta la lista (`panel/pedidos/disenoPedidos.tsx`), así
  el filtro y la búsqueda siguen al cambiar de pedido. `/panel/pedidos` muestra en escritorio
  «Elige un pedido para ver su detalle.»; `/panel/pedidos/[codigo]` pone el detalle al lado
  (escritorio) o solo el detalle con «← Pedidos» (celular, sin pedir la lista).
  `[codigo]` lleva `instant = false`, como `/panel/productos/[id]`.
- **Decisiones del usuario (04-11):** la forma simulada de arriba sin acordar aún con SCRUM-58;
  los grupos del filtro (y cuál va por defecto) los entrega el backend; la búsqueda va como `q`.
- **La secuencia no está en el frontend:** el selector solo ofrece `cambiosPermitidos`. Un
  retroceso se muestra «Volver a Pagado» y pide comentario; `pideCodigoSeguimiento` agrega el
  campo de la OT de Chilexpress (E7-H3); el botón dice «Guardar y avisar al cliente» solo con
  `avisaAlCliente`, si no «Guardar». El esquema zod repite las reglas del DTO solo para avisar
  antes de enviar, con los mismos mensajes; los 400 y 409 del backend quedan junto a su campo
  (comentario, código) o arriba del formulario.
- **Historial:** del más reciente al más antiguo, como en Figma, con fecha, `realizadoPor` y el
  comentario.
- **Tarjeta de celular:** Figma mezcla «2 productos» y «11 unidades»; se usa «N unidades»
  (`unidades` del backend).
- **API simulada (`compartido/api/simulado/panelPedidos.ts`):** `GET /gestion/pedidos` y
  `GET /gestion/pedidos/:codigo` con pedidos fijos (`PAGADODESP01`, `PREPRETIRO01`,
  `LISTORETIR01`, `DESPACHADO01`, `PENDPAGO0001`). El `POST …/estado` real se simula solo para
  esos códigos (el backend no los conoce) y el detalle no cambia; los demás códigos van al backend.
- **Para el backend (SCRUM-58):** crear los dos GET del panel con la forma de arriba, incluir
  `cambiosPermitidos` (sale de `sentidoDelCambio` y `ESTADOS_CON_AVISO`) y declarar en el
  Swagger la respuesta de `POST /pedidos/{codigoPedido}/estado` (`PedidoConNuevoEstado`).
- **Revisiones (04-11):** sin hallazgos de seguridad explotables (la ruta simulada del POST ahora
  responde 400/409 como el backend). Diseño: cabecera del detalle con `flex-wrap` para 360 px,
  foco de enlaces con `marca-profundo`, radios `rounded-lg` (radio/m) y espaciados de la escala;
  en escritorio bajo 1280 px la tabla oculta Fecha y Entrega para caber junto al detalle. La
  revisión de diseño no pudo abrir Figma: falta compararla en el navegador.
- **Preguntas para SCRUM-58:** ¿se agrega `pideComentario` a `CambioPermitido` (hoy el frontend
  lo deduce de `sentido: 'retroceso'`) y los errores con su campo, para no reconocerlos por el
  texto? ¿La lista pagina? Hoy muestra la primera página y avisa «Se muestran X de Y».
- **Pendiente:** probar la pantalla con sesión del personal en el navegador (1440 y 360 px) y,
  cuando lleguen los endpoints, borrar las rutas simuladas y el cast de `consultasPedidos.ts`.
  SCRUM-127 (`/panel/pedidos/facturas`) quedará dentro de este layout y chocará con `[codigo]`:
  decidir allí si va fuera de él.

**06-11-2026 (SCRUM-150):** el backend entrega `GET /api/gestion/pedidos` y `GET /api/gestion/pedidos/{codigoPedido}` con la forma de arriba, más `sePuedeCancelar`. Grupos (decisión del 6 nov): por preparar (pagado y en preparación, por defecto), listos para retiro, despachados, pendientes de pago y todos; solo los dos primeros con conteo. `q` busca en código, cliente, razón social y productos. La lista pagina (`pagina`, `limite`). Se borraron `simulado/panelPedidos.ts` y el cast de `consultasPedidos.ts`. Falta probar con el backend real. `CambioPermitido` trae `pideComentario` y las respuestas están tipadas en el Swagger.
