'use client';

import { useQueries } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import {
  CLAVES_CUENTA,
  conErrorDeApi,
  useRegiones,
} from '@/tienda/cuenta/consultasCuenta';
import type { Opcion } from './elegidas';

export interface UbicacionesSegmento {
  regiones: Opcion<string>[];
  /** Todas las comunas, con su región en el nombre («Santiago · Metropolitana»). */
  comunas: Opcion<string>[];
  cargando: boolean;
  error: string | null;
}

/**
 * Regiones y comunas para el filtro de ubicación (SCRUM-150), por su código CUT. Usa las mismas
 * consultas y caché que las direcciones de la cuenta: la lista oficial se pide una vez por visita.
 */
export const useUbicacionesSegmento = (): UbicacionesSegmento => {
  const regiones = useRegiones();
  const lista = regiones.data ?? [];
  const comunas = useQueries({
    queries: lista.map((region) => ({
      queryKey: CLAVES_CUENTA.comunas(region.codigoCut),
      queryFn: () =>
        conErrorDeApi(async () =>
          exigir(
            await api.GET('/api/territorio/regiones/{codigoCut}/comunas', {
              params: { path: { codigoCut: region.codigoCut } },
            }),
          ),
        ),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });
  const fallo = regiones.error ?? comunas.find((c) => c.error)?.error ?? null;

  return {
    regiones: lista.map(({ codigoCut, nombre }) => ({ id: codigoCut, nombre })),
    comunas: lista.flatMap((region, indice) =>
      (comunas[indice]?.data ?? []).map(({ codigoCut, nombre }) => ({
        id: codigoCut,
        nombre: `${nombre} · ${region.nombre}`,
      })),
    ),
    cargando: regiones.isPending || comunas.some((c) => c.isPending),
    error: fallo?.message ?? null,
  };
};
