'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  FormatoBajoMinimo,
  ReporteCarritos,
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

/** Indicadores OE1 a OE3 del período (E14-H1 criterios 1 y 2). */
export const useObjetivosDelPeriodo = ({ desde, hasta }: Fechas) =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'objetivos', desde, hasta],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ReporteObjetivos>(
          await api.GET('/api/reportes/indicadores', {
            params: { query: { desde, hasta } },
          }),
        ),
      ),
  });

/**
 * Carritos abandonados y recuperados por mes del período (E14-H3 criterio 1). El backend recibe
 * meses (AAAA-MM): los del primer y el último día del período.
 */
export const useCarritosDelPeriodo = ({ desde, hasta }: Fechas) =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'carritos', desde, hasta],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ReporteCarritos>(
          await api.GET('/api/reportes/carritos-abandonados', {
            params: {
              query: { desde: desde.slice(0, 7), hasta: hasta.slice(0, 7) },
            },
          }),
        ),
      ),
  });

/** Resultados de las campañas enviadas en el período (E14-H3 criterio 2). */
export const useCampanasDelPeriodo = ({ desde, hasta }: Fechas) =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'campanas', desde, hasta],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/reportes/campanas', {
            params: { query: { desde, hasta } },
          }),
        ),
      ),
  });

/**
 * Formatos bajo su stock mínimo, del que más falta al que menos (E14-H4). No depende del
 * período: es el stock de ahora.
 */
export const useReporteStockBajo = () =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'stock-bajo-minimo'],
    queryFn: () =>
      conErrorDeApi(async () =>
        // El Swagger no declara la respuesta (ver FormatoBajoMinimo en respuestas.ts)
        exigir<FormatoBajoMinimo[]>(
          await api.GET('/api/reportes/stock-bajo-minimo'),
        ),
      ),
  });
