'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DatosPersonales,
  DireccionCuenta,
} from '@/compartido/api/respuestas';

/**
 * Lecturas de «Mi cuenta» (E1-H5) en el navegador. Son datos de la cuenta: nunca se piden en el
 * servidor ni se guardan en caché compartida (RNF-30). Cerrar sesión vacía la caché.
 */
export const CLAVES_CUENTA = {
  datos: ['cuenta', 'datos'] as const,
  direcciones: ['cuenta', 'direcciones'] as const,
  regiones: ['ubicaciones', 'regiones'] as const,
  comunas: (region: string) => ['ubicaciones', 'comunas', region] as const,
};

/**
 * Sin conexión, fetch lanza TypeError («Failed to fetch»): se convierte en el mensaje genérico
 * para que la pantalla nunca muestre el error técnico.
 */
export const conErrorDeApi = async <T>(pedir: () => Promise<T>): Promise<T> => {
  try {
    return await pedir();
  } catch (error) {
    throw error instanceof ErrorDeApi ? error : errorDeApi(undefined);
  }
};

export const useMisDatos = () =>
  useQuery({
    queryKey: CLAVES_CUENTA.datos,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DatosPersonales>(await api.GET('/api/cuentas/yo')),
      ),
  });

export const useDirecciones = () =>
  useQuery({
    queryKey: CLAVES_CUENTA.direcciones,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DireccionCuenta[]>(await api.GET('/api/cuentas/yo/direcciones')),
      ),
  });

/** La lista oficial no cambia: se pide una vez por visita. */
const UNA_VEZ = { staleTime: Infinity, gcTime: Infinity } as const;

export const useRegiones = () =>
  useQuery({
    queryKey: CLAVES_CUENTA.regiones,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(await api.GET('/api/territorio/regiones')),
      ),
    ...UNA_VEZ,
  });

export const useComunas = (region: string) =>
  useQuery({
    queryKey: CLAVES_CUENTA.comunas(region),
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/territorio/regiones/{codigoCut}/comunas', {
            params: { path: { codigoCut: region } },
          }),
        ),
      ),
    enabled: region !== '',
    ...UNA_VEZ,
  });
