'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  SolicitudVerificacionCuenta,
  TipoDocumentoVerificacion,
} from '@/compartido/api/respuestas';
import { renovarSesion } from '@/compartido/sesion/almacen';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/**
 * Verificación profesional de la cuenta (E10-H1, E10-H2) en el navegador. Son datos de la
 * cuenta: nunca se piden en el servidor (RNF-30).
 */
export const CLAVE_VERIFICACION = ['cuenta', 'verificacion'] as const;

/** La solicitud más reciente; `null` si la cuenta nunca solicitó (404). */
export const useMiSolicitud = () =>
  useQuery({
    queryKey: CLAVE_VERIFICACION,
    queryFn: () =>
      conErrorDeApi(async () => {
        const respuesta = await api.GET('/api/verificaciones/yo');
        if (respuesta.response.status === 404) return null;
        return exigir<SolicitudVerificacionCuenta>(respuesta);
      }),
  });

export interface DocumentoElegido {
  archivo: File;
  tipo: TipoDocumentoVerificacion;
}

interface EnvioVerificacion {
  documentos: DocumentoElegido[];
  /**
   * `true` si ya hay una solicitud `pendiente` (el SII no la aprobó): solo faltan los documentos.
   * Si no, primero se solicita la verificación y se consulta al SII.
   */
  soloDocumentos: boolean;
}

const adjuntarDocumentos = async (documentos: DocumentoElegido[]) => {
  const datos = new FormData();
  for (const { archivo, tipo } of documentos) {
    datos.append('archivos', archivo);
    datos.append('tipos', tipo);
  }
  return exigir<SolicitudVerificacionCuenta>(
    await api.POST('/api/verificaciones/yo/documentos', {
      body: { archivos: [], tipos: [] },
      // openapi-fetch deja que el navegador ponga el Content-Type con su separador
      bodySerializer: () => datos,
    }),
  );
};

/**
 * «Enviar solicitud»: un botón, dos llamadas (decisión de SCRUM-134). Primero
 * POST /verificaciones consulta el RUT de la cuenta en el SII; si lo aprueba, la cuenta ya es
 * profesional y los documentos no se suben. Si queda `pendiente`, se adjuntan los documentos y
 * pasa a revisión del personal.
 */
export const useEnviarVerificacion = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ documentos, soloDocumentos }: EnvioVerificacion) =>
      conErrorDeApi(async () => {
        if (!soloDocumentos) {
          const solicitud = exigir<SolicitudVerificacionCuenta>(
            await api.POST('/api/verificaciones'),
          );
          if (solicitud.estado === 'aprobada') {
            // E10-H4: el token nuevo trae el rol profesional y la tienda muestra el mayorista
            await renovarSesion();
            return solicitud;
          }
        }
        return adjuntarDocumentos(documentos);
      }),
    onSuccess: (solicitud) =>
      clienteConsultas.setQueryData(CLAVE_VERIFICACION, solicitud),
    // Si fallan los documentos, la solicitud ya quedó `pendiente`: la pantalla debe saberlo
    onError: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_VERIFICACION }),
  });
};
