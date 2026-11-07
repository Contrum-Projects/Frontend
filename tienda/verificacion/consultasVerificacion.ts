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

const adjuntar = async (documentos: DocumentoElegido[]) => {
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
 * Paso 1 (E10-H1, flujo del 2 nov 2026): POST /verificaciones consulta en el SII el inicio de
 * actividades del RUT de la cuenta, sin documentos. Con el giro de peluquería la aprueba al
 * instante y la sesión se renueva para traer el rol profesional; si no, queda `pendiente` y la
 * pantalla pide los documentos.
 */
export const useSolicitarVerificacion = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: () =>
      conErrorDeApi(async () => {
        const solicitud = exigir<SolicitudVerificacionCuenta>(
          await api.POST('/api/verificaciones'),
        );
        // E10-H4: el token nuevo trae el rol profesional y la tienda muestra el mayorista
        if (solicitud.estado === 'aprobada') await renovarSesion();
        return solicitud;
      }),
    onSuccess: (solicitud) =>
      clienteConsultas.setQueryData(CLAVE_VERIFICACION, solicitud),
  });
};

/**
 * Paso 2 (E10-H2): con la solicitud `pendiente`, los documentos para que el personal la revise.
 * La solicitud pasa a `revision_manual`.
 */
export const useAdjuntarDocumentos = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (documentos: DocumentoElegido[]) =>
      conErrorDeApi(() => adjuntar(documentos)),
    onSuccess: (solicitud) =>
      clienteConsultas.setQueryData(CLAVE_VERIFICACION, solicitud),
  });
};
