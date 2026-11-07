'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DatosCupon,
  ListadoPacksPanel,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_CUPONES = ['panel', 'cupones'] as const;

const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/** Los cupones del más nuevo al más antiguo, con sus usos (SCRUM-150). */
export const useCupones = () =>
  useQuery({
    queryKey: [...CLAVE_CUPONES, 'lista'],
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(await api.GET('/api/marketing/cupones')),
      ),
  });

/** Un cupón para editarlo. Sin id (cupón nuevo) no se pide nada. */
export const useCupon = (id: number | null) =>
  useQuery({
    queryKey: [...CLAVE_CUPONES, 'detalle', id],
    enabled: id !== null,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/marketing/cupones/{id}', {
            params: { path: { id: id ?? 0 } },
          }),
        ),
      ),
  });

/** Crea (sin id) o edita el cupón; el backend valida y responde el cupón guardado. */
export const useGuardarCupon = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number | null; datos: DatosCupon }) =>
      conErrorDeApi(async () =>
        exigir(
          id
            ? await api.PATCH('/api/marketing/cupones/{id}', {
                params: { path: { id } },
                body: datos,
              })
            : await api.POST('/api/marketing/cupones', { body: datos }),
        ),
      ),
    onSuccess: (cupon) => {
      clienteConsultas.setQueryData(
        [...CLAVE_CUPONES, 'detalle', cupon.id],
        cupon,
      );
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_CUPONES, 'lista'],
      });
    },
  });
};

/** Los packs para elegirlos en un cupón: la página más grande que admite el backend. */
export const usePacksParaCupon = () =>
  useQuery({
    queryKey: [...CLAVE_CUPONES, 'packs'],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoPacksPanel>(
          await api.GET('/api/catalogo/packs', {
            params: { query: { pagina: 1, limite: 100 } },
          }),
        ),
      ),
  });
