import { z } from 'zod';
import type {
  EstadoSolicitudVerificacion,
  MotivoRevisionVerificacion,
} from '@/compartido/api/respuestas';

/**
 * Textos del motivo de la revisión manual (aprobados el 4-11-2026). Desde el 2 nov ya no hay OCR
 * ni puntaje: la solicitud va a revisión porque la consulta al SII no la aprobó.
 */
export const AVISO_MOTIVO: Record<
  MotivoRevisionVerificacion | 'sin_consulta',
  string
> = {
  sin_inicio_actividades:
    'El SII no muestra inicio de actividades para este RUT.',
  otro_giro: 'El SII no muestra el giro de peluquería (960200) para este RUT.',
  nombre_no_coincide:
    'El SII muestra el giro de peluquería, pero el nombre del contribuyente no coincide con el de la cuenta. Revisa los documentos.',
  no_disponible: 'No se pudo consultar al SII. Revisa los documentos.',
  sin_consulta: 'Esta solicitud no se consultó al SII.',
};

/** Versión corta para la lista de pendientes. */
export const MOTIVO_CORTO: Record<MotivoRevisionVerificacion, string> = {
  sin_inicio_actividades: 'Sin inicio de actividades',
  otro_giro: 'Otro giro',
  nombre_no_coincide: 'Nombre no coincide',
  no_disponible: 'SII no disponible',
};

export const avisoDeMotivo = (motivo: MotivoRevisionVerificacion | null) =>
  AVISO_MOTIVO[motivo ?? 'sin_consulta'];

export const TEXTO_ESTADO: Record<EstadoSolicitudVerificacion, string> = {
  pendiente: 'Faltan documentos',
  revision_manual: 'Revisión manual',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

/**
 * Lo que revisa el backend al rechazar (`rechazar-solicitud.dto.ts`, `TextoObligatorio`), con
 * sus mismos mensajes, solo para avisar antes de enviar. Aprobar no pide motivo.
 */
export const MINIMO_MOTIVO = 10;
export const MAXIMO_MOTIVO = 1000;

export const esquemaRechazo = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, 'El motivo del rechazo es obligatorio.')
    .min(
      MINIMO_MOTIVO,
      `El motivo del rechazo debe tener al menos ${MINIMO_MOTIVO} caracteres.`,
    )
    .max(
      MAXIMO_MOTIVO,
      `El motivo del rechazo no puede superar los ${MAXIMO_MOTIVO} caracteres.`,
    ),
});

export type FormularioRechazo = z.input<typeof esquemaRechazo>;
