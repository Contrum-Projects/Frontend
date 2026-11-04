'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DetalleVerificacion,
  EnlaceDocumentoVerificacion,
  ListadoSolicitudesEnRevision,
  SolicitudResuelta,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_VERIFICACIONES_PANEL = ['panel', 'verificaciones'] as const;

/** Lo que el backend acepta como `codigoPublico` (`ParseUUIDPipe`): otro valor no se envía. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const esCodigoCuenta = (valor: string) => UUID.test(valor);

/** El backend pagina con un máximo de 100 por página (`paginacion.ts`). */
const LIMITE_LISTA = 100;

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/**
 * E10-H3, criterio 1 · Las solicitudes en revisión manual, de la más antigua a la más reciente
 * (orden del backend). Con `habilitada` en falso no pide nada.
 */
export const useSolicitudesEnRevision = (habilitada = true) =>
  useQuery({
    queryKey: [...CLAVE_VERIFICACIONES_PANEL, 'lista'],
    enabled: habilitada,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoSolicitudesEnRevision>(
          await api.GET('/api/verificaciones/revision-manual', {
            params: { query: { pagina: 1, limite: LIMITE_LISTA } },
          }),
        ),
      ),
  });

/**
 * E10-H3, criterio 2 · La cuenta, su solicitud más reciente con la consulta al SII y sus
 * documentos. Con un código que no es UUID no se consulta.
 */
export const useDetalleVerificacion = (codigoPublico: string) =>
  useQuery({
    queryKey: [...CLAVE_VERIFICACIONES_PANEL, 'detalle', codigoPublico],
    enabled: esCodigoCuenta(codigoPublico),
    // Otra persona del personal puede haberla resuelto: se pide cada vez que se abre
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DetalleVerificacion>(
          await api.GET('/api/verificaciones/{codigoPublico}', {
            params: { path: { codigoPublico } },
          }),
        ),
      ),
  });

/**
 * E10-H3, criterio 2 · Abre un documento en otra pestaña. El enlace firmado vence en 60 s, así
 * que se pide al hacer clic y no se guarda. La pestaña se abre en el mismo clic (si se abriera
 * después de la respuesta, el navegador la bloquearía) y se cierra si el backend no da el
 * enlace; un 410 trae la fecha en que se eliminó el archivo. Si el navegador bloquea la pestaña,
 * el panel no navega al archivo: se pide permitir las ventanas emergentes.
 */
export const useAbrirDocumento = (codigoPublico: string) =>
  useMutation({
    mutationFn: async (numero: number) => {
      const pestana = window.open('', '_blank');
      if (!pestana) throw new Error(VENTANA_BLOQUEADA);
      // El enlace es de otro sitio: no debe poder volver a esta página
      pestana.opener = null;
      try {
        const enlace = await conErrorDeApi(async () =>
          exigir<EnlaceDocumentoVerificacion>(
            await api.GET(
              '/api/verificaciones/{codigoPublico}/documentos/{numero}',
              { params: { path: { codigoPublico, numero } } },
            ),
          ),
        );
        // La pestaña comparte el origen de la tienda: solo se navega a un enlace https
        if (!esEnlaceSeguro(enlace.url)) throw errorDeApi(undefined);
        pestana.location.href = enlace.url;
      } catch (error) {
        pestana.close();
        throw error;
      }
    },
  });

export const VENTANA_BLOQUEADA =
  'Permite las ventanas emergentes para abrir el documento.';

const esEnlaceSeguro = (url: string) => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

export type Decision =
  { tipo: 'aprobar' } | { tipo: 'rechazar'; motivo: string };

/**
 * E10-H3, criterio 3 · Aprueba o rechaza con motivo la solicitud en revisión manual. Después
 * vuelven a pedirse la lista (la solicitud sale) y el detalle (queda resuelta). También si falla:
 * un 409 puede decir que otra persona ya la resolvió.
 */
export const useResolverSolicitud = (codigoPublico: string) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (decision: Decision) =>
      conErrorDeApi(async () => {
        const parametros = { params: { path: { codigoPublico } } };
        if (decision.tipo === 'aprobar') {
          return exigir<SolicitudResuelta>(
            await api.POST(
              '/api/verificaciones/{codigoPublico}/aprobar',
              parametros,
            ),
          );
        }
        return exigir<SolicitudResuelta>(
          await api.POST('/api/verificaciones/{codigoPublico}/rechazar', {
            ...parametros,
            body: { motivo: decision.motivo },
          }),
        );
      }),
    onSettled: () =>
      clienteConsultas.invalidateQueries({
        queryKey: CLAVE_VERIFICACIONES_PANEL,
      }),
  });
};
