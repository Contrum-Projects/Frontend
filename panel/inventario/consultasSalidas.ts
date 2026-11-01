'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { StockFormato } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/** Todo el stock del panel: una salida la invalida completa. */
export const CLAVE_STOCK = ['panel', 'inventario', 'stock'] as const;

/**
 * Stock del formato en cada ubicación con unidades (GET /inventario/stock/formatos/{id}, E11-H5).
 * Sin formato elegido no pide nada. El stock no se guarda: se pide cada vez que se abre.
 */
export const useStockFormato = (formatoId: number | undefined) =>
  useQuery({
    queryKey: [...CLAVE_STOCK, 'formato', formatoId],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<StockFormato>(
          await api.GET('/api/inventario/stock/formatos/{id}', {
            params: { path: { id: formatoId! } },
          }),
        ),
      ),
    enabled: formatoId !== undefined,
    staleTime: 0,
  });
