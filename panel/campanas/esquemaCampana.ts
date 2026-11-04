import { z } from 'zod';
import type { DatosCampana } from '@/compartido/api/respuestas';

/**
 * Solo avisa antes de pedir al backend lo que falta; los largos máximos y si el segmento sirve
 * los decide el backend (SCRUM-70) y su mensaje queda junto al campo.
 */
export const esquemaCampana = z.object({
  asunto: z.string().trim().min(1, 'Escribe el asunto.'),
  cuerpo: z.string().trim().min(1, 'Escribe el mensaje.'),
  segmento: z.object({
    tipo: z.string().min(1, 'Elige a quién le llega.'),
    criterios: z.array(z.object({ clave: z.string(), valor: z.string() })),
  }),
}) satisfies z.ZodType<DatosCampana>;

export type FormularioCampana = z.infer<typeof esquemaCampana>;

export const CAMPANA_VACIA: FormularioCampana = {
  asunto: '',
  cuerpo: '',
  segmento: { tipo: '', criterios: [] },
};

export type CampoCampana = 'asunto' | 'cuerpo' | 'segmento.tipo';

/** A qué campo va un mensaje 400 del backend; `null` si es general. */
export const campoDelError = (mensaje: string): CampoCampana | null => {
  const texto = mensaje.toLowerCase();
  if (texto.includes('asunto')) return 'asunto';
  if (texto.includes('mensaje') || texto.includes('cuerpo')) return 'cuerpo';
  if (texto.includes('segmento') || texto.includes('destinatario')) {
    return 'segmento.tipo';
  }
  return null;
};
