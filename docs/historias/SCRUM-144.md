# SCRUM-144 · E14-H3 · Reporte de carritos y campañas

**Orden:** 52 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-76 · **API:** No

**Necesita antes (frontend):** [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito ver carritos abandonados y resultados de campañas, con la finalidad de evaluar el marketing.

**Historia backend:** SCRUM-76 · **Figma:** P6 Reportes (carritos y campañas)

## Criterios de aceptación

1. **Carritos.** El administrador abre «Reportes». Cuando carga. Ve por mes los carritos abandonados y los recuperados.
2. **Campañas.** Existe una campaña enviada. Cuando el administrador la consulta. Ve enviados, abiertos, con clic, rebotados, cancelados y fallidos; en celular, la última campaña desde la pestaña «Más».

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta              |
| ----------- | ---------- | --------- | ----------------- |
| P6 Reportes | 2041:1229  | 2042:1010 | `/panel/reportes` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 05-11-2026: **No**. SCRUM-76 no tiene endpoints en el backend (`src/modulos/reportes/`
solo trae ventas y stock bajo el mínimo; SCRUM-71 dejó los recordatorios de carrito sin rutas). Se
trabaja con la **API simulada**, con esta forma propuesta a SCRUM-76 (falta acordarla con quien
hace la historia backend):

```
GET /api/reportes/carritos?desde=AAAA-MM-DD&hasta=AAAA-MM-DD     (permiso reportes.ver)
200 {
  desde, hasta,
  meses: [ { mes: 'AAAA-MM', abandonados: 110, recuperados: 27, porcentajeRecuperados: 25 | null } ]
}

GET /api/reportes/campanas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD     (permiso reportes.ver)
200 {
  desde, hasta,
  campanas: [
    { codigo, nombre, automatica: false, fecha: ISO 8601 | 'AAAA-MM', segmento: 'Profesionales' | null,
      enviados, porcentajeAbiertos: 41 | null, porcentajeClic: 9 | null,
      rebotados, cancelados, fallidos }
  ]
}
400 con fechas inválidas o `hasta` antes de `desde` · 401 · 403
```

- **Carritos:** un elemento por mes del período, del más antiguo al más reciente, aunque esté en
  cero. Así basta una consulta (en ventas, el gráfico pide un mes por consulta). `abandonados`
  son los carritos que recibieron un recordatorio en el mes (NOTIFICACION `recordatorio_carrito`,
  E12-H4) y `recuperados`, los que de ellos terminaron en compra. El backend calcula
  `porcentajeRecuperados`; si no hubo abandonos, `null`.
- **Campañas:** las enviadas en el período, las más recientes primero, con los correos
  automáticos como filas (`automatica: true`: el saludo de cumpleaños de un mes, con `fecha`
  AAAA-MM y `segmento: null`). `cancelados` son los que no salieron porque al enviar ya no había
  consentimiento (estado `cancelada` de E12-H2). Los porcentajes los calcula el backend (RNF-03).
- Tipos en `compartido/api/respuestas.ts` (`ReporteCarritos`, `CarritosDelMes`,
  `ReporteCampanas`, `ResultadoCampana`). Rutas simuladas en
  `compartido/api/simulado/panelReportes.ts`.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**05-11-2026 · implementación**

- **Archivos:** `panel/reportes/carritosDelPeriodo.tsx`, `graficoCarritos.tsx`,
  `campanasDelPeriodo.tsx` y `cifra.tsx` (tarjeta y cifra comunes), bajo las ventas en
  `/panel/reportes`. Usan el mismo selector de período y `rangoDelPeriodo` (SCRUM-143).
- **Carritos, escritorio** (Figma 2041:1419): barras apiladas por mes, «Terminaron en compra»
  abajo y «Sin compra» encima. El alto de la barra son los abandonados. Bajo el gráfico va la
  frase del último mes. Cada mes trae su frase completa para el lector de pantalla.
  **Celular** (2042:1123): sin gráfico, solo las tres cifras del último mes.
- **Campañas, escritorio** (2041:1455): la tabla «Resultados de campañas». **Celular**
  (2042:1135): «Última campaña» y «Ver todas las campañas» (`/panel/campanas`); a Reportes se
  llega desde «Más».
- **Acordado con el usuario:**
  - Se agrega la columna **Cancelados** (la pide el criterio 2; Figma no la tiene).
  - En celular van las **seis cifras**, en una grilla de 3 × 2.
  - El saludo de cumpleaños va como fila automática («Agosto · Automático»).
  - Estados vacíos: «No hay campañas enviadas en el período.» y «No hay carritos abandonados en
    el período.» (el gráfico queda en cero). Sin porcentaje del backend se omite «(N%)» y en las
    cifras se muestra «–».
- **Diseño:**
  - Las dos tarjetas quedan lado a lado desde 1360 px (`min-[85rem]`). Con menos ancho, la tabla
    de campañas no cabe junto al menú lateral, así que van una sobre otra.
  - Las columnas de cifras miden 72 px, como en Figma, y el nombre de la campaña se ajusta en
    varias líneas.
  - Los rellenos usan la escala del proyecto (`lg:p-6`, como ventas) y no los 20 px de Figma.
  - «Sin compra» usa hueso oscuro, como en Figma (2041:1427). Ese color tiene poco contraste con
    la tarjeta. La cifra de cada mes está como texto para el lector de pantalla, pero en la
    pantalla solo se lee la del último mes. Si la clienta lo pide, se puede agregar el detalle
    al pasar el mouse, como en ventas.
- **API simulada:** un período que empieza en enero de 2026 trae todo en cero y sin campañas.
  «Este mes» trae solo la última campaña.

**Para el backend (SCRUM-76)**

- Acordar y crear `GET /api/reportes/carritos` y `GET /api/reportes/campanas` con la forma de la
  sección «API», y declarar sus respuestas 200 en el Swagger. Al llegar: `pnpm api:tipos`, borrar
  las rutas simuladas, el cast `TODO(SCRUM-144)` de `consultasReportes.ts` y los tipos de
  `respuestas.ts`.

**Preguntas abiertas**

- ¿Un carrito abandonado cuenta en el mes de su primer recordatorio? ¿Y «recuperado», si la
  compra llega en el mes siguiente? Lo define el backend.
- ¿Las aperturas y clics se cuentan sobre los enviados o sobre los entregados (sin rebotes)? Lo
  define el backend.

**PR:** https://github.com/Contrum-Projects/Frontend/pull/67 (En revisión, 05-11-2026).
