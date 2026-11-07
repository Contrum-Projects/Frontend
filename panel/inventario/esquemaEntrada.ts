import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type {
  FormatoParaPack,
  TipoDocumentoProveedor,
} from '@/compartido/api/respuestas';

type CuerpoEntrada = components['schemas']['CrearEntradaDto'];

/** Lo que se muestra de un formato recibido; el backend solo recibe su id. */
export type FormatoRecibido = Omit<FormatoParaPack, 'canalVenta'>;

export const TIPOS_DOCUMENTO: {
  valor: TipoDocumentoProveedor;
  texto: string;
}[] = [
  { valor: 'factura', texto: 'Factura' },
  { valor: 'guia_despacho', texto: 'Guía de despacho' },
];

/** «Factura F-10452», «Guía G-877». */
export const textoDocumento = ({
  tipoDocumento,
  numeroDocumento,
}: {
  tipoDocumento: TipoDocumentoProveedor;
  numeroDocumento: string;
}) => `${tipoDocumento === 'factura' ? 'Factura' : 'Guía'} ${numeroDocumento}`;

const esEntero = (valor: string) => /^\d+$/.test(valor) && Number(valor) >= 1;
/** Hasta dos decimales, con punto o coma. */
const esCosto = (valor: string) => /^\d+([.,]\d{1,2})?$/.test(valor);
const aNumero = (valor: string) => Number(valor.replace(',', '.'));

/**
 * «Nueva entrada de inventario» (E11-H2). Repite las reglas de CrearEntradaDto del backend
 * (src/modulos/inventario/dto/crear-entrada.dto.ts) solo para avisar antes de enviar; el
 * backend vuelve a validar (fecha futura, proveedor o ubicación desactivados, documento repetido).
 */
export const esquemaEntrada = z.object({
  proveedorId: z.string().min(1, 'El proveedor es obligatorio.'),
  fechaRecepcion: z.string().min(1, 'La fecha de recepción es obligatoria.'),
  tipoDocumento: z.string().min(1, 'Elige si es factura o guía de despacho.'),
  numeroDocumento: z
    .string()
    .trim()
    .min(1, 'El número de documento es obligatorio.')
    .max(50, 'El número de documento no puede superar los 50 caracteres.'),
  ubicacionId: z.string().min(1, 'La ubicación de destino es obligatoria.'),
  observacion: z
    .string()
    .trim()
    .max(500, 'La observación no puede superar los 500 caracteres.'),
  detalles: z
    .array(
      z.object({
        formato: z.custom<FormatoRecibido>(),
        cantidad: z
          .string()
          .trim()
          .refine(esEntero, 'La cantidad debe ser un número entero desde 1.'),
        costoUnitarioNeto: z
          .string()
          .trim()
          .refine(
            esCosto,
            'El costo debe ser un número desde 0, con hasta dos decimales.',
          ),
      }),
    )
    .min(1, 'Agrega los formatos recibidos.'),
});

export type FormularioEntrada = z.input<typeof esquemaEntrada>;
export type SalidaEntrada = z.output<typeof esquemaEntrada>;
type CampoEntrada = Exclude<keyof FormularioEntrada, 'detalles'>;

export const ENTRADA_VACIA: FormularioEntrada = {
  proveedorId: '',
  fechaRecepcion: '',
  tipoDocumento: '',
  numeroDocumento: '',
  ubicacionId: '',
  observacion: '',
  detalles: [],
};

/** Cuerpo del POST. La observación vacía no se envía. */
export const cuerpoEntrada = (datos: SalidaEntrada): CuerpoEntrada => ({
  proveedorId: Number(datos.proveedorId),
  fechaRecepcion: datos.fechaRecepcion,
  tipoDocumento: datos.tipoDocumento as TipoDocumentoProveedor,
  numeroDocumento: datos.numeroDocumento,
  ubicacionId: Number(datos.ubicacionId),
  ...(datos.observacion && { observacion: datos.observacion }),
  detalles: datos.detalles.map(({ formato, cantidad, costoUnitarioNeto }) => ({
    formatoId: formato.formatoId,
    cantidad: Number(cantidad),
    costoUnitarioNeto: aNumero(costoUnitarioNeto),
  })),
});

/** A qué parte del formulario apunta un error del backend. */
export type DestinoError =
  | { tipo: 'campo'; campo: CampoEntrada }
  /** Una línea de formatos, por su posición en lo que se envió (`detalles.1.cantidad`). */
  | { tipo: 'linea'; indice: number }
  /** La lista de formatos entera (cuántos, repetidos), sin una línea. */
  | { tipo: 'formatos' };

/** Los campos de la recepción, con los nombres de `CrearEntradaDto` (SCRUM-150). */
const CAMPOS_ENTRADA: Partial<Record<string, CampoEntrada>> = {
  proveedorId: 'proveedorId',
  fechaRecepcion: 'fechaRecepcion',
  tipoDocumento: 'tipoDocumento',
  numeroDocumento: 'numeroDocumento',
  ubicacionId: 'ubicacionId',
  observacion: 'observacion',
};

const LINEA = /^detalles\.(\d+)(?:\.|$)/;

/**
 * El destino de un campo que el backend indica en `errores` (SCRUM-150), o `null` si no es de una
 * parte del formulario. El backend dice la línea por su índice, en el orden en que se envió.
 */
export const destinoDelError = (campo: string): DestinoError | null => {
  const linea = LINEA.exec(campo);
  if (linea) return { tipo: 'linea', indice: Number(linea[1]) };
  if (campo === 'detalles') return { tipo: 'formatos' };
  const delFormulario = CAMPOS_ENTRADA[campo];
  return delFormulario ? { tipo: 'campo', campo: delFormulario } : null;
};
