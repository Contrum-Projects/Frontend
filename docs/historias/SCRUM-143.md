# SCRUM-143 · E14-H2 · Reporte de ventas

**Orden:** 50 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-75 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** [SCRUM-142](SCRUM-142.md), [SCRUM-144](SCRUM-144.md), [SCRUM-145](SCRUM-145.md)

Como un Administrador, necesito ver las ventas por período y tipo de cliente, con la finalidad de conocer el desempeño minorista y mayorista.

**Historia backend:** SCRUM-75 · **Figma:** P6 Reportes (ventas)

## Criterios de aceptación

1. **Ventas.** El administrador abre «Reportes». Cuando carga. Ve pedidos y montos por mes, separados por cliente y profesional, con un resumen.
2. **Sin ventas.** No hay pedidos en el período. Cuando se muestra. Los totales aparecen en cero.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta              |
| ----------- | ---------- | --------- | ----------------- |
| P6 Reportes | 2041:1229  | 2042:1010 | `/panel/reportes` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026: **Sí**. `GET /api/reportes/ventas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`
(SCRUM-75, `src/modulos/reportes/reporte-ventas.controller.ts`), solo con `reportes.ver`.

- Responde `{ desde, hasta, minorista, mayorista, total }`, cada uno con `pedidos`, `montoNeto`,
  `montoIva` y `montoTotal` en pesos. Cuenta los pedidos pagados (sin pendientes de pago ni
  cancelados), con el despacho incluido y los días en hora de Chile. Sin pedidos, todo en cero.
- 400 con fechas inválidas, `hasta` antes de `desde` o más de 366 días; 401 y 403.
- El Swagger no declara la respuesta 200: el tipo está en `compartido/api/respuestas.ts`
  (`ReporteVentas`, `TotalesVentas`).

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**04-11-2026 · implementación**

- **Ruta y archivos:** `/panel/reportes`, con los componentes en `panel/reportes/`. La página
  queda lista para sumar las tarjetas OE1–OE3 (SCRUM-142) y carritos y campañas (SCRUM-144).
- **Por mes:** el endpoint entrega un solo total por período. Se acordó con el usuario hacer
  una consulta por mes calendario (del día 1 al último, o hasta hoy en el mes en curso) más una
  del período completo para el resumen. El frontend solo arma las fechas
  (`panel/reportes/periodos.ts`): no suma montos ni pedidos.
- **Períodos:** «Este mes» y «Últimos 6 meses» (este último por defecto, como en Figma). «Desde
  el lanzamiento» queda **pendiente**: falta la fecha de lanzamiento, y el backend rechaza
  períodos de más de 366 días.
- **Gráfico:** barras hechas con Tailwind y los tokens `grafico-serie-1/2`, sin dependencias
  nuevas. Cliente = `minorista` y Profesional = `mayorista`. Los montos son `montoTotal` (con
  IVA), según la nota de Figma «Montos con IVA, de pedidos pagados.».
- **Detalle de cada mes:** en escritorio aparece al pasar el mouse o al enfocar el mes con el
  teclado. En celular, Figma no lo muestra: va solo para el lector de pantalla, porque no cabe
  junto a las barras (RNF-25).
- **Celular:** igual que Figma 2042:1010. El gráfico lleva «Total del período» debajo y no hay
  tarjeta de resumen por tipo de cliente.

**Para el backend (SCRUM-75)**

- Declarar la respuesta 200 en el Swagger, para quitar el tipo de `respuestas.ts`.
- Agregar el detalle por mes (por ejemplo, `meses: [{ mes: 'AAAA-MM', minorista, mayorista,
total }]`). Hoy «Últimos 6 meses» hace 7 peticiones; con el detalle sería una sola
  (`TODO(SCRUM-143)` en `consultasReportes.ts`).
- «Desde el lanzamiento» necesita la fecha de lanzamiento y un período de más de 366 días.

**Preguntas abiertas**

- Fecha de lanzamiento para «Desde el lanzamiento».
- En celular, ¿hace falta ver los montos de cada mes, por ejemplo tocando el mes? Figma no los
  muestra.
