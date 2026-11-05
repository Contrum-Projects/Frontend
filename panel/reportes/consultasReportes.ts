'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  FormatoBajoMinimo,
  ReporteCampanas,
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

type RutaSimulada = '/api/reportes/carritos' | '/api/reportes/campanas';

/**
 * TODO(SCRUM-144): `/api/reportes/carritos` y `/api/reportes/campanas` aún no están en el
 * Swagger (API simulada, pedida a SCRUM-76). Quitar el cast cuando `pnpm api:tipos` las traiga.
 */
const pedirReporteSimulado = api.GET as unknown as (
  ruta: RutaSimulada,
  opciones: { params: { query: Fechas } },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/** Carritos abandonados y recuperados por mes del período (E14-H3 criterio 1). */
export const useCarritosDelPeriodo = ({ desde, hasta }: Fechas) =>
  useQuery({
    queryKey: [...CLAVE_REPORTES, 'carritos', desde, hasta],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ReporteCarritos>(
          await pedirReporteSimulado('/api/reportes/carritos', {
            params: { query: { desde, hasta } },
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
        exigir<ReporteCampanas>(
          await pedirReporteSimulado('/api/reportes/campanas', {
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
