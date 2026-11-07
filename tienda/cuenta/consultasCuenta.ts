'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DatosFacturacionCuenta,
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
  facturacion: ['cuenta', 'facturacion'] as const,
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

/** La consulta de los datos de la cuenta: la comparten «Mis datos» y las ofertas (E12-H2). */
export const consultaMisDatos = {
  queryKey: CLAVES_CUENTA.datos,
  queryFn: () =>
    conErrorDeApi(async () =>
      exigir<DatosPersonales>(await api.GET('/api/cuentas/yo')),
    ),
};

export const useMisDatos = () => useQuery(consultaMisDatos);

/** `activa: false` no pide la lista (por ejemplo, el personal de tienda en el checkout). */
export const useDirecciones = ({ activa = true }: { activa?: boolean } = {}) =>
  useQuery({
    queryKey: CLAVES_CUENTA.direcciones,
    enabled: activa,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DireccionCuenta[]>(await api.GET('/api/cuentas/yo/direcciones')),
      ),
  });

/**
 * E9-H2 · Los registros activos, del más antiguo al más reciente (orden del backend).
 * `activa: false` no pide la lista (en el checkout, hasta que se pide factura).
 */
export const useDatosFacturacion = ({
  activa = true,
}: { activa?: boolean } = {}) =>
  useQuery({
    queryKey: CLAVES_CUENTA.facturacion,
    enabled: activa,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DatosFacturacionCuenta[]>(
          await api.GET('/api/cuentas/yo/facturacion'),
        ),
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
