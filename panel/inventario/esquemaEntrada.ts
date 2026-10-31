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
export const cuerpoEntrada = (datos: SalidaEntrada): CuerpoEntrada =>
  ({
    proveedorId: Number(datos.proveedorId),
    fechaRecepcion: datos.fechaRecepcion,
    tipoDocumento: datos.tipoDocumento as TipoDocumentoProveedor,
    numeroDocumento: datos.numeroDocumento,
    ubicacionId: Number(datos.ubicacionId),
    ...(datos.observacion && { observacion: datos.observacion }),
    detalles: datos.detalles.map(
      ({ formato, cantidad, costoUnitarioNeto }) => ({
        formatoId: formato.formatoId,
        cantidad: Number(cantidad),
        costoUnitarioNeto: aNumero(costoUnitarioNeto),
      }),
    ),
    // TODO(SCRUM-111): el Swagger tipa la observación como objeto (falta el `type`)
  }) as CuerpoEntrada;

/** A qué parte del formulario apunta un mensaje del backend. */
export type DestinoError =
  | { tipo: 'campo'; campo: CampoEntrada }
  /** La lista de formatos, sin decir cuál (el backend no indica la línea). */
  | { tipo: 'formatos' }
  /** Estas líneas, por el id de su formato. */
  | { tipo: 'filas'; formatoIds: number[] }
  /** Las líneas cuyo formato aparece más de una vez. */
  | { tipo: 'repetidos' };

/**
 * El backend responde los errores como una lista de mensajes, sin decir a qué campo pertenecen
 * (400 de validación, 409 de documento repetido). Se reconocen por cómo empiezan, según
 * CrearEntradaDto y entradas.service.ts.
 */
const INICIOS: [inicio: string, destino: DestinoError][] = [
  ['El proveedor', { tipo: 'campo', campo: 'proveedorId' }],
  ['La fecha de recepción', { tipo: 'campo', campo: 'fechaRecepcion' }],
  ['El tipo de documento', { tipo: 'campo', campo: 'tipoDocumento' }],
  ['El número de documento', { tipo: 'campo', campo: 'numeroDocumento' }],
  ['Ya hay una entrada', { tipo: 'campo', campo: 'numeroDocumento' }],
  ['La ubicación', { tipo: 'campo', campo: 'ubicacionId' }],
  ['La observación', { tipo: 'campo', campo: 'observacion' }],
  ['Cada formato', { tipo: 'repetidos' }],
  ['Indica los formatos', { tipo: 'formatos' }],
  ['Indica el formato', { tipo: 'formatos' }],
  ['Algún formato', { tipo: 'formatos' }],
  ['Una entrada tiene hasta', { tipo: 'formatos' }],
  ['La cantidad recibida', { tipo: 'formatos' }],
  ['El costo unitario neto', { tipo: 'formatos' }],
];

/** «El formato 11 no existe.», «Los formatos 11, 12 no existen.», «El stock del formato 11…». */
const FORMATOS_NOMBRADOS = /^(?:El|Los) (?:stock del )?formatos? ([\d, ]+)/;

/** El destino de un mensaje del backend, o `null` si no es de una parte del formulario. */
export const destinoDelError = (mensaje: string): DestinoError | null => {
  const nombrados = FORMATOS_NOMBRADOS.exec(mensaje);
  if (nombrados) {
    return {
      tipo: 'filas',
      formatoIds: nombrados[1]
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Number.isInteger),
    };
  }
  return INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
};
