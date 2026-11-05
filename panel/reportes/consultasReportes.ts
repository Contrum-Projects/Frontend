'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { ReporteVentas } from '@/compartido/api/respuestas';
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
