# SCRUM-124 · E7-H3 · Seguimiento del despacho en el pedido

**Orden:** 35 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-52 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-129](SCRUM-129.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el estado y el código de seguimiento de mi despacho, con la finalidad de saber cuándo llegará.

**Historia backend:** SCRUM-52 · **Figma:** 07 Mis pedidos (detalle)

## Criterios de aceptación

1. **Envío registrado.** El pedido fue despachado. Cuando el cliente abre el detalle. Ve el servicio, el código de seguimiento y el estado del envío.
2. **Estado actualizado.** El estado del envío cambió. Cuando el cliente vuelve a abrir el detalle. Ve el estado más reciente.

## Pantalla y ruta

| Pantalla                 | Escritorio                                      | Celular           | Ruta                                          |
| ------------------------ | ----------------------------------------------- | ----------------- | --------------------------------------------- |
| 07 Mis pedidos y detalle | 2019:1396 · detalle 2019:1623 · vacío 2058:3544 | detalle 2019:2970 | `/cuenta/pedidos`, `/cuenta/pedidos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026: **Sí**, sin rutas simuladas. `GET /api/pedidos/{codigoPedido}` (E8-H1) trae
`envio` con `servicio`, `codigoSeguimiento`, `estado` y `fechaEstimada` (tipo `EnvioPedido` en
`compartido/api/respuestas.ts`, desde `mis-pedidos.service.ts` del backend; el Swagger aún no
declara la respuesta, ver TODO(SCRUM-118)).

- `envio.estado` (`ESTADOS_ENVIO`): `pendiente`, `en_transito`, `en_reparto`, `entregado`,
  `con_problema`. Al despachar, el personal ingresa el código y el envío queda `en_transito`.
- Una tarea del backend consulta Chilexpress cada 30 min y actualiza el estado (RNF-31); ver el
  pedido no llama al courier.

## Notas de trabajo

- **Estado del envío:** Figma (2019:1734) no lo muestra; se agregó como línea de texto
  «Estado del envío: En tránsito» bajo el código, con el estilo de la tarjeta (acordado el 04-11).
- **Textos de los estados:** el valor del backend con mayúscula inicial y tildes
  (`tienda/pedidos/estadoEnvio.ts`). Un estado desconocido se muestra tal como llega.
- **Sin código** (antes del despacho, `pendiente`): la tarjeta muestra solo servicio y dirección.
  Según el backend, `con_problema` siempre trae código, porque solo se llega a él volviendo a
  despachado, y ese cambio exige el código. Si eso cambia, la tarjeta no mostraría ese estado.
- Al volver a abrir el detalle, se ve un instante el estado guardado en caché hasta que llega el
  nuevo. Es el comportamiento normal de TanStack Query.
- **Celular:** como en Figma 2019:3052, «Chilexpress · Código X» en una línea; el estado va debajo.
- **Criterio 2:** el detalle usa `staleTime: 0`, así que al volver a abrirlo se pide de nuevo al
  backend (antes, la caché global de 30 s podía mostrar el estado anterior).
- **Pendiente:** `fechaEstimada` no se muestra (Figma no la incluye y hoy el backend no la llena al
  despachar). Si se quiere mostrar «cuándo llegará», hay que definirla con diseño y backend.
