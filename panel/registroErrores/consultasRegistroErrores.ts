'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { components } from '@/compartido/api/esquema';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export type RegistroError = components['schemas']['RegistroErrorDto'];
export type ListadoRegistroErrores =
  components['schemas']['ListadoRegistroErroresDto'];
export type OrigenError = RegistroError['origen'];

/** Registro de errores (SCRUM-168). Solo el administrador: el backend responde 403 al resto. */
export const CLAVE_REGISTRO_ERRORES = ['panel', 'registro-errores'] as const;

export type FiltroOrigen = 'todos' | OrigenError;

export interface ConsultaRegistroErrores {
  origen: FiltroOrigen;
  buscar: string;
  /** AAAA-MM-DD o vacío. */
  desde: string;
  hasta: string;
  pagina: number;
}

/** Listado paginado. Mientras llega la página nueva, sigue a la vista la anterior. */
export const useRegistroErrores = ({
  origen,
  buscar,
  desde,
  hasta,
  pagina,
}: ConsultaRegistroErrores) =>
  useQuery({
    queryKey: [
      ...CLAVE_REGISTRO_ERRORES,
      { origen, buscar, desde, hasta, pagina },
    ],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/registros/errores', {
            params: {
              query: {
                ...(origen !== 'todos' && { origen }),
                ...(buscar && { buscar }),
                ...(desde && { desde }),
                ...(hasta && { hasta }),
                pagina,
              },
            },
          }),
        ),
      ),
    placeholderData: keepPreviousData,
  });
