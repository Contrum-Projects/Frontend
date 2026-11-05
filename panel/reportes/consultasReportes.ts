'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  ReporteObjetivos,
  ReporteVentas,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import type { MesDelPeriodo } from './periodos';

export const CLAVE_REPORTES = ['panel', 'reportes'] as const;

interface Fechas {
  desde: string;
  hasta: string;
}

const consultaVentas = ({ desde, hasta }: Fechas) => ({
  queryKey: [...CLAVE_REPORTES, 'ventas', desde, hasta],
  queryFn: () =>
    conErrorDeApi(async () =>
      // El Swagger no declara la respuesta (ver ReporteVentas en respuestas.ts)
      exigir<ReporteVentas>(
        await api.GET('/api/reportes/ventas', {
          params: { query: { desde, hasta } },
        }),
      ),
    ),
});

/** Resumen del período completo (E14-H2 criterio 1). */
export const useVentasDelPeriodo = (fechas: Fechas) =>
  useQuery(consultaVentas(fechas));

/**
 * Una consulta por mes para el gráfico: el endpoint entrega un solo total por período.
 * TODO(SCRUM-143): pasar a una sola consulta si el backend agrega el detalle por mes.
 */
export const useVentasPorMes = (meses: MesDelPeriodo[]) =>
  useQueries({ queries: meses.map(consultaVentas) });

/**
 * TODO(SCRUM-142): `/api/reportes/objetivos` aún no está en el Swagger (API simulada, pedida a
 * SCRUM-74). Quitar el cast cuando `pnpm api:tipos` la traiga.
 */
const pedirObjetivos = api.GET as unknown as (
  ruta: '/api/reportes/objetivos',
  opciones: { params: { query: Fechas } },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/** Indicadores OE1 a OE3 del período (E14-H1 criterios 1 y 2). */
export const useObjetivosDelPeriodo = ({ desde, hasta }: Fechas) =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'objetivos', desde, hasta],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ReporteObjetivos>(
          await pedirObjetivos('/api/reportes/objetivos', {
            params: { query: { desde, hasta } },
          }),
        ),
      ),
  });
