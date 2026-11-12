# SCRUM-160 · E14-H5 · Botón «Exportar CSV» en el reporte de ventas

**Orden:** 55 de 55 · **Puntos:** sin estimar · **Historia backend:** SCRUM-159 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-143](SCRUM-143.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito un botón para descargar las ventas del período elegido pedido a pedido, con la finalidad de trabajarlas en una planilla.

**Historia backend:** SCRUM-159 · **Figma:** sin diseño (se usa el `Button` contorno del panel)

## Criterios de aceptación

1. **Descargar.** El administrador está en «Reportes» › ventas con un período elegido. Cuando presiona «Exportar CSV». Se descarga `ventas-<desde>-<hasta>.csv` del mismo período que muestra la pantalla.
2. **Mientras descarga.** El botón queda deshabilitado con indicador de carga hasta que termina.
3. **Error.** El backend responde un error (400, 401, 403). Cuando falla la descarga. La pantalla muestra el `message` del backend y no descarga nada.

## Pantalla y ruta

| Pantalla    | Ruta              | Dónde                                            |
| ----------- | ----------------- | ------------------------------------------------ |
| P6 Reportes | `/panel/reportes` | Cabecera de «Ventas por mes», junto a la leyenda |

## API

Estado al 11-11-2026: **Sí** (SCRUM-159, rama `SCRUM-159-exportar-ventas` del backend).

```
GET /api/reportes/ventas/exportar?desde=AAAA-MM-DD&hasta=AAAA-MM-DD     (permiso reportes.ver)
200 text/csv; charset=utf-8, attachment; filename="ventas-<desde>-<hasta>.csv"
    UTF-8 con BOM, separador «;», una fila por pedido pagado, sin datos personales
400 período inválido · 401 sin sesión · 403 sin permiso
```

La descarga va por `api` (token en memoria y proxy `/api/...`), no con un enlace directo.
