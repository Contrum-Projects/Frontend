'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DatosPersonales,
  DireccionCuenta,
  UbicacionOficial,
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

/**
 * TODO(SCRUM-97): regiones y comunas aún no están en el Swagger (las responde la API simulada,
 * compartido/api/simulado/ubicaciones.ts). Quitar el cast cuando el backend las publique.
 */
const leerUbicaciones = async (ruta: string) => {
  const get = api.GET as unknown as (
    ruta: string,
  ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
  return conErrorDeApi(async () => exigir<UbicacionOficial[]>(await get(ruta)));
};

/** La lista oficial no cambia: se pide una vez por visita. */
const UNA_VEZ = { staleTime: Infinity, gcTime: Infinity } as const;

export const useRegiones = () =>
  useQuery({
    queryKey: CLAVES_CUENTA.regiones,
    queryFn: () => leerUbicaciones('/api/ubicaciones/regiones'),
    ...UNA_VEZ,
  });

export const useComunas = (region: string) =>
  useQuery({
    queryKey: CLAVES_CUENTA.comunas(region),
    queryFn: () =>
      leerUbicaciones(
        `/api/ubicaciones/regiones/${encodeURIComponent(region)}/comunas`,
      ),
    enabled: region !== '',
    ...UNA_VEZ,
  });
