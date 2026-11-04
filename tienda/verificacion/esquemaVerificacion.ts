import { z } from 'zod';
import type { TipoDocumentoVerificacion } from '@/compartido/api/respuestas';

/**
 * Límites de POST /api/verificaciones/yo/documentos (E10-H2, backend
 * `subida-antecedentes.interceptor.ts`). Se repiten solo para avisar antes de enviar: el backend
 * vuelve a validar y reconoce el formato por el contenido, no por el nombre.
 */
export const MAXIMO_DOCUMENTOS = 5;
export const MAXIMO_BYTES = 5 * 1024 * 1024;
const FORMATOS = ['application/pdf', 'image/jpeg', 'image/png'];
export const ACEPTA =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

export const TIPOS_DOCUMENTO: {
  valor: TipoDocumentoVerificacion;
  texto: string;
}[] = [
  { valor: 'titulo', texto: 'Título' },
  { valor: 'certificado', texto: 'Certificado o curso' },
  { valor: 'otro', texto: 'Otro' },
];

export const textoTipoDocumento = (tipo: string) =>
  TIPOS_DOCUMENTO.find(({ valor }) => valor === tipo)?.texto ?? 'Documento';

/** Por qué no se puede agregar un archivo, o `null` si se puede. */
export const problemaDeArchivo = (archivo: File): string | null => {
  if (!FORMATOS.includes(archivo.type))
    return `«${archivo.name}» no es PDF, JPG ni PNG.`;
  if (archivo.size > MAXIMO_BYTES) return `«${archivo.name}» supera los 5 MB.`;
  return null;
};

export const esquemaVerificacion = z.object({
  documentos: z
    .array(
      z.object({
        archivo: z.instanceof(File),
        // Sin elegir queda '': el formulario lo pide antes de enviar
        tipo: z
          .enum(['', 'titulo', 'certificado', 'otro'])
          .refine((tipo) => tipo !== '', 'Elige qué documento es.')
          .transform((tipo) => tipo as TipoDocumentoVerificacion),
      }),
    )
    .min(1, 'Adjunta al menos un documento.')
    .max(
      MAXIMO_DOCUMENTOS,
      `Puedes subir hasta ${MAXIMO_DOCUMENTOS} documentos.`,
    ),
});

export interface ValoresVerificacion {
  documentos: { archivo: File; tipo: TipoDocumentoVerificacion | '' }[];
}

export type SalidaVerificacion = z.output<typeof esquemaVerificacion>;

const tamano = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

/** 1 234 567 bytes → «1,2 MB»; menos de 1 MB → «245 KB». */
export const formatearTamano = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${tamano.format(bytes / (1024 * 1024))} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
