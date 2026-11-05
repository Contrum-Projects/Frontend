# SCRUM-142 · E14-H1 · Reporte de objetivos OE1 a OE3

**Orden:** 51 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-74 · **API:** No

**Necesita antes (frontend):** [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito ver los indicadores de los objetivos en el panel, con la finalidad de saber si se cumplen las metas.

**Historia backend:** SCRUM-74 · **Figma:** P6 Reportes (objetivos)

## Criterios de aceptación

1. **Indicadores.** El administrador abre «Reportes». Cuando carga. Ve OE1, OE2 y OE3 con valor, meta (30 %, 70 % y 80 %), barra de avance y estado.
2. **Período.** El administrador cambia el filtro de período. Cuando aplica. Los indicadores se actualizan.
3. **Sin datos.** No hay registros en el período. Cuando se muestra. La pantalla lo indica en vez de un valor.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta              |
| ----------- | ---------- | --------- | ----------------- |
| P6 Reportes | 2041:1229  | 2042:1010 | `/panel/reportes` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 05-11-2026: **No**. SCRUM-74 no tiene endpoint en el backend (`src/modulos/reportes/`
solo trae ventas y stock bajo el mínimo). Se trabaja con la **API simulada**, con esta forma
propuesta a SCRUM-74 (falta acordarla con quien hace la historia backend):

```
GET /api/reportes/objetivos?desde=AAAA-MM-DD&hasta=AAAA-MM-DD     (permiso reportes.ver)
200 {
  desde, hasta,
  objetivos: [
    { codigo: 'OE1' | 'OE2' | 'OE3', meta: 30, porcentaje: 24 | null,
      cumplen: 41, total: 171, estado: 'sobre-la-meta' | 'bajo-la-meta' | 'sin-datos' }
  ]
}
400 con fechas inválidas o `hasta` antes de `desde` · 401 · 403
```

- El backend calcula `porcentaje` (0 a 100), entrega la `meta` y decide el `estado` (RNF-03).
  Sin registros en el período: `porcentaje: null`, `total: 0` y `estado: 'sin-datos'`.
- `cumplen` y `total`: OE1 cuentas con solicitud verificadas que compraron a precio mayorista,
  de las cuentas con solicitud; OE2 solicitudes resueltas dentro de 48 horas, de las resueltas;
  OE3 productos nuevos con la descripción de IA o IA editada, de los productos nuevos.
- Tipo en `compartido/api/respuestas.ts` (`ReporteObjetivos`, `IndicadorObjetivo`). Ruta simulada
  en `compartido/api/simulado/panelReportes.ts`.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**05-11-2026 · implementación**

- **Archivos:** `panel/reportes/objetivosDelPeriodo.tsx` (sección y esqueleto) y
  `panel/reportes/tarjetaObjetivo.tsx`, sobre las ventas en `/panel/reportes`. Usan el mismo
  selector de período y las fechas de `rangoDelPeriodo` (SCRUM-143): una consulta por período.
- **Escritorio** (Figma 2041:1309): tres tarjetas con valor, «meta N%», barra con la marca de la
  meta, estado y frase de detalle (textos de Figma con `cumplen` y `total`). **Celular**
  (2042:1043): una tarjeta con tres filas, sin la frase; OE2 dice «Verificaciones en 48 h».
- **Estado:** el frontend no compara el porcentaje con la meta: muestra el `estado` del backend.
  La barra es `role="meter"` y solo se dibuja con el porcentaje recibido.
- **Sin datos (criterio 3):** acordado con el usuario. «Sin datos en el período» en lugar del
  valor, la barra vacía con la marca de la meta, sin línea de estado y, en escritorio, una frase
  por objetivo («No hay cuentas con solicitud en el período.», etc.).
- **API simulada:** «Este mes» trae otros valores para ver el cambio de período, y un período que
  empieza en enero de 2026 trae todo sin datos.

**Para el backend (SCRUM-74)**

- Acordar y crear `GET /api/reportes/objetivos` con la forma de la sección «API», y declarar la
  respuesta 200 en el Swagger. Al llegar: `pnpm api:tipos`, borrar la ruta simulada, el cast
  `TODO(SCRUM-142)` de `consultasReportes.ts` y el tipo de `respuestas.ts`.

**Preguntas abiertas**

- ¿El período filtra por fecha de la solicitud (OE1 y OE2) y de creación del producto (OE3)?
  Lo define el backend.

**PR:** https://github.com/Contrum-Projects/Frontend/pull/66 (En revisión, 05-11-2026).
