'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  ListadoEntradas,
  UbicacionInventario,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_ENTRADAS = ['panel', 'inventario', 'entradas'] as const;
const CLAVE_UBICACIONES = ['panel', 'inventario', 'ubicaciones'] as const;

/** Filtros de la lista de entradas; vacíos, no se envían. Fechas AAAA-MM-DD. */
export interface FiltrosEntradas {
  bodegaId: string;
  buscar: string;
  desde: string;
  hasta: string;
}

export const FILTROS_VACIOS: FiltrosEntradas = {
  bodegaId: '',
  buscar: '',
  desde: '',
  hasta: '',
};

/**
 * TODO(SCRUM-111): GET /inventario/entradas y GET /inventario/ubicaciones aún no están en el
 * Swagger (API simulada, pedidos a SCRUM-37). Quitar el cast cuando `pnpm api:tipos` los traiga.
 */
const pedir = api.GET as unknown as (
  ruta: '/api/inventario/entradas' | '/api/inventario/ubicaciones',
  opciones?: { params: { query: Record<string, string> } },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/**
 * Entradas de inventario, de la más reciente a la más antigua (E11-H2 criterio 1). Pide
 * `inventario.registrar`. Al cambiar un filtro sigue a la vista el resultado anterior.
 */
export const useEntradas = (filtros: FiltrosEntradas) => {
  const query = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== ''),
  );
  return useQuery({
    queryKey: [...CLAVE_ENTRADAS, query],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoEntradas>(
          await pedir('/api/inventario/entradas', { params: { query } }),
        ),
      ),
    placeholderData: keepPreviousData,
  });
};

/** Ubicaciones activas donde se puede recibir mercadería, con su bodega. */
export const useUbicaciones = () =>
  useQuery({
    queryKey: CLAVE_UBICACIONES,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<UbicacionInventario[]>(
          await pedir('/api/inventario/ubicaciones'),
        ),
      ),
  });

/** «Bodega principal · A-01» */
export const nombreUbicacion = (ubicacion: {
  codigo: string;
  bodega: string | { nombre: string };
}) =>
  `${typeof ubicacion.bodega === 'string' ? ubicacion.bodega : ubicacion.bodega.nombre} · ${ubicacion.codigo}`;

/** Las bodegas de las ubicaciones, sin repetir y en el orden en que llegan. */
export const bodegasDe = (ubicaciones: UbicacionInventario[]) => [
  ...new Map(
    ubicaciones.map(({ bodega }) => [bodega.id, bodega] as const),
  ).values(),
];
