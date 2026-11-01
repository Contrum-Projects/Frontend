'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  GrupoMovimientos,
  ListadoMovimientos,
  ListadoStock,
  StockFormato,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/**
 * Todo el stock del panel, movimientos incluidos: una entrada, salida, ajuste o transferencia
 * invalida todo con esta clave.
 */
export const CLAVE_STOCK = ['panel', 'inventario', 'stock'] as const;
const CLAVE_MOVIMIENTOS = [...CLAVE_STOCK, 'movimientos'] as const;

/** Filtros del stock; vacíos, no se envían. */
export interface FiltrosStock {
  bodegaId: string;
  buscar: string;
  bajoMinimo: boolean;
}

/** Filtros de los movimientos; vacíos, no se envían. Fechas AAAA-MM-DD. */
export interface FiltrosMovimientos {
  bodegaId: string;
  buscar: string;
  grupo: GrupoMovimientos | '';
  desde: string;
  hasta: string;
}

export const MOVIMIENTOS_SIN_FILTROS: FiltrosMovimientos = {
  bodegaId: '',
  buscar: '',
  grupo: '',
  desde: '',
  hasta: '',
};

/**
 * TODO(SCRUM-114): GET /inventario/stock y GET /inventario/movimientos aún no están en el
 * Swagger (API simulada, pedidos a SCRUM-40). Quitar el cast cuando `pnpm api:tipos` los traiga.
 */
const pedir = api.GET as unknown as (
  ruta: '/api/inventario/stock' | '/api/inventario/movimientos',
  opciones: { params: { query: Record<string, string> } },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/** Sin los filtros vacíos ni los falsos: no se envían. */
const consultaDe = (filtros: object) =>
  Object.fromEntries(
    Object.entries(filtros)
      .filter(([, valor]) => valor !== '' && valor !== false)
      .map(([clave, valor]) => [clave, String(valor)]),
  );

/**
 * Stock por formato en la bodega elegida, con último costo y proveedor (E11-H5 criterio 1). Al
 * cambiar un filtro sigue a la vista el resultado anterior. Con `habilitada` en falso no pide
 * nada (aún no se sabe si es celular o escritorio).
 */
export const useStock = (filtros: FiltrosStock, habilitada = true) => {
  const query = consultaDe(filtros);
  return useQuery({
    queryKey: [...CLAVE_STOCK, 'listado', query],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoStock>(
          await pedir('/api/inventario/stock', { params: { query } }),
        ),
      ),
    placeholderData: keepPreviousData,
    enabled: habilitada,
  });
};

/**
 * Stock del formato en cada ubicación con unidades y su última entrada (GET
 * /inventario/stock/formatos/{id}, SCRUM-40). Sin formato elegido no pide nada. El stock no se
 * guarda: se pide cada vez que se abre.
 */
export const useStockFormato = (formatoId: number | undefined) =>
  useQuery({
    queryKey: [...CLAVE_STOCK, 'formato', formatoId],
    queryFn: () =>
      conErrorDeApi(async () =>
        // El Swagger no declara la respuesta (ver StockFormato en respuestas.ts)
        exigir<StockFormato>(
          await api.GET('/api/inventario/stock/formatos/{id}', {
            params: { path: { id: formatoId! } },
          }),
        ),
      ),
    enabled: formatoId !== undefined,
    staleTime: 0,
  });

/**
 * Movimientos del más reciente al más antiguo (E11-H5 criterio 2). `limite` pide solo los
 * últimos; con `habilitada` en falso no pide nada.
 */
export const useMovimientos = (
  filtros: FiltrosMovimientos,
  { limite, habilitada = true }: { limite?: number; habilitada?: boolean } = {},
) => {
  const query = consultaDe({ ...filtros, limite: limite ?? '' });
  return useQuery({
    queryKey: [...CLAVE_MOVIMIENTOS, query],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoMovimientos>(
          await pedir('/api/inventario/movimientos', { params: { query } }),
        ),
      ),
    placeholderData: keepPreviousData,
    enabled: habilitada,
  });
};

/** El mismo corte que `lg:` de Tailwind. */
const ESCRITORIO = '(min-width: 64rem)';

const suscribir = (avisar: () => void) => {
  const consulta = window.matchMedia?.(ESCRITORIO);
  consulta?.addEventListener('change', avisar);
  return () => consulta?.removeEventListener('change', avisar);
};

/** `null` en el servidor: aún no se sabe el ancho de la pantalla. */
export const useEsEscritorio = () =>
  useSyncExternalStore<boolean | null>(
    suscribir,
    () => window.matchMedia?.(ESCRITORIO).matches ?? false,
    () => null,
  );
